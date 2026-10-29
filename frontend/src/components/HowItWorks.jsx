import React from 'react';
import { Icon } from './Icon.jsx';
import {
  Alert,
  Bulb,
  ChartLine,
  Check,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from '../lib/icons.js';
import { FEATURE_LABELS } from '../lib/labels.js';
import { LineChart } from './charts/line-chart';
import { Line } from './charts/line';
import { Grid } from './charts/grid';
import { XAxis } from './charts/x-axis';
import { YAxis } from './charts/y-axis';
import { ChartTooltip } from './charts/tooltip/chart-tooltip';
import { TooltipContent } from './charts/tooltip/tooltip-content';
import { ReferenceArea } from './charts/reference-area';

function Step({ number, icon: StepIcon, title, children }) {
  return (
    <li className="card relative p-5">
      <span className="absolute right-4 top-4 font-display text-[13px] font-semibold tabular-nums text-muted">
        0{number}
      </span>
      <span className="icon-tile">
        <Icon icon={StepIcon} size={20} />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{children}</p>
    </li>
  );
}

function DotGrid({ filled, total = 100 }) {
  return (
    <div className="grid w-fit grid-cols-10 gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`size-3 rounded-full sm:size-3.5 ${
            index < filled ? 'bg-accent' : 'bg-sunken ring-1 ring-inset ring-line-strong/40'
          }`}
        />
      ))}
    </div>
  );
}

function modelName(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace('Hist Gradient Boosting', 'Boosted trees')
    .replace('Logistic Regression', 'Logistic regression')
    .replace('Random Forest', 'Random forest');
}

function MiniBar({ label, value, tone }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums text-soft">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.max(2, value * 100)}%` }}
        />
      </div>
    </div>
  );
}

const CHART_EPOCH = Date.UTC(2025, 0, 1);
const DAY_MS = 86_400_000;

/* Bklit's line chart is time-based, so a percentage point maps to one day.
   The axis formatter turns the date back into a percentage for the reader. */
function percentToDate(fraction) {
  return new Date(CHART_EPOCH + Number(fraction) * 100 * DAY_MS);
}

function dateToPercent(date) {
  return Math.round((date.getTime() - CHART_EPOCH) / DAY_MS);
}

function RocChart({ curve }) {
  const data = curve.map((point) => ({
    date: percentToDate(point.fpr),
    tpr: point.tpr * 100,
    chance: point.fpr * 100,
    fpr: point.fpr * 100,
  }));

  return (
    <LineChart
      data={data}
      margin={{ top: 18, right: 18, bottom: 30, left: 42 }}
      animationDuration={700}
      aspectRatio="1.55 / 1"
      yDomain={[0, 100]}
    >
      <Grid horizontal numTicksRows={4} strokeDasharray="3 5" />
      <Line
        dataKey="chance"
        stroke="var(--chart-grid)"
        strokeWidth={1}
        animate={false}
        fadeEdges={false}
        showHighlight={false}
      />
      <Line dataKey="tpr" stroke="var(--chart-line-primary)" strokeWidth={2.75} fadeEdges={false} />
      <XAxis
        numTicks={6}
        tickMode="domain"
        formatLabel={(date) => `${dateToPercent(date)}%`}
      />
      <YAxis numTicks={5} formatValue={(value) => `${Math.round(value)}%`} />
      <ChartTooltip
        showDatePill={false}
        indicatorColor="var(--chart-line-primary)"
        content={({ point }) => (
          <TooltipContent
            title={`False positive rate ${Math.round(point.fpr)}%`}
            rows={[
              {
                color: 'var(--chart-line-primary)',
                label: 'Cases caught',
                value: `${Math.round(point.tpr)}%`,
              },
            ]}
          />
        )}
      />
    </LineChart>
  );
}

function ThresholdChart({ data, threshold }) {
  const rows = data.map((point) => ({
    date: percentToDate(point.threshold),
    recall: point.recall_sensitivity * 100,
    specificity: point.specificity * 100,
    threshold: point.threshold * 100,
  }));

  return (
    <LineChart
      data={rows}
      margin={{ top: 18, right: 18, bottom: 30, left: 42 }}
      animationDuration={700}
      aspectRatio="1.55 / 1"
      yDomain={[0, 100]}
    >
      <Grid horizontal numTicksRows={4} strokeDasharray="3 5" />
      <ReferenceArea
        x1={percentToDate(threshold - 0.004)}
        x2={percentToDate(threshold + 0.004)}
        fill="var(--chart-line-primary)"
        fillOpacity={0.14}
        stroke="var(--chart-line-primary)"
        strokeWidth={1}
        fadeEdges={false}
      />
      <Line
        dataKey="recall"
        stroke="var(--chart-line-primary)"
        strokeWidth={2.75}
        fadeEdges={false}
      />
      <Line
        dataKey="specificity"
        stroke="var(--chart-line-secondary)"
        strokeWidth={2.75}
        fadeEdges={false}
      />
      <XAxis
        numTicks={5}
        tickMode="data"
        formatLabel={(date) => `${dateToPercent(date)}%`}
      />
      <YAxis numTicks={5} formatValue={(value) => `${Math.round(value)}%`} />
      <ChartTooltip
        showDatePill={false}
        indicatorColor="var(--chart-crosshair)"
        content={({ point }) => (
          <TooltipContent
            title={`Screening cut-off ${Math.round(point.threshold)}%`}
            rows={[
              {
                color: 'var(--chart-line-primary)',
                label: 'Cases caught',
                value: `${Math.round(point.recall)}%`,
              },
              {
                color: 'var(--chart-line-secondary)',
                label: 'Healthy cleared',
                value: `${Math.round(point.specificity)}%`,
              },
            ]}
          />
        )}
      />
    </LineChart>
  );
}

