import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion.js';

/**
 * A fade at the bottom edge of a scroll region, so content that continues
 * past the edge is signposted rather than looking cut off. It disappears
 * once the reader reaches the end of the region.
 */
export function ScrollCue({ targetRef, className = '' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return undefined;

    const update = () => {
      const remaining = element.scrollHeight - element.clientHeight - element.scrollTop;
      setShow(element.scrollHeight > element.clientHeight + 1 && remaining > 4);
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [targetRef]);

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-canvas to-transparent ${className}`}
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
    />
  );
}

/**
 * Dashed blueprint grid that sits behind the whole app.
 *
 * Two effects are combined:
 *   1. the dash pattern, made by intersecting a vertical and a horizontal
 *      repeating gradient so the lines break into 3px dashes on an 8px grid;
 *   2. the corner fades, two radial masks (bottom-left and top-right) that are
 *      unioned together, so the grid is strongest at those two corners and
 *      dissolves across the middle of the screen.
 *
 * The mask layers are composited with `intersect` for the dashes and `add` for
 * the two corner fades, which is what turns "one corner" into "both corners".
 * ponytail: relies on `mask-composite` (Chrome 120+, Safari 15.4+). Older
 * engines fall back to the plain dash pattern, which still reads as a grid.
 */
export default function PageGrid() {
  const dashMask = `
    repeating-linear-gradient(to right, black 0 3px, transparent 3px 8px),
    repeating-linear-gradient(to bottom, black 0 3px, transparent 3px 8px)
  `;

  const cornerFade = `
    radial-gradient(ellipse 80% 80% at 0% 100%, black 50%, transparent 90%),
    radial-gradient(ellipse 80% 80% at 100% 0%, black 50%, transparent 90%)
  `;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(var(--grid-line)) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(var(--grid-line)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0',
          maskImage: `${dashMask}, ${cornerFade}`,
          WebkitMaskImage: `${dashMask}, ${cornerFade}`,
          maskComposite: 'intersect, intersect, add, add',
          WebkitMaskComposite: 'source-in, source-in, source-over, source-over',
        }}
      />
    </div>
  );
}
