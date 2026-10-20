/**
 * api.ts — Client-side API caller for GenAI Event Planning.
 *
 * Sends planning parameters to the serverless endpoint and validates the
 * returned structured response.
 *
 * Security:
 * - Never includes or handles API keys on the client side.
 * - Validates and sanitizes the server response before passing to UI state.
 */

import type { PlanResult } from './schema';
import { validateAndSanitizePlan } from './schema';
import type { PlanGenerationParams } from './providers/AIProvider';

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}


/**
 * Sends event planning parameters to the backend serverless endpoint.
 */
export async function requestEventPlan(
  params: PlanGenerationParams,
  signal?: AbortSignal
): Promise<PlanResult> {
  const timeoutMs = 60000; // 60s timeout for complex AI generation
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // If a parent signal was provided, link it
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorMsg = errorJson.message;
        if (errorJson.error) errorMsg = errorJson.error;
      } catch {
        // use fallback status message
      }
      throw new ApiError(errorMsg, response.status);
    }

    const data = await response.json();
    const validation = validateAndSanitizePlan(data);

    if (!validation.valid || !validation.plan) {
      throw new ApiError(
        'Server returned an invalid plan structure.',
        502,
        validation.errors
      );
    }

    return validation.plan;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) throw err;

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out or was cancelled by user.', 408);
    }

    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new ApiError(message, 0);
  }
}

