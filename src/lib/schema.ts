/**
 * schema.ts
 *
 * Single source of truth for the GenAI Event Planning Assistant schema.
 *
 * This JSON Schema is used in TWO places:
 * 1. As `response_json_schema` in the Gemini API call (structural enforcement)
 * 2. As the Ajv validator schema on the server/client (post-response validation)
 *
 * Design rules:
 * - Deterministic, strongly-typed event planning structures.
 * - Every required field is genuinely required.
 * - All numbers must be non-negative.
 * - Arrays must contain validated sub-objects.
 */

import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ThemeAndVibe {
  theme_name: string;
  color_palette: ColorSwatch[];
  aesthetic_notes: string;
  signature_touch: string;
}

export interface BudgetItem {
  name: string;
  estimated_cost: number;
  priority: 'must-have' | 'nice-to-have';
}

export interface BudgetCategory {
  id: string;
  category: string;
  name: string;
  percentage: number;
  allocated_amount: number;
  cost_saving_tip: string;
  items: BudgetItem[];
}

export interface ContingencyFund {
  percentage: number;
  amount: number;
  rationale: string;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  due_window: string;
  importance: 'critical' | 'standard';
  dependencies?: string[];
}

export interface TimelinePhase {
  id: string;
  phase_name: string;
  milestones: TimelineMilestone[];
}

export interface DayOfMilestone {
  id: string;
  time: string;
  activity: string;
  lead_responsible: string;
  notes: string;
}

export interface VendorChecklistItem {
  id: string;
  task: string;
  deadline: string;
  critical: boolean;
}

export interface VendorCategoryChecklist {
  category_id: string;
  category_name: string;
  checklist_items: VendorChecklistItem[];
  contract_clauses_to_watch: string[];
}

export interface PersonalizedIdea {
  id: string;
  title: string;
  description: string;
  category: 'decor' | 'entertainment' | 'guest-experience' | 'food-drink';
  estimated_effort: 'low' | 'medium' | 'high';
}

