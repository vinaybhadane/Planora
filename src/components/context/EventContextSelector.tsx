/**
 * EventContextSelector.tsx — Modal dialog for switching event context.
 *
 * Lets users switch between Wedding, Birthday, Community Festival, and Gala
 * mid-session while utilizing in-memory session caching for instant responsiveness.
 */

import { useState } from 'react';
import type { EventTypeId, VibeId } from '../../lib/domain';
import { EVENT_TYPE_OPTIONS, VIBE_OPTIONS } from '../../lib/domain';
import styles from './EventContextSelector.module.css';

interface EventContextSelectorProps {
  currentEventType: EventTypeId;
  currentVibe: VibeId;
  currentBudget: number;
  currentGuestCount: number;
  onApply: (params: {
    eventType: EventTypeId;
    vibe: VibeId;
    budget: number;
    guestCount: number;
  }) => void;
  onCancel: () => void;
}

export function EventContextSelector({
  currentEventType,
  currentVibe,
  currentBudget,
  currentGuestCount,
  onApply,
  onCancel,
}: EventContextSelectorProps) {
  const [eventType, setEventType] = useState<EventTypeId>(currentEventType);
  const [vibe, setVibe] = useState<VibeId>(currentVibe);
  const [budget, setBudget] = useState<number>(currentBudget);
  const [guestCount, setGuestCount] = useState<number>(currentGuestCount);

  const handleTypeChange = (newType: EventTypeId) => {
    setEventType(newType);
    const opt = EVENT_TYPE_OPTIONS.find(o => o.id === newType);
    if (opt) {
      setBudget(opt.defaultBudget);
      setGuestCount(opt.typicalGuestRange[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      eventType,
      vibe,
      budget,
      guestCount,
    });
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="context-selector-title"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 id="context-selector-title" className={styles.title}>
            Switch Event Context
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {/* Event Type */}
          <div className={styles.section}>
            <label className={styles.label}>Event Type</label>
            <div className={styles.typeGrid}>
              {EVENT_TYPE_OPTIONS.map(opt => {
                const isSelected = eventType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.typeOption} ${isSelected ? styles.typeSelected : ''}`}
                    onClick={() => handleTypeChange(opt.id)}
                  >
                    <span className={styles.typeIcon}>{opt.icon}</span>
                    <span className={styles.typeText}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Count & Budget */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="ctx-guests" className={styles.label}>
                Guest Count
              </label>
              <input
                id="ctx-guests"
                type="number"
                min={1}
                max={50000}
                value={guestCount}
                onChange={e => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="ctx-budget" className={styles.label}>
                Total Budget ($)
              </label>
              <input
                id="ctx-budget"
                type="number"
                min={100}
                step={500}
                value={budget}
                onChange={e => setBudget(Math.max(100, parseInt(e.target.value) || 100))}
                className={styles.input}
              />
            </div>
          </div>

          {/* Vibe Selection */}
          <div className={styles.section}>
            <label className={styles.label}>Aesthetic / Vibe</label>
            <div className={styles.vibeGrid}>
              {VIBE_OPTIONS.map(v => {
                const isSelected = vibe === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`${styles.vibePill} ${isSelected ? styles.vibeSelected : ''}`}
                    onClick={() => setVibe(v.id)}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Apply & Update Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Backward compatibility export
export const ContextSelector = EventContextSelector;
