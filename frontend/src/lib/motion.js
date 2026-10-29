import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'motion/react';

/**
 * Shared motion tokens.
 *
 * Every animation in the app pulls its curve and spring from here so the
 * interface moves with one voice: an expo-out curve for entrances, a soft
 * spring for anything that changes size, and a snappier spring for controls
 * that answer a press.
 */

/** Entrance / exit curve: quick out of the gate, long settle. */
export const EASE_OUT = [0.16, 1, 0.3, 1];

/** Gentler curve for layout-ish shifts. */
export const EASE_SOFT = [0.22, 1, 0.36, 1];

/** Big, slow moves: panels, silhouettes, expanding regions. */
export const SPRING_SOFT = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 };

/** Controls that answer a press: tab pills, check marks, chevrons. */
export const SPRING_SNAP = { type: 'spring', stiffness: 460, damping: 36, mass: 0.7 };

/** Values that fill: meters, bars, a marker sliding along a scale. */
export const SPRING_FILL = { type: 'spring', stiffness: 190, damping: 26, mass: 0.9 };

/** Numbers that count up to a new estimate. */
export const SPRING_NUMBER = { type: 'spring', stiffness: 130, damping: 22, mass: 0.9 };

const defaultFormat = (latest) => {
  const rounded = Number(latest.toFixed(2));
  return rounded < 1 ? rounded.toFixed(1) : String(Math.round(rounded));
};

/**
 * A number that springs to its new value instead of snapping.
 *
 * Returns a MotionValue of the formatted string, so the count-up never
 * re-renders React.
 */
export function useAnimatedNumber(value, options = {}) {
  const { spring = SPRING_NUMBER, format = defaultFormat } = options;
  const source = useMotionValue(value);
  const smoothed = useSpring(source, spring);
  const display = useTransform(smoothed, format);

  useEffect(() => {
    source.set(value);
  }, [source, value]);

  return display;
}

/**
 * A percentage position that springs to its new value.
 * Returns a MotionValue string like "42%", ready to drop into a style.
 */
export function useAnimatedPercent(value, options = {}) {
  const { spring = SPRING_FILL } = options;
  const source = useMotionValue(value);
  const smoothed = useSpring(source, spring);
  const display = useTransform(smoothed, (latest) => `${latest.toFixed(2)}%`);

  useEffect(() => {
    source.set(value);
  }, [source, value]);

  return display;
}

/**
 * Width of an element, kept in sync with its box.
 * Used to turn a percentage position into pixels so it can be animated with a
 * spring instead of jumping.
 */
export function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
