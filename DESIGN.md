---
name: OsteoSys
description: Hệ thống thiết bị đo mật độ xương và giải pháp B2B cho bệnh viện, phòng khám và doanh nghiệp.
colors:
  clinical-blue: "#0284c7"
  clinical-blue-dark: "#0369a1"
  selection-sky: "#bae6fd"
  surface-white: "#ffffff"
  surface-off-white: "#f8fafc"
  surface-subtle: "#f1f5f9"
  rule: "#e2e8f0"
  border: "#e2e8f0"
  border-hover: "#cbd5e1"
  text-primary: "#0f172a"
  text-secondary: "#334155"
  text-muted: "#64748b"
  text-placeholder: "#94a3b8"
  text-rule-label: "#cbd5e1"
  footer-bg: "#0f172a"
  success-icon: "#0284c7"
  error: "#ef4444"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.625rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
  data:
    fontFamily: "\"JetBrains Mono\", \"Fira Code\", ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  none: "0"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "80px"
components:
  button-primary:
    backgroundColor: "{colors.clinical-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.clinical-blue-dark}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  input-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  card-default:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "24px"
---

# Design System: OsteoSys

## Overview

**Creative North Star: "The Diagnostic Instrument"**

OsteoSys reads the way a DEXA scanner's own readout panel reads: every element earns its place because it carries information, not because it creates atmosphere. The substrate is white coated paper (`#ffffff` / `#f8fafc`) — the kind that laboratory results are printed on — and all depth and hierarchy come from hairline rules (`1px #e2e8f0`), weight differences in Inter, and the precise deployment of one clinical blue accent (`#0284c7`). There are no decorative shapes, no gradient fills, no background imagery behind text. The page is the data.

This is a **Restrained** color strategy: one accent color does all semantic work across the entire surface. Clinical blue appears on interactive elements (buttons, links, focus rings), data highlights (BMD values, T-scores, metric callouts), and structural indicators (section overlines, compliance badge icons). Its rarity is its authority — a blue element on this page means "this matters clinically." Neutral tones from the slate family hold everything else, and the footer inverts to `#0f172a` to close the document with weight.

The component philosophy is **clinical-authoritative**: buttons have unambiguous weight (solid fill, no hover blur), borders are clearly drawn (`1px solid`), and focus states are designed to be noticed — `2px solid #0284c7` with a `2px` offset. Nothing is soft or decorative. The interface should feel like it was designed to be used under fluorescent hospital lighting, by someone who needs the right answer on the first read.

**Key Characteristics:**
- White coated-paper substrate — no tinted or colored backgrounds in content regions
- One accent (`#0284c7`) carries all data emphasis and interactivity; no second accent
- Hairline rules (`1px #e2e8f0`) as the primary structural divider — borders replace shadows
- Monospace numerals (`JetBrains Mono`) for all clinical measurements; never for UI copy
- Label overlines in `text-xs font-medium uppercase tracking-widest` mark every section
- Motion: `150ms` linear transitions on color/border only; no transform animations in UI chrome

## Colors

One accent governs the entire surface. Every other color is structural or neutral.

### Primary
- **Clinical Blue** (`#0284c7`): The sole accent. Applied to CTA buttons, interactive links, focus rings, active tab indicators, data metric values (BMD, T-score, CV%), section overline decorators, checkbox/radio states, and compliance badge borders. Its scarcity on neutral surfaces gives every blue element the weight of a clinical finding.
- **Clinical Blue Dark** (`#0369a1`): Hover and pressed state for all `clinical-blue` interactive elements. Never appears at rest.
- **Sky Selection** (`#bae6fd`): Text selection highlight only. Provides a light, sky-tinted selection that stays readable on white without visual aggression.

### Neutral
- **Surface White** (`#ffffff`): All primary content panels, cards, form fields, and the page ground.
- **Surface Off-White** (`#f8fafc`): Alternating section backgrounds (MetricsStrip, SolutionsSection), table row hovers, and card hover states.
- **Surface Subtle** (`#f1f5f9`): Secondary hover states, badge backgrounds, footer-internal element backgrounds.
- **Rule / Border** (`#e2e8f0`): All hairline dividers and card/input borders at rest. The single divider token — used for `border-bottom`, `border-top`, `border-right` utilities and all `border` on containers.
- **Border Hover** (`#cbd5e1`): Input and card border on pointer hover. One step darker than rest state.
- **Text Primary** (`#0f172a`): All headings, data values, and primary body copy.
- **Text Secondary** (`#334155`): Supporting body copy, descriptions, card content.
- **Text Muted** (`#64748b`): Captions, sub-labels, annotation lines, nav links at rest.
- **Text Placeholder** (`#94a3b8`): Form field placeholder text.
- **Footer Background** (`#0f172a`): The footer inverts the page — the only surface that uses a dark ground. Text inside reads as `#64748b` (muted) with white on hover.
- **Error** (`#ef4444`): Form validation error messages and error border states only.

