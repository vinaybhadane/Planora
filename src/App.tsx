/**
 * App.tsx — Planora GenAI Event Planning Assistant.
 *
 * Core coordinator managing:
 * - Application stages: landing, synthesizing, dashboard
 * - Live Gemini generation & turnkey Demo mode
 * - In-memory ephemeral session cache for instant context switching
 * - Two-pane dashboard with interactive planning tools
 */

import { useState, useCallback, Suspense, lazy } from 'react';
import type { EventTypeId, VibeId } from './lib/domain';
import type { PlanResult } from './lib/schema';
import type { PlanGenerationParams, AIPlanningProvider } from './lib/providers';
import { GeminiProvider, DemoProvider, DEMO_PLANS_BY_TYPE } from './lib/providers';
import { usePlanner } from './hooks/usePlanner';
import { LandingScreen } from './components/landing/LandingScreen';
import { ContextBar } from './components/dashboard/ContextBar';
import { GuidedActions } from './components/dashboard/GuidedActions';
import { Disclaimer } from './components/common/Disclaimer';

const TwoPaneLayout = lazy(() =>
  import('./components/dashboard/TwoPaneLayout').then(m => ({ default: m.TwoPaneLayout }))
);
const LeftPane = lazy(() =>
  import('./components/dashboard/LeftPane').then(m => ({ default: m.LeftPane }))
);
const RightPane = lazy(() =>
  import('./components/dashboard/RightPane').then(m => ({ default: m.RightPane }))
);
const EventContextSelector = lazy(() =>
  import('./components/context/EventContextSelector').then(m => ({
    default: m.EventContextSelector,
  }))
);

type AppStage = 'landing' | 'synthesizing' | 'dashboard';
type Mode = 'live' | 'demo';

// Ephemeral in-memory session cache
const sessionPlanCache = new Map<string, PlanResult>();

