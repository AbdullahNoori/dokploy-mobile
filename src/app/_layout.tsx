import "../styles/unistyles";

import "@/src/lib/ReactotronConfig";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SWRConfig } from "swr";

import { loadStoredTheme, ThemeName } from "@/src/hooks/theme";
import { navDarkTheme, navLightTheme } from "@/src/styles/nav-theme";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";
import { AppWrapper } from "./AppWrapper";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
  duration: 680,
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: require("../assets/fonts/Inter.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { rt } = useUnistyles();
  const navigationTheme = useMemo(
    () => ((rt.themeName ?? "light") === "dark" ? navDarkTheme : navLightTheme),
    [rt.themeName]
  );

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const restoreTheme = async () => {
      const stored = await loadStoredTheme();
      const nextTheme = (stored as ThemeName | null) ?? "light";

      UnistylesRuntime.setTheme(nextTheme);
    };

    restoreTheme();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={navigationTheme}>
          <BottomSheetModalProvider>
            <SWRConfig value={{ provider: () => new Map() }}>
              <AppWrapper />
            </SWRConfig>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
