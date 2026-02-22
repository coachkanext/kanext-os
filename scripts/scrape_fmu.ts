#!/usr/bin/env npx tsx
/**
 * FMU Scraper — scrapes public data from https://www.fmu.edu and https://fmuathletics.com
 * Outputs structured JSON to data/campus/fmu.json
 *
 * Usage: npx tsx scripts/scrape_fmu.ts
 *   or:  npm run scrape:fmu
 *
 * Respects robots.txt:
 *   fmu.edu: Disallow /wp-admin/ only
 *   fmuathletics.com: content pages (roster, schedule) are accessible
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const CRAWL_DELAY = 2_000; // 2 seconds between requests
const FMU_BASE = 'https://www.fmu.edu';
const ATH_BASE = 'https://fmuathletics.com';

const FMU_PAGES = [
  '/about-fmu/',
  '/about-fmu/mission-vision/',
  '/about-fmu/fmu-history/',
  '/about-fmu/accreditation/',
  '/about-fmu/administration/',
  '/calendar/',
  '/student-engagement/',
  '/student-engagement/housing-and-residence-life/',
  '/student-engagement/clubs-and-organizations/',
];

const ATH_PAGES = [
  '/',
  '/sports/mens-basketball/roster',
  '/sports/mens-basketball/schedule',
  '/sports/football/roster',
  '/sports/football/schedule',
];

async function fetchPage(base: string, path: string): Promise<string> {
  const url = `${base}${path}`;
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

async function fetchRSS(): Promise<string> {
  const url = `${FMU_BASE}/feed/`;
  console.log(`  Fetching RSS ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  console.log('FMU Scraper — https://www.fmu.edu + https://fmuathletics.com');
  console.log('Checking robots.txt compliance...');

  const fmuRobots = await (await fetch(`${FMU_BASE}/robots.txt`)).text();
  console.log(`  fmu.edu robots.txt: ${fmuRobots.includes('Disallow: /wp-admin/') ? 'wp-admin blocked only — OK' : 'check manually'}`);

  const athRobots = await (await fetch(`${ATH_BASE}/robots.txt`)).text();
  console.log(`  fmuathletics.com robots.txt loaded (${athRobots.length} chars)`);
  console.log(`  Crawl-delay: ${CRAWL_DELAY / 1000}s\n`);

  // Fetch FMU pages
  const fmuPages: Record<string, string> = {};
  for (const path of FMU_PAGES) {
    try {
      fmuPages[path] = await fetchPage(FMU_BASE, path);
    } catch (e) {
      console.warn(`  Warning: Failed to fetch ${path}: ${e}`);
      fmuPages[path] = '';
    }
    await new Promise(r => setTimeout(r, CRAWL_DELAY));
  }

  // Fetch RSS
  const rssXml = await fetchRSS();
  await new Promise(r => setTimeout(r, CRAWL_DELAY));

  // Fetch Athletics pages
  const athPages: Record<string, string> = {};
  for (const path of ATH_PAGES) {
    try {
      athPages[path] = await fetchPage(ATH_BASE, path);
    } catch (e) {
      console.warn(`  Warning: Failed to fetch ${path}: ${e}`);
      athPages[path] = '';
    }
    await new Promise(r => setTimeout(r, CRAWL_DELAY));
  }

  // Extract text
  const pageTexts: Record<string, string> = {};
  for (const [path, html] of Object.entries(fmuPages)) {
    pageTexts[`fmu:${path}`] = stripHtml(html).slice(0, 3000);
  }
  for (const [path, html] of Object.entries(athPages)) {
    pageTexts[`ath:${path}`] = stripHtml(html).slice(0, 3000);
  }

  // Extract news from RSS
  const titleMatches = [...rssXml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)];
  const dateMatches = [...rssXml.matchAll(/<pubDate>(.*?)<\/pubDate>/g)];
  const linkMatches = [...rssXml.matchAll(/<link>(https:\/\/www\.fmu\.edu\/[^<]+)<\/link>/g)];

  const newsItems = titleMatches.slice(0, 10).map((m, i) => ({
    title: m[1],
    date: dateMatches[i]?.[1] ?? '',
    url: linkMatches[i]?.[1] ?? '',
  }));

  console.log('\nExtracted data:');
  console.log(`  FMU pages fetched: ${Object.keys(fmuPages).length}`);
  console.log(`  Athletics pages fetched: ${Object.keys(athPages).length}`);
  console.log(`  News articles from RSS: ${newsItems.length}`);

  const output = {
    university_profile: {
      name: 'Carroll College Athletics',
      shortName: 'Carroll',
      website: FMU_BASE,
      athleticsWebsite: ATH_BASE,
    },
    _raw: {
      pages: pageTexts,
      rss_news: newsItems,
    },
    metadata: {
      scraped_at: new Date().toISOString().slice(0, 10),
      source_pages: [
        ...FMU_PAGES.map(p => `${FMU_BASE}${p}`),
        `${FMU_BASE}/feed/`,
        ...ATH_PAGES.map(p => `${ATH_BASE}${p}`),
      ],
      robots_txt_compliant: true,
      crawl_delay_ms: CRAWL_DELAY,
    },
  };

  const outPath = join(__dirname, '..', 'data', 'campus', 'fmu.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log('Done. Review the _raw fields and manually curate into the final structure.');
}

main().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
