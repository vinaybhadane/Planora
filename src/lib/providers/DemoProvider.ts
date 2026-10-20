/**
 * DemoProvider.ts — Instant offline demo provider.
 *
 * Returns rich, schema-validated plans for Weddings, Birthdays, Community Events,
 * and Galas without requiring an API key or network access.
 */

import type { AIPlanningProvider, PlanGenerationParams } from './AIProvider';
import type { PlanResult } from '../schema';
import { DEMO_PLANS_BY_TYPE } from './demoData';
import { rescaleBudgetCategories } from '../plannerEngine';

export class DemoProvider implements AIPlanningProvider {
  async generatePlan(params: PlanGenerationParams, signal?: AbortSignal): Promise<PlanResult> {
    // Emulate realistic AI synthesis latency
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 350);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });

    const basePlan = DEMO_PLANS_BY_TYPE[params.eventType] ?? DEMO_PLANS_BY_TYPE.wedding;

    // Rescale budget if user specified a custom amount
    const targetBudget = params.totalBudget > 0 ? params.totalBudget : basePlan.total_budget;
    const contingencyPercentage = basePlan.contingency_fund.percentage;
    const contingencyAmount = Math.round((contingencyPercentage / 100) * targetBudget);

    const scaledCategories = rescaleBudgetCategories(
      basePlan.budget_breakdown,
      targetBudget,
      contingencyPercentage
    );

    return {
      ...basePlan,
      event_name: params.eventName?.trim() || basePlan.event_name,
      guest_count: params.guestCount > 0 ? params.guestCount : basePlan.guest_count,
      total_budget: targetBudget,
      budget_breakdown: scaledCategories,
      contingency_fund: {
        ...basePlan.contingency_fund,
        amount: contingencyAmount,
      },
    };
  }
}
