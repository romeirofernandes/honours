import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './Icon.jsx';
import ResultCard from './ResultCard.jsx';
import { ScrollCue } from './PageGrid.jsx';
import {
  AgeInput,
  BinaryRow,
  BmiInput,
  Cell,
  ChoiceCards,
  DayInput,
  Disclosure,
  FieldGrid,
  HealthScale,
  IncomeInput,
  Section,
  SelectInput,
} from './inputs.jsx';
import {
  Activity,
  Apple,
  ArrowRight,
  Beer,
  BloodPressure,
  Brain,
  Broccoli,
  Cigarette,
  Droplet,
  FaceSmile,
  Female,
  HeartCheck,
  HeartPulse,
  Male,
  Running,
  Stethoscope,
  User,
} from '../lib/icons.js';
import {
  EDUCATION_OPTIONS,
  GENHLTH_OPTIONS,
} from '../lib/labels.js';
import { EASE_OUT, SPRING_SNAP, SPRING_SOFT } from '../lib/motion.js';

function MobileSummary({ prediction, onOpenDetails }) {
  if (!prediction) return null;
  const pct = prediction.probability_pct;
  const label = pct < 20 ? 'Low' : pct < 28 ? 'Watch' : pct < 50 ? 'Elevated' : 'High';
  const tone =
    pct < 20
      ? 'bg-good-soft text-good-text'
      : pct < 50
        ? 'bg-warn-soft text-warn-text'
        : 'bg-risk-soft text-risk-text';

  return (
    <div
      className="z-30 shrink-0 -mx-4 border-t border-line bg-canvas/95 px-4 pt-2 backdrop-blur-md sm:-mx-6 sm:pt-3 lg:hidden"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={onOpenDetails}
        className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface px-3 py-1.5 text-left shadow-lift"
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="font-display text-xl font-semibold leading-none tabular-nums text-ink sm:text-2xl">
            {Math.round(pct)}%
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
            {label}
          </span>
          <span className="truncate text-xs text-muted">chance</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent-text">
          Details
          <Icon icon={ArrowRight} size={14} />
        </span>
      </button>
    </div>
  );
}

/**
 * On a narrow screen the full result card is a sheet that slides up from the
 * bottom. The page underneath never scrolls, and the estimate stays visible
 * in the summary bar.
 */
