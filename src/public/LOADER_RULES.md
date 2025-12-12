# Codex React Native Loader Standards

This document defines all rules and guidelines for using loaders in Codex React Native screens, ensuring consistent UX, maintainable code, and proper integration with the `components/ui` library. These rules also serve as instructions for AI agents (e.g., ChatGPT) when refactoring or formatting screens.

---

## 1. Loader Types and Usage Rules

### 1.1 Skeleton Loader

**Use When:**

- The structure of the screen/component is known, but the data has not yet loaded.
- Prevents layout shifts and improves perceived performance.

**Examples:**

- Dashboard cards, lists, tables
- User profile screen
- Article or content cards

**Implementation:**

```jsx
import { Skeleton } from "@/components/ui/skeleton";

if (isLoading) return <PageSkeleton />;
```

**Rule of Thumb:**
Use for medium-to-long fetches (~300ms–2s) where a visual placeholder is needed.

### 1.2 Spinner / Inline Loader

**Use When:**

- The loading area is small or isolated.
- The layout is unknown or minimal.
- For button clicks, dropdowns, filters, or small async content.

**Examples:**

- Save/submit button loading state
- Async dropdown options
- Partial component refresh

**Implementation:**

```jsx
import { Loader } from "@/components/ui/loader";

{
  isLoading && <Loader size="small" />;
}
```

**Rule of Thumb:**
Use for micro-interactions or small, inline async content (<500ms preferred).

### 1.3 Screen Loader / Full Overlay

**Use When:**

- The entire screen depends on asynchronous data.
- Navigation or async state requires a blocking loader.

**Examples:**

- Full dashboard screens
- Auth-protected screens
- Data hydration delays

**Implementation:**

```jsx
import { ScreenLoader } from "@/components/ui/screen-loader";

if (isLoading) return <ScreenLoader />;
```

**Rule of Thumb:**
Use when nothing meaningful can render until data arrives.

### 1.4 Inline Placeholder

**Use When:**

- Small incremental UI chunks are loading.
- Lazy-loaded sections like charts, comments, or stats.

**Implementation:**

```jsx
import { Skeleton } from "@/components/ui/skeleton";

{
  isLoading && <Skeleton style={{ height: 24, width: 80 }} />;
}
```

**Rule of Thumb:**
Keep minimal, just enough to indicate that content is coming.

---

## 2. Implementation Guidelines

1. Always use components from `components/ui` — no custom or ad-hoc loaders outside the library.
2. Conditional rendering:

```jsx
if (isLoading) return <PageSkeleton />;
```

3. Prevent layout shifts: Ensure skeletons mirror the final layout closely.
4. For lazy-loaded components, wrap with fallback loaders if using suspense-like mechanisms.
5. Consistent styling: All loaders should follow project-wide timing, animation, and color rules.

---

## 3. AI Agent Instructions (ChatGPT / Codex)

When refactoring or formatting screens:

1. Detect all data-fetching points (`useQuery`, `fetch`, `useEffect` with state, etc.).
2. Determine the appropriate loader based on rules above.
3. Replace any ad-hoc "Loading..." or temporary placeholders with `components/ui` loaders.
4. Maintain layout and styling fidelity after load.
5. Ensure all screens and components are standardized with correct loader types.

---

## 4. Summary Table

| Loader Type        | Scope          | When to Use                                   | UX Goal                 |
| ------------------ | -------------- | --------------------------------------------- | ----------------------- |
| Skeleton           | Section/Screen | Known layout, data pending                    | Prevent layout shift    |
| Spinner/Loader     | Inline / Small | Unknown layout, button, dropdown, micro async | Immediate feedback      |
| Screen Loader      | Full Screen    | Blocking fetch, async state delay             | Indicate global loading |
| Inline Placeholder | Small chunks   | Incremental lazy content                      | Smooth progressive load |

---

**Commit Message for Refactor:**

```
chore: standardize loaders for React Native screens using Codex UI components
```
