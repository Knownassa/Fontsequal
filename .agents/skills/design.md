# Fontsequal Design System — Diagram-Inspired Futuristic Dark UI

## 1. Design Goal
Create a premium, futuristic, AI-powered product interface inspired by the uploaded Diagram landing page: deep-space background, soft glass cards, orbital hero visuals, subtle neon accents, and calm high-end typography.

This style should feel:
- premium, not playful
- futuristic, not cyberpunk
- magical, not childish
- minimal, not empty
- motion-rich, but still usable

Primary use case: Fontsequal marketing website + desktop app onboarding/dashboard.

---

## 2. Recommended UI Stack

### Marketing Website
Use this stack when building the public website, landing pages, waitlist, pricing, docs, and product showcase.

```txt
Next.js / React
Tailwind CSS
shadcn/ui + Radix UI
Framer Motion / Motion
React Three Fiber or Spline for hero objects
Lenis for smooth scrolling
GSAP only for complex scroll-sequence animation
Lucide React for base icons
Custom SVG icons for brand/product features
```

### Desktop App UI
Use this inside the actual Fontsequal app.

```txt
React + Vite
Tailwind CSS
shadcn/ui + Radix UI
Zustand
Framer Motion / Motion
Lucide React
CSS/SVG animations instead of heavy 3D where possible
```

### Avoid Depending on a Single Template Library
This reference style is not a simple drop-in UI kit. Rebuild it as a custom design system using Tailwind, shadcn/ui primitives, and custom visual components.

---

## 3. Visual Direction

### Main Style Keywords
```txt
cosmic dark interface
premium AI SaaS
soft glassmorphism
orbital layout
subtle neon glow
matte black panels
high contrast typography
low-noise star field
rounded modular product cards
floating product objects
```

### Mood
- Deep black background with subtle stars/noise.
- Cards sit on a slightly lighter black surface.
- Important objects glow softly, but the whole page should not be overly bright.
- Use color only as accents: purple, blue, orange, green, and white.
- Large white headings, small muted descriptions.
- Product screenshots/components should feel like physical objects floating in space.

---

## 4. Color Tokens

```css
:root {
  --bg: #07080b;
  --bg-soft: #0b0c10;
  --surface: #15151b;
  --surface-elevated: #1b1b23;
  --surface-card: #191920;

  --border-soft: rgba(255, 255, 255, 0.07);
  --border-medium: rgba(255, 255, 255, 0.12);

  --text-primary: #f5f5f7;
  --text-secondary: #b7b8c0;
  --text-muted: #777985;

  --accent-purple: #7c3cff;
  --accent-violet: #9b5cff;
  --accent-blue: #2e8cff;
  --accent-cyan: #38d7ff;
  --accent-orange: #ff8a1f;
  --accent-green: #4ade80;
  --accent-red: #ff4d4d;

  --glow-purple: rgba(124, 60, 255, 0.45);
  --glow-blue: rgba(46, 140, 255, 0.35);
  --glow-orange: rgba(255, 138, 31, 0.35);
}
```

### Usage Ratio
```txt
80% deep black / charcoal
10% white text
6% muted gray text and borders
4% neon accent colors
```

---

## 5. Typography

### Recommended Fonts
Use one of these combinations:

```txt
Option A — Clean SaaS
Heading: Inter Tight / Geist Sans / Satoshi
Body: Inter / Geist Sans

Option B — More Premium
Heading: Neue Montreal / Satoshi / Manrope
Body: Inter / Geist Sans

Option C — Open Source Safe
Heading: Geist Sans
Body: Geist Sans
Mono/UI labels: Geist Mono
```

### Type Scale
```css
--text-xs: 11px;
--text-sm: 13px;
--text-base: 15px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
--text-hero: clamp(42px, 7vw, 84px);
```

### Heading Rules
- Use tight tracking: `letter-spacing: -0.04em` for large headings.
- Keep line-height compact: `0.95` to `1.08`.
- Use strong weight: `700–800`.
- Avoid colorful headings. Keep headings white; use color in icons and objects.

---

## 6. Layout System

### Page Width
```css
--container: 1120px;
--container-narrow: 760px;
--section-gap: 180px;
```

### Structure
```txt
Header
Hero / orbital product universe
Product section 1
Feature card grid
Product section 2
Feature card grid
Product section 3
Feature card grid
Final CTA
Footer
```

### Section Rules
- Each major product section should have a centered icon/logo, title, subtitle, and CTA.
- Use generous vertical spacing.
- Keep content column narrow and centered.
- Use feature grids below each product intro.
- Alternate grid layouts so sections do not look copied.

