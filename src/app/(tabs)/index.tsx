import { StyleSheet } from "@/src/styles/unistyles";
import { View } from "react-native";

export default function TabOneScreen() {
  return <View style={styles.screen}></View>;
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
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.muted,
    fontSize: theme.font.base,
    fontFamily: theme.families.inter,
    lineHeight: theme.font.base * 1.5,
    maxWidth: 420,
  },
  cardWrapper: {
    gap: theme.spacing(2),
    width: "100%",
    maxWidth: 520,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.font.sm,
    marginTop: theme.spacing(0.75),
    fontFamily: theme.families.inter,
  },
  toggleSecure: {
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1),
    minHeight: 44,
    justifyContent: "center",
  },
  toggleSecureText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontFamily: theme.families.inter,
  },
  footer: {
    marginTop: theme.spacing(4),
    gap: theme.size[4],
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 520,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  footerText: {
    color: theme.colors.muted,
    fontFamily: theme.families.inter,
    fontSize: theme.font.sm,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: theme.families.inter,
    fontWeight: "700",
    fontSize: theme.font.sm,
  },
}));
