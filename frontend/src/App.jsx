import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from './components/Icon.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Checkup from './components/Checkup.jsx';
import ExploreData from './components/ExploreData.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import PageGrid, { ScrollCue } from './components/PageGrid.jsx';
import { HeartPulse, Refresh } from './lib/icons.js';
import { SPRING_SNAP } from './lib/motion.js';

const DEFAULT_INDICATORS = {
  HighBP: 1,
  HighChol: 1,
  CholCheck: 1,
  BMI: 32.0,
  Smoker: 1,
  Stroke: 0,
  HeartDiseaseorAttack: 0,
  PhysActivity: 0,
  Fruits: 0,
  Veggies: 0,
  HvyAlcoholConsump: 0,
  AnyHealthcare: 1,
  NoDocbcCost: 0,
  GenHlth: 3,
  MentHlth: 5,
  PhysHlth: 6,
  DiffWalk: 0,
  Sex: 1,
  Age: 7,
  Education: 5,
  Income: 5,
};

const TABS = [
  { id: 'checkup', label: 'Check-up', short: 'Check-up' },
  { id: 'data', label: 'The data', short: 'Data' },
  { id: 'how', label: 'How it works', short: 'How' },
];

async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function LoadingCard({ label }) {
  return (
    <div className="card p-6" aria-busy="true">
      <p className="text-sm font-medium text-muted">{label}</p>
      <div className="mt-4 animate-pulse space-y-3" aria-hidden="true">
        <div className="h-8 w-2/3 rounded-lg bg-sunken" />
        <div className="h-3 w-full rounded-full bg-sunken" />
        <div className="h-3 w-5/6 rounded-full bg-sunken" />
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('checkup');
  const [indicators, setIndicators] = useState(DEFAULT_INDICATORS);

  const [metadata, setMetadata] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loadToken, setLoadToken] = useState(0);

  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(true);
  const [predictionError, setPredictionError] = useState(false);
  const [predictToken, setPredictToken] = useState(0);

  const lastTab = useRef(activeTab);
  const pageScrollRef = useRef(null);

  /* Supporting data for the pages that explain the survey and the model. */
  useEffect(() => {
    const controller = new AbortController();
    setLoadError(false);

    getJson('/api/metadata', controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setMetadata(data);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setLoadError(true);
      });

    return () => controller.abort();
  }, [loadToken]);

  /* Live estimate. Debounced so dragging a slider sends one request, not fifty. */
  useEffect(() => {
    const controller = new AbortController();
    setIsPredicting(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(indicators),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Prediction returned ${response.status}`);
        const data = await response.json();
        setPrediction(data);
        setPredictionError(false);
        setIsPredicting(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setPredictionError(true);
        setIsPredicting(false);
      }
    }, 160);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [indicators, predictToken]);

  /* A new page starts at the top, with focus on its heading. */
  useEffect(() => {
    if (lastTab.current === activeTab) return;
    lastTab.current = activeTab;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [activeTab]);

  const go = useCallback((tab) => setActiveTab(tab), []);

  const handleIndicators = useCallback((next) => {
    setIndicators(next);
  }, []);

  /* Mirrors the backend's "all modifiable factors optimised" row, so the
     projection the person just read is the estimate they get after applying. */
  const handleApplyInterventions = useCallback(() => {
    setIndicators((previous) => {
      const next = { ...previous };
      if (previous.BMI > 24.5) {
        next.BMI = Math.max(23.5, Math.round((previous.BMI - 5) * 10) / 10);
      }
      for (const key of ['HighBP', 'HighChol', 'Smoker', 'HvyAlcoholConsump', 'DiffWalk']) {
        if (previous[key] === 1) next[key] = 0;
      }
      for (const key of ['PhysActivity', 'Fruits', 'Veggies']) {
        if (previous[key] === 0) next[key] = 1;
      }
      if (previous.GenHlth > 2) next.GenHlth = Math.max(2, previous.GenHlth - 1);
      if (previous.MentHlth > 2) next.MentHlth = 0;
      if (previous.PhysHlth > 2) next.PhysHlth = 0;
      return next;
    });
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <PageGrid />

      <header className="app-header z-40 shrink-0 px-4 pt-2.5 sm:px-6 sm:pt-4">
        <div className="mx-auto flex max-w-[69rem] items-center gap-1.5 rounded-full border border-line bg-surface/90 px-1 py-1.5 shadow-float backdrop-blur-xl sm:gap-3 sm:px-3 sm:py-2.5">
          <button
            type="button"
            onClick={() => go('checkup')}
            className="press flex items-center gap-2 rounded-full text-left"
            aria-label="GlycoStrat, go to the check-up"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-ink sm:size-9">
              <Icon icon={HeartPulse} size={19} />
            </span>
            <span className="hidden font-display text-[17px] font-bold tracking-[-0.02em] text-ink sm:inline sm:text-lg">
              GlycoStrat
            </span>
          </button>

          <nav aria-label="Sections" className="ml-auto flex items-center gap-0.5 sm:gap-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => go(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`press relative shrink-0 rounded-full px-2.5 py-1.5 text-[12px] font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                    active ? 'text-accent-ink' : 'text-soft hover:bg-sunken hover:text-ink'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="app-tab-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={SPRING_SNAP}
                    />
                  ) : null}
                  <span className="relative z-10 sm:hidden">{tab.short}</span>
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-4 focus:outline-none sm:px-6 sm:py-6 lg:py-5"
      >
        {loadError ? (
          <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-warn-text">
            <span className="min-w-0 flex-1">
              The extra data didn&rsquo;t load. The check-up still works.
            </span>
            <button
              type="button"
              onClick={() => setLoadToken((token) => token + 1)}
              className="press inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-ink"
            >
              <Icon icon={Refresh} size={14} />
              Retry
            </button>
          </div>
        ) : null}

        {activeTab === 'checkup' ? (
          <Checkup
            indicators={indicators}
            onChange={handleIndicators}
            prediction={prediction}
            isPredicting={isPredicting}
            error={predictionError}
            onRetry={() => setPredictToken((token) => token + 1)}
            onApplyInterventions={handleApplyInterventions}
          />
        ) : null}

        {activeTab === 'data' ? (
          <div className="relative min-h-0 flex-1">
            <div
              ref={pageScrollRef}
              className="h-full overflow-y-auto overscroll-contain pr-1"
            >
              {metadata?.eda ? (
                <ExploreData eda={metadata.eda} />
              ) : (
                <div className="space-y-5">
                  <h1
                    id="page-title"
                    tabIndex={-1}
                    className="font-display text-4xl font-bold tracking-[-0.03em] text-ink focus:outline-none"
                  >
                    The data
                  </h1>
                  <LoadingCard label="Loading the survey data…" />
                </div>
              )}
            </div>
            <ScrollCue targetRef={pageScrollRef} />
          </div>
        ) : null}

        {activeTab === 'how' ? (
          <div className="relative min-h-0 flex-1">
            <div
              ref={pageScrollRef}
              className="h-full overflow-y-auto overscroll-contain pr-1"
            >
              {metadata?.ml_evaluation ? (
                <HowItWorks mlEval={metadata.ml_evaluation} />
              ) : (
                <div className="space-y-5">
                  <h1
                    id="page-title"
                    tabIndex={-1}
                    className="font-display text-4xl font-bold tracking-[-0.03em] text-ink focus:outline-none"
                  >
                    How it works
                  </h1>
                  <LoadingCard label="Loading the model details…" />
                </div>
              )}
            </div>
            <ScrollCue targetRef={pageScrollRef} />
          </div>
        ) : null}
      </main>

      <footer className="app-footer relative z-10 shrink-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] font-medium text-muted sm:px-6 sm:py-3 sm:text-[13px]">
          <p className="truncate">&copy; 2026 GlycoStrat. All rights reserved.</p>
          <p className="shrink-0 whitespace-nowrap">
            crafted by{' '}
            <a
              href="https://github.com/Hike-12"
              target="_blank"
              rel="noreferrer"
              className="squiggle-link font-semibold text-soft transition-colors hover:text-ink"
            >
              aliqyaan
            </a>
            {' & '}
            <a
              href="https://github.com/romeirofernandes"
              target="_blank"
              rel="noreferrer"
              className="squiggle-link font-semibold text-soft transition-colors hover:text-ink"
            >
              romeiro
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
