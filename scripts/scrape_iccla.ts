#!/usr/bin/env npx tsx
/**
 * KaNeXT Church Scraper — scrapes public data from https://iccla.com
 * Outputs structured JSON to data/church/iccla.json
 *
 * Usage: npx tsx scripts/scrape_iccla.ts
 *   or:  npm run scrape:iccla
 *
 * Respects robots.txt (Allow: /, Crawl-delay: 3).
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const CRAWL_DELAY = 3_000; // 3 seconds per robots.txt
const BASE = 'https://iccla.com';

const PAGES = [
  '/',
  '/about-2/',
  '/pastor/',
  '/foundation/',
  '/messages/',
  '/givee/',
  '/connect-with-us/',
];

async function fetchPage(path: string): Promise<string> {
  const url = `${BASE}${path}`;
  console.log(`  Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|li|ul|ol|tr|td|th|section|article|header|footer|blockquote)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

function extractYoutubeUrls(html: string): string[] {
  const matches = html.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g);
  return [...new Set([...matches].map(m => `https://www.youtube.com/watch?v=${m[1]}`))];
}

async function main() {
  console.log('KaNeXT Church Scraper — https://iccla.com');
  console.log('Checking robots.txt compliance...');

  const robotsRes = await fetch(`${BASE}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  console.log(`  robots.txt: ${robotsTxt.includes('Allow: /') ? 'Allow: / confirmed' : 'check manually'}`);
  console.log(`  Crawl-delay: ${CRAWL_DELAY / 1000}s\n`);

  const pages: Record<string, string> = {};

  for (const path of PAGES) {
    pages[path] = await fetchPage(path);
    await new Promise(r => setTimeout(r, CRAWL_DELAY));
  }

  // Extract structured data
  const homeText = stripHtml(pages['/']);
  const aboutText = stripHtml(pages['/about-2/']);
  const pastorText = stripHtml(pages['/pastor/']);
  const foundationText = stripHtml(pages['/foundation/']);
  const messagesHtml = pages['/messages/'];
  const messagesText = stripHtml(messagesHtml);
  const giveText = stripHtml(pages['/givee/']);

  // YouTube URLs from messages page
  const youtubeUrls = extractYoutubeUrls(messagesHtml);

  console.log('\nExtracted data:');
  console.log(`  Home page: ${homeText.length} chars`);
  console.log(`  About page: ${aboutText.length} chars`);
  console.log(`  Pastor page: ${pastorText.length} chars`);
  console.log(`  Foundation page: ${foundationText.length} chars`);
  console.log(`  Messages page: ${messagesText.length} chars`);
  console.log(`  Give page: ${giveText.length} chars`);
  console.log(`  YouTube URLs found: ${youtubeUrls.length}`);

  // Build output JSON structure
  const output = {
    church_profile: {
      name: 'KaNeXT Church | Los Angeles',
      shortName: 'KaNeXT Church',
      denomination: 'Inter-denominational Pentecostal',
      description: 'A Multicultural Christian Haven for Worshipping Jesus Christ',
      website: BASE,
    },
    _raw: {
      home: homeText.slice(0, 2000),
      about: aboutText.slice(0, 2000),
      pastor: pastorText.slice(0, 2000),
      foundation: foundationText.slice(0, 3000),
      messages: messagesText.slice(0, 3000),
      give: giveText.slice(0, 2000),
      youtubeUrls,
    },
    metadata: {
      scraped_at: new Date().toISOString().slice(0, 10),
      source_pages: PAGES.map(p => `${BASE}${p}`),
      robots_txt_compliant: true,
      crawl_delay_ms: CRAWL_DELAY,
    },
  };

  const outPath = join(__dirname, '..', 'data', 'church', 'iccla.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log('Done. Review the _raw fields and manually curate into the final structure.');
}

main().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
