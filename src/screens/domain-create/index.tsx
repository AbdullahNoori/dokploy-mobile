import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner-native';

import { domainCreate, domainUpdate } from '@/api/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { HttpError } from '@/lib/http-error';
import { getRequiredActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import { isErrorResponse } from '@/lib/utils';

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

export default function DomainCreateScreen() {
  const {
    applicationId,
    composeId,
    defaultPort,
    mode,
    domainId,
    host: hostParam,
    path: pathParam,
    internalPath: internalPathParam,
    stripPath: stripPathParam,
    https: httpsParam,
    port: portParam,
    certificateType: certificateTypeParam,
    domainType: domainTypeParam,
    serviceName: serviceNameParam,
  } = useLocalSearchParams<{
    applicationId?: string;
    composeId?: string;
    defaultPort?: string;
    mode?: 'edit' | 'create';
    domainId?: string;
    host?: string;
    path?: string;
    internalPath?: string;
    stripPath?: string;
    https?: string;
    port?: string;
    certificateType?: 'letsencrypt' | 'none' | 'custom';
    domainType?: 'compose' | 'application' | 'preview' | '';
    serviceName?: string;
  }>();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const pathInputRef = useRef<TextInput>(null);
  const serviceNameInputRef = useRef<TextInput>(null);
  const internalPathInputRef = useRef<TextInput>(null);
  const portInputRef = useRef<TextInput>(null);

  const isEdit = mode === 'edit' && !!domainId;
  const resolvedDomainType = domainTypeParam || (composeId ? 'compose' : 'application');
  const isComposeDomain = resolvedDomainType === 'compose';

  const [host, setHost] = useState(hostParam ?? '');
  const [serviceName, setServiceName] = useState(serviceNameParam ?? '');
  const [path, setPath] = useState(pathParam ?? '/');
  const [internalPath, setInternalPath] = useState(internalPathParam ?? '/');
  const [stripPath, setStripPath] = useState(stripPathParam === 'true');
  const [https, setHttps] = useState(httpsParam === 'true');
  const [port, setPort] = useState(portParam ?? defaultPort ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { impact, notifyError, notifySuccess, selection } = useHaptics();

  const parsedPort = useMemo(() => {
    if (!port.trim()) return undefined;
    const value = Number(port);
    if (!Number.isFinite(value)) return Number.NaN;
    return value;
  }, [port]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    await impact();

    const trimmedHost = host.trim();
    if (!trimmedHost || !trimmedHost.includes('.')) {
      await notifyError();
      toast.error('Enter a valid host.');
      return;
    }

    const normalizedPath = path.trim();
    const normalizedInternalPath = internalPath.trim();

    if (normalizedPath && !normalizedPath.startsWith('/')) {
      await notifyError();
      toast.error('Path must start with /.');
      return;
    }

    if (normalizedInternalPath && !normalizedInternalPath.startsWith('/')) {
      await notifyError();
      toast.error('Internal path must start with /.');
      return;
    }

    if (
      parsedPort !== undefined &&
      (Number.isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535)
    ) {
      await notifyError();
      toast.error('Port must be between 1 and 65535.');
      return;
    }

    if (isEdit && !domainId) {
      await notifyError();
      toast.error('Missing domain id.');
      return;
    }

    if (resolvedDomainType === 'application' && !applicationId) {
      await notifyError();
      toast.error('Missing application id.');
      return;
    }

    if (resolvedDomainType === 'compose' && !composeId) {
      await notifyError();
      toast.error('Missing compose id.');
      return;
    }

    const normalizedServiceName = serviceName.trim();
    if (resolvedDomainType === 'compose' && !normalizedServiceName) {
      await notifyError();
      toast.error('Enter the compose service name.');
      return;
    }

    const resolvedDomainId = domainId ?? '';

    setIsSubmitting(true);

    try {
      if (isEdit) {
        const result = await domainUpdate({
          domainId: resolvedDomainId,
          host: trimmedHost,
          path: normalizedPath ? normalizedPath : null,
          internalPath: normalizedInternalPath ? normalizedInternalPath : null,
          stripPath,
          port: parsedPort ?? null,
          https,
          certificateType: https ? (certificateTypeParam ?? 'letsencrypt') : 'none',
          domainType: resolvedDomainType,
          serviceName: resolvedDomainType === 'compose' ? normalizedServiceName : null,
        });

        if (isErrorResponse(result)) {
          await notifyError();
          toast.error(result.message ?? result.error ?? 'Unable to update domain.');
          return;
        }

        await notifySuccess();
        toast.success('Domain updated.');
      } else {
        const result = await domainCreate({
          applicationId: resolvedDomainType === 'application' ? (applicationId ?? null) : null,
          composeId: resolvedDomainType === 'compose' ? (composeId ?? null) : null,
          domainType: resolvedDomainType,
          host: trimmedHost,
          path: normalizedPath ? normalizedPath : null,
          internalPath: normalizedInternalPath ? normalizedInternalPath : null,
          stripPath,
          port: parsedPort ?? null,
          https,
          certificateType: https ? 'letsencrypt' : undefined,
          serviceName: resolvedDomainType === 'compose' ? normalizedServiceName : null,
        });

        if (isErrorResponse(result)) {
          await notifyError();
          toast.error(result.message ?? result.error ?? 'Unable to create domain.');
          return;
        }

        await notifySuccess();
        toast.success('Domain created.');
      }

      if (applicationId) {
        await mutate(getRequiredActiveOrganizationSWRKey(['application/one', applicationId]));
        await mutate(
          getRequiredActiveOrganizationSWRKey(['domain/byApplicationId', applicationId])
        );
      }
      if (composeId) {
        await mutate(getRequiredActiveOrganizationSWRKey(['compose/one', composeId]));
        await mutate(getRequiredActiveOrganizationSWRKey(['domain/byComposeId', composeId]));
      }
      router.back();
    } catch (error) {
      await notifyError();
      toast.error(
        resolveErrorMessage(error, isEdit ? 'Unable to update domain.' : 'Unable to create domain.')
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    applicationId,
    certificateTypeParam,
    composeId,
    domainId,
    resolvedDomainType,
    host,
    impact,
    path,
    internalPath,
    stripPath,
    port,
    parsedPort,
    https,
    isSubmitting,
    isEdit,
    mutate,
    notifyError,
    notifySuccess,
    serviceName,
    router,
  ]);

  const handleStripPathChange = useCallback(
    (nextValue: boolean) => {
      void selection();
      setStripPath(nextValue);
    },
    [selection]
  );

  const handleHttpsChange = useCallback(
    (nextValue: boolean) => {
      void selection();
      setHttps(nextValue);
    },
    [selection]
  );

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Domain' : 'Add Domain' }} />
      <ScrollView
        contentContainerClassName="gap-4 px-4 py-4"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="interactive">
        <View className="gap-2">
          <Text className="text-sm font-semibold">Host</Text>
          <Input
            placeholder="api.example.com"
            value={host}
            onChangeText={setHost}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (isComposeDomain) {
                serviceNameInputRef.current?.focus();
                return;
              }
              pathInputRef.current?.focus();
            }}
          />
        </View>

        {isComposeDomain ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold">Service Name</Text>
            <Text variant="muted" className="text-xs">
              Use the service key from the compose file.
            </Text>
            <Input
              ref={serviceNameInputRef}
              placeholder="web"
              value={serviceName}
              onChangeText={setServiceName}
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => pathInputRef.current?.focus()}
            />
          </View>
        ) : null}

        <View className="gap-2">
          <Text className="text-sm font-semibold">Path</Text>
          <Input
            ref={pathInputRef}
            placeholder="/"
            value={path}
            onChangeText={setPath}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => internalPathInputRef.current?.focus()}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold">Internal Path</Text>
          <Text variant="muted" className="text-xs">
            The path your app expects internally (defaults to "/").
          </Text>
          <Input
            ref={internalPathInputRef}
            placeholder="/"
            value={internalPath}
            onChangeText={setInternalPath}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => portInputRef.current?.focus()}
          />
        </View>

        <View className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border p-4">
          <View className="flex-1 pr-4">
            <Text className="text-sm font-semibold">Strip Path</Text>
            <Text variant="muted" className="text-xs">
              Remove the external path before forwarding to the app.
            </Text>
          </View>
          <Switch checked={stripPath} onCheckedChange={handleStripPathChange} />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold">Container Port</Text>
          <Input
            ref={portInputRef}
            placeholder="3000"
            value={port}
            onChangeText={setPort}
            keyboardType="number-pad"
            returnKeyType="done"
            // onSubmitEditing={handleSubmit}
          />
        </View>

        <View className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border p-4">
          <View className="flex-1 pr-4">
            <Text className="text-sm font-semibold">HTTPS</Text>
            <Text variant="muted" className="text-xs">
              Automatically provision SSL via Let’s Encrypt.
            </Text>
          </View>
          <Switch checked={https} onCheckedChange={handleHttpsChange} />
        </View>

        <Button onPress={handleSubmit} disabled={isSubmitting} className="mt-2">
          <Text>
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update' : 'Create'}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
