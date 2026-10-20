/**
 * GuidedActions.tsx — Contextual assistant action bar.
 *
 * Provides quick 1-click strategic tools:
 * - Budget optimizer / trade-off shortcut
 * - Critical vendor tasks filter
 * - Contingency rationale deep dive
 * - Printable run-of-show trigger
 */

import { useState } from 'react';
import styles from './GuidedActions.module.css';

interface GuidedActionsProps {
  onSelectTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'questions') => void;
  onSimulateTrim: () => void;
  onCopyVendorQuestions: () => void;
  onExport: () => void;
}

export function GuidedActions({
  onSelectTab,
  onSimulateTrim,
  onCopyVendorQuestions,
  onExport,
}: GuidedActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyVendorQuestions();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className={styles.container} aria-label="Quick Planning Tools">
      <span className={styles.label}>Quick Tools:</span>

      <div className={styles.chips}>
        <button
          type="button"
          className={styles.chip}
          onClick={() => {
            onSelectTab('budget');
            onSimulateTrim();
          }}
          title="Simulate a 10% cost-saving reduction across categories"
          aria-label="Simulate a 10% cost-saving reduction across categories"
        >
          💰 Simulate 10% Savings
        </button>

        <button
          type="button"
          className={styles.chip}
          onClick={() => onSelectTab('vendors')}
          title="View vendor contract watchouts and critical items"
          aria-label="View vendor contract watchouts and critical items"
        >
          ⚠️ Vendor Contract Watchouts
        </button>

        <button
          type="button"
          className={styles.chip}
          onClick={() => onSelectTab('timeline')}
          title="View hour-by-hour day of schedule"
          aria-label="View hour-by-hour day of schedule"
        >
          ⏱️ Day-Of Run of Show
        </button>

        <button
          type="button"
          className={styles.chip}
          onClick={handleCopy}
          title="Copy vendor interview questions to clipboard"
          aria-label="Copy vendor interview questions to clipboard"
        >
          {copied ? '✅ Questions Copied!' : '📋 Copy Vendor Q&A'}
        </button>

        <button
          type="button"
          className={styles.chip}
          onClick={onExport}
          title="Print or export the full planning dossier"
          aria-label="Print or export the full planning dossier"
        >
          🖨️ Print / Export Dossier
        </button>
      </div>
    </nav>
  );
}
