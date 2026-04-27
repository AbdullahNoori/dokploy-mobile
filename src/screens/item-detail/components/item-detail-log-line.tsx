import { memo } from 'react';
import { View } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';

import { Text } from '@/components/ui/text';
import {
  escapeMarkdownLine,
  getTonePresentation,
  parseLogRow,
  SEVERITY_PILL_WIDTH,
  TIMESTAMP_COLUMN_WIDTH,
  type LogPalette,
} from '@/lib/utils';

type Props = {
  line: string;
  palette: LogPalette;
};

export const LogLine = memo(function LogLine({ line, palette }: Props) {
  const row = parseLogRow(line);
  const presentation = getTonePresentation(row.severity, palette);
  const messageColor = presentation.textColor || palette.line;
  const hasTimestamp = Boolean(row.timestampLabel);
  const hasSeverity = Boolean(presentation.label);

  return (
    <View
      className="mx-4 mb-1.5 flex-row items-start gap-3 rounded-md px-0 py-0.5"
      style={{ backgroundColor: presentation.rowBackground }}>
      <View
        className="mt-1 rounded-full"
        style={{ width: 3, minHeight: 20, backgroundColor: presentation.accentBackground }}
      />
      {hasTimestamp ? (
        <Text
          className="pt-0.5 font-mono text-[11px] leading-5"
          style={{ width: TIMESTAMP_COLUMN_WIDTH, color: palette.muted }}>
          {row.timestampLabel}
        </Text>
      ) : null}
      {hasSeverity ? (
        <View
          className="mt-0.5 items-center self-start rounded-full px-2 py-1"
          style={{
            minWidth: SEVERITY_PILL_WIDTH,
            backgroundColor: presentation.pillBackground,
          }}>
          <Text
            className="font-mono text-[10px] tracking-[1.2px] uppercase"
            style={{ color: presentation.textColor }}>
            {presentation.label}
          </Text>
        </View>
      ) : null}
      <View className="flex-1 pt-0.5">
        <EnrichedMarkdownText
          markdown={escapeMarkdownLine(row.message)}
          allowTrailingMargin={false}
          selectable
          containerStyle={{ flex: 1 }}
          markdownStyle={{
            paragraph: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontSize: 12,
              lineHeight: 20,
              marginTop: 0,
              marginBottom: 0,
            },
            strong: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontWeight: 'normal',
            },
            em: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontStyle: 'normal',
            },
            code: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontSize: 12,
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            },
            link: {
              color: messageColor,
              underline: false,
              fontFamily: palette.monoFont,
            },
          }}
        />
      </View>
    </View>
  );
});
