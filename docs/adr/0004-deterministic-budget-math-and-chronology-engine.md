# ADR-0004: Deterministic Budget Math & Chronology Engine

## Status

Accepted

## Date

2026-09-15

## Context

Event planners require exact arithmetic budgeting and reliable chronological run-of-shows. LLMs frequently generate slightly inconsistent sums or misorder late-night schedules (e.g., treating 12:00 AM as occurring before 11:00 PM). We need a deterministic client engine to verify and reconcile both dimensions.

## Decision Drivers

- **Zero budget discrepancies** — category totals plus contingency must equal the target budget.
- **Explicit contingency protection** — contingency reserves (8–12%) must be isolated from category allocations so surprise expenses never induce panic.
- **Chronological timeline verification** — Day-of schedules must flow sequentially from morning setup to late-night conclusion, properly handling post-midnight rollovers.
- **Instant simulation** — user adjustments to total budget or category shares must recalculate immediately in the browser.

## Considered Options

### Option 1: Client-Side Deterministic Engine (chosen)
- Pure mathematical reconciliation functions in `src/lib/plannerEngine.ts`.
- Validates that `allocated_amount` sum + `contingency_fund.amount` matches `total_budget` within 1.5%.
- Parses 12-hour timestamps ("09:00 AM", "12:00 AM") and flags sequence reversals or time overlaps.
- Rescales categories proportionately when users adjust the simulated budget slider.

### Option 2: Server-side validation
- Sends adjustments back to the server for re-calculation.
- **Rejected**: introduces noticeable lag and requires network connectivity for what is fundamentally basic arithmetic.

## Decision

Implement `src/lib/plannerEngine.ts` as a pure, deterministic engine:
1. `reconcileBudget`: computes overall committed sums, calculates variance percentage, checks contingency thresholds, and outputs health status (`optimized`, `balanced`, `caution`, `overbudget`).
2. `verifyTimelineChronology`: parses time strings to minutes from midnight, applies late-night rollover detection, and identifies sequencing errors.
3. `rescaleBudgetCategories`: recomputes allocations on slider adjustments while safeguarding the contingency reserve.

## Consequences

### Positive
- Zero mathematical hallucinations reach the user interface.
- 60 FPS slider reactivity during budget trade-off exploration.
- 100% testable with pure Vitest unit tests.

### Negative
- Math algorithms must be strictly maintained in tandem with schema types.

## Related ADRs

- ADR-0003: Dual Pipeline
- ADR-0005: Schema-First Validation