export default function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const [_mode, setMode] = useState<Mode>('demo');
  const [provider, setProvider] = useState<AIPlanningProvider>(() => new DemoProvider());
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active Context Parameters
  const [eventType, setEventType] = useState<EventTypeId>('wedding');
  const [vibe, setVibe] = useState<VibeId>('romantic-elegant');
  const [budget, setBudget] = useState<number>(25000);
  const [guestCount, setGuestCount] = useState<number>(100);
  const [isContextSelectorOpen, setIsContextSelectorOpen] = useState(false);

  // Planning hook for dashboard interactions
  const {
    activeTab,
    setActiveTab,
    checkedTaskIds,
    toggleTask,
    customBudget,
    setCustomBudget,
    reconciledBudget,
    timelineCheck,
    checklistProgress,
    exportMarkdown,
  } = usePlanner(plan);

  // Cache key generator
  const getCacheKey = useCallback(
    (type: EventTypeId, count: number, bgt: number, vb: VibeId) => {
      return `${type}:${count}:${bgt}:${vb}`;
    },
    []
  );

  // 1-Click Demo Launch
  const handleExploreDemo = useCallback(
    (selectedType: EventTypeId) => {
      setError(null);
      setMode('demo');
      const demoProv = new DemoProvider();
      setProvider(demoProv);
      setEventType(selectedType);

      const baseDemo = DEMO_PLANS_BY_TYPE[selectedType] ?? DEMO_PLANS_BY_TYPE.wedding;
      setBudget(baseDemo.total_budget);
      setGuestCount(baseDemo.guest_count);
      setPlan(baseDemo);
      setStage('dashboard');
    },
    []
  );

  // Live Plan Generation via Gemini Provider
  const handleStartLivePlan = useCallback(
    async (params: PlanGenerationParams) => {
      setError(null);
      setMode('live');
      const geminiProv = new GeminiProvider();
      setProvider(geminiProv);

      setEventType(params.eventType);
      setVibe(params.vibe);
      setBudget(params.totalBudget);
      setGuestCount(params.guestCount);

      const cacheKey = getCacheKey(
        params.eventType,
        params.guestCount,
        params.totalBudget,
        params.vibe
      );

      // Check session cache first
      if (sessionPlanCache.has(cacheKey)) {
        setPlan(sessionPlanCache.get(cacheKey)!);
        setStage('dashboard');
        return;
      }

      setStage('synthesizing');

      try {
        const generatedPlan = await geminiProv.generatePlan(params);
        sessionPlanCache.set(cacheKey, generatedPlan);
        setPlan(generatedPlan);
        setStage('dashboard');
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Plan synthesis encountered an error. Please try again or switch to Demo Mode.';
        setError(message);
        setStage('landing');
      }
    },
    [getCacheKey]
  );

  // Apply Changes from Context Selector Modal
  const handleApplyContextChange = useCallback(
    async (newParams: {
      eventType: EventTypeId;
      vibe: VibeId;
      budget: number;
      guestCount: number;
    }) => {
      setIsContextSelectorOpen(false);
      setEventType(newParams.eventType);
      setVibe(newParams.vibe);
      setBudget(newParams.budget);
      setGuestCount(newParams.guestCount);

      const cacheKey = getCacheKey(
        newParams.eventType,
        newParams.guestCount,
        newParams.budget,
        newParams.vibe
      );

      if (sessionPlanCache.has(cacheKey)) {
        setPlan(sessionPlanCache.get(cacheKey)!);
        return;
      }

      setStage('synthesizing');

      try {
        const updatedPlan = await provider.generatePlan({
          eventType: newParams.eventType,
          vibe: newParams.vibe,
          totalBudget: newParams.budget,
          guestCount: newParams.guestCount,
        });
        sessionPlanCache.set(cacheKey, updatedPlan);
        setPlan(updatedPlan);
        setStage('dashboard');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update plan.';
        setError(message);
        setStage('dashboard');
      }
    },
    [provider, getCacheKey]
  );

  // Quick Action: Simulate 10% Budget Trim
  const handleSimulateTrim = useCallback(() => {
    if (!plan) return;
    const trimmed = Math.round(plan.total_budget * 0.9);
    setCustomBudget(trimmed);
  }, [plan, setCustomBudget]);

  // Quick Action: Copy All Vendor Questions
  const handleCopyVendorQuestions = useCallback(() => {
    if (!plan) return;
    const text = plan.questions_for_vendors.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
    navigator.clipboard.writeText(text);
  }, [plan]);

  // Quick Action: Print Run of Show
  const handlePrintDossier = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="app-root">
      {/* WCAG Skip-to-content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Error Banner */}
      {error && (
        <div role="alert" aria-live="assertive" className="error-banner">
          <div className="error-content">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <p className="error-text">{error}</p>
          </div>
          <button
            type="button"
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* STAGE 1: LANDING & CONFIGURATOR */}
      {stage === 'landing' && (
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          <LandingScreen
            onStartLivePlan={handleStartLivePlan}
            onExploreDemo={handleExploreDemo}
            isLoading={false}
          />
        </main>
      )}

      {/* STAGE 2: SYNTHESIZING LOADER */}
      {stage === 'synthesizing' && (
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          <div className="synthesizing-container" role="status" aria-live="polite">
            <div className="synthesizing-card">
              <div className="spinner" aria-hidden="true" />
              <h2 className="synthesizing-title">
                Synthesizing Your {eventType.toUpperCase()} Plan
              </h2>
              <p className="synthesizing-desc">
                Gemini AI is assembling budget allocations, calculating contingency reserves, building the phased timeline, and cross-checking vendor checklists...
              </p>
            </div>
          </div>
        </main>
      )}

      {/* STAGE 3: INTERACTIVE DASHBOARD */}
      {stage === 'dashboard' && plan && (
        <div className="dashboard-container">
          <ContextBar
            eventName={plan.event_name}
            eventType={plan.event_type}
            guestCount={plan.guest_count}
            totalBudget={plan.total_budget}
            currency={plan.currency}
            onSwitchContext={() => setIsContextSelectorOpen(true)}
            onExportClick={handlePrintDossier}
          />

          <GuidedActions
            onSelectTab={setActiveTab}
            onSimulateTrim={handleSimulateTrim}
            onCopyVendorQuestions={handleCopyVendorQuestions}
            onExport={handlePrintDossier}
          />

          <Suspense
            fallback={
              <div className="loading-fallback" role="status">
                Loading workspace...
              </div>
            }
          >
            <TwoPaneLayout
              leftPane={
                <LeftPane
                  plan={plan}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  checkedTaskIds={checkedTaskIds}
                  onToggleTask={toggleTask}
                  reconciledBudget={reconciledBudget}
                  checklistProgress={checklistProgress}
                  timelineCheck={timelineCheck}
                />
              }
              rightPane={
                <RightPane
                  plan={plan}
                  customBudget={customBudget}
                  onBudgetChange={setCustomBudget}
                  onExport={handlePrintDossier}
                  exportMarkdown={exportMarkdown}
                />
              }
            />
          </Suspense>

          <Disclaimer text={plan.disclaimer} />

          {/* Context Switcher Modal */}
          {isContextSelectorOpen && (
            <Suspense fallback={null}>
              <EventContextSelector
                currentEventType={eventType}
                currentVibe={vibe}
                currentBudget={budget}
                currentGuestCount={guestCount}
                onApply={handleApplyContextChange}
                onCancel={() => setIsContextSelectorOpen(false)}
              />
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
}
