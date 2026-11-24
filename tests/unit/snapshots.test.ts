import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  mergeRepositorySnapshot,
  normalizeRepository,
  selectLatestRelease,
} from '../../scripts/sync-github';
import { findFeedLinks, normalizeSummary, parseFeed } from '../../scripts/sync-blog';
import { appendHistory, classifyStatus, probeService } from '../../scripts/probe-status';

const source = { key: 'example', fullName: 'zhoujungis/example' };

describe('GitHub snapshots', () => {
  it('normalizes only required public fields and preserves zero values', () => {
    const result = normalizeRepository(
      source,
      {
        description: 'Demo',
        html_url: 'https://github.com/zhoujungis/example',
        stargazers_count: 0,
        forks_count: 0,
        language: 'Rust',
        pushed_at: '2026-01-01T00:00:00Z',
        archived: false,
        private: true,
      },
      [],
    );
    expect(result).toMatchObject({
      stars: 0,
      forks: 0,
      latestRelease: null,
      syncStatus: 'success',
    });
    expect(result).not.toHaveProperty('private');
  });

  it('selects the latest public release and ignores drafts', () => {
    const releases = [
      {
        tag_name: 'v2',
        name: 'Draft',
        html_url: 'https://github.com/v2',
        published_at: '2026-02-01T00:00:00Z',
        draft: true,
      },
      {
        tag_name: 'v1',
        name: 'One',
        html_url: 'https://github.com/v1',
        published_at: '2026-01-01T00:00:00Z',
        draft: false,
      },
    ];
    expect(selectLatestRelease(releases)?.tag).toBe('v1');
    expect(selectLatestRelease([])).toBeNull();
  });

  it('keeps the previous repository on source failure', () => {
    const previous = normalizeRepository(
      source,
      { html_url: source.fullName, stargazers_count: 3 },
      [],
    );
    expect(mergeRepositorySnapshot(previous, source, null)).toMatchObject({
      stars: 3,
      syncStatus: 'stale',
    });
    expect(mergeRepositorySnapshot(undefined, source, null)).toMatchObject({
      stars: null,
      syncStatus: 'unavailable',
    });
  });
});

describe('blog snapshots', () => {
  it('discovers only declared RSS or Atom links', () => {
    const html =
      '<link rel="alternate" type="application/rss+xml" href="/feed.xml"><link rel="stylesheet" href="/app.css">';
    expect(findFeedLinks(html)).toEqual(['https://blog.zhoujun.dev/feed.xml']);
  });

  it('strips markup and decodes entities in summaries', () => {
    const summary = normalizeSummary('<p>Hello &lt;world&gt;</p><script>alert(1)</script>');
    expect(summary).toBe('Hello <world>');
    expect(summary).not.toContain('alert');
  });

  it('parses RSS items without preserving HTML', () => {
    const posts = parseFeed(
      '<?xml version="1.0"?><rss><channel><item><title>Post</title><link>/post</link><pubDate>Wed, 01 Jan 2026 00:00:00 GMT</pubDate><description><![CDATA[<p>Safe text</p>]]></description></item></channel></rss>',
      'https://blog.zhoujun.dev/feed.xml',
    );
    expect(posts).toEqual([
      {
        title: 'Post',
        url: 'https://blog.zhoujun.dev/post',
        publishedAt: '2026-01-01T00:00:00.000Z',
        description: 'Safe text',
      },
    ]);
  });
});

describe('status snapshots', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects redirects outside the service whitelist', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: 'https://example.com/private' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await probeService('https://blog.zhoujun.dev')).toEqual({
      status: 'outage',
      responseMs: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('classifies slow, failed and missing probes', () => {
    expect(classifyStatus(true, 500)).toBe('operational');
    expect(classifyStatus(true, 3500)).toBe('degraded');
    expect(classifyStatus(false, null)).toBe('outage');
    expect(classifyStatus(null, null)).toBe('unknown');
  });

  it('retains history inside the rolling window', () => {
    const now = new Date('2026-01-02T00:00:00Z');
    const history = appendHistory(
      [{ checkedAt: '2025-12-24T00:00:00Z', status: 'outage', responseMs: null }],
      { checkedAt: '2026-01-01T23:00:00Z', status: 'operational', responseMs: 100 },
      now,
    );
    expect(history).toHaveLength(1);
    expect(history[0]?.status).toBe('operational');
  });
});