export interface RiskAndMitigation {
  risk: string;
  mitigation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PlanResult {
  event_name: string;
  event_type: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  executive_summary: string;
  theme_and_vibe: ThemeAndVibe;
  budget_breakdown: BudgetCategory[];
  contingency_fund: ContingencyFund;
  timeline_phases: TimelinePhase[];
  day_of_timeline: DayOfMilestone[];
  vendor_checklists: VendorCategoryChecklist[];
  personalized_ideas: PersonalizedIdea[];
  questions_for_vendors: string[];
  risks_and_mitigations: RiskAndMitigation[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// JSON Schema definition
// ---------------------------------------------------------------------------

export const PLAN_SCHEMA = {
  type: 'object',
  required: [
    'event_name',
    'event_type',
    'guest_count',
    'total_budget',
    'currency',
    'executive_summary',
    'theme_and_vibe',
    'budget_breakdown',
    'contingency_fund',
    'timeline_phases',
    'day_of_timeline',
    'vendor_checklists',
    'personalized_ideas',
    'questions_for_vendors',
    'risks_and_mitigations',
    'disclaimer',
  ],
  additionalProperties: false,
  properties: {
    event_name: {
      type: 'string',
      minLength: 1,
      description: 'Title of the event plan (e.g. Tuscan Elegance Vineyard Wedding)',
    },
    event_type: {
      type: 'string',
      minLength: 1,
      description: 'Standard event category (wedding, birthday, community, gala-fundraiser)',
    },
    guest_count: {
      type: 'number',
      minimum: 1,
      description: 'Estimated guest attendance',
    },
    total_budget: {
      type: 'number',
      minimum: 1,
      description: 'Total planned budget in specified currency',
    },
    currency: {
      type: 'string',
      minLength: 1,
      description: 'Currency symbol or code (e.g., $)',
    },
    executive_summary: {
      type: 'string',
      minLength: 10,
      description: '2-4 sentence overview of the event concept and key strategy',
    },
    theme_and_vibe: {
      type: 'object',
      required: ['theme_name', 'color_palette', 'aesthetic_notes', 'signature_touch'],
      additionalProperties: false,
      properties: {
        theme_name: { type: 'string', minLength: 1 },
        color_palette: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'hex'],
            additionalProperties: false,
            properties: {
              name: { type: 'string', minLength: 1 },
              hex: { type: 'string', minLength: 4 },
            },
          },
        },
        aesthetic_notes: { type: 'string', minLength: 1 },
        signature_touch: { type: 'string', minLength: 1 },
      },
    },
    budget_breakdown: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'category', 'name', 'percentage', 'allocated_amount', 'cost_saving_tip', 'items'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1 },
          category: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          percentage: { type: 'number', minimum: 0, maximum: 100 },
          allocated_amount: { type: 'number', minimum: 0 },
          cost_saving_tip: { type: 'string', minLength: 1 },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'estimated_cost', 'priority'],
              additionalProperties: false,
              properties: {
                name: { type: 'string', minLength: 1 },
                estimated_cost: { type: 'number', minimum: 0 },
                priority: { type: 'string', enum: ['must-have', 'nice-to-have'] },
              },
            },
          },
        },
      },
    },
    contingency_fund: {
      type: 'object',
      required: ['percentage', 'amount', 'rationale'],
      additionalProperties: false,
      properties: {
        percentage: { type: 'number', minimum: 0, maximum: 100 },
        amount: { type: 'number', minimum: 0 },
        rationale: { type: 'string', minLength: 1 },
      },
    },
    timeline_phases: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'phase_name', 'milestones'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1 },
          phase_name: { type: 'string', minLength: 1 },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'due_window', 'importance'],
              additionalProperties: false,
              properties: {
                id: { type: 'string', minLength: 1 },
                title: { type: 'string', minLength: 1 },
                due_window: { type: 'string', minLength: 1 },
                importance: { type: 'string', enum: ['critical', 'standard'] },
                dependencies: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    day_of_timeline: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'time', 'activity', 'lead_responsible', 'notes'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1 },
          time: { type: 'string', minLength: 1 },
          activity: { type: 'string', minLength: 1 },
          lead_responsible: { type: 'string', minLength: 1 },
          notes: { type: 'string' },
        },
      },
    },
    vendor_checklists: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category_id', 'category_name', 'checklist_items', 'contract_clauses_to_watch'],
        additionalProperties: false,
        properties: {
          category_id: { type: 'string', minLength: 1 },
          category_name: { type: 'string', minLength: 1 },
          checklist_items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'task', 'deadline', 'critical'],
              additionalProperties: false,
              properties: {
                id: { type: 'string', minLength: 1 },
                task: { type: 'string', minLength: 1 },
                deadline: { type: 'string', minLength: 1 },
                critical: { type: 'boolean' },
              },
            },
          },
          contract_clauses_to_watch: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    personalized_ideas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'description', 'category', 'estimated_effort'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          category: {
            type: 'string',
            enum: ['decor', 'entertainment', 'guest-experience', 'food-drink'],
          },
          estimated_effort: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
        },
      },
    },
    questions_for_vendors: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
    },
    risks_and_mitigations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['risk', 'mitigation', 'severity'],
        additionalProperties: false,
        properties: {
          risk: { type: 'string', minLength: 1 },
          mitigation: { type: 'string', minLength: 1 },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    },
    disclaimer: {
      type: 'string',
      minLength: 1,
      description: 'Standard event planning advisory disclaimer',
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Ajv Validator
// ---------------------------------------------------------------------------

let validatePlanFn: ValidateFunction | null = null;

function getPlanValidator(): ValidateFunction {
  if (!validatePlanFn) {
    const AjvConstructor = ((Ajv as any).default ?? Ajv) as typeof Ajv;
    const addFormatsFn = ((addFormats as any).default ?? addFormats) as typeof addFormats;
    const ajv = new (AjvConstructor as any)({ allErrors: true });
    (addFormatsFn as any)(ajv);
    validatePlanFn = ajv.compile(PLAN_SCHEMA);
  }
  return validatePlanFn as ValidateFunction;
}


/**
 * Validates unknown data against the PLAN_SCHEMA.
 * If valid, returns { valid: true, plan: sanitizedPlan }.
 * If invalid, returns { valid: false, errors: [...] }.
 */
export function validateAndSanitizePlan(data: unknown): {
  valid: boolean;
  plan?: PlanResult;
  errors?: string[];
} {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Plan response must be a JSON object'] };
  }

  const validator = getPlanValidator();
  const valid = validator(data);

  if (!valid) {
    const errors = (validator.errors ?? []).map(
      err => `${err.instancePath || 'root'}: ${err.message}`
    );
    return { valid: false, errors };
  }

  return { valid: true, plan: data as PlanResult };
}

// ---------------------------------------------------------------------------
// Backward compatibility aliases
// ---------------------------------------------------------------------------
export type AnalysisResult = PlanResult;
export const ANALYSIS_SCHEMA = PLAN_SCHEMA;
export function validateAndSanitize(data: unknown): {
  valid: boolean;
  result?: PlanResult;
  errors?: string[];
} {
  const res = validateAndSanitizePlan(data);
  return { valid: res.valid, result: res.plan, errors: res.errors };
}
