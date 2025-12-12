# dokploy-mobile Navigation Agent

Authoritative navigation policy for **dokploy-mobile**. Every navigation change must follow this document exactly. The stack is **Expo Router (SDK 54)** with **Zustand** for auth, **SWR** for data, **Axios**, and **Unistyles** for theming.

## Non-Negotiable Architecture

- Use Expo Router’s official `Stack.Protected`/`Tabs.Protected` pattern only; no ad-hoc redirects inside screens.
- Root layout = providers only (SafeAreaProvider, GestureHandlerRootView, Unistyles ThemeProvider, Toast provider, BottomSheet provider, SWRConfig, SplashScreen + font loading). Zero navigation logic here.
- AppWrapper/AppNavigator owns auth hydration, redirect effects, protected-route gates, segment detection, and central Stack/Tab definitions.
- Zustand auth lifecycle: hydrate PAT on launch, read from `src/store/auth.ts`, redirect if PAT is missing, block UI while status is `"checking"`, never access tokens outside the store, and once authenticated the user must not return to login.
- File-based routing only; never hand-build stacks, drawers, or navigators in JS.
- Support deep linking, dynamic routes (`[id].tsx`), nested layouts, `(modals)/` groups, and navigation interceptors.
- Splash screen blocks UI until PAT hydration finishes and redirects are settled.
- Animations must use only values from `src/public/router_animations.md`.
- Expo Router APIs only; do not import React Navigation primitives directly (no `NavigationContainer`, `create*Navigator`).

## Route Group Conventions

- `(auth)/`: Public-only flows (login, signup, PAT entry, password reset). Must be inaccessible once `status === "authenticated"`.
- `(tabs)/`: Primary authenticated shell. All tabs assume `status === "authenticated"` and inherit protection from AppWrapper.
- `(XYZ)/`: Optional nested group for stacks that should never load unless authenticated (e.g., feature subsections outside tabs).
- `(modals)/`: Modal-only screens. Presented via options in AppWrapper stack; never include business logic here.

## Root Layout Blueprint (providers only)

```tsx
// src/app/_layout.tsx
import "../styles/unistyles";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider as UnistylesThemeProvider } from "react-native-unistyles";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ToastProvider } from "react-native-toast-notifications";
import { SWRConfig } from "swr";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AppWrapper } from "@/src/app/AppWrapper";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    /* load required fonts */
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <BottomSheetModalProvider>
            <SWRConfig value={{ provider: () => new Map() }}>
              <AppWrapper />
            </SWRConfig>
          </BottomSheetModalProvider>
        </ToastProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
```

- No navigation logic, redirects, or auth checks in `_layout.tsx`.

## AppWrapper Hydration & Routing (authoritative example)

```tsx
// src/app/AppWrapper.tsx
import { useEffect, useMemo } from "react";
import { Stack, Tabs, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/src/store/auth";

export function AppWrapper() {
  const status = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);
  const router = useRouter();

  useEffect(() => {
    initialize().finally(() => SplashScreen.hideAsync());
  }, [initialize]);

  useEffect(() => {
    if (status === "checking") return; // splash stays up
  }, [status, router]);

  if (status === "checking") return null; // blocked by splash

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
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
```

- Auth hydration runs once; `status` stays the single source of truth.
- Redirects live in this wrapper, not in screens or root layout.
- Guards rely on `Stack.Protected`; no manual `if (!user) router.push(...)` inside screens.

## Protected Route Layout (complete example)

```tsx
// src/app/(protected)/projects/_layout.tsx
import { Stack } from "expo-router";
import { useAuthStore } from "@/src/store/auth";

export default function ProjectsLayout() {
  const status = useAuthStore((s) => s.status);

  return (
    <Stack>
      <Stack.Protected guard={status === "authenticated"}>
        <Stack.Screen
          name="index"
          options={{ title: "Projects", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="[id]"
          options={{ title: "Project Details", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="[id]/settings"
          options={{ title: "Settings", animation: "fade_from_bottom" }}
        />
      </Stack.Protected>
    </Stack>
  );
}
```

- No inline redirects inside screens; access control is expressed via `Stack.Protected`.
- Dynamic routes (`[id]`) inherit the guard.

