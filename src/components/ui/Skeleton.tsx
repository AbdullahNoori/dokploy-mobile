import { useEffect, useMemo, useRef } from "react";
import { Animated, type ViewProps } from "react-native";

import { StyleSheet } from "@/src/styles/unistyles";

type SkeletonProps = ViewProps & {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  radius?: number;
  pulse?: boolean;
};

const Skeleton = ({
  width = "100%" as `${number}%`,
  height,
  radius,
  pulse = true,
  style,
  ...props
}: SkeletonProps) => {
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse, pulseValue]);

  const animatedStyle = useMemo(
    () => ({
      opacity: pulse
        ? pulseValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          })
        : 1,
    }),
    [pulse, pulseValue]
  );

  const dynamicStyle = useMemo(
    () => ({
      width,
      height: height ?? styles.defaults.height,
      borderRadius: radius ?? styles.defaults.borderRadius,
    }),
    [width, height, radius]
  ) as {
    width: number | `${number}%`;
    height: number | `${number}%`;
    borderRadius: number;
  };

  return (
    <Animated.View
      style={[styles.base, dynamicStyle, animatedStyle, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    backgroundColor: theme.colors.mutedSurface,
    overflow: "hidden",
  },
  defaults: {
    height: theme.size[16],
    borderRadius: theme.radius.md,
  },
}));

export { Skeleton };
