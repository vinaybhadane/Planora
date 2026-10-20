/**
 * domain.ts — Stable typed identifiers for the Event Planning system.
 *
 * EventTypeId, VibeId, and VendorCategoryId are canonical identifiers used in
 * all application logic, provider selection, and data keying.
 *
 * IMPORTANT: Do NOT use raw display strings for branching logic.
 */

// ── Event Types ──────────────────────────────────────────────────────────

export type EventTypeId =
  | 'wedding'
  | 'birthday'
  | 'community'
  | 'gala-fundraiser';

export interface EventTypeOption {
  id: EventTypeId;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  typicalGuestRange: [number, number];
  defaultBudget: number;
}

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    id: 'wedding',
    label: 'Wedding Celebration',
    tagline: 'Ceremonial Elegance & Guest Experience',
    description: 'Ceremony timelines, reception seating, catering, florals, photography schedules, and guest logistics.',
    icon: '💒',
    typicalGuestRange: [50, 250],
    defaultBudget: 25000,
  },
  {
    id: 'birthday',
    label: 'Milestone Birthday Party',
    tagline: 'Themed Entertainment & High-Energy Fun',
    description: 'Custom themes, bar & cake timing, dynamic entertainment, signature touches, and photo moments.',
    icon: '🎂',
    typicalGuestRange: [20, 100],
    defaultBudget: 5000,
  },
  {
    id: 'community',
    label: 'Community Event / Festival',
    tagline: 'Volunteer Coordination & Public Logistics',
    description: 'Permits, safety, staging, volunteer shifts, food trucks, crowd flow, and municipal compliance.',
    icon: '🎪',
    typicalGuestRange: [100, 1000],
    defaultBudget: 12000,
  },
  {
    id: 'gala-fundraiser',
    label: 'Charity Gala & Fundraiser',
    tagline: 'Sponsorships, Auctions & Formal Dining',
    description: 'Silent auction staging, keynote speaker AV, donor reception, catering runs, and sponsor visibility.',
    icon: '🥂',
    typicalGuestRange: [75, 350],
    defaultBudget: 35000,
  },
];

// ── Vibes & Themes ────────────────────────────────────────────────────────

export type VibeId =
  | 'romantic-elegant'
  | 'rustic-boho'
  | 'modern-festive'
  | 'eco-friendly'
  | 'cozy-intimate';

export interface VibeOption {
  id: VibeId;
  label: string;
  description: string;
  suggestedColors: string[];
}

export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'romantic-elegant',
    label: 'Romantic & Elegant',
    description: 'Timeless florals, champagne tones, fine dining, and soft ambient lighting.',
    suggestedColors: ['#FDF8F0', '#C5A880', '#3D342F', '#E8D3C6'],
  },
  {
    id: 'rustic-boho',
    label: 'Rustic & Bohemian',
    description: 'Natural timber, wildflower arrangements, relaxed acoustic tunes, and earth hues.',
    suggestedColors: ['#5C4033', '#C2B280', '#8A9A5B', '#EEDC82'],
  },
  {
    id: 'modern-festive',
    label: 'Modern & Festive',
    description: 'Bold jewel tones, dynamic lighting, interactive food stations, and live DJ sets.',
    suggestedColors: ['#1E1B4B', '#4F46E5', '#EC4899', '#06B6D4'],
  },
  {
    id: 'eco-friendly',
    label: 'Eco-Friendly & Sustainable',
    description: 'Zero-waste catering, potted native plants, digital keepsakes, and sustainable decor.',
    suggestedColors: ['#14532D', '#15803D', '#BBF7D0', '#FEF3C7'],
  },
  {
    id: 'cozy-intimate',
    label: 'Cozy & Intimate',
    description: 'Warm candlelight, family-style feasting, personalized touches, and soft acoustics.',
    suggestedColors: ['#78350F', '#B45309', '#FDE68A', '#FEF2F2'],
  },
];

// ── Vendor Categories ─────────────────────────────────────────────────────

export type VendorCategoryId =
  | 'venue'
  | 'catering'
  | 'media'
  | 'decor'
  | 'entertainment'
  | 'logistics';

export interface VendorCategoryOption {
  id: VendorCategoryId;
  label: string;
  defaultSharePercent: number;
}

export const VENDOR_CATEGORIES: VendorCategoryOption[] = [
  { id: 'venue', label: 'Venue & Staging', defaultSharePercent: 30 },
  { id: 'catering', label: 'Food, Drinks & Cake', defaultSharePercent: 35 },
  { id: 'media', label: 'Photography & Video', defaultSharePercent: 12 },
  { id: 'decor', label: 'Decor, Florals & Lighting', defaultSharePercent: 10 },
  { id: 'entertainment', label: 'Music & Performance', defaultSharePercent: 8 },
  { id: 'logistics', label: 'Rentals, Staff & Permits', defaultSharePercent: 5 },
];

// ── Helpers ──────────────────────────────────────────────────────────────

/** Get display label for an EventTypeId */
export function eventLabel(id: EventTypeId): string {
  return EVENT_TYPE_OPTIONS.find(e => e.id === id)?.label ?? id;
}

/** Get display label for a VibeId */
export function vibeLabel(id: VibeId): string {
  return VIBE_OPTIONS.find(v => v.id === id)?.label ?? id;
}

/** Get display label for a VendorCategoryId */
export function vendorCategoryLabel(id: VendorCategoryId): string {
  return VENDOR_CATEGORIES.find(c => c.id === id)?.label ?? id;
}

/** Formats a numeric currency amount into clean locale string (e.g., $15,000) */
export function formatCurrency(amount: number, currency: string = '$'): string {
  const rounded = Math.round(amount);
  return `${currency}${rounded.toLocaleString('en-US')}`;
}
