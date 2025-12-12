import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useColorScheme } from "@/src/components/useColorScheme";
import Colors from "@/src/constants/Colors";
import { persistTheme, ThemeName } from "@/src/hooks/theme";
import { useAuthStore } from "@/src/store/auth";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import {
  Folder01Icon,
  Moon02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useUnistyles();
  const status = useAuthStore((state) => state.status);
  const currentTheme: ThemeName =
    UnistylesRuntime.themeName === "dark" ? "dark" : "light";
  const toggleTheme = React.useCallback(async () => {
    const nextTheme: ThemeName = currentTheme === "light" ? "dark" : "light";
    UnistylesRuntime.setTheme(nextTheme);
    persistTheme(nextTheme);
  }, [currentTheme]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        animation: "shift",
      }}
    >
      <Tabs.Protected guard={status === "authenticated"}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Projects",
            tabBarIcon: ({ color, size }) => (
              <HugeiconsIcon icon={Folder01Icon} size={size} color={color} />
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
            headerLeft: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle theme"
                onPress={toggleTheme}
              >
                {({ pressed }) => (
                  <HugeiconsIcon
                    icon={currentTheme === "dark" ? Moon02Icon : Sun01Icon}
                    size={22}
                    color={theme.colors.text}
                    style={{ marginRight: 10, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            ),
            headerLeftContainerStyle: { paddingLeft: 8 },
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: "Tab Two",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="code" color={color} />
            ),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}
