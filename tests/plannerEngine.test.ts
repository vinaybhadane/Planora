/**
 * plannerEngine.test.ts
 *
 * Tests for Pipeline B deterministic calculation engine:
 * - Budget mathematical reconciliation & variance checks
 * - Dynamic category rescaling
 * - Timeline chronology parsing & ordering verification
 * - Milestone dependency resolution
 * - Checklist completion calculations
 * - Markdown export generation
 */

import { describe, expect, it } from 'vitest';
import {
  reconcileBudget,
  rescaleBudgetCategories,
  parseTimeToMinutes,
  verifyTimelineChronology,
  verifyMilestoneDependencies,
  calculateChecklistProgress,
  exportPlanAsMarkdown,
} from '../src/lib/plannerEngine';
import { DEMO_WEDDING_PLAN, DEMO_BIRTHDAY_PLAN } from '../src/lib/providers/demoData';

describe('plannerEngine — Budget Reconciliation', () => {
  it('correctly reconciles balanced budget in DEMO_WEDDING_PLAN', () => {
    const res = reconcileBudget(DEMO_WEDDING_PLAN);
    expect(res.totalBudget).toBe(32000);
    expect(res.contingencyAmount).toBe(3200);
    expect(res.isMathAccurate).toBe(true);
    expect(['optimized', 'balanced']).toContain(res.status);
  });

  it('detects overbudget state when allocation exceeds target', () => {
    const overallocatedPlan = {
      ...DEMO_WEDDING_PLAN,
      total_budget: 20000, // actual categories sum to >28000
    };
    const res = reconcileBudget(overallocatedPlan);
    expect(res.status).toBe('overbudget');
    expect(res.warnings.some(w => w.includes('Allocations exceed'))).toBe(true);
  });

  it('warns when contingency buffer is less than 5%', () => {
    const lowContingencyPlan = {
      ...DEMO_WEDDING_PLAN,
      contingency_fund: {
        percentage: 3,
        amount: 960,
        rationale: 'Too low buffer',
      },
    };
    const res = reconcileBudget(lowContingencyPlan);
    expect(res.warnings.some(w => w.includes('recommended 8-12% buffer'))).toBe(true);
  });

  it('rescales category amounts when user scales total budget', () => {
    const scaled = rescaleBudgetCategories(DEMO_WEDDING_PLAN.budget_breakdown, 50000, 10);
    const sum = scaled.reduce((acc, cat) => acc + cat.allocated_amount, 0);
    // 90% of 50000 = 45000
    expect(sum).toBeCloseTo(45000, -2);
  });
});

describe('plannerEngine — Timeline Sequencing', () => {
  it('parses 12h time strings to minutes from midnight', () => {
    expect(parseTimeToMinutes('08:00 AM')).toBe(480);
    expect(parseTimeToMinutes('12:00 PM')).toBe(720);
    expect(parseTimeToMinutes('01:30 PM')).toBe(810);
    expect(parseTimeToMinutes('11:59 PM')).toBe(1439);
    expect(parseTimeToMinutes('12:00 AM')).toBe(0);
  });

  it('verifies chronological order in DEMO_WEDDING_PLAN', () => {
    const check = verifyTimelineChronology(DEMO_WEDDING_PLAN.day_of_timeline);
    expect(check.isChronological).toBe(true);
    expect(check.issues.length).toBe(0);
  });

  it('flags out-of-order milestones in day-of timeline', () => {
    const shuffled = [
      { id: '1', time: '05:00 PM', activity: 'Dinner', lead_responsible: 'Lead', notes: '' },
      { id: '2', time: '11:00 AM', activity: 'Breakfast', lead_responsible: 'Lead', notes: '' },
    ];
    const check = verifyTimelineChronology(shuffled);
    expect(check.isChronological).toBe(false);
    expect(check.issues.length).toBeGreaterThan(0);
  });

  it('verifies milestone dependency graph', () => {
    const validPhases = [
      {
        id: 'p1',
        phase_name: 'Phase 1',
        milestones: [{ id: 'm1', title: 'Task 1', due_window: 'W1', importance: 'critical' as const }],
      },
      {
        id: 'p2',
        phase_name: 'Phase 2',
        milestones: [
          {
            id: 'm2',
            title: 'Task 2',
            due_window: 'W2',
            importance: 'critical' as const,
            dependencies: ['m1'],
          },
        ],
      },
    ];
    const check = verifyMilestoneDependencies(validPhases);
    expect(check.valid).toBe(true);

    const invalidPhases = [
      {
        id: 'p1',
        phase_name: 'Phase 1',
        milestones: [
          {
            id: 'm2',
            title: 'Task 2',
            due_window: 'W2',
            importance: 'critical' as const,
            dependencies: ['m-unresolved'],
          },
        ],
      },
    ];
    const checkInvalid = verifyMilestoneDependencies(invalidPhases);
    expect(checkInvalid.valid).toBe(false);
    expect(checkInvalid.missingDependencies.length).toBe(1);
  });
});

describe('plannerEngine — Vendor Checklist Progress', () => {
  it('computes completion percentage accurately', () => {
    const checked = new Set(['vc-1', 'vc-4']);
    const stats = calculateChecklistProgress(DEMO_WEDDING_PLAN.vendor_checklists, checked);

    expect(stats.completedTasks).toBe(2);
    expect(stats.totalTasks).toBeGreaterThan(5);
    expect(stats.percentComplete).toBeGreaterThan(0);
    expect(stats.categoryBreakdown['venue']).toBeDefined();
  });
});

describe('plannerEngine — Markdown Export', () => {
  it('formats entire plan into clean Markdown dossier', () => {
    const md = exportPlanAsMarkdown(DEMO_BIRTHDAY_PLAN);
    expect(md).toContain('# Neon Nostalgia');
    expect(md).toContain('## Itemized Budget Breakdown');
    expect(md).toContain('## Day-of Run of Show');
    expect(md).toContain('## Vendor Checklists');
    expect(md).toContain('Contract Clauses to Watch');
  });
});
