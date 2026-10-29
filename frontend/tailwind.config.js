/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    // Gate every `hover:` utility behind `@media (hover: hover)` so touch taps
    // never latch a hover state.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        canvas: 'oklch(var(--canvas) / <alpha-value>)',
        surface: 'oklch(var(--surface) / <alpha-value>)',
        sunken: 'oklch(var(--sunken) / <alpha-value>)',
        ink: 'oklch(var(--ink) / <alpha-value>)',
        soft: 'oklch(var(--soft) / <alpha-value>)',
        muted: 'oklch(var(--muted) / <alpha-value>)',
        line: 'oklch(var(--line) / <alpha-value>)',
        'line-strong': 'oklch(var(--line-strong) / <alpha-value>)',
        accent: 'oklch(var(--accent) / <alpha-value>)',
        'accent-strong': 'oklch(var(--accent-strong) / <alpha-value>)',
        'accent-text': 'oklch(var(--accent-text) / <alpha-value>)',
        'accent-soft': 'oklch(var(--accent-soft) / <alpha-value>)',
        'accent-ink': 'oklch(var(--accent-ink) / <alpha-value>)',
        risk: 'oklch(var(--risk) / <alpha-value>)',
        'risk-text': 'oklch(var(--risk-text) / <alpha-value>)',
        'risk-soft': 'oklch(var(--risk-soft) / <alpha-value>)',
        warn: 'oklch(var(--warn) / <alpha-value>)',
        'warn-text': 'oklch(var(--warn-text) / <alpha-value>)',
        'warn-soft': 'oklch(var(--warn-soft) / <alpha-value>)',
        good: 'oklch(var(--good) / <alpha-value>)',
        'good-text': 'oklch(var(--good-text) / <alpha-value>)',
        'good-soft': 'oklch(var(--good-soft) / <alpha-value>)',
        'chart-label': 'var(--chart-label)',
        'chart-grid': 'var(--chart-grid)',
        'chart-crosshair': 'var(--chart-crosshair)',
        'chart-background': 'var(--chart-background)',
        'chart-foreground': 'var(--chart-foreground)',
        'chart-foreground-muted': 'var(--chart-foreground-muted)',
        'chart-line-primary': 'var(--chart-line-primary)',
        'chart-line-secondary': 'var(--chart-line-secondary)',
        'chart-tooltip-background': 'var(--chart-tooltip-background)',
        'chart-tooltip-foreground': 'var(--chart-tooltip-foreground)',
        'chart-tooltip-muted': 'var(--chart-tooltip-muted)',
        'chart-marker-background': 'var(--chart-marker-background)',
        'chart-marker-border': 'var(--chart-marker-border)',
        'chart-marker-foreground': 'var(--chart-marker-foreground)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        lift: '0 1px 2px oklch(var(--shadow) / 0.06), 0 8px 24px -12px oklch(var(--shadow) / 0.18)',
        float: '0 2px 4px oklch(var(--shadow) / 0.06), 0 18px 48px -20px oklch(var(--shadow) / 0.28)',
      },
      maxWidth: {
        measure: '68ch',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
      },
      animation: {
        rise: 'rise 420ms cubic-bezier(0.2, 0, 0, 1) both',
      },
    },
  },
  plugins: [],
};
