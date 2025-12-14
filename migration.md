**Expo App Migration Plan: UniStyles → UniWind**

### Step 1: Audit UniStyles color + font usage only
- Goal: List every color token and font size actually used so only those are migrated.
- What to change: From `src/styles/unistyles.ts`, capture `tailwindColors.light/dark` keys and `baseTheme.families`; from `src/styles/font.ts`, capture `fontSizes`. Note where components pull colors or font sizes via `StyleSheet` or `useUnistyles`.
- Files affected: `src/styles/unistyles.ts`, `src/styles/font.ts`, any component importing these tokens.
- Why this step is necessary: Keeps migration scoped to colors and typography and ensures no used token is dropped.

### Step 2: Ensure Uniwind is active project-wide
- Goal: Make sure Uniwind CSS is loaded everywhere before replacing UniStyles.
- What to change: Confirm `metro.config.js` points `cssEntryFile` to `./src/global.css` and (if screens live outside `src`) add `@source '../app'` to `src/global.css`. Import `../src/global.css` in `app/_layout.tsx` (and `src/entry.tsx` if used) so Uniwind classes and theme variants are available.
- Files affected: `metro.config.js`, `src/global.css`, `app/_layout.tsx`, `src/entry.tsx`.
- Why this step is necessary: Prevents missing class compilation or theme variants during the swap.

### Step 3: Define typography in @theme
- Goal: Recreate UniStyles font sizes and families as Uniwind utilities.
- What to change: In `src/global.css`, add an `@theme { ... }` block defining `--text-xs` … `--text-xl6` using values from `fontSizes`, and font families (e.g., `--font-sans: 'Inter'`, `--font-mono: 'SpaceMono'`, `--font-vazir: 'Vazir'` if needed). Optionally adjust `polyfills.rem` in `metro.config.js` to align with UniStyles size scale.
- Files affected: `src/global.css`, `metro.config.js`.
- Why this step is necessary: Makes `text-*` and `font-*` utilities match existing typography without UniStyles.

### Step 4: Define light/dark color variables
- Goal: Mirror UniStyles palettes as Uniwind theme variables.
- What to change: Under `@layer theme { :root { ... } }` in `src/global.css`, add `@variant light { ... }` and `@variant dark { ... }` with semantic variables (e.g., `--color-background`, `--color-foreground`, `--color-card`, `--color-border`, `--color-primary`, `--color-muted`, `--color-overlay`) populated from `tailwindColors`. Use these via utilities like `bg-background`, `text-foreground`, `border-border`, `bg-primary`.
- Files affected: `src/global.css`.
- Why this step is necessary: Provides theme-aware colors so components can swap palettes via `dark:` without UniStyles.

### Step 5: Swap component styling to Uniwind (colors + fonts only)
- Goal: Move components off UniStyles for color and font sizing.
- What to change: In shared UI primitives and screens, replace UniStyles `StyleSheet` color/font usage with `className` strings using the new utilities (e.g., `text-base`, `font-sans`, `text-foreground`, `bg-card`). For third-party components lacking `className`, use `withUniwind` or `useResolveClassNames` only for color/font props. Avoid changing spacing or layout per current scope.
- Files affected: Components that set colors or font sizes (`src/components/ui/**/*.tsx`, screens in `app/**`).
- Why this step is necessary: Removes UniStyles dependencies while keeping visuals identical for colors/typography.

### Step 6: Switch theme control to Uniwind
- Goal: Make theme toggles drive Uniwind palettes.
- What to change: Replace `useUnistyles`/`UnistylesRuntime` theme reads with `useUniwind` where only theme name is needed; call `Uniwind.setTheme('light' | 'dark' | 'system')` in toggles. Remove UniStyles-specific theme syncing once components use Uniwind classes.
- Files affected: Theme toggles in layouts, `src/components/useColorScheme.ts`, any theme-aware helpers.
- Why this step is necessary: Ensures dark/light mode switches update the new variables, not UniStyles.

### Step 7: Validate and remove UniStyles
- Goal: Finish cutover and delete UniStyles artifacts.
- What to change: Run `npx expo start --clear`, verify light/dark palettes and font sizes match previous visuals. After confirmation, remove UniStyles imports/usages, delete `src/styles/unistyles.ts` and related files (`font.ts` only if no longer referenced elsewhere), and uninstall UniStyles dependencies/config. Keep `src/global.css` and Uniwind typings as the single source of truth.
- Files affected: UniStyles files, `app/_layout.tsx`, `src/entry.tsx`, package metadata.
- Why this step is necessary: Cleans the codebase so all colors and typography come solely from Uniwind.
