/**
 * Nexus model routing constants.
 *
 * EXPO_PUBLIC_ prefix makes these overridable at build time (Expo requirement).
 * Set EXPO_PUBLIC_NEXUS_MODEL_GENERAL / BASKETBALL in .env to override defaults.
 */

export const MODELS = {
  /** Tier 1: General queries — fast, cheap, ~90% of traffic */
  GENERAL:    process.env.EXPO_PUBLIC_NEXUS_MODEL_GENERAL    ?? 'claude-haiku-4-5-20251001',
  /** Tier 2: Basketball intelligence — multi-step reasoning, ~10% of traffic */
  BASKETBALL: process.env.EXPO_PUBLIC_NEXUS_MODEL_BASKETBALL ?? 'claude-sonnet-4-6',
} as const;

export type ModelTier = keyof typeof MODELS;
