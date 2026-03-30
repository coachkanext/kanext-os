import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const SEASON = '2025-26';

const pool = new Pool({ host: 'localhost', port: 5432, database: 'kanext_player_pool' });
const q = (text, params) => pool.query(text, params);

app.use(express.static(join(__dirname, 'public')));

// ── Helpers ───────────────────────────────────────────────────────────────────

function err(res, e) {
  console.error(e.message);
  res.status(500).json({ error: e.message });
}

// ── College: Levels ───────────────────────────────────────────────────────────

app.get('/api/college/levels', async (req, res) => {
  try {
    const { rows } = await q(`
      SELECT cl.level_key, cl.display_name, cl.level_tier,
             COUNT(DISTINCT t.id)::int AS team_count
      FROM competitive_levels cl
      LEFT JOIN teams t ON t.competitive_level_id = cl.id
      GROUP BY cl.level_key, cl.display_name, cl.level_tier
      ORDER BY cl.level_tier, cl.level_key
    `);
    res.json(rows);
  } catch (e) { err(res, e); }
});

// ── College: Teams ────────────────────────────────────────────────────────────

app.get('/api/college/teams', async (req, res) => {
  try {
    const { level, search } = req.query;
    const params = [SEASON];
    const wheres = [];

    if (level && level !== 'all') {
      if (level === 'ncaa_d1') {
        wheres.push(`cl.level_key LIKE 'ncaa_d1%'`);
      } else {
        wheres.push(`cl.level_key = $${params.push(level)}`);
      }
    }
    if (search) wheres.push(`t.name ILIKE $${params.push('%' + search + '%')}`);
    const where = wheres.length ? `AND ${wheres.join(' AND ')}` : '';

    const { rows } = await q(`
      SELECT t.id, t.name, t.city, t.state,
             cl.display_name AS level, cl.level_key, cl.level_tier,
             c.abbreviation AS conf_abbr,
             ts.head_coach, ts.wins, ts.losses, ts.conf_wins, ts.conf_losses,
             COUNT(pts.id)::int AS player_count
      FROM teams t
      JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN conferences c ON c.id = t.conference_id
      LEFT JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = $1
      LEFT JOIN player_team_seasons pts ON pts.team_season_id = ts.id
      WHERE 1=1 ${where}
      GROUP BY t.id, t.name, t.city, t.state, cl.display_name, cl.level_key, cl.level_tier,
               c.abbreviation, ts.head_coach, ts.wins, ts.losses, ts.conf_wins, ts.conf_losses
      ORDER BY cl.level_tier DESC, t.name
      LIMIT 2000
    `, params);
    res.json(rows);
  } catch (e) { err(res, e); }
});

app.get('/api/college/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [teamRes, rosterRes] = await Promise.all([
      q(`
        SELECT t.id, t.name, t.city, t.state,
               cl.display_name AS level, cl.level_key,
               c.abbreviation AS conf_abbr, c.name AS conf_name,
               ts.head_coach, ts.wins, ts.losses, ts.conf_wins, ts.conf_losses,
               ts.osie_system, ts.dsie_system,
               ts.team_off_kr, ts.team_def_kr, ts.team_overall_kr
        FROM teams t
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        LEFT JOIN conferences c ON c.id = t.conference_id
        LEFT JOIN team_seasons ts ON ts.team_id = t.id AND ts.season = $1
        WHERE t.id = $2
      `, [SEASON, id]),
      q(`
        SELECT p.id, p.full_name, p.height_inches, p.weight_lbs, p.declared_positions,
               pts.jersey_number, pts.class_year,
               pss.games_played, pss.minutes_per_game, pss.pts_per_game,
               pss.reb_per_game, pss.ast_per_game, pss.stl_per_game, pss.blk_per_game,
               pss.to_per_game, pss.fg_pct, pss.three_pct, pss.ft_pct, pss.usage_rate
        FROM player_team_seasons pts
        JOIN players p ON p.id = pts.player_id
        JOIN team_seasons ts ON ts.id = pts.team_season_id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE ts.team_id = $1 AND ts.season = $2
        ORDER BY pss.pts_per_game DESC NULLS LAST, p.full_name
      `, [id, SEASON]),
    ]);
    if (!teamRes.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ team: teamRes.rows[0], roster: rosterRes.rows });
  } catch (e) { err(res, e); }
});

// ── College: Players ──────────────────────────────────────────────────────────

