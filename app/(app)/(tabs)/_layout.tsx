import { useHaptics } from '@/hooks/use-haptics';
import { useEffect, useRef } from 'react';
import { useSegments } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export const unstable_settings = {
  initialRouteName: '(home)',
};

export default function TabLayout() {
  const segments = useSegments();
  const { selection } = useHaptics();
  const previousTabRef = useRef<string | null>(null);
  const activeTab = segments.find(
    (segment) => segment === '(home)' || segment === '(projects)' || segment === '(settings)'
  );

  useEffect(() => {
    if (!activeTab) {
      return;
    }

    if (previousTabRef.current && previousTabRef.current !== activeTab) {
      void selection();
    }

    previousTabRef.current = activeTab;
  }, [activeTab, selection]);

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(projects)">
        <NativeTabs.Trigger.Label>Projects</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="apps"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gear', selected: 'gearshape.fill' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
