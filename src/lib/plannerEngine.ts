/**
 * plannerEngine.ts
 *
 * Deterministic Planning & Calculation Engine — Pipeline B Core.
 *
 * Verifies mathematical integrity, chronological sequencing, and checklist
 * progression locally in the browser without calling any server.
 *
 * THIS FILE NEVER SENDS DATA TO A SERVER. All operations are pure and in-memory.
 */

import type {
  PlanResult,
  BudgetCategory,
  BudgetItem,
  DayOfMilestone,
  VendorCategoryChecklist,
  TimelinePhase,
  ColorSwatch,
} from './schema.js';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BudgetHealthStatus = 'optimized' | 'balanced' | 'caution' | 'overbudget';

export interface BudgetReconciliationResult {
  status: BudgetHealthStatus;
  totalBudget: number;
  allocatedSum: number;
  contingencyAmount: number;
  unallocatedBuffer: number;
  variancePercentage: number;
  isMathAccurate: boolean;
  warnings: string[];
}

export interface TimelineSequenceCheck {
  isChronological: boolean;
  issues: string[];
}

export interface ChecklistProgress {
  totalTasks: number;
  completedTasks: number;
  criticalTotal: number;
  criticalCompleted: number;
  percentComplete: number;
  categoryBreakdown: Record<string, { total: number; completed: number; percent: number }>;
}

// ---------------------------------------------------------------------------
// 1. Budget Reconciliation & Verification Engine
// ---------------------------------------------------------------------------

/**
 * Validates that category allocations and contingency reserve mathematically
 * align with the total event budget.
 */
export function reconcileBudget(
  plan: PlanResult,
  customTotalBudget?: number
): BudgetReconciliationResult {
  const targetTotal = customTotalBudget ?? plan.total_budget;
  const warnings: string[] = [];

  const allocatedSum = plan.budget_breakdown.reduce(
    (acc: number, cat: BudgetCategory) => acc + (cat.allocated_amount || 0),
    0
  );


  const contingencyAmount = plan.contingency_fund?.amount || 0;
  const overallCommitted = allocatedSum + contingencyAmount;
  const unallocatedBuffer = targetTotal - overallCommitted;
  const variancePercentage = targetTotal > 0 ? (unallocatedBuffer / targetTotal) * 100 : 0;

  // Math accuracy check: overall sum should be within 1.5% of total budget
  const isMathAccurate = Math.abs(unallocatedBuffer) <= Math.max(10, targetTotal * 0.015);

  if (overallCommitted > targetTotal) {
    warnings.push(
      `Allocations exceed planned budget by ${plan.currency}${Math.round(overallCommitted - targetTotal).toLocaleString()}`
    );
  }

  if (plan.contingency_fund.percentage < 5) {
    warnings.push(
      `Contingency reserve (${plan.contingency_fund.percentage}%) is under the recommended 8-12% buffer.`
    );
  }

  let status: BudgetHealthStatus = 'balanced';
  if (overallCommitted > targetTotal * 1.02) {
    status = 'overbudget';
  } else if (overallCommitted > targetTotal) {
    status = 'caution';
  } else if (isMathAccurate && plan.contingency_fund.percentage >= 8) {
    status = 'optimized';
  }

  return {
    status,
    totalBudget: targetTotal,
    allocatedSum,
    contingencyAmount,
    unallocatedBuffer,
    variancePercentage,
    isMathAccurate,
    warnings,
  };
}

/**
 * Dynamically recalculates category amounts when user scales the total budget.
 */
export function rescaleBudgetCategories(
  categories: BudgetCategory[],
  newTotalBudget: number,
  _contingencyPercentage: number = 10
): BudgetCategory[] {
  return categories.map(cat => {
    const newAllocated = Math.round((cat.percentage / 100) * newTotalBudget);
    const itemScale = cat.allocated_amount > 0 ? newAllocated / cat.allocated_amount : 1;

    const scaledItems = (cat.items || []).map((item: BudgetItem) => ({
      ...item,
      estimated_cost: Math.round(item.estimated_cost * itemScale),
    }));


    return {
      ...cat,
      allocated_amount: newAllocated,
      items: scaledItems,
    };
  });
}

// ---------------------------------------------------------------------------
// 2. Timeline Chronology & Sequencing Engine
// ---------------------------------------------------------------------------

/**
 * Converts a time string like "09:00 AM", "2:30 PM", or "14:00" to minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3];

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Verifies that the day-of timeline activities are arranged in strict chronological order.
 * Handles late-night AM rollover (e.g., 12:00 AM concluding event after 11:00 PM).
 */
export function verifyTimelineChronology(milestones: DayOfMilestone[]): TimelineSequenceCheck {
  const issues: string[] = [];
  let prevMinutes = -1;

  for (let i = 0; i < milestones.length; i++) {
    const item = milestones[i];
    let minutes = parseTimeToMinutes(item.time);

    if (minutes === null) {
      continue;
    }

    // Handle late-night rollover (e.g. 12:00 AM midnight ending a late evening event)
    if (minutes < prevMinutes && prevMinutes >= 18 * 60 && minutes < 6 * 60) {
      minutes += 24 * 60;
    }

    if (minutes < prevMinutes) {
      issues.push(
        `Activity "${item.activity}" at ${item.time} occurs earlier than preceding milestone.`
      );
    }
    prevMinutes = minutes;
  }

  return {
    isChronological: issues.length === 0,
    issues,
  };
}

/**
 * Verifies timeline phase milestone dependencies.
 */
