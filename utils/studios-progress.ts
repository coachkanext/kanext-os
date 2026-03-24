/**
 * KayStudios — Progress & Saves persistence (AsyncStorage).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProgressEntry {
  progress: number;       // 0–1
  completed: boolean;
  score?: number;         // 0–100 percentage, for scored experiences
  lastPlayed: string;     // ISO date string
  currentIndex?: number;  // for courses/flashcards — resume position
}

const PROGRESS_KEY = 'kx:studios:progress';
const SAVES_KEY    = 'kx:studios:saves';

// ── Progress ───────────────────────────────────────────────────────────────

export async function loadAllProgress(): Promise<Record<string, ProgressEntry>> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function getProgress(contentId: string): Promise<ProgressEntry | null> {
  const all = await loadAllProgress();
  return all[contentId] ?? null;
}

export async function saveProgress(contentId: string, entry: Omit<ProgressEntry, 'lastPlayed'>): Promise<void> {
  try {
    const all = await loadAllProgress();
    all[contentId] = { ...entry, lastPlayed: new Date().toISOString() };
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

export async function clearProgress(contentId: string): Promise<void> {
  try {
    const all = await loadAllProgress();
    delete all[contentId];
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

// ── Saves ──────────────────────────────────────────────────────────────────

export async function getSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveItem(contentId: string): Promise<void> {
  try {
    const saves = await getSavedIds();
    if (!saves.includes(contentId)) {
      saves.push(contentId);
      await AsyncStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    }
  } catch {}
}

export async function unsaveItem(contentId: string): Promise<void> {
  try {
    const saves = await getSavedIds();
    await AsyncStorage.setItem(SAVES_KEY, JSON.stringify(saves.filter(id => id !== contentId)));
  } catch {}
}

export async function isItemSaved(contentId: string): Promise<boolean> {
  const saves = await getSavedIds();
  return saves.includes(contentId);
}
