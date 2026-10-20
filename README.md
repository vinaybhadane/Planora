# Planora

**GenAI-Powered Planning Assistant for Events & Celebrations**

An intelligent event planning assistant that helps users organize **weddings, milestone birthdays, and community festivals** with mathematical budgets, hour-by-hour run-of-shows, vendor contract checklists, and personalized creative concepts.

---

## What It Does

Select an event type, specify guest count, target budget, and aesthetic vibe, and Planora:

1. **Synthesizes a Complete Plan** using Gemini 2.5 Flash with native JSON Schema enforcement
2. **Reconciles Budgets Mathematically** with client-side verification ensuring category allocations and an explicit 8–12% contingency reserve equal the total budget
3. **Builds Phased Timelines & Day-of Schedules** featuring chronological milestone validation and hour-by-hour run-of-shows with lead vendor assignments
4. **Tracks Vendor Checklists & Contract Watchouts** surfacing pre-emptive warnings for hidden overtime fees, noise curfews, and weather contingency clauses
5. **Generates Tailored Creative Ideas & Themes** including curated hex-color palettes, signature guest touches, and effort-rated activity concepts
6. **Provides Contextual Simulation & Export Tools** (10% budget trade-off simulator, vendor interview question copy, printable run-of-show)

**Planora provides informational frameworks and estimates. Always verify actual vendor quotes, permits, and venue policies before signing binding agreements.**

---

## Quick Start

### Prerequisites

- Node.js 22+
- A Gemini API key (see [Google AI Studio](https://aistudio.google.com))

### Setup

```bash
git clone https://github.com/your-username/planora.git
cd planora
npm install
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here
npm run dev
```

The app runs at `http://localhost:5173`. Without an API key, you can click **"Explore Pre-Configured Turnkey Demos"** to test it instantly with three full production examples:
- 💒 **Vineyard Harmony Wedding** (120 Guests • $32,000 • Napa Valley Estate)
- 🎂 **Neon Nostalgia 30th Birthday** (45 Guests • $6,500 • Skyline Rooftop)
- 🎪 **Sunset Green Community Festival** (350 Attendees • $14,000 • Public City Park)

Live custom event synthesis (with an API key) supports custom event names, guest counts up to 50,000, budgets up to $25,000,000, and customized vibes.

---

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design.

**Key design decisions:**
- **No database** — all state is ephemeral and in-memory. Personal event details and guest data never persist to a remote server.
- **In-memory session cache** — a session-scoped context cache (`Map<string, PlanResult>`) optimizes repeated context switching between event scenarios without redundant AI calls.
- **Dual pipeline** — Gemini synthesis (Pipeline A, serverless) and mathematical budget/timeline validation (Pipeline B, client-side) are fully decoupled.
- **Budget math is verified, not assumed** — the client-side engine reconciles allocations and guarantees zero hallucinated math discrepancies.
- **Turnkey demo isolation** — offline demo plans operate with zero network requests or API key dependencies.

---

## Development

```bash
npm run test          # run all unit and integration tests (Vitest)
npm run typecheck     # TypeScript type checking (tsc -p tsconfig.app.json & tsconfig.node.json)
npm run lint          # lint src, tests, api (oxlint)
npm run build         # production build (tsc -b && vite build)
```

---

## Repository Structure

```
planora/
├── src/
│   ├── lib/
│   │   ├── plannerEngine.ts     ← deterministic budget math & timeline validator (Pipeline B)
│   │   ├── schema.ts            ← JSON Schema + Ajv validator (Pipeline A/B contract)
│   │   ├── domain.ts            ← typed EventTypeId, VibeId, and VendorCategoryId
│   │   ├── api.ts               ← client-side API caller
│   │   └── providers/           ← AIProvider interface, GeminiProvider, DemoProvider & demoData
│   ├── hooks/
│   │   └── usePlanner.ts        ← client planning state, checklist progression, budget simulator
│   └── components/
│       ├── landing/             ← LandingScreen configurator & demo showcase
│       ├── context/             ← EventContextSelector modal
│       ├── dashboard/           ← LeftPane, RightPane, ContextBar, GuidedActions, TwoPaneLayout
│       └── common/              ← Disclaimer & accessibility skip link
├── api/
│   ├── analyze.ts               ← Vercel serverless function (Pipeline A Gemini caller)
│   └── plan.ts                  ← /api/plan route alias
├── tests/
│   ├── schema.test.ts           ← JSON schema validation & bounds checking
│   ├── plannerEngine.test.ts    ← budget math, chronology, and checklist tests
│   ├── promptInjection.test.ts  ← input sanitization & prompt breakout defense
│   ├── analyzeServer.test.ts    ← serverless handler & rate limit classification
│   ├── providerIsolation.test.ts← offline demo isolation & live delegation
│   ├── demoData.test.ts         ← integrity verification across all demo plans
│   └── components.test.tsx      ← React integration tests
└── docs/
    ├── ARCHITECTURE.md          ← detailed architectural specification
    ├── RISKS.md                 ← event planning risk analysis & mitigations
    └── adr/                     ← Architecture Decision Records (0001 through 0006)
```

---

## Security Model

- **API key isolation** — Gemini API key lives strictly in serverless environment variables, never in the client bundle.
- **Prompt injection defense** — User text is isolated inside `<EVENT_DATA>` tags, angle brackets are sanitized, and strict length caps prevent breakout.
- **XSS prevention** — No `dangerouslySetInnerHTML`; all model text is rendered through React's default text escaping.
- **Structured output enforcement** — Gemini's `responseSchema` guarantees structurally validated JSON before reaching the client.
- **Redacted server logging** — Serverless logs record only operational metadata (status, latency), never personal event details or prompts.

---

## Disclaimer

Planora is an informational planning and coordination assistant. It does not provide legal, engineering, or licensed safety advice. Always review vendor contracts, insurance requirements, and local municipal permits with qualified professionals before signing agreements or transferring deposits.
