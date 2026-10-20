import { describe, it, expect, beforeEach } from 'vitest';
import handler, {
  checkRateLimit,
  getClientIp,
  resetRateLimiterForTesting,
  RATE_LIMIT_MAX_REQUESTS,
  type VercelRequest,
  type VercelResponse,
} from '../api/analyze';

function createMockReqRes(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  socketRemoteAddress?: string;
}) {
  const req = {
    method: options.method ?? 'POST',
    headers: options.headers ?? {},
    body: options.body ?? { eventType: 'wedding', guestCount: 100, totalBudget: 25000 },
    socket: { remoteAddress: options.socketRemoteAddress ?? '192.168.1.1' },
  } as unknown as VercelRequest;

  let statusCode = 200;
  let jsonBody: Record<string, unknown> = {};
  const responseHeaders: Record<string, string> = {};

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      jsonBody = (data as Record<string, unknown>) ?? {};
    },
    setHeader(name: string, value: string) {
      responseHeaders[name] = value;
      return res;
    },
    end() {},
  } as unknown as VercelResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getBody: () => jsonBody,
    getHeaders: () => responseHeaders,
  };
}

describe('Security & Rate Limiting Controls', () => {
  beforeEach(() => {
    resetRateLimiterForTesting();
  });

  it('correctly extracts client IP from x-forwarded-for header', () => {
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('203.0.113.195');
  });

  it('correctly extracts client IP from x-real-ip header when x-forwarded-for is missing', () => {
    const req = {
      headers: { 'x-real-ip': '198.51.100.44' },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('198.51.100.44');
  });

  it('falls back to socket remoteAddress when proxy headers are absent', () => {
    const req = {
      headers: {},
      socket: { remoteAddress: '10.0.0.1' },
    } as unknown as VercelRequest;

    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('enforces sliding-window quota and rejects excessive requests with 429', () => {
    const testIp = '198.51.100.99';

    // First RATE_LIMIT_MAX_REQUESTS requests should be permitted
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      const check = checkRateLimit(testIp);
      expect(check.allowed).toBe(true);
      expect(check.remaining).toBe(RATE_LIMIT_MAX_REQUESTS - 1 - i);
    }

    // Next request must be rejected
    const blockedCheck = checkRateLimit(testIp);
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.remaining).toBe(0);
    expect(blockedCheck.resetSeconds).toBeGreaterThan(0);
  });

  it('sets X-Content-Type-Options: nosniff and X-Frame-Options: DENY on responses', async () => {
    const { req, res, getHeaders } = createMockReqRes({ method: 'OPTIONS' });

    await handler(req, res);

    const headers = getHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Access-Control-Allow-Origin']).toBeDefined();
  });

  it('returns 429 and Retry-After header when rate limit is exceeded in handler', async () => {
    const ip = '10.20.30.40';

    // Exhaust the rate limit
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      checkRateLimit(ip);
    }

    const { req, res, getStatus, getBody, getHeaders } = createMockReqRes({
      headers: { 'x-real-ip': ip },
    });

    await handler(req, res);

    expect(getStatus()).toBe(429);
    expect(getBody().error).toContain('Rate limit exceeded');
    expect(getHeaders()['Retry-After']).toBeDefined();
    expect(getHeaders()['X-RateLimit-Remaining']).toBe('0');
  });
});
