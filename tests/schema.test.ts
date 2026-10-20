/**
 * schema.test.ts
 *
 * Tests for the Ajv schema validator and PLAN_SCHEMA.
 *
 * Covers:
 * - Valid complete event plan objects → pass
 * - Missing required fields → fail
 * - Wrong field types & negative amounts → fail
 * - Invalid enum values → fail
 * - Extra unrecognized fields → rejected (additionalProperties: false)
 * - Nested item structures (color swatches, milestones, items)
 */

import { describe, expect, it } from 'vitest';
import { validateAndSanitizePlan } from '../src/lib/schema';
import { DEMO_WEDDING_PLAN } from '../src/lib/providers/demoData';

describe('PLAN_SCHEMA Validator', () => {
  it('passes a fully valid plan (DEMO_WEDDING_PLAN)', () => {
    const res = validateAndSanitizePlan(DEMO_WEDDING_PLAN);
    expect(res.valid).toBe(true);
    expect(res.plan).toBeDefined();
    expect(res.plan?.event_type).toBe('wedding');
    expect(res.errors).toBeUndefined();
  });

  it('fails when top-level required fields are missing', () => {
    const incomplete = { ...DEMO_WEDDING_PLAN };
    // @ts-expect-error testing missing property
    delete incomplete.executive_summary;

    const res = validateAndSanitizePlan(incomplete);
    expect(res.valid).toBe(false);
    expect(res.errors?.some(e => e.includes('executive_summary'))).toBe(true);
  });

  it('fails when budget_breakdown is missing', () => {
    const incomplete = { ...DEMO_WEDDING_PLAN };
    // @ts-expect-error testing missing property
    delete incomplete.budget_breakdown;

    const res = validateAndSanitizePlan(incomplete);
    expect(res.valid).toBe(false);
    expect(res.errors?.some(e => e.includes('budget_breakdown'))).toBe(true);
  });

  it('fails when guest count is zero or negative', () => {
    const invalid = { ...DEMO_WEDDING_PLAN, guest_count: 0 };
    const res = validateAndSanitizePlan(invalid);
    expect(res.valid).toBe(false);
  });

  it('fails when total_budget is zero or negative', () => {
    const invalid = { ...DEMO_WEDDING_PLAN, total_budget: -500 };
    const res = validateAndSanitizePlan(invalid);
    expect(res.valid).toBe(false);
  });

  it('fails when contingency percentage is negative', () => {
    const invalid = {
      ...DEMO_WEDDING_PLAN,
      contingency_fund: {
        percentage: -5,
        amount: 1000,
        rationale: 'Test',
      },
    };
    const res = validateAndSanitizePlan(invalid);
    expect(res.valid).toBe(false);
  });

  it('fails when an invalid enum is used in personalized ideas category', () => {
    const invalid = {
      ...DEMO_WEDDING_PLAN,
      personalized_ideas: [
        {
          id: 'pi-x',
          title: 'Invalid',
          description: 'Desc',
          category: 'invalid-category',
          estimated_effort: 'low',
        },
      ],
    };
    const res = validateAndSanitizePlan(invalid);
    expect(res.valid).toBe(false);
  });

  it('fails when an invalid enum is used in risk severity', () => {
    const invalid = {
      ...DEMO_WEDDING_PLAN,
      risks_and_mitigations: [
        {
          risk: 'Weather',
          mitigation: 'Tent',
          severity: 'catastrophic' as any,
        },
      ],
    };
    const res = validateAndSanitizePlan(invalid);
    expect(res.valid).toBe(false);
  });

  it('rejects additional unrecognized top-level properties', () => {
    const withExtra = {
      ...DEMO_WEDDING_PLAN,
      unexpected_ai_hallucination: 'should be rejected',
    };
    const res = validateAndSanitizePlan(withExtra);
    expect(res.valid).toBe(false);
  });

  it('rejects non-object inputs cleanly', () => {
    expect(validateAndSanitizePlan(null).valid).toBe(false);
    expect(validateAndSanitizePlan('string').valid).toBe(false);
    expect(validateAndSanitizePlan(12345).valid).toBe(false);
    expect(validateAndSanitizePlan([]).valid).toBe(false);
  });
});
