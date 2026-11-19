/**
 * Cloudflare Worker API Layer for Medical Academy Platform
 * Acts as a secure, authenticated bridge to Cloudflare D1
 * Database: medical-academy-db
 * Binding: DB
 */

export interface D1PreparedStatement {
  bind(...params: any[]): D1PreparedStatement;
  all(): Promise<{ results: any[] }>;
  run(): Promise<{ meta: any }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: any[]): Promise<any[]>;
}

export interface Env {
  DB: D1Database;
  DATABASE_API_SECRET?: string;
  D1_WORKER_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 1. Authentication Check via Bearer token
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = env.DATABASE_API_SECRET || env.D1_WORKER_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized access - Invalid API Secret" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. Health & DB Connection Check (GET /api/db-check)
    if (request.method === "GET" && (url.pathname === "/api/db-check" || url.pathname === "/db-check")) {
      try {
        const stmt = env.DB.prepare("SELECT 1 as connected, datetime('now') as server_time");
        const { results } = await stmt.all();

        return new Response(
          JSON.stringify({
            success: true,
            status: "connected",
            database: "medical-academy-db",
            binding: "DB",
            serverTime: results?.[0]?.server_time || new Date().toISOString(),
            message: "Cloudflare D1 connection verified successfully.",
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            success: false,
            status: "error",
            error: "Failed to connect to Cloudflare D1",
            details: err?.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST for queries or GET for /api/db-check" }),
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    try {
      const body = (await request.json()) as {
        query?: string;
        params?: any[];
        batch?: Array<{ query: string; params: any[] }>;
      };

      // 3. Batch Queries (Transactions)
      if (url.pathname === "/batch" && Array.isArray(body.batch)) {
        const statements = body.batch.map((item) => {
          return env.DB.prepare(item.query).bind(...(item.params || []));
        });
        const results = await env.DB.batch(statements);
        return new Response(JSON.stringify({ success: true, results }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // 4. Single Query execution
      if (body.query) {
        const stmt = env.DB.prepare(body.query).bind(...(body.params || []));
        const trimmed = body.query.trim().toUpperCase();

        if (trimmed.startsWith("SELECT") || trimmed.startsWith("PRAGMA")) {
          const { results } = await stmt.all();
          return new Response(JSON.stringify({ success: true, results }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

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
