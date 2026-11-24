import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { services } from '../src/config/services';
import { OBSERVATION_WINDOW_MS } from '../src/utils/status';
import type {
  ServiceCheck,
  ServiceSnapshot,
  ServiceState,
  StatusSnapshot,
} from '../src/types/domain';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT_PATH = resolve(ROOT, 'src/data/status.json');
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const ROLLING_WINDOW_MS = OBSERVATION_WINDOW_MS;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const ALLOWED_ORIGINS = new Set(services.map((service) => new URL(service.url).origin));

export function classifyStatus(
  responseOk: boolean | null,
  responseMs: number | null,
): ServiceState {
  if (responseOk === null) return 'unknown';
  if (!responseOk) return 'outage';
  if (responseMs === null) return 'unknown';
  return responseMs > 3000 ? 'degraded' : 'operational';
}

export function pruneHistory(history: readonly ServiceCheck[], now = new Date()): ServiceCheck[] {
  const end = now.getTime();
  const start = end - ROLLING_WINDOW_MS;
  return history
    .filter((check) => {
      const checkedAt = Date.parse(check.checkedAt);
      return Number.isFinite(checkedAt) && checkedAt >= start && checkedAt <= end;
    })
    .map((check) => ({
      checkedAt: check.checkedAt,
      status: check.status,
      responseMs: check.responseMs,
    }));
}

export function appendHistory(
  history: readonly ServiceCheck[],
  check: ServiceCheck,
  now = new Date(),
): ServiceCheck[] {
  return pruneHistory([...history, check], now);
}

async function cancelBody(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined);
}

async function getWithLimitedRedirects(url: string, signal: AbortSignal): Promise<Response> {
  let currentUrl = url;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      method: 'GET',
      headers: { Accept: '*/*', 'User-Agent': 'zhoujun-dev-status-probe' },
      cache: 'no-store',
      redirect: 'manual',
      signal,
    });

    if (!REDIRECT_STATUSES.has(response.status) || !response.headers.get('location')) {
      return response;
    }

    const location = response.headers.get('location')!;
    await cancelBody(response);
    if (redirectCount === MAX_REDIRECTS) throw new Error('Too many redirects');

    const nextUrl = new URL(location, currentUrl);
    if (nextUrl.protocol !== 'https:' || !ALLOWED_ORIGINS.has(nextUrl.origin)) {
      throw new Error('Redirect outside service whitelist');
    }
    currentUrl = nextUrl.href;
  }
  throw new Error('Too many redirects');
}

export interface ProbeResult {
  status: Exclude<ServiceState, 'unknown'>;
  responseMs: number | null;
}

export async function probeService(url: string): Promise<ProbeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await getWithLimitedRedirects(url, controller.signal);
    const elapsed = performance.now() - startedAt;
    await cancelBody(response);
    return {
      status: classifyStatus(response.ok, elapsed) as ProbeResult['status'],
      responseMs: Math.round(elapsed),
    };
  } catch {
    return { status: 'outage', responseMs: null };
  } finally {
    clearTimeout(timeout);
  }
}

export async function probeStatuses(now = new Date()): Promise<StatusSnapshot> {
  let previous: StatusSnapshot = { schemaVersion: 1, services: [] };
  try {
    previous = JSON.parse(await readFile(OUTPUT_PATH, 'utf8')) as StatusSnapshot;
  } catch {
    // A missing or invalid previous snapshot must not prevent fresh probes.
  }
  const previousById = new Map(
    (Array.isArray(previous.services) ? previous.services : []).map((service) => [
      service.id,
      service,
    ]),
  );
  const checkedAt = now.toISOString();

  const snapshots = await Promise.all(
    services.map(async (service): Promise<ServiceSnapshot> => {
      const old = previousById.get(service.id);
      const result = await probeService(service.url);
      const check: ServiceCheck = { checkedAt, ...result };
      return {
        id: service.id,
        name: service.name,
        url: service.url,
        status: result.status,
        checkedAt,
        responseMs: result.responseMs,
        history: appendHistory(Array.isArray(old?.history) ? old.history : [], check, now),
      };
    }),
  );

  const snapshot: StatusSnapshot = { schemaVersion: 1, services: snapshots };
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  return snapshot;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  probeStatuses()
    .then((snapshot) => console.log(`Status snapshot: ${snapshot.services.length} services`))
    .catch((error: Error) => {
      console.error(`Status probe failed: ${error.message}`);
      process.exitCode = 1;
    });
}
