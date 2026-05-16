import {
  processColor,
  StyleSheet,
  type ColorValue,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useResolveClassNames, useUniwind } from 'uniwind';

type ResolvedTheme = 'light' | 'dark';
type AndroidComposeColor = `#${string}`;
type ResolvedStyle = ImageStyle | TextStyle | ViewStyle;

type AndroidComposeColors = {
  foreground: AndroidComposeColor;
  mutedForeground: AndroidComposeColor;
  popover: AndroidComposeColor;
  primary: AndroidComposeColor;
  resolvedTheme: ResolvedTheme;
};

const FALLBACK_COLORS = {
  light: {
    foreground: '#0a0a0a',
    mutedForeground: '#737373',
    popover: '#ffffff',
    primary: '#171717',
  },
  dark: {
    foreground: '#fafafa',
    mutedForeground: '#a3a3a3',
    popover: '#1f1f1f',
    primary: '#fafafa',
  },
} satisfies Record<ResolvedTheme, Omit<AndroidComposeColors, 'resolvedTheme'>>;

export function useAndroidComposeColors(): AndroidComposeColors {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const foregroundStyle = useResolveClassNames('text-foreground');
  const mutedForegroundStyle = useResolveClassNames('text-muted-foreground');
  const popoverStyle = useResolveClassNames('bg-popover');
  const primaryStyle = useResolveClassNames('text-primary');
  const fallback = FALLBACK_COLORS[resolvedTheme];

  return {
    foreground: getAndroidColor(foregroundStyle, 'color', fallback.foreground),
    mutedForeground: getAndroidColor(mutedForegroundStyle, 'color', fallback.mutedForeground),
    popover: getAndroidColor(popoverStyle, 'backgroundColor', fallback.popover),
    primary: getAndroidColor(primaryStyle, 'color', fallback.primary),
    resolvedTheme,
  };
}

function getAndroidColor(
  style: unknown,
  property: 'backgroundColor' | 'color',
  fallback: AndroidComposeColor
): AndroidComposeColor {
  const flattened = StyleSheet.flatten(style as ResolvedStyle);
  const value = getStyleColor(flattened, property) ?? fallback;
  const processed = processColor(value);

  return typeof processed === 'number' ? toAndroidHex(processed) : fallback;
}

function getStyleColor(
  style: ResolvedStyle | undefined,
  property: 'backgroundColor' | 'color'
): ColorValue | undefined {
  return (style as Partial<Record<'backgroundColor' | 'color', ColorValue>> | undefined)?.[
    property
  ];
}

function toAndroidHex(value: number): AndroidComposeColor {
  return `#${(value >>> 0).toString(16).padStart(8, '0')}`;
}
