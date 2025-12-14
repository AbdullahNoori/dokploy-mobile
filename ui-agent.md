# dokploy-mobile UI Agent

Authoritative rules for generating, structuring, and styling every UI element in **dokploy-mobile** (Expo + React Native + Expo Router + Unistyles + TypeScript). The UI Agent must follow this spec precisely.

## Repository Layout

```text
dokploy-mobile/
├── app.json
├── babel.config.js
├── eas.json
├── expo-env.d.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── assets/
│   ├── fonts/
│   └── images/
├── src/
│   ├── api/
│   ├── app/
│   │   ├── (tabs)/
│   │   └── index.tsx
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── input.tsx
│   ├── constants/
│   ├── hooks/
│   ├── inspirations/
│   │   ├── auth-store/
│   │   ├── nav-theem/
│   │   └── screen-blueprint/
│   │       └── index.md
│   ├── lib/
│   ├── public/
│   │   └── react-native-mmkv/
│   │       └── index.md
│   ├── store/
│   └── styles/
├── android/
├── ios/
└── .vscode/
```

## PROJECT CONTEXT (DOKPLOY MOBILE)

## Overview

**Dokploy Mobile** is:

- A mobile management interface for the Dokploy platform.
- A streamlined, on-the-go DevOps experience with clean, native mobile UX.
- Built with **Expo SDK 54**, **React Native**, **Expo Router**, **Zustand**, **SWR**, **Axios**, **Zod**, and **Unistyles**.

It integrates directly with the Dokploy API to manage:

- Deployments
- Applications
- Projects
- Servers
- Stacks
- Containers
- Logs
- Builds
- Registry items
- Personal Access Tokens (PAT)
- Server metrics / health
- Activity history

---

## Core Domain Entities

The app is structured around Dokploy’s primary domain entities and workflows:

- Deployment
- Environment
- Server
- Project
- Container
- Stack
- Registry
- Build
- PAT Token
- Log Stream
- User Account

Each entity must be represented accurately and natively, consistent with how Dokploy’s web platform conceptualizes infrastructure.

---

## Design Expectations

Everything designed should feel native to the Dokploy ecosystem and its operational workflow:

- Infrastructure management
- CI/CD pipelines
- Logs & build status
- Container insights
- Deployment previews
- Project-level settings
- Server health & metrics
- Activity history
- Registry images
- Secrets & environment variables
- Background tasks
- Real-time status updates
- Alerts & system warnings
- User access & token management

---

## Mobile Experience Principles

The mobile app must feel like holding the Dokploy control panel in your hand—**reimagined for mobile UX**:

- Minimalistic
- Fast
- Touch-friendly
- Clear system hierarchy
- Practical for real DevOps workflows
- Offline-aware during network drops
- Accessible for engineers under pressure

## Styling System (must-read)

- **Master reference:** `src/public/unistyles-full.md`. All theming, breakpoints, responsive patterns, and API usage must align with this document.
- **Tokens source:** `src/styles/unistyles.ts`. Allowed tokens:
  - `theme.colors` (background, surface, text, primary, secondary, muted, accent, success, warning, danger, border, input, overlay, ring, chart*, sidebar*).
  - `theme.size["<number>"]` for all spacing, padding, margins, gaps, and dimensions. Never hardcode raw numbers.
  - `theme.radius.*` (none, xs, sm, md, lg, xl, xl2, xl3, xl4, xl5, xl6, xl7, xl8, full).
  - `theme.font.*` for font sizes and weights; `theme.families.*` for font families.
  - `theme.shadows.*` for elevation/glow; use matching light/dark shadow presets.
  - If a token does not exist (opacity, animation spring values), use minimal documented constants and prefer `theme.size` before falling back.
- **Unistyles only:** All view styles must be created via `createStyleSheet` and consumed via `useStyles`. No inline styles. `StyleSheet.create` from React Native is disallowed except for highly optimized lists; prefer Unistyles responsive features instead.
- **Theming:** `StyleSheet.configure` already defines `appThemes` (light/dark) and breakpoints. Respect `initialTheme: "light"` and non-adaptive themes. Use `useStyles` to read `themeName` when conditional colors are required.
- **Responsiveness:** Use Unistyles breakpoint API as described in `unistyles-full.md` (e.g., breakpoint-aware blocks within `createStyleSheet`). Favor stacked → two-column layouts at `md` and wider.

## UI Architecture & Layout Rules

