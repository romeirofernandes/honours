import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './Icon.jsx';
import { AGE_OPTIONS, INCOME_OPTIONS, bmiBand } from '../lib/labels.js';
import { Check, ChevronDown } from '../lib/icons.js';
import {
  EASE_OUT,
  SPRING_FILL,
  SPRING_SNAP,
  SPRING_SOFT,
  useAnimatedNumber,
} from '../lib/motion.js';

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A section card. It is also the inline-size container for everything inside
 * it, so a two-column field grid collapses on its own when the card narrows,
 * not when the viewport does.
 *
 * The card fills the column. Its field groups share the available height, and
 * the answer area scrolls internally when a short viewport needs more room.
 * The footer stays fixed so the step controls are always available.
 */
export function Section({
  icon: SectionIcon,
  title,
  subtitle,
  children,
  footer,
  scrollRef,
  cue,
  className = '',
  contentClassName = '',
}) {
  return (
    <section
      className={`card card-query flex min-h-0 max-h-full flex-1 flex-col overflow-hidden ${className}`}
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
          style={{ padding: 'var(--cu-card-pad)' }}
        >
          <header
            className="flex items-start gap-2.5 sm:gap-3"
            style={{ marginBottom: 'var(--cu-stack-gap)' }}
          >
            <span className="icon-tile size-8 rounded-lg sm:size-9">
              <Icon icon={SectionIcon} size={17} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[18px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[21px]">
                {title}
              </h2>
              {subtitle ? (
                <p className="checkup-section-note mt-0.5 text-[12px] leading-snug text-muted sm:text-[12.5px]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </header>
          <div
            className={`checkup-fields ${contentClassName}`}
            style={{ gap: 'var(--cu-stack-gap)' }}
          >
            {children}
          </div>
        </div>
        {cue}
      </div>
      {footer ? (
        <div
          className="shrink-0 border-t border-line"
          style={{
            paddingInline: 'var(--cu-card-pad)',
            paddingBlock: '0.625rem',
          }}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}

/**
 * A grid of fields that becomes two columns once the card is wide enough.
 * Each cell is its own container, so a field inside a narrow cell adapts to
 * that cell rather than to the screen.
 */
export function FieldGrid({ children, className = '' }) {
  return <div className={`field-grid ${className}`}>{children}</div>;
}

export function Cell({ children, className = '' }) {
  return <div className={`field-cell ${className}`}>{children}</div>;
}

/**
 * Disclosure with an animated body. The button keeps the native disclosure
 * semantics (aria-expanded plus aria-controls) so the panel stays reachable
 * by keyboard and announced by screen readers.
 */
export function Disclosure({ summary, children, icon: SummaryIcon }) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken/60">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-[13.5px] font-semibold text-soft transition-colors duration-150 hover:text-ink"
      >
        <span className="flex items-center gap-2">
          {SummaryIcon ? <Icon icon={SummaryIcon} size={17} /> : null}
          {summary}
        </span>
        <motion.span
          className="shrink-0 text-muted"
          animate={{ rotate: open ? 180 : 0 }}
          transition={SPRING_SNAP}
        >
          <Icon icon={ChevronDown} size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={bodyId}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: SPRING_SOFT,
              opacity: { duration: 0.18, ease: EASE_OUT },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="field-grid field-grid--stacked border-t border-line p-3">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Binary rows: one icon, one question, two compact choices                    */
/* -------------------------------------------------------------------------- */

export function BinaryRow({
  icon: RowIcon,
  label,
  hint,
  name,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}) {
  const options = [
    { value: 1, label: yesLabel },
    { value: 0, label: noLabel },
  ];
  const labelId = useId();
  const hintId = useId();

  return (
    <fieldset
      className="field-cell min-w-0"
      aria-labelledby={labelId}
      aria-describedby={hint ? hintId : undefined}
    >
      <div className="field-row">
        <span className="field-row__icon">
          <Icon icon={RowIcon} size={18} />
        </span>
        <div className="field-row__text">
          <p id={labelId} className="field-row__label">
            {label}
          </p>
          {hint ? (
            <p id={hintId} className="field-row__hint">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="field-row__controls">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <motion.label
                key={option.value}
                whileTap={{ scale: 0.96 }}
                className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-3 py-2 text-[14px] font-semibold transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas ${
                  selected
                    ? 'border-accent bg-accent-soft text-accent-text'
                    : 'border-line-strong/60 bg-surface text-soft hover:border-line-strong hover:bg-sunken'
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                <AnimatePresence initial={false}>
                  {selected ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={SPRING_SNAP}
                      className="flex"
                    >
                      <Icon icon={Check} size={14} />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                {option.label}
              </motion.label>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Larger choice cards                                                        */
/* -------------------------------------------------------------------------- */

export function ChoiceCards({ label, hint, name, value, onChange, options }) {
  const hintId = useId();
  return (
    <fieldset className="field-cell min-w-0" aria-describedby={hint ? hintId : undefined}>
      <legend className="text-[15px] font-semibold leading-snug text-ink">{label}</legend>
      {hint ? (
        <p id={hintId} className="mt-0.5 text-[12.5px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      <div className="choice-cards__options mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          const OptionIcon = option.icon;
          return (
            <motion.label
              key={option.value}
              whileTap={{ scale: 0.98 }}
              className={`relative flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 pr-7 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas ${
                selected
                  ? 'border-accent bg-accent-soft text-accent-text'
                  : 'border-line-strong/60 bg-surface text-soft hover:border-line-strong hover:bg-sunken'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {OptionIcon ? (
                <motion.span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    selected ? 'bg-accent text-accent-ink' : 'bg-sunken text-soft'
                  }`}
                  animate={{ scale: selected ? 1 : 0.94 }}
                  transition={SPRING_SNAP}
                >
                  <Icon icon={OptionIcon} size={17} />
                </motion.span>
              ) : null}
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-tight">
                  {option.label}
                </span>
                {option.caption ? (
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {option.caption}
                  </span>
                ) : null}
              </span>
              <AnimatePresence initial={false}>
                {selected ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={SPRING_SNAP}
                    className="absolute right-2 top-2"
                  >
                    <Icon icon={Check} size={16} />
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Slider                                                                     */
/* -------------------------------------------------------------------------- */

export function Range({ id, value, min, max, step = 1, onChange, ariaValueText, describedBy }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-valuetext={ariaValueText}
      aria-describedby={describedBy}
      style={{ '--pct': `${pct}%` }}
      className="mt-1 block w-full"
    />
  );
}

export function AgeInput({ value, onChange }) {
  const hintId = useId();

  return (
    <fieldset className="field-cell min-w-0" aria-describedby={hintId}>
      <legend className="text-[15px] font-semibold leading-snug text-ink">
        Your age group
      </legend>
      <p id={hintId} className="age-hint mt-0.5 text-[12px] leading-snug text-muted sm:text-[12.5px]">
        Choose the range that includes you.
      </p>
      <div className="age-options mt-2 grid grid-cols-2 gap-1">
        {AGE_OPTIONS.map((option) => {
          const selected = Number(value) === option.value;
          return (
            <label
              key={option.value}
              className={`flex min-h-[30px] cursor-pointer items-center rounded-lg border px-2 py-1 text-[13px] font-semibold transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas ${
                selected
                  ? 'border-accent bg-accent-soft text-accent-text'
                  : 'border-line-strong/60 bg-surface text-soft hover:border-line-strong hover:bg-sunken'
              }`}
            >
              <input
                type="radio"
                name="age"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* BMI: height + weight in, silhouette out                                    */
/* -------------------------------------------------------------------------- */

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

function bmiFrom(height, weight) {
  const metres = Number(height) / 100;
  if (!metres || !weight) return 0;
  return Number(weight) / (metres * metres);
}

function clampBmi(value) {
  return Math.min(98, Math.max(12, value));
}

function BodyFigure({ bmi, sex = 1 }) {
  const scale = Math.max(0.78, Math.min(1.38, 0.9 + (Number(bmi) - 22) * 0.026));
  const feminine = Number(sex) === 0;

  return (
    <svg
      viewBox="0 0 120 200"
      className="h-16 w-auto text-soft sm:h-20"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {feminine ? (
        <g strokeWidth="2.4">
          {/* A chin-length bob with a side-swept fringe. Filling the silhouette
              with the tile colour keeps the face open without a solid block. */}
          <path
            d="M47.1 26.5C45.5 17.2 51.2 9.2 60 9.2s14.5 8 12.9 17.3c-.5 3.3-1.4 6.8-2.8 10.3-2 5.1-5.3 9.5-10.1 13.2-4.8-3.7-8.1-8.1-10.1-13.2-1.4-3.5-2.3-7-2.8-10.3Z"
            fill="oklch(var(--sunken))"
          />
          <path d="M50.2 18.2c3.1-4.4 8.7-5.5 12.8-2.7 1.9 1.3 3.3 3.2 4 5.4" />
          <path d="M59.2 11.2c-2.7 2.4-4.7 5.8-5.6 9.9" />
        </g>
      ) : null}
      <circle cx="60" cy="23" r="11.5" fill="oklch(var(--sunken))" />
      <path d="M54.5 34.5h11" />
      <motion.g
        style={{ transformOrigin: '60px 96px' }}
        animate={{ scaleX: scale }}
        transition={SPRING_SOFT}
      >
        {/* shoulders, waist, hips and arms; scaling the group widens the frame
            without turning the head into an egg */}
        <path d="M45 49c-5 2-8 7-10 14l-4 20c-1 6 1 9 5 10 4 1 6-2 7-7l3-13" />
        <path d="M75 49c5 2 8 7 10 14l4 20c1 6-1 9-5 10-4 1-6-2-7-7l-3-13" />
        <path d="M45 49c5-2 25-2 30 0 5 3 6 9 6 16 0 6-2 12-4 18-2 6-1 11 1 17 1 4 1 8-1 11-3 5-9 8-17 8s-14-3-17-8c-2-3-2-7-1-11 2-6 3-11 1-17-2-6-4-12-4-18 0-7 1-13 6-16z" />
        <path d="M52 118l-2 28-2 42M68 118l2 28 2 42" />
        <path d="M46 188h10M64 188h10" />
      </motion.g>
    </svg>
  );
}

/**
 * BMI entry.
 *
 * The draft state (height, weight, units) lives with the caller so that
 * switching steps and coming back does not throw the reader's numbers away.
 */
export function BmiInput({ value, onChange, sex = 1, draft, onDraftChange }) {
  const {
    units,
    heightCm,
    weightKg,
    feet,
    inches,
    pounds,
  } = draft;
  const patch = (next) => onDraftChange({ ...draft, ...next });

  const band = bmiBand(value);
  const bmiNumber = useAnimatedNumber(Number(value), {
    format: (latest) => latest.toFixed(1),
  });
  const chipTone =
    band.tone === 'good'
      ? 'bg-good-soft text-good-text'
      : band.tone === 'warn'
        ? 'bg-warn-soft text-warn-text'
        : 'bg-risk-soft text-risk-text';

  /* If the BMI changes from outside (for example, "Try these changes"),
     move the weight to match the current height. */
  useEffect(() => {
    const computed = bmiFrom(heightCm, weightKg);
    if (Math.abs(computed - Number(value)) > 0.2) {
      const nextWeight = round1(clampBmi(Number(value)) * (heightCm / 100) ** 2);
      patch({ weightKg: nextWeight, pounds: Math.round(nextWeight / 0.45359237) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commitMetric = (nextHeight, nextWeight) => {
    if (!nextHeight || !nextWeight) return;
    onChange(round1(clampBmi(bmiFrom(nextHeight, nextWeight))));
  };

  const updateHeight = (raw) => {
    const next = raw === '' ? '' : Number(raw);
    patch({ heightCm: next });
    if (next !== '') commitMetric(next, weightKg);
  };

  const updateWeight = (raw) => {
    const next = raw === '' ? '' : Number(raw);
    patch({ weightKg: next });
    if (next !== '') commitMetric(heightCm, next);
  };

  const updateImperial = (field, raw) => {
    const next = raw === '' ? '' : Number(raw);
    const nextFeet = field === 'feet' ? next : feet;
    const nextInches = field === 'inches' ? next : inches;
    const nextPounds = field === 'pounds' ? next : pounds;

    patch({ [field]: next });

    if (nextFeet === '' || nextInches === '' || nextPounds === '') return;

    const totalInches = Number(nextFeet) * 12 + Number(nextInches);
    const nextHeight = round1(totalInches * 2.54);
    const nextWeight = Number(nextPounds) * 0.45359237;
    patch({ heightCm: nextHeight, weightKg: round1(nextWeight) });
    onChange(round1(clampBmi(bmiFrom(nextHeight, nextWeight))));
  };

  const switchUnits = (next) => {
    if (next === units) return;
    if (next === 'imperial') {
      const totalInches = heightCm / 2.54;
      let nextFeet = Math.floor(totalInches / 12);
      let nextInches = Math.round(totalInches - nextFeet * 12);
      if (nextInches === 12) {
        nextFeet += 1;
        nextInches = 0;
      }
      patch({
        feet: nextFeet,
        inches: nextInches,
        pounds: Math.round(weightKg / 0.45359237),
      });
    }
    patch({ units: next });
  };

  const resetMetric = (field, fallback) => {
    if (field === 'height' && (!heightCm || heightCm < 120 || heightCm > 220)) {
      patch({ heightCm: fallback });
      commitMetric(fallback, weightKg);
    }
    if (field === 'weight' && (!weightKg || weightKg < 30 || weightKg > 250)) {
      patch({ weightKg: fallback });
      commitMetric(heightCm, fallback);
    }
  };

  const resetImperial = (field, fallback) => {
    if (field === 'feet' && (!feet || feet < 3 || feet > 8)) {
      patch({ feet: fallback });
      updateImperial('feet', fallback);
    }
    if (field === 'inches' && (inches === '' || inches < 0 || inches > 11)) {
      patch({ inches: fallback });
      updateImperial('inches', fallback);
    }
    if (field === 'pounds' && (!pounds || pounds < 66 || pounds > 550)) {
      const fallbackPounds = Math.round(fallback / 0.45359237);
      patch({ pounds: fallbackPounds });
      updateImperial('pounds', fallbackPounds);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-line-strong/70 bg-surface px-3 py-1.5 text-[15px] tabular-nums text-ink transition-colors duration-150 hover:border-line-strong focus:border-accent sm:py-2';

  return (
    <div className="field-cell min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink">Height and weight</p>
        </div>
        <div
          role="group"
          aria-label="Height and weight units"
          className="relative inline-flex shrink-0 rounded-lg border border-line bg-sunken/60 p-0.5"
        >
          {[
            { id: 'metric', label: 'cm / kg' },
            { id: 'imperial', label: 'ft / lb' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={units === option.id}
              onClick={() => switchUnits(option.id)}
              className="relative rounded-md px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors duration-150 hover:text-soft"
            >
              {units === option.id ? (
                <motion.span
                  layoutId="bmi-unit-pill"
                  className="absolute inset-0 rounded-md bg-surface shadow-sm"
                  transition={SPRING_SNAP}
                />
              ) : null}
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  units === option.id ? 'text-ink' : ''
                }`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The silhouette and the readout sit side by side; the number is the
          figure, the silhouette only shows how the shape changed. */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl bg-sunken sm:h-20 sm:w-[58px]">
          <BodyFigure bmi={value} sex={sex} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">
            Your BMI
          </p>
          <div className="mt-px flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex items-baseline gap-1.5">
              <motion.span className="font-display text-[24px] font-semibold leading-none tabular-nums text-ink sm:text-[30px]">
                {bmiNumber}
              </motion.span>
              <span className="text-[11px] text-muted">kg/m²</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${chipTone}`}>
              {band.label}
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            BMI {Number(value).toFixed(1)}, {band.label}.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {units === 'metric' ? (
          <>
            <div>
              <label htmlFor="height" className="text-[14px] font-semibold text-ink">
                Height
              </label>
              <div className="relative mt-1">
                <input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  min="120"
                  max="220"
                  step="0.1"
                  value={heightCm}
                  onChange={(event) => updateHeight(event.target.value)}
                  onBlur={() => resetMetric('height', 175)}
                  className={`${inputClass} pr-9`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                  cm
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="weight" className="text-[14px] font-semibold text-ink">
                Weight
              </label>
              <div className="relative mt-1">
                <input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  min="30"
                  max="250"
                  step="0.1"
                  value={weightKg}
                  onChange={(event) => updateWeight(event.target.value)}
                  onBlur={() => resetMetric('weight', round1(Number(value) * (heightCm / 100) ** 2))}
                  className={`${inputClass} pr-9`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                  kg
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <fieldset>
              <legend className="text-[14px] font-semibold text-ink">Height</legend>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    id="height-feet"
                    type="number"
                    inputMode="numeric"
                    min="3"
                    max="8"
                    step="1"
                    value={feet}
                    onChange={(event) => updateImperial('feet', event.target.value)}
                    onBlur={() => resetImperial('feet', 5)}
                    aria-label="Height in feet"
                    className={`${inputClass} pr-8`}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                    ft
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="height-inches"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="11"
                    step="1"
                    value={inches}
                    onChange={(event) => updateImperial('inches', event.target.value)}
                    onBlur={() => resetImperial('inches', 9)}
                    aria-label="Height in inches"
                    className={`${inputClass} pr-8`}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                    in
                  </span>
                </div>
              </div>
            </fieldset>
            <div>
              <label htmlFor="weight-pounds" className="text-[14px] font-semibold text-ink">
                Weight
              </label>
              <div className="relative mt-1">
                <input
                  id="weight-pounds"
                  type="number"
                  inputMode="decimal"
                  min="66"
                  max="550"
                  step="1"
                  value={pounds}
                  onChange={(event) => updateImperial('pounds', event.target.value)}
                  onBlur={() => resetImperial('pounds', weightKg)}
                  className={`${inputClass} pr-9`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                  lb
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bad-day meter                                                              */
/* -------------------------------------------------------------------------- */

export function DayInput({ id, label, hint, value, onChange, icon: FieldIcon }) {
  return (
    <div className="field-cell min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {FieldIcon ? (
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sunken text-soft">
              <Icon icon={FieldIcon} size={17} />
            </span>
          ) : null}
          <div className="min-w-0">
            <label htmlFor={id} className="text-[15px] font-semibold text-ink">
              {label}
            </label>
            <p id={`${id}-hint`} className="mt-0.5 text-[13px] leading-snug text-muted sm:text-[13.5px]">
              {hint}
            </p>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-right font-display text-[19px] font-semibold leading-none tabular-nums text-ink sm:text-[20px]"
        >
          {value}
          <span className="ml-1 font-sans text-[11px] font-medium text-muted">
            {value === 1 ? 'day' : 'days'}
          </span>
        </span>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {Array.from({ length: 30 }, (_, index) => (
          <span
            key={index}
            className="relative h-3 flex-1 overflow-hidden rounded-full bg-sunken"
          >
            <motion.span
              className="absolute inset-0 bg-accent"
              initial={false}
              animate={{ opacity: index < value ? 1 : 0 }}
              transition={SPRING_FILL}
            />
          </span>
        ))}
      </div>
      <Range
        id={id}
        min={0}
        max={30}
        value={value}
        onChange={onChange}
        ariaValueText={`${value} out of the last 30 days`}
        describedBy={`${id}-hint`}
      />
      <div className="flex justify-between text-[10.5px] text-muted">
        <span>None</span>
        <span>Every day</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* General health: face scale                                                 */
/* -------------------------------------------------------------------------- */

export function HealthScale({ value, onChange, options }) {
  const hintId = useId();
  return (
    <fieldset className="field-cell min-w-0" aria-describedby={hintId}>
      <legend className="text-[15px] font-semibold text-ink">Overall, how is your health?</legend>
      <p id={hintId} className="mt-0.5 text-[13px] leading-snug text-muted sm:text-[13.5px]">
        There is no wrong answer. Pick the one that feels closest.
      </p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {options.map((option) => {
          const selected = value === option.value;
          const OptionIcon = option.icon;
          return (
            <motion.label
              key={option.value}
              whileTap={{ scale: 0.96 }}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas ${
                selected
                  ? 'border-accent bg-accent-soft text-accent-text'
                  : 'border-line-strong/60 bg-surface text-soft hover:border-line-strong hover:bg-sunken'
              }`}
            >
              <input
                type="radio"
                name="genhlth"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <motion.span
                className="flex"
                animate={{ scale: selected ? 1.1 : 1, y: selected ? -1 : 0 }}
                transition={SPRING_SNAP}
              >
                <Icon icon={OptionIcon} size={25} strokeWidth={selected ? 2 : 1.75} />
              </motion.span>
              <span className="text-[12px] font-semibold leading-tight">
                {option.label}
              </span>
            </motion.label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export function SelectInput({ id, label, hint, value, onChange, options }) {
  return (
    <div className="field-cell min-w-0">
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-0.5 text-[13px] leading-snug text-muted sm:text-[13.5px]">
          {hint}
        </p>
      ) : null}
      <div className="relative mt-1">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="w-full appearance-none rounded-lg border border-line-strong/70 bg-surface px-3 py-1.5 text-[14.5px] text-ink transition-colors duration-150 hover:border-line-strong sm:py-2 sm:text-[15px]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          icon={ChevronDown}
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}

export function IncomeInput({ value, onChange }) {
  return (
    <div className="field-cell min-w-0">
      <label htmlFor="income" className="text-[15px] font-semibold text-ink">
        Household income
      </label>
      <p id="income-hint" className="mt-0.5 text-[13px] leading-snug text-muted sm:text-[13.5px]">
        A rough annual range is enough.
      </p>
      <div className="relative mt-1">
        <select
          id="income"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-describedby="income-hint"
          className="w-full appearance-none rounded-lg border border-line-strong/70 bg-surface px-3 py-1.5 text-[14.5px] text-ink transition-colors duration-150 hover:border-line-strong sm:py-2 sm:text-[15px]"
        >
          {INCOME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          icon={ChevronDown}
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}
