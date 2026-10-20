/**
 * api.test.ts
 *
 * Tests for the client-side requestEventPlan function in src/lib/api.ts.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { requestEventPlan, ApiError } from '../src/lib/api';
import { DEMO_WEDDING_PLAN } from '../src/lib/providers/demoData';

describe('client-side requestEventPlan', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('resolves with validated plan on HTTP 200 JSON response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => DEMO_WEDDING_PLAN,
    });

    const plan = await requestEventPlan({
      eventType: 'wedding',
      guestCount: 120,
      totalBudget: 32000,
      vibe: 'romantic-elegant',
    });

    expect(plan.event_name).toBe(DEMO_WEDDING_PLAN.event_name);
    expect(plan.total_budget).toBe(32000);
  });

  it('throws ApiError with message on HTTP error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Guest count must be between 1 and 50000.' }),
    });

    await expect(
      requestEventPlan({
        eventType: 'wedding',
        guestCount: -1,
        totalBudget: 10000,
        vibe: 'romantic-elegant',
      })
    ).rejects.toThrow(ApiError);
  });

  it('throws ApiError on invalid schema structure returned by server', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ corrupted_data: true }),
    });

    await expect(
      requestEventPlan({
        eventType: 'wedding',
        guestCount: 100,
        totalBudget: 25000,
        vibe: 'romantic-elegant',
      })
    ).rejects.toThrow('Server returned an invalid plan structure.');
  });
});
