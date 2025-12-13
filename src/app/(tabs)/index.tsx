import { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/Dialog";
import { getRequest } from "@/src/lib/http";
import { StyleSheet } from "@/src/styles/unistyles";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const greeting = "You’re signed in";

  const handleFetchProjects = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await getRequest<any>("project.all");
      const projects =
        (Array.isArray(result) && result) ||
        (Array.isArray(result?.projects) ? result.projects : null);
      const total = projects?.length ?? null;

      setStatusMessage(
        typeof total === "number"
          ? `Token works — fetched ${total} project${total === 1 ? "" : "s"}.`
          : "Token works — fetched projects successfully."
      );
    } catch (error: any) {
      setStatusMessage(
        error?.message ??
          "Could not reach your Dokploy instance. Check your PAT or network."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={[styles.screen, styles.contentContainer]}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Dashboard</Text>
        <Text style={styles.title}>{greeting}</Text>
        <Text style={styles.subtitle}>
          Use your personal access token to fetch data from your Dokploy
          instance. Start by pulling projects to confirm the connection.
        </Text>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Connection check</Text>
            {loading ? (
              <ActivityIndicator />
            ) : statusMessage ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Updated</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardCopy}>
            We&apos;ll call `project.all` with your stored PAT.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading ? styles.primaryButtonDisabled : null,
              ]}
              onPress={handleFetchProjects}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Fetch projects</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </TouchableOpacity>
            <Button
              variant="outline"
              size="default"
              onPress={() => setDialogOpen(true)}
            >
              Login
            </Button>
          </View>
          {statusMessage ? (
            <Text style={styles.statusText}>{statusMessage}</Text>
          ) : null}
        </View>
      </View>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome back</DialogTitle>
            <DialogDescription>
              Use the dashboard buttons to fetch projects or manage your
              session.
            </DialogDescription>
          </DialogHeader>
          <View style={styles.dialogBody}>
            <Text style={styles.dialogCopy}>
              This dialog is triggered from the Login button. Replace this copy
              with any quick actions or guidance you need.
            </Text>
          </View>
          <DialogFooter>
            <Button variant="secondary" onPress={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(6),
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
  },
  hero: {
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(5),
    width: "100%",
    maxWidth: 520,
  },
  kicker: {
    fontSize: theme.font.base,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.colors.primary,
    fontFamily: theme.families.inter,
    fontWeight: "700",
  },
  title: {
    fontSize: theme.font.xl4,
    fontFamily: theme.families.inter,
    color: theme.colors.text,
    fontWeight: theme.font.semiBold,
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: theme.font.base,
    fontFamily: theme.families.mono,
    lineHeight: theme.font.base * 1.5,
    maxWidth: 420,
  },
  cardWrapper: {
    gap: theme.spacing(2),
    width: "100%",
    maxWidth: 520,
  },
  card: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(4),
    gap: theme.spacing(2.5),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontFamily: theme.families.inter,
    fontWeight: "700",
    fontSize: theme.font.lg,
    color: theme.colors.text,
  },
  cardCopy: {
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
    fontSize: theme.font.base,
    lineHeight: theme.font.base * 1.4,
  },
  badge: {
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(0.75),
    backgroundColor: theme.colors.mutedSurface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    color: theme.colors.muted,
    fontSize: theme.font.xs,
    fontFamily: theme.families.inter,
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2.75),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.radius.lg,
    flex: 1,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.families.inter,
    fontWeight: "700",
    fontSize: theme.font.md,
  },
  secondaryButton: {
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontFamily: theme.families.inter,
    fontWeight: "600",
    fontSize: theme.font.md,
  },
  statusText: {
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
    fontSize: theme.font.sm,
  },
  showcaseCard: {
    gap: theme.spacing(1.5),
  },
  sectionLabel: {
    fontFamily: theme.families.inter,
    fontSize: theme.font.sm,
    fontWeight: "700",
    color: theme.colors.muted,
    letterSpacing: 0.5,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  buttonCell: {
    flexBasis: "48%",
    flexGrow: 1,
  },
  dialogBody: {
    paddingHorizontal: theme.size[24],
    paddingBottom: theme.size[24],
  },
  dialogCopy: {
    color: theme.colors.text,
    fontFamily: theme.families.inter,
    fontSize: theme.font.base,
    lineHeight: theme.font.base * 1.5,
  },
}));
