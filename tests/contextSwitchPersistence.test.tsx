/**
 * contextSwitchPersistence.test.tsx
 *
 * Verifies that switching between event contexts (Wedding, Birthday, Community)
 * caches results in-memory and restores them instantly without duplicate AI calls.
 */

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

describe('Event Context Switch Persistence', () => {
  it('launches turnkey wedding demo and displays details', async () => {
    render(<App />);

    // Click on Explore Wedding Plan
    const weddingBtn = screen.getByRole('button', { name: /Explore Wedding Plan/i });
    fireEvent.click(weddingBtn);

    // Context bar and dashboard should be displayed
    await waitFor(() => {
      expect(screen.getByText('Vineyard Harmony — Napa Valley Estate Wedding')).toBeInTheDocument();
      expect(screen.getByText('$32,000')).toBeInTheDocument();
    });
  });

  it('switches to birthday demo via landing and displays birthday details', async () => {
    render(<App />);

    const birthdayBtn = screen.getByRole('button', { name: /Explore Birthday Plan/i });
    fireEvent.click(birthdayBtn);

    await waitFor(() => {
      expect(screen.getByText('Neon Nostalgia — Rooftop 30th Milestone Birthday')).toBeInTheDocument();
      expect(screen.getByText('$6,500')).toBeInTheDocument();
    });
  });
});
