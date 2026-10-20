/**
 * components.test.tsx
 *
 * Integration and UI tests for Planora components:
 * - LandingScreen: parameter configuration, presets, demo launch
 * - LeftPane: tab navigation, checklist interaction, budget details
 * - RightPane: budget simulator adjustments
 * - ContextBar: metrics presentation
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LandingScreen } from '../src/components/landing/LandingScreen';
import { LeftPane } from '../src/components/dashboard/LeftPane';
import { RightPane } from '../src/components/dashboard/RightPane';
import { ContextBar } from '../src/components/dashboard/ContextBar';
import { DEMO_WEDDING_PLAN } from '../src/lib/providers/demoData';
import { reconcileBudget, calculateChecklistProgress, verifyTimelineChronology } from '../src/lib/plannerEngine';

describe('LandingScreen Component', () => {
  it('renders title, event type options, and demo cards', () => {
    const handleLive = vi.fn();
    const handleDemo = vi.fn();

    render(
      <LandingScreen
        onStartLivePlan={handleLive}
        onExploreDemo={handleDemo}
      />
    );

    expect(screen.getByText(/Organize Weddings, Birthdays & Community Events/i)).toBeInTheDocument();
    expect(screen.getByText('Wedding Celebration')).toBeInTheDocument();
    expect(screen.getByText('Milestone Birthday Party')).toBeInTheDocument();
    expect(screen.getByText('Community Event / Festival')).toBeInTheDocument();

    // Check demo buttons
    const demoBtn = screen.getByRole('button', { name: /Explore Wedding Plan/i });
    expect(demoBtn).toBeInTheDocument();

    fireEvent.click(demoBtn);
    expect(handleDemo).toHaveBeenCalledWith('wedding');
  });

  it('allows changing guest count and budget inputs', () => {
    const handleLive = vi.fn();
    const handleDemo = vi.fn();

    render(
      <LandingScreen
        onStartLivePlan={handleLive}
        onExploreDemo={handleDemo}
      />
    );

    const guestInput = screen.getByLabelText(/Guest Attendance/i);
    fireEvent.change(guestInput, { target: { value: '150' } });
    expect(guestInput).toHaveValue(150);

    const budgetInput = screen.getByLabelText(/Total Target Budget/i);
    fireEvent.change(budgetInput, { target: { value: '45000' } });
    expect(budgetInput).toHaveValue(45000);
  });
});

describe('ContextBar Component', () => {
  it('displays active event metadata and triggers callbacks', () => {
    const handleSwitch = vi.fn();
    const handleExport = vi.fn();

    render(
      <ContextBar
        eventName="Napa Estate Wedding"
        eventType="wedding"
        guestCount={120}
        totalBudget={32000}
        currency="$"
        onSwitchContext={handleSwitch}
        onExportClick={handleExport}
      />
    );

    expect(screen.getByText('Napa Estate Wedding')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('$32,000')).toBeInTheDocument();

    const changeBtn = screen.getByRole('button', { name: /Change Event/i });
    fireEvent.click(changeBtn);
    expect(handleSwitch).toHaveBeenCalledTimes(1);

    const exportBtn = screen.getByRole('button', { name: /Export or print event plan/i });
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalledTimes(1);
  });
});

describe('LeftPane Component', () => {
  it('renders overview tab and switches tabs upon user click', () => {
    const handleTabChange = vi.fn();
    const handleToggleTask = vi.fn();
    const reconciled = reconcileBudget(DEMO_WEDDING_PLAN);
    const progress = calculateChecklistProgress(DEMO_WEDDING_PLAN.vendor_checklists, new Set());
    const timelineCheck = verifyTimelineChronology(DEMO_WEDDING_PLAN.day_of_timeline);

    const { rerender } = render(
      <LeftPane
        plan={DEMO_WEDDING_PLAN}
        activeTab="overview"
        onTabChange={handleTabChange}
        checkedTaskIds={new Set()}
        onToggleTask={handleToggleTask}
        reconciledBudget={reconciled}
        checklistProgress={progress}
        timelineCheck={timelineCheck}
      />
    );

    expect(screen.getByText(/Executive Vision/i)).toBeInTheDocument();
    expect(screen.getByText(DEMO_WEDDING_PLAN.executive_summary)).toBeInTheDocument();

    // Switch to budget tab
    const budgetTabBtn = screen.getByRole('tab', { name: /Budget Breakdown/i });
    fireEvent.click(budgetTabBtn);
    expect(handleTabChange).toHaveBeenCalledWith('budget');

    // Rerender with activeTab="budget"
    rerender(
      <LeftPane
        plan={DEMO_WEDDING_PLAN}
        activeTab="budget"
        onTabChange={handleTabChange}
        checkedTaskIds={new Set()}
        onToggleTask={handleToggleTask}
        reconciledBudget={reconciled}
        checklistProgress={progress}
        timelineCheck={timelineCheck}
      />
    );

    expect(screen.getByText(/Estate Venue & Grounds/i)).toBeInTheDocument();
    expect(screen.getByText(/Farm-to-Table Dinner & Wine Bar/i)).toBeInTheDocument();
    expect(screen.getByText(/Contingency Reserve/i)).toBeInTheDocument();
  });
});

describe('RightPane Component', () => {
  it('allows adjusting budget simulator slider', () => {
    const handleBudgetChange = vi.fn();
    const handleExport = vi.fn();
    const exportMarkdown = () => '# Markdown Plan';

    render(
      <RightPane
        plan={DEMO_WEDDING_PLAN}
        customBudget={null}
        onBudgetChange={handleBudgetChange}
        onExport={handleExport}
        exportMarkdown={exportMarkdown}
      />
    );

    expect(screen.getByText(/Budget Trade-Off Simulator/i)).toBeInTheDocument();
    expect(screen.getByText('$32,000')).toBeInTheDocument();

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '40000' } });
    expect(handleBudgetChange).toHaveBeenCalledWith(40000);
  });
});