---

## 7. Background System

### Base Background
```css
body {
  background:
    radial-gradient(circle at 50% 0%, rgba(124, 60, 255, 0.12), transparent 32%),
    radial-gradient(circle at 80% 20%, rgba(46, 140, 255, 0.08), transparent 26%),
    #07080b;
  color: var(--text-primary);
}
```

### Star Field Layer
Use a pseudo-element or fixed background component.

```css
.cosmic-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.45) 1px, transparent 1px),
    radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px);
  background-size: 42px 42px, 88px 88px;
  background-position: 0 0, 20px 30px;
  opacity: 0.22;
  mask-image: linear-gradient(to bottom, black 0%, black 80%, transparent 100%);
}
```

### Noise Layer
Use a very subtle PNG/SVG noise overlay, opacity `0.04–0.08`. Do not make it grainy.

---

## 8. Card Design

### Base Card
```css
.feature-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 18px 60px rgba(0,0,0,0.45);
  overflow: hidden;
}
```

### Card Sizes
```txt
Small: 260 × 220
Medium: 360 × 260
Wide: 540 × 260
Tall: 260 × 360
```

### Card Content Rules
- Title: 13–15px, semibold, white.
- Body: 11–13px, muted gray.
- Visual area should dominate the card.
- Keep text short. No long paragraphs.
- Most cards should have one strong visual metaphor.

---

## 9. Buttons

### Primary Dark Pill
```css
.btn-primary {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255,255,255,0.92);
  color: #08090c;
  font-size: 13px;
  font-weight: 600;
}
```

### Secondary Glass Pill
```css
.btn-secondary {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.10);
  color: #f5f5f7;
  font-size: 12px;
}
```

### Button Rules
- Use pill buttons.
- Keep buttons small and precise.
- Add tiny icon inside CTA when useful.
- Avoid large colorful buttons except final CTA.

---

## 10. Hero Section

### Composition
```txt
Top nav
Centered headline
Small subtitle
Small CTA pill
Large orbital visual
Floating product/feature planets
Soft glow under center object
```

### Hero Object Ideas for Fontsequal
- A central circular Fontsequal mark.
- Orbital font files: TTF, OTF, WOFF2, Variable Font, Foundry License, Font Family.
- Small planets representing features:
  - Organize
  - Preview
  - Activate
  - Sync
  - License
  - Compare

### Orbital Rings
Use SVG circles or absolutely positioned divs.

```css
.orbit-ring {
  position: absolute;
  border: 1px solid rgba(255,255,255,0.075);
  border-radius: 999px;
  opacity: 0.7;
}
```

### Motion
- Slow rotation: 40–80 seconds per full rotation.
- Floating objects: small vertical movement, 4–8px.
- Do not animate everything at once.

---

## 11. Section Visual Language for Fontsequal

### Section 1 — Font Library
Title: `Your entire font universe.`
Visuals:
- Font cards floating in a dark glass grid.
- Preview text samples.
- Font metadata chips.
- Active/inactive toggles.

### Section 2 — Smart Activation
Title: `Activate only what you need.`
Visuals:
- One-click enable/disable panel.
- App-specific font activation.
- System font status indicator.

### Section 3 — Font Intelligence
Title: `Know every font before you use it.`
Visuals:
- License summary cards.
- Glyph coverage view.
- Duplicate detection.
- Similar font comparison.

### Section 4 — Creative Workflow
Title: `Built for designers.`
Visuals:
- Figma/Illustrator/Photoshop-style app chips.
- Drag-and-drop collections.
- Project folders.
- Font pairing suggestions.

---

## 12. Component Checklist

Build these reusable components first:

```txt
CosmicBackground
StarField
NoiseOverlay
GlowOrb
OrbitSystem
FloatingPlanet
GlassCard
FeatureGrid
SectionIntro
ProductBadge
PillButton
MiniToolbar
FontPreviewCard
FontMetadataChip
FontActivationToggle
LicenseStatusBadge
FooterUniverse
```

---

