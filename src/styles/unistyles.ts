import { StyleSheet } from "react-native-unistyles";
import { breakpoints } from "./breakpoints";
import { font } from "./font";
import { raduises, sizes } from "./sizes";

const spacingUnit = 4; // Tailwind base spacing (0.25rem).

const baseTheme = {
  spacing: (value: number) => value * spacingUnit,
  families: {
    inter: "Inter",
    vazir: "Vazir",
    mono: "SpaceMono",
  },
};

const tailwindColors = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 0.4179% 3.9554%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(240 0.4179% 3.9554%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(240 0.4179% 3.9554%)",
    primary: "hsl(240 0.2796% 9.0781%)",
    primaryForeground: "hsl(240 10.0655% 98.2062%)",
    secondary: "hsl(240 4.7057% 96.2358%)",
    secondaryForeground: "hsl(240 0.2796% 9.0781%)",
    muted: "hsl(240 4.7057% 96.2358%)",
    mutedForeground: "hsl(240 0.1953% 45.2403%)",
    accent: "hsl(240 4.7057% 96.2358%)",
    accentForeground: "hsl(240 0.2796% 9.0781%)",
    destructive: "hsl(355.3562 100% 45.3229%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(240 1.6595% 89.9823%)",
    input: "hsl(240 1.6595% 89.9823%)",
    ring: "hsl(240 0.3242% 63.1358%)",
    chart1: "hsl(17.9987 100% 48.0353%)",
    chart2: "hsl(174.8484 100% 29.4634%)",
    chart3: "hsl(195.9048 72.1758% 22.9039%)",
    chart4: "hsl(43.6353 100% 50%)",
    chart5: "hsl(36.3337 100% 49.7136%)",
    sidebar: "hsl(240 10.0655% 98.2062%)",
    sidebarForeground: "hsl(240 0.4179% 3.9554%)",
    sidebarPrimary: "hsl(240 0.2796% 9.0781%)",
    sidebarPrimaryForeground: "hsl(240 10.0655% 98.2062%)",
    sidebarAccent: "hsl(240 4.7057% 96.2358%)",
    sidebarAccentForeground: "hsl(240 0.2796% 9.0781%)",
    sidebarBorder: "hsl(240 1.6595% 89.9823%)",
    sidebarRing: "hsl(240 0.3242% 63.1358%)",
  },
  dark: {
    background: "hsl(240 0.4179% 3.9554%)",
    foreground: "hsl(240 10.0655% 98.2062%)",
    card: "hsl(240 0.2796% 9.0781%)",
    cardForeground: "hsl(240 10.0655% 98.2062%)",
    popover: "hsl(240 0.2796% 9.0781%)",
    popoverForeground: "hsl(240 10.0655% 98.2062%)",
    primary: "hsl(240 1.6595% 89.9823%)",
    primaryForeground: "hsl(240 0.2796% 9.0781%)",
    secondary: "hsl(240 0.2381% 14.9739%)",
    secondaryForeground: "hsl(240 10.0655% 98.2062%)",
    muted: "hsl(240 0.2381% 14.9739%)",
    mutedForeground: "hsl(240 0.3242% 63.1358%)",
    accent: "hsl(240 0.2381% 14.9739%)",
    accentForeground: "hsl(240 10.0655% 98.2062%)",
    destructive: "hsl(358.1788 100% 69.5576%)",
    destructiveForeground: "hsl(240 10.0655% 98.2062%)",
    border: "hsl(0 0% 100% / 10%)",
    input: "hsl(0 0% 100% / 15%)",
    ring: "hsl(240 0.1953% 45.2403%)",
    chart1: "hsl(225.351 84.1006% 49.0005%)",
    chart2: "hsl(159.9368 100% 36.9395%)",
    chart3: "hsl(36.3337 100% 49.7136%)",
    chart4: "hsl(273.3096 100% 63.7971%)",
    chart5: "hsl(344.8807 100% 56.2308%)",
    sidebar: "hsl(240 0.2796% 9.0781%)",
    sidebarForeground: "hsl(240 10.0655% 98.2062%)",
    sidebarPrimary: "hsl(225.351 84.1006% 49.0005%)",
    sidebarPrimaryForeground: "hsl(240 10.0655% 98.2062%)",
    sidebarAccent: "hsl(240 0.2381% 14.9739%)",
    sidebarAccentForeground: "hsl(240 10.0655% 98.2062%)",
    sidebarBorder: "hsl(0 0% 100% / 10%)",
    sidebarRing: "hsl(240 0.1953% 45.2403%)",
  },
} as const;

