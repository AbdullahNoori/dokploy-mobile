# Codex Web Loader Standards

This document defines **mandatory rules and best practices** for implementing loading states in **Codex Web Applications (React / Next.js / SPA)**.  
It ensures **consistent UX**, **maintainable code**, and **strict alignment with the `components/ui` design system**.

This file also acts as a **system-level instruction** for AI agents when refactoring, generating, or reviewing frontend code.

---

## 0. Source of Truth & Precedence

- This document is the **single source of truth** for loaders.
- If a conflict exists between this file and other guidelines:
  **This file takes precedence.**
- Do **not** introduce new loader patterns unless explicitly defined here.

---

## 1. Loader Types & Usage Rules

### 1.1 Skeleton Loader (Primary Pattern)

**Use When:**

- The layout and structure are known.
- Data is missing but UI shape is predictable.
- Preventing layout shift is important.

**Common Use Cases:**

- Dashboards
- Lists, tables, cards
- Profile pages
- Article or content layouts

**Implementation:**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

if (isLoading) return <PageSkeleton />;
```

**Rules:**

- Skeletons must **match final layout dimensions** as closely as possible.
- Prefer page-level or section-level skeleton components over inline hacks.

**Rule of Thumb:**
Use for **medium to long fetches** (~300ms–2s+) where perceived performance matters.

---

### 1.2 Spinner / Inline Loader

**Use When:**

- The loading area is small and isolated.
- Layout is unknown, minimal, or transient.
- Triggered by direct user interaction.

**Common Use Cases:**

- Button submit states
- Filters and dropdowns
- Inline refreshes
- Small async UI elements

**Implementation:**

```tsx
import { Loader } from "@/components/ui/loader";

{isLoading && <Loader size="small" />}
```

**Rules:**

- Must never block the entire page.
- Always colocated with the UI element it represents.

**Rule of Thumb:**
Best for **micro-interactions** (<500ms expected).

---

### 1.3 Screen Loader / Full Overlay Loader

**Use When:**

- The entire page is blocked by async data.
- No meaningful UI can render without the data.
- Auth, permissions, or hydration gates exist.

**Common Use Cases:**

- Auth-protected routes
- Initial app bootstrap
- Full dashboard hydration

**Implementation:**

```tsx
import { ScreenLoader } from "@/components/ui/screen-loader";

if (isLoading) return <ScreenLoader />;
```

**Rules:**

- Must be used sparingly.
- Do not hide already-available UI unnecessarily.

**Rule of Thumb:**
Only use when **partial rendering is not possible**.

---

### 1.4 Inline Skeleton / Placeholder

**Use When:**

- Loading affects only small parts of an otherwise usable screen.
- Content is lazy-loaded or progressively enhanced.

**Common Use Cases:**

- Stats counters
- Charts
- Comments sections
- Secondary panels

**Implementation:**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

{isLoading && <Skeleton style={{ height: 24, width: 80 }} />}
```

---

## 2. Implementation Rules (Mandatory)

1. **Only use loaders from `components/ui`**  
   No raw spinners, text (`"Loading..."`), or third-party loaders.

2. **Conditional Rendering Pattern**

```tsx
if (isLoading) return <PageSkeleton />;
```

3. **Prevent Layout Shift**
   - Skeletons must mirror the final layout.
   - Avoid changing spacing, font sizes, or container dimensions after load.

4. **Prefer Progressive Rendering**
   - Render static UI immediately.
   - Load data-driven sections independently where possible.

5. **Consistency**
   - Timing, animation, and color must follow global design tokens.
   - No per-page loader styling.

---

## 3. AI Agent Instructions (Critical)

When refactoring, generating, or reviewing frontend code:

1. **Identify all async boundaries**
   - `useQuery`, `useMutation`
   - `fetch`, `async/await`
   - `useEffect` with remote data
   - Route-level data loading

2. **Select loader type strictly based on rules in Section 1**
   - Known layout → Skeleton
   - Small interaction → Spinner
   - Blocking page → Screen Loader

3. **Replace all ad-hoc loading states**
   - ❌ `"Loading..."`
   - ❌ Empty divs
   - ❌ Temporary placeholders

4. **Preserve UI fidelity**
   - Loaded UI must match skeleton layout.
   - No visual jump after load.

5. **Do not invent new patterns**
   - If unsure, reuse existing loader components.

---

## 4. UX Quality Bar

A loading state is **incorrect** if:

- The screen looks empty or frozen.
- The user can’t tell *what* is loading.
- Layout jumps after data arrives.
- A spinner blocks usable UI unnecessarily.

A loading state is **correct** if:

- The user understands what’s coming.
- The UI feels responsive even when data is slow.
- Visual hierarchy is preserved throughout loading.

---

## 5. Summary Table

| Loader Type      | Scope        | Use Case                         | UX Goal                 |
| ---------------- | ------------ | -------------------------------- | ----------------------- |
| Skeleton         | Section/Page | Known layout, data pending       | Prevent layout shift    |
| Spinner / Loader | Inline       | Buttons, filters, micro async    | Instant feedback        |
| Screen Loader    | Full Page    | Blocking fetch, auth, hydration  | Global loading clarity  |
| Inline Skeleton  | Small Areas  | Lazy-loaded or secondary content | Progressive enhancement |

---

## Commit Message Convention

```
chore: standardize web loading states using Codex UI loader rules
```