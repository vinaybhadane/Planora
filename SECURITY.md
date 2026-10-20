# Security Policy & Architecture

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Planora, please report it privately:
- **Email**: `vinaybhadane@gmail.com`
- **Response Target**: Within 48 hours with an initial assessment and mitigation plan.
- Please do not disclose vulnerabilities publicly until a patch has been released.

---

## Threat Model & Security Controls Matrix

Planora is engineered according to OWASP Top 10 and GenAI Security Guidelines (OWASP Top 10 for LLM Applications):

### 1. Zero Client-Side Secret Exposure
- The Google Gemini API key (`GEMINI_API_KEY`) is **strictly stored server-side** in Vercel environment variables or local `.env` files.
- The client application never receives, stores, or bundles API tokens (`VITE_GEMINI_API_KEY` is completely absent from client build manifests).
- Turnkey demo modes operate 100% offline using deterministic mock data, eliminating the need to provide or expose credentials for evaluation.

### 2. Prompt Injection Defense (OWASP LLM01)
- User inputs (`specialNotes`, `eventName`, `targetDate`) are sanitized to strip XML/HTML delimiters (`<` and `>`).
- Strict character length boundaries are enforced prior to prompt concatenation (`MAX_SPECIAL_NOTES_LENGTH = 1000`, `MAX_EVENT_NAME_LENGTH = 120`).
- User data is strictly isolated inside `<EVENT_DATA>` enclosures, distinctly segregated from the immutable system instruction prompt.

### 3. Structural Schema Validation & Output Sanitization (OWASP LLM02)
- All model outputs undergo two levels of structural validation:
  1. **API Level**: Schema enforcement via `responseSchema: PLAN_SCHEMA` in the Gemini API.
  2. **Application Level**: Strict Ajv post-validation with `additionalProperties: false` on sub-objects to strip or reject any unauthorized injected keys or malicious instructions.

### 4. Sliding-Window Rate Limiting (DDoS & Quota Exhaustion Defense)
- Serverless endpoints (`/api/plan` / `/api/analyze`) enforce a sliding-window rate limit of **30 requests per minute per IP address**.
- Rate-limited clients receive HTTP `429 Too Many Requests` accompanied by standard RFC 6585 compliance headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After`

### 5. HTTP Defense-in-Depth Headers & Content Security Policy
Production deployments in [vercel.json](file:///d:/contextualis-master/vercel.json) and serverless handlers enforce:
- `Content-Security-Policy`: Default-src restricted to self; script, style, image, and connect directives locked down.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type confusion attacks.
- `X-Frame-Options: DENY`: Prevents UI redressing and clickjacking attacks.
- `X-XSS-Protection: 1; mode=block`: Activates browser XSS mitigations.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer disclosure across origins.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Restricts sensitive browser device APIs.

### 6. Dependency Health & Automated Auditing
- Project dependencies are audited via `npm audit` with **0 known vulnerabilities**.
- Linter enforcement via `oxlint` guarantees static code security rules across all server and client files.
