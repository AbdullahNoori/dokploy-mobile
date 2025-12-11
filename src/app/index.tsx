import { Redirect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { HttpError } from "@/src/lib/http-error";
import { useAuthStore } from "@/src/store/auth";
import { StyleSheet } from "@/src/styles/unistyles";

export default function LoginScreen() {
  const status = useAuthStore((state) => state.status);
  const authenticateWithPat = useAuthStore(
    (state) => state.authenticateWithPat
  );

  const [pat, setPat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const backendHost = useMemo(() => {
    const url = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (!url) return null;
    return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }, []);

  useEffect(() => {
    if (submitting) {
      animationRef.current?.stop();
      const pulse = Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.98,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]);
      const loop = Animated.loop(pulse);
      animationRef.current = loop;
      loop.start();
    } else {
      animationRef.current?.stop();
      animationRef.current = null;
      buttonScale.setValue(1);
    }
  }, [buttonScale, submitting]);

  const handlePatChange = useCallback(
    (value: string) => {
      setPat(value);
      if (error) setError(null);
    },
    [error]
  );

  const handleSubmit = useCallback(async () => {
    const token = pat.trim();

    if (!token) {
      setError("Enter your personal access token to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await authenticateWithPat(token);
    } catch (err: any) {
      const message =
        err instanceof HttpError ? err.message : err?.message ?? null;
      setError(
        message ??
          "We could not verify that token. Double-check it and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [authenticateWithPat, pat]);

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  if (status === "checking") {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Preparing your workspace…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <KeyboardAvoidingView
        style={styles.avoider}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.hero}>
          <View style={styles.logoShell}>
            <Image
              source={require("@/src/assets/images/dokploy-light.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome to Dokploy</Text>
          <Text style={styles.subtitle}>
            Paste your personal access token to unlock your dashboard.
            Everything stays on-device.
          </Text>
          {backendHost ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Instance</Text>
              <Text style={styles.badgeValue}>{backendHost}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.label}>Personal access token</Text>
            <TouchableOpacity
              onPress={() => setSecure((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={
                secure
                  ? "Show personal access token"
                  : "Hide personal access token"
              }
            >
              <Text style={styles.toggle}>{secure ? "Show" : "Hide"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputShell}>
            <TextInput
              value={pat}
              onChangeText={handlePatChange}
              placeholder="dpk_live_xxxx"
              placeholderTextColor={styles.placeholder.color}
              secureTextEntry={secure}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              style={styles.input}
              multiline
              selectionColor={styles.caret.color}
            />
          </View>

          <Text style={styles.hint}>
            To login, please generate a Personal Access Token (PAT) in your
            Dokploy account settings and paste it here.
          </Text>

          <TouchableOpacity
            style={styles.helpRow}
            onPress={() => setShowHelp(true)}
            accessibilityRole="button"
          >
            <Text style={styles.helpLink}>How to generate a PAT</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View
            style={[
              styles.buttonWrapper,
              { transform: [{ scale: buttonScale }] },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!pat.trim() || submitting) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!pat.trim() || submitting}
              activeOpacity={0.9}
            >
              {submitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={styles.primaryButtonText.color} />
                  <Text style={styles.primaryButtonText}>Signing you in…</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        transparent
        animationType="fade"
        visible={showHelp}
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>How to generate a PAT</Text>
            <Text style={styles.modalBody}>
              Follow these quick steps to create a new personal access token in
              Dokploy.
            </Text>
            <View style={styles.steps}>
              <Text style={styles.step}>
                1. Sign in to Dokploy and open Settings.
              </Text>
              <Text style={styles.step}>2. Select Personal Access Tokens.</Text>
              <Text style={styles.step}>
                3. Create a token, set the scopes you need, and copy it.
              </Text>
              <Text style={styles.step}>
                4. Paste the token here and continue.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowHelp(false)}
              accessibilityRole="button"
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing(5),
    paddingVertical: theme.spacing(8),
  },
  avoider: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(4),
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
  },
  hero: {
    width: "100%",
    maxWidth: theme.size[384],
    alignItems: "center",
    gap: theme.spacing(2),
  },
  logoShell: {
    width: theme.size[80],
    height: theme.size[80],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadows.color,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  logo: {
    width: "82%",
    height: "82%",
  },
  title: {
    fontSize: theme.font.xl4,
    fontFamily: theme.families.inter,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.font.md,
    fontFamily: theme.families.inter,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: theme.font.md * 1.6,
    maxWidth: theme.size[320],
  },
  badge: {
    marginTop: theme.spacing(1),
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(1.5),
    backgroundColor: theme.colors.mutedSurface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  badgeLabel: {
    fontFamily: theme.families.inter,
    fontSize: theme.font.xs,
    color: theme.colors.muted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  badgeValue: {
    fontFamily: theme.families.mono,
    fontSize: theme.font.sm,
    color: theme.colors.text,
  },
  formCard: {
    width: "100%",
    maxWidth: theme.size[384],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl2,
    padding: theme.spacing(5),
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.shadows.color,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: theme.families.inter,
    fontSize: theme.font.md,
    fontWeight: "700",
    color: theme.colors.text,
  },
  toggle: {
    color: theme.colors.primary,
    fontFamily: theme.families.inter,
    fontWeight: "700",
    fontSize: theme.font.sm,
  },
  inputShell: {
    marginTop: theme.spacing(1.5),
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.mutedSurface,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    minHeight: theme.size[96],
    shadowColor: theme.shadows.color,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.font.base,
    fontFamily: theme.families.inter,
    lineHeight: theme.font.base * 1.5,
  },
  placeholder: {
    color: theme.colors.muted,
  },
  caret: {
    color: theme.colors.primary,
  },
  hint: {
    marginTop: theme.spacing(1.5),
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
    fontSize: theme.font.sm,
    lineHeight: theme.font.sm * 1.6,
  },
  helpRow: {
    marginTop: theme.spacing(1),
  },
  helpLink: {
    color: theme.colors.primary,
    fontFamily: theme.families.inter,
    fontWeight: "700",
    fontSize: theme.font.sm,
    textDecorationLine: "underline",
  },
  error: {
    marginTop: theme.spacing(1),
    color: theme.colors.destructive,
    fontFamily: theme.families.inter,
    fontSize: theme.font.sm,
  },
  buttonWrapper: {
    marginTop: theme.spacing(2),
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(3),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.families.inter,
    fontSize: theme.font.md,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing(5),
  },
  modalCard: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl2,
    padding: theme.spacing(5),
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.shadows.color,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  modalTitle: {
    fontFamily: theme.families.inter,
    fontSize: theme.font.xl2,
    fontWeight: "800",
    color: theme.colors.text,
  },
  modalBody: {
    fontFamily: theme.families.inter,
    fontSize: theme.font.md,
    color: theme.colors.muted,
    lineHeight: theme.font.md * 1.6,
  },
  steps: {
    gap: theme.spacing(1),
  },
  step: {
    fontFamily: theme.families.inter,
    fontSize: theme.font.base,
    color: theme.colors.text,
    lineHeight: theme.font.base * 1.5,
  },
  modalButton: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2.5),
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  modalButtonText: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.families.inter,
    fontWeight: "700",
    fontSize: theme.font.md,
  },
}));
