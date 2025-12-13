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
    foreground: "hsl(240 10% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(240 10% 3.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(240 10% 3.9%)",
    primary: "hsl(240 5.9% 10%)",
    primaryForeground: "hsl(0 0% 98%)",
    secondary: "hsl(240 4.8% 95.9%)",
    secondaryForeground: "hsl(240 5.9% 10%)",
    muted: "hsl(240 4.8% 95.9%)",
    mutedForeground: "hsl(240 3.8% 46.1%)",
    accent: "hsl(240 4.8% 95.9%)",
    accentForeground: "hsl(240 5.9% 10%)",
    destructive: "hsl(0 84.2% 50.2%)",
    destructiveForeground: "hsl(0 0% 98%)",
    border: "hsl(240 5.9% 90%)",
    input: "hsl(240 5.9% 90%)",
    ring: "hsl(240 10% 3.9%)",
    chart1: "hsl(173 58% 39%)",
    chart2: "hsl(12 76% 61%)",
    chart3: "hsl(197 37% 24%)",
    chart4: "hsl(43 74% 66%)",
    chart5: "hsl(27 87% 67%)",
    sidebar: "hsl(0 0% 98%)",
    sidebarForeground: "hsl(240 5.3% 26.1%)",
    sidebarPrimary: "hsl(240 5.9% 10%)",
    sidebarPrimaryForeground: "hsl(0 0% 98%)",
    sidebarAccent: "hsl(240 4.8% 95.9%)",
    sidebarAccentForeground: "hsl(240 5.9% 10%)",
    sidebarBorder: "hsl(220 13% 91%)",
    sidebarRing: "hsl(217.2 91.2% 59.8%)",
    overlay: "rgba(0, 0, 0, 0.2)",
  },
  dark: {
    background: "hsl(0 0% 0%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(240 4% 10%)",
    cardForeground: "hsl(0 0% 98%)",
    popover: "hsl(240 10% 3.9%)",
    popoverForeground: "hsl(0 0% 98%)",
    primary: "hsl(0 0% 98%)",
    primaryForeground: "hsl(240 5.9% 10%)",
    secondary: "hsl(240 3.7% 15.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
    muted: "hsl(240 4% 10%)",
    mutedForeground: "hsl(240 5% 64.9%)",
    accent: "hsl(240 3.7% 15.9%)",
    accentForeground: "hsl(0 0% 98%)",
    destructive: "hsl(0 84.2% 50.2%)",
    destructiveForeground: "hsl(0 0% 98%)",
    border: "hsl(240 3.7% 15.9%)",
    input: "hsl(240 4% 10%)",
    ring: "hsl(240 4.9% 83.9%)",
    chart1: "hsl(220 70% 50%)",
    chart2: "hsl(340 75% 55%)",
    chart3: "hsl(30 80% 55%)",
    chart4: "hsl(280 65% 60%)",
    chart5: "hsl(160 60% 45%)",
    sidebar: "hsl(240 5.9% 10%)",
    sidebarForeground: "hsl(240 4.8% 95.9%)",
    sidebarPrimary: "hsl(224.3 76.3% 48%)",
    sidebarPrimaryForeground: "hsl(0 0% 100%)",
    sidebarAccent: "hsl(240 3.7% 15.9%)",
    sidebarAccentForeground: "hsl(240 4.8% 95.9%)",
    sidebarBorder: "hsl(240 3.7% 15.9%)",
    sidebarRing: "hsl(217.2 91.2% 59.8%)",
    overlay: "rgba(0, 0, 0, 0.5)",
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
    overlay: tailwindColors.light.overlay,
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
    overlay: tailwindColors.dark.overlay,
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
