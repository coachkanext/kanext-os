# KaNeXT NCAA API Service

Self-hosted instance of [henrygd/ncaa-api](https://github.com/henrygd/ncaa-api) — wraps ncaa.com into clean JSON.

## Why self-host?
- No rate limits (public API: 5 req/sec)
- Set `NCAA_HEADER_KEY` to secure the endpoint
- Faster bulk data loading for player pool pipeline

## Local dev
```bash
docker run --rm -p 3000:3000 henrygd/ncaa-api
# Test: curl http://localhost:3000/standings/basketball-men/d1
```

## Deploy to Railway
```bash
# 1. Login
railway login

# 2. From this directory, init a new service
cd services/ncaa-api
railway init

# 3. Deploy
railway up

# 4. In Railway UI:
#    Service Settings → Source → Docker Image → henrygd/ncaa-api
#    Variables → NCAA_HEADER_KEY=<your-secret>
#    Networking → Public URL on port 3000
```

## Environment variables
| Var | Description |
|-----|-------------|
| `NCAA_HEADER_KEY` | Secret key — required as `x-ncaa-key` header in all requests |
| `PORT` | 3000 (default) |

## Supported endpoints
See https://ncaa-api.henrygd.me/openapi

**Key endpoints for player pool:**
- `GET /standings/{sport}/{division}` — all teams + W-L by conference
- `GET /stats/{sport}/{division}/current/individual/{stat_id}` — top 50 per stat (leaderboard)
- `GET /stats/{sport}/{division}/current/team/{stat_id}` — team stats
- `GET /scoreboard/{sport}/{division}/{year}/{week}` — game IDs
- `GET /game/{id}/boxscore` — individual player stats per game

**Valid sport keys:**
`basketball-men`, `basketball-women`, `football`, `baseball`, `softball`, `soccer-men`, `soccer-women`, `volleyball-women`, `hockey`, `lacrosse-men`, `lacrosse-women`

**Valid divisions:**
`d1`, `d2`, `d3` (most sports) | `fbs`, `fcs` (football only)

## NCAA data loader
Once deployed, update `NCAA_API_BASE` in `services/player-pool/scraper/ncaa_loader.py`:
```python
NCAA_API_BASE = "https://your-service.railway.app"
NCAA_API_KEY  = "your-secret-key"   # matches NCAA_HEADER_KEY
```
