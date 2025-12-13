import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { authenticateWithPat } from "@/src/api/auth";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/input";
import { HttpError } from "@/src/lib/http-error";
import { getServerUrl, normalizeServerUrl } from "@/src/lib/pat-storage";
import { useAuthStore } from "@/src/store/auth";
import { StyleSheet } from "@/src/styles/unistyles";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function LoginScreen() {
  const setAuthFromResponse = useAuthStore(
    (state) => state.setAuthFromResponse
  );

  const [serverUrl, setServerUrl] = useState(() => getServerUrl() ?? "");
  const [pat, setPat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const canSubmit = useMemo(
    () => !!normalizeServerUrl(serverUrl) && !!pat.trim(),
    [pat, serverUrl]
  );

  const handleServerChange = useCallback(
    (value: string) => {
      setServerUrl(value);
      if (error) setError(null);
    },
    [error]
  );

  const handlePatChange = useCallback(
    (value: string) => {
      setPat(value);
      if (error) setError(null);
    },
    [error]
  );

  const handleSubmit = useCallback(async () => {
    const token = pat.trim();
    const normalizedServer = normalizeServerUrl(serverUrl);

    if (!normalizedServer) {
      setError("Enter the Dokploy server URL to continue.");
      return;
    }

    if (!token) {
      setError("Enter your personal access token to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      setServerUrl(normalizedServer);
      const response = await authenticateWithPat(token, normalizedServer);
      await setAuthFromResponse(response);
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
  }, [pat, serverUrl, setAuthFromResponse]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <KeyboardAvoidingView
          style={styles.avoider}
          behavior={Platform.select({ ios: "padding", android: undefined })}
        >
          <AnimatedScrollView
            entering={FadeInUp.duration(500)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedView style={styles.centerContent}>
              <Animated.View
                entering={FadeInDown.delay(140).duration(500)}
                style={styles.stack}
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
                    Connect to your Dokploy workspace with your server URL and a
                    personal access token.
                  </Text>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.fieldHeader}>
                    <Text style={styles.label}>Dokploy server URL</Text>
                  </View>

                  <Input
                    value={serverUrl}
                    onChangeText={handleServerChange}
                    placeholder="https://cloud.dokploy.com"
                    placeholderTextColor={styles.placeholder.color}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    textContentType="URL"
                    style={styles.input}
                    selectionColor={styles.caret.color}
                    returnKeyType="next"
                    containerStyle={styles.inputShell}
                    wrapperStyle={styles.inputWrapper}
                  />

                  <Text style={styles.hint}>
                    Use your self-hosted Dokploy base URL or the Dokploy Cloud
                    address.
                  </Text>

                  <View style={styles.fieldHeader}>
                    <Text style={styles.label}>Personal access token</Text>
                  </View>

                  <Input
                    value={pat}
                    onChangeText={handlePatChange}
                    placeholder="dpk_live_xxxx"
                    placeholderTextColor={styles.placeholder.color}
                    secureTextEntry={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    style={styles.input}
                    selectionColor={styles.caret.color}
                    containerStyle={styles.inputShell}
                    wrapperStyle={styles.inputWrapper}
                    multiline={true}
                  />

                  <Text style={styles.hint}>
                    To login, please generate a Personal Access Token (PAT) in
                    your Dokploy account settings and paste it here.
                  </Text>

                  <TouchableOpacity
                    style={styles.helpRow}
                    onPress={() => setShowHelp(true)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.helpLink}>How to generate a PAT</Text>
                  </TouchableOpacity>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <View style={styles.buttonWrapper}>
                    <Button
                      variant="default"
                      size="default"
                      onPress={handleSubmit}
                      enabled={canSubmit && !submitting}
                      style={[
                        styles.primaryButton,
                        (!canSubmit || submitting) &&
                          styles.primaryButtonDisabled,
                      ]}
                    >
                      {submitting ? (
                        <View style={styles.loadingRow}>
                          <ActivityIndicator
                            color={styles.primaryButtonText.color}
                          />
                          <Text style={styles.primaryButtonText}>
                            Signing you in…
                          </Text>
                        </View>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </View>
                </View>
              </Animated.View>
            </AnimatedView>
          </AnimatedScrollView>
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
                Follow these quick steps to create a new personal access token
                in Dokploy.
              </Text>
              <View style={styles.steps}>
                <Text style={styles.step}>
                  1. Sign in to Dokploy and open Settings.
                </Text>
                <Text style={styles.step}>
                  2. Select Personal Access Tokens.
                </Text>
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create((theme, size) => ({
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
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stack: {
    width: "100%",
    alignItems: "center",
    gap: theme.spacing(6),
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
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  input: {
    color: theme.colors.text,
    fontSize: theme.font.base,
    fontFamily: theme.families.inter,
  },
  placeholder: {
    color: theme.colors.muted,
  },
  caret: {
    color: theme.colors.primary,
  },
  hint: {
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
    fontSize: theme.font.xs,
    lineHeight: theme.font.xs * 1.4,
    textAlignVertical: "center",
    includeFontPadding: false,
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
