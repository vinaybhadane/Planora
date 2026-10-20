/**
 * LeftPane.tsx — Primary planning workspace.
 *
 * Houses tabbed views for:
 * - Overview & Theme / Color Palette
 * - Itemized Budget & Contingency Fund
 * - Phased Timeline & Day-of Schedule
 * - Interactive Vendor Checklists & Contract Watchouts
 * - Personalized Creative Ideas
 * - Questions for Vendors
 */

import { useState } from 'react';
import type { PlanResult } from '../../lib/schema';
import type { DashboardTab } from '../../hooks/usePlanner';
import type {
  BudgetReconciliationResult,
  ChecklistProgress,
  TimelineSequenceCheck,
} from '../../lib/plannerEngine';
import { formatCurrency } from '../../lib/domain';
import styles from './LeftPane.module.css';

interface LeftPaneProps {
  plan: PlanResult;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  checkedTaskIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  reconciledBudget: BudgetReconciliationResult | null;
  checklistProgress: ChecklistProgress | null;
  timelineCheck: TimelineSequenceCheck | null;
}

export function LeftPane({
  plan,
  activeTab,
  onTabChange,
  checkedTaskIds,
  onToggleTask,
  reconciledBudget,
  checklistProgress,
  timelineCheck,
}: LeftPaneProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(id);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className={styles.container}>
      {/* Tab Navigation */}
      <nav className={styles.tabNav} role="tablist" aria-label="Planning Sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('overview')}
        >
          📌 Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'budget'}
          className={`${styles.tabBtn} ${activeTab === 'budget' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('budget')}
        >
          💰 Budget Breakdown
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'timeline'}
          className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('timeline')}
        >
          ⏱️ Timelines & Day-Of
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'vendors'}
          className={`${styles.tabBtn} ${activeTab === 'vendors' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('vendors')}
        >
          📋 Vendor Checklists
          {checklistProgress && (
            <span className={styles.tabCounter}>
              {checklistProgress.completedTasks}/{checklistProgress.totalTasks}
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ideas'}
          className={`${styles.tabBtn} ${activeTab === 'ideas' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('ideas')}
        >
          💡 Creative Ideas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'questions'}
          className={`${styles.tabBtn} ${activeTab === 'questions' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('questions')}
        >
          ❓ Vendor Q&A
        </button>
      </nav>

      {/* Tab Content Panels */}
      <div className={styles.content}>
        {/* TAB 1: OVERVIEW & THEME */}
        {activeTab === 'overview' && (
          <div className={styles.tabPanel} role="tabpanel">
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Executive Vision</h2>
              <p className={styles.summaryText}>{plan.executive_summary}</p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Theme & Visual Direction</h2>
              <div className={styles.themeHeader}>
                <span className={styles.themeName}>{plan.theme_and_vibe.theme_name}</span>
              </div>
              <p className={styles.themeNotes}>{plan.theme_and_vibe.aesthetic_notes}</p>

              {/* Color Palette */}
              <div className={styles.colorPalette}>
                <h3 className={styles.subHeading}>Curated Color Palette (Click to Copy)</h3>
                <div className={styles.paletteGrid}>
                  {plan.theme_and_vibe.color_palette.map(swatch => {
                    const isCopied = copiedHex === swatch.hex;
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        className={styles.swatchCard}
                        onClick={() => copyToClipboard(swatch.hex, swatch.hex)}
                        title={`Click to copy ${swatch.hex}`}
                      >
                        <div
                          className={styles.swatchColor}
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className={styles.swatchName}>{swatch.name}</span>
                        <span className={styles.swatchHex}>
                          {isCopied ? 'Copied!' : swatch.hex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Signature Touch Callout */}
              <div className={styles.signatureBox}>
                <div className={styles.signatureIcon}>✨</div>
                <div>
                  <h4 className={styles.signatureTitle}>Signature Guest Touch</h4>
                  <p className={styles.signatureText}>{plan.theme_and_vibe.signature_touch}</p>
                </div>
              </div>
            </section>

            {/* Risks & Mitigations */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Key Risks & Pre-Emptive Mitigations</h2>
              <div className={styles.riskList}>
                {plan.risks_and_mitigations.map((item, idx) => (
                  <div key={idx} className={styles.riskItem}>
                    <div className={styles.riskHeader}>
                      <span
                        className={`${styles.severityBadge} ${
                          item.severity === 'high'
                            ? styles.sevHigh
                            : item.severity === 'medium'
                            ? styles.sevMed
                            : styles.sevLow
                        }`}
                      >
                        {item.severity.toUpperCase()} RISK
                      </span>
                      <strong className={styles.riskTitle}>{item.risk}</strong>
                    </div>
                    <p className={styles.riskMitigation}>
                      <strong>Mitigation:</strong> {item.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: BUDGET BREAKDOWN */}
        {activeTab === 'budget' && (
          <div className={styles.tabPanel} role="tabpanel">
            {/* Budget Health Header */}
            {reconciledBudget && (
              <div className={styles.healthBanner}>
                <div className={styles.healthLeft}>
                  <span className={styles.healthTag}>
                    Status: {reconciledBudget.status.toUpperCase()}
                  </span>
                  <span className={styles.healthSub}>
                    Total: {formatCurrency(reconciledBudget.totalBudget, plan.currency)} • Allocated: {formatCurrency(reconciledBudget.allocatedSum, plan.currency)} • Contingency: {formatCurrency(reconciledBudget.contingencyAmount, plan.currency)}
                  </span>
                </div>
                {reconciledBudget.warnings.length > 0 && (
                  <div className={styles.warningsBox}>
                    {reconciledBudget.warnings.map((w, i) => (
                      <p key={i}>⚠️ {w}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contingency Callout */}
            <div className={styles.contingencyCard}>
              <div className={styles.contingencyHeader}>
                <span className={styles.contingencyIcon}>🛡️</span>
                <div>
                  <h3 className={styles.contingencyTitle}>
                    Contingency Reserve: {formatCurrency(plan.contingency_fund.amount, plan.currency)} ({plan.contingency_fund.percentage}%)
                  </h3>
                  <p className={styles.contingencyText}>{plan.contingency_fund.rationale}</p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className={styles.categoriesList}>
              {plan.budget_breakdown.map(cat => (
                <article key={cat.id} className={styles.categoryCard}>
                  <div className={styles.categoryTop}>
                    <div>
                      <h3 className={styles.catName}>{cat.name}</h3>
                      <span className={styles.catTip}>💡 {cat.cost_saving_tip}</span>
                    </div>
                    <div className={styles.catAmounts}>
                      <span className={styles.catAmount}>
                        {formatCurrency(cat.allocated_amount, plan.currency)}
                      </span>
                      <span className={styles.catPercent}>{cat.percentage}% of total</span>
                    </div>
                  </div>

                  {/* Sub-items */}
                  {cat.items && cat.items.length > 0 && (
                    <table className={styles.itemTable}>
                      <thead>
                        <tr>
                          <th>Itemized Expense</th>
                          <th>Priority</th>
                          <th className={styles.textRight}>Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>
                              <span
                                className={
                                  item.priority === 'must-have'
                                    ? styles.mustHaveBadge
                                    : styles.niceBadge
                                }
                              >
                                {item.priority}
                              </span>
                            </td>
                            <td className={styles.textRight}>
                              {formatCurrency(item.estimated_cost, plan.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TIMELINE & DAY-OF */}
        {activeTab === 'timeline' && (
          <div className={styles.tabPanel} role="tabpanel">
            {/* Phased Roadmap */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Phased Preparation Roadmap</h2>
              <div className={styles.phasesContainer}>
                {plan.timeline_phases.map(phase => (
                  <div key={phase.id} className={styles.phaseBlock}>
                    <h3 className={styles.phaseTitle}>{phase.phase_name}</h3>
                    <div className={styles.milestoneList}>
                      {phase.milestones.map(m => (
                        <div key={m.id} className={styles.milestoneItem}>
                          <div className={styles.milestoneHeader}>
                            <span className={styles.milestoneWindow}>{m.due_window}</span>
                            <span
                              className={
                                m.importance === 'critical'
                                  ? styles.sevHigh
                                  : styles.sevLow
                              }
                            >
                              {m.importance.toUpperCase()}
                            </span>
                          </div>
                          <span className={styles.milestoneTitleText}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Day of Schedule */}
            <section className={styles.card}>
              <div className={styles.scheduleHeader}>
                <h2 className={styles.cardTitle}>Day-of Run of Show (Hour by Hour)</h2>
                {timelineCheck && !timelineCheck.isChronological && (
                  <span className={styles.timelineWarning}>⚠️ Chronology issues detected</span>
                )}
              </div>

              <div className={styles.dayOfList}>
                {plan.day_of_timeline.map(slot => (
                  <div key={slot.id} className={styles.scheduleSlot}>
                    <div className={styles.slotTime}>{slot.time}</div>
                    <div className={styles.slotDetails}>
                      <div className={styles.slotTop}>
                        <strong className={styles.slotActivity}>{slot.activity}</strong>
                        <span className={styles.slotLead}>Lead: {slot.lead_responsible}</span>
                      </div>
                      {slot.notes && <p className={styles.slotNotes}>{slot.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: VENDOR CHECKLISTS */}
        {activeTab === 'vendors' && (
          <div className={styles.tabPanel} role="tabpanel">
            {/* Overall Progress */}
            {checklistProgress && (
              <div className={styles.progressCard}>
                <div className={styles.progressTop}>
                  <span className={styles.progressLabel}>Overall Checklist Completion</span>
                  <span className={styles.progressPercent}>{checklistProgress.percentComplete}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${checklistProgress.percentComplete}%` }}
                  />
                </div>
                <span className={styles.progressMeta}>
                  {checklistProgress.completedTasks} of {checklistProgress.totalTasks} items confirmed • {checklistProgress.criticalTotal - checklistProgress.criticalCompleted} critical actions remaining
                </span>
              </div>
            )}

            {/* Checklists per category */}
            <div className={styles.checklistCategories}>
              {plan.vendor_checklists.map(cat => (
                <div key={cat.category_id} className={styles.catChecklistCard}>
                  <h3 className={styles.catChecklistTitle}>{cat.category_name}</h3>

                  <div className={styles.taskItemsList}>
                    {cat.checklist_items.map(item => {
                      const isChecked = checkedTaskIds.has(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`${styles.taskItem} ${isChecked ? styles.taskChecked : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleTask(item.id)}
                            className={styles.checkbox}
                          />
                          <div className={styles.taskContent}>
                            <span className={styles.taskText}>{item.task}</span>
                            <div className={styles.taskBadges}>
                              <span className={styles.deadlineBadge}>Due: {item.deadline}</span>
                              {item.critical && (
                                <span className={styles.criticalBadge}>CRITICAL</span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {cat.contract_clauses_to_watch.length > 0 && (
                    <div className={styles.clauseBox}>
                      <h4 className={styles.clauseTitle}>⚠️ Contract Clauses to Watch:</h4>
                      <ul className={styles.clauseList}>
                        {cat.contract_clauses_to_watch.map((clause, idx) => (
                          <li key={idx} className={styles.clauseText}>
                            {clause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CREATIVE IDEAS */}
        {activeTab === 'ideas' && (
          <div className={styles.tabPanel} role="tabpanel">
            <div className={styles.ideasGrid}>
              {plan.personalized_ideas.map(idea => (
                <div key={idea.id} className={styles.ideaCard}>
                  <div className={styles.ideaBadges}>
                    <span className={styles.ideaCategory}>{idea.category.toUpperCase()}</span>
                    <span
                      className={`${styles.effortBadge} ${
                        idea.estimated_effort === 'low'
                          ? styles.effortLow
                          : idea.estimated_effort === 'medium'
                          ? styles.effortMed
                          : styles.effortHigh
                      }`}
                    >
                      {idea.estimated_effort.toUpperCase()} EFFORT
                    </span>
                  </div>
                  <h3 className={styles.ideaTitle}>{idea.title}</h3>
                  <p className={styles.ideaDesc}>{idea.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: VENDOR QUESTIONS */}
        {activeTab === 'questions' && (
          <div className={styles.tabPanel} role="tabpanel">
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Vendor Interview Questions</h2>
              <p className={styles.subHeading}>
                Key clarifying questions tailored to this event to ask prospective venues and vendors before signing contracts.
              </p>

              <div className={styles.questionsList}>
                {plan.questions_for_vendors.map((q, idx) => (
                  <div key={idx} className={styles.questionItem}>
                    <span className={styles.questionNumber}>{idx + 1}</span>
                    <p className={styles.questionText}>{q}</p>
                    <button
                      type="button"
                      className={styles.copySmallBtn}
                      onClick={() => copyToClipboard(q, `q-${idx}`)}
                    >
                      {copiedHex === `q-${idx}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
