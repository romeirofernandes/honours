# DESIGN.md - GlycoStrat UI System

## 1. Visual Direction

A warm, editorial health check-up rather than a clinical workstation. The interface should feel calm, human, and easy to scan: one question at a time, generous spacing, plain-language labels, and a clear answer that updates as you go.

- **Audience:** people without a medical or data background. No variable codes, ROC-AUC, odds ratios, or model jargon in the main flow.
- **Tone:** friendly and direct. Explain the estimate, the main drivers, and what could change it. Never imply a diagnosis.
- **Surfaces:** solid warm bone canvas, white cards, thin structural borders, and restrained shadows. No decorative gradients or glow.
- **Playfulness with a ceiling:** illustrations, face icons, day meters, and soft status colors are welcome; the numbers and disclaimers stay precise.

## 2. Color & Themes

Both themes are defined as OKLCH custom properties in `frontend/src/index.css` and exposed through Tailwind tokens. Dark mode is the `.dark` class on `<html>`; the choice is stored in `localStorage` under `glycostrat-theme` and applied before first paint. The dark theme is a warm charcoal, not a green-black, and keeps the same forest/mint accent family as light mode.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas | Warm bone `0.974 0.007 95` | Warm charcoal `0.195 0.006 120` | Page background |
| Surface | White | `0.24 0.007 120` | Cards, controls |
| Sunken | `0.951 0.009 95` | `0.285 0.008 120` | Tracks, icon tiles, disclosure wells |
| Ink | `0.235 0.022 156` | `0.95 0.006 110` | Primary text |
| Soft | `0.365 0.02 156` | `0.84 0.008 120` | Secondary text |
| Muted | `0.5 0.016 150` | `0.7 0.01 130` | Hints, metadata |
| Accent | Forest `0.46 0.095 158` | Mint `0.78 0.085 160` | Primary actions, selected state |
| Accent soft | `0.949 0.03 158` | `0.305 0.032 160` | Selected card fill |
| Risk | Terracotta `0.545 0.16 32` | `0.72 0.13 35` | High / higher-rate signals |
| Warn | Amber `0.66 0.12 72` | `0.81 0.1 80` | Watch / elevated |
| Good | Green `0.52 0.1 156` | `0.78 0.09 155` | Low / protective |

Rules:

- Text pairs must reach **4.5:1**; large display numbers may use 3:1 but are kept well above it.
- Control boundaries (unselected choices, selects, theme button, choice chips) must reach **3:1** against their surface. `--line-strong` is tuned per theme; cards use the quieter `--line`.
- Status colors are semantic, not decorative. Never use green to mean "bad" or red to mean "good"; in the habit comparison the higher rate is always the risk color.
- Focus rings use the accent at 2px with a 2px offset; do not remove them.

## 3. Typography

- **Display:** Bricolage Grotesque (500–800), tight tracking, used for the hero, section titles, and large numbers.
- **Body:** Instrument Sans (400–700), used for all prose, labels, and controls.
- **Scale:** hero `38px` mobile / `52–58px` desktop; section title `21px`; result number `64px`; body `17px`; control label `15px`; hint `13.5px`; metadata `11–12px`.
- Prose is capped around `60ch`. Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.
- Numbers that change use `tabular-nums`; labels use sentence case, not all caps, except tiny metadata eyebrows.

## 4. Shape, Spacing & Layout

