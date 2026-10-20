/**
 * skipLink.test.tsx
 *
 * Verifies accessibility skip-link in App.
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

describe('Accessibility Skip Link', () => {
  it('renders skip link targeting main-content', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /Skip to main content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });
});
