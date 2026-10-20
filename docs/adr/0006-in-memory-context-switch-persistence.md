# ADR-0006: In-Memory Context Switch Session Caching

## Status

Accepted

## Date

2026-09-18

## Context

When users explore and compare different event configurations (e.g., comparing a $25,000 Wedding plan versus a $35,000 Gala plan, or switching between aesthetic vibes), repeated requests to the Gemini API introduce latency and consume quota. 

We need a session-scoped caching mechanism that enables instant switching between previously synthesized event plans while strictly adhering to the stateless, privacy-first constraints of ADR-0002.

## Decision Drivers

- **Zero persistent storage across browser sessions**: strictly avoid `localStorage`, `sessionStorage`, cookies, or remote databases as mandated by ADR-0002.
- **Instant context switching**: switching back to an already-generated event scenario must load in 0ms without redundant network requests.
- **Cache key precision**: cache keys must account for event type, guest count, budget, and aesthetic vibe (`${type}:${guestCount}:${budget}:${vibe}`).
- **Stateless lifecycle**: closing the tab automatically purges all in-memory plans, leaving zero residual footprint.

## Considered Options

### Option 1: In-Memory Ephemeral Map in App State (chosen)
- `sessionPlanCache = new Map<string, PlanResult>()` declared at module scope in `src/App.tsx`.
- Successfully generated plans are stored by a composite hash key.
- Context switching checks the cache first; hits render instantaneously.
- Zero data written to disk or browser storage APIs.

### Option 2: Browser Storage (`localStorage` / `sessionStorage`)
- **Rejected**: leaves unencrypted personal event data in browser storage across sessions; violates ADR-0002.

### Option 3: Server-side Redis / Memcached
- **Rejected**: introduces infrastructure costs and network overhead for single-user ephemeral sessions.

## Decision

Adopt **Option 1: In-memory session cache (`Map<string, PlanResult>`)**:
- Keys: `${eventType}:${guestCount}:${totalBudget}:${vibe}`.
- Cache hits bypass network requests entirely.
- Cache misses trigger live synthesis via `GeminiProvider` (or fallback to `DemoProvider`).
- Full compliance with ADR-0002: memory is purged on tab close.

## Consequences

### Positive
- Sub-millisecond context switching between previously generated event scenarios.
- Conserves Gemini API quota and avoids rate-limit exhaustion.
- Absolute privacy: no data persists beyond the browser session lifecycle.

### Negative
- Refreshing the browser clears the cache, requiring re-synthesis unless exported.

## Related ADRs

- ADR-0002: No Database — Stateless Ephemeral Architecture
- ADR-0003: Dual Pipeline
