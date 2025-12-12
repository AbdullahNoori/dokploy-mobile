import React, { JSX } from "react";
import {
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  leftWidget?: JSX.Element;
  rightWidget?: JSX.Element;
  onLeftWidgetPress?: () => void;
  onRightWidgetPress?: () => void;
};

export function Input({
  label,
  error,
  hint,
  style,
  containerStyle,
  wrapperStyle,
  leftWidget,
  rightWidget,
  onLeftWidgetPress,
  onRightWidgetPress,
  multiline,
  ...rest
}: InputProps) {
  const { theme } = useUnistyles();

  return (
    <View style={[stylesheet.container, containerStyle]}>
      {label ? <Text style={stylesheet.label}>{label}</Text> : null}
      <View
        style={[
          stylesheet.textFieldWrapper,
          multiline && stylesheet.textFieldWrapperMultiLine,
          wrapperStyle,
        ]}
      >
        {leftWidget && (
          <Pressable
            onPress={() => onLeftWidgetPress && onLeftWidgetPress()}
            style={[
              stylesheet.leftWidgetWrapper,
              multiline && stylesheet.leftWidgetWrapperMultiLine,
            ]}
          >
            {leftWidget}
          </Pressable>
        )}
        <TextInput
          allowFontScaling={false}
          multiline={multiline}
          style={[
            stylesheet.textField,
            multiline && stylesheet.textFieldMultiline,
            style,
          ]}
          placeholderTextColor={theme.colors.text}
          {...rest}
        />
        {rightWidget && (
          <Pressable
            hitSlop={15}
            onPress={() => onRightWidgetPress && onRightWidgetPress()}
            style={[
              stylesheet.rightWidgetWrapper,
              multiline && stylesheet.rightWidgetWrapperMultiLine,
            ]}
          >
            {rightWidget}
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <View style={stylesheet.messageWrapper}>
          {error ? (
            <Text style={stylesheet.messageError}>{error}</Text>
          ) : (
            <Text style={stylesheet.message}>{hint ?? ""}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const stylesheet = StyleSheet.create(({ colors, size, font, families }) => ({
  container: {},
  label: {
    color: colors.text,
    fontSize: font.base,
    marginBottom: size[8],
  },
  textFieldWrapper: {
    alignItems: "center",
    flexDirection: "row",
    borderRadius: size[8],
    paddingHorizontal: size[14],
    backgroundColor: colors.background,
  },
  textFieldWrapperMultiLine: {
    alignItems: "flex-start",
  },
  leftWidgetWrapper: {
    marginRight: size[8],
  },
  leftWidgetWrapperMultiLine: {
    marginTop: size[14],
  },
  textField: {
    flex: 1,
    // height: size[40],
    fontSize: font.base,
    color: colors.text,
    fontWeight: font.medium,
    textAlign: "left",
    fontFamily: families.inter,
    paddingVertical: size["10"],
  },
  textFieldMultiline: {
    // height: size[128],
    textAlignVertical: "top",
    paddingTop: size[14],
    paddingBottom: size[14],
    maxHeight: size["96"],
  },
  rightWidgetWrapper: {
    marginLeft: size[6],
  },
  rightWidgetWrapperMultiLine: {
    marginTop: size[14],
  },
  messageWrapper: {
    marginTop: size[6],
  },
  message: {
    fontSize: font.sm,
    color: colors.text,
  },
  messageError: {
    fontSize: font.sm,
    color: colors.danger[500],
  },
}));
