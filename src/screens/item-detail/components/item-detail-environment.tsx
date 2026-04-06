import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { toast } from 'sonner-native';
import { useUniwind } from 'uniwind';

import { applicationSaveEnvironment } from '@/api/application';
import { mariadbSaveEnvironment } from '@/api/mariadb';
import { mongoSaveEnvironment } from '@/api/mongo';
import { mysqlSaveEnvironment } from '@/api/mysql';
import { postgresSaveEnvironment } from '@/api/postgres';
import { redisSaveEnvironment } from '@/api/redis';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { HttpError } from '@/lib/http-error';
import { THEME } from '@/lib/theme';
import { cn, isErrorResponse } from '@/lib/utils';
import type { ApplicationOneResponseBody } from '@/types/application';
import type { ComposeOneResponseBody } from '@/types/compose';
import type { MariadbOneResponseBody } from '@/types/mariadb';
import type { MongoOneResponseBody } from '@/types/mongo';
import type { MysqlOneResponseBody } from '@/types/mysql';
import type { PostgresOneResponseBody } from '@/types/postgres';
import type { ProjectItemType } from '@/types/projects';
import type { RedisOneResponseBody } from '@/types/redis';

import { ItemDetailEmptyState } from './item-detail-empty';

type EnvironmentItem =
  | ApplicationOneResponseBody
  | RedisOneResponseBody
  | PostgresOneResponseBody
  | MysqlOneResponseBody
  | MongoOneResponseBody
  | MariadbOneResponseBody
  | ComposeOneResponseBody;

type Props = {
  itemType: ProjectItemType;
  data: EnvironmentItem | null;
  onRefresh: () => Promise<void>;
};

