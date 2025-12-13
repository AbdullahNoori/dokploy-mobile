import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive";
type ButtonSize = "default" | "sm" | "lg";
type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  enabled?: boolean;
  animated?: boolean;
};
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.size[8],
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        outline: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
          borderColor: theme.colors.mutedSurface,
        },
        ghost: {
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
        destructive: {
          backgroundColor: theme.colors.danger,
          borderColor: theme.colors.danger,
        },
      },
      size: {
        sm: {
          height: theme.size[36],
          paddingHorizontal: theme.size[12],
        },
        default: {
          height: theme.size[44],
          paddingHorizontal: theme.size[16],
        },
        lg: {
          height: theme.size[56],
          paddingHorizontal: theme.size[20],
        },
      },
    },
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    fontFamily: theme.families.inter,
    fontWeight: theme.font.semiBold,
    textAlign: "center",
    variants: {
      size: {
        sm: {
          fontSize: theme.font.sm,
        },
        default: {
          fontSize: theme.font.base,
        },
        lg: {
          fontSize: theme.font.lg,
        },
      },
      variant: {
        default: {
          color: theme.colors.primaryForeground,
        },
        outline: {
          color: theme.colors.text,
        },
        secondary: {
          color: theme.colors.text,
        },
        ghost: {
          color: theme.colors.text,
        },
        destructive: {
          color: theme.colors.destructiveForeground,
        },
      },
    },
  },
}));

export function Button({
  label,
  loading = false,
  size = "default",
  variant = "default",
  hitSlop = 10,
  fullWidth = false,
  disabled,
  enabled = true,
  animated = true,
  style,
  children,
  labelStyle,
  ...rest
}: ButtonProps) {
  const { onPressIn, onPressOut, ...pressableProps } = rest;
  const { theme } = useUnistyles();
  const pressed = useSharedValue(0);
  const hasChildren = children !== undefined && children !== null;

  if (!label && !hasChildren && !loading) {
    throw new Error("Button requires a label or children");
  }

  const resolvedVariant = variant === "default" ? undefined : variant;
  const resolvedSize = size === "default" ? undefined : size;

  styles.useVariants({ variant: resolvedVariant, size: resolvedSize });

  const resolvedLabelStyle = StyleSheet.flatten<TextStyle>([
    styles.label,
    labelStyle,
  ]);

  const indicatorColor =
    typeof resolvedLabelStyle?.color === "string" ||
    typeof resolvedLabelStyle?.color === "number"
      ? resolvedLabelStyle.color
      : variant === "default" || variant === "destructive"
      ? theme.colors.primaryForeground
      : theme.colors.text;

  const isDisabled = (disabled ?? !enabled) || loading;

  const pressableStyles = [
    styles.button,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.97]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.9]);

    return {
      transform: [{ scale }],
      opacity,
    };
  }, []);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={indicatorColor} />;
    }

    if (hasChildren) {
      if (typeof children === "string" || typeof children === "number") {
        return <Text style={[styles.label, labelStyle]}>{children}</Text>;
      }

      return children;
    }

    return <Text style={[styles.label, labelStyle]}>{label}</Text>;
  };

  const handlePressIn: PressableProps["onPressIn"] = (event) => {
    if (!isDisabled) {
      pressed.value = withTiming(1, { duration: 120 });
    }
    onPressIn?.(event);
  };

  const handlePressOut: PressableProps["onPressOut"] = (event) => {
    if (!isDisabled) {
      pressed.value = withTiming(0, { duration: 120 });
    }
    onPressOut?.(event);
  };

  if (!animated) {
    return (
      <Pressable
        hitSlop={hitSlop}
        accessibilityRole="button"
        disabled={isDisabled}
        style={pressableStyles}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        {...pressableProps}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      hitSlop={hitSlop}
      accessibilityRole="button"
      disabled={isDisabled}
      style={[...pressableStyles, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...pressableProps}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}
