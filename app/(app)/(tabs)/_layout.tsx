import { Tabs } from 'expo-router';
import { HomeIcon, Plus, SettingsIcon } from 'lucide-react-native';

export default function AppTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Projects',
          headerShown: true,
          headerTitleAlign: 'left',
          headerRight: () => <Plus color={'white'} size={22} style={{ marginRight: 10 }} />,
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
