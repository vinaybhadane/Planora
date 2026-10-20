import styles from './Disclaimer.module.css';

interface DisclaimerProps {
  text?: string;
}

export function Disclaimer({ text }: DisclaimerProps) {
  return (
    <footer className={styles.disclaimer} role="contentinfo">
      <p className={styles.text}>
        {text ??
          'Planora provides informational planning frameworks, estimated allocations, and creative concepts. Always verify vendor quotes, permits, insurance requirements, and venue restrictions directly before committing funds or signing binding agreements.'}
      </p>
    </footer>
  );
}

// Backward compatibility export
export const LegalDisclaimer = Disclaimer;
