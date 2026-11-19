import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";

if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL or POSTGRES_URL is not set in environment variables!");
}

export const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

// Helper to convert SQLite '?' placeholders to PostgreSQL '$1, $2, ...'
export function convertPlaceholders(query: string): string {
  let paramIndex = 1;
  return query.replace(/\?/g, () => `$${paramIndex++}`);
}

export interface DbClient {
  all<T = any>(queryText: string, params?: any[]): Promise<T[]>;
  get<T = any>(queryText: string, params?: any[]): Promise<T | null>;
  run(queryText: string, params?: any[]): Promise<{ rowCount: number }>;
  exec(queryText: string): Promise<void>;
  transaction<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T>;
  prepare(queryText: string): any;
}

export const dbClient: DbClient = {
  async all<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    const pgSql = convertPlaceholders(queryText);
    const result = await sql.query(pgSql, params);
    return result as T[];
  },

  async get<T = any>(queryText: string, params: any[] = []): Promise<T | null> {
    const rows = await this.all<T>(queryText, params);
    return rows.length > 0 ? rows[0] : null;
  },

  async run(queryText: string, params: any[] = []): Promise<{ rowCount: number }> {
    const pgSql = convertPlaceholders(queryText);
    const result = await sql.query(pgSql, params);
    return { rowCount: Array.isArray(result) ? result.length : 1 };
  },

  async exec(queryText: string): Promise<void> {
    await sql(queryText as any);
  },

  transaction<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
    return ((...args: any[]) => {
      return fn(...args);
    }) as any;
  },

  prepare(queryText: string) {
    const self = this;
    return {
      async all(...params: any[]) {
        return self.all(queryText, params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
      },
      async get(...params: any[]) {
        return self.get(queryText, params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
      },
      async run(...params: any[]) {
        return self.run(queryText, params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
      },
    };
  },
};

export function getDb() {
  return db;
}

export function getRawSqlite() {
  return dbClient;
}

export { schema };
