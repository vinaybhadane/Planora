/**
 * demoData.test.ts
 *
 * Validates that all turnkey demo plans:
 * 1. Meet the PLAN_SCHEMA validation requirements 100%.
 * 2. Satisfy mathematical budget reconciliation (within 1.5% variance).
 * 3. Have strictly chronological day-of timelines.
 */

import { describe, expect, it } from 'vitest';
import { validateAndSanitizePlan } from '../src/lib/schema';
import { DEMO_PLANS_BY_TYPE } from '../src/lib/providers/demoData';
import { reconcileBudget, verifyTimelineChronology } from '../src/lib/plannerEngine';

describe('Demo Data Schema & Mathematical Integrity', () => {
  const eventTypes = Object.keys(DEMO_PLANS_BY_TYPE) as (keyof typeof DEMO_PLANS_BY_TYPE)[];

  for (const eventType of eventTypes) {
    const plan = DEMO_PLANS_BY_TYPE[eventType];

    it(`validates schema conformance for ${eventType} demo plan`, () => {
      const res = validateAndSanitizePlan(plan);
      expect(res.valid).toBe(true);
      expect(res.plan).toBeDefined();
      expect(res.errors).toBeUndefined();
    });

    it(`verifies budget mathematical reconciliation for ${eventType}`, () => {
      const reconciliation = reconcileBudget(plan);
      expect(reconciliation.isMathAccurate).toBe(true);
      expect(reconciliation.contingencyAmount).toBeGreaterThan(0);
      expect(reconciliation.totalBudget).toBe(plan.total_budget);
    });

    it(`verifies chronological day-of timeline ordering for ${eventType}`, () => {
      const check = verifyTimelineChronology(plan.day_of_timeline);
      expect(check.isChronological).toBe(true);
      expect(check.issues).toHaveLength(0);
    });
  }
});
