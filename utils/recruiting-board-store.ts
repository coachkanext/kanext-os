/**
 * Recruiting Board — AsyncStorage persistence layer.
 * 500ms debounced auto-save (same pattern as program-context).
 */

import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RECRUITING_BOARD,
  STATUS_MIGRATION,
  DUE_DILIGENCE_LABELS,
  type BoardEntry,
  type BoardStatus,
  type Priority,
  type NeedsTier,
  type PositionSlot,
  type InterestLevel,
} from '@/data/recruitingBoard';
import { PLAYER_POOL } from '@/data/playerPool';
import { TRADITIONAL_TO_HELIO } from '@/data/position-mapping';

const STORAGE_KEY = 'kx:recruitingBoard';
const DEBOUNCE_MS = 500;

interface BoardState {
  entries: BoardEntry[];
  lastModified: string;
}

/** Migrate old pipeline status values + backfill new CRM fields (idempotent). */
function migrateEntries(entries: BoardEntry[]): { entries: BoardEntry[]; changed: boolean } {
  let changed = false;
  const migrated = entries.map((e) => {
    let entry = e;
    const newStatus = STATUS_MIGRATION[e.status as string];
    if (newStatus) {
      changed = true;
      entry = { ...entry, status: newStatus };
    }
    // Backfill CRM fields for entries from older schema
    if (!entry.temperature) {
      changed = true;
      entry = {
        ...entry,
        temperature: 'Ice',
        riskLevel: entry.riskLevel ?? 'Low',
        riskFlags: entry.riskFlags ?? [],
        dueDiligence: entry.dueDiligence ?? DUE_DILIGENCE_LABELS.map((label) => ({ label, completed: false })),
        log: entry.log ?? [],
      };
    }
    // Backfill workspace fields (tier/slot/interest) for 4-view refactor
    if (!entry.tier) {
      changed = true;
      const tierFromPriority: Record<string, NeedsTier> = { A: 'Primary', B: 'Secondary', C: 'Watch' };
      const player = PLAYER_POOL.find((p) => p.id === entry.playerId);
      const helioSlot = player
        ? (TRADITIONAL_TO_HELIO as Record<string, string>)[player.position] as PositionSlot | undefined
        : undefined;
      const interestFromTemp: Record<string, InterestLevel> = { Ice: 'Low', Warm: 'Med', Hot: 'High', Close: 'High' };
      entry = {
        ...entry,
        tier: tierFromPriority[entry.priority] ?? 'Watch',
        slot: helioSlot ?? 'W',
        interest: interestFromTemp[entry.temperature] ?? 'Low',
      };
    }
    return entry;
  });
  return { entries: migrated, changed };
}

/** Revive Date objects in log entries after JSON parse. */
function reviveDates(entries: BoardEntry[]): BoardEntry[] {
  return entries.map((e) => ({
    ...e,
    log: (e.log ?? []).map((l) => ({
      ...l,
      timestamp: typeof l.timestamp === 'string' ? new Date(l.timestamp) : l.timestamp,
    })),
  }));
}

/** Load board from AsyncStorage, fallback to mock data. Runs migration for old status values. */
export async function loadBoard(): Promise<BoardEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: BoardState = JSON.parse(raw);
      if (parsed.entries && parsed.entries.length > 0) {
        const { entries, changed } = migrateEntries(reviveDates(parsed.entries));
        if (changed) await saveBoard(entries);
        return entries;
      }
    }
  } catch {}
  return [...RECRUITING_BOARD];
}

/** Save board to AsyncStorage. */
async function saveBoard(entries: BoardEntry[]): Promise<void> {
  const state: BoardState = {
    entries,
    lastModified: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Hook: auto-save board entries with 500ms debounce. */
export function useBoardPersistence(entries: BoardEntry[]): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    // Skip the initial render (board just loaded from storage)
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveBoard(entries);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [entries]);
}

