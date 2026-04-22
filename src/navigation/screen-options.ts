import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

export const sheetPresentationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.9, 0.98],
  sheetInitialDetentIndex: 0,
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
  sheetLargestUndimmedDetentIndex: 0,
} satisfies StackScreenOptions;

export const formSheetScreenOptions = {
  ...sheetPresentationOptions,
  headerShown: true,
  headerTransparent: true,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
} satisfies StackScreenOptions;
