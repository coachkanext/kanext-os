/**
 * KaNeXT Sports Men's Basketball
 * Normalized Database — Full Stats Stack
 *
 * Scope: NAIA → The KaNeXT Conference → KaNeXT Sports → Men's Basketball
 * Seasons: 2022-23 through 2025-26
 * Per: Claude Global Database Ingest Contract v1
 *
 * Sources:
 *   - NAIA Stats (naiastats.prestosports.com) — team stats, individual stats, game events
 *   - KaNeXT Athletics (fmuathletics.com) — roster bios, coaching staff, schedule
 *
 * Global Rules Applied:
 *   ❌ No inference
 *   ❌ No normalization across players unless exact match
 *   ❌ No system assumptions
 *   ❌ No evaluations
 *   ✅ NULL stored when data is missing
 *   ✅ Original stat naming preserved
 *   ✅ Referential integrity maintained (program → roster → stats)
 */

export { players } from './players';
export { rosterEntries } from './roster';
export { teamStats } from './team-stats';
export { individualSeasonStats } from './individual-stats';
export { gameLogs, teamGameLogs } from './game-logs';
export { gameHighs } from './game-highs';
export { categoryLeaders } from './category-leaders';
