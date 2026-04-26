import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Text as RNText,
  View,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputScrollEventData,
  type TextStyle,
} from 'react-native';

import { THEME } from '@/lib/theme';

type TokenType =
  | 'comment'
  | 'key'
  | 'equals'
  | 'value_string'
  | 'value_number'
  | 'value_boolean'
  | 'value_empty'
  | 'plain';

type Token = {
  type: TokenType;
  text: string;
};

type Props = {
  content: string;
  height: number;
  themeName: 'light' | 'dark';
  scrollOffset?: number;
};

type HighlightedInputProps = Props & {
  onChangeText: (value: string) => void;
  onContentSizeChange: (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void;
  placeholder: string;
  placeholderTextColor: string;
};

type Palette = {
  lineNumber: string;
  comment: string;
  key: string;
  equals: string;
  valueString: string;
  valueNumber: string;
  valueBoolean: string;
  valueEmpty: string;
  plain: string;
};

const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

function tokenizeEnvLine(line: string): Token[] {
  if (line.trim() === '') {
    return [{ type: 'plain', text: '' }];
  }

  if (line.trimStart().startsWith('#')) {
    return [{ type: 'comment', text: line }];
  }

  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)(=)(.*)$/);
  if (!match) {
    return [{ type: 'plain', text: line }];
  }

  const [, key, equals, rawValue] = match;
  const tokens: Token[] = [
    { type: 'key', text: key },
    { type: 'equals', text: equals },
  ];

  if (rawValue === '') {
    tokens.push({ type: 'value_empty', text: '' });
    return tokens;
  }

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    tokens.push({ type: 'value_string', text: rawValue });
    return tokens;
  }

  if (/^(true|false|yes|no)$/i.test(rawValue)) {
    tokens.push({ type: 'value_boolean', text: rawValue });
    return tokens;
  }

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    tokens.push({ type: 'value_number', text: rawValue });
    return tokens;
  }

  tokens.push({ type: 'value_string', text: rawValue });
  return tokens;
}

function buildPalette(themeName: 'light' | 'dark'): Palette {
  const theme = THEME[themeName];

  return {
    lineNumber: theme.mutedForeground,
    comment: theme.mutedForeground,
    key: theme.chart2,
    equals: theme.mutedForeground,
    valueString: theme.foreground,
    valueNumber: theme.chart5,
    valueBoolean: theme.chart4,
    valueEmpty: theme.mutedForeground,
    plain: theme.foreground,
  };
}

function getTokenStyle(type: TokenType, palette: Palette): TextStyle {
  switch (type) {
    case 'comment':
      return { color: palette.comment, fontStyle: 'italic' };
    case 'key':
      return { color: palette.key };
    case 'equals':
      return { color: palette.equals };
    case 'value_string':
      return { color: palette.valueString };
    case 'value_number':
      return { color: palette.valueNumber };
    case 'value_boolean':
      return { color: palette.valueBoolean };
    case 'value_empty':
      return { color: palette.valueEmpty };
    default:
      return { color: palette.plain };
  }
}

const EnvLine = memo(function EnvLine({
  line,
  lineNumber,
  palette,
}: {
  line: string;
  lineNumber: number;
  palette: Palette;
}) {
  const tokens = useMemo(() => tokenizeEnvLine(line), [line]);

  return (
    <View style={styles.lineRow}>
      <RNText selectable={false} style={[styles.lineNumber, { color: palette.lineNumber }]}>
        {lineNumber}
      </RNText>
      <RNText selectable style={styles.lineContent}>
        {tokens.map((token, index) => (
          <RNText key={`${index}-${token.type}`} style={getTokenStyle(token.type, palette)}>
            {token.text}
          </RNText>
        ))}
      </RNText>
    </View>
  );
});

export const EnvHighlighter = memo(function EnvHighlighter({
  content,
  height,
  scrollOffset = 0,
  themeName,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lines = useMemo(() => (content.length ? content.split('\n') : ['']), [content]);
  const palette = useMemo(() => buildPalette(themeName), [themeName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: scrollOffset, animated: false });
  }, [scrollOffset]);

  return (
    <ScrollView
      ref={scrollRef}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={[styles.wrapper, { height }]}
      contentContainerStyle={styles.content}>
      {lines.map((line, index) => (
        <EnvLine key={`${index}-${line}`} line={line} lineNumber={index + 1} palette={palette} />
      ))}
    </ScrollView>
  );
});

export const EnvHighlightedInput = memo(function EnvHighlightedInput({
  content,
  height,
  onChangeText,
  onContentSizeChange,
  placeholder,
  placeholderTextColor,
  themeName,
}: HighlightedInputProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const palette = useMemo(() => buildPalette(themeName), [themeName]);

  return (
    <View style={[styles.wrapper, { height }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <EnvHighlighter
          content={content}
          height={height}
          themeName={themeName}
          scrollOffset={scrollOffset}
        />
      </View>
      <TextInput
        multiline
        scrollEnabled
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
        editable
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        selectionColor={palette.key}
        value={content}
        onChangeText={onChangeText}
        onContentSizeChange={onContentSizeChange}
        onScroll={(event: NativeSyntheticEvent<TextInputScrollEventData>) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        style={[
          styles.inputOverlay,
          {
            color: 'transparent',
            height,
            maxHeight: height,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  lineRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    minHeight: 20,
  },
  lineNumber: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    lineHeight: 20,
    paddingRight: 12,
    textAlign: 'right',
    width: 42,
  },
  lineContent: {
    flex: 1,
    flexWrap: 'wrap',
    fontFamily: MONO_FONT,
    fontSize: 14,
    lineHeight: 20,
  },
  inputOverlay: {
    bottom: 0,
    fontFamily: MONO_FONT,
    fontSize: 14,
    left: 50,
    lineHeight: 20,
    paddingBottom: 12,
    paddingRight: 8,
    paddingTop: 12,
    position: 'absolute',
    right: 8,
    top: 0,
  },
});
