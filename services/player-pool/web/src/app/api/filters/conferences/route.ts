import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const levelKey = req.nextUrl.searchParams.get("levelKey");

  let query: string;
  let params: string[];

  if (levelKey) {
    query = `
      SELECT c.id, c.name, cl.level_key AS "levelKey",
             COUNT(t.id)::int AS "teamCount"
      FROM conferences c
      JOIN teams t ON t.conference_id = c.id
      JOIN competitive_levels cl ON t.competitive_level_id = cl.id
      WHERE cl.level_key = $1
      GROUP BY c.id, c.name, cl.level_key
      ORDER BY c.name`;
    params = [levelKey];
  } else {
    query = `
      SELECT c.id, c.name, cl.level_key AS "levelKey",
             COUNT(t.id)::int AS "teamCount"
      FROM conferences c
      JOIN teams t ON t.conference_id = c.id
      JOIN competitive_levels cl ON t.competitive_level_id = cl.id
      GROUP BY c.id, c.name, cl.level_key, cl.level_tier
      ORDER BY cl.level_tier DESC, c.name`;
    params = [];
  }

  const { rows } = await pool.query(query, params);
  return NextResponse.json({ conferences: rows });
}
