import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanner, useEvidence } from '../src/hooks/usePlanner';
import { DEMO_WEDDING_PLAN, DEMO_BIRTHDAY_PLAN } from '../src/lib/providers/demoData';

describe('usePlanner Hook — State & Engine Integration', () => {
  it('initializes safely when initialPlan is null', () => {
    const { result } = renderHook(() => usePlanner(null));

    expect(result.current.plan).toBeNull();
    expect(result.current.activeTab).toBe('overview');
    expect(result.current.checkedTaskIds.size).toBe(0);
    expect(result.current.customBudget).toBeNull();
    expect(result.current.reconciledBudget).toBeNull();
    expect(result.current.timelineCheck).toBeNull();
    expect(result.current.checklistProgress).toBeNull();
    expect(result.current.exportMarkdown()).toBe('');
  });

  it('computes initial budget reconciliation, timeline checks, and progress from plan', () => {
    const { result } = renderHook(() => usePlanner(DEMO_WEDDING_PLAN));

    expect(result.current.plan).toEqual(DEMO_WEDDING_PLAN);
    expect(result.current.reconciledBudget).toBeDefined();
    expect(result.current.reconciledBudget?.totalBudget).toBe(DEMO_WEDDING_PLAN.total_budget);
    expect(result.current.timelineCheck?.isChronological).toBe(true);
    expect(result.current.checklistProgress?.totalTasks).toBeGreaterThan(0);
    expect(result.current.checklistProgress?.completedTasks).toBe(0);
  });

  it('handles tab switching across all dashboard sections', () => {
    const { result } = renderHook(() => usePlanner(DEMO_WEDDING_PLAN));

    expect(result.current.activeTab).toBe('overview');

    act(() => {
      result.current.setActiveTab('budget');
    });
    expect(result.current.activeTab).toBe('budget');

    act(() => {
      result.current.setActiveTab('vendors');
    });
    expect(result.current.activeTab).toBe('vendors');

    act(() => {
      result.current.setActiveTab('ideas');
    });
    expect(result.current.activeTab).toBe('ideas');
  });

  it('toggles task IDs and accurately updates checklist progress percentage', () => {
    const { result } = renderHook(() => usePlanner(DEMO_WEDDING_PLAN));

    const firstTaskId = DEMO_WEDDING_PLAN.vendor_checklists[0].checklist_items[0].id;

    act(() => {
      result.current.toggleTask(firstTaskId);
    });

    expect(result.current.checkedTaskIds.has(firstTaskId)).toBe(true);
    expect(result.current.checklistProgress?.completedTasks).toBe(1);

    // Toggle off
    act(() => {
      result.current.toggleTask(firstTaskId);
    });

    expect(result.current.checkedTaskIds.has(firstTaskId)).toBe(false);
    expect(result.current.checklistProgress?.completedTasks).toBe(0);
  });

  it('dynamically recalculates budget when customBudget is simulated', () => {
    const { result } = renderHook(() => usePlanner(DEMO_WEDDING_PLAN));

    act(() => {
      result.current.setCustomBudget(45000);
    });

    expect(result.current.customBudget).toBe(45000);
    expect(result.current.reconciledBudget?.totalBudget).toBe(45000);
    expect(result.current.reconciledBudget?.contingencyAmount).toBeGreaterThan(0);
  });

  it('resets checked tasks and custom budget when a new plan is provided', () => {
    const { result } = renderHook(() => usePlanner(DEMO_WEDDING_PLAN));

    act(() => {
      result.current.setCustomBudget(50000);
      result.current.toggleTask('some-task-id');
    });

    expect(result.current.customBudget).toBe(50000);
    expect(result.current.checkedTaskIds.size).toBe(1);

    // Switch plan to Birthday
    act(() => {
      result.current.updatePlan(DEMO_BIRTHDAY_PLAN);
    });

    expect(result.current.plan).toEqual(DEMO_BIRTHDAY_PLAN);
    expect(result.current.customBudget).toBeNull();
    expect(result.current.checkedTaskIds.size).toBe(0);
    expect(result.current.reconciledBudget?.totalBudget).toBe(DEMO_BIRTHDAY_PLAN.total_budget);
  });

  it('exports valid markdown document with all key sections', () => {
    const { result } = renderHook(() => usePlanner(DEMO_WEDDING_PLAN));

    const markdown = result.current.exportMarkdown();
    expect(markdown).toContain(DEMO_WEDDING_PLAN.event_name);
    expect(markdown).toContain('## Executive Summary');
    expect(markdown).toContain('## Itemized Budget Breakdown');
    expect(markdown).toContain('## Day-of Run of Show');
  });

  it('provides legacy useEvidence alias for backward compatibility', () => {
    const res = useEvidence(null, null);
    expect(res).toEqual({ evidenceMap: {} });
  });
});