/** Move an entry to a new column (optionally at a specific rank). */
export function moveEntry(
  entries: BoardEntry[],
  entryId: string,
  newStatus: BoardStatus,
  newRank?: number,
): BoardEntry[] {
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return entries;

  const rest = entries.filter((e) => e.id !== entryId);
  const moved: BoardEntry = {
    ...entry,
    status: newStatus,
    updated: new Date().toISOString().slice(0, 10),
  };

  // Entries in the target column (excluding the moved one)
  const colEntries = rest.filter((e) => e.status === newStatus).sort((a, b) => a.rank - b.rank);
  const insertAt = newRank !== undefined ? Math.min(newRank, colEntries.length) : colEntries.length;

  colEntries.splice(insertAt, 0, moved);
  // Re-index ranks in the target column
  colEntries.forEach((e, i) => (e.rank = i));

  // Also re-index the source column (if different)
  if (entry.status !== newStatus) {
    const sourceCol = rest.filter((e) => e.status === entry.status).sort((a, b) => a.rank - b.rank);
    sourceCol.forEach((e, i) => (e.rank = i));
  }

  // Rebuild full array: non-affected entries + re-indexed columns
  const affectedStatuses = new Set([newStatus, entry.status]);
  const unaffected = rest.filter((e) => !affectedStatuses.has(e.status));
  const affected = rest.filter((e) => affectedStatuses.has(e.status) && e.id !== entryId);
  return [...unaffected, ...affected, ...colEntries.filter((e) => e.id === entryId), ...[]].length
    ? // Simpler: just rebuild from rest + insert moved
      (() => {
        const result = rest.map((e) => ({ ...e }));
        // Re-rank source column
        if (entry.status !== newStatus) {
          const srcItems = result.filter((e) => e.status === entry.status).sort((a, b) => a.rank - b.rank);
          srcItems.forEach((e, i) => (e.rank = i));
        }
        // Re-rank target column + insert
        const targetItems = result.filter((e) => e.status === newStatus).sort((a, b) => a.rank - b.rank);
        targetItems.splice(insertAt, 0, moved);
        targetItems.forEach((e, i) => (e.rank = i));
        // Merge back
        const targetIds = new Set(targetItems.map((e) => e.id));
        return [
          ...result.filter((e) => !targetIds.has(e.id)),
          ...targetItems,
        ];
      })()
    : entries;
}

/** Reorder an entry within its current column. */
export function reorderEntry(
  entries: BoardEntry[],
  entryId: string,
  newRank: number,
): BoardEntry[] {
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return entries;
  return moveEntry(entries, entryId, entry.status, newRank);
}

/** Add a player to the board. Returns the new full entries array. */
export function addEntry(
  entries: BoardEntry[],
  playerId: string,
  status: BoardStatus = 'Watchlist',
  priority: Priority = 'C',
  slot?: PositionSlot,
  tier?: NeedsTier,
): BoardEntry[] {
  // Don't add duplicates
  if (entries.some((e) => e.playerId === playerId)) return entries;

  const player = PLAYER_POOL.find((p) => p.id === playerId);
  if (!player) return entries;

  const helioSlot = slot ?? ((TRADITIONAL_TO_HELIO as Record<string, string>)[player.position] as PositionSlot | undefined) ?? 'W';
  const colEntries = entries.filter((e) => e.status === status);
  const newEntry: BoardEntry = {
    id: `be-${Date.now()}`,
    playerId,
    status,
    priority,
    rank: colEntries.length,
    position: player.position,
    classYear: player.classYear,
    tags: [],
    shortNotes: '',
    longNotes: '',
    nextStep: '',
    dueDate: '',
    recruiter: '',
    updated: new Date().toISOString().slice(0, 10),
    temperature: 'Ice',
    riskLevel: 'Low',
    riskFlags: [],
    dueDiligence: DUE_DILIGENCE_LABELS.map((label) => ({ label, completed: false })),
    log: [],
    tier: tier ?? 'Watch',
    slot: helioSlot,
    interest: 'Low',
  };

  return [...entries, newEntry];
}

/** Remove an entry from the board. Re-indexes the column. */
export function removeEntry(entries: BoardEntry[], entryId: string): BoardEntry[] {
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return entries;

  const result = entries.filter((e) => e.id !== entryId);
  // Re-index the column
  const colItems = result.filter((e) => e.status === entry.status).sort((a, b) => a.rank - b.rank);
  colItems.forEach((e, i) => (e.rank = i));
  return result;
}

/** Update fields on a board entry. */
export function updateEntry(
  entries: BoardEntry[],
  entryId: string,
  updates: Partial<BoardEntry>,
): BoardEntry[] {
  return entries.map((e) =>
    e.id === entryId
      ? { ...e, ...updates, updated: new Date().toISOString().slice(0, 10) }
      : e,
  );
}
