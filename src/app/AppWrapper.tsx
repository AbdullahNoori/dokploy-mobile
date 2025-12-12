import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useAuthStore } from "@/src/store/auth";

const protectedGroups = new Set(["(tabs)", "(protected)", "(modals)"]);

export function AppWrapper() {
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (status === "checking") return;

    const [rootSegment] = segments ?? [];
    const inAuthGroup = rootSegment === "(auth)";
    const inProtectedGroup = protectedGroups.has(rootSegment ?? "");

    if (!rootSegment) {
      router.replace(status === "authenticated" ? "/(tabs)" : "/(auth)");
      return;
    }

    if (status === "authenticated" && inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }

    if (status === "unauthenticated" && inProtectedGroup) {
      router.replace("/(auth)");
    }
  }, [router, segments, status]);

  useEffect(() => {
    if (status === "checking") return;

    SplashScreen.hideAsync();
  }, [status]);

  if (status === "checking") {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Protected guard={status !== "authenticated"}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={status === "authenticated"}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