export function verifyMilestoneDependencies(phases: TimelinePhase[]): {
  valid: boolean;
  missingDependencies: string[];
} {
  const seenIds = new Set<string>();
  const missing: string[] = [];

  for (const phase of phases) {
    for (const milestone of phase.milestones) {
      if (milestone.dependencies) {
        for (const dep of milestone.dependencies) {
          if (!seenIds.has(dep)) {
            missing.push(`Milestone "${milestone.title}" depends on unresolved "${dep}"`);
          }
        }
      }
      seenIds.add(milestone.id);
    }
  }

  return {
    valid: missing.length === 0,
    missingDependencies: missing,
  };
}

// ---------------------------------------------------------------------------
// 3. Vendor Checklist Progress Engine
// ---------------------------------------------------------------------------

/**
 * Computes live checklist completion progress.
 */
export function calculateChecklistProgress(
  checklists: VendorCategoryChecklist[],
  checkedIds: Set<string>
): ChecklistProgress {
  let totalTasks = 0;
  let completedTasks = 0;
  let criticalTotal = 0;
  let criticalCompleted = 0;
  const categoryBreakdown: Record<string, { total: number; completed: number; percent: number }> =
    {};

  for (const group of checklists) {
    let catTotal = 0;
    let catCompleted = 0;

    for (const item of group.checklist_items) {
      totalTasks++;
      catTotal++;

      if (item.critical) criticalTotal++;

      if (checkedIds.has(item.id)) {
        completedTasks++;
        catCompleted++;
        if (item.critical) criticalCompleted++;
      }
    }

    categoryBreakdown[group.category_id] = {
      total: catTotal,
      completed: catCompleted,
      percent: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0,
    };
  }

  return {
    totalTasks,
    completedTasks,
    criticalTotal,
    criticalCompleted,
    percentComplete: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    categoryBreakdown,
  };
}

// ---------------------------------------------------------------------------
// 4. Export & Run-of-Show Formatter
// ---------------------------------------------------------------------------

/**
 * Exports the structured plan into a comprehensive, beautifully formatted Markdown document.
 */
export function exportPlanAsMarkdown(plan: PlanResult): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lines: string[] = [];

  lines.push(`# ${plan.event_name}`);
  lines.push(`*Generated on ${dateStr} by Planora AI Assistant*`);
  lines.push('');
  lines.push(
    `**Event Type:** ${plan.event_type} | **Guest Count:** ${plan.guest_count} | **Budget:** ${plan.currency}${plan.total_budget.toLocaleString()}`
  );
  lines.push('');
  lines.push('## Executive Summary');
  lines.push(plan.executive_summary);
  lines.push('');

  lines.push('## Theme & Aesthetic');
  lines.push(`**Theme:** ${plan.theme_and_vibe.theme_name}`);
  lines.push(
    `**Palette:** ${plan.theme_and_vibe.color_palette.map((c: ColorSwatch) => `${c.name} (${c.hex})`).join(', ')}`
  );
  lines.push(`**Signature Touch:** ${plan.theme_and_vibe.signature_touch}`);
  lines.push(`**Notes:** ${plan.theme_and_vibe.aesthetic_notes}`);
  lines.push('');

  lines.push('## Itemized Budget Breakdown');
  lines.push('| Category | Allocation | % of Total | Cost-Saving Tip |');
  lines.push('|---|---|---|---|');
  for (const cat of plan.budget_breakdown) {
    lines.push(
      `| ${cat.name} | ${plan.currency}${cat.allocated_amount.toLocaleString()} | ${cat.percentage}% | ${cat.cost_saving_tip} |`
    );
  }
  lines.push(
    `| **Contingency Fund** | **${plan.currency}${plan.contingency_fund.amount.toLocaleString()}** | **${plan.contingency_fund.percentage}%** | *${plan.contingency_fund.rationale}* |`
  );
  lines.push('');

  lines.push('## Day-of Run of Show');
  lines.push('| Time | Activity | Lead Lead/Vendor | Notes |');
  lines.push('|---|---|---|---|');
  for (const slot of plan.day_of_timeline) {
    lines.push(`| ${slot.time} | ${slot.activity} | ${slot.lead_responsible} | ${slot.notes} |`);
  }
  lines.push('');

  lines.push('## Vendor Checklists & Contract Watchouts');
  for (const group of plan.vendor_checklists) {
    lines.push(`### ${group.category_name}`);
    for (const item of group.checklist_items) {
      lines.push(
        `- [ ] **${item.task}** (Deadline: ${item.deadline})${item.critical ? ' *[CRITICAL]*' : ''}`
      );
    }
    if (group.contract_clauses_to_watch.length > 0) {
      lines.push('**Contract Clauses to Watch:**');
      for (const clause of group.contract_clauses_to_watch) {
        lines.push(`  - ⚠️ ${clause}`);
      }
    }
    lines.push('');
  }

  lines.push('## Creative Personalized Ideas');
  for (const idea of plan.personalized_ideas) {
    lines.push(
      `- **${idea.title}** [${idea.category} | ${idea.estimated_effort} effort]: ${idea.description}`
    );
  }
  lines.push('');

  lines.push('## Questions for Vendors');
  for (const q of plan.questions_for_vendors) {
    lines.push(`- ${q}`);
  }
  lines.push('');

  lines.push('## Risks & Contingencies');
  for (const r of plan.risks_and_mitigations) {
    lines.push(`- **[${r.severity.toUpperCase()}] ${r.risk}:** ${r.mitigation}`);
  }
  lines.push('');

  lines.push('---');
  lines.push(`*Disclaimer: ${plan.disclaimer}*`);

  return lines.join('\n');
}