- **Screen skeleton:** `SafeAreaView` → optional status-bar spacer → `Header` → `Content` → optional `Footer`. Content should be scrollable when necessary (`ScrollView` or `FlatList`) and padded with `theme.size` tokens.
- **Containers:** Default page container uses `flex: 1`, `backgroundColor: theme.colors.background`, horizontal padding `theme.size["4"]` on mobile, `theme.size["5"]` to `theme.size["6"]` on md+ via breakpoints, and vertical gaps via `gap`.
- **Spacing philosophy:** Use consistent multiples via `theme.size["n"]`. Default gutters: `theme.size["4"]` for screen padding, `theme.size["3"]` between stacked blocks, `theme.size["2"]` between label-control pairs.
- **Surface layering:** Cards and panels use `theme.colors.surface` with `theme.radius.lg` and light shadows (`theme.shadows.shadowSm` in light, `shadowXs` in dark). Apply `borderColor: theme.colors.border` for separators.
- **Typography:** Use `theme.font` sizes (xs2 → xl6) and weights (`theme.font.medium`, `semiBold`, `bold`). Set `fontFamily: theme.families.inter` unless Persian text requires `theme.families.vazir`. Avoid hardcoded pixel sizes.
- **Color usage:** Text defaults to `theme.colors.text`. Muted copy uses `theme.colors.muted`. Primary accent actions use `theme.colors.primary`; destructive flows use `theme.colors.destructive`.
- **Navigation fit:** Screens must integrate with Expo Router layouts. Headers should be componentized and optionally hide the native header via router options when using a custom header.
- **Dark/light/system:** Honor `theme` object from Unistyles; do not manually branch on appearance APIs. Contrast must stay WCAG-friendly; never use pure black overlays—use `theme.colors.overlay`.

## Component Authoring Guidelines

- **Folders & naming:** Components live in `src/components/ui` for primitives and `src/components` for composites. Use PascalCase filenames (`Button.tsx`, `Card.tsx`, `FormInput.tsx`); screen-level components stay under `src/app`.
- **Exports:** Use named exports for all components and helper hooks. Avoid default exports.
- **Props contracts:** Define TypeScript `type Props` or `interface Props`. Avoid enums; prefer string literal unions. Provide `testID` on interactive elements when stateful.
- **Subcomponents:** Extract repeated UI into local `__internals` or colocated files when used only by a parent component. Avoid deeply nested JSX; favor small, focused components.
- **State visuals:** Every interactive component must support `loading`, `disabled`, `error`, `success`, and `empty` states when applicable. Show skeletons or shimmer for loading lists; use muted text and iconography for empty states.
- **Accessibility:** Set `accessible`, `accessibilityRole`, and `accessibilityLabel` on tappable controls. Ensure hit slop via `Pressable` `hitSlop` using size tokens. Maintain focus outlines using `theme.colors.ring`.
- **Forms:** Inputs must display helper/error text, support validation states, and expose controlled props (`value`, `onChangeText`). Error colors use `theme.colors.destructive`; success uses `theme.colors.success`.
- **Validation:** Author Zod schemas outside components (e.g., `src/constants/validation.ts`) and reuse them across screens to avoid recreating schemas on each render.

## File & Directory Organization

- `src/app`: Screens and route groups for Expo Router. Each screen composes primitives from `src/components/ui`. Co-locate screen-specific hooks under `src/app/<route>/hooks` when needed.
- `src/components/ui`: Core primitives (Button, Card, Input, Text, Badge, Divider, etc.). Each file exports TypeScript types and uses Unistyles.
- `src/components`: Feature composites (auth forms, service/deployment cards, list rows).
- `src/styles`: Styling system (do not modify tokens inline; extend only via theme definitions).
- `src/store`: Zustand stores; UI reads via selectors to avoid over-renders.
- `src/api` + `src/lib`: Data clients (Axios, SWR config). UI must not call `fetch` directly—use these layers.
- `src/constants`: Route names, query keys, copy variants.
- `src/assets`: Images/fonts (reference via `require` or `Image` with `contentFit`).

## Navigation & Screen Structure

- Use Expo Router file-based routes. Each screen:
  1. Wraps content in `SafeAreaView`.
  2. Renders `Header` (title + optional actions).
  3. Renders `Content` area (scrollable as needed).
  4. Optional `Footer` for primary actions.
- For tab stacks under `src/app/(tabs)`, keep tab bar-safe padding using `useSafeAreaInsets` and `theme.size`.
- Pass navigation handlers via props; avoid importing router instance inside primitives.

## Animation & Interaction

