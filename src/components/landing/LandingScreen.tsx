/**
 * LandingScreen.tsx — Entry point and interactive event configurator.
 *
 * Allows users to configure a custom event for live Gemini AI generation,
 * or launch instant pre-configured demos for Weddings, Birthdays, and Community Events.
 */

import { useState } from 'react';
import type { EventTypeId, VibeId } from '../../lib/domain';
import { EVENT_TYPE_OPTIONS, VIBE_OPTIONS } from '../../lib/domain';
import type { PlanGenerationParams } from '../../lib/providers/AIProvider';
import { Disclaimer } from '../common/Disclaimer';
import styles from './LandingScreen.module.css';

interface LandingScreenProps {
  onStartLivePlan: (params: PlanGenerationParams) => void;
  onExploreDemo: (eventType: EventTypeId) => void;
  isLoading?: boolean;
}

export function LandingScreen({ onStartLivePlan, onExploreDemo, isLoading = false }: LandingScreenProps) {
  const [selectedEventType, setSelectedEventType] = useState<EventTypeId>('wedding');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [totalBudget, setTotalBudget] = useState<number>(25000);
  const [selectedVibe, setSelectedVibe] = useState<VibeId>('romantic-elegant');
  const [eventName, setEventName] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const currentTypeOption =
    EVENT_TYPE_OPTIONS.find(t => t.id === selectedEventType) ?? EVENT_TYPE_OPTIONS[0];

  const handleEventTypeSelect = (typeId: EventTypeId) => {
    setSelectedEventType(typeId);
    const option = EVENT_TYPE_OPTIONS.find(t => t.id === typeId);
    if (option) {
      setTotalBudget(option.defaultBudget);
      setGuestCount(option.typicalGuestRange[0]);
    }
  };

  const handleLiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartLivePlan({
      eventType: selectedEventType,
      guestCount,
      totalBudget,
      vibe: selectedVibe,
      eventName: eventName.trim() || undefined,
      specialNotes: specialNotes.trim() || undefined,
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badgeContainer}>
          <span className={styles.heroBadge}>✨ GenAI Event Planning Assistant</span>
        </div>
        <h1 className={styles.title}>
          Organize Weddings, Birthdays & Community Events with AI Precision
        </h1>
        <p className={styles.subtitle}>
          Generate mathematical itemized budgets, hour-by-hour run-of-shows, vendor contract checklists, and personalized creative concepts in seconds.
        </p>
      </header>

      {/* Main Configuration Card */}
      <section className={styles.configCard} aria-labelledby="config-heading">
        <h2 id="config-heading" className={styles.sectionTitle}>
          Create Your Custom Event Plan
        </h2>

        <form onSubmit={handleLiveSubmit} className={styles.form}>
          {/* Step 1: Event Type */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} id="event-type-label">
              1. Choose Event Type
            </label>
            <div className={styles.eventTypeGrid} role="radiogroup" aria-labelledby="event-type-label">
              {EVENT_TYPE_OPTIONS.map(opt => {
                const isSelected = selectedEventType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    className={`${styles.eventTypeCard} ${isSelected ? styles.cardActive : ''}`}
                    onClick={() => handleEventTypeSelect(opt.id)}
                  >
                    <span className={styles.typeIcon} aria-hidden="true">{opt.icon}</span>
                    <div className={styles.typeContent}>
                      <span className={styles.typeLabel}>{opt.label}</span>
                      <span className={styles.typeTagline}>{opt.tagline}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Guest Count & Budget */}
          <div className={styles.gridTwoCols}>
            <div className={styles.fieldGroup}>
              <label htmlFor="guest-count-input" className={styles.fieldLabel}>
                2. Guest Attendance
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="guest-count-input"
                  type="number"
                  min={1}
                  max={50000}
                  value={guestCount}
                  aria-required="true"
                  onChange={e => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={styles.textInput}
                  required
                />
                <span className={styles.inputSuffix}>guests</span>
              </div>
              <div className={styles.presetChips} role="group" aria-label="Guest count presets">
                {[30, 75, 120, 250].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    aria-label={`Select ${cnt} guests`}
                    className={`${styles.chip} ${guestCount === cnt ? styles.chipActive : ''}`}
                    onClick={() => setGuestCount(cnt)}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="budget-input" className={styles.fieldLabel}>
                3. Total Target Budget ($ USD)
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  id="budget-input"
                  type="number"
                  min={500}
                  max={5000000}
                  step={500}
                  value={totalBudget}
                  aria-required="true"
                  onChange={e => setTotalBudget(Math.max(100, parseInt(e.target.value) || 100))}
                  className={`${styles.textInput} ${styles.inputWithPrefix}`}
                  required
                />
              </div>
              <div className={styles.presetChips} role="group" aria-label="Budget presets">
                {[5000, 15000, 30000, 60000].map(bg => (
                  <button
                    key={bg}
                    type="button"
                    aria-label={`Select $${bg.toLocaleString()} budget`}
                    className={`${styles.chip} ${totalBudget === bg ? styles.chipActive : ''}`}
                    onClick={() => setTotalBudget(bg)}
                  >
                    ${bg.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Vibe & Aesthetics */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} id="vibe-label">
              4. Desired Aesthetic & Vibe
            </label>
            <div className={styles.vibeGrid} role="radiogroup" aria-labelledby="vibe-label">
              {VIBE_OPTIONS.map(vibe => {
                const isSelected = selectedVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    className={`${styles.vibeCard} ${isSelected ? styles.vibeActive : ''}`}
                    onClick={() => setSelectedVibe(vibe.id)}
                  >
                    <div className={styles.vibeColorDots} aria-hidden="true">
                      {vibe.suggestedColors.map(c => (
                        <span key={c} className={styles.colorDot} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className={styles.vibeName}>{vibe.label}</span>
                    <span className={styles.vibeDesc}>{vibe.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Event Name & Special Wishes */}
          <div className={styles.gridTwoCols}>
            <div className={styles.fieldGroup}>
              <label htmlFor="event-name-input" className={styles.fieldLabel}>
                5. Event Name (Optional)
              </label>
              <input
                id="event-name-input"
                type="text"
                placeholder={`e.g., Summer Garden ${currentTypeOption.label}`}
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                maxLength={100}
                className={styles.textInput}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="special-notes-input" className={styles.fieldLabel}>
                6. Specific Requests or Must-Haves
              </label>
              <input
                id="special-notes-input"
                type="text"
                placeholder="e.g., Live acoustic music, oyster bar, outdoor lawn games"
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                maxLength={300}
                className={styles.textInput}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className={styles.submitRow}>
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitBtn} btn-primary`}
            >
              {isLoading ? (
                <span>Synthesizing Plan with Gemini...</span>
              ) : (
                <>
                  <span>✨ Generate Live Plan with Gemini</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Instant Demo Presets Section */}
      <section className={styles.demoSection} aria-labelledby="demo-heading">
        <div className={styles.demoHeader}>
          <h2 id="demo-heading" className={styles.demoTitle}>
            Explore Pre-Configured Turnkey Demos
          </h2>
          <p className={styles.demoSubtitle}>
            Test the full interactive planning assistant instantly with curated production examples (no API key required).
          </p>
        </div>

        <div className={styles.demoGrid}>
          {/* Demo 1: Wedding */}
          <article className={styles.demoCard}>
            <div className={styles.demoIcon}>💒</div>
            <h3 className={styles.demoName}>Vineyard Harmony Wedding</h3>
            <p className={styles.demoMeta}>120 Guests • $32,000 Budget • Rustic Napa Estate</p>
            <p className={styles.demoDesc}>
              Bespoke wine-blending ceremony, 3-course farm-to-table dinner, evening acoustic strings to DJ transitions, and contingency buffer.
            </p>
            <button
              type="button"
              className={`${styles.demoBtn} btn-secondary`}
              onClick={() => onExploreDemo('wedding')}
              aria-label="Explore Wedding Plan: Vineyard Harmony Napa Estate"
            >
              Explore Wedding Plan →
            </button>
          </article>

          {/* Demo 2: Birthday */}
          <article className={styles.demoCard}>
            <div className={styles.demoIcon}>🎂</div>
            <h3 className={styles.demoName}>Neon Nostalgia 30th Birthday</h3>
            <p className={styles.demoMeta}>45 Guests • $6,500 Budget • Downtown Skyline Rooftop</p>
            <p className={styles.demoDesc}>
              Retro arcade console free-play, street-food tapas stations, custom neon photo installations, and rooftop noise curfew coordination.
            </p>
            <button
              type="button"
              className={`${styles.demoBtn} btn-secondary`}
              onClick={() => onExploreDemo('birthday')}
              aria-label="Explore Birthday Plan: Neon Nostalgia 30th Birthday"
            >
              Explore Birthday Plan →
            </button>
          </article>

          {/* Demo 3: Community */}
          <article className={styles.demoCard}>
            <div className={styles.demoIcon}>🎪</div>
            <h3 className={styles.demoName}>Sunset Green Community Arts Festival</h3>
            <p className={styles.demoMeta}>350 Attendees • $14,000 Budget • Public City Park</p>
            <p className={styles.demoDesc}>
              Collaborative 100-tile community mural, zero-waste three-stream recycling, city amplified sound permits, and acoustic main stage.
            </p>
            <button
              type="button"
              className={`${styles.demoBtn} btn-secondary`}
              onClick={() => onExploreDemo('community')}
              aria-label="Explore Community Plan: Sunset Green Arts Festival"
            >
              Explore Community Plan →
            </button>
          </article>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className={styles.pillarsSection} aria-label="System Capabilities">
        <div className={styles.pillar}>
          <div className={styles.pillarIcon}>📊</div>
          <h3 className={styles.pillarTitle}>Mathematical Budget Integrity</h3>
          <p className={styles.pillarText}>
            Deterministic client-side reconciliation ensures category allocations always sum to the exact total with an explicit 8-12% contingency buffer.
          </p>
        </div>
        <div className={styles.pillar}>
          <div className={styles.pillarIcon}>⏱️</div>
          <h3 className={styles.pillarTitle}>Chronological Run-of-Show</h3>
          <p className={styles.pillarText}>
            Phased prep roadmaps combined with hour-by-hour day-of execution schedules with lead vendor ownership and timeline integrity checks.
          </p>
        </div>
        <div className={styles.pillar}>
          <div className={styles.pillarIcon}>📋</div>
          <h3 className={styles.pillarTitle}>Vendor Contract Watchouts</h3>
          <p className={styles.pillarText}>
            Pre-emptive detection of hidden fees, noise ordinance curfews, rain contingency relocations, and overtime deposit penalties.
          </p>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
