/**
 * GeminiProvider.ts — Server-backed Gemini AI planning provider.
 *
 * Calls the backend serverless endpoint /api/plan, which holds credentials securely.
 */

import type { AIPlanningProvider, PlanGenerationParams } from './AIProvider';
import type { PlanResult } from '../schema';
import { requestEventPlan } from '../api';

export class GeminiProvider implements AIPlanningProvider {
  async generatePlan(params: PlanGenerationParams, signal?: AbortSignal): Promise<PlanResult> {
    return requestEventPlan(params, signal);
  }
}
