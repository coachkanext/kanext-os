/**
 * Nexus Response Parser — extracts link chips from GPT responses.
 * GPT can embed [LINK:type:id:label] tokens that get parsed into LinkChip objects.
 */

import type { LinkChip } from '@/types/nexus-v2';

/**
 * Pattern: [LINK:objectType:objectId:label]
 * Example: [LINK:player:p-001:Jamal Carter]
 * Example: [LINK:room:rm-compliance:Compliance Desk]
 */
const LINK_TOKEN_REGEX = /\[LINK:(\w+):([^:]+):([^\]]+)\]/g;

export interface ParsedResponse {
  /** Text with link tokens removed */
  cleanText: string;
  /** Extracted link chips */
  linkChips: LinkChip[];
}

/**
 * Parse GPT response text for [LINK:...] tokens.
 * Returns cleaned text and extracted link chips.
 */
export function parseGPTResponse(text: string): ParsedResponse {
  const linkChips: LinkChip[] = [];
  let chipIndex = 0;

  const cleanText = text.replace(LINK_TOKEN_REGEX, (match, objectType, objectId, label) => {
    linkChips.push({
      id: `lc-gpt-${chipIndex++}`,
      objectType: objectType as LinkChip['objectType'],
      objectId,
      label,
    });
    return label; // Replace token with just the label in the text
  });

  return { cleanText, linkChips };
}

/**
 * Check if a GPT response contains any link tokens.
 */
export function hasLinkTokens(text: string): boolean {
  return LINK_TOKEN_REGEX.test(text);
}
