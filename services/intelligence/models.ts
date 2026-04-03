/**
 * Nexus model routing constants.
 *
 * EXPO_PUBLIC_ prefix makes these overridable at build time (Expo requirement).
 * Set EXPO_PUBLIC_NEXUS_MODEL_GENERAL / BASKETBALL / DATA_ROOM in .env to override defaults.
 */

export const MODELS = {
  /** Tier 1: General queries — fast, cheap, ~90% of traffic */
  GENERAL:    process.env.EXPO_PUBLIC_NEXUS_MODEL_GENERAL    ?? 'claude-haiku-4-5-20251001',
  /** Tier 2: Basketball intelligence — multi-step reasoning, ~10% of traffic */
  BASKETBALL: process.env.EXPO_PUBLIC_NEXUS_MODEL_BASKETBALL ?? 'claude-sonnet-4-6',
  /** Tier 3: Data room / investor queries — Sonnet with cached KB (R0/R1 only) */
  DATA_ROOM:  process.env.EXPO_PUBLIC_NEXUS_MODEL_DATA_ROOM  ?? 'claude-sonnet-4-6',
} as const;

export type ModelTier = keyof typeof MODELS;
