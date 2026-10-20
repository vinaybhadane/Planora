/**
 * ContextBar.tsx — Top control bar for the active event dashboard.
 *
 * Displays the current event name, type, budget, guest count,
 * and quick actions for switching context and exporting the plan.
 */

import { formatCurrency } from '../../lib/domain';
import styles from './ContextBar.module.css';

interface ContextBarProps {
  eventName: string;
  eventType: string;
  guestCount: number;
  totalBudget: number;
  currency?: string;
  onSwitchContext: () => void;
  onExportClick: () => void;
}

export function ContextBar({
  eventName,
  eventType,
  guestCount,
  totalBudget,
  currency = '$',
  onSwitchContext,
  onExportClick,
}: ContextBarProps) {
  return (
    <header className={styles.bar} role="banner">
      <div className={styles.left}>
        <span className={styles.typeBadge}>{eventType.toUpperCase()}</span>
        <h1 className={styles.eventName}>{eventName}</h1>
      </div>

      <div className={styles.centerMetrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Guests</span>
          <span className={styles.metricValue}>{guestCount.toLocaleString()}</span>
        </div>
        <div className={styles.metricDivider} aria-hidden="true" />
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Target Budget</span>
          <span className={styles.metricValue}>{formatCurrency(totalBudget, currency)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onExportClick}
          aria-label="Export or print event plan"
        >
          📄 Export Plan
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onSwitchContext}
          aria-label="Change event parameters or switch event"
        >
          ⚙️ Change Event
        </button>
      </div>
    </header>
  );
}
