# ADR-0003: Dual Pipeline — AI Synthesis + Deterministic Client Engine

## Status

Accepted

## Date

2026-09-15

## Context

LLMs excel at high-level reasoning, thematic creativity, and multi-variable synthesis, but are notoriously prone to arithmetic inaccuracies (hallucinating category sums that do not equal the requested total budget) and latency bottlenecks when interacting with UI sliders.

## Decision Drivers

- **Zero arithmetic hallucinations** — category allocations and contingency reserve must mathematically equal 100% of the total budget.
- **Sub-millisecond UI reactivity** — adjusting sliders or checking off vendor tasks cannot wait for a 5-second LLM API roundtrip.
- **Privacy boundary** — client-side simulation must never send modified budget scenarios back to external servers.

## Considered Options

### Option 1: Dual Pipeline (chosen)
- **Pipeline A (Serverless AI Synthesis)**: Gemini 2.5 Flash produces a structured, creative plan adhering to JSON schema.
- **Pipeline B (Client Deterministic Engine)**: Pure TypeScript functions verify budget sums, recalculate proportions on slider adjustments, check timeline chronology, and manage checklist completion states locally.

### Option 2: Pure LLM Engine (All actions route through Gemini)
- Every slider tweak or checklist toggle calls Gemini to regenerate.
- **Rejected**: unacceptable latency, excessive API cost, and high risk of arithmetic hallucinations.

### Option 3: Rule-Based Only (No GenAI)
- Pre-computed static templates.
- **Rejected**: lacks the flexibility, personalized creativity, and tailored theme synthesis demanded by the mission.

## Decision

Adopt the **Dual Pipeline Architecture**:
1. Pipeline A handles AI reasoning and structured plan generation.
2. Pipeline B takes ownership of mathematical integrity, timeline sequence validation, checklist progression, and interactive simulation.

## Consequences

### Positive
- Instant UI responsiveness for sliders and task checkboxes.
- Guaranteed arithmetic accuracy on all budget figures.
- Clear separation of concerns between AI creativity and mathematical truth.

### Negative
- Requires maintaining client-side reconciliation algorithms in sync with the schema definition.

## Related ADRs

- ADR-0004: Deterministic Budget Math & Chronology Engine
- ADR-0005: Schema-First Validation
