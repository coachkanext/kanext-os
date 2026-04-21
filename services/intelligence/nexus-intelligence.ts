/**
 * Nexus Intelligence — System Prompt Builder
 *
 * Unified RAG across four knowledge bases:
 *   intelligence  — KaNeXT Intelligence KB v2
 *   os            — KaNeXT Product / OS knowledge base
 *   institutional — 27 institutional intelligence KBs
 *   dataroom      — Investor data room
 *
 * Per query: top ~10 relevant sections retrieved across all KBs.
 * Total context stays well under 200K tokens.
 */

import { DIPSON_INSTRUCTIONS } from './corpus-dipson-instructions';
import { retrieveContext }      from './corpus-rag';

export interface SystemPromptParts {
  staticContent:  string;
  dynamicContent: string;
}

export function buildSystemPrompt(query = ''): SystemPromptParts {
  const context = retrieveContext(query);
  return {
    staticContent:  `${DIPSON_INSTRUCTIONS}\n\n---\n\n${context}`,
    dynamicContent: '',
  };
}