### Named Rules
**The One Voice Rule.** Clinical blue (`#0284c7`) appears on ≤15% of any given screen. Its rarity is the point — a blue element signals clinical relevance. Never use blue for decoration, section backgrounds, or non-interactive visual accents.

**The No-Tint Rule.** Content section backgrounds are white or `#f8fafc` only. No colored section backgrounds, no gradient washes, no hue-tinted surfaces outside the footer inversion.

## Typography

**Body / UI Font:** Inter (with `system-ui, -apple-system, sans-serif` fallback) — loaded via `next/font/google` with Vietnamese subset.
**Data / Measurement Font:** JetBrains Mono (with `Fira Code, ui-monospace, SFMono-Regular, monospace` fallback) — used exclusively for clinical measurement numerals.

**Character:** Inter provides the even, unhurried legibility of a well-set data sheet. JetBrains Mono isolates measurement data visually — when a number appears in mono, it is a clinical reading, not a label.

### Hierarchy
- **Display** (SemiBold 600, `clamp(2rem, 4vw, 2.625rem)`, line-height 1.15): Hero section headline only. Uses `text-balance` to prevent typographic orphans. One instance per page view.
- **Headline** (SemiBold 600, `1.875rem` / `30px`, line-height 1.2): Section H2 headings. Each section opens with one headline; no section has more than one.
- **Title** (SemiBold 600, `1rem` / `16px`, line-height 1.4): Device names, package names, standards item headings. The H3 level of the system.
- **Body** (Regular 400, `0.875rem` / `14px`, line-height 1.6): All descriptive copy, list items, form labels, card descriptions. Measure: 65–75ch maximum in long-form blocks.
- **Label** (Medium 500, `0.75rem` / `12px`, `tracking-widest ~0.1em`, uppercase): Section overlines, column group headings, badge text, table group headers. Always uppercase, always tracked. Never applied to sentences longer than 4 words.
- **Data** (JetBrains Mono SemiBold 600, `0.875rem`–`1.5rem` contextual, `tnum` feature on): BMD values, T-scores, CV%, scan duration, DICOM standard identifiers, phone numbers. Scaled to context: `text-2xl` in the MetricsStrip, `text-lg` in overlay cards, `text-sm` in spec tables.

### Named Rules
**The Mono-Only-for-Measurements Rule.** JetBrains Mono appears exclusively on clinical measurement data, spec values, and contact numerals. It never appears on UI copy, navigation, or headings. Misuse reads as costume; correct use reads as precision.

**The No-Kicker Rule.** No label overlines above headings. The overline (`text-xs uppercase tracking-widest text-[#0284c7]`) is a section marker placed *before* the section's headline block, at the section scope — never as an eyebrow directly above a heading element.

## Layout

The grid is a 12-column `max-w-7xl` (1280px) container with `px-4 sm:px-6 lg:px-8` horizontal padding, producing a fluid inner canvas. Two-column splits use fractional grid ratios that reflect content priority rather than equal halves: the Hero splits `58fr / 42fr` (scan exhibit dominates), the Clinical and Contact sections split `1fr / 2fr` and `1fr / 1.8fr` respectively (contextual anchor left, content right).

Vertical rhythm is generous between sections (`py-20` / 80px) and tight within section-internal groups (`gap-3`–`gap-5`). The spacing principle: more space above a heading than below it. Section backgrounds alternate between `white` and `slate-50` to create implicit boundaries without visible rules.

The fixed navigation bar (height `64px`) is offset via `pt-16` on the first section. Sticky positioning is used for the left-column context panels inside Clinical and Contact sections on desktop (`lg:sticky lg:top-24`), creating a reading anchor while the right column scrolls.

