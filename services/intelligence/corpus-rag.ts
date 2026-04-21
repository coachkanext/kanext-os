/**
 * Unified RAG — keyword-based retrieval across all KaNeXT knowledge bases.
 *
 * Sources:
 *   DIPSON_KB              — KaNeXT Intelligence KB v2
 *   OS_KB                  — KaNeXT Product / OS knowledge base
 *   INSTITUTIONAL_INTEL_KB — 27 institutional intelligence KBs
 *   DATA_ROOM_KB           — Investor data room
 *
 * On each query: score all sections across all KBs, return top N.
 * Anchor sections (exec summary, identity, etc.) always included.
 * Total retrieved context stays well under 200K tokens.
 */

import { DIPSON_KB }              from './corpus';
import { OS_KB }                  from './corpus-os';
import { INSTITUTIONAL_INTEL_KB } from './corpus-institutional-intel';
import { DATA_ROOM_KB }           from './corpus-dataroom';

// ── Types ─────────────────────────────────────────────────────────────────────

type KBSource = 'intelligence' | 'os' | 'institutional' | 'dataroom';

interface Section {
  heading:  string;
  content:  string;
  source:   KBSource;
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

// ── Anchor patterns per source ────────────────────────────────────────────────

const ANCHORS: Record<KBSource, RegExp[]> = {
  intelligence: [/what is kanext/i, /dipson/i, /intelligence overview/i],
  os:           [/what is kanext/i, /overview/i, /platform overview/i, /how it works/i],
  institutional: [/overview/i, /introduction/i],
  dataroom:     [/executive summary/i, /start here/i, /founder vision/i,
                 /valuation framework/i, /the ask/i, /capital raise/i, /what kanext is/i],
};

function isAnchor(heading: string, source: KBSource): boolean {
  return ANCHORS[source].some(p => p.test(heading));
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parseSections(kb: string, source: KBSource): Section[] {
  const lines    = kb.split('\n');
  const sections: Section[] = [];
  let heading    = '';
  let buf: string[] = [];

  const flush = () => {
    const content = buf.join('\n').trim();
    if (heading || content) {
      sections.push({ heading, content, source, isAnchor: isAnchor(heading, source) });
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
  return sections;
}

// ── Section pool (lazy, cached) ───────────────────────────────────────────────

let _pool: Section[] | null = null;

function getPool(): Section[] {
  if (_pool) return _pool;
  _pool = [
    ...(DIPSON_KB              ? parseSections(DIPSON_KB,              'intelligence')  : []),
    ...(OS_KB                  ? parseSections(OS_KB,                  'os')            : []),
    ...(INSTITUTIONAL_INTEL_KB ? parseSections(INSTITUTIONAL_INTEL_KB, 'institutional') : []),
    ...(DATA_ROOM_KB           ? parseSections(DATA_ROOM_KB,           'dataroom')      : []),
  ];
  return _pool;
}

// ── Keyword scorer ────────────────────────────────────────────────────────────

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

function scoreSection(section: Section, queryKws: string[]): number {
  if (!queryKws.length) return 0;
  const hKws = keywords(section.heading);
  const cKws = keywords(section.content);
  let s = 0;
  for (const kw of queryKws) {
    if (hKws.includes(kw)) s += 5;
    s += Math.min(cKws.filter(w => w === kw).length, 10);
  }
  return s;
}

// ── TOC fallback ──────────────────────────────────────────────────────────────

function buildTOC(): string {
  const bySource: Record<KBSource, string[]> = {
    intelligence: [], os: [], institutional: [], dataroom: [],
  };
  for (const s of getPool()) {
    if (s.heading) bySource[s.source].push(`- ${s.heading}`);
  }
  return Object.entries(bySource)
    .filter(([, lines]) => lines.length)
    .map(([src, lines]) => `### ${src.toUpperCase()}\n${lines.join('\n')}`)
    .join('\n\n');
}

// ── Public API ────────────────────────────────────────────────────────────────

const TOP_N     = 10;  // dynamic sections per query
const MIN_SCORE = 3;   // minimum relevance threshold

export function retrieveContext(query: string): string {
  const pool  = getPool();
  const qKws  = keywords(query);

  const anchors   = pool.filter(s => s.isAnchor);
  const anchorSet = new Set(anchors.map(s => `${s.source}::${s.heading}`));

  const scored = pool
    .filter(s => !anchorSet.has(`${s.source}::${s.heading}`))
    .map(s => ({ s, score: scoreSection(s, qKws) }))
    .sort((a, b) => b.score - a.score);

  const dynamic = scored.filter(r => r.score >= MIN_SCORE).slice(0, TOP_N).map(r => r.s);

  const fallback = dynamic.length === 0
    ? [{ heading: 'Available Topics', content: buildTOC(), source: 'os' as KBSource, isAnchor: false }]
    : [];

  return [...anchors, ...dynamic, ...fallback]
    .map(s => s.heading ? `## ${s.heading}\n\n${s.content}` : s.content)
    .join('\n\n---\n\n');
}
