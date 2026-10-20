/**
 * plan.ts — Vercel Serverless Function entrypoint for /api/plan.
 *
 * Delegates directly to the analyze handler for consistent execution.
 */

import handler, { type VercelRequest, type VercelResponse } from './analyze.js';

export default async function planHandler(req: VercelRequest, res: VercelResponse): Promise<void> {
  return handler(req, res);
}
