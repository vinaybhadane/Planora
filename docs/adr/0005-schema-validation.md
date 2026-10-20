# ADR-0005: Schema-First Validation with Ajv + response_json_schema

## Status

Accepted

## Date

2026-09-15

## Context

Gemini's structured event planning output must be validated before it reaches the frontend. The validation must be structural (schema-enforced), not prompt-based. Unvalidated or partially-validated model output reaching the frontend is a security and product-correctness failure.

## Decision Drivers

- **Schema-level enforcement is strictly stronger than prompt instruction** — LLMs may deviate from text instructions; JSON Schema is enforced structurally by Gemini's generation engine.
- **Malformed output must never reach the frontend** — the frontend's contract is "every field present matches the schema exactly".
- **Zero hallucinations in budget math & categorization** — schema defines mandatory fields for budget items, timelines, vendor checklists, and contingency reserves.
- **Defense in depth** — validation occurs at the model output level (`responseSchema`) and is re-verified server-side using `Ajv`.

## Considered Options

### Option 1: Ajv on server + response_json_schema on model call (chosen)
- `responseSchema` constrains structure at the Gemini API level.
- Ajv validates the parsed response before returning to the client.
- Malformed output is rejected cleanly with classified error codes.

### Option 2: Zod on server
- **Not chosen**: Zod is excellent, but JSON Schema is the native format for Gemini's structured output; maintaining two schema representations is redundant and error-prone.

### Option 3: TypeScript-only (compile-time)
- **Rejected**: TypeScript types disappear at runtime and provide zero protection against malformed model responses.

## Decision

**Single source of truth: `PLAN_SCHEMA` defined in `src/lib/schema.ts`.**

- Schema is exported as a JSON Schema object conforming to standard draft validation specifications.
- Used natively in the Gemini `responseSchema` configuration.
- Server validates with Ajv immediately upon model response.
- Frontend receives only validated, schema-conformant `PlanResult` objects.

## Schema Design Principles

- `additionalProperties: false` is strictly applied across all objects to prevent prompt injection payload leakage.
- Numerical fields (`guest_count`, `total_budget`, `allocated_amount`, `percentage`) enforce strict non-negative bounds.
- Categorical fields (event types, vibes, effort levels, priorities) enforce strict enums.

## Consequences

### Positive
- Double-layer schema enforcement (API-level + Ajv) eliminates parsing failures.
- Frontend components can safely render structured data without defensive optional chaining.
- Schema is fully testable in isolation (`schema.test.ts`).

### Negative
- Modifying plan attributes requires updating the JSON Schema and TypeScript interfaces in tandem.

## Related ADRs

- ADR-0003: Dual Pipeline
- ADR-0004: Deterministic Budget Math & Chronology Engine