## Modal Groups

```tsx
// src/app/(modals)/confirm-exit.tsx
import { View, Text, Button } from "react-native";
import { useRouter, Stack } from "expo-router";

export default function ConfirmExit() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          title: "Unsaved changes",
        }}
      />
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <Text>Leaving this page will discard changes.</Text>
        <Button title="Stay" onPress={() => router.back()} />
        <Button title="Leave" onPress={() => router.replace("/(tabs)")} />
      </View>
    </>
  );
}
```

- Register the `(modals)` group in AppWrapper stack with modal presentation.
- Open via `router.push("/(modals)/confirm-exit")`; close via `router.back()` or `router.replace(...)`.

## Deep Linking Format

- Scheme: `dokploymobile://`.
- Example routes: `dokploymobile://(tabs)/projects/123`, `dokploymobile://(auth)/login`, `dokploymobile://(modals)/confirm-exit`.
- Dynamic segments map 1:1 to filenames (`[id]` → `/123`). Query params map to `useLocalSearchParams`.
- Deep links always hydrate auth first; if PAT is absent, AppWrapper redirects to `(auth)/login` before rendering the target screen.

## Navigation Interceptors (unsaved changes)

```tsx
import { useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";

export function useUnsavedChangesPrompt(hasChanges: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (event) => {
      if (!hasChanges) return;
      event.preventDefault();
      Alert.alert(
        "Discard changes?",
        "Leaving this page will lose your changes.",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => navigation.dispatch(event.data.action),
          },
        ]
      );
    });
    return sub;
  }, [navigation, hasChanges]);
}
```

- Use inside forms: `useUnsavedChangesPrompt(isDirty);`.
- Do not perform navigation in the interceptor; only resume the blocked action.

## Animation Rules

- Tabs: `fade`, `shift`, or `none` only.
- Stack: `default`, `fade`, `fade_from_bottom`, `flip`, `simple_push`, `slide_from_bottom`, `slide_from_right`, `slide_from_left`, `none`.
- All animations must be set via `screenOptions` or `Stack.Screen`/`Tabs.Screen` options; never import or craft custom Reanimated transitions.
- Reference: `src/public/router_animations.md`.

## PR Validation Checklist

- Guards use `Stack.Protected`/`Tabs.Protected` exclusively; no manual redirects inside screens.
- Root `_layout` contains only providers and loading gates; all routing logic lives in AppWrapper.
- Auth hydration (`initialize`) runs once; PAT/token never read outside `src/store/auth.ts`.
- SplashScreen hides only after fonts and auth hydration complete; UI remains blocked while `status === "checking"`.
- Segment-based redirects prevent authenticated users from entering `(auth)` and unauthenticated users from accessing protected groups.
- All new routes follow folder conventions and file-based routing; no custom navigator creation.
- Animations use only values defined in `router_animations.md`.
- Deep-link paths match file names and are tested for both authenticated and unauthenticated states.
- Modals live under `(modals)/` with modal presentation defined in AppWrapper.
- Interceptors (if added) block navigation without mutating auth or bypassing guards.

## DO THIS / NEVER DO THIS

- DO centralize navigation logic in AppWrapper; NEVER sprinkle redirects inside screen components.
- DO gate routes with `Stack.Protected`/`Tabs.Protected`; NEVER bypass guards with manual `router.push` checks.
- DO hydrate PAT via `useAuthStore.initialize` and redirect from AppWrapper; NEVER read or store tokens outside `src/store/auth.ts`.
- DO keep `_layout.tsx` provider-only; NEVER add navigation decisions or auth checks there.
- DO rely on file-based routing (folders/files) for stacks, tabs, modals; NEVER create custom stacks/drawers in JS.
- DO use animations from `src/public/router_animations.md`; NEVER invent custom transition configs.
- DO ensure authenticated users cannot reach `(auth)` and unauthenticated users cannot reach protected groups; NEVER create flows that contradict this lifecycle.
- DO read auth state via `useAuthStore` selectors; NEVER mirror auth in React context or component state.
- DO use Expo Router components/hooks; NEVER import React Navigation APIs directly (only Expo Router re-exports for cases like `beforeRemove`).