**Responsive breakpoints:** `sm` (640px), `md` (768px), `lg` (1024px). The primary shift: 1-column on mobile → 2-column on `lg`. The hero shifts column order (`order-2 lg:order-1`) so the headline reads first on mobile. The Spec Drawer is full-width on all viewports (`max-w-lg ml-auto`).

## Elevation & Depth

This system is **border-first, not shadow-first**. Depth is conveyed through boundary, not lift. Cards, containers, and form panels sit on the white ground defined by a `1px solid #e2e8f0` border — no box-shadow at rest. The appearance of depth comes from the color contrast between `surface-white` and `surface-off-white` alternating backgrounds, not from Z-axis shadow casting.

The one ambient shadow in the system is the nav bar: `bg-white/95 backdrop-blur-sm` with a hairline bottom border (`rule-b`). This is a functional separator (the page scrolls beneath it), not decorative depth.

### Shadow Vocabulary
- **Nav ambient** (`backdrop-filter: blur(4px); background: rgba(255,255,255,0.95); border-bottom: 1px solid #e2e8f0`): Fixed navigation only. Signals that content passes beneath — not that the nav is elevated above it.
- **Spec Drawer** (`box-shadow: -8px 0 24px rgba(0,0,0,0.08)`): The right-edge drawer when open. The only traditional shadow in the system; justified because the drawer overlays full-page content.

### Named Rules
**The No-Card-Shadow Rule.** Cards and containers never receive `box-shadow` at rest or on hover. Hover state on cards is a background color shift (`bg-white → bg-slate-50`), never a shadow lift. Shadows carry the wrong signal in a clinical instrument — they suggest decoration, not precision.

## Shapes

Corners are **small and intentional** — the form language of a calibrated instrument, not a consumer app. The base radius is `4px` (`rounded` / `rounded-sm`), applied uniformly to buttons, cards, input fields, badges, and modal drawers. No element uses a radius above `6px` (`rounded-md`) except pill badges (compliance tags: `rounded-full`).

The dominant form vocabulary:
- **Rectangular containers** with `1px solid #e2e8f0` borders — cards, data tables, spec panels.
- **4px radius** on interactive controls — all buttons, all inputs, all selects.
- **2px radius** on micro-elements — scrollbar thumb, focus ring, small badge chips.
- **`rounded-full`** only on process-step numerals (circular indicators) and the success confirmation icon background.
- **No clipping, no mask shapes, no geometric cutouts.** Images sit in their natural frame.

## Components

### Buttons
Clinical-authoritative: solid fill, unambiguous affordance, minimal transition.
- **Shape:** 4px radius (`rounded`). Padding `py-2.5 px-4` (standard) / `py-3 px-5` (hero CTA).
- **Primary:** Background `#0284c7`, text white, `shadow-sm`. Hover: background `#0369a1`, `duration-150`.
- **Focus:** `outline: 2px solid #0284c7; outline-offset: 2px` (inherited from global `:focus-visible`).
- **Ghost / Secondary:** `border border-slate-200`, text `#334155`, transparent background. Hover: `border-slate-300 bg-slate-50`.
- **Disabled:** `opacity-70`, cursor not allowed. No color change.
- **Loading:** Inline `<Loader2>` spinner (15px) with `animate-spin`, label changes to "Đang gửi...". No button size change.
- **Icon:** Right-side `<ChevronRight>` (14–15px) on all CTAs. Left-side icon on Download variant.

### Cards / Containers
- **Corner Style:** 4px radius.
- **Background:** `#ffffff` at rest, `#f8fafc` on hover (background shift, no transform).
- **Shadow Strategy:** None at rest. The Spec Drawer is the only shadow-bearing surface.
- **Border:** `1px solid #e2e8f0` on all cards. Highlighted card (recommended package): `border-[#0284c7]` replaces the neutral border.
- **Internal Padding:** `p-6` (24px) standard. `p-6 sm:p-8` for the Contact form panel.
- **Dividers:** `border-bottom: 1px solid #e2e8f0` between rows inside data tables and spec panels; `divide-y divide-slate-100` between card siblings in the Equipment grid.

### Inputs / Fields
- **Style:** `1px solid #e2e8f0` border, `#ffffff` background, `4px` radius. Padding `py-2.5 px-3`.
- **Hover:** Border shifts to `#cbd5e1`.
- **Focus:** Border `#0284c7` + `ring-2 ring-[#0284c7]/10` (2px ring at 10% opacity).
- **Error:** Border `#ef4444` + `ring-2 ring-red-100`. Error message below field in `text-xs text-red-500`.
- **Select / Textarea:** Same treatment as text input. Textarea has `resize-none`.
- **Placeholder:** `#94a3b8`.