const normalizeEnvText = (value: string) => value.replace(/\r\n?/g, '\n');

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.message ?? fallback;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export function ItemDetailEnvironment({ itemType, data, onRefresh }: Props) {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const envTintColor = THEME[resolvedTheme].chart2;
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [draft, setDraft] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [editorHeight, setEditorHeight] = useState(180);
  const [isSaving, setIsSaving] = useState(false);

  const envValue = useMemo(() => {
    if (!data) return '';
    return normalizeEnvText((data as EnvironmentItem).env ?? '');
  }, [data]);

  useEffect(() => {
    setDraft(envValue);
    setLastSaved(envValue);
  }, [envValue]);

  const lineNumbers = useMemo(() => {
    const lines = draft.length ? draft.split('\n') : [''];
    return lines.map((_, index) => index + 1);
  }, [draft]);

  const maxEditorHeight = 320;
  const editorContainerHeight = editorHeight + 16;

  const isCompose = itemType === 'compose';
  const isDirty = draft !== lastSaved;

  const idValue = useMemo(() => {
    if (!data) return null;
    switch (itemType) {
      case 'application':
        return (data as ApplicationOneResponseBody).applicationId ?? null;
      case 'redis':
        return (data as RedisOneResponseBody).redisId ?? null;
      case 'postgres':
        return (data as PostgresOneResponseBody).postgresId ?? null;
      case 'mysql':
        return (data as MysqlOneResponseBody).mysqlId ?? null;
      case 'mongo':
        return (data as MongoOneResponseBody).mongoId ?? null;
      case 'mariadb':
        return (data as MariadbOneResponseBody).mariadbId ?? null;
      default:
        return null;
    }
  }, [data, itemType]);

  const canSave = Boolean(idValue) && !isCompose;

  const handleReset = useCallback(() => {
    setDraft(lastSaved);
  }, [lastSaved]);

  const handleSave = useCallback(async () => {
    if (!canSave || !isDirty || isSaving) return;
    setIsSaving(true);
    try {
      let result: unknown = null;
      switch (itemType) {
        case 'application': {
          const appData = data as ApplicationOneResponseBody;
          result = await applicationSaveEnvironment({
            applicationId: idValue as string,
            env: draft,
            buildArgs: (appData as any).buildArgs ?? null,
            buildSecrets: (appData as any).buildSecrets ?? null,
            createEnvFile: (appData as any).createEnvFile ?? false,
          });
          break;
        }
        case 'redis':
          result = await redisSaveEnvironment({
            redisId: idValue as string,
            env: draft,
          });
          break;
        case 'postgres':
          result = await postgresSaveEnvironment({
            postgresId: idValue as string,
            env: draft,
          });
          break;
        case 'mysql':
          result = await mysqlSaveEnvironment({
            mysqlId: idValue as string,
            env: draft,
          });
          break;
        case 'mongo':
          result = await mongoSaveEnvironment({
            mongoId: idValue as string,
            env: draft,
          });
          break;
        case 'mariadb':
          result = await mariadbSaveEnvironment({
            mariadbId: idValue as string,
            env: draft,
          });
          break;
        default:
          break;
      }

      if (isErrorResponse(result)) {
        toast.error(result.message ?? result.error ?? 'Unable to save environment.');
        return;
      }

      toast.success('Environment saved.');
      setLastSaved(draft);
      await onRefresh();
    } catch (error) {
      toast.error(resolveErrorMessage(error, 'Unable to save environment.'));
    } finally {
      setIsSaving(false);
    }
  }, [canSave, draft, idValue, isDirty, isSaving, itemType, onRefresh]);

  if (!data) {
    return (
      <View className="mt-4">
        <ItemDetailEmptyState
          title="Environment"
          description="Environment details will appear here once they are available."
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
      className="mt-4">
      <View className="bg-card border-border/80 rounded-2xl border p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold">Environment Settings</Text>
            <Text variant="muted" className="mt-1">
              {isCompose
                ? 'Compose env is read-only for now.'
                : 'Edit and preview environment variables for this service.'}
            </Text>
          </View>
          <View className="bg-muted flex-row rounded-lg p-1">
            {(['edit', 'preview'] as const).map((value) => {
              const isActive = mode === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setMode(value)}
                  className={cn(
                    'rounded-md px-3 py-1.5',
                    isActive ? 'bg-background' : 'opacity-60'
                  )}>
                  <Text
                    className={cn('text-xs font-semibold', !isActive && 'text-muted-foreground')}>
                    {value === 'edit' ? 'Edit' : 'Preview'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          className={cn(
            'border-border/80 mt-4 flex-row overflow-hidden rounded-xl border',
            mode === 'edit' ? 'bg-muted/60' : 'bg-muted/40'
          )}
          style={{ height: editorContainerHeight }}>
          <View
            className="bg-muted/80 border-border/80 w-9 items-end border-r px-2 py-3"
            style={{ height: editorHeight }}>
            {lineNumbers.map((lineNumber) => (
              <Text key={lineNumber} className="text-muted-foreground font-mono text-xs leading-5">
                {lineNumber}
              </Text>
            ))}
          </View>
          <View
            className="flex-1 px-3 py-2"
            style={{ height: editorHeight, opacity: mode === 'preview' ? 0.7 : 1 }}>
            <TextInput
              className="text-foreground font-mono text-sm leading-5"
              multiline
              scrollEnabled
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
              editable={mode === 'edit'}
              placeholder="KEY=value"
              placeholderTextColor={THEME[resolvedTheme].mutedForeground}
              value={draft}
              onChangeText={setDraft}
              onContentSizeChange={(event) => {
                const nextHeight = Math.min(
                  maxEditorHeight,
                  Math.max(180, event.nativeEvent.contentSize.height + 8)
                );
                setEditorHeight(nextHeight);
              }}
              style={{ height: editorHeight, maxHeight: maxEditorHeight, color: envTintColor }}
            />
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Button
            className="flex-1"
            disabled={!canSave || !isDirty || isSaving}
            onPress={handleSave}>
            {isSaving ? (
              <ActivityIndicator size="small" color={THEME[resolvedTheme].primaryForeground} />
            ) : (
              <Text>Save</Text>
            )}
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            disabled={!isDirty || isSaving}
            onPress={handleReset}>
            <Text>Reset</Text>
          </Button>
        </View>
      </View>
      <View className="h-12" />
    </KeyboardAvoidingView>
  );
}
