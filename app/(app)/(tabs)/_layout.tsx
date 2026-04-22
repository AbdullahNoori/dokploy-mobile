import { useHaptics } from '@/hooks/use-haptics';
import { useEffect, useRef } from 'react';
import { useSegments } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const segments = useSegments();
  const { selection } = useHaptics();
  const previousTabRef = useRef<string | null>(null);
  const activeTab = segments.find(
    (segment) => segment === '(projects)' || segment === '(settings)'
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
    <NativeTabs>
      <NativeTabs.Trigger name="(projects)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
