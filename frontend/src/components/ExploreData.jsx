import React, { useMemo } from 'react';
import { Icon } from './Icon.jsx';
import { Apple, ChartLine, HeartPulse, Info, Sparkles, Users } from '../lib/icons.js';
import { FEATURE_LABELS } from '../lib/labels.js';

const AGE_BANDS = [
  { label: '18–34', codes: [1, 2, 3] },
  { label: '35–49', codes: [4, 5, 6] },
  { label: '50–64', codes: [7, 8, 9] },
  { label: '65–79', codes: [10, 11, 12] },
  { label: '80+', codes: [13] },
];

const HABIT_FEATURES = [
  'DiffWalk',
  'HighBP',
  'Smoker',
  'PhysActivity',
  'Veggies',
  'Fruits',
];

const BMI_LABELS = {
  'Underweight (<18.5)': 'Underweight',
  'Normal (18.5-24.9)': 'Healthy weight',
  'Overweight (25-29.9)': 'Overweight',
  'Obese I (30-34.9)': 'Obesity I',
  'Obese II (35-39.9)': 'Obesity II',
  'Obese III (>=40)': 'Obesity III',
};

function BarRow({ label, value, max, suffix = '%', tone = 'bg-accent', meta }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-medium text-soft">{label}</span>
        <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-sunken">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
        />
      </div>
      {meta ? <p className="mt-1 text-[11px] text-muted">{meta}</p> : null}
    </li>
  );
}

