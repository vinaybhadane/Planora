/**
 * RightPane.tsx — Interactive planning tools & dossier inspector.
 *
 * Houses:
 * 1. Interactive Budget Simulator (dynamic slider & instant reallocation)
 * 2. Contract Risk Radar (aggregates all watchout clauses)
 * 3. Export & Print-ready Dossier generator
 */

import { useState } from 'react';
import type { PlanResult } from '../../lib/schema';
import { formatCurrency } from '../../lib/domain';
import styles from './RightPane.module.css';

type ToolTab = 'simulator' | 'radar' | 'export';

interface RightPaneProps {
  plan: PlanResult;
  customBudget: number | null;
  onBudgetChange: (newBudget: number | null) => void;
  onExport: () => void;
  exportMarkdown: () => string;
}

export function RightPane({
  plan,
  customBudget,
  onBudgetChange,
  onExport,
  exportMarkdown,
}: RightPaneProps) {
  const [activeTool, setActiveTool] = useState<'simulator' | 'radar' | 'export'>('simulator');
  const [copied, setCopied] = useState(false);

  const currentTotal = customBudget ?? plan.total_budget;
  const contingencyPct = plan.contingency_fund.percentage;
  const contingencyAmt = Math.round((contingencyPct / 100) * currentTotal);
  const categoriesPool = currentTotal - contingencyAmt;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onBudgetChange(val);
  };

  const handleResetBudget = () => {
    onBudgetChange(null);
  };

  const handleCopyMarkdown = () => {
    const text = exportMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract all contract watchouts across all vendor categories
  const allContractClauses = plan.vendor_checklists.flatMap(cat =>
    cat.contract_clauses_to_watch.map(clause => ({
      category: cat.category_name,
      clause,
    }))
  );

  const TOOL_ORDER: ToolTab[] = ['simulator', 'radar', 'export'];

  const handleToolKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = TOOL_ORDER.indexOf(activeTool);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % TOOL_ORDER.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + TOOL_ORDER.length) % TOOL_ORDER.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = TOOL_ORDER.length - 1;
    }

    if (targetIndex !== -1) {
      const nextTool = TOOL_ORDER[targetIndex];
      setActiveTool(nextTool);
      document.getElementById(`tool-tab-${nextTool}`)?.focus();
    }
  };

  return (
    <aside className={styles.container} aria-label="Interactive Planning Tools">
      {/* Sub-tool switcher */}
      <div className={styles.toolHeader}>
        <div
          className={styles.toolTabs}
          role="tablist"
          aria-label="Planning Utilities"
          onKeyDown={handleToolKeyDown}
        >
          <button
            type="button"
            role="tab"
            id="tool-tab-simulator"
            aria-selected={activeTool === 'simulator'}
            aria-controls="tool-panel-simulator"
            tabIndex={activeTool === 'simulator' ? 0 : -1}
            className={`${styles.toolTab} ${activeTool === 'simulator' ? styles.toolTabActive : ''}`}
            onClick={() => setActiveTool('simulator')}
          >
            🎛️ Simulator
          </button>
          <button
            type="button"
            role="tab"
            id="tool-tab-radar"
            aria-selected={activeTool === 'radar'}
            aria-controls="tool-panel-radar"
            tabIndex={activeTool === 'radar' ? 0 : -1}
            className={`${styles.toolTab} ${activeTool === 'radar' ? styles.toolTabActive : ''}`}
            onClick={() => setActiveTool('radar')}
          >
            ⚠️ Risk Radar
          </button>
          <button
            type="button"
            role="tab"
            id="tool-tab-export"
            aria-selected={activeTool === 'export'}
            aria-controls="tool-panel-export"
            tabIndex={activeTool === 'export' ? 0 : -1}
            className={`${styles.toolTab} ${activeTool === 'export' ? styles.toolTabActive : ''}`}
            onClick={() => setActiveTool('export')}
          >
            📄 Export
          </button>
        </div>
      </div>

      <div
        className={styles.toolBody}
        role="tabpanel"
        id={`tool-panel-${activeTool}`}
        aria-labelledby={`tool-tab-${activeTool}`}
        tabIndex={0}
      >
        {/* TOOL 1: BUDGET SIMULATOR */}
        {activeTool === 'simulator' && (
          <div className={styles.section}>
            <div className={styles.simHeader}>
              <h2 className={styles.simTitle}>Budget Trade-Off Simulator</h2>
              {customBudget !== null && (
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={handleResetBudget}
                  title="Reset to original generated budget"
                  aria-label="Reset to original generated budget"
                >
                  Reset
                </button>
              )}
            </div>
            <p className={styles.simDesc}>
              Simulate budget adjustments locally. Category allocations scale deterministically while safeguarding your {contingencyPct}% contingency buffer.
            </p>

            {/* Total Budget Slider */}
            <div className={styles.sliderBox}>
              <div className={styles.sliderLabels}>
                <label htmlFor="budget-simulator-range" className={styles.sliderTitle}>
                  Simulated Total
                </label>
                <span className={styles.sliderValue} aria-live="polite">
                  {formatCurrency(currentTotal, plan.currency)}
                </span>
              </div>
              <input
                id="budget-simulator-range"
                type="range"
                aria-label="Simulated Total Budget"
                min={Math.round(plan.total_budget * 0.5)}
                max={Math.round(plan.total_budget * 1.8)}
                step={250}
                value={currentTotal}
                aria-valuenow={currentTotal}
                aria-valuemin={Math.round(plan.total_budget * 0.5)}
                aria-valuemax={Math.round(plan.total_budget * 1.8)}
                aria-valuetext={formatCurrency(currentTotal, plan.currency)}
                onChange={handleSliderChange}
                className={styles.rangeInput}
              />
              <div className={styles.sliderRangeLimits}>
                <span>{formatCurrency(plan.total_budget * 0.5, plan.currency)}</span>
                <span>Base: {formatCurrency(plan.total_budget, plan.currency)}</span>
                <span>{formatCurrency(plan.total_budget * 1.8, plan.currency)}</span>
              </div>
            </div>

            {/* Category breakdown visualizer */}
            <div className={styles.allocationsList}>
              <h3 className={styles.subHeading}>Calculated Category Allocations</h3>
              {plan.budget_breakdown.map(cat => {
                const simulatedAmt = Math.round((cat.percentage / 100) * categoriesPool);
                return (
                  <div key={cat.id} className={styles.allocRow}>
                    <div className={styles.allocTop}>
                      <span className={styles.allocName}>{cat.name}</span>
                      <span className={styles.allocAmount}>
                        {formatCurrency(simulatedAmt, plan.currency)}
                      </span>
                    </div>
                    <div className={styles.allocTrack}>
                      <div
                        className={styles.allocFill}
                        style={{ width: `${Math.min(100, cat.percentage * 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Contingency line */}
              <div className={styles.allocRow}>
                <div className={styles.allocTop}>
                  <span className={styles.allocName}>🛡️ Contingency Reserve ({contingencyPct}%)</span>
                  <span className={styles.allocAmount}>
                    {formatCurrency(contingencyAmt, plan.currency)}
                  </span>
                </div>
                <div className={styles.allocTrack}>
                  <div
                    className={styles.allocFillContingency}
                    style={{ width: `${Math.min(100, contingencyPct * 2)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 2: CONTRACT RISK RADAR */}
        {activeTool === 'radar' && (
          <div className={styles.section}>
            <h2 className={styles.simTitle}>Contract Risk Radar</h2>
            <p className={styles.simDesc}>
              Crucial contractual watchouts to review before depositing earnest money or signing agreements:
            </p>

            <div className={styles.clausesList}>
              {allContractClauses.length > 0 ? (
                allContractClauses.map((item, idx) => (
                  <div key={idx} className={styles.clauseCard}>
                    <span className={styles.clauseCategory}>{item.category}</span>
                    <p className={styles.clauseDetail}>⚠️ {item.clause}</p>
                  </div>
                ))
              ) : (
                <p className={styles.simDesc}>No contract watchouts flagged.</p>
              )}
            </div>
          </div>
        )}

        {/* TOOL 3: EXPORT & PRINT */}
        {activeTool === 'export' && (
          <div className={styles.section}>
            <h2 className={styles.simTitle}>Export Planning Dossier</h2>
            <p className={styles.simDesc}>
              Share, copy, or print a run-of-show and comprehensive planning packet.
            </p>

            <div className={styles.exportActions}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyMarkdown}
                aria-label="Copy markdown plan to clipboard"
              >
                {copied ? '✅ Markdown Copied!' : '📋 Copy as Markdown'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onExport}
                aria-label="Print run of show planning dossier"
              >
                🖨️ Print Run of Show
              </button>
            </div>

            <div className={styles.markdownPreview}>
              <pre className={styles.previewCode}>{exportMarkdown()}</pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
