import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { GitHubRelease, GitHubSnapshot, RepositorySnapshot } from '../src/types/domain';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PROJECTS_DIR = resolve(ROOT, 'src/content/projects');
const OUTPUT_PATH = resolve(ROOT, 'src/data/github.json');
const CACHE_PATH = resolve(ROOT, 'scripts/github-cache.json');
const API_ROOT = 'https://api.github.com';
const TIMEOUT_MS = 10_000;

const EMPTY_SNAPSHOT: GitHubSnapshot = {
  schemaVersion: 1,
  lastAttemptAt: null,
  lastSuccessfulAt: null,
  repositories: [],
};

type ApiRecord = Record<string, unknown>;

export interface RepositorySource {
  key: string;
  fullName: string;
}

interface EtagCache {
  repositories: Record<string, string>;
  releases: Record<string, string>;
}

interface ApiResponse {
  data: unknown;
  etag: string | null;
  notModified: boolean;
}

function asRecord(value: unknown): ApiRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as ApiRecord)
    : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function readRepositoryWhitelist(
  directory = PROJECTS_DIR,
): Promise<RepositorySource[]> {
  const sources = new Map<string, RepositorySource>();
  let files: string[];

  try {
    files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  for (const file of files) {
    try {
      const project = asRecord(JSON.parse(await readFile(resolve(directory, file), 'utf8')));
      const repository = project?.repository;
      if (typeof repository !== 'string') continue;

      const url = new URL(repository);
      if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') continue;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length !== 2) continue;

      const fullName = `${parts[0]}/${parts[1].replace(/\.git$/, '')}`;
      const key =
        typeof project?.slug === 'string' && project.slug ? project.slug : basename(file, '.json');
      const dedupeKey = fullName.toLowerCase();
      if (!sources.has(dedupeKey)) sources.set(dedupeKey, { key, fullName });
    } catch (error) {
      console.warn(`Skipping ${file}: ${(error as Error).message}`);
    }
  }

  return [...sources.values()];
}

export function normalizeRelease(value: unknown): GitHubRelease | null {
  const release = asRecord(value);
  if (!release || release.draft === true || typeof release.tag_name !== 'string') return null;

  const publishedAt = nullableString(release.published_at) ?? nullableString(release.created_at);
  const url = nullableString(release.html_url);
  if (!publishedAt || !url) return null;

  return {
    tag: release.tag_name,
    name: nullableString(release.name) ?? release.tag_name,
    url,
    publishedAt,
    prerelease: release.prerelease === true,
  };
}

export function selectLatestRelease(value: unknown): GitHubRelease | null {
  if (!Array.isArray(value)) return null;

  return (
    value
      .map(normalizeRelease)
      .filter((release): release is GitHubRelease => release !== null)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0] ?? null
  );
}

export function normalizeRepository(
  source: RepositorySource,
  value: unknown,
  releases: unknown,
): RepositorySnapshot {
  const repository = asRecord(value);
  if (!repository) throw new Error('Invalid GitHub repository response');

  return {
    key: source.key,
    fullName: source.fullName,
    description: nullableString(repository.description),
    url: nullableString(repository.html_url) ?? `https://github.com/${source.fullName}`,
    stars: nullableNumber(repository.stargazers_count),
    forks: nullableNumber(repository.forks_count),
    language: nullableString(repository.language),
    topics: Array.isArray(repository.topics)
      ? repository.topics.filter((topic): topic is string => typeof topic === 'string')
      : [],
    pushedAt: nullableString(repository.pushed_at),
    archived: repository.archived === true,
    latestRelease: selectLatestRelease(releases),
    syncStatus: 'success',
  };
}

function copyRepository(
  repository: RepositorySnapshot,
  syncStatus: RepositorySnapshot['syncStatus'],
): RepositorySnapshot {
  return {
    key: repository.key,
    fullName: repository.fullName,
    description: repository.description,
    url: repository.url,
    stars: repository.stars,
    forks: repository.forks,
    language: repository.language,
    topics: repository.topics,
    pushedAt: repository.pushedAt,
    archived: repository.archived,
    latestRelease: repository.latestRelease,
    syncStatus,
  };
}

