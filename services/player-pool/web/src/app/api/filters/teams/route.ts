import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const levelKey = req.nextUrl.searchParams.get("levelKey");
  const conferenceIds = req.nextUrl.searchParams.get("conferenceIds");

  const conditions: string[] = [];
  const params: string[] = [];
  let idx = 1;

  if (levelKey) {
    conditions.push(`cl.level_key = $${idx++}`);
    params.push(levelKey);
  }

  if (conferenceIds) {
    const ids = conferenceIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      conditions.push(`t.conference_id = ANY($${idx++}::uuid[])`);
      params.push(`{${ids.join(",")}}`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT t.id, t.name, t.conference_id AS "conferenceId",
            c.name AS "conferenceName", cl.level_key AS "levelKey"
     FROM teams t
     LEFT JOIN conferences c ON t.conference_id = c.id
     JOIN competitive_levels cl ON t.competitive_level_id = cl.id
     ${where}
     ORDER BY t.name`,
    params
  );

  return NextResponse.json({ teams: rows });
}
