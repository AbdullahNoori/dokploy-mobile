import {DefaultTheme, Theme, DarkTheme} from '@react-navigation/native';
import {darkTheme, lightTheme} from './themes';

export const navLightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.primary[500],
    background: lightTheme.colors.background,
    card: lightTheme.colors.background,
    text: lightTheme.colors.text,
    border: lightTheme.colors.border,
  },
} as Theme;

export const navDarkTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: darkTheme.colors.primary[500],
    background: darkTheme.colors.background,
    card: darkTheme.colors.background,
    text: darkTheme.colors.text,
    border: darkTheme.colors.border,
  },
} as Theme;
