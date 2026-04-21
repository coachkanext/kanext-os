/**
 * Data Room RAG — Keyword-based section retrieval
 *
 * Strategy:
 *  - Parse DATA_ROOM_KB into sections at ## / # heading boundaries
 *  - Always include anchor sections (exec summary, intro, valuation overview)
 *  - Score remaining sections by keyword overlap with query
 *  - Return top N matches; fall back to TOC if no strong match
 */

import { DATA_ROOM_KB } from './corpus-dataroom';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Section {
  heading:  string;
  content:  string;
  isAnchor: boolean;
}

// ── Stop words ────────────────────────────────────────────────────────────────

const STOP = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','being','have','has','had','do','does',
  'did','will','would','could','should','may','might','shall','can','what',
  'how','why','when','where','who','which','this','that','these','those',
  'it','its','i','my','we','our','you','your','they','their','there',
  'about','from','by','as','if','so','not','no','yes','than','then',
]);

// ── Anchor patterns — always loaded ───────────────────────────────────────────

const ANCHOR_PATTERNS = [
  /executive summary/i,
  /start here/i,
  /founder vision/i,
  /valuation framework/i,
  /platform replication/i,
  /what kanext is/i,
  /the ask/i,
  /capital raise/i,
];

function isAnchor(heading: string): boolean {
  return ANCHOR_PATTERNS.some(p => p.test(heading));
}

// ── Parser ────────────────────────────────────────────────────────────────────

let _cache: Section[] | null = null;

function getSections(): Section[] {
  if (_cache) return _cache;

  const lines   = DATA_ROOM_KB.split('\n');
  const sections: Section[] = [];
  let heading = '';
  let buf: string[] = [];

  const flush = () => {
    const content = buf.join('\n').trim();
    if (heading || content) {
      sections.push({ heading, content, isAnchor: isAnchor(heading) });
    }
    buf = [];
  };

  for (const line of lines) {
    if (/^#{1,3} /.test(line)) {
      flush();
      heading = line.replace(/^#+\s+/, '').trim();
    } else {
      buf.push(line);
    }
  }
  flush();

  _cache = sections;
  return sections;
}

// ── Keyword scorer ────────────────────────────────────────────────────────────

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

function score(section: Section, queryKws: string[]): number {
  if (!queryKws.length) return 0;
  const headingKws = keywords(section.heading);
  const contentKws = keywords(section.content);

  let s = 0;
  for (const kw of queryKws) {
    if (headingKws.includes(kw)) s += 5;
    const contentMatches = contentKws.filter(w => w === kw).length;
    s += Math.min(contentMatches, 10); // cap per-term content matches
  }
  return s;
}

// ── TOC fallback ──────────────────────────────────────────────────────────────

function buildTOC(): string {
  return getSections()
    .filter(s => s.heading)
    .map(s => `- ${s.heading}`)
    .join('\n');
}

// ── Public API ────────────────────────────────────────────────────────────────

const TOP_N       = 7;   // dynamic sections to retrieve
const MIN_SCORE   = 3;   // minimum score to include a section

export function retrieveDataRoomContext(query: string): string {
  const sections = getSections();
  const qKws     = keywords(query);

  // Always-loaded anchors
  const anchors  = sections.filter(s => s.isAnchor);

  // Score the rest
  const anchorSet = new Set(anchors.map(s => s.heading));
  const scored = sections
    .filter(s => !anchorSet.has(s.heading))
    .map(s => ({ section: s, score: score(s, qKws) }))
    .sort((a, b) => b.score - a.score);

  const topMatches = scored
    .filter(r => r.score >= MIN_SCORE)
    .slice(0, TOP_N)
    .map(r => r.section);

  // Fallback to TOC if no strong match
  const dynamic = topMatches.length > 0
    ? topMatches
    : [{ heading: 'Table of Contents', content: buildTOC(), isAnchor: false }];

  const all = [...anchors, ...dynamic];

  return all
    .map(s => s.heading ? `## ${s.heading}\n\n${s.content}` : s.content)
    .join('\n\n---\n\n');
}
