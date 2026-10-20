/**
 * analyze.ts — Vercel Serverless Function & Planning Backend.
 *
 * POST /api/plan (and /api/analyze)
 *
 * Pipeline A: Event Parameters → Gemini GenAI API → Schema-Validated Plan
 *
 * Security model:
 * - API key lives strictly in server environment variable (GEMINI_API_KEY).
 * - Never leaks API key, internal stack traces, or document contents.
 * - Strict parameter bounds checks (guest count, budget, string lengths).
 * - Prompt injection mitigation: user text is delimited as data, never prompt instructions.
 * - Enforces response_json_schema and Ajv post-validation.
 * - Classified error handling with clean status codes.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { PLAN_SCHEMA, validateAndSanitizePlan } from '../src/lib/schema.js';
import { GEMINI_MODEL, GEMINI_FALLBACK_MODELS } from '../src/lib/geminiConfig.js';

export type VercelRequest = IncomingMessage & {
  body?: Record<string, unknown>;
  query?: Record<string, string | string[]>;
  readable?: boolean;
  resume?: () => void;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => VercelResponse;
  end: () => void;
};

// ---------------------------------------------------------------------------
// Configuration & Limits
// ---------------------------------------------------------------------------

export const MAX_SPECIAL_NOTES_LENGTH = 1000;
export const MAX_EVENT_NAME_LENGTH = 120;
export const MIN_BUDGET = 100;
export const MAX_BUDGET = 25000000;
export const MIN_GUEST_COUNT = 1;
export const MAX_GUEST_COUNT = 50000;

// ---------------------------------------------------------------------------
// Gemini Client Singleton
// ---------------------------------------------------------------------------

export interface MinimalGeminiClient {
  models: {
    generateContent: (args: {
      model: string;
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
      config?: {
        systemInstruction?: string;
        responseMimeType?: string;
        responseSchema?: unknown;
      };
    }) => Promise<{ text?: string }>;
  };
}

let customGeminiClient: MinimalGeminiClient | null = null;

export function setGeminiClientForTesting(client: MinimalGeminiClient | null): void {
  customGeminiClient = client;
}

function ensureEnvLoaded(): void {
  if (process.env.GEMINI_API_KEY) return;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Ignore error if .env cannot be loaded
  }
}

function getGeminiClient(): GoogleGenAI | MinimalGeminiClient {
  if (customGeminiClient) {
    return customGeminiClient;
  }
  ensureEnvLoaded();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { retryOptions: { attempts: 1 } },
  });
}

// ---------------------------------------------------------------------------
// Error Classification
// ---------------------------------------------------------------------------

export interface ClassifiedError {
  status: number;
  message: string;
}

export function classifyGeminiError(err: unknown): ClassifiedError {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as Record<string, unknown>;
    const status =
      anyErr.status ??
      anyErr.statusCode ??
      (anyErr.error as Record<string, unknown> | undefined)?.code;

    const message = typeof anyErr.message === 'string' ? anyErr.message : '';
    const errorStatus =
      typeof (anyErr.error as Record<string, unknown> | undefined)?.status === 'string'
        ? (anyErr.error as Record<string, unknown>).status
        : '';

    const is429 =
      status === 429 ||
      errorStatus === 'RESOURCE_EXHAUSTED' ||
      /\bRESOURCE_EXHAUSTED\b/i.test(message) ||
      (/\b429\b/.test(message) && /quota|rate\s*limit/i.test(message));

    if (is429) {
      return {
        status: 429,
        message: 'Plan generation rate limit reached. Please wait a moment or explore in Demo Mode.',
      };
    }

    const is503 =
      status === 503 ||
      errorStatus === 'UNAVAILABLE' ||
      /\bUNAVAILABLE\b/i.test(message) ||
      /high demand|spikes in demand|overloaded/i.test(message);

    if (is503) {
      return {
        status: 503,
        message: 'The AI model is currently experiencing high demand. Please try again in a few moments, or explore in Turnkey Demo Mode.',
      };
    }

    if (status === 400 || status === 404) {
      return {
        status: 400,
        message: 'Invalid request parameters provided.',
      };
    }
  }

  return {
    status: 500,
    message: 'An error occurred while generating the event plan. Please try again or use Demo Mode.',
  };
}

// ---------------------------------------------------------------------------
// Prompt Construction
// ---------------------------------------------------------------------------

export function constructPlanningPrompt(params: {
  eventType: string;
  guestCount: number;
  totalBudget: number;
  vibe: string;
  eventName?: string;
  targetDate?: string;
  specialNotes?: string;
}): { systemInstruction: string; userPrompt: string } {
  const systemInstruction = `You are Planora, an expert senior event producer and logistical planner with 20 years of experience coordinating weddings, milestone birthdays, community festivals, and charity galas.

Your task is to produce a comprehensive, realistic, and mathematically sound event plan.
Follow these rules strictly:
1. Budgets: Allocate amounts such that the sum of all category allocated_amount values PLUS the contingency amount equals the specified total budget. Recommend realistic percentages.
2. Contingency Fund: Include an explicit 8% to 12% contingency reserve and provide clear rationale.
3. Timelines: Provide sequential, practical phased milestones, plus an hour-by-hour day-of schedule.
4. Vendor Checklists: Detail practical requirements and watch out for deceptive contract clauses (e.g., hidden overtime, force majeure, corkage, noise curfews).
5. Personalized Ideas: Provide creative, memorable, non-generic concepts tailored to the event vibe and guest count.
6. Return only valid JSON conforming strictly to the requested schema.`;

  const userPrompt = `Generate a complete event plan using these exact parameters:
<EVENT_DATA>
Event Type: ${params.eventType}
Planned Event Name: ${params.eventName ? params.eventName.replace(/[<>]/g, '') : 'Default for this event type'}
Estimated Guest Count: ${params.guestCount}
Total Budget: $${params.totalBudget.toLocaleString()} USD
Aesthetic / Vibe: ${params.vibe}
Target Date: ${params.targetDate ? params.targetDate.replace(/[<>]/g, '') : 'Unspecified'}
Special Instructions / Requests:
${params.specialNotes ? params.specialNotes.replace(/[<>]/g, '').slice(0, MAX_SPECIAL_NOTES_LENGTH) : 'None provided'}
</EVENT_DATA>`;

  return { systemInstruction, userPrompt };
}

// ---------------------------------------------------------------------------
// Serverless Handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS configuration
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    let body = req.body;
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      if (req.readable) {
        const raw = await new Promise<string>((resolve) => {
          let str = '';
          req.on('data', chunk => { str += chunk; });
          req.on('end', () => resolve(str));
          req.on('error', () => resolve(''));
          req.resume?.();
        });
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            body = {};
          }
        }
      }
    }

    const {
      eventType = 'wedding',
      guestCount = 100,
      totalBudget = 20000,
      vibe = 'romantic-elegant',
      eventName,
      targetDate,
      specialNotes,
    } = (body as Record<string, unknown>) ?? {};

    // Validate parameters
    const safeGuestCount = Number(guestCount);
    const safeTotalBudget = Number(totalBudget);

    if (
      isNaN(safeGuestCount) ||
      safeGuestCount < MIN_GUEST_COUNT ||
      safeGuestCount > MAX_GUEST_COUNT
    ) {
      res.status(400).json({ error: `Guest count must be between ${MIN_GUEST_COUNT} and ${MAX_GUEST_COUNT}.` });
      return;
    }

    if (
      isNaN(safeTotalBudget) ||
      safeTotalBudget < MIN_BUDGET ||
      safeTotalBudget > MAX_BUDGET
    ) {
      res.status(400).json({ error: `Total budget must be between $${MIN_BUDGET} and $${MAX_BUDGET.toLocaleString()}.` });
      return;
    }

    const safeEventName = typeof eventName === 'string' ? eventName.slice(0, MAX_EVENT_NAME_LENGTH) : undefined;
    const safeTargetDate = typeof targetDate === 'string' ? targetDate.slice(0, 50) : undefined;
    const safeSpecialNotes = typeof specialNotes === 'string' ? specialNotes.slice(0, MAX_SPECIAL_NOTES_LENGTH) : undefined;

    // Check mock mode override
    if (process.env.USE_MOCK_GEMINI === 'true') {
      const { DEMO_PLANS_BY_TYPE } = await import('../src/lib/providers/demoData.js');
      const mockPlan = DEMO_PLANS_BY_TYPE[eventType as keyof typeof DEMO_PLANS_BY_TYPE] ?? DEMO_PLANS_BY_TYPE.wedding;
      res.status(200).json(mockPlan);
      return;
    }

    const client = getGeminiClient();
    const { systemInstruction, userPrompt } = constructPlanningPrompt({
      eventType: String(eventType),
      guestCount: safeGuestCount,
      totalBudget: safeTotalBudget,
      vibe: String(vibe),
      eventName: safeEventName,
      targetDate: safeTargetDate,
      specialNotes: safeSpecialNotes,
    });

    // Call Gemini with structured output schema across candidate models
    const candidateModels = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
    let responseText: string | undefined;
    let lastError: unknown;

    for (const model of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: PLAN_SCHEMA,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (modelErr: unknown) {
        lastError = modelErr;
        const msg = modelErr instanceof Error ? modelErr.message : String(modelErr);
        console.warn(`[api/analyze] Model ${model} generation failed, trying next candidate if available:`, msg);
      }
    }

    if (!responseText) {
      if (lastError) {
        throw lastError;
      }
      res.status(502).json({ error: 'Empty response received from AI model.' });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      res.status(502).json({ error: 'AI output failed JSON parsing.' });
      return;
    }

    const validation = validateAndSanitizePlan(parsed);
    if (!validation.valid || !validation.plan) {
      res.status(502).json({
        error: 'Generated plan did not meet required schema standards.',
        details: validation.errors,
      });
      return;
    }

    res.status(200).json(validation.plan);
  } catch (err: unknown) {
    console.error('[api/analyze error]:', err);
    const classified = classifyGeminiError(err);
    res.status(classified.status).json({ error: classified.message });
  }
}
