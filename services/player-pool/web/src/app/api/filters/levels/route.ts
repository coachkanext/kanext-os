import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, level_key AS "levelKey", display_name AS "displayName"
     FROM competitive_levels
     WHERE level_key != 'uscaa'
     ORDER BY level_tier DESC`
  );
  return NextResponse.json({ levels: rows });
}
