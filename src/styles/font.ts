import { TextStyle } from 'react-native';

export const fontSizes = {
  xs2: 9,
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xl2: 24,
  xl3: 28,
  xl4: 32,
  xl5: 36,
  xl6: 40,
} as const;

export const fontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;

type Font = Record<FontSize, number> &
  Record<FontWeight, Exclude<TextStyle['fontWeight'], 'normal' | undefined>>;

export const font: Font = {
  ...fontSizes,
  ...fontWeights,
} as const;