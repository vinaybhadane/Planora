/**
 * AIProvider.ts — Unified interface for AI planning providers.
 *
 * Implementations:
 * - GeminiProvider: calls the serverless Gemini endpoint
 * - DemoProvider: returns instant, pre-computed demo plans without network or API key
 */

import type { PlanResult } from '../schema';
import type { EventTypeId, VibeId } from '../domain';

export interface PlanGenerationParams {
  eventType: EventTypeId;
  guestCount: number;
  totalBudget: number;
  vibe: VibeId;
  eventName?: string;
  targetDate?: string;
  specialNotes?: string;
}

export interface AIPlanningProvider {
  generatePlan(params: PlanGenerationParams, signal?: AbortSignal): Promise<PlanResult>;
}

// Backward compatibility alias
export type AIAnalysisProvider = AIPlanningProvider;
