import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get this player's position and team_id
  const { rows: meta } = await pool.query(
    `SELECT kr.position, t.id AS team_id
     FROM players p
     JOIN player_team_seasons pts ON pts.player_id = p.id
     JOIN team_seasons ts ON ts.id = pts.team_season_id
     JOIN teams t ON t.id = ts.team_id
     LEFT JOIN player_kr_v2 kr ON kr.player_team_season_id = pts.id
     WHERE p.id = $1
     LIMIT 1`,
    [id]
  );

  if (meta.length === 0) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const { position, team_id } = meta[0];

  const similarQuery = `
    SELECT
      p.id,
      p.full_name AS name,
      kr.position,
      t.name AS team,
      kr.npd_final_kr AS kr
    FROM players p
    JOIN player_team_seasons pts ON pts.player_id = p.id
    JOIN team_seasons ts ON ts.id = pts.team_season_id
    JOIN teams t ON t.id = ts.team_id
    JOIN player_kr_v2 kr ON kr.player_team_season_id = pts.id
    WHERE p.id != $1
      AND kr.npd_final_kr IS NOT NULL
  `;

  const [byPositionRes, byTeamRes] = await Promise.all([
    position
      ? pool.query(
          `${similarQuery} AND kr.position = $2
           ORDER BY kr.npd_final_kr DESC LIMIT 3`,
          [id, position]
        )
      : Promise.resolve({ rows: [] }),
    pool.query(
      `${similarQuery} AND t.id = $2
       ORDER BY kr.npd_final_kr DESC LIMIT 3`,
      [id, team_id]
    ),
  ]);

  const fmt = (row: { id: string; name: string; position: string; team: string; kr: number }) => ({
    id: row.id,
    name: row.name,
    position: row.position,
    team: row.team,
    kr: Number(row.kr),
  });

  return NextResponse.json({
    byPosition: byPositionRes.rows.map(fmt),
    byTeam: byTeamRes.rows.map(fmt),
  });
}
