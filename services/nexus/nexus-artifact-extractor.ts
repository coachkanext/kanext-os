/**
 * Nexus Artifact Extractor
 *
 * Scans a list of NexusMessages for fenced code blocks and returns
 * structured NexusArtifact objects. Used for a future "Artifacts" panel.
 */

import type { NexusMessage, NexusChat } from './nexus-chat-storage';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NexusArtifact {
  id:           string;
  type:         'code' | 'json' | 'sql' | 'table' | 'text';
  language?:    string;
  title:        string;
  content:      string;
  preview:      string;    // first non-empty line, max 80 chars
  sourceChatId: string;
  chatTitle?:   string;
  messageId:    string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function classifyLanguage(lang: string): NexusArtifact['type'] {
  const l = lang.toLowerCase();
  if (l === 'json')                              return 'json';
  if (l === 'sql')                               return 'sql';
  if (l === 'csv' || l === 'table')              return 'table';
  if (['', 'text', 'plain', 'markdown', 'md'].includes(l)) return 'text';
  return 'code';
}

function inferArtifactTitle(language: string, content: string): string {
  const firstLine = content.split('\n')[0].slice(0, 60).trim();
  const fnMatch   = firstLine.match(/(?:function|const|class|def|fn)\s+(\w+)/);
  if (fnMatch) return fnMatch[1];
  if (language === 'sql')  return 'SQL Query';
  if (language === 'json') return 'JSON';
  if (['bash', 'shell', 'sh'].includes(language)) return 'Script';
  return firstLine.slice(0, 30) || language.toUpperCase() || 'Code';
}

// ── Main Export ───────────────────────────────────────────────────────────────

let _counter = 0;

/**
 * Extract all code-fenced artifacts from a list of messages for a given chat.
 * Only processes assistant messages (user messages rarely contain fences).
 */
export function extractArtifacts(
  messages:  NexusMessage[],
  chatId:    string,
  chatTitle?: string,
): NexusArtifact[] {
  const results: NexusArtifact[] = [];

  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;

    const fence = /```(\w*)\n?([\s\S]*?)```/g;
    let match: RegExpExecArray | null;

    while ((match = fence.exec(msg.content)) !== null) {
      const lang    = (match[1] ?? '').trim().toLowerCase();
      const content = (match[2] ?? '').trim();
      if (!content) continue;

      const idx     = _counter++;
      const type    = classifyLanguage(lang);
      const preview = content.split('\n').find(l => l.trim().length > 0)?.slice(0, 80) ?? '';

      results.push({
        id:           `nxa_${chatId}_${idx}`,
        type,
        language:     lang || undefined,
        title:        inferArtifactTitle(lang, content),
        content,
        preview,
        sourceChatId: chatId,
        chatTitle,
        messageId:    msg.id,
      });
    }
  }

  return results;
}

/**
 * Extract artifacts from all chats. Useful for the sidebar Artifacts section.
 */
export function extractArtifactsFromChats(chats: NexusChat[]): NexusArtifact[] {
  return chats.flatMap(c => extractArtifacts(c.messages, c.id, c.title));
}
