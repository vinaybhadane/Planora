/**
 * domain.test.ts
 *
 * Tests for domain definitions:
 * - Event type options and default configurations
 * - Vibe options and color palettes
 * - Label helper functions
 * - formatCurrency formatting
 */

import { describe, expect, it } from 'vitest';
import {
  EVENT_TYPE_OPTIONS,
  VIBE_OPTIONS,
  VENDOR_CATEGORIES,
  eventLabel,
  vibeLabel,
  vendorCategoryLabel,
  formatCurrency,
} from '../src/lib/domain';

describe('domain definitions', () => {
  it('defines 4 standard event types with positive guest and budget defaults', () => {
    expect(EVENT_TYPE_OPTIONS.length).toBe(4);
    for (const opt of EVENT_TYPE_OPTIONS) {
      expect(opt.id).toBeDefined();
      expect(opt.label.length).toBeGreaterThan(0);
      expect(opt.defaultBudget).toBeGreaterThan(0);
      expect(opt.typicalGuestRange[0]).toBeGreaterThan(0);
      expect(opt.typicalGuestRange[1]).toBeGreaterThanOrEqual(opt.typicalGuestRange[0]);
    }
  });

  it('defines 5 curated vibe options with suggested color arrays', () => {
    expect(VIBE_OPTIONS.length).toBe(5);
    for (const vibe of VIBE_OPTIONS) {
      expect(vibe.id).toBeDefined();
      expect(vibe.suggestedColors.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('defines vendor categories with percentage distributions totaling ~100%', () => {
    const sum = VENDOR_CATEGORIES.reduce((acc, cat) => acc + cat.defaultSharePercent, 0);
    expect(sum).toBe(100);
  });

  it('formats labels and currency correctly', () => {
    expect(eventLabel('wedding')).toBe('Wedding Celebration');
    expect(vibeLabel('romantic-elegant')).toBe('Romantic & Elegant');
    expect(vendorCategoryLabel('catering')).toBe('Food, Drinks & Cake');
    expect(formatCurrency(25000)).toBe('$25,000');
    expect(formatCurrency(1450.75, '€')).toBe('€1,451');
  });
});
