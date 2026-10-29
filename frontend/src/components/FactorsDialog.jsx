import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './Icon.jsx';
import { Close, Info } from '../lib/icons.js';
import { FEATURE_LABELS, formatFeatureValue } from '../lib/labels.js';
import { EASE_OUT, SPRING_SOFT } from '../lib/motion.js';

function points(value) {
  const size = Math.abs(value);
  const shown = size >= 10 ? Math.round(size) : size.toFixed(1);
  return `${value > 0 ? '+' : '−'}${shown}`;
}

/**
 * Every factor in one place.
 *
 * Twenty rows are more than a card column can show without becoming a
 * peephole, so the full list opens over the page instead of squeezing into
 * it. The card keeps the summary; this keeps the detail. On a wide screen it
 * is a centred panel, on a narrow one a sheet from the bottom.
 */
export default function FactorsDialog({ open, onClose, contributions }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="factors"
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="factors-title"
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={SPRING_SOFT}
            className="relative flex max-h-[86dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-float sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-4">
              <div className="min-w-0">
                <h2
                  id="factors-title"
                  className="font-display text-[17px] font-semibold leading-tight text-ink"
                >
                  Every factor
                </h2>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">
                  How much each answer moves your estimate, in percentage points.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close the factor list"
                className="press flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-soft hover:bg-sunken hover:text-ink"
              >
                <Icon icon={Close} size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-line">
                {contributions.map((item) => (
                  <li
                    key={item.feature}
                    className="flex items-center justify-between gap-3 px-4 py-2 text-[13px]"
                  >
                    <span className="min-w-0 truncate text-soft">
                      {FEATURE_LABELS[item.feature] ?? item.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="max-w-[9rem] truncate text-[12px] text-muted">
                        {formatFeatureValue(item.feature, item.patient_value)}
                      </span>
                      <span
                        className={`w-12 text-right font-semibold tabular-nums ${
                          item.risk_contribution_pct > 0
                            ? 'text-risk-text'
                            : item.risk_contribution_pct < 0
                              ? 'text-good-text'
                              : 'text-muted'
                        }`}
                      >
                        {item.risk_contribution_pct === 0
                          ? '0'
                          : points(item.risk_contribution_pct)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="flex shrink-0 items-start gap-2 border-t border-line bg-surface p-4 text-[11px] leading-snug text-muted">
              <Icon icon={Info} size={13} className="mt-0.5 shrink-0" />
              A positive number raises your estimate, a negative one lowers it.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
