# Planora — Architecture

## System Overview

**Shape:** Static SPA + one stateless serverless function + Gemini. No database, no auth, no microservices.

```
User Browser
  ├─ Event Configurator (Type, Guests, Budget, Vibe, Requests)
  ├─ POST /api/plan  →  Serverless function  →  Gemini API (gemini-2.5-flash)
  │    Response: schema-validated structured plan JSON
  └─ Client-side Deterministic Engine (budget reconciliation, timeline ordering, checklist tracking, live simulator)
```

---

## Two Independent Pipelines

### Pipeline A — AI Synthesis (server-side)
```
Event Parameters (Type, Guests, Budget, Vibe, Custom Notes)
  → /api/plan
  → Input sanitization & prompt breakout defense
  → Gemini 2.5 Flash API (system instruction isolation, responseSchema)
  → Ajv schema validation & sanitization
  → return validated PlanResult JSON
```

### Pipeline B — Deterministic Planning & Simulation Engine (client-side only)
```
Validated Plan Object (in-memory, never stored on database)
  → reconcileBudget() (verifies allocated_amount sum + contingency == total_budget)
  → verifyTimelineChronology() (parses timestamps, checks chronological ordering & rollover)
  → calculateChecklistProgress() (tracks critical tasks & category completion)
  → Interactive Budget Trade-Off Simulator (instant dynamic reallocation without network roundtrips)
  → exportPlanAsMarkdown() (generates clean printable/copyable run-of-show dossier)
```

Pipeline B **never sends data back to a server**. This guarantees sub-millisecond interactivity for sliders and task checkboxes while ensuring complete user privacy.

---

## Key Technical Decisions

See `docs/adr/` for full ADRs.

| Decision | Choice | Key Reason |
|---|---|---|
| Frontend stack | Vite + React + TypeScript | Ecosystem, strict type safety, fast HMR |
| No database | Stateless ephemeral | Privacy, zero infra overhead, hackathon scope |
| AI synthesis | Gemini 2.5 Flash (`@google/genai`) | High reasoning capability, native structured output, rapid synthesis |
| Schema enforcement | `responseSchema` + `Ajv` | Dual structural guarantee preventing hallucinatory field corruption |
| Budget accuracy | Computed & reconciled client-side | Deterministic mathematics guarantees zero budget arithmetic hallucinations |
| In-memory caching | Session scoped `Map<string, PlanResult>` | Instant context switching between event scenarios without redundant AI calls |
| Styling architecture | Vanilla CSS + CSS Modules | Zero runtime overhead, strict encapsulation, custom CSS token system |

---

## Repository Structure

```
planora/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   ├── plannerEngine.ts     (Pipeline B deterministic calculation engine)
│   │   ├── schema.ts            (JSON Schema + Ajv validator)
│   │   ├── domain.ts            (typed EventTypeId, VibeId, VendorCategoryId)
│   │   ├── api.ts               (client-side API caller)
│   │   └── providers/           (AIProvider interface, GeminiProvider, DemoProvider, demoData)
│   ├── hooks/
│   │   └── usePlanner.ts        (interactive planning hook)
│   └── components/
│       ├── landing/             (LandingScreen event configurator)
│       ├── context/             (EventContextSelector modal)
│       └── dashboard/           (LeftPane, RightPane, ContextBar, GuidedActions, TwoPaneLayout)
├── api/
│   ├── analyze.ts               (Vercel serverless function)
│   └── plan.ts                  (Vercel serverless route)
├── tests/
│   ├── schema.test.ts           (Ajv schema validation tests)
│   ├── plannerEngine.test.ts    (budget reconciliation & timeline tests)
│   ├── promptInjection.test.ts  (prompt injection resilience tests)
│   ├── analyzeServer.test.ts    (serverless handler tests)
│   ├── demoData.test.ts         (demo plan integrity tests)
│   └── components.test.tsx      (React integration tests)
└── docs/
    ├── ARCHITECTURE.md          (this file)
    ├── RISKS.md                 (event planning risk analysis)
    └── adr/                     (Architecture Decision Records)
```

---

## Security Model

See `docs/adr/` and inline comments in `api/analyze.ts`.

| Threat | Mitigation |
|---|---|
| Prompt injection in event inputs | Inputs are sanitized (angle brackets stripped), length-capped, and isolated inside `<EVENT_DATA>` tags. |
| XSS vulnerability | No `dangerouslySetInnerHTML`; all AI output renders through React's default text node escaping. |
| API key exposure | Key lives exclusively in serverless environment variables (`process.env.GEMINI_API_KEY`), never in client code. |
| Denial of service / huge payloads | Parameter bounds: max budget $25M, max guests 50,000, notes max 1,000 characters. |
| Sensitive information leakage | Server logs record only operational metadata (latency, status, event type) — never user prompts or personal notes. |
| Session persistence | Purely stateless: no database, no session IDs, all data resides in ephemeral browser memory. |
