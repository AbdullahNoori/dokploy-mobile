# Expo Router + Dokploy PAT Navigation Blueprint

Production-ready navigation architecture for Expo Router using the provided Zustand auth store and PAT flow. All code is Expo Router–native (no custom navigators) and only uses animations defined in `src/public/router_animations.md`.

---

## 1) Root Navigation Structure

### File: `src/app/_layout.tsx`
```tsx
import "../styles/unistyles";
import { useEffect, useMemo } from "react";
import { Stack, Slot, Redirect, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useUnistyles, UnistylesRuntime } from "react-native-unistyles";

import AuthLoadingScreen from "./AuthLoadingScreen";
import { useAuthStore } from "@/src/store/auth";
import { navDarkTheme, navLightTheme } from "@/src/styles/nav-theme";
import { loadStoredTheme, ThemeName } from "@/src/hooks/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const { rt } = useUnistyles();
  const navTheme = (rt.themeName ?? "light") === "dark" ? navDarkTheme : navLightTheme;
  const status = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const restoreTheme = async () => {
      const stored = await loadStoredTheme();
      UnistylesRuntime.setTheme((stored as ThemeName | null) ?? "light");
    };
    restoreTheme();
  }, []);

  const group = useMemo(() => segments[0], [segments]);

  if (!fontsLoaded) return null;
  if (status === "checking") return <AuthLoadingScreen />;

  // Global redirects
  if (status === "unauthenticated" && group !== "(auth)") {
    return <Redirect href="/(auth)/login" />;
  }
  if (status === "authenticated" && group === "(auth)") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ThemeProvider value={navTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="friends" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="tarkeeb" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="+not-found" options={{ headerShown: true, title: "Not found" }} />
        </Stack>
        <Slot />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
```

**Hydration flow**
- `initialize()` runs once in root layout to hydrate PAT + user.
- While `status === "checking"`, render `AuthLoadingScreen` to block all protected routes.
- Redirect unauthenticated users to `(auth)/login`; redirect authenticated users away from the auth group.

### File: `src/app/AuthLoadingScreen.tsx`
```tsx
import { ActivityIndicator, View, Text } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export default function AuthLoadingScreen() {
  const { theme } = useUnistyles();
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
      <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>
        Securing session…
      </Text>
    </View>
  );
}
```

---

## 2) useProtectedRoute Hook (reusable guard)

### File: `src/hooks/useProtectedRoute.ts`
```tsx
import { useMemo } from "react";
import { Redirect, useSegments } from "expo-router";
import { useAuthStore } from "@/src/store/auth";
import AuthLoadingScreen from "@/src/app/AuthLoadingScreen";

type Options = { allowAuthenticated?: boolean; allowUnauthenticated?: boolean };

export function useProtectedRoute(options: Options = { allowAuthenticated: true, allowUnauthenticated: false }) {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();
  const group = useMemo(() => segments[0], [segments]);
  const inAuthGroup = group === "(auth)";

  if (status === "checking") {
    return { status, gate: <AuthLoadingScreen /> };
  }

  // Public/auth routes
  if (inAuthGroup && status === "authenticated" && !options.allowAuthenticated) {
    return { status, gate: <Redirect href="/(tabs)" /> };
  }

  // Protected routes
  if (!inAuthGroup && status !== "authenticated" && !options.allowUnauthenticated) {
    return { status, gate: <Redirect href="/(auth)/login" /> };
  }

  return { status, gate: null };
}
```

Usage: call `const { gate } = useProtectedRoute();` inside any protected layout/screen. If `gate` is non-null, return it.

---

## 3) Public Auth Group (Unauthenticated only)

### File: `src/app/(auth)/_layout.tsx`
```tsx
import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);
  const { gate } = useProtectedRoute({ allowAuthenticated: false, allowUnauthenticated: true });

  if (gate) return gate;
  if (status === "authenticated") return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="SignupScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="ResetPasswordScreen" />
      <Stack.Screen name="OtpVerificationScreen" />
      <Stack.Screen name="ProfilePhotoScreen" />
      <Stack.Screen name="OnboardingScreen" />
    </Stack>
  );
}
```

---

## 4) Protected Tabs Group

### File: `src/app/(tabs)/_layout.tsx`
```tsx
import { Tabs, Redirect } from "expo-router";
import { useUnistyles } from "react-native-unistyles";
import { useAuthStore } from "@/src/store/auth";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";

export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);
  const { gate } = useProtectedRoute();
  const { theme } = useUnistyles();

  if (gate) return gate;
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: theme.colors.background },
        animation: "fade", // allowed tabs animation
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="teams" options={{ title: "Teams" }} />
      <Tabs.Screen name="friends" options={{ title: "Friends" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

---

## 5) Protected Nested Layouts (pattern)

Example: `src/app/friends/_layout.tsx`
```tsx
import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";

