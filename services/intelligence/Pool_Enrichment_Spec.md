# NATIONAL PLAYER POOL -- ENRICHMENT PROTOCOL

Inserted into File 03 (Team Intelligence) after Section 9 (Player Pool Scope), before Section 10 (Update Cadence Summary).

---

## 9.1 Pool Enrichment Protocol

The National Player Pool starts with box-score data from public roster feeds. Every time Nexus looks up a specific player, it enriches that player's record with data gathered from web search and social media. Over time, the pool becomes more complete and accurate through organic usage.

### How Enrichment Works

First lookup: Nexus runs the full Data Gathering Protocol (SKILL.md v4). Pool stats + official web search + social web search. All new data discovered is written back to the player record.

Subsequent lookups: Nexus checks last_enriched timestamp. If enriched within 7 days, skip web searches and use existing enriched data. If older than 7 days, re-enrich.

### Enrichment Fields

These fields are populated by Nexus during the Data Gathering Protocol and stored alongside the existing box-score data:

| Field | Type | Source | Example |
|-------|------|--------|---------|
| verified_height | string | Official roster page | "6'4" (pool listed 6'7")" |
| verified_weight | string | Official roster page | "180 lbs" |
| awards | text array | Athletics site, conference release | ["MAC Freedom POY", "First Team All-Conference"] |
| recruiting_status | enum | Web + social | COMMITTED / IN_PORTAL / UNSIGNED / UNKNOWN |
| committed_to | string | Web + social | "Sacramento State" |
| hometown | string | Official roster page | "Allentown, PA" |
| high_school | string | Official roster page | "Parkland HS" |
| social_links | text array | Social search | ["@jaydenthomas6 on X", "hudl.com/profile/..."] |
| notable_performances | text array | Game recaps | ["36 pts (11-18, 13-14 FT) vs Moravian", "Triple-double: 23/10/12"] |
| scouting_notes | text | Social search, coach quotes | "Coach Coval: effort's not the problem, just execution. Beat writers note improved 3PT shot in January." |
| last_enriched | timestamp | System | "2026-03-29T15:00:00Z" |

### Enrichment Rules

1. Never overwrite computed stats (PPG, RPG, APG, FG%, BPR, clusters, etc). Those come from the compute engine pipeline and are authoritative.
2. Only enrich metadata fields listed above.
3. If web data contradicts pool data on height or weight, store the verified value AND flag the discrepancy. Do not silently overwrite. The compute engine may need to re-run BPR if physical data changes.
4. Awards are additive. Never delete a previously recorded award. Add new ones as discovered.
5. Recruiting status updates replace the previous value (a player can only have one current status).
6. Social intel goes in scouting_notes as free text with source attribution and date.
7. Enrichment is append-only for arrays (notable_performances, awards, social_links). New entries are added, existing entries are never removed.
8. Timestamp every enrichment via last_enriched.

### Enrichment Cadence

| Trigger | Action |
|---------|--------|
| First Nexus lookup of a player | Full enrichment (web + social) |
| Subsequent lookup within 7 days | Use cached enrichment data |
| Subsequent lookup after 7 days | Re-enrich (web + social) |
| Transfer portal event | Force re-enrich regardless of timestamp |
| Postseason (conference tournament, NCAA tournament) | Force re-enrich for all players on participating teams |

### Data Integrity

- Enrichment never modifies upstream computed values (KR, BPR, Team KR, archetypes, system identity)
- Enrichment corrections that affect physical data (height, weight) are flagged for compute engine re-run
- All enrichment writes are logged with source, timestamp, and the Nexus query that triggered them
- If conflicting data is found across sources, store the most authoritative (official roster page > athletics site > social media)

### The Flywheel

V1 pool data (box scores from public feeds) is what every player starts with. Enrichment adds verified physical data, awards, recruiting status, scouting notes, and social intel. Each Nexus lookup makes the pool smarter. High-traffic players (stars, portal entrants, recruits) get enriched fastest because they're looked up most. Over time the pool evolves from a stat database into a complete scouting intelligence layer -- without any manual data entry.