export function mergeRepositorySnapshot(
  previous: RepositorySnapshot | undefined,
  source: RepositorySource,
  next: RepositorySnapshot | null,
): RepositorySnapshot {
  if (next) return next;
  if (previous) return copyRepository(previous, 'stale');

  return {
    key: source.key,
    fullName: source.fullName,
    description: null,
    url: `https://github.com/${source.fullName}`,
    stars: null,
    forks: null,
    language: null,
    topics: [],
    pushedAt: null,
    archived: false,
    latestRelease: null,
    syncStatus: 'unavailable',
  };
}

async function requestGitHub(
  url: string,
  etag: string | undefined,
  token: string | undefined,
): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'zhoujun-dev-snapshot-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (etag) headers['If-None-Match'] = etag;

  const response = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (response.status === 304) {
    await response.body?.cancel().catch(() => undefined);
    return { data: null, etag: etag ?? null, notModified: true };
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error(`GitHub returned HTTP ${response.status}`);
  }

  return {
    data: await response.json(),
    etag: response.headers.get('etag'),
    notModified: false,
  };
}

function storeEtag(cache: Record<string, string>, key: string, etag: string | null): void {
  if (etag) cache[key] = etag;
  else delete cache[key];
}

export async function syncGitHub(now = new Date()): Promise<GitHubSnapshot> {
  const [sources, previous, storedCache] = await Promise.all([
    readRepositoryWhitelist(),
    readJson<GitHubSnapshot>(OUTPUT_PATH, EMPTY_SNAPSHOT),
    readJson<Partial<EtagCache>>(CACHE_PATH, {}),
  ]);
  const cache: EtagCache = {
    repositories: storedCache.repositories ?? {},
    releases: storedCache.releases ?? {},
  };
  const previousByName = new Map(
    (Array.isArray(previous.repositories) ? previous.repositories : []).map((repository) => [
      repository.fullName.toLowerCase(),
      repository,
    ]),
  );
  const token = process.env.GITHUB_TOKEN;
  const timestamp = now.toISOString();

  const repositories = await Promise.all(
    sources.map(async (source) => {
      const previousRepository = previousByName.get(source.fullName.toLowerCase());
      try {
        const repositoryResponse = await requestGitHub(
          `${API_ROOT}/repos/${source.fullName}`,
          cache.repositories[source.fullName],
          token,
        );
        storeEtag(cache.repositories, source.fullName, repositoryResponse.etag);
        if (repositoryResponse.notModified && !previousRepository) {
          throw new Error('Received 304 without a previous repository snapshot');
        }

        const releaseResponse = await requestGitHub(
          `${API_ROOT}/repos/${source.fullName}/releases?per_page=100`,
          cache.releases[source.fullName],
          token,
        );
        storeEtag(cache.releases, source.fullName, releaseResponse.etag);
        if (releaseResponse.notModified && !previousRepository) {
          throw new Error('Received 304 without a previous release snapshot');
        }

        const normalized = repositoryResponse.notModified
          ? copyRepository(previousRepository!, 'success')
          : normalizeRepository(source, repositoryResponse.data, []);
        normalized.latestRelease = releaseResponse.notModified
          ? previousRepository!.latestRelease
          : selectLatestRelease(releaseResponse.data);
        return mergeRepositorySnapshot(previousRepository, source, normalized);
      } catch (error) {
        console.warn(`${source.fullName}: ${(error as Error).message}; keeping previous data`);
        return mergeRepositorySnapshot(previousRepository, source, null);
      }
    }),
  );

  await writeJson(CACHE_PATH, cache).catch((error: Error) => {
    console.warn(`Could not persist ETag cache: ${error.message}`);
  });

  const snapshot: GitHubSnapshot = {
    schemaVersion: 1,
    lastAttemptAt: timestamp,
    lastSuccessfulAt: repositories.some((repository) => repository.syncStatus === 'success')
      ? timestamp
      : previous.lastSuccessfulAt,
    repositories,
  };
  await writeJson(OUTPUT_PATH, snapshot);
  return snapshot;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  syncGitHub()
    .then((snapshot) => {
      const stale = snapshot.repositories.filter(
        (repository) => repository.syncStatus !== 'success',
      ).length;
      console.log(`GitHub snapshot: ${snapshot.repositories.length} repositories, ${stale} stale`);
    })
    .catch((error: Error) => {
      console.error(`GitHub sync failed: ${error.message}`);
      process.exitCode = 1;
    });
}