function ModelCard({ row, primary }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        primary ? 'border-accent/60 bg-accent-soft/50' : 'border-line bg-canvas/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{row.name}</h3>
        {primary ? (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-ink">
            Used here
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[30px] font-semibold leading-none tabular-nums text-ink">
        {row.roc_auc.toFixed(3)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">overall ranking score (ROC-AUC)</p>
      <div className="mt-3 space-y-2">
        <MiniBar label="Cases caught" value={row.recall_sensitivity} tone="bg-accent" />
        <MiniBar label="Healthy cleared" value={row.specificity} tone="bg-good" />
      </div>
    </div>
  );
}

export default function HowItWorks({ mlEval }) {
  if (!mlEval) return null;

  const primary = mlEval.models.HistGradientBoosting;
  const metrics = primary.clinical_screening_threshold_028;
  const flagged = Math.round(metrics.recall_sensitivity * 100);
  const cleared = Math.round(metrics.specificity * 100);
  const falseAlarms = 100 - cleared;
  const modelKeys = Object.keys(mlEval.models);
  const topFeatures = mlEval.feature_importances.slice(0, 8);
  const maxImportance = Math.max(...topFeatures.map((row) => row.importance_share_pct), 1);
  const featureCount = mlEval.feature_order?.length ?? 20;

  return (
    <div className="pb-16">
      <header className="mb-8 max-w-3xl animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-accent-text">
          <Icon icon={Bulb} size={14} />
          The method
        </span>
        <h1
          id="page-title"
          tabIndex={-1}
          className="mt-4 font-display text-[38px] font-bold leading-[1.03] tracking-[-0.03em] text-ink focus:outline-none sm:text-[52px]"
        >
          How the estimate is made
        </h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-soft">
          No black box and no magic. A statistical model finds patterns in real health surveys,
          then compares your answers to those patterns. Here is the whole idea.
        </p>
      </header>

      <ol className="grid gap-3 md:grid-cols-3">
        <Step number={1} icon={Users} title="It learned from real people">
          253,680 US adults answered the CDC&rsquo;s health survey. {`35,346`} of them had
          diabetes or prediabetes. The model learned the difference.
        </Step>
        <Step number={2} icon={Target} title="It compares your answers">
          Your {featureCount} answers are weighed against those patterns. The output is a single
          number: an estimated chance.
        </Step>
        <Step number={3} icon={Sparkles} title="It shows its reasoning">
          For each answer, the model re-runs your estimate without it. The difference is how much
          that answer moved your number.
        </Step>
      </ol>

      <section className="card mt-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="icon-tile">
            <Icon icon={ShieldCheck} size={20} />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
              How much can you trust it?
            </h2>
            <p className="mt-0.5 max-w-[62ch] text-sm leading-relaxed text-muted">
              The model is tuned to catch cases, not to be conservative. It misses some people
              and flags some who are healthy. Both are normal for a screening tool.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl bg-sunken/60 p-4">
            <p className="font-display text-[34px] font-semibold leading-none tabular-nums text-ink">
              {flagged} <span className="text-lg text-muted">in 100</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-soft">
              people with diabetes or prediabetes are caught
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Each dot is one person who has diabetes or prediabetes. Filled dots were caught by
              the model. The rest were missed.
            </p>
            <div className="mt-3">
              <DotGrid filled={flagged} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-line p-4">
              <p className="font-display text-[26px] font-semibold leading-none tabular-nums text-ink">
                {cleared} <span className="text-sm text-muted">in 100</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-soft">
                people without diabetes or prediabetes are correctly cleared
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                The other {falseAlarms} get a false alarm and may be asked to take a test they do
                not need.
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-warn-soft p-4">
              <Icon icon={Alert} size={16} className="mt-0.5 shrink-0 text-warn-text" />
              <p className="text-xs leading-relaxed text-soft">
                <span className="font-semibold text-warn-text">
                  A high estimate is not a diagnosis.
                </span>{' '}
                It means a conversation and a blood test are worth it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card mt-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="icon-tile">
            <Icon icon={ChartLine} size={20} />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
              How well does it work?
            </h2>
            <p className="mt-0.5 max-w-[62ch] text-sm leading-relaxed text-muted">
              Tested on {mlEval.test_size.toLocaleString()} people the model had never seen. The
              curve and the trade-off below are the honest version of the headline numbers.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">ROC curve</h3>
              <span className="text-[11px] font-semibold tabular-nums text-accent-text">
                {metrics.roc_auc.toFixed(3)} ROC-AUC
              </span>
            </div>
            <RocChart curve={metrics.roc_curve} />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full bg-accent" /> Model
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-px w-4 rounded-full bg-line-strong" /> Random guess
              </span>
              <span>Y: cases caught · X: false alarms</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">Where to draw the line</h3>
              <span className="text-[11px] font-semibold tabular-nums text-accent-text">
                28% cut-off
              </span>
            </div>
            <ThresholdChart data={mlEval.threshold_sensitivity} threshold={metrics.threshold} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" /> Cases caught
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-risk" /> Healthy cleared
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent/30 ring-1 ring-accent/60" /> 28% cut-off
              </span>
              <span>Y: people correctly classified · X: cut-off</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card mt-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="icon-tile">
            <Icon icon={Target} size={20} />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
              How the models compare
            </h2>
            <p className="mt-0.5 max-w-[62ch] text-sm leading-relaxed text-muted">
              Three models, the same test set. Boosted trees is the one behind your estimate;
              the others are here to keep it honest.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {modelKeys.map((key) => {
            const row = mlEval.models[key].clinical_screening_threshold_028;
            return (
              <ModelCard
                key={key}
                primary={key === mlEval.primary_model}
                row={{
                  name: modelName(key),
                  roc_auc: row.roc_auc,
                  recall_sensitivity: row.recall_sensitivity,
                  specificity: row.specificity,
                }}
              />
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Scores are at the 28% screening cut-off. ROC-AUC measures overall ranking; the two
          bars show how many real cases are caught and how many healthy people are correctly
          cleared. Random forest&rsquo;s ranking score is a hair higher, but boosted trees catches
          more cases at the cut-off, which is what a screening tool is for.
        </p>
        <div className="mt-3 rounded-xl bg-sunken/60 p-3">
          <p className="text-[11px] leading-relaxed text-muted">
            <span className="font-semibold text-soft">Why is there no cholesterol-check question?</span>{' '}
            It is in the survey, but it mostly tracks contact with the health system, not risk
            itself. Leaving it in made it look like a cause, so the model leaves it out.
          </p>
        </div>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.01em] text-ink">
            <Icon icon={Check} size={20} className="text-good-text" />
            What it can do
          </h2>
          <ul className="mt-3 space-y-2.5">
            {[
              'Spot patterns linked to diabetes in a large population',
              'Show which of your answers matter most',
              'Estimate how much habits could move your number',
              'Start a more useful conversation with a doctor',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-soft"
              >
                <Icon icon={Check} size={15} className="mt-0.5 shrink-0 text-good-text" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.01em] text-ink">
            <Icon icon={Alert} size={20} className="text-warn-text" />
            What it can&rsquo;t do
          </h2>
          <ul className="mt-3 space-y-2.5">
            {[
              'Diagnose diabetes. Only a blood test can do that',
              'Know your family history or the medicines you take',
              'Account for every part of your life or environment',
              'Replace advice from a doctor or nurse',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-soft"
              >
                <Icon icon={Alert} size={15} className="mt-0.5 shrink-0 text-warn-text" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <details className="group card mt-5">
        <summary className="flex items-center justify-between gap-3 p-5 text-sm font-semibold text-ink sm:p-6">
          <span className="flex items-center gap-2">
            <Icon icon={HeartPulse} size={17} className="text-muted" />
            Technical details
          </span>
          <span className="text-xs font-medium text-muted group-open:hidden">Open</span>
          <span className="hidden text-xs font-medium text-muted group-open:inline">Close</span>
        </summary>

        <div className="space-y-6 border-t border-line p-5 sm:p-6">
          <div>
            <h3 className="text-sm font-semibold text-ink">What the model leans on</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              How much each answer drives the estimate. We measure this by shuffling one answer
              at a time and seeing how much accuracy drops.
            </p>
            <ul className="mt-3 space-y-2.5">
              {topFeatures.map((row) => (
                <li key={row.feature}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-soft">
                      {FEATURE_LABELS[row.feature] ?? row.label}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-ink">
                      {row.importance_share_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunken">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(row.importance_share_pct / maxImportance) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-sunken/60 p-4">
            <h3 className="text-sm font-semibold text-ink">One deliberate omission</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              We leave out whether you have had a cholesterol check. In this survey it mostly
              tracks contact with the health system, not risk itself. Leaving it in made it look
              like a cause.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            The final model is a tree-based ensemble. We added a rule that known risk factors can
            only push the estimate up: a higher BMI never lowers it. That keeps the explanations
            sensible and makes the model harder to misuse. The dataset is self-reported and from
            2015, so the estimate describes patterns, not today&rsquo;s individual risk.
          </p>
        </div>
      </details>
    </div>
  );
}
