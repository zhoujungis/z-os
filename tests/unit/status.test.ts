import { describe, expect, it } from 'vitest';
import { DAY_MS, FULL_WINDOW_MIN_SPAN_MS, getServiceMetrics } from '../../src/utils/status';
import type { ServiceSnapshot } from '../../src/types/domain';

const now = Date.parse('2026-11-13T12:00:00.000Z');
const service: ServiceSnapshot = {
  id: 'blog',
  name: 'Blog',
  url: 'https://blog.zhoujun.dev',
  status: 'unknown',
  checkedAt: null,
  responseMs: null,
  history: [],
};

describe('service metrics', () => {
  it('keeps missing data unknown', () => {
    expect(getServiceMetrics(service, now)).toMatchObject({
      status: 'unknown',
      availability: null,
      sampleCount: 0,
    });
  });

  it('marks stale operational data unknown', () => {
    const value = {
      ...service,
      status: 'operational' as const,
      checkedAt: new Date(now - DAY_MS - 3 * 60 * 60 * 1000).toISOString(),
      responseMs: 120,
    };
    expect(getServiceMetrics(value, now)).toMatchObject({ status: 'unknown', responseMs: null });
  });

  it('does not report availability before a full observation window', () => {
    const value = {
      ...service,
      status: 'operational' as const,
      checkedAt: '2026-11-13T11:59:00.000Z',
      responseMs: 120,
      history: [
        { checkedAt: '2026-11-13T11:00:00.000Z', status: 'operational' as const, responseMs: 120 },
      ],
    };
    expect(getServiceMetrics(value, now)).toMatchObject({
      status: 'operational',
      hasFullWindow: false,
      availability: null,
      sampleCount: 1,
    });
  });

  it('calculates observed availability across a full window', () => {
    const history = [
      {
        checkedAt: new Date(now - FULL_WINDOW_MIN_SPAN_MS).toISOString(),
        status: 'operational' as const,
        responseMs: 100,
      },
      {
        checkedAt: new Date(now - FULL_WINDOW_MIN_SPAN_MS / 2).toISOString(),
        status: 'outage' as const,
        responseMs: null,
      },
      { checkedAt: new Date(now).toISOString(), status: 'degraded' as const, responseMs: 3500 },
    ];
    const value = {
      ...service,
      status: 'degraded' as const,
      checkedAt: new Date(now).toISOString(),
      responseMs: 3500,
      history,
    };
    const metrics = getServiceMetrics(value, now);
    expect(metrics).toMatchObject({ hasFullWindow: true, sampleCount: 3 });
    expect(metrics.availability).toBeCloseTo(200 / 3, 8);
  });
});