- **Libraries:** Use `react-native-reanimated` for animations, `react-native-gesture-handler` for gestures. Avoid layout-thrashing animations in heavy lists.
- **Touch feedback:** Use `Pressable` with `android_ripple={{ color: theme.colors.overlay }}` and pressed opacity via `Reanimated` shared values where appropriate.
- **Micro-interactions:** Subtle elevation/scale on press (e.g., scale to 0.98 using `withSpring`). For cards, animate shadow and border color on focus/hover (web) using tokens.
- **Entry/exit:** Fade+translateY for modals and list rows (`withTiming`, `withDelay`). Keep durations short (120–180ms) to match Dokploy’s crisp feel.
- **Gestures:** For swipeable list items, use `PanGestureHandler` with thresholds based on `theme.size["8"]`; show actions with muted surfaces, not raw colors.

## Performance Rules

- Memoize interactive components with `React.memo` when props are stable. Use `useCallback`/`useMemo` for handlers and derived data in lists.
- Render repeating UI with `FlatList`; do not use array `.map()` for list UIs.
- **FlatList:** Provide `keyExtractor`, `getItemLayout` when possible using `theme.size` heights, `initialNumToRender` tuned to data size, and `removeClippedSubviews`. Avoid inline arrow functions in renderItem; use `useCallback`.
- **Inputs:** Keep controlled inputs stable by lifting state up; debounce expensive side effects. Avoid recreating validation schemas on each render.
- **Images:** Use `expo-image` with caching; size via `theme.size` and respect `contentFit="cover"`/`contain`.
- **SWR:** Rely on SWR for data fetching; show `isLoading`, `error`, `mutate` states with unified UI patterns below.

## dokploy-mobile UI Patterns

- **PAT login screen:** Single-field personal access token input, masked with toggle. Include helper copy describing scope, and a primary button. Show error banner on invalid token, loading state on submission, and secondary link to docs.
- **Service/Deployment cards:** Card surface with name, status pill (success/warning/danger), tags, and quick actions. Use `theme.colors.surface`, `theme.radius.lg`, `theme.shadows.shadowSm`.
- **Lists (containers/apps/domains/logs):** Use `FlatList` with sticky headers, filter chips, and inline status indicators. Rows use `theme.colors.surface` with borders; selection uses `theme.colors.tint` outline.
- **Dashboards:** Grid-like panels on md+ (responsive via breakpoints). Each panel includes header, metric value, trend chip, and action menu.
- **Detail pages:** Header with breadcrumb back action, primary action on the right, content cards for sections, logs panel with monospace font (`theme.families.mono`) and muted background.
- **Error surfaces:** Top-of-screen inline banner with icon, `theme.colors.destructive` background at 8–12% opacity, text in `theme.colors.destructive`, and retry button.
- **Empty states:** Centered illustration (from assets), title, helper text, and primary action. Use muted surface and plenty of whitespace.

## Generation Rules for the UI Agent

- Always read `src/public/unistyles-full.md` to apply Unistyles correctly.
- Enforce token usage from `src/styles/unistyles.ts`; reject inline numbers/colors. Use `theme.size`, `theme.radius`, `theme.colors`, `theme.font`, `theme.shadows`, `theme.families`.
- Enforce Unistyles for every style definition; no `StyleSheet.create` from React Native and no inline style objects in JSX.
- Follow folder placement rules above; place primitives in `src/components/ui` and compose them in `src/components` or `src/app`.
- Always HugeIcons icons, Never use other icon packs.
- Always Use Inter Font, Use JetBrains Mono for code sections.
- Designs must work in both light and dark mode.
- Use TypeScript strict mode patterns: explicit prop types, no `any`, no enums, no classes.
- Ensure screens follow `SafeAreaView → Header → Content → Footer` and apply consistent spacing with `theme.size`.
- Validate theme usage for light/dark; avoid platform appearance toggles outside Unistyles.
- Reject anti-patterns: inline styles, magic numbers, ad-hoc colors, default exports for components, side-effectful hooks in render.

## Haptics & Loaders

- **References:** Follow `src/public/HAPTIC_RULES.md` and `src/public/LOADER_RULES.md`. These documents define when and how to apply tactile feedback and loader types.
- **Haptics (expo-haptics via a shared `useHaptics` hook):**
  - Impact (Light/Medium/Heavy) on taps/presses, card taps, drag/drop confirmations.
  - Notification (Success/Warning/Error) on resolved outcomes: form submit success/fail, destructive confirms, validation errors.
  - Selection on tab/filter/picker/stepper changes.
  - Trigger once per interaction; do not stack; avoid passive interactions (scroll, auto-load). Respect a future `enableHaptics` preference flag.
