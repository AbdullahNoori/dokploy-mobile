import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

import { appThemes } from "./unistyles";

const lightColors = appThemes.light.colors;
const darkColors = appThemes.dark.colors;

export const navLightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.tint,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.destructive,
  },
};

export const navDarkTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.tint,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.destructive,
  },
};
