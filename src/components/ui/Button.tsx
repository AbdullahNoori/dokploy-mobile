import {
  createAnimatedPressable,
  type CustomPressableProps,
  type PressableChildrenCallbackParams,
} from "pressto";
import * as React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { interpolate } from "react-native-reanimated";
import { type UnistylesVariants } from "react-native-unistyles";

import { StyleSheet } from "@/src/styles/unistyles";

type ButtonVariants = UnistylesVariants<typeof styles>;
type VariantName = ButtonVariants extends { variant?: infer V } ? V : never;
type SizeName = ButtonVariants extends { size?: infer S } ? S : never;
type SelectedState = ButtonVariants extends { selected?: infer S } ? S : never;

export type ButtonProps = Omit<CustomPressableProps, "style" | "children"> & {
  variant?: VariantName | "default";
  size?: SizeName | "default";
  selected?: SelectedState | boolean;
  style?: StyleProp<ViewStyle>;
  asChild?: boolean;
  children?:
    | React.ReactNode
    | ((state: PressableChildrenCallbackParams) => React.ReactNode);
};

const AnimatedButtonPressable = createAnimatedPressable(
  (progress, { config }) => {
    "worklet";

    return {
      transform: [
        {
          scale: interpolate(
            progress,
            [0, 1],
            [config?.baseScale ?? 1, config?.minScale ?? 0.97]
          ),
        },
      ],
      opacity: interpolate(
        progress,
        [0, 1],
        [1, config?.activeOpacity ?? 0.85]
      ),
    };
  }
);

const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = "default",
      size = "default",
      selected = false,
      asChild = false,
      children,
      style,
      ...pressableProps
    },
    ref
  ) => {
    const resolvedVariant = variant === "default" ? undefined : variant;
    const resolvedSize = size === "default" ? undefined : size;
    const resolvedSelected =
      typeof selected === "boolean" ? selected : selected === "true";

    styles.useVariants({
      variant: resolvedVariant,
      size: resolvedSize,
      selected: resolvedSelected,
    });

    const renderContent = React.useCallback(
      (state: PressableChildrenCallbackParams) => {
        if (typeof children === "string") {
          return <Text style={styles.label}>{children}</Text>;
        }

        if (typeof children === "function") {
          return children(state);
        }

        if (asChild && React.isValidElement(children)) {
          return children;
        }

        return children;
      },
      [asChild, children]
    );

    return (
      <AnimatedButtonPressable
        {...pressableProps}
        style={[styles.pressable, style]}
      >
        {(state) => (
          <View ref={ref} style={styles.content}>
            {renderContent(state)}
          </View>
        )}
      </AnimatedButtonPressable>
    );
  }
);

Button.displayName = "Button";

const styles = StyleSheet.create((theme) => ({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    borderWidth: 0,
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        destructive: {
          backgroundColor: theme.colors.destructive,
          borderColor: theme.colors.destructive,
        },
        outline: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderWidth: 2,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
          borderColor: theme.colors.secondary,
        },
        ghost: {
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
        link: {
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
        selection: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderWidth: 2,
        },
      },
      size: {
        default: {
          height: theme.spacing(12),
          paddingHorizontal: theme.spacing(4),
        },
        sm: {
          height: theme.spacing(10),
          paddingHorizontal: theme.spacing(3),
        },
        lg: {
          height: theme.spacing(14),
          paddingHorizontal: theme.spacing(6),
        },
        icon: {
          height: theme.spacing(12),
          width: theme.spacing(12),
        },
      },
      selected: {
        true: {},
        false: {},
      },
    },
    compoundVariants: [
      {
        variant: "selection",
        selected: true,
        styles: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primary,
        },
      },
      {
        variant: "outline",
        selected: true,
        styles: {
          borderColor: theme.colors.primary,
        },
      },
    ],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: theme.spacing(2),
  },
  label: {
    color: theme.colors.primaryForeground,
    fontWeight: "600",
    variants: {
      variant: {
        default: { color: theme.colors.primaryForeground },
        destructive: { color: theme.colors.destructiveForeground },
        outline: { color: theme.colors.foreground },
        secondary: { color: theme.colors.secondaryForeground },
        ghost: { color: theme.colors.foreground },
        link: {
          color: theme.colors.primary,
          textDecorationLine: "underline",
        },
        selection: { color: theme.colors.foreground },
      },
      selected: {
        true: {},
        false: {},
      },
    },
    compoundVariants: [
      {
        variant: "selection",
        selected: true,
        styles: { color: theme.colors.primary },
      },
    ],
  },
}));

export { Button };
