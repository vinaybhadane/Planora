import type { ReactNode } from 'react';
import styles from './TwoPaneLayout.module.css';

interface TwoPaneLayoutProps {
  leftPane: ReactNode;
  rightPane: ReactNode;
}

export function TwoPaneLayout({ leftPane, rightPane }: TwoPaneLayoutProps) {
  return (
    <main className={styles.container} id="main-content">
      <div className={styles.leftPane}>{leftPane}</div>
      <div className={styles.rightPane}>{rightPane}</div>
    </main>
  );
}
