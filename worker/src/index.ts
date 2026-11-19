/**
 * Cloudflare Worker API Layer for Medical Academy Platform
 * Acts as a secure, authenticated bridge to Cloudflare D1
 */

export interface D1Database {
  prepare(query: string): {
    bind(...params: any[]): {
      all(): Promise<{ results: any[] }>;
      run(): Promise<{ meta: any }>;
    };
  };
  batch(statements: any[]): Promise<any[]>;
}

export interface Env {
  DB: D1Database;
  D1_WORKER_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 2. Authentication Check via Bearer token
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = env.D1_WORKER_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const url = new URL(request.url);

    try {
      const body = await request.json() as {
        query?: string;
        params?: any[];
        batch?: Array<{ query: string; params: any[] }>;
      };

      // 3. Handle Batch Queries (Transactions)
      if (url.pathname === "/batch" && Array.isArray(body.batch)) {
        const statements = body.batch.map((item) => {
          return env.DB.prepare(item.query).bind(...(item.params || []));
        });
        const results = await env.DB.batch(statements);
        return new Response(JSON.stringify({ success: true, results }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // 4. Handle Single Query
      if (body.query) {
        const stmt = env.DB.prepare(body.query).bind(...(body.params || []));
        
        // If SELECT query
        if (body.query.trim().toUpperCase().startsWith("SELECT") || body.query.trim().toUpperCase().startsWith("PRAGMA")) {
          const { results } = await stmt.all();
          return new Response(JSON.stringify({ success: true, results }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // For INSERT / UPDATE / DELETE
        const result = await stmt.run();
        return new Response(JSON.stringify({ success: true, meta: result.meta }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid query payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: "Database execution failed", details: err?.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  },
};
