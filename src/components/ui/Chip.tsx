import React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { SvgProps } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { Text } from "./Text";

type ChipProps = Omit<PressableProps, "style"> & {
  label: string;
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
  icon?: React.ComponentType<Partial<Omit<SvgProps, "children">>>;
};

const Chip = ({
  label,
  isActive = false,
  style,
  color,
  icon: Icon,
  ...pressableProps
}: ChipProps) => {
  const { theme } = useUnistyles();

  const resolvedColor =
    color ?? (isActive ? theme.colors.primary : theme.colors.border);
  const resolvedBackground = isActive
    ? theme.colors.mutedSurface
    : theme.colors.surface;
  const iconColor = isActive ? theme.colors.primary : resolvedColor;

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: theme.colors.overlay }}
      style={[
        styles.container,
        {
          borderColor: resolvedColor,
          backgroundColor: resolvedBackground,
        },
        style,
      ]}
      {...pressableProps}
    >
      {Icon ? (
        <Icon
          width={theme.size[20]}
          height={theme.size[20]}
          color={iconColor}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          isActive
            ? {
                color: theme.colors.primary,
                fontWeight: theme.font.semiBold,
              }
            : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: theme.size[32],
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.size[12],
    columnGap: theme.size[6],
    borderWidth: 1,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.families.inter,
    fontSize: theme.font.sm,
  },
}));

export { Chip };
