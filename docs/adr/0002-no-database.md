# ADR-0002: No Database — Stateless Ephemeral Architecture

## Status

Accepted

## Date

2026-09-15

## Context

Event planning details frequently contain sensitive personal data (private guest attendance, personal finances, intimate dates, private venue addresses). We need an architectural persistence strategy that maximizes privacy and eliminates infrastructure overhead.

## Decision Drivers

- **Privacy by design** — user event budgets, guest counts, and special notes must never be stored on a remote server.
- **Zero infrastructure overhead** — no database maintenance, no migration scripts, no connection pools.
- **Attack surface reduction** — eliminate centralized database breach vectors.
- **Turnkey deployment** — deployed statically with a single stateless serverless function.
- **Data exportability** — users retain full ownership of their data via 1-click Markdown / printable export.

## Considered Options

### Option 1: No database (chosen)
- Planning state lives in React state / ephemeral in-memory session cache.
- Nothing written to disk or database on the server.
- Privacy guarantee is structural rather than an unenforceable policy.

### Option 2: Server-side Redis / Key-Value store
- Temporary session caching on server.
- **Rejected**: adds cost, operational failure modes, and potential cross-tenant leakage.

### Option 3: Persistent Relational Database (PostgreSQL, Supabase)
- **Rejected**: requires user auth, schema migrations, and persistent storage of personal event data, violating zero-overhead constraints.

## Decision

**No database.** All state is strictly ephemeral:
- Event parameters reside in React state.
- Generated plans are held in ephemeral browser memory (`Map<string, PlanResult>`).
- Serverless function (`/api/plan`) is completely stateless.
- Users export their dossier via Markdown or browser print.

## Consequences

### Positive
- Zero database hosting or maintenance costs.
- Structural privacy guarantee: no customer data is ever retained on disk.
- Frictionless immediate usage: no account registration or passwords required.

### Negative
- Closing the browser tab clears the current session unless exported.

### Risks
- Serverless platform logs capturing request parameters — mitigated by redacting all sensitive user inputs and logging only operational metadata.

## Related ADRs

- ADR-0003: Dual Pipeline
- ADR-0006: In-Memory Context Switch Session Caching