- **Radius:** cards `16px` (`rounded-2xl`), inner panels and choice cards `12px` (`rounded-xl`), controls `8px` (`rounded-lg`), pills `rounded-full`. This intentionally replaces the earlier 6px clinical rule to match the warmer, friendlier direction.
- **Container:** `max-w-6xl` (1152px), `px-4` on mobile and `px-6` from `sm`.
- **Header:** a sticky floating pill. The wordmark, section tabs, and theme toggle sit inside one `rounded-full` surface with a border, backdrop blur, and restrained float shadow; the tabs use pill-shaped active states rather than an underline bar.
- **One screen, no page scroll:** the app shell is a `h-dvh` flex column. The header and footer take their natural height, `main` takes the rest, and every region inside `main` owns its own scroll. The page itself never scrolls, so nothing important is ever parked below the fold.
- **Check-up layout:** four steps — *Who you are*, *Your body*, *Your daily habits*, *How you're feeling* — behind a four-tab control. The estimate sits beside the form on a wide screen and behind a bottom sheet on a narrow one, where a summary bar keeps the number on screen.
- **Density is driven by the box, not the device.** Width is handled with container queries: the section card is the query container (`.card-query`) and each field is its own (`.field-cell`), so a two-column field grid and the inline yes/no pair collapse when *their* box narrows. Height is handled with viewport media queries on a `.checkup` scope that sets `--cu-gap`, `--cu-card-pad`, `--cu-hero-size`, `--cu-stack-gap`, and `--cu-tab-pad`. A very short window drops the framing text before it drops the questions.
- **Group with space, not lines:** the gap between groups is at least twice the gap within one. Borders are used only where space cannot carry the structure.
- **Every scroll region gets a cue:** a fade at the bottom edge appears while more content is below it and disappears at the end, so clipped content never looks broken.
- **Footer:** a single row reading "© 2026 GlycoStrat. All rights reserved." on the left and "crafted by aliqyaan and romeiro" on the right, with both lowercase names as small squiggly-underline GitHub links.
- **Responsive floor:** verify at a true `320px` viewport. No horizontal page scroll; tables either fit, scroll inside their own wrapper, or become stacked lists on mobile.

## 5. Icons & Illustration

- Use **Hugeicons** free icons through `frontend/src/components/Icon.jsx`; default size `20px`, stroke `1.75`. Do not mix icon libraries.
- Icons are decorative by default (`aria-hidden="true"`). Icon-only controls must carry an `aria-label`.
- Custom SVG is reserved for the BMI silhouette. It is `aria-hidden`; the visible height/weight inputs, calculated BMI, and band chip carry the value.
- Status icons (shield, alert, heartbreak, sparkles) reinforce the tier; they never replace the text label.

## 6. Motion

All motion comes from `motion/react` and draws its curve and spring from `frontend/src/lib/motion.js`, so the interface moves with one voice. `MotionConfig reducedMotion="user"` wraps the app, so a reader who prefers reduced motion gets the same end state without the travel.

| Spring | Use |
| --- | --- |
| `SPRING_SNAP` | controls that answer a press: tab pills, check marks, chevrons, unit toggles |
| `SPRING_SOFT` | panels, silhouettes, expanding regions, the result sheet |
| `SPRING_FILL` | anything that fills: driver bars, the risk marker, the day meter |
| `SPRING_NUMBER` | numbers that count up to a new estimate |

- **Entrance:** a short fade and rise on the step panel, `260ms` with an expo-out curve. The card inside does not animate separately, so the two never read as two stacked movements.
- **Step switch:** the tab pill slides between positions with `SPRING_SNAP`; the panel cross-fades. The BMI silhouette widens and narrows with `SPRING_SOFT` as the number changes.
- **Values:** the estimate, the BMI, and the marker on the risk scale spring to their new value. Numbers are rendered from a MotionValue, so a count-up never re-renders React.
- **Press:** `150ms` scale/background feedback, gated to devices with hover where relevant.
- **Disclosure:** the body animates its own height with `SPRING_SOFT` and the chevron rotates with `SPRING_SNAP`.
- **Theme toggle:** a Skiper UI-style circular clip-path reveal from the button centre over `900ms` with `cubic-bezier(0.22, 1, 0.36, 1)` and a `blur(10px) → blur(0)` settle. The icon crossfade is `500ms`. Browsers without the View Transitions API, and anyone who prefers reduced motion, get an instant swap. Only the incoming snapshot is blurred; the outgoing page stays sharp, so untouched content does not flash or replay.
- Suppress other transitions during the theme snapshot so the reveal does not smear. Never animate layout properties.

## 7. Accessibility & Content

- Every form control has a visible label; hints are attached with `aria-describedby`; radio groups use `fieldset`/`legend`.
- The skip link targets `<main tabIndex={-1}>`; tab changes move focus to the page heading.
- All interactive elements are keyboard operable; sliders expose `aria-valuetext`; toggles expose `aria-pressed`.
- Main-flow copy is plain language. Technical details are collapsed and clearly optional; if a metric such as ROC-AUC appears there, explain it in one sentence.
- Every result carries the disclaimer: an educational estimate, not a diagnosis; only a blood test can confirm diabetes.