export default function FriendsLayout() {
  const status = useAuthStore((s) => s.status);
  const { gate } = useProtectedRoute();

  if (gate) return gate;
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: true, animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ title: "Friends" }} />
      <Stack.Screen name="requests" options={{ title: "Your Requests" }} />
      <Stack.Screen name="incoming-requests" options={{ title: "Incoming" }} />
      <Stack.Screen name="send-request" options={{ title: "Send Request" }} />
    </Stack>
  );
}
```

`profile/_layout.tsx` and `tarkeeb/_layout.tsx` mirror this pattern (call `useAuthStore` + `useProtectedRoute`, gate on status, use allowed animations like `slide_from_right`).

---

## 6) Modal Group

### File: `src/app/modal.tsx`
```tsx
import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function ModalScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Modal content</Text>
      <Button title="Close" onPress={() => router.back()} />
    </View>
  );
}
```
- Open: `router.push("/modal")`
- Close: `router.back()`
- Presentation/animation configured in root stack (`presentation: "modal"`, `animation: "slide_from_bottom"`).

---

## 7) Dynamic Route Example

### File: `src/app/tarkeeb/[id]/editor.tsx`
```tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function TarkeebEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: `Tarkeeb ${id}`, animation: "slide_from_right" }} />
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Editing workspace: {id}</Text>
      </View>
    </>
  );
}
```
- Protected because parent `tarkeeb/_layout.tsx` gates it.
- Deep link example: `dokploymobile://tarkeeb/42/editor` → hydrates auth → if no PAT, redirect to `(auth)/login`.

---

## 8) Deep Linking (PAT-safe)

`app.json` excerpt:
```json
{
  "expo": {
    "scheme": "dokploymobile",
    "platforms": ["ios", "android"],
    "experiments": { "typedRoutes": true },
    "ios": { "bundleIdentifier": "com.dokploy.mobile" },
    "android": { "package": "com.dokploy.mobile" },
    "extra": { "router": { "origin": "https://dokploy.app" } },
    "deeplinks": ["dokploymobile://", "https://dokploy.app"]
  }
}
```
PAT is never placed in URLs; deep links only resolve routes. If PAT is missing, the guard redirects to `(auth)/login` before content renders.

---

## 9) Navigation Interceptor (unsaved changes)

```tsx
import { useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";

export function useUnsavedChangesPrompt(hasChanges: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (!hasChanges) return;
      e.preventDefault();
      Alert.alert(
        "Discard changes?",
        "Leaving this page will lose your changes.",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return sub;
  }, [navigation, hasChanges]);
}
```
- Use inside forms: `useUnsavedChangesPrompt(isDirty);`
- Cancels transition unless user confirms.

---

## 10) PAT-Based Access Control Rules

- Only header: `Authorization: Bearer <PAT>`.
- PAT is a single string in MMKV; never parsed/decoded and never accessed outside `useAuthStore`.
- `useAuthStore.authenticateWithPat` validates PAT/server via `fetchProjects` before setting `status: "authenticated"`.
- All protected layouts/screens call `useAuthStore` to read `status` and gate rendering; UI remains blocked while `status === "checking"`.

---

## 11) Common Redirect Patterns

- After login/signup or `authenticateWithPat`: `router.replace("/(tabs)")`.
- After logout: `await useAuthStore.getState().logout(); router.replace("/(auth)/login");`
- Inline guard for any screen: `{status !== "authenticated" ? <Redirect href="/(auth)/login" /> : <Content />}`.

---

## 12) Animations (allowed only)

- Tabs: `animation: "fade"` or `"none"` or `"shift"` (per `router_animations.md`).
- Stack screens: `fade`, `slide_from_right`, `slide_from_left`, `slide_from_bottom`, `fade_from_bottom`, `simple_push`, `flip`, `default`, `none`.
- No custom gestures, no Reanimated overrides.

---

## 13) Parent/Child Wrapping Rules

- Root `_layout` hydrates auth + theme; applies global redirects before rendering any group.
- Public group `(auth)` is only for unauthenticated users; authenticated users are redirected to `(tabs)`.
- Protected parents (`(tabs)`, `friends`, `profile`, `tarkeeb`) all call `useAuthStore` + `useProtectedRoute`; children inherit protection automatically.
- Modal exists at root but still sits behind root guard because unauthenticated users are redirected before it renders.
