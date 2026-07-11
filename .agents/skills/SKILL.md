---
name: design-system-shots
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Shots

## Mission
Deliver implementation-ready design-system guidance for Shots that can be applied consistently across documentation site interfaces.

## Brand
- Product/brand: Shots
- URL: https://shots.so/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Inter`, `font.family.stack=Inter, sans-serif`, `font.size.base=15px`, `font.weight.base=500`, `font.lineHeight.base=20px`
- Typography scale: `font.size.xs=11px`, `font.size.sm=12.5px`, `font.size.md=14px`, `font.size.lg=15px`, `font.size.xl=16px`, `font.size.2xl=17px`
- Color palette: `color.text.primary=#f0f0f0`, `color.surface.base=#000000`, `color.surface.muted=#0d0d0d`, `color.surface.raised=#1c1c1c`, `color.surface.strong=#555555`
- Spacing scale: `space.1=2px`, `space.2=3px`, `space.3=4px`, `space.4=6px`, `space.5=7px`, `space.6=8px`, `space.7=9px`, `space.8=10px`
- Radius/shadow/motion tokens: `radius.xs=2px`, `radius.sm=2.5px`, `radius.md=6px`, `radius.lg=8px`, `radius.xl=9px`, `radius.2xl=10px`, `radius.step7=11px`, `radius.step8=12px` | `shadow.1=rgba(0, 0, 0, 0.15) 0px 1px 3px 0px`, `shadow.2=rgba(0, 0, 0, 0.16) 0px 5px 15px -5px`, `shadow.3=rgba(0, 0, 0, 0.24) 0px 5px 15px -5px` | `motion.duration.instant=200ms`, `motion.duration.fast=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
