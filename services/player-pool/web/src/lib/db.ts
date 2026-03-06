import { Pool } from "pg";

declare const globalThis: { _pool?: Pool };

function getPool(): Pool {
  if (!globalThis._pool) {
    globalThis._pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "kanext_player_pool",
    });
  }
  return globalThis._pool;
}

export const pool = getPool();
