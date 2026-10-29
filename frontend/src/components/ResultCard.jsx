import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './Icon.jsx';
import FactorsDialog from './FactorsDialog.jsx';
import {
  Alert,
  ArrowRight,
  Check,
  Heartbreak,
  Info,
  Refresh,
  ShieldCheck,
  Sparkles,
} from '../lib/icons.js';
import { FEATURE_LABELS, formatFeatureValue, friendlyAction } from '../lib/labels.js';
import {
  EASE_OUT,
  SPRING_FILL,
  SPRING_SNAP,
  SPRING_SOFT,
  useAnimatedPercent,
} from '../lib/motion.js';

const TIERS = {
  low: {
    label: 'Low',
    Icon: ShieldCheck,
    chip: 'bg-good-soft text-good-text',
    dot: 'bg-good',
    sentence: 'Your answers point to a low chance. Keep up the habits that are working.',
  },
  watch: {
    label: 'Watch',
    Icon: Info,
    chip: 'bg-warn-soft text-warn-text',
    dot: 'bg-warn',
    sentence: 'Slightly above the low range. Worth keeping an eye on at routine check-ups.',
  },
  elevated: {
    label: 'Elevated',
    Icon: Alert,
    chip: 'bg-warn-soft text-warn-text',
    dot: 'bg-warn',
    sentence:
      'High enough that a blood sugar test is worth discussing with a doctor. It is not a diagnosis.',
  },
  high: {
    label: 'High',
    Icon: Heartbreak,
    chip: 'bg-risk-soft text-risk-text',
    dot: 'bg-risk',
    sentence:
      'Your answers point to a high chance. A doctor can check this with a simple blood test.',
  },
};

function tierFor(pct) {
  if (pct < 20) return TIERS.low;
  if (pct < 28) return TIERS.watch;
  if (pct < 50) return TIERS.elevated;
  return TIERS.high;
}

function formatPoints(value) {
  const size = Math.abs(value);
  const shown = size >= 10 ? Math.round(size) : size.toFixed(1);
  return `${value > 0 ? '+' : '−'}${shown}`;
}

function comparison(prediction) {
  const baseline = prediction.population_baseline_pct;
  const ratio = prediction.relative_to_population;
  const baselineText = Number(baseline).toFixed(1);
  if (ratio >= 1.15) {
    const times = ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1).replace(/\.0$/, '');
    return `About ${times}× the US adult average`;
  }
  if (ratio <= 0.85) return 'Below the US adult average';
  return 'About the same as the US adult average';
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true">
      <div className="h-3 w-24 rounded-full bg-sunken" />
      <div className="h-12 w-40 rounded-xl bg-sunken" />
      <div className="h-3 w-full rounded-full bg-sunken" />
      <div className="h-20 w-full rounded-xl bg-sunken" />
    </div>
  );
}

/**
 * The three-band scale with a live marker. The marker travels along the
 * track with a spring, so a new estimate reads as movement rather than a
 * jump.
 */
function RiskScale({ pct }) {
  const position = useAnimatedPercent(Math.min(98, Math.max(2, pct)), {
    spring: { ...SPRING_FILL, damping: 28 },
  });

  return (
    <div className="mt-3">
      <div className="relative h-2.5" aria-hidden="true">
        <div className="flex h-2.5 overflow-hidden rounded-full">
          <div className="w-[20%] bg-good/40" />
          <div className="w-[30%] bg-warn/40" />
          <div className="w-[50%] bg-risk/40" />
        </div>
        <motion.div
          className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-ink ring-2 ring-surface"
          style={{ left: position }}
        />
      </div>
      <div className="mt-1.5 flex text-[10px] font-medium text-muted" aria-hidden="true">
        <span className="w-[20%]">Low</span>
        <span className="w-[30%] text-center">Medium</span>
        <span className="w-[50%] text-center">High</span>
      </div>
      <span className="sr-only">Your estimate is {Math.round(pct)} percent.</span>
    </div>
  );
}

