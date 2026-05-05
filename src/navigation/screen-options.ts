import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

export const sheetPresentationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: Platform.select({
    android: [0.88, 0.96],
    default: [0.9, 0.98],
  }),
  sheetInitialDetentIndex: 0,
  sheetGrabberVisible: Platform.OS === 'ios',
  sheetCornerRadius: Platform.select({
    android: 28,
    default: 24,
  }),
  sheetElevation: Platform.select({
    android: 16,
    default: undefined,
  }),
  sheetLargestUndimmedDetentIndex: 0,
} satisfies StackScreenOptions;

export const formSheetScreenOptions = {
  ...sheetPresentationOptions,
  headerShown: true,
  headerTransparent: Platform.OS === 'ios',
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
} satisfies StackScreenOptions;
