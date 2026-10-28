#!/usr/bin/env node
// Query public remote-job board feeds (JSON APIs and RSS) and filter titles locally.
// Companion to query-ats.mjs: same word-boundary title matching, no JS rendering, no bot-detection risk.
// The boards' own search parameters are loose, so this pulls each feed and filters on our side.
//
// Usage:
//   node query-remote-boards.mjs --title-keywords "Engineering Manager,Director of Engineering,VP of Engineering,CTO"
//   node query-remote-boards.mjs --title-keywords "Engineering Manager" --keyword PHP --days 30
//   node query-remote-boards.mjs --sources remotive,remoteok --format json

const DEFAULT_KEYWORDS = ['VP', 'Vice President', 'CTO', 'Chief Technology Officer', 'Head of Engineering', 'Engineering Manager', 'Director of Engineering'];
const USER_AGENT = 'Mozilla/5.0 (job-search-toolkit)';

// We Work Remotely publishes one RSS feed per category; these cover engineering and product leadership.
const WWR_CATEGORIES = [
  'remote-management-and-finance-jobs',
  'remote-full-stack-programming-jobs',
  'remote-back-end-programming-jobs',
  'remote-front-end-programming-jobs',
  'remote-devops-sysadmin-jobs',
  'remote-product-jobs',
];

function parseArgs(argv) {
  const args = { titleKeywords: DEFAULT_KEYWORDS, keyword: null, days: null, sources: null, format: 'text' };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--title-keywords') args.titleKeywords = rest[++i].split(',').map((s) => s.trim());
    else if (a === '--keyword') args.keyword = rest[++i];
    else if (a === '--days') args.days = Number(rest[++i]);
    else if (a === '--sources') args.sources = rest[++i].split(',').map((s) => s.trim().toLowerCase());
    else if (a === '--format') args.format = rest[++i];
  }
  return args;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchJSON(url) {
  return JSON.parse(await fetchText(url));
}

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function rssField(item, tag) {
  const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return null;
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

// Each fetcher returns a normalized array: { source, company, title, location, salary, url, postedAt, text }
// `text` (description and tags) is used only for the optional --keyword filter.
const FETCHERS = {
  async remotive() {
    const data = await fetchJSON('https://remotive.com/api/remote-jobs');
    return (data.jobs || []).map((j) => ({
      source: 'remotive',
      company: j.company_name,
      title: j.title,
      location: j.candidate_required_location || null,
      salary: j.salary || null,
      url: j.url,
      postedAt: j.publication_date || null,
      text: `${stripHtml(j.description)} ${(j.tags || []).join(' ')}`,
    }));
  },
  async remoteok() {
    const data = await fetchJSON('https://remoteok.com/api');
    return data
      .filter((j) => j && typeof j === 'object' && j.position)
      .map((j) => ({
        source: 'remoteok',
        company: j.company,
        title: j.position,
        location: j.location || null,
        salary: j.salary_min || j.salary_max ? `$${j.salary_min || '?'} - $${j.salary_max || '?'}` : null,
        url: j.url || j.apply_url,
        postedAt: j.date || null,
        text: `${stripHtml(j.description)} ${(j.tags || []).join(' ')}`,
      }));
  },
  async weworkremotely() {
    const feeds = await Promise.allSettled(
      WWR_CATEGORIES.map((c) => fetchText(`https://weworkremotely.com/categories/${c}.rss`))
    );
    const jobs = [];
    for (const f of feeds) {
      if (f.status !== 'fulfilled') continue;
      for (const item of f.value.split('<item>').slice(1)) {
        const raw = stripHtml(rssField(item, 'title') || '');
        // WWR titles are "Company: Job Title"
        const idx = raw.indexOf(': ');
        jobs.push({
          source: 'weworkremotely',
          company: idx > 0 ? raw.slice(0, idx) : null,
          title: idx > 0 ? raw.slice(idx + 2) : raw,
          location: rssField(item, 'region'),
          salary: null,
          url: rssField(item, 'link') || rssField(item, 'guid'),
          postedAt: rssField(item, 'pubDate') ? new Date(rssField(item, 'pubDate')).toISOString() : null,
          text: stripHtml(rssField(item, 'description') || ''),
        });
      }
    }
    // The same posting can appear in more than one category feed
    const seen = new Set();
    return jobs.filter((j) => (seen.has(j.url) ? false : seen.add(j.url)));
  },
  async workingnomads() {
    const data = await fetchJSON('https://www.workingnomads.com/api/exposed_jobs/');
    return data.map((j) => ({
      source: 'workingnomads',
      company: j.company_name,
      title: j.title,
      location: j.location || null,
      salary: null,
      url: j.url,
      postedAt: j.pub_date || null,
      text: `${stripHtml(j.description)} ${j.tags || ''}`,
    }));
  },
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const UNICODE_WHITESPACE_RE = /[  -​ 　﻿]/g;

function normalizeWhitespace(s) {
  return (s || '').replace(UNICODE_WHITESPACE_RE, ' ');
}

// Word-boundary matching, same as query-ats.mjs, so "CTO" does not match "Director".
function matchesKeywords(title, keywords) {
  const normalized = normalizeWhitespace(title);
  return keywords.some((k) => new RegExp(`\\b${escapeRegex(normalizeWhitespace(k))}\\b`, 'i').test(normalized));
}

async function main() {
  const args = parseArgs(process.argv);
  const sources = args.sources || Object.keys(FETCHERS);
  const unknown = sources.filter((s) => !FETCHERS[s]);
  if (unknown.length) {
    process.stderr.write(`Unknown source(s): ${unknown.join(', ')}. Supported: ${Object.keys(FETCHERS).join(', ')}\n`);
    process.exit(2);
  }

  const results = await Promise.allSettled(sources.map((s) => FETCHERS[s]()));
  let jobs = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') jobs.push(...r.value);
    else errors.push(`${sources[i]}: ${r.reason.message}`);
  });

  let filtered = jobs.filter((j) => j.title && matchesKeywords(j.title, args.titleKeywords));
  if (args.keyword) {
    const re = new RegExp(`\\b${escapeRegex(args.keyword)}\\b`, 'i');
    filtered = filtered.filter((j) => re.test(`${j.title} ${j.text}`));
  }
  if (args.days) {
    const cutoff = Date.now() - args.days * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((j) => !j.postedAt || new Date(j.postedAt).getTime() >= cutoff);
  }
  filtered.sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));

  if (args.format === 'json') {
    process.stdout.write(JSON.stringify({ jobs: filtered.map(({ text, ...j }) => j), errors }, null, 2) + '\n');
  } else {
    if (filtered.length === 0) {
      process.stdout.write('No matching postings found.\n');
    } else {
      for (const j of filtered) {
        process.stdout.write(`${j.company || 'unknown'} -- ${j.title}\n  Location: ${j.location || 'unknown'}\n  Salary: ${j.salary || 'not listed'}\n  Posted: ${j.postedAt || 'unknown'}\n  URL: ${j.url}\n  Source: ${j.source}\n\n`);
      }
    }
    if (errors.length > 0) {
      process.stderr.write(`\n${errors.length} source(s) failed:\n` + errors.map((e) => `  - ${e}`).join('\n') + '\n');
    }
  }
}

main().catch((err) => {
  process.stderr.write(`query-remote-boards: ${err.message}\n`);
  process.exit(1);
});
