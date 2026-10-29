import { HugeiconsIcon } from '@hugeicons/react';

/**
 * Thin wrapper so every icon uses one stroke width and inherits color.
 * Decorative by default; icon-only controls carry their own aria-label.
 */
export function Icon({ icon, size = 20, className = '', strokeWidth = 1.75 }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}
