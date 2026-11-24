import type { ServiceSnapshot } from '../types/domain';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const OBSERVATION_WINDOW_MS = 7 * DAY_MS;
export const FULL_WINDOW_MIN_SPAN_MS = 5 * DAY_MS;
export const STALE_AFTER_MS = 26 * 60 * 60 * 1000;

export function getServiceMetrics(service: ServiceSnapshot, now = Date.now()) {
  const history = service.history.filter((check) => {
    const time = Date.parse(check.checkedAt);
    return Number.isFinite(time) && time <= now && time >= now - OBSERVATION_WINDOW_MS;
  });
  const checkedAt = service.checkedAt ? Date.parse(service.checkedAt) : NaN;
  const isStale = !Number.isFinite(checkedAt) || now - checkedAt > STALE_AFTER_MS;
  const status = isStale ? 'unknown' : service.status;
  const first = history.length ? Date.parse(history[0].checkedAt) : 0;
  const last = history.length ? Date.parse(history[history.length - 1].checkedAt) : 0;
  const hasFullWindow = history.length > 1 && last - first >= FULL_WINDOW_MIN_SPAN_MS;
  const available = history.filter(
    (check) => check.status === 'operational' || check.status === 'degraded',
  ).length;
  return {
    status,
    checkedAt: service.checkedAt,
    responseMs: isStale ? null : service.responseMs,
    sampleCount: history.length,
    hasFullWindow,
    availability: hasFullWindow ? (available / history.length) * 100 : null,
  };
}