- **Loaders (only UI primitives from `src/components/ui`):**
  - Skeleton for known layouts awaiting data (cards, lists, dashboards).
  - Loader/spinner for micro async or inline states (buttons, dropdown fetch).
  - ScreenLoader for blocking full-screen fetches.
  - Inline placeholder for small lazy chunks (charts/stats).
  - Mirror final layout to avoid shifts; no ad-hoc “Loading…” text.
- **State wiring:** Use SWR `isLoading/error/data` (or local async state) to pick loader type and to drive notification haptics. Keep API layer free of haptic/loader calls; UI owns feedback per these rules.

## When designing ( or redesigning ) a page, output in this structure:

- Brief UX Plan (4–6 bullets).
- Main Page Component (full TSX with imports).
- Nested Components (any additional components you introduce).
- Config File (if applicable; put strings/copy here).
- Notes (integration points, assumptions, domain considerations).

## Example Implementations

### Button (primary, secondary, subtle)

```tsx
import React, { ReactNode, useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

type ButtonVariant = "primary" | "secondary" | "subtle";

export type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  iconLeft,
  iconRight,
  fullWidth,
  accessibilityLabel,
}: ButtonProps) => {
  const { styles, theme } = useStyles(stylesheet);

  const contentColor = useMemo(() => {
    if (variant === "primary") return theme.colors.primaryForeground;
    if (variant === "secondary") return theme.colors.primary;
    return theme.colors.text;
  }, [theme.colors, variant]);

  return (
    <Pressable
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
      android_ripple={{ color: theme.colors.overlay }}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled || loading}
      onPress={onPress}
    >
      <View style={styles.content}>
        {iconLeft}
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.labelPrimary,
            variant === "secondary" && styles.labelSecondary,
            variant === "subtle" && styles.labelSubtle,
          ]}
        >
          {title}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={contentColor} />
        ) : (
          iconRight
        )}
      </View>
    </Pressable>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  base: {
    minHeight: theme.size[44],
    paddingHorizontal: theme.size["4"],
    borderRadius: theme.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: theme.size["0.25"],
    borderColor: "transparent",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.size["2"],
  },
  label: {
    fontSize: theme.font.md,
    fontWeight: theme.font.semiBold,
    fontFamily: theme.families.inter,
  },
  labelPrimary: {
    color: theme.colors.primaryForeground,
  },
  labelSecondary: {
    color: theme.colors.primary,
  },
  labelSubtle: {
    color: theme.colors.text,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.shadows.color,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: theme.size["1"],
    shadowOffset: { width: 0, height: theme.size["1"] },
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.border,
  },
  subtle: {
    backgroundColor: theme.colors.mutedSurface,
    borderColor: theme.colors.border,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.6,
  },
}));
```

### Card

```tsx
import React, { ReactNode, useMemo } from "react";
import { View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

type CardPadding = "sm" | "md" | "lg";

export type CardProps = {
  children: ReactNode;
  padding?: CardPadding;
};

export const Card = ({ children, padding = "md" }: CardProps) => {
  const { styles } = useStyles(stylesheet);

  const paddingStyle = useMemo(() => {
    if (padding === "lg") return styles.paddingLg;
    if (padding === "sm") return styles.paddingSm;
    return styles.paddingMd;
  }, [padding, styles]);

  return <View style={[styles.base, paddingStyle]}>{children}</View>;
};

const stylesheet = createStyleSheet((theme) => ({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: theme.size["0.25"],
    borderColor: theme.colors.border,
    shadowColor: theme.shadows.color,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: theme.size["2"],
    shadowOffset: { width: 0, height: theme.size["1"] },
  },
  paddingSm: {
    padding: theme.size["3"],
  },
  paddingMd: {
    padding: theme.size["4"],
  },
  paddingLg: {
    padding: theme.size["5"],
  },
}));
```

### Form Input with validation

```tsx
import React from "react";
import { Text, TextInput, View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

export type FormInputProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
};

export const FormInput = ({
  label,
  value,
  placeholder,
  error,
  helperText,
  onChangeText,
  secureTextEntry,
}: FormInputProps) => {
  const { styles, theme } = useStyles(stylesheet);
  const inputStateStyle = error ? styles.inputError : styles.inputDefault;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, inputStateStyle]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
      {helperText && !error ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  container: {
    gap: theme.size["1"],
  },
  label: {
    fontSize: theme.font.sm,
    fontWeight: theme.font.medium,
    color: theme.colors.text,
    fontFamily: theme.families.inter,
  },
  input: {
    borderWidth: theme.size["0.25"],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.size["3"],
    paddingVertical: theme.size["2"],
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontFamily: theme.families.inter,
  },
  inputDefault: {
    borderColor: theme.colors.input,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  helper: {
    color: theme.colors.muted,
    fontSize: theme.font.sm,
    fontFamily: theme.families.inter,
  },
  error: {
    color: theme.colors.destructive,
    fontSize: theme.font.sm,
    fontWeight: theme.font.medium,
    fontFamily: theme.families.inter,
  },
}));
```

