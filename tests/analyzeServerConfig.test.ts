import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import handler, { setGeminiClientForTesting } from '../api/analyze';

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function () {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              event_name: 'Test Event',
              event_type: 'wedding',
              guest_count: 50,
              total_budget: 10000,
              currency: '$',
              executive_summary: 'Test summary long enough for validation rules.',
              theme_and_vibe: {
                theme_name: 'Test',
                color_palette: [{ name: 'White', hex: '#FFFFFF' }],
                aesthetic_notes: 'Notes',
                signature_touch: 'Touch',
              },
              budget_breakdown: [],
              contingency_fund: { percentage: 10, amount: 1000, rationale: 'Test buffer' },
              timeline_phases: [],
              day_of_timeline: [],
              vendor_checklists: [],
              personalized_ideas: [],
              questions_for_vendors: [],
              risks_and_mitigations: [],
              disclaimer: 'Disclaimer',
            }),
          }),
        },
      };
    }),
  };
});

describe('api/analyze.ts — Production Config', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-fake-key-for-testing';
    process.env.USE_MOCK_GEMINI = 'false';
  });

  afterEach(() => {
    setGeminiClientForTesting(null);
    delete process.env.GEMINI_API_KEY;
    delete process.env.USE_MOCK_GEMINI;
    vi.clearAllMocks();
  });

  it('instantiates GoogleGenAI with disabled automatic SDK retries (fail-fast for 429s)', async () => {
    const req = {
      method: 'POST',
      body: { eventType: 'wedding', guestCount: 50, totalBudget: 10000 },
    } as unknown as import('../api/analyze').VercelRequest;
    const res = {
      status: () => res,
      json: () => res,
      setHeader: () => res,
      end: () => {},
    } as unknown as import('../api/analyze').VercelResponse;

    await handler(req, res);

    expect(GoogleGenAI).toHaveBeenCalled();
    const callArgs = vi.mocked(GoogleGenAI).mock.calls[0][0];

    expect(callArgs!.httpOptions).toBeDefined();
    expect(callArgs!.httpOptions?.retryOptions?.attempts).toBe(1);
  });
});
