import "../styles/unistyles";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { loadStoredTheme, ThemeName } from "@/src/hooks/theme";
import { AuthStatus, useAuthStore } from "@/src/store/auth";
import { navDarkTheme, navLightTheme } from "@/src/styles/nav-theme";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // inter: require("../assets/fonts/Inter"),
    ...FontAwesome.font,
  });

  const { rt } = useUnistyles(); // subscribe to theme changes
  const navTheme =
    (rt.themeName ?? "light") === "dark" ? navDarkTheme : navLightTheme;
  const status = useAuthStore((state) => state.status);
  const initializeAuth = useAuthStore((state) => state.initialize);

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
    initializeAuth();
  }, [initializeAuth]);

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
      <RootLayoutNav status={status} />
    </ThemeProvider>
  );
}

function RootLayoutNav({ status }: { status: AuthStatus }) {
  const { theme } = useUnistyles();

  if (status === "checking") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={status !== "authenticated"}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={status === "authenticated"}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack.Protected>
    </Stack>
  );
}
