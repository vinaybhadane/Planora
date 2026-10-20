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

## Testing & Quality Assurance

Planora features an exhaustive automated testing suite with **90 passing tests across 18 test suites (100% pass rate)**:

```bash
npm run test          # run all 18 test suites (Vitest)
npm run test:coverage # run test suite with V8 code coverage report
npm run typecheck     # strict TypeScript verification (tsc -p tsconfig.app.json & tsconfig.node.json)
npm run lint          # lint src, tests, and api (oxlint, 0 warnings/0 errors)
npm run build         # verify production bundle build (sub-second compile)
```

### Test Suite Breakdown (18 Suites, 90 Tests)

1. `tests/schema.test.ts` — Comprehensive JSON Schema enforcement & bounds checking (10 tests)
2. `tests/plannerEngine.test.ts` — Deterministic mathematical budget reconciliation & timeline chronology (10 tests)
3. `tests/usePlanner.test.ts` — Client planning state hook, task toggling, and markdown generation (8 tests)
4. `tests/accessibility.test.tsx` — WCAG 2.1 AA compliance: skip links, ARIA tabs, progress bars, range sliders, radiogroups (6 tests)
5. `tests/securityRateLimit.test.ts` — Sliding-window IP rate limiting, RFC 6585 headers, and HTTP security defense (6 tests)
6. `tests/analyzeServer.test.ts` — Serverless handler HTTP methods, boundary validation, and error classification (6 tests)
7. `tests/promptInjection.test.ts` — Delimiter stripping, tag isolation, and malicious payload rejection (4 tests)
8. `tests/domain.test.ts` — Domain types, presets, and currency formatting helpers (4 tests)
9. `tests/appWorkflow.test.tsx` — Complete app workflow: landing, demo launch, modal context switching, and state updates (4 tests)
10. `tests/demoData.test.ts` — Structural integrity and mathematical precision across all turnkey demo plans (12 tests)
11. `tests/components.test.tsx` — React component integration tests (LandingScreen, ContextBar, LeftPane, RightPane) (5 tests)
12. `tests/guidedActions.test.tsx` — Quick-tool shortcuts and simulation actions (3 tests)
13. `tests/validationResults.test.ts` — Schema validation result structures and sanitized output (3 tests)
14. `tests/api.test.ts` — Client-side API caller and fallback resilience (3 tests)
15. `tests/providerIsolation.test.ts` — Offline DemoProvider isolation & live Gemini provider delegation (2 tests)
16. `tests/contextSwitchPersistence.test.tsx` — In-memory session context cache persistence (2 tests)
17. `tests/skipLink.test.tsx` — Skip-to-content landmark accessibility resolution (1 test)
18. `tests/analyzeServerConfig.test.ts` — Production Gemini SDK retry configuration (fail-fast 429s) (1 test)

---

## Accessibility & WCAG 2.1 AA Compliance

Planora is built from the ground up for universal accessibility, adhering to **WCAG 2.1 Level AA** standards:

- **Skip-to-Content Link**: Implemented via `<a href="#main-content" className="skip-link">` ensuring keyboard and screen-reader users can bypass navigational blocks on all views (WCAG 2.4.1).
- **WAI-ARIA APG Tabs Pattern**: All tablists ([LeftPane.tsx](src/components/dashboard/LeftPane.tsx), [RightPane.tsx](src/components/dashboard/RightPane.tsx)) implement full arrow key navigation (`ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `Home`, `End`) with dynamic `tabIndex={0 | -1}`, `aria-selected`, and `aria-controls` / `aria-labelledby` linkages.
- **Range Slider Semantics**: The interactive budget slider features `id`, `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` formatted with currency.
- **Dynamic Live Region Feedback**: Budget simulation readouts employ `aria-live="polite"` so screen readers dynamically announce re-calculated totals as the slider moves.
- **Semantic Progress Bar**: Vendor checklists feature a semantic `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and descriptive accessible labels.
- **Dialog Focus Management**: Modal dialogs ([EventContextSelector.tsx](src/components/context/EventContextSelector.tsx)) auto-focus upon opening, trap keyboard navigation, and provide `Escape` key dismissal.
- **Reduced Motion & High Contrast**: Includes `@media (prefers-reduced-motion: reduce)` to disable animations for motion-sensitive users, and `@media (forced-colors: active)` for high-contrast accessibility.

---

## Security Model & Threat Mitigation

Planora follows OWASP Top 10 and LLM Security guidelines (see [SECURITY.md](SECURITY.md) for the full policy):

- **Zero Client-Side Secret Leakage** — Gemini API credentials reside strictly in serverless environment variables (`GEMINI_API_KEY`). The client application bundle contains zero secrets.
- **Sliding-Window IP Rate Limiter** — Serverless endpoints enforce an in-memory sliding window (30 requests/min/IP) emitting RFC 6585 compliance headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`) with HTTP `429 Too Many Requests`.
- **Prompt Injection Defense (OWASP LLM01)** — User inputs are strictly stripped of XML delimiters (`<` and `>`), length-capped (`MAX_SPECIAL_NOTES_LENGTH = 1000`), and isolated within `<EVENT_DATA>` enclosures.
- **Dual-Layer Schema Whitelisting (OWASP LLM02)** — Structured output schema enforced at the Gemini API level and double-validated via strict Ajv validation with `additionalProperties: false`.
- **Defense-in-Depth HTTP Headers** — Production deployment enforces `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Zero Vulnerabilities** — Verified clean via `npm audit` with **0 known vulnerabilities**.

---

## Disclaimer

Planora is an informational planning and coordination assistant. It does not provide legal, engineering, or licensed safety advice. Always review vendor contracts, insurance requirements, and local municipal permits with qualified professionals before signing agreements or transferring deposits.