function HabitRow({ item }) {
  const higher = item.prevalence_when_present_pct > item.prevalence_when_absent_pct;
  const label = FEATURE_LABELS[item.feature] ?? item.label;
  const max = Math.max(
    item.prevalence_when_present_pct,
    item.prevalence_when_absent_pct,
  );
  // Color the rate, not the label: the higher rate is always the risk color,
  // so a protective habit never renders its worse outcome in green.
  const presentTone = higher ? 'bg-risk' : 'bg-good';
  const absentTone = higher ? 'bg-good' : 'bg-risk';

  return (
    <li className="rounded-xl border border-line bg-canvas/60 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-semibold text-ink">{label}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            higher ? 'bg-risk-soft text-risk-text' : 'bg-good-soft text-good-text'
          }`}
        >
          {higher ? 'Higher rate' : 'Lower rate'}
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[11px] text-muted">With</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
            <span
              className={`block h-full rounded-full ${presentTone}`}
              style={{ width: `${(item.prevalence_when_present_pct / max) * 100}%` }}
            />
          </span>
          <span className="w-11 shrink-0 text-right text-[11px] font-semibold tabular-nums text-ink">
            {Number(item.prevalence_when_present_pct).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[11px] text-muted">Without</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
            <span
              className={`block h-full rounded-full ${absentTone}`}
              style={{ width: `${(item.prevalence_when_absent_pct / max) * 100}%` }}
            />
          </span>
          <span className="w-11 shrink-0 text-right text-[11px] font-semibold tabular-nums text-ink">
            {Number(item.prevalence_when_absent_pct).toFixed(1)}%
          </span>
        </div>
      </div>
    </li>
  );
}

function Stat({ value, label, note }) {
  return (
    <div className="card p-3 sm:p-5">
      <p className="font-display text-[20px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[34px]">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-medium leading-tight text-soft sm:text-sm">
        {label}
      </p>
      {note ? (
        <p className="mt-0.5 text-[10px] leading-tight text-muted sm:text-xs">{note}</p>
      ) : null}
    </div>
  );
}

export default function ExploreData({ eda }) {
  const ageBands = useMemo(() => {
    if (!eda?.age_breakdown) return [];
    return AGE_BANDS.map((band) => {
      const rows = eda.age_breakdown.filter((row) => band.codes.includes(row.age_code));
      const total = rows.reduce((sum, row) => sum + row.total, 0);
      const cases = rows.reduce((sum, row) => sum + row.diabetes_cases, 0);
      return { label: band.label, total, value: total ? (cases / total) * 100 : 0 };
    });
  }, [eda]);

  if (!eda) return null;

  const prevalence = eda.class_distribution.diabetes_or_prediabetes_pct;
  const maxAge = Math.max(...ageBands.map((row) => row.value), 1);
  const bmiRows = eda.bmi_breakdown.map((row) => ({
    label: BMI_LABELS[row.category] ?? row.category,
    value: Number(row.prevalence_pct.toFixed(1)),
    total: row.total,
  }));
  const maxBmi = Math.max(...bmiRows.map((row) => row.value), 1);
  const habits = HABIT_FEATURES.map((feature) =>
    eda.binary_risk_comparison.find((row) => row.feature === feature),
  ).filter(Boolean);
  const modeledFeatures = eda.feature_stats.filter((row) => row.feature !== 'CholCheck');
  const featureCount = modeledFeatures.length;
  const incomes = eda.income_breakdown ?? [];
  const maxIncome = Math.max(...incomes.map((row) => row.prevalence_pct), 1);
  const generalHealth = eda.genhlth_breakdown ?? [];
  const maxGeneralHealth = Math.max(...generalHealth.map((row) => row.prevalence_pct), 1);

  return (
    <div className="pb-16">
      <header className="mb-8 max-w-3xl animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-accent-text">
          <Icon icon={ChartLine} size={14} />
          The data
        </span>
        <h1
          id="page-title"
          tabIndex={-1}
          className="mt-4 font-display text-[38px] font-bold leading-[1.03] tracking-[-0.03em] text-ink focus:outline-none sm:text-[52px]"
        >
          What 253,680 health surveys reveal
        </h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-soft">
          Every number below comes from the CDC&rsquo;s national health survey. These are
          patterns in the population, not proof that one thing causes another.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <Stat value="253,680" label="people surveyed" note="US adults, 2015" />
        <Stat
          value={`${Number(prevalence).toFixed(1)}%`}
          label="have diabetes or prediabetes"
          note="About 1 in 7 people"
        />
        <Stat value={featureCount} label="factors in the model" note="From body to habits" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-tile">
              <Icon icon={Users} size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
                Risk is highest in your 60s and 70s
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Share of people in each age band with diabetes or prediabetes.
              </p>
            </div>
          </div>
          <ul className="space-y-3.5">
            {ageBands.map((row) => (
              <BarRow key={row.label} label={row.label} value={row.value.toFixed(1)} max={maxAge} />
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            The dip after 80 likely reflects who takes part in the survey.
          </p>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-tile">
              <Icon icon={ChartLine} size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
                Weight is the big one
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Diabetes rate by BMI category. This is the factor you can change most.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {bmiRows.map((row) => {
              const tone =
                row.label === 'Healthy weight'
                  ? 'bg-good'
                  : row.label === 'Overweight'
                    ? 'bg-warn'
                    : row.label === 'Underweight'
                      ? 'bg-muted'
                      : 'bg-risk';
              return (
                <BarRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  max={maxBmi}
                  tone={tone}
                  meta={`${row.total.toLocaleString()} people`}
                />
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-tile">
              <Icon icon={ChartLine} size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
                Risk falls as income rises
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Diabetes rate by household income band. Income is a proxy for access, stress and
                time, not a cause on its own.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {incomes.map((row) => (
              <BarRow
                key={row.code}
                label={row.label}
                value={row.prevalence_pct.toFixed(1)}
                max={maxIncome}
                meta={`${row.total.toLocaleString()} people`}
              />
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-tile">
              <Icon icon={HeartPulse} size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
                Feeling worse tracks with risk
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Diabetes rate by self-rated general health. This is how people felt, not a
                clinical measurement.
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {generalHealth.map((row) => (
              <BarRow
                key={row.code}
                label={row.label}
                value={row.prevalence_pct.toFixed(1)}
                max={maxGeneralHealth}
                tone={row.code <= 2 ? 'bg-good' : row.code === 3 ? 'bg-warn' : 'bg-risk'}
                meta={`${row.total.toLocaleString()} people`}
              />
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-5 p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="icon-tile">
            <Icon icon={Apple} size={20} />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
              Habits and health show up in the numbers
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Diabetes rate with and without each factor. These are associations, not proof of
              cause.
            </p>
          </div>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {habits.map((item) => (
            <HabitRow key={item.feature} item={item} />
          ))}
        </ul>
      </section>

      <section className="mt-5 grid gap-3 lg:grid-cols-3">
        <div className="card flex gap-3 p-4">
          <Icon icon={Users} size={20} className="mt-0.5 shrink-0 text-accent-text" />
          <p className="text-[13.5px] leading-relaxed text-soft">
            <span className="font-semibold text-ink">Age sets the baseline.</span> Risk climbs
            after 35 and peaks in the 60s and 70s.
          </p>
        </div>
        <div className="card flex gap-3 p-4">
          <Icon icon={ChartLine} size={20} className="mt-0.5 shrink-0 text-accent-text" />
          <p className="text-[13.5px] leading-relaxed text-soft">
            <span className="font-semibold text-ink">Weight matters most.</span> The gap between
            healthy weight and obesity is wider than any habit in the survey.
          </p>
        </div>
        <div className="card flex gap-3 p-4">
          <Icon icon={Sparkles} size={20} className="mt-0.5 shrink-0 text-accent-text" />
          <p className="text-[13.5px] leading-relaxed text-soft">
            <span className="font-semibold text-ink">Habits add up.</span> Movement, fruit and
            vegetables are each linked to a lower rate.
          </p>
        </div>
      </section>

      <details className="group card mt-5">
        <summary className="flex items-center justify-between gap-3 p-5 text-sm font-semibold text-ink sm:p-6">
          <span className="flex items-center gap-2">
            <Icon icon={Info} size={17} className="text-muted" />
            Browse the full list of factors
          </span>
          <span className="text-xs font-medium text-muted group-open:hidden">Open</span>
          <span className="hidden text-xs font-medium text-muted group-open:inline">Close</span>
        </summary>
        <div className="border-t border-line">
          <ul className="divide-y divide-line sm:hidden">
            {modeledFeatures.map((row) => (
              <li key={row.feature} className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {row.category}
                </p>
                <p className="mt-0.5 text-[13.5px] font-semibold text-ink">
                  {FEATURE_LABELS[row.feature] ?? row.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{row.description}</p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.08em] text-muted">
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Factor
                </th>
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  What it means
                </th>
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Group
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {modeledFeatures.map((row) => (
                <tr key={row.feature}>
                  <td className="whitespace-nowrap px-5 py-2.5 font-medium text-ink">
                    {FEATURE_LABELS[row.feature] ?? row.label}
                  </td>
                  <td className="px-5 py-2.5 text-muted">{row.description}</td>
                  <td className="whitespace-nowrap px-5 py-2.5 text-muted">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </details>

      <p className="mt-6 flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
        <Icon icon={Info} size={14} className="mt-0.5 shrink-0" />
        <span>
          Source: CDC Behavioral Risk Factor Surveillance System, 2015. Distributed by the UCI
          Machine Learning Repository. Self-reported survey data has limits: people forget, guess,
          and under-report. Some raw associations, like heavy drinking, run opposite to
          expectation because of age and reporting patterns. Cholesterol-check history is left
          out of the model because it tracks contact with the health system, not risk. The model
          weighs many factors together rather than trusting any single one.
        </span>
      </p>
    </div>
  );
}
