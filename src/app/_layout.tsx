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
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";
import AppWrapper from "./AppWrapper";

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

  const { theme } = useUniwind();
  const [
    bg,
    card,
    text,
    border,
    primary,
    destructive,
  ] = useCSSVariable([
    "--color-background",
    "--color-card",
    "--color-foreground",
    "--color-border",
    "--color-primary",
    "--color-destructive",
  ]);
  const navigationTheme = useMemo(
    (): Theme => {
      const base = theme === "dark" ? DarkTheme : DefaultTheme;
      return {
        ...base,
        dark: theme === "dark",
        colors: {
          ...base.colors,
          primary: (primary as string) || base.colors.primary,
          background: (bg as string) || base.colors.background,
          card: (card as string) || base.colors.card,
          text: (text as string) || base.colors.text,
          border: (border as string) || base.colors.border,
          notification: (destructive as string) || base.colors.notification,
        },
      };
    },
    [bg, border, card, destructive, primary, text, theme]
  );

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const restoreTheme = async () => {
      const stored = await loadStoredTheme();
      const nextTheme = (stored as ThemeName | null) ?? "light";

      Uniwind.setTheme(nextTheme);
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