### Navigation
- **Style:** Fixed top bar, `height: 64px`, `bg-white/95 backdrop-blur-sm`, `border-bottom: 1px solid #e2e8f0`.
- **Logo:** `8×8` clinical-blue square, `text-white font-bold text-sm` initials "OS" + Inter SemiBold wordmark.
- **Nav links (desktop):** `text-sm text-slate-600`, hover `text-[#0284c7]`, `150ms` transition. No underline, no indicator bar.
- **Active/Scroll state:** Not implemented — scroll-driven active indicator is a future addition.
- **Mobile:** Hamburger `<Menu>` icon, full-width dropdown below the bar with `rule-b` border between links.
- **CTA button:** Primary button style (`bg-[#0284c7]`) with right-chevron.

### Spec Drawer (Signature Component)
The primary interactive pattern — a right-edge slide-in panel triggered by "Xem thông số kỹ thuật" on any device card.
- **Size:** `max-w-lg` (512px), full viewport height, `overflow-y-auto`.
- **Backdrop:** `bg-slate-900/40` overlay, click-to-dismiss.
- **Header:** Sticky within the drawer, `rule-b`, device category in brand color, name + tagline.
- **Spec rows:** `border border-slate-200 rounded` container, `rule-b` between rows, label left (`text-slate-600`), value right (`font-mono-data tabular-nums font-semibold text-slate-900`). Hover: `bg-slate-50`.
- **Footer:** Sticky bottom, "Yêu cầu báo giá" primary CTA + "Đóng" ghost button.

### Metric Strip Row
Used in the MetricsStrip and in data overlay cards.
- **Value:** `font-mono-data tabular-nums`, color `#0284c7`, size contextual (see Typography › Data).
- **Unit:** `text-slate-500 text-sm` inline after the value.
- **Label:** `text-sm font-medium text-slate-800`.
- **Note:** `text-xs text-slate-400`.
- **Dividers:** `border-right: 1px solid #e2e8f0` between columns; `border-bottom: 1px solid #f1f5f9` between rows.

## Do's and Don'ts

### Do:
- **Do** use `#0284c7` exclusively for data values, interactive elements, and section markers — nothing else. Its scarcity is its authority.
- **Do** use `1px solid #e2e8f0` (`--rule`) as the only divider token. All borders, all hairline rules, all table separators use this single value.
- **Do** set clinical measurement values (BMD, T-score, CV%, scan speed, DICOM identifiers) in `font-mono-data` with `tabular-nums` enabled.
- **Do** use `text-xs font-medium uppercase tracking-widest text-[#0284c7]` for section overlines — always before the section headline block, never directly above a heading element.
- **Do** keep section backgrounds to `#ffffff` and `#f8fafc` only. The footer (`#0f172a`) is the one exception and closes the document.
- **Do** write Vietnamese copy in sentence case for headings and body. Overlines and badge labels use uppercase because they are labels, not sentences.
- **Do** size buttons consistently: `py-2.5 px-4` for standard, `py-3 px-5` for hero CTAs. Include a right `<ChevronRight>` on all forward-action buttons.

### Don't:
- **Don't** add a second accent color. Teal (`#0f766e`) exists in the codebase as a device-category tag color; it is not a system accent and must not appear on buttons, links, borders, or data values.
- **Don't** use `box-shadow` on cards or UI panels at rest or on hover. Shadow belongs only to the Spec Drawer and the nav backdrop.
- **Don't** use gradient fills, gradient text, or animated gradient borders anywhere in the system.
- **Don't** use `border-left` or `border-right` thicker than `1px` as a visual accent on cards or callouts.
- **Don't** use numbered section markers (`01 / 02 / 03`) — the section overline labels provide sufficient hierarchy without imposing a sequence the user didn't ask for.
- **Don't** use the monospace font (`JetBrains Mono`) for UI labels, navigation, or headings — it signals "measurement data", and misuse undermines the system's precision signal.
- **Don't** place placeholder text inside specification tables or clinical data panels. If a value is not confirmed, omit the row rather than filling it with "TBD" or "—".
