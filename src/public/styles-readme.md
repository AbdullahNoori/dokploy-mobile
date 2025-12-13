# Unistyles Quickstart (from `public/unistyles-full.md`)

This guide summarizes the key steps from `public/unistyles-full.md` to get you productive with Unistyles in this repo. Follow it 0→1: configure, theme, switch themes, use responsive breakpoints, and wire fonts.

## 1) Configure Unistyles

- Set up once in your styles entry (see `styles/unistyles.ts`).
- Register themes and breakpoints, and enable adaptive settings:

```ts
import { StyleSheet } from "react-native-unistyles";
import { appThemes, breakpoints } from "./unistyles";

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    adaptiveThemes: true, // auto-use system theme
    CSSVars: true, // export vars for web
    nativeBreakpointsMode: "pixels",
  },
});
```

## 2) Define themes

- Themes are plain objects. In this repo we export `appThemes` with `light` and `dark` variants (colors, spacing, fonts, shadows, etc.).
- Add or tweak tokens in `styles/unistyles.ts` (e.g., `colors`, `spacing`, `typography`, `fonts`).
- Type safety comes from augmenting `UnistylesThemes` (already done in `styles/unistyles.ts`).

## 3) Use StyleSheet with theme + variants

- Create styles with a theme-aware factory and prefer shared primitives (e.g., `Text`, `Title`, `Heading` from `src/components/ui/Text.tsx`) for typography:

```ts
import { StyleSheet } from "react-native-unistyles";
import { Text, Title } from "@/src/components/ui/Text";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.size[16],
  },
  button: {
    variants: {
      tone: {
        primary: { backgroundColor: theme.colors.primary },
        secondary: { backgroundColor: theme.colors.secondary },
      },
      size: {
        sm: { padding: theme.size[8] },
        md: { padding: theme.size[12] },
      },
    },
  },
}));

const Example = () => (
  <View style={styles.container}>
    <Title variant="lg">Hello</Title>
    <Text variant="body2">Using the shared text primitives keeps sizes/colors consistent.</Text>
  </View>
);
```

- Apply variants directly: `styles.button({ tone: 'primary', size: 'md' })`.
- Compound variants (from the doc) let you add extra rules when multiple conditions match.

## 4) Switch themes at runtime

- Use `UnistylesRuntime` to read or set the active theme:

```ts
import { UnistylesRuntime } from "react-native-unistyles";

const current = UnistylesRuntime.theme; // 'light' | 'dark'
UnistylesRuntime.setTheme("dark"); // switch manually
```

- If `adaptiveThemes` is true, the theme follows the OS. To lock a theme, set `settings.initialTheme` and disable `adaptiveThemes` in `StyleSheet.configure`.

## 5) Breakpoints and responsive helpers

- Breakpoints are registered in `styles/breakpoints.ts` and passed to `StyleSheet.configure`.
- Use `mq`, `Display`, and `Hide` utilities (from the doc) for responsive rendering:

```ts
import { Display, Hide, mq } from 'react-native-unistyles'

<Display mq={mq.only.width(0, 400)}>
  <Text>Visible on small screens</Text>
</Display>
<Hide mq={mq.only.width(400)}>
  <Text>Hidden on big screens</Text>
</Hide>
```

- Inspect at runtime: `UnistylesRuntime.breakpoint` and `UnistylesRuntime.breakpoints`.

## 6) Fonts: load and reference

- Place font files under `assets/fonts/` (e.g., `JetBrainsMono-Regular.ttf`).
- Load them in your root layout using `useFonts` (Expo pattern from the doc):

```ts
import { useFonts } from "expo-font";

const [loaded] = useFonts({
  JetBrainsMono: require("../assets/fonts/JetBrainsMono-Regular.ttf"),
  JetBrainsMonoBold: require("../assets/fonts/JetBrainsMono-Bold.ttf"),
});
if (!loaded) return null;
```

- Point your theme tokens to the loaded names in `styles/unistyles.ts`:

```ts
const baseTheme = {
  fonts: {
    sans: "Inter",
    serif: "Lora",
    mono: "JetBrainsMono",
  },
};
```

- Use `fontFamily: theme.fonts.mono` (or `sans`/`serif`) in styles and variants.

## 7) Tokens and helpers

- Spacing: use `theme.size[token]` (e.g., `theme.size['16']`) to align with shared spacing tokens.
- Typography: `theme.typography` exposes sizes (`display`, `h1`, `h2`, `h3`, `body`, `bodySmall`, `caption`, `micro`). For raw sizes/weights, see `styles/font.ts`.
- Colors: `theme.colors` provides semantic and Tailwind-like tokens; reuse instead of hard-coding values.
- Shadows: `theme.shadows` includes light/dark presets.

## 8) Common snippets

- Text component with theme + variants:

```ts
const textStyles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    fontSize: theme.typography.body,
    fontWeight: "400",
  },
  variant: {
    variants: {
      tone: {
        muted: { color: theme.colors.muted },
        accent: { color: theme.colors.primary },
      },
      weight: {
        regular: { fontWeight: "400" },
        bold: { fontWeight: "700" },
      },
    },
  },
}));
```

- Theme toggle example (hook or button action):

```ts
const toggleTheme = () => {
  const next = UnistylesRuntime.theme === "light" ? "dark" : "light";
  UnistylesRuntime.setTheme(next);
};
```

## 9) Mental model

- Configure once → define tokens → build styles with `StyleSheet.create` → render with variants → toggle theme via runtime → rely on breakpoints and tokens for responsive, consistent UI.

Refer back to `public/unistyles-full.md` for deeper examples (compound variants, dynamic functions, etc.). This README keeps the essentials in one place for this project.
