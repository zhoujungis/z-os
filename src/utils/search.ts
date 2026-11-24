import MiniSearch from 'minisearch';
import type { SearchDocument } from '../types/domain';

const tokenPattern = /[A-Za-z0-9_+.#-]+|[\u3400-\u9fff]+/g;
const compoundPattern = /[\s_+.#-]+/;

function expandCjk(token: string): string[] {
  if (token.length < 2) return [token];
  const grams =
    token.length === 2
      ? [token]
      : Array.from({ length: token.length - 1 }, (_, i) => token.slice(i, i + 2));
  return [token, ...grams];
}

function expandToken(token: string): string[] {
  if (/^[\u3400-\u9fff]+$/.test(token)) return expandCjk(token);
  const lower = token.toLowerCase();
  const camel = token
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const parts = camel
    .split(compoundPattern)
    .map((part) => part.toLowerCase())
    .filter((part) => part.length >= 2);
  return [lower, ...parts];
}

export function tokenize(text: string): string[] {
  const tokens = text.match(tokenPattern) ?? [];
  return [...new Set(tokens.flatMap(expandToken))];
}

// Queries keep compound identifiers intact so "NanoBrowser" does not also
// match every unrelated "Nano" project; the index still stores the parts.
function queryTokenize(text: string): string[] {
  const tokens = text.match(tokenPattern) ?? [];
  return [
    ...new Set(
      tokens.flatMap((token) =>
        /^[\u3400-\u9fff]+$/.test(token) ? expandCjk(token) : [token.toLowerCase()],
      ),
    ),
  ];
}

// Short tokens such as "rust" and "rest" are one edit apart; fuzzing them
// produces confident-looking but unrelated matches.
function fuzzyForTerm(term: string): number | false {
  return /^[a-z0-9]+$/.test(term) && term.length >= 6 ? 0.2 : false;
}

export const searchOptions = {
  boost: { title: 4, tags: 2, keywords: 2 },
  prefix: true,
  fuzzy: fuzzyForTerm,
  tokenize: queryTokenize,
};

export function createSearchIndex(documents: SearchDocument[]) {
  const index = new MiniSearch<SearchDocument>({
    fields: ['title', 'description', 'tags', 'keywords'],
    storeFields: ['id', 'type', 'title', 'description', 'url', 'tags'],
    tokenize,
    searchOptions,
  });
  index.addAll(documents);
  return index;
}

export function searchDocuments(documents: SearchDocument[], query: string, limit = 20) {
  if (!query.trim()) return [];
  return createSearchIndex(documents).search(query, searchOptions).slice(0, limit) as unknown as
    SearchDocument[];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightParts(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const terms = [
    ...new Set(
      query
        .toLowerCase()
        .split(/[\s,+/#._\-:;()]+/)
        .filter((term) => term.length >= 2),
    ),
  ].slice(0, 6);
  if (!terms.length) return [{ text, match: false }];
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return text
    .split(pattern)
    .map((part, index) => ({ text: part, match: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}
