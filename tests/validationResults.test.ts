/**
 * validationResults.test.ts
 *
 * Security & Environment Invariants:
 * 1. GEMINI_API_KEY is NEVER referenced in any client src/ file (not even in comments).
 * 2. No VITE_-prefixed secrets exist in .env.example that could accidentally be bundled.
 * 3. .env is strictly ignored in .gitignore to prevent accidental commit of credentials.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

describe('Security Boundary — Secret Isolation', () => {
  it('GEMINI_API_KEY is not referenced in any src/ file', () => {
    const srcDir = path.join(ROOT, 'src');
    const violations: string[] = [];

    function scan(dir: string) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          scan(full);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx') || entry.endsWith('.css')) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes('GEMINI_API_KEY')) {
            violations.push(path.relative(ROOT, full));
          }
        }
      }
    }
    scan(srcDir);
    expect(violations, `GEMINI_API_KEY found in client src files: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('No VITE_ prefix on secret vars in .env.example', () => {
    const envExample = path.join(ROOT, '.env.example');
    if (!fs.existsSync(envExample)) return;
    const content = fs.readFileSync(envExample, 'utf-8');
    const viteSecrets = content.match(/^VITE_.*KEY/gm) ?? [];
    expect(
      viteSecrets,
      `VITE_-prefixed secrets in .env.example would be exposed to client bundle: ${viteSecrets.join(', ')}`
    ).toHaveLength(0);
  });

  it('.env is listed in .gitignore', () => {
    const gitignore = path.join(ROOT, '.gitignore');
    if (!fs.existsSync(gitignore)) return;
    const content = fs.readFileSync(gitignore, 'utf-8');
    const lines = content.split('\n').map(l => l.trim());
    expect(lines).toContain('.env');
  });
});
