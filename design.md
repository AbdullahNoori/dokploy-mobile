# Dokploy Mobile UI Design System

This document is the single source of truth for UI design in this project. All new and updated UI must follow these rules to maintain consistency with existing patterns.

## 1. Design Philosophy

- Neutral, utilitarian, developer-first. Prioritize clarity and function over decoration.
- Token-anchored. All UI must map to existing theme tokens; no ad-hoc colors.
- Mobile-first constraints. Touch targets, spacing, and readability are designed for handheld use.
- Consistency over novelty. Reuse existing components and patterns; new UI must feel native to the app.
- Simplicity in composition. Prefer a few well-defined variants over many bespoke styles.
- System typography. Use platform system fonts; reserve monospace for code/IDs/status.

## 2. Layout System

- Safe area: respect top/bottom safe areas. Do not place content under system bars unless intentionally immersive.
- Vertical rhythm: primary stack spacing `gap-4`, secondary spacing `gap-2`. Avoid arbitrary values.
- Sectioning: use simple vertical stacks; avoid deep nesting.
- Header pattern: use Expo Router `Stack.Screen` for titles and actions; header actions are icon buttons with `size="icon"`.
- Scrollable content: use `ScrollView` for short/medium content. Use `FlatList`/`FlashList` for long lists.
- Alignment: default to `items-start`. Use `items-center` for empty states or onboarding only.
- Web: not a primary target; never rely on hover to communicate meaning.

## 3. Typography

- Base text uses `Text` default variant with `text-base`.
- Heading hierarchy via `Text` variants:
  - `h1`: primary screen title (rare)
  - `h2`: section titles
  - `h3`: card/list group titles
  - `h4`: minor headings
- Muted text: use `variant="muted"` for secondary info, timestamps, helper text.
- Code / IDs: use `variant="code"` and monospace for IDs, commands, machine-like values.
- Keep body copy concise for mobile readability.

## 4. Color System

- Token-only colors from `global.css` and `lib/theme.ts`.
- Primary actions: `bg-primary` + `text-primary-foreground`.
- Secondary surfaces/actions: `bg-secondary` + `text-secondary-foreground`.
- Muted text: `text-muted-foreground`.
- Borders/inputs: `border-border`, `bg-input` where applicable.
- Destructive states: `bg-destructive` with readable foreground (`text-white` if no token exists).
- Dark mode: all components must remain legible with no hard-coded colors.

## 5. Spacing & Sizing

- Use Tailwind spacing scale only (`1,2,3,4,6,8,10,12,16`).
- Component padding:
  - Buttons: `px-4 py-2` (default), `px-3` (sm), `px-6` (lg)
  - Cards: `p-4`
  - Inputs: `px-3 py-2`
- Touch targets: minimum 44x44pt. Icon buttons use `h-10 w-10`.
- Radii: use theme radius (`rounded-md`, `rounded-lg`); avoid custom radii.
- Gaps: `gap-2` for tight groups, `gap-4` for sections, `gap-6` for screen-level separation.

## 6. Component Patterns

- Buttons:
  - Use `src/components/ui/button`.
  - Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
  - Sizes: `default`, `sm`, `lg`, `icon`.
  - Icon-only buttons use `size="icon"` and `rounded-full` only when necessary.
- Text:
  - Always use `src/components/ui/text`.
  - Use variants instead of custom size classes when possible.
- Inputs (future):
  - Height `h-10`, padding `px-3`, `border-border`, `bg-background` or `bg-input`.
  - Focus ring uses `ring` token; error uses `destructive` token.
- Cards / Panels:
  - `bg-card`, `text-card-foreground`, `rounded-lg`, `border border-border`, `p-4`.
  - Avoid shadows unless an existing pattern uses them.
- Lists:
  - Vertical stacks with `gap-2` or `divide-y border-border`.
  - List rows should be full-width tappable.
- Modals / Sheets:
  - Use portal-based patterns (`@rn-primitives/portal`).
  - Dim background `bg-black/30`.
  - Content `bg-popover`, `rounded-lg`, `p-4`.
- Loading:
  - Inline spinners or skeletons. Disable buttons during async (`opacity-50`).
- Empty states:
  - Centered layout with icon, title, muted description, and a clear CTA button.

## 7. Screen Construction Rules

