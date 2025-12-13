import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { StyleSheet } from "@/src/styles/unistyles";

type BodyVariant = "body" | "body1" | "body2";
type TitleVariant = "xs" | "sm" | "md" | "lg" | "xl";
type HeadingVariant = "h1" | "h2" | "h3" | "h4";

export type TextProps = RNTextProps & {
  variant?: BodyVariant;
};

export type TitleProps = RNTextProps & {
  variant?: TitleVariant;
};

export type HeadingProps = RNTextProps & {
  variant?: HeadingVariant;
};

const Text = ({ variant = "body", style, ...rest }: TextProps) => {
  styles.useVariants({ bodySize: variant });

  return <RNText style={[styles.text, style]} {...rest} />;
};

const Title = ({ variant = "md", style, ...rest }: TitleProps) => {
  styles.useVariants({ titleSize: variant });

  return <RNText style={[styles.title, style]} {...rest} />;
};

const Heading = ({ variant = "h2", style, ...rest }: HeadingProps) => {
  styles.useVariants({ headingSize: variant });

  return <RNText style={[styles.heading, style]} {...rest} />;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    textAlign: "left",
    color: theme.colors.text,
    fontFamily: theme.families.inter,
    fontSize: theme.font.base,
    variants: {
      bodySize: {
        body: { fontSize: theme.font.base },
        body1: { fontSize: theme.font.sm },
        body2: { fontSize: theme.font.xs },
      },
    },
  },
  title: {
    textAlign: "left",
    color: theme.colors.text,
    fontFamily: theme.families.inter,
    fontWeight: theme.font.medium,
    fontSize: theme.font.md,
    variants: {
      titleSize: {
        xs: { fontSize: theme.font.sm, fontWeight: theme.font.medium },
        sm: { fontSize: theme.font.base, fontWeight: theme.font.medium },
        md: { fontSize: theme.font.md, fontWeight: theme.font.medium },
        lg: { fontSize: theme.font.lg, fontWeight: theme.font.semiBold },
        xl: { fontSize: theme.font.xl, fontWeight: theme.font.semiBold },
      },
    },
  },
  heading: {
    textAlign: "left",
    color: theme.colors.text,
    fontFamily: theme.families.inter,
    fontWeight: theme.font.bold,
    fontSize: theme.font.xl2,
    variants: {
      headingSize: {
        h1: { fontSize: theme.font.xl4, fontWeight: theme.font.bold },
        h2: { fontSize: theme.font.xl3, fontWeight: theme.font.bold },
        h3: { fontSize: theme.font.xl2, fontWeight: theme.font.bold },
        h4: { fontSize: theme.font.xl, fontWeight: theme.font.bold },
      },
    },
  },
}));

export { Heading, Text, Title };
