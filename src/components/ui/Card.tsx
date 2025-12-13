import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { StyleSheet } from "@/src/styles/unistyles";

interface CardProps extends ViewProps {
  children: ReactNode;
}

function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

function CardHeader({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

function CardTitle({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.title, style]} {...props}>
      {children}
    </View>
  );
}

function CardDescription({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.description, style]} {...props}>
      {children}
    </View>
  );
}

function CardContent({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

function CardFooter({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.size[16],
    shadowColor: theme.shadows.shadow,
    shadowOpacity: theme.shadows.opacity,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.size[16],
    marginBottom: theme.size[16],
  },
  title: {
    flexShrink: 1,
  },
  description: {},
  content: {},
  footer: {
    marginTop: theme.size[16],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.size[16],
  },
}));

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