export default function ResultCard({
  prediction,
  isPredicting,
  error,
  onRetry,
  onApplyInterventions,
  className = '',
}) {
  const [justApplied, setJustApplied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!justApplied) return undefined;
    const timer = window.setTimeout(() => setJustApplied(false), 6000);
    return () => window.clearTimeout(timer);
  }, [justApplied]);

  if (!prediction) {
    return (
      <div className={`card p-5 sm:p-6 ${className}`} aria-busy={isPredicting}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Your estimate
        </p>
        {error ? (
          <div className="mt-3">
            <p className="font-display text-lg font-semibold text-ink">
              We couldn&rsquo;t reach the model
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Check that the server is running, then try again. Your answers are still here.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="press mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-ink"
            >
              <Icon icon={Refresh} size={15} />
              Try again
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <Skeleton />
          </div>
        )}
      </div>
    );
  }

  const pct = prediction.probability_pct;
  const shown = pct < 1 ? pct.toFixed(1) : Math.round(pct);
  const tier = tierFor(pct);
  const pathway = prediction.intervention_pathway;
  const reduction = pathway?.absolute_reduction_pct ?? 0;
  const actions = (pathway?.recommended_actions ?? []).map(friendlyAction);
  const canImprove = reduction >= 0.1 && actions.length > 0;

  const drivers = prediction.feature_contributions
    .filter((item) => Math.abs(item.risk_contribution_pct) >= 0.05)
    .slice(0, 3);
  const maxDriver = Math.max(
    ...drivers.map((item) => Math.abs(item.risk_contribution_pct)),
    1,
  );

  return (
    <div
      className={`result-card card flex min-h-0 max-h-full flex-1 flex-col overflow-hidden ${className}`}
      aria-busy={isPredicting}
    >
      {/* Three zones. The number and the tier are fixed at the top and the
          action is fixed at the bottom, so neither can be pushed out of the
          card by a long factor list. Only the middle gives and takes. */}
      <div
        className="shrink-0"
        style={{ padding: 'var(--rc-pad, 1.25rem)' }}
      >
        <div className="flex items-center gap-2">
          <p
            id="result-title"
            tabIndex={-1}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted focus:outline-none"
          >
            Your estimate
          </p>
          <AnimatePresence>
            {isPredicting ? (
              <motion.span
                key="updating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="ml-auto text-[11px] font-medium text-muted"
              >
                Updating…
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRING_SOFT}
              className="overflow-hidden"
            >
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-warn/40 bg-warn-soft p-2.5 text-[11.5px] leading-relaxed text-warn-text">
                <Icon icon={Alert} size={14} className="mt-0.5 shrink-0" />
                <span className="min-w-0">
                  That last update didn&rsquo;t go through.{' '}
                  <button
                    type="button"
                    onClick={onRetry}
                    className="font-semibold underline decoration-1 underline-offset-2"
                  >
                    Try again
                  </button>
                </span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-0.5 flex items-baseline gap-1">
          <motion.span
            key={shown}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="font-display font-bold leading-[0.95] tracking-[-0.03em] tabular-nums text-ink"
            style={{ fontSize: 'var(--rc-number, 52px)' }}
          >
            {shown}
          </motion.span>
          <span className="font-display text-lg font-semibold text-soft">%</span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-muted">
          chance of diabetes or prediabetes
        </p>
        <span className="sr-only" role="status">
          Your estimated chance is {Math.round(pct)} percent. {tier.sentence}
        </span>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <motion.span
            key={tier.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_SNAP}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tier.chip}`}
          >
            <Icon icon={tier.Icon} size={13} />
            {tier.label}
          </motion.span>
          <span className="text-[11.5px] text-muted">{comparison(prediction)}</span>
        </div>

        <p className="result-card__sentence mt-1.5 text-[12.5px] leading-snug text-soft">
          {tier.sentence}
        </p>

        <RiskScale pct={pct} />
      </div>

      {/* The middle zone gives and takes. Opening the full list swaps it in
          place of the summary, so the card never grows and the action below
          never moves. */}
      <div
        className="flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto overscroll-contain border-t border-line"
        style={{
          paddingInline: 'var(--rc-pad, 1.25rem)',
          paddingBlock: '0.75rem',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-ink">
            What&rsquo;s shaping this
          </h3>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            aria-haspopup="dialog"
            className="press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-sunken px-3 py-1.5 text-xs font-semibold text-accent-text hover:border-accent/40 hover:bg-accent-soft"
          >
            See all {prediction.feature_contributions.length} factors
            <Icon icon={ArrowRight} size={12} />
          </button>
        </div>

        {drivers.length ? (
          <ul className="space-y-2">
            {drivers.map((item) => {
              const positive = item.risk_contribution_pct > 0;
              const width = (Math.abs(item.risk_contribution_pct) / maxDriver) * 50;
              return (
                <li key={item.feature}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 truncate text-[13px] font-semibold leading-snug text-soft">
                      {FEATURE_LABELS[item.feature] ?? item.label}
                      <span className="ml-1.5 font-normal text-muted">
                        · {formatFeatureValue(item.feature, item.patient_value)}
                      </span>
                    </p>
                    <p
                      className={`shrink-0 text-[12px] font-semibold tabular-nums ${
                        positive ? 'text-risk-text' : 'text-good-text'
                      }`}
                    >
                      {formatPoints(item.risk_contribution_pct)} pts
                    </p>
                  </div>
                  <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-sunken">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong/50" />
                    <motion.div
                      className={`absolute inset-y-0 rounded-full ${
                        positive ? 'left-1/2 bg-risk' : 'right-1/2 bg-good'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(3, width)}%` }}
                      transition={SPRING_FILL}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-1.5 text-[13px] text-muted">
            No single answer stands out. Your estimate comes from the whole picture.
          </p>
        )}
      </div>

      {/* What could help — pinned to the bottom of the card. */}
      <div
        className="shrink-0 border-t border-line"
        style={{ padding: 'var(--rc-pad, 1.25rem)' }}
      >
        {canImprove ? (
          <div className="rounded-xl bg-accent-soft p-3 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <Icon icon={Sparkles} size={15} className="text-accent-text" />
              <h3 className="text-[12.5px] font-semibold text-accent-text">What could help</h3>
            </div>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-2" aria-hidden="true">
              <motion.span
                key={`current-${Math.round(pathway.current_risk_pct)}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={SPRING_SNAP}
                className="font-display text-[22px] font-semibold leading-none tabular-nums text-ink"
              >
                {Math.round(pathway.current_risk_pct)}%
              </motion.span>
              <Icon icon={ArrowRight} size={15} className="text-accent-text" />
              <motion.span
                key={`optimised-${Math.round(pathway.optimized_risk_pct)}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={SPRING_SNAP}
                className="font-display text-[22px] font-semibold leading-none tabular-nums text-accent-text"
              >
                {Math.round(pathway.optimized_risk_pct)}%
              </motion.span>
              <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-accent-text">
                −{Math.round(reduction)} pts
              </span>
            </div>
            <p className="sr-only">
              Your estimate could go from {Math.round(pathway.current_risk_pct)} percent to{' '}
              {Math.round(pathway.optimized_risk_pct)} percent, a reduction of{' '}
              {Math.round(reduction)} points.
            </p>
            <p className="mt-1 text-[11px] leading-snug text-soft">
              If you made these changes:
            </p>
            <ul className="mt-1.5 space-y-1">
              {actions.slice(0, 3).map((action) => (
                <li key={action} className="flex items-start gap-2 text-[12px] text-soft">
                  <Icon icon={Check} size={13} className="mt-0.5 shrink-0 text-accent-text" />
                  {action}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                onApplyInterventions();
                setJustApplied(true);
              }}
              className="press mt-2 w-full rounded-lg bg-accent px-3.5 py-1.5 text-[12.5px] font-semibold text-accent-ink"
            >
              Try these changes
            </button>
            <p
              role="status"
              className={`mt-1.5 items-center gap-1.5 text-[11.5px] font-semibold text-accent-text ${
                justApplied ? 'flex' : 'sr-only'
              }`}
            >
              {justApplied ? (
                <>
                  <Icon icon={Check} size={13} />
                  Changes applied. Your estimate is updated.
                </>
              ) : null}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-good-soft p-3.5">
            <div className="flex items-center gap-2">
              <Icon icon={Sparkles} size={15} className="text-good-text" />
              <h3 className="text-[12.5px] font-semibold text-good-text">
                You&rsquo;re already on a healthy path
              </h3>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-soft">
              None of the modifiable habits in this check-up would meaningfully lower your
              estimate. Keep doing what you&rsquo;re doing.
            </p>
          </div>
        )}

        <p className="mt-2 flex items-start gap-2 text-[10.5px] leading-snug text-muted">
          <Icon icon={Info} size={12} className="mt-0.5 shrink-0" />
          An educational estimate, not a diagnosis. Only a blood test can confirm diabetes.
        </p>
      </div>

      <FactorsDialog
        open={showAll}
        onClose={() => setShowAll(false)}
        contributions={prediction.feature_contributions}
      />
    </div>
  );
}