- Screen = `Stack.Screen` options + a single root container.
- Compose from reusable components first; only inline UI if unique.
- Naming: screen components `SomethingScreen`, file names follow Expo Router routes.
- Header: navigable screens define `Stack.Screen` options with `title`.
- Primary action: one per screen, in header or as a prominent button.
- New layouts must match existing spacing and text hierarchy.

## 8. State & Feedback UI

- Loading:
  - Global load: full-screen spinner centered with muted label.
  - Inline load: compact spinner + muted text in place.
- Error:
  - Short message, optional details, retry action.
  - Use `text-destructive` and `Button variant="destructive"` for critical failures.
- Success:
  - Subtle inline confirmation; avoid modal confirmations unless destructive.
- Skeletons:
  - Use `bg-muted` blocks with consistent height and `rounded-md`.
  - Match skeleton shapes to final content.

## 9. Animation Guidelines

- Purposeful only: indicate state change or hierarchy, not decoration.
- Micro-interactions: 150-250ms for presses, fades, list inserts.
- Performance: prefer opacity/transform; avoid layout thrash.
- Reduced motion: respect a future system setting if added.
- Avoid large, springy or continuous animations.

## 10. Design Consistency Rules

- Do not invent new colors; use existing tokens only.
- Do not introduce new typography scales; use `Text` variants.
- Do not add shadows by default.
- Do not mix spacing scales; keep `gap-2`, `gap-4`, `p-4` dominant.
- Do not add new component variants without updating this file.
- Do not use web-only patterns; hover cannot be required.
- Do not bypass shared components (`src/components/ui`).

## 11. Rules for AI Agents

- Always read and follow `design.md` before generating UI.
- Reuse existing tokens and shared components (`Text`, `Button`, `Icon`).
- If a needed pattern is missing, update `design.md` before adding it.
- Do not introduce new UI libraries without updating `design.md`.
- Keep screens consistent with current layout and spacing conventions.

## References

- Color tokens: `global.css`, `lib/theme.ts`
- Components: `src/components/ui/button.tsx`, `src/components/ui/text.tsx`, `src/components/ui/icon.tsx`

## Screen Architecture and File Structure

- Screen code location: all screen implementations must live inside `src/screens/<screen-name>/index.tsx`.
- Examples:
  - `src/screens/home/index.tsx`
  - `src/screens/search/index.tsx`
  - `src/screens/profile/index.tsx`
- The `index.tsx` file represents the main screen component.
- `/app` directory usage (routing only): `/app` must only be used for routing.
- No screen UI implementation should exist inside `/app`.
- Files inside `/app` should only import and render the corresponding screen component.
- Example:

```tsx
import Homepage from '@/src/screens/home';

export default function Page() {
  return <Homepage />;
}
```

- This separation ensures clear routing boundaries, maintainable architecture, and predictable project structure.
- Screen component structure: each screen should follow a consistent structure.
- Typical responsibilities of `index.tsx`:
  - orchestrating the page layout
  - rendering sections
  - handling routing logic
  - connecting to stores if needed
- The screen file should not contain large UI sections directly.
- Component organization: large UI blocks must be extracted into components.
- Each screen should contain a `components` directory.
- Example structure:

```
src/screens/home/
│
├── index.tsx
│
└── components/
    ├── featured-jobs-section.tsx
    ├── job-listings-section.tsx
    ├── features-section.tsx
    ├── companies-section.tsx
    ├── testimonials-section.tsx
    └── footer-section.tsx
```

- This improves readability, modularity, maintainability, and AI-assisted development.
- Import order convention: imports should follow a consistent order.
  - React / core libraries
  - Third-party libraries
  - Internal UI components
  - Hooks
  - Stores
  - Local screen components
- Example:

```tsx
import { Suspense } from 'react';

import { ArrowDown01Icon } from 'hugeicons-react';

import { Button } from '@/src/components/ui/button';

import { useAuthStore } from '@/stores/useAuthStore';
```

- Clean code requirements: the `index.tsx` file should remain clean and minimal.
- It should primarily:
  - compose screen sections
  - manage layout
  - handle high-level logic
- Avoid placing:
  - large JSX blocks
  - complex UI logic
  - reusable UI patterns
- These should be moved into dedicated component files.
- Goal of this architecture: ensure predictable file organization, scalable screen architecture, clear separation of concerns, maintainable large screens, AI-friendly code generation, and consistent developer experience.
