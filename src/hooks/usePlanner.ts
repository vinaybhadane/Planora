/**
 * usePlanner.ts — Custom React hook for client-side event planning operations.
 *
 * Powers Pipeline B:
 * - Deterministic budget reconciliation
 * - Day-of timeline chronology verification
 * - Interactive vendor checklist progression
 * - Markdown export generation
 */

import { useState, useMemo, useCallback } from 'react';
import type { PlanResult } from '../lib/schema';
import {
  reconcileBudget,
  verifyTimelineChronology,
  calculateChecklistProgress,
  exportPlanAsMarkdown,
  type BudgetReconciliationResult,
  type TimelineSequenceCheck,
  type ChecklistProgress,
} from '../lib/plannerEngine';

export type DashboardTab =
  | 'overview'
  | 'budget'
  | 'timeline'
  | 'vendors'
  | 'ideas'
  | 'questions';

export function usePlanner(initialPlan: PlanResult | null) {
  const [plan, setPlan] = useState<PlanResult | null>(initialPlan);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [checkedTaskIds, setCheckedTaskIds] = useState<Set<string>>(new Set());
  const [customBudget, setCustomBudget] = useState<number | null>(null);

  // Sync state if new plan passed in
  const updatePlan = useCallback((newPlan: PlanResult | null) => {
    setPlan(newPlan);
    setCheckedTaskIds(new Set());
    setCustomBudget(null);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setCheckedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const reconciledBudget: BudgetReconciliationResult | null = useMemo(() => {
    if (!plan) return null;
    return reconcileBudget(plan, customBudget ?? plan.total_budget);
  }, [plan, customBudget]);

  const timelineCheck: TimelineSequenceCheck | null = useMemo(() => {
    if (!plan) return null;
    return verifyTimelineChronology(plan.day_of_timeline);
  }, [plan]);

  const checklistProgress: ChecklistProgress | null = useMemo(() => {
    if (!plan) return null;
    return calculateChecklistProgress(plan.vendor_checklists, checkedTaskIds);
  }, [plan, checkedTaskIds]);

  const exportMarkdown = useCallback(() => {
    if (!plan) return '';
    return exportPlanAsMarkdown(plan);
  }, [plan]);

  return {
    plan,
    updatePlan,
    activeTab,
    setActiveTab,
    checkedTaskIds,
    toggleTask,
    customBudget,
    setCustomBudget,
    reconciledBudget,
    timelineCheck,
    checklistProgress,
    exportMarkdown,
  };
}

// Backward compatibility alias for any existing code
export const useEvidence = (_file: unknown, _result: unknown) => {
  return { evidenceMap: {} };
};
