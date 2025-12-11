import "../styles/unistyles";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { loadStoredTheme, ThemeName } from "@/src/hooks/theme";
import { useAuthStore } from "@/src/inspirations/auth-store/authStore";
import { navDarkTheme, navLightTheme } from "@/src/styles/nav-theme";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { rt } = useUnistyles(); // subscribe to theme changes
  const navTheme =
    (rt.themeName ?? "light") === "dark" ? navDarkTheme : navLightTheme;
  const status = useAuthStore((state) => state.status);

  console.log("curr theme :", UnistylesRuntime.themeName);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const restoreTheme = async () => {
      const stored = await loadStoredTheme();
      const nextTheme = (stored as ThemeName | null) ?? "light";

      UnistylesRuntime.setTheme(nextTheme);
    };

    restoreTheme();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={navTheme}>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
