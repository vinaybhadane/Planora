/**
 * accessibility.test.tsx
 *
 * Comprehensive WCAG 2.1 AA Accessibility & Keyboard Navigation tests:
 * 1. Skip-to-content bypass block landmark (#main-content) across all stages.
 * 2. WAI-ARIA tablist & tabpanel pattern in LeftPane and RightPane.
 * 3. Range slider accessibility (aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext).
 * 4. Progressbar accessibility (role, aria-valuenow, aria-valuemin, aria-valuemax, aria-label).
 * 5. Modal dialog pattern (role="dialog", aria-modal="true", Escape key dismissal).
 * 6. Radiogroup and radio button semantics in LandingScreen and EventContextSelector.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';
import { LeftPane } from '../src/components/dashboard/LeftPane';
import { RightPane } from '../src/components/dashboard/RightPane';
import { LandingScreen } from '../src/components/landing/LandingScreen';
import { EventContextSelector } from '../src/components/context/EventContextSelector';
import { DEMO_WEDDING_PLAN } from '../src/lib/providers/demoData';
import { calculateChecklistProgress, reconcileBudget, verifyTimelineChronology } from '../src/lib/plannerEngine';

describe('WCAG 2.1 AA Accessibility Tests', () => {
  it('renders skip link targeting #main-content on landing screen', () => {
    const { container } = render(<App />);
    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const mainElement = container.querySelector('#main-content');
    expect(mainElement).toBeInTheDocument();
  });

  it('verifies WAI-ARIA tablist and tabpanel semantics in LeftPane', () => {
    const handleTab = vi.fn();
    const handleToggle = vi.fn();
    const progress = calculateChecklistProgress(DEMO_WEDDING_PLAN.vendor_checklists, new Set());
    const reconciled = reconcileBudget(DEMO_WEDDING_PLAN);
    const timelineCheck = verifyTimelineChronology(DEMO_WEDDING_PLAN.day_of_timeline);

    render(
      <LeftPane
        plan={DEMO_WEDDING_PLAN}
        activeTab="overview"
        onTabChange={handleTab}
        checkedTaskIds={new Set()}
        onToggleTask={handleToggle}
        reconciledBudget={reconciled}
        checklistProgress={progress}
        timelineCheck={timelineCheck}
      />
    );

    const tablist = screen.getByRole('tablist', { name: /Planning Sections/i });
    expect(tablist).toBeInTheDocument();

    const overviewTab = screen.getByRole('tab', { name: /Overview/i });
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    expect(overviewTab).toHaveAttribute('aria-controls', 'panel-overview');

    const overviewPanel = screen.getByRole('tabpanel');
    expect(overviewPanel).toHaveAttribute('id', 'panel-overview');
    expect(overviewPanel).toHaveAttribute('aria-labelledby', 'tab-overview');
  });

  it('verifies progressbar ARIA attributes in LeftPane vendors tab', () => {
    const handleTab = vi.fn();
    const handleToggle = vi.fn();
    const progress = calculateChecklistProgress(DEMO_WEDDING_PLAN.vendor_checklists, new Set());
    const reconciled = reconcileBudget(DEMO_WEDDING_PLAN);
    const timelineCheck = verifyTimelineChronology(DEMO_WEDDING_PLAN.day_of_timeline);

    render(
      <LeftPane
        plan={DEMO_WEDDING_PLAN}
        activeTab="vendors"
        onTabChange={handleTab}
        checkedTaskIds={new Set()}
        onToggleTask={handleToggle}
        reconciledBudget={reconciled}
        checklistProgress={progress}
        timelineCheck={timelineCheck}
      />
    );

    const progressBar = screen.getByRole('progressbar', { name: /Overall Checklist Completion/i });
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('verifies range slider ARIA attributes in RightPane', () => {
    const handleBudget = vi.fn();
    const handleExport = vi.fn();

    render(
      <RightPane
        plan={DEMO_WEDDING_PLAN}
        customBudget={null}
        onBudgetChange={handleBudget}
        onExport={handleExport}
        exportMarkdown={() => '# Test'}
      />
    );

    const slider = screen.getByRole('slider', { name: /Simulated Total Budget/i });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', String(DEMO_WEDDING_PLAN.total_budget));
    expect(slider).toHaveAttribute('aria-valuemin');
    expect(slider).toHaveAttribute('aria-valuemax');
    expect(slider).toHaveAttribute('aria-valuetext', '$32,000');
  });

  it('verifies radiogroup and radio attributes in LandingScreen', () => {
    render(
      <LandingScreen
        onStartLivePlan={vi.fn()}
        onExploreDemo={vi.fn()}
      />
    );

    const eventRadiogroup = screen.getByRole('radiogroup', { name: /Choose Event Type/i });
    expect(eventRadiogroup).toBeInTheDocument();

    const weddingRadio = screen.getByRole('radio', { name: /Wedding Celebration/i });
    expect(weddingRadio).toHaveAttribute('aria-checked', 'true');

    const birthdayRadio = screen.getByRole('radio', { name: /Milestone Birthday Party/i });
    expect(birthdayRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('verifies modal dialog dismisses on Escape key in EventContextSelector', () => {
    const handleCancel = vi.fn();

    render(
      <EventContextSelector
        currentEventType="wedding"
        currentVibe="romantic-elegant"
        currentBudget={25000}
        currentGuestCount={100}
        onApply={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const dialog = screen.getByRole('dialog', { name: /Switch Event Context/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
