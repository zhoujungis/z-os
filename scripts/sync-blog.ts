import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import type { BlogPost, BlogSnapshot } from '../src/types/domain';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT_PATH = resolve(ROOT, 'src/data/blog.json');
const BLOG_URL = 'https://blog.zhoujun.dev';
const TIMEOUT_MS = 10_000;
const FEED_TYPES = new Set(['application/rss+xml', 'application/atom+xml']);

const EMPTY_SNAPSHOT: BlogSnapshot = {
  schemaVersion: 1,
  lastSuccessfulAt: null,
  posts: [],
};

type XmlRecord = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: true,
  processEntities: true,
  htmlEntities: true,
  trimValues: true,
});

function asRecord(value: unknown): XmlRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as XmlRecord)
    : null;
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const record = asRecord(value);
  return record ? textValue(record['#text']) : '';
}

export function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi, (entity, code: string) => {
    if (code[0] !== '#') return named[code.toLowerCase()];
    const radix = code[1]?.toLowerCase() === 'x' ? 16 : 10;
    const numeric = code.slice(radix === 16 ? 2 : 1);
    const point = Number.parseInt(numeric, radix);
    if (!Number.isFinite(point) || point < 0 || point > 0x10ffff) return entity;
    try {
      return String.fromCodePoint(point);
    } catch {
      return entity;
    }
  });
}

export function normalizeSummary(value: unknown): string {
  const withoutBlocks = textValue(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  return decodeEntities(withoutBlocks.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function findFeedLinks(html: string, baseUrl = BLOG_URL): string[] {
  const links: string[] = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes: Record<string, string> = {};
    for (const attribute of match[0].matchAll(
      /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
    )) {
      const name = attribute[1]?.toLowerCase();
      if (name && name !== 'link') {
        attributes[name] = attribute[2] ?? attribute[3] ?? attribute[4] ?? '';
      }
    }

    const rel = attributes.rel?.toLowerCase().split(/\s+/) ?? [];
    const type = attributes.type?.toLowerCase().split(';')[0].trim();
    if (!rel.includes('alternate') || !type || !FEED_TYPES.has(type) || !attributes.href) continue;

    try {
      const url = new URL(decodeEntities(attributes.href), baseUrl);
      if (url.protocol === 'https:' || url.protocol === 'http:') links.push(url.href);
    } catch {
      // Ignore malformed alternate links and try the remaining candidates.
    }
  }
  return [...new Set(links)];
}

function firstRecord(value: unknown): XmlRecord | null {
  return asRecord(asArray(value)[0]);
}

function postUrl(value: unknown, feedUrl: string, atom: boolean): string | null {
  let candidate = textValue(value);
  if (atom) {
    const links = asArray(value)
      .map(asRecord)
      .filter((link): link is XmlRecord => link !== null);
    const alternate =
      links.find((link) => link.rel === 'alternate') ?? links.find((link) => !link.rel) ?? links[0];
    candidate = textValue(alternate?.href);
  }

  try {
    const url = new URL(candidate, feedUrl);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function publishedAt(value: unknown): string | null {
  const raw = textValue(value).trim();
  if (!raw) return null;
  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? raw : new Date(timestamp).toISOString();
}

export function parseFeed(xml: string, feedUrl: string): BlogPost[] {
  const document = asRecord(parser.parse(xml));
  const channel = firstRecord(document?.rss && asRecord(document.rss)?.channel);
  const atomFeed = firstRecord(document?.feed);
  if (!channel && !atomFeed) throw new Error('Response is not an RSS or Atom feed');

  const entries = asArray(channel ? channel.item : atomFeed?.entry);
  return entries.flatMap((value) => {
    const entry = asRecord(value);
    if (!entry) return [];

    const title = normalizeSummary(entry.title);
    const url = postUrl(channel ? entry.link : entry.link, feedUrl, !channel);
    const date = publishedAt(
      channel
        ? (entry.pubDate ?? entry.date ?? entry.published ?? entry.updated)
        : (entry.published ?? entry.updated),
    );
    if (!title || !url || !date) return [];

    const description = normalizeSummary(
      channel
        ? (entry.description ?? entry.encoded ?? entry.summary ?? entry.content)
        : (entry.summary ?? entry.content),
    );
    return [{ title, description, url, publishedAt: date }];
  });
}

async function fetchText(url: string): Promise<{ text: string; url: string }> {
  const response = await fetch(url, {
    headers: {
      Accept:
        'text/html, application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.1',
      'User-Agent': 'zhoujun-dev-snapshot-sync',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return { text: await response.text(), url: response.url || url };
}

export async function syncBlog(now = new Date()): Promise<BlogSnapshot> {
  const previous = await readFile(OUTPUT_PATH, 'utf8')
    .then((value) => JSON.parse(value) as BlogSnapshot)
    .catch(() => EMPTY_SNAPSHOT);

  try {
    const homepage = await fetchText(BLOG_URL);
    const candidates = findFeedLinks(homepage.text, homepage.url);
    if (candidates.length === 0) throw new Error('No alternate RSS/Atom link found');

    let lastError: Error | null = null;
    for (const candidate of candidates) {
      try {
        const feed = await fetchText(candidate);
        const posts = parseFeed(feed.text, feed.url);
        const snapshot: BlogSnapshot = {
          schemaVersion: 1,
          lastSuccessfulAt: now.toISOString(),
          posts,
        };
        await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
        return snapshot;
      } catch (error) {
        lastError = error as Error;
      }
    }
    throw lastError ?? new Error('No usable feed found');
  } catch (error) {
    console.warn(`Blog sync failed: ${(error as Error).message}; keeping previous posts`);
    const snapshot: BlogSnapshot = {
      schemaVersion: 1,
      lastSuccessfulAt: previous.lastSuccessfulAt,
      posts: Array.isArray(previous.posts) ? previous.posts : [],
    };
    await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return snapshot;
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  syncBlog()
    .then((snapshot) => console.log(`Blog snapshot: ${snapshot.posts.length} posts`))
    .catch((error: Error) => {
      console.error(`Blog sync failed: ${error.message}`);
      process.exitCode = 1;
    });
}