### Screen layout

```tsx
import React, { useCallback } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const ExampleScreen = () => {
  const { styles } = useStyles(stylesheet);
  const handleRefresh = useCallback(() => {}, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Button title="Refresh" onPress={handleRefresh} variant="secondary" />
        </View>
        <Card>
          <Text style={styles.subtitle}>Overview</Text>
          <Text style={styles.body}>Welcome to Dokploy mobile.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.size["4"],
    gap: theme.size["4"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: theme.font.xl2,
    fontWeight: theme.font.bold,
    color: theme.colors.text,
    fontFamily: theme.families.inter,
  },
  subtitle: {
    fontSize: theme.font.lg,
    fontWeight: theme.font.semiBold,
    color: theme.colors.text,
    marginBottom: theme.size["2"],
    fontFamily: theme.families.inter,
  },
  body: {
    fontSize: theme.font.md,
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
  },
}));
```

### List with loading/empty/error UI

```tsx
import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import useSWR from "swr";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { Card } from "@/components/ui/Card";

type Item = { id: string; name: string; status: string };

const fetcher = async (): Promise<Item[]> => {
  // use shared Axios instance from src/api when implemented
  return [];
};

export const ItemsList = () => {
  const { styles, theme } = useStyles(stylesheet);
  const { data, isLoading, error, mutate } = useSWR("items", fetcher);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <Card>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemStatus}>{item.status}</Text>
      </Card>
    ),
    [styles.itemStatus, styles.itemTitle]
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator]
  );
  const handleRetry = useCallback(() => mutate(), [mutate]);
  const keyExtractor = useCallback((item: Item) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.stateText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.stateContainer, styles.errorSurface]}>
        <Text style={styles.errorText}>Unable to load items</Text>
        <Text style={styles.retry} onPress={handleRetry}>
          Retry
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>No items yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={renderSeparator}
      renderItem={renderItem}
    />
  );
};

const stylesheet = createStyleSheet((theme) => ({
  listContent: {
    padding: theme.size["4"],
    gap: theme.size["3"],
  },
  separator: {
    height: theme.size["2"],
  },
  itemTitle: {
    fontSize: theme.font.md,
    fontWeight: theme.font.semiBold,
    color: theme.colors.text,
    fontFamily: theme.families.inter,
  },
  itemStatus: {
    fontSize: theme.font.sm,
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
  },
  stateContainer: {
    padding: theme.size["4"],
    alignItems: "center",
    gap: theme.size["2"],
  },
  stateText: {
    color: theme.colors.muted,
    fontSize: theme.font.md,
    fontFamily: theme.families.inter,
  },
  errorSurface: {
    backgroundColor: theme.colors.destructive,
    borderColor: theme.colors.destructive,
    borderWidth: theme.size["0.25"],
    borderRadius: theme.radius.md,
    opacity: 0.12,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.font.md,
    fontWeight: theme.font.medium,
    fontFamily: theme.families.inter,
  },
  retry: {
    color: theme.colors.primary,
    fontWeight: theme.font.semiBold,
    fontFamily: theme.families.inter,
  },
}));
```

### Animated component example

```tsx
import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { createStyleSheet, useStyles } from "react-native-unistyles";

export const AnimatedBadge = ({ label }: { label: string }) => {
  const { styles, theme } = useStyles(stylesheet);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 140 });
    opacity.value = withSpring(1);
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.size["3"],
    paddingVertical: theme.size["1"],
  },
  label: {
    fontSize: theme.font.sm,
    fontWeight: theme.font.medium,
    fontFamily: theme.families.inter,
    color: theme.colors.primaryForeground,
  },
}));
```

## Usage Expectations for Generated UI

- Every generated screen or component must compile under strict TypeScript with the existing theme types.
- Components must be reusable and composable; avoid embedding network logic inside UI primitives.
- When receiving high-level UI requests, resolve them into:
  1. Layout structure (SafeArea → Header → Content → Footer).
  2. Tokenized styles using Unistyles.
  3. Accessible interactions and feedback (loading/error/empty/success).
  4. Proper file placement and named exports.
- Prefer minimal, structured, neutral Dokploy look: balanced whitespace, subtle shadows, muted palette, clear hierarchy.

This document is the single source of truth for UI generation in **dokploy-mobile**. Adhere to it strictly.
