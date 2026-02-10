/**
 * Program Context Versioning
 * Stores versioned snapshots of ProgramContext in AsyncStorage.
 * Keeps last 20 versions max.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProgramContext } from '@/types';

const VERSIONS_KEY = 'kx:programContext:versions';
const MAX_VERSIONS = 20;

export interface VersionEntry {
  version: number;
  timestamp: string;
  snapshot: ProgramContext;
}

export async function saveProgramContextVersion(context: ProgramContext): Promise<void> {
  try {
    const existing = await getProgramContextVersions();
    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    const entry: VersionEntry = {
      version: nextVersion,
      timestamp: new Date().toISOString(),
      snapshot: context,
    };

    const updated = [entry, ...existing].slice(0, MAX_VERSIONS);
    await AsyncStorage.setItem(VERSIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save program context version:', error);
  }
}

export async function getProgramContextVersions(): Promise<VersionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(VERSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VersionEntry[];
  } catch (error) {
    console.error('Failed to get program context versions:', error);
    return [];
  }
}

export async function restoreProgramContextVersion(version: number): Promise<ProgramContext | null> {
  try {
    const versions = await getProgramContextVersions();
    const entry = versions.find((v) => v.version === version);
    return entry?.snapshot ?? null;
  } catch (error) {
    console.error('Failed to restore program context version:', error);
    return null;
  }
}
