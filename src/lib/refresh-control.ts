import type { RefreshControlProps } from 'react-native';

import { THEME } from './theme';

type ResolvedTheme = 'light' | 'dark';

export function getRefreshControlColors(
  resolvedTheme: ResolvedTheme
): Pick<RefreshControlProps, 'colors' | 'progressBackgroundColor' | 'tintColor'> {
  const spinnerColor = THEME[resolvedTheme].primary;
  const progressBackgroundColor =
    resolvedTheme === 'dark' ? THEME.dark.muted : THEME.light.background;

  return {
    tintColor: spinnerColor,
    colors: [spinnerColor],
    progressBackgroundColor,
  };
}