app.get('/api/college/players', async (req, res) => {
  try {
    const { search, level, pos } = req.query;
    if (!search && !level) return res.json([]);

    const params = [SEASON];
    const wheres = [];
    if (search) wheres.push(`p.full_name ILIKE $${params.push('%' + search + '%')}`);
    if (level && level !== 'all') {
      if (level === 'ncaa_d1') {
        wheres.push(`cl.level_key LIKE 'ncaa_d1%'`);
      } else {
        wheres.push(`cl.level_key = $${params.push(level)}`);
      }
    }
    if (pos) wheres.push(`$${params.push(pos)} = ANY(p.declared_positions)`);
    const where = wheres.length ? `AND ${wheres.join(' AND ')}` : '';

    const { rows } = await q(`
      SELECT p.id, p.full_name, p.height_inches, p.declared_positions,
             t.id AS team_id, t.name AS team_name,
             cl.display_name AS level, cl.level_key,
             pts.class_year, pts.jersey_number,
             pss.games_played, pss.minutes_per_game, pss.pts_per_game,
             pss.reb_per_game, pss.ast_per_game, pss.stl_per_game, pss.blk_per_game,
             pss.fg_pct, pss.three_pct, pss.ft_pct, pss.usage_rate
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id AND ts.season = $1
      JOIN teams t ON t.id = ts.team_id
      JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE 1=1 ${where}
      ORDER BY pss.pts_per_game DESC NULLS LAST, p.full_name
      LIMIT 200
    `, params);
    res.json(rows);
  } catch (e) { err(res, e); }
});

app.get('/api/college/player/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [playerRes, historyRes] = await Promise.all([
      q(`SELECT * FROM players WHERE id = $1`, [id]),
      q(`
        SELECT ts.season, t.id AS team_id, t.name AS team_name, cl.display_name AS level,
               pts.class_year, pts.jersey_number,
               pss.games_played, pss.minutes_per_game, pss.pts_per_game,
               pss.reb_per_game, pss.ast_per_game, pss.stl_per_game, pss.blk_per_game,
               pss.to_per_game, pss.fg_pct, pss.three_pct, pss.ft_pct,
               pss.fga_per_game, pss.three_pa_per_game, pss.fta_per_game,
               pss.usage_rate, pss.oreb_per_game, pss.dreb_per_game
        FROM player_team_seasons pts
        JOIN team_seasons ts ON ts.id = pts.team_season_id
        JOIN teams t ON t.id = ts.team_id
        JOIN competitive_levels cl ON cl.id = t.competitive_level_id
        LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
        WHERE pts.player_id = $1
        ORDER BY ts.season DESC
      `, [id]),
    ]);
    if (!playerRes.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ player: playerRes.rows[0], history: historyRes.rows });
  } catch (e) { err(res, e); }
});

// ── College: Coaches ──────────────────────────────────────────────────────────

app.get('/api/college/coaches', async (req, res) => {
  try {
    const { level, search } = req.query;
    const params = [SEASON];
    const wheres = [`ts.head_coach IS NOT NULL`];
    if (level && level !== 'all') {
      if (level === 'ncaa_d1') {
        wheres.push(`cl.level_key LIKE 'ncaa_d1%'`);
      } else {
        wheres.push(`cl.level_key = $${params.push(level)}`);
      }
    }
    if (search) wheres.push(`ts.head_coach ILIKE $${params.push('%' + search + '%')}`);

    const { rows } = await q(`
      SELECT ts.head_coach, ts.coach_continuity,
             t.id AS team_id, t.name AS team_name, t.city, t.state,
             cl.display_name AS level, cl.level_key,
             c.abbreviation AS conf_abbr,
             ts.wins, ts.losses, ts.conf_wins, ts.conf_losses
      FROM team_seasons ts
      JOIN teams t ON t.id = ts.team_id
      JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN conferences c ON c.id = t.conference_id
      WHERE ts.season = $1 AND ${wheres.join(' AND ')}
      ORDER BY ts.head_coach
      LIMIT 2000
    `, params);
    res.json(rows);
  } catch (e) { err(res, e); }
});

// ── Pro: Teams ────────────────────────────────────────────────────────────────