const shadowPresets = {
  light: {
    color: "#000000",
    opacity: 0.1,
    shadow2xs: "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.05)",
    shadowXs: "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.05)",
    shadowSm:
      "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.10), 0rem 1px 2px -0.95px hsl(0 0% 0% / 0.10)",
    shadow:
      "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.10), 0rem 1px 2px -0.95px hsl(0 0% 0% / 0.10)",
    shadowMd:
      "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.10), 0rem 2px 4px -0.95px hsl(0 0% 0% / 0.10)",
    shadowLg:
      "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.10), 0rem 4px 6px -0.95px hsl(0 0% 0% / 0.10)",
    shadowXl:
      "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.10), 0rem 8px 10px -0.95px hsl(0 0% 0% / 0.10)",
    shadow2xl: "0rem 0.1rem 0.5rem 0.05rem hsl(0 0% 0% / 0.25)",
  },
  dark: {
    color: "hsl(270 65% 55%)",
    opacity: 0.2,
    shadow2xs: "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.10)",
    shadowXs: "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.10)",
    shadowSm:
      "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.20), 0px 1px 2px -1px hsl(270 65% 55.0000% / 0.20)",
    shadow:
      "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.20), 0px 1px 2px -1px hsl(270 65% 55.0000% / 0.20)",
    shadowMd:
      "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.20), 0px 2px 4px -1px hsl(270 65% 55.0000% / 0.20)",
    shadowLg:
      "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.20), 0px 4px 6px -1px hsl(270 65% 55.0000% / 0.20)",
    shadowXl:
      "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.20), 0px 8px 10px -1px hsl(270 65% 55.0000% / 0.20)",
    shadow2xl: "0px 0.5rem 1.5rem 0rem hsl(270 65% 55.0000% / 0.50)",
  },
} as const;

const lightTheme = {
  ...baseTheme,
  colors: {
    ...tailwindColors.light,
    surface: tailwindColors.light.card,
    overlay: "rgba(0, 0, 0, 0.05)",
    text: tailwindColors.light.foreground,
    mutedSurface: tailwindColors.light.muted,
    muted: tailwindColors.light.mutedForeground,
    tint: tailwindColors.light.primary,
    success: tailwindColors.light.chart3,
    warning: tailwindColors.light.chart4,
    danger: tailwindColors.light.destructive,
  },
  shadows: shadowPresets.light,
  font: font,
  size: sizes.size,
  radius: raduises.radius,
};

const darkTheme = {
  ...baseTheme,
  colors: {
    ...tailwindColors.dark,
    surface: tailwindColors.dark.card,
    overlay: "rgba(0, 0, 0, 0.4)",
    text: tailwindColors.dark.foreground,
    mutedSurface: tailwindColors.dark.muted,
    muted: tailwindColors.dark.mutedForeground,
    tint: tailwindColors.dark.primary,
    success: tailwindColors.dark.chart3,
    warning: tailwindColors.dark.chart4,
    danger: tailwindColors.dark.destructive,
  },
  shadows: shadowPresets.dark,
  font: font,
  size: sizes.size,
  radius: raduises.radius,
};

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

export { breakpoints, StyleSheet };

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    adaptiveThemes: false,
    initialTheme: "light",
    CSSVars: true,
    nativeBreakpointsMode: "pixels",
  },
});

export type AppThemes = typeof appThemes;
export type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}
23;
