import { describe, expect, it } from 'vitest';
import {
  createSearchIndex,
  highlightParts,
  searchDocuments,
  tokenize,
} from '../../src/utils/search';
import type { SearchDocument } from '../../src/types/domain';

const documents: SearchDocument[] = [
  {
    id: 'p1',
    type: 'project',
    title: 'NanoBrowser',
    description: '基于 WebView2 的轻量桌面浏览器',
    url: '/projects/nanobrowser',
    tags: ['Rust', 'Tauri 2'],
  },
  {
    id: 'p2',
    type: 'project',
    title: 'z-memory',
    description: '本地优先的个人 AI 记忆管理',
    url: '/projects/z-memory',
    tags: ['Rust', 'SQLite'],
    keywords: ['memory', 'local-first'],
  },
  {
    id: 'p3',
    type: 'project',
    title: 'NanoDB',
    description: '用 Go 编写的嵌入式数据库，提供 REST 访问',
    url: '/projects/nanodb',
    tags: ['Go', 'REST'],
  },
  {
    id: 'page',
    type: 'page',
    title: 'Browser resources',
    description: 'NanoBrowser 的导航页面',
    url: '/browser',
    tags: [],
  },
];

describe('search', () => {
  it('tokenizes Chinese words and bigrams', () => {
    expect(tokenize('桌面浏览器')).toEqual(
      expect.arrayContaining(['桌面浏览器', '桌面', '面浏', '浏览', '览器']),
    );
    expect(tokenize('Rust + Tauri')).toEqual(['rust', '+', 'tauri']);
  });

  it('splits camelCase and hyphenated identifiers into searchable parts', () => {
    expect(tokenize('NanoBrowser z-memory')).toEqual(
      expect.arrayContaining(['nanobrowser', 'nano', 'browser', 'z-memory', 'memory']),
    );
  });

  it('finds English names, technology tags and Chinese descriptions', () => {
    expect(searchDocuments(documents, 'NanoBrowser')[0]?.id).toBe('p1');
    expect(searchDocuments(documents, 'SQLite')[0]?.id).toBe('p2');
    expect(searchDocuments(documents, '桌面')[0]?.id).toBe('p1');
    expect(searchDocuments(documents, '记忆')[0]?.id).toBe('p2');
  });

  it('matches identifiers by their components', () => {
    expect(searchDocuments(documents, 'memory')[0]?.id).toBe('p2');
    expect(searchDocuments(documents, 'browser').map((entry) => entry.id)).toContain('p1');
    expect(searchDocuments(documents, 'desktop')).toEqual([]);
  });

  it('does not fuzz short terms into unrelated words', () => {
    expect(searchDocuments(documents, 'Rust').map((entry) => entry.id)).not.toContain('p3');
    expect(searchDocuments(documents, 'Rust').map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['p1', 'p2']),
    );
  });

  it('does not expand compound queries into unrelated projects', () => {
    expect(searchDocuments(documents, 'NanoBrowser').map((entry) => entry.id)).not.toContain('p3');
  });

  it('ranks title matches above body matches', () => {
    const index = createSearchIndex(documents);
    expect(index.search('NanoBrowser')[0]?.id).toBe('p1');
  });

  it('returns an empty result set for empty or unmatched queries', () => {
    expect(searchDocuments(documents, '')).toEqual([]);
    expect(searchDocuments(documents, 'not-a-real-project')).toEqual([]);
  });

  it('highlights matched fragments in result text', () => {
    expect(highlightParts('NanoBrowser', 'browser')).toEqual([
      { text: 'Nano', match: false },
      { text: 'Browser', match: true },
    ]);
    expect(highlightParts('z-memory', 'memory')).toEqual([
      { text: 'z-', match: false },
      { text: 'memory', match: true },
    ]);
    expect(highlightParts('Router', '')).toEqual([{ text: 'Router', match: false }]);
  });
});