## 13. Tailwind Theme Extension

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#07080b',
          soft: '#0b0c10',
          card: '#191920',
          elevated: '#1b1b23',
        },
        neon: {
          purple: '#7c3cff',
          violet: '#9b5cff',
          blue: '#2e8cff',
          cyan: '#38d7ff',
          orange: '#ff8a1f',
          green: '#4ade80',
        },
      },
      borderRadius: {
        card: '18px',
        panel: '24px',
      },
      boxShadow: {
        card: 'inset 0 1px 0 rgba(255,255,255,.05), 0 18px 60px rgba(0,0,0,.45)',
        glowPurple: '0 0 80px rgba(124,60,255,.45)',
        glowBlue: '0 0 80px rgba(46,140,255,.35)',
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
    },
  },
};
```

---

## 14. Example Component Classes

```tsx
<section className="relative mx-auto max-w-[1120px] px-6 py-32">
  <div className="mx-auto max-w-[680px] text-center">
    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-[20px] border border-white/10 bg-white/[0.04] shadow-glowPurple">
      <FontsequalMark />
    </div>

    <h2 className="text-5xl font-bold tracking-[-0.05em] text-white md:text-7xl">
      Your entire font universe.
    </h2>

    <p className="mx-auto mt-4 max-w-[420px] text-sm leading-6 text-white/55">
      Organize, preview, activate, and compare every font in one calm designer-focused workspace.
    </p>

    <div className="mt-6 flex justify-center gap-3">
      <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
        Explore Fontsequal
      </button>
      <button className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white">
        View workflow
      </button>
    </div>
  </div>

  <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
    <div className="feature-card md:col-span-2">...</div>
    <div className="feature-card md:col-span-4">...</div>
    <div className="feature-card md:col-span-3">...</div>
    <div className="feature-card md:col-span-3">...</div>
  </div>
</section>
```

---

## 15. Motion Guidelines

### Use Motion For
- Hero object floating.
- Scroll reveal of sections.
- Card hover elevation.
- Orbit rings/planets.
- Button micro-interactions.

### Avoid Motion For
- Core navigation.
- Text readability.
- Primary dashboard controls.
- Anything that causes layout shift.

### Animation Values
```txt
Page fade: 0.4s
Card reveal: 0.5–0.7s
Hover lift: 2–4px
Hero float: 5–8s loop
Orbit rotation: 40–80s loop
Easing: cubic-bezier(0.22, 1, 0.36, 1)
```

---

## 16. Accessibility Rules

- Text contrast must stay readable on dark cards.
- Do not use only color to show state; use icon + label.
- Pause or reduce animations when `prefers-reduced-motion` is enabled.
- Keep focus rings visible.
- Do not make the app UI as decorative as the marketing page. The app should be calmer.

---

## 17. Do / Do Not

### Do
- Use deep black backgrounds.
- Use subtle star/noise textures.
- Use short, sharp copy.
- Use rounded cards and thin borders.
- Use one strong accent color per section.
- Build custom SVG product visuals.
- Make the hero feel like a small universe.

### Do Not
- Do not use generic dashboard templates.
- Do not overuse blur.
- Do not make everything purple.
- Do not use large gradients behind every card.
- Do not make cards too bright.
- Do not copy Diagram assets directly.
- Do not use long paragraphs inside feature cards.

---

## 18. First Implementation Milestone

Build the landing page in this order:

```txt
1. Global Tailwind tokens
2. Cosmic background + star field
3. Header/navigation
4. Hero typography
5. Orbital hero system
6. Glass card component
7. First feature grid
8. Section intro component
9. Remaining sections
10. Footer
11. Motion pass
12. Responsive polish
```

---

## 19. Prompt for AI Builder / Cursor

```txt
Create a premium futuristic dark landing page for Fontsequal, a professional font manager for designers. Use React, Tailwind CSS, shadcn/ui style primitives, and Framer Motion. The visual style should be inspired by a deep-space AI SaaS interface: black cosmic background, subtle star/noise texture, centered hero typography, orbital SVG rings, floating feature planets, soft neon glow, and modular glass cards.

Do not use a generic SaaS template. Build a custom visual system with reusable components: CosmicBackground, OrbitSystem, FloatingPlanet, GlassCard, FeatureGrid, SectionIntro, FontPreviewCard, FontActivationToggle, and LicenseStatusBadge.

Use deep black and charcoal surfaces, thin white borders with low opacity, white headings, muted gray body text, and small accent colors such as purple, blue, orange, green, and cyan. Cards should be rounded, premium, low-contrast, and slightly glossy. Use motion carefully: slow floating hero objects, scroll reveal cards, and subtle hover lifts.

Content sections:
1. Hero: “Design your font universe.”
2. Font Library: organize all fonts visually.
3. Smart Activation: activate only needed fonts.
4. Font Intelligence: inspect license, glyphs, duplicates, and similar fonts.
5. Creative Workflow: project collections and app-specific font sets.
6. Final CTA.

Make the page responsive, accessible, and production-ready. Avoid copying any external brand assets directly.
```
