/**
 * geminiConfig.ts
 *
 * Central configuration for Gemini models.
 * DO NOT put the Gemini API key in this file (src/ must remain free of API key references).
 */
export const GEMINI_MODEL = 'gemini-3-flash-preview';
export const GEMINI_FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash'] as const;
