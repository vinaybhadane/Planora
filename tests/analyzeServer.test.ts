/**
 * analyzeServer.test.ts
 *
 * Tests for the /api/plan and /api/analyze serverless function:
 * - Method validation (405 for GET/PUT)
 * - Input bounds validation (400 for bad guest count or budget)
 * - Rate limit 429 error classification
 * - Successful generation with mock Gemini client
 */

import { describe, expect, it, beforeEach } from 'vitest';
import handler, {
  classifyGeminiError,
  setGeminiClientForTesting,
  type VercelRequest,
  type VercelResponse,
} from '../api/analyze';
import { DEMO_WEDDING_PLAN } from '../src/lib/providers/demoData';

function createMockReqRes(method: string, body?: Record<string, unknown>) {
  const req = {
    method,
    headers: {},
    body,
  } as unknown as VercelRequest;

  let statusCode = 200;
  let jsonBody: Record<string, unknown> = {};
  const headers: Record<string, string> = {};

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      jsonBody = (data as Record<string, unknown>) ?? {};
    },
    setHeader(name: string, value: string) {
      headers[name] = value;
      return res;
    },
    end() {},
  } as unknown as VercelResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getBody: () => jsonBody,
  };
}

describe('Serverless Handler (/api/plan)', () => {
  beforeEach(() => {
    setGeminiClientForTesting(null);
  });

  it('rejects non-POST HTTP methods with 405 Method Not Allowed', async () => {
    const { req, res, getStatus, getBody } = createMockReqRes('GET');
    await handler(req, res);
    expect(getStatus()).toBe(405);
    expect(getBody().error).toBe('Method Not Allowed');
  });

  it('returns 400 when guest count is below minimum', async () => {
    const { req, res, getStatus, getBody } = createMockReqRes('POST', {
      eventType: 'wedding',
      guestCount: 0,
      totalBudget: 20000,
    });
    await handler(req, res);
    expect(getStatus()).toBe(400);
    expect(getBody().error).toContain('Guest count must be between');
  });

  it('returns 400 when total budget is below minimum', async () => {
    const { req, res, getStatus, getBody } = createMockReqRes('POST', {
      eventType: 'wedding',
      guestCount: 50,
      totalBudget: 50, // below MIN_BUDGET
    });
    await handler(req, res);
    expect(getStatus()).toBe(400);
    expect(getBody().error).toContain('Total budget must be between');
  });

  it('handles mock Gemini client returning valid JSON schema output', async () => {
    const mockClient = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify(DEMO_WEDDING_PLAN),
        }),
      },
    };
    setGeminiClientForTesting(mockClient);

    const { req, res, getStatus, getBody } = createMockReqRes('POST', {
      eventType: 'wedding',
      guestCount: 120,
      totalBudget: 32000,
      vibe: 'romantic-elegant',
    });

    await handler(req, res);
    expect(getStatus()).toBe(200);
    expect(getBody().event_name).toBe(DEMO_WEDDING_PLAN.event_name);
  });
});

describe('Gemini Error Classification', () => {
  it('identifies 429 RESOURCE_EXHAUSTED and returns safe message without key leakage', () => {
    const geminiQuotaError = {
      status: 429,
      error: {
        status: 'RESOURCE_EXHAUSTED',
        message: 'Quota exceeded for project with key AIzaSyFakeSecretKey...',
      },
    };

    const classified = classifyGeminiError(geminiQuotaError);
    expect(classified.status).toBe(429);
    expect(classified.message).toContain('rate limit reached');
    expect(classified.message).not.toContain('AIzaSy');
  });

  it('masks unknown internal errors with 500 status', () => {
    const classified = classifyGeminiError(new Error('Internal socket failure at xyz'));
    expect(classified.status).toBe(500);
    expect(classified.message).toContain('An error occurred while generating the event plan');
  });
});