app.get('/api/pro/teams', async (req, res) => {
  try {
    const { rows } = await q(`
      SELECT pt.id, pt.name, pt.abbreviation, pt.conference, pt.division,
             tss.wins, tss.losses, tss.conf_standing,
             tss.ortg, tss.drtg, tss.pace, tss.net_rating,
             COUNT(pp.id)::int AS player_count
      FROM pro_teams pt
      LEFT JOIN pro_players pp ON pp.pro_team_id = pt.id
      LEFT JOIN pro_team_season_stats tss ON tss.pro_team_id = pt.id AND tss.season = $1
      GROUP BY pt.id, pt.name, pt.abbreviation, pt.conference, pt.division,
               tss.wins, tss.losses, tss.conf_standing, tss.ortg, tss.drtg, tss.pace, tss.net_rating
      ORDER BY pt.conference, pt.division, pt.name
    `, [SEASON]);
    res.json(rows);
  } catch (e) { err(res, e); }
});

app.get('/api/pro/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [teamRes, rosterRes] = await Promise.all([
      q(`
        SELECT pt.*, tss.wins, tss.losses, tss.conf_standing,
               tss.ortg, tss.drtg, tss.pace, tss.net_rating
        FROM pro_teams pt
        LEFT JOIN pro_team_season_stats tss ON tss.pro_team_id = pt.id AND tss.season = $1
        WHERE pt.id = $2
      `, [SEASON, id]),
      q(`
        SELECT pp.id, pp.full_name, pp.position, pp.age, pp.jersey_number,
               pp.height_inches, pp.weight_lbs,
               s.gp, s.mpg, s.ppg, s.rpg, s.apg, s.spg, s.bpg, s.to_pg,
               s.fg_pct, s.three_pct, s.ft_pct,
               a.per, a.ts_pct, a.efg_pct, a.usg_pct, a.bpm, a.obpm, a.dbpm, a.vorp, a.ws, a.ws_48,
               a.ortg, a.drtg
        FROM pro_players pp
        LEFT JOIN pro_player_season_stats s ON s.player_id = pp.id AND s.season = $1
        LEFT JOIN pro_player_advanced_stats a ON a.player_id = pp.id AND a.season = $1
        WHERE pp.pro_team_id = $2
        ORDER BY s.ppg DESC NULLS LAST, pp.full_name
      `, [SEASON, id]),
    ]);
    if (!teamRes.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ team: teamRes.rows[0], roster: rosterRes.rows });
  } catch (e) { err(res, e); }
});

// ── Pro: Players ──────────────────────────────────────────────────────────────

app.get('/api/pro/players', async (req, res) => {
  try {
    const { search, team } = req.query;
    const params = [SEASON];
    const wheres = [];
    if (search) wheres.push(`pp.full_name ILIKE $${params.push('%' + search + '%')}`);
    if (team) wheres.push(`pt.abbreviation ILIKE $${params.push(team)}`);
    const where = wheres.length ? `AND ${wheres.join(' AND ')}` : '';

    const { rows } = await q(`
      SELECT pp.id, pp.full_name, pp.position, pp.age, pp.jersey_number,
             pp.height_inches, pp.weight_lbs,
             pt.name AS team_name, pt.abbreviation,
             s.gp, s.mpg, s.ppg, s.rpg, s.apg, s.spg, s.bpg, s.to_pg,
             s.fg_pct, s.three_pct, s.ft_pct,
             a.per, a.ts_pct, a.bpm, a.vorp, a.ws
      FROM pro_players pp
      LEFT JOIN pro_teams pt ON pt.id = pp.pro_team_id
      LEFT JOIN pro_player_season_stats s ON s.player_id = pp.id AND s.season = $1
      LEFT JOIN pro_player_advanced_stats a ON a.player_id = pp.id AND a.season = $1
      WHERE 1=1 ${where}
      ORDER BY s.ppg DESC NULLS LAST, pp.full_name
      LIMIT 539
    `, params);
    res.json(rows);
  } catch (e) { err(res, e); }
});

app.get('/api/pro/player/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [playerRes, statsRes, advRes] = await Promise.all([
      q(`
        SELECT pp.*, pt.name AS team_name, pt.abbreviation, pt.conference, pt.division
        FROM pro_players pp
        LEFT JOIN pro_teams pt ON pt.id = pp.pro_team_id
        WHERE pp.id = $1
      `, [id]),
      q(`SELECT * FROM pro_player_season_stats WHERE player_id = $1 ORDER BY season DESC`, [id]),
      q(`SELECT * FROM pro_player_advanced_stats WHERE player_id = $1 ORDER BY season DESC`, [id]),
    ]);
    if (!playerRes.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ player: playerRes.rows[0], stats: statsRes.rows, advanced: advRes.rows });
  } catch (e) { err(res, e); }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`KaNeXT Pool Dashboard → http://localhost:${PORT}`));
