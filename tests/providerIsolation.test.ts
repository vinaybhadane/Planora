/**
 * providerIsolation.test.ts
 *
 * Verifies that:
 * 1. DemoProvider operates purely in-memory with zero network requests.
 * 2. DemoProvider accurately rescales budgets and custom event names.
 * 3. GeminiProvider routes calls through the API client.
 */

import { describe, expect, it, vi } from 'vitest';
import { DemoProvider, GeminiProvider } from '../src/lib/providers';
import * as apiModule from '../src/lib/api';
import { DEMO_WEDDING_PLAN } from '../src/lib/providers/demoData';

describe('Provider Isolation', () => {
  it('DemoProvider returns schema-valid data without making network calls', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const demo = new DemoProvider();

    const plan = await demo.generatePlan({
      eventType: 'birthday',
      guestCount: 50,
      totalBudget: 8000,
      vibe: 'modern-festive',
      eventName: 'Sarah\'s 30th Birthday',
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(plan.event_name).toBe('Sarah\'s 30th Birthday');
    expect(plan.event_type).toBe('birthday');
    expect(plan.total_budget).toBe(8000);
    expect(plan.guest_count).toBe(50);
  });

  it('GeminiProvider delegates to requestEventPlan', async () => {
    const apiSpy = vi.spyOn(apiModule, 'requestEventPlan').mockResolvedValue(DEMO_WEDDING_PLAN);
    const gemini = new GeminiProvider();

    const plan = await gemini.generatePlan({
      eventType: 'wedding',
      guestCount: 120,
      totalBudget: 32000,
      vibe: 'romantic-elegant',
    });

    expect(apiSpy).toHaveBeenCalledTimes(1);
    expect(plan.event_name).toBe(DEMO_WEDDING_PLAN.event_name);
  });
});
