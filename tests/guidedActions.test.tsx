/**
 * guidedActions.test.tsx
 *
 * Verifies that the GuidedActions component renders all quick planning tools
 * and triggers tab switching, budget simulation, and question copying.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GuidedActions } from '../src/components/dashboard/GuidedActions';

describe('GuidedActions Component', () => {
  it('renders all quick action chips', () => {
    const handleSelectTab = vi.fn();
    const handleSimulateTrim = vi.fn();
    const handleCopy = vi.fn();
    const handleExport = vi.fn();

    render(
      <GuidedActions
        onSelectTab={handleSelectTab}
        onSimulateTrim={handleSimulateTrim}
        onCopyVendorQuestions={handleCopy}
        onExport={handleExport}
      />
    );

    expect(screen.getByText(/Simulate 10% Savings/i)).toBeInTheDocument();
    expect(screen.getByText(/Vendor Contract Watchouts/i)).toBeInTheDocument();
    expect(screen.getByText(/Day-Of Run of Show/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy Vendor Q&A/i)).toBeInTheDocument();
    expect(screen.getByText(/Print \/ Export Dossier/i)).toBeInTheDocument();
  });

  it('triggers budget trim simulation and tab switch upon click', () => {
    const handleSelectTab = vi.fn();
    const handleSimulateTrim = vi.fn();
    const handleCopy = vi.fn();
    const handleExport = vi.fn();

    render(
      <GuidedActions
        onSelectTab={handleSelectTab}
        onSimulateTrim={handleSimulateTrim}
        onCopyVendorQuestions={handleCopy}
        onExport={handleExport}
      />
    );

    const trimBtn = screen.getByText(/Simulate 10% Savings/i);
    fireEvent.click(trimBtn);

    expect(handleSelectTab).toHaveBeenCalledWith('budget');
    expect(handleSimulateTrim).toHaveBeenCalledTimes(1);
  });

  it('triggers vendor questions copy callback', () => {
    const handleSelectTab = vi.fn();
    const handleSimulateTrim = vi.fn();
    const handleCopy = vi.fn();
    const handleExport = vi.fn();

    render(
      <GuidedActions
        onSelectTab={handleSelectTab}
        onSimulateTrim={handleSimulateTrim}
        onCopyVendorQuestions={handleCopy}
        onExport={handleExport}
      />
    );

    const copyBtn = screen.getByText(/Copy Vendor Q&A/i);
    fireEvent.click(copyBtn);

    expect(handleCopy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Questions Copied!/i)).toBeInTheDocument();
  });
});