function ResultSheet({ open, onClose, ...cardProps }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close the estimate details"
            onClick={onClose}
            className="absolute inset-0 bg-black/45"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Your estimate"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRING_SOFT}
            className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-line bg-canvas p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-float"
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line-strong/50" />
            <ResultCard {...cardProps} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * A scroll cue for the form region.
 *
 * The page itself never scrolls, so the question list scrolls inside its own
 * box. Without a cue, the content under the edge looks simply cut off, so a
 * fade appears whenever there is more to see and disappears once the reader
 * reaches the end.
 */
export default function Checkup({
  indicators,
  onChange,
  prediction,
  isPredicting,
  error,
  onRetry,
  onApplyInterventions,
}) {
  const set = (field, value) => onChange({ ...indicators, [field]: value });
  const [part, setPart] = useState('you');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bmiDraft, setBmiDraft] = useState(() => ({
    units: 'metric',
    heightCm: 175,
    weightKg: Math.round(Number(indicators.BMI) * 1.75 * 1.75 * 10) / 10,
    feet: 5,
    inches: 9,
    pounds: Math.round((Number(indicators.BMI) * 1.75 * 1.75) / 0.45359237),
  }));
  const scrollRef = useRef(null);

  const parts = [
    {
      id: 'you',
      label: 'About you',
      short: 'You',
      icon: User,
      title: 'Who you are',
      subtitle: 'A few basics, plus the background you choose to share.',
      content: (
        <>
          <AgeInput value={indicators.Age} onChange={(value) => set('Age', value)} />
          <ChoiceCards
            label="Sex"
            hint="Diabetes risk differs slightly by sex."
            name="sex"
            value={indicators.Sex}
            onChange={(value) => set('Sex', value)}
            options={[
              { value: 0, label: 'Female', icon: Female },
              { value: 1, label: 'Male', icon: Male },
            ]}
          />
          <FieldGrid>
            <Cell>
              <SelectInput
                id="education"
                label="Education"
                hint="Highest level you finished."
                value={indicators.Education}
                onChange={(value) => set('Education', value)}
                options={EDUCATION_OPTIONS}
              />
            </Cell>
            <Cell>
              <IncomeInput
                value={indicators.Income}
                onChange={(value) => set('Income', value)}
              />
            </Cell>
          </FieldGrid>
        </>
      ),
    },
    {
      id: 'body',
      label: 'Your body',
      short: 'Body',
      icon: Stethoscope,
      title: 'Your body',
      subtitle: 'Measurements and conditions you already know about.',
      content: (
        <>
          <BmiInput
            value={indicators.BMI}
            sex={indicators.Sex}
            draft={bmiDraft}
            onDraftChange={setBmiDraft}
            onChange={(value) => set('BMI', value)}
          />
          <FieldGrid className="field-grid--stacked">
            <Cell>
              <BinaryRow
                icon={BloodPressure}
                label="High blood pressure"
                hint="Has a doctor told you your blood pressure is high?"
                name="highbp"
                value={indicators.HighBP}
                onChange={(value) => set('HighBP', value)}
              />
            </Cell>
            <Cell>
              <BinaryRow
                icon={Droplet}
                label="High cholesterol"
                hint="Has a doctor told you your cholesterol is high?"
                name="highchol"
                value={indicators.HighChol}
                onChange={(value) => set('HighChol', value)}
              />
            </Cell>
          </FieldGrid>
          <Disclosure summary="Heart and stroke history">
            <BinaryRow
              icon={HeartCheck}
              label="Heart disease"
              hint="Heart attack or heart disease, ever?"
              name="heartdisease"
              value={indicators.HeartDiseaseorAttack}
              onChange={(value) => set('HeartDiseaseorAttack', value)}
            />
            <BinaryRow
              icon={Brain}
              label="Stroke"
              hint="Ever had a stroke?"
              name="stroke"
              value={indicators.Stroke}
              onChange={(value) => set('Stroke', value)}
            />
          </Disclosure>
        </>
      ),
    },
    {
      id: 'habits',
      label: 'Daily habits',
      short: 'Habits',
      icon: Apple,
      title: 'Your daily habits',
      subtitle: 'Movement, food and other day-to-day habits.',
      content: (
        <FieldGrid className="field-grid--stacked field-grid--spread">
          <Cell>
            <BinaryRow
              icon={Running}
              label="Physical activity"
              hint="Any exercise in the last month, beyond your job?"
              name="physactivity"
              value={indicators.PhysActivity}
              onChange={(value) => set('PhysActivity', value)}
            />
          </Cell>
          <Cell>
            <BinaryRow
              icon={Apple}
              label="Fruit"
              hint="Do you eat fruit most days?"
              name="fruits"
              value={indicators.Fruits}
              onChange={(value) => set('Fruits', value)}
            />
          </Cell>
          <Cell>
            <BinaryRow
              icon={Broccoli}
              label="Vegetables"
              hint="Do you eat vegetables most days?"
              name="veggies"
              value={indicators.Veggies}
              onChange={(value) => set('Veggies', value)}
            />
          </Cell>
          <Cell>
            <BinaryRow
              icon={Cigarette}
              label="Smoking"
              hint="Have you smoked 100 or more cigarettes in your life?"
              name="smoker"
              value={indicators.Smoker}
              onChange={(value) => set('Smoker', value)}
              yesLabel="Yes"
              noLabel="Never"
            />
          </Cell>
          <Cell>
            <BinaryRow
              icon={Beer}
              label="Heavy drinking"
              hint="Do you often have more than 2 drinks a day?"
              name="alcohol"
              value={indicators.HvyAlcoholConsump}
              onChange={(value) => set('HvyAlcoholConsump', value)}
            />
          </Cell>
        </FieldGrid>
      ),
    },
    {
      id: 'mind',
      label: 'Wellbeing',
      short: 'Health',
      icon: FaceSmile,
      title: 'How you’re feeling',
      subtitle: 'Overall health and the days that felt harder.',
      content: (
        <>
          <HealthScale
            value={indicators.GenHlth}
            onChange={(value) => set('GenHlth', value)}
            options={GENHLTH_OPTIONS}
          />
          <FieldGrid className="field-grid--stacked field-grid--fill">
            <Cell>
              <DayInput
                id="physhlth"
                icon={HeartPulse}
                label="Poor physical health"
                hint="Days when illness or injury limited you."
                value={indicators.PhysHlth}
                onChange={(value) => set('PhysHlth', value)}
              />
            </Cell>
            <Cell>
              <DayInput
                id="menthlth"
                icon={Brain}
                label="Poor mental health"
                hint="Days when stress, mood or worry got in the way."
                value={indicators.MentHlth}
                onChange={(value) => set('MentHlth', value)}
              />
            </Cell>
          </FieldGrid>
          <BinaryRow
            icon={Activity}
            label="Walking difficulty"
            hint="Serious trouble walking or climbing stairs?"
            name="diffwalk"
            value={indicators.DiffWalk}
            onChange={(value) => set('DiffWalk', value)}
          />
        </>
      ),
    },
  ];

  const activeIndex = Math.max(
    0,
    parts.findIndex((item) => item.id === part),
  );
  const activePart = parts[activeIndex];
  const isLast = activeIndex === parts.length - 1;

  const changePart = (index) => setPart(parts[index].id);

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % parts.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + parts.length) % parts.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = parts.length - 1;
    else return;

    event.preventDefault();
    changePart(nextIndex);
    window.requestAnimationFrame(() => {
      document.getElementById(`checkup-tab-${parts[nextIndex].id}`)?.focus();
    });
  };

  const revealResult = () => {
    if (window.innerWidth < 1024) {
      setSheetOpen(true);
      return;
    }
    document.getElementById('result-title')?.focus({ preventScroll: true });
  };

  const cardProps = {
    prediction,
    isPredicting,
    error,
    onRetry,
    onApplyInterventions,
  };

  return (
    <div className="checkup flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="flex min-h-0 min-w-0 flex-col lg:col-span-8">
          <header
            className="max-w-3xl shrink-0"
            style={{ marginBottom: 'var(--cu-hero-gap)' }}
          >
            <h1
              id="page-title"
              tabIndex={-1}
              className="font-display font-bold leading-[1.05] tracking-[-0.03em] text-ink focus:outline-none"
              style={{ fontSize: 'var(--cu-hero-size)' }}
            >
              How likely is diabetes?
            </h1>
            <p className="checkup-hero-note mt-1 max-w-[52ch] text-[12.5px] leading-relaxed text-soft sm:text-[14px]">
              Answer a few everyday questions. Your estimate updates as you go.
            </p>
          </header>

          <div
            role="tablist"
            aria-label="Check-up parts"
            className="grid shrink-0 grid-cols-4 gap-1 rounded-xl border border-line bg-surface p-1"
          >
            {parts.map((item, index) => {
              const selected = item.id === activePart.id;
              return (
                <button
                  key={item.id}
                  id={`checkup-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`checkup-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => changePart(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`press relative flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-[11px] font-semibold sm:gap-2 sm:px-3 sm:text-[13px] ${
                    selected ? 'text-accent-ink' : 'text-soft hover:bg-sunken hover:text-ink'
                  }`}
                  style={{ paddingBlock: 'var(--cu-tab-pad)' }}
                >
                  {selected ? (
                    <motion.span
                      layoutId="checkup-tab-pill"
                      className="absolute inset-0 rounded-lg bg-accent shadow-sm"
                      transition={SPRING_SNAP}
                    />
                  ) : null}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon icon={item.icon} size={15} />
                    <span className="truncate sm:hidden">{item.short}</span>
                    <span className="hidden truncate sm:inline">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* The step card owns the whole column height: its body scrolls
              inside the card if the answers need more room, while the
              Back / Next bar stays pinned to the card footer. */}
          <div
            className="relative min-h-0 flex-1"
            style={{ marginTop: 'var(--cu-gap)' }}
          >
            {/* The panel swaps with a fade and a short rise. The card
                inside does its own entrance, so the two together read as
                one movement rather than two stacked ones. */}
            <motion.div
              key={activePart.id}
              id={`checkup-panel-${activePart.id}`}
              role="tabpanel"
              aria-labelledby={`checkup-tab-${activePart.id}`}
              tabIndex={0}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: EASE_OUT }}
              className="flex h-full min-h-0 flex-col focus:outline-none"
            >
              <Section
                className={
                  activePart.id === 'body'
                    ? 'checkup-section--body'
                    : activePart.id === 'you'
                      ? 'checkup-section--you'
                      : ''
                }
                icon={activePart.icon}
                title={activePart.title}
                subtitle={activePart.subtitle}
                contentClassName={
                  activePart.id === 'habits'
                    ? 'checkup-fields--start checkup-fields--habits'
                    : activePart.id === 'mind'
                      ? 'checkup-fields--start'
                      : ''
                }
                scrollRef={scrollRef}
                cue={<ScrollCue targetRef={scrollRef} className="!from-surface" />}
                footer={
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => changePart(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      className="press inline-flex items-center gap-1.5 rounded-lg border border-line-strong/60 bg-surface px-3.5 py-2 text-xs font-semibold text-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                    >
                      <Icon icon={ArrowRight} size={14} className="rotate-180" />
                      Back
                    </button>
                    <p
                      className="text-xs font-medium tabular-nums text-muted"
                      aria-live="polite"
                    >
                      Part {activeIndex + 1} of {parts.length}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        isLast ? revealResult() : changePart(activeIndex + 1)
                      }
                      className="press inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-accent-ink sm:text-sm"
                    >
                      {isLast ? 'See estimate' : 'Next'}
                      <Icon icon={ArrowRight} size={14} />
                    </button>
                  </div>
                }
              >
                {activePart.content}
              </Section>
            </motion.div>
          </div>
        </div>

        {/* On a wide screen the result sits beside the form. On a narrow one
            it becomes a sheet, so the form keeps the whole screen. */}
        <aside
          id="result"
          className="hidden min-h-0 lg:col-span-4 lg:flex lg:flex-col"
        >
          <ResultCard {...cardProps} />
        </aside>
      </div>

      <MobileSummary
        prediction={error ? null : prediction}
        onOpenDetails={() => setSheetOpen(true)}
      />

      <ResultSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        {...cardProps}
      />
    </div>
  );
}
