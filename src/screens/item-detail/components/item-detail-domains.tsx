import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PencilIcon, Plus, ShieldCheckIcon, Trash2Icon } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { useUniwind } from 'uniwind';

import { domainDelete, domainValidate } from '@/api/domain';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { HttpError } from '@/lib/http-error';
import { THEME } from '@/lib/theme';
import { isErrorResponse } from '@/lib/utils';
import type { ApplicationOneDomain, ApplicationOnePort } from '@/types/application';

import { ItemDetailEmptyState } from './item-detail-empty';

type Props = {
  domains: ApplicationOneDomain[];
  isApplication: boolean;
  applicationId?: string;
  itemId: string;
  itemType: string;
  ports: ApplicationOnePort[];
  onRefresh: () => Promise<void>;
};

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

export function ItemDetailDomains({
  domains,
  isApplication,
  applicationId,
  itemId,
  itemType,
  ports,
  onRefresh,
}: Props) {
  const router = useRouter();
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<'validate' | 'delete' | null>(null);
  const { impact, notifyError, notifySuccess } = useHaptics();

  const isBusy = activeDomainId !== null;
  const secondarySpinner = THEME[resolvedTheme].secondaryForeground;

  const defaultPort = useMemo(() => {
    return ports[0]?.targetPort;
  }, [ports]);

  const handleValidate = useCallback(
    async (domain: ApplicationOneDomain) => {
      if (isBusy) return;
      await impact();
      setActiveDomainId(domain.domainId);
      setActiveAction('validate');
      try {
        const result = await domainValidate({ domain: domain.host });
        if (isErrorResponse(result)) {
          await notifyError();
          toast.error(result.message ?? result.error ?? 'Unable to validate DNS.');
          return;
        }
        await notifySuccess();
        toast.success('DNS validated.');
      } catch (error) {
        await notifyError();
        toast.error(resolveErrorMessage(error, 'Unable to validate DNS.'));
      } finally {
        setActiveDomainId(null);
        setActiveAction(null);
      }
    },
    [impact, isBusy, notifyError, notifySuccess]
  );

  const handleDelete = useCallback(
    async (domain: ApplicationOneDomain) => {
      if (isBusy) return;
      await impact();
      setActiveDomainId(domain.domainId);
      setActiveAction('delete');
      try {
        const result = await domainDelete({ domainId: domain.domainId });
        if (isErrorResponse(result)) {
          await notifyError();
          toast.error(result.message ?? result.error ?? 'Unable to delete domain.');
          return;
        }
        await notifySuccess();
        toast.success('Domain deleted.');
        await onRefresh();
      } catch (error) {
        await notifyError();
        toast.error(resolveErrorMessage(error, 'Unable to delete domain.'));
      } finally {
        setActiveDomainId(null);
        setActiveAction(null);
      }
    },
    [impact, isBusy, notifyError, notifySuccess, onRefresh]
  );

  const openCreateDomain = useCallback(async () => {
    await impact();
    router.push({
      pathname: '/(app)/modals/project-domain-new',
      params: {
        itemId,
        itemType,
        applicationId,
        defaultPort: defaultPort ? String(defaultPort) : '',
      },
    });
  }, [applicationId, defaultPort, impact, itemId, itemType, router]);

  const openEditDomain = useCallback(
    async (domain: ApplicationOneDomain) => {
      await impact();
      router.push({
        pathname: '/(app)/modals/project-domain-new',
        params: {
          itemId,
          itemType,
          applicationId,
          defaultPort: defaultPort ? String(defaultPort) : '',
          mode: 'edit',
          domainId: domain.domainId,
          host: domain.host,
          path: domain.path ?? '/',
          internalPath: domain.internalPath ?? '/',
          stripPath: String(domain.stripPath),
          https: String(domain.https),
          port: domain.port ? String(domain.port) : '',
          certificateType: domain.certificateType,
          domainType: domain.domainType ?? '',
        },
      });
    },
    [applicationId, defaultPort, impact, itemId, itemType, router]
  );

  if (!isApplication) {
    return (
      <View className="mt-4">
        <ItemDetailEmptyState
          title="Domains"
          description="Domains are only available for applications."
        />
      </View>
    );
  }

  return (
    <View className="mt-4 gap-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold">Domains</Text>
          <Text variant="muted">Domains are used to access the application.</Text>
        </View>
        <Button
          size="sm"
          className="gap-2"
          onPress={() => {
            void openCreateDomain();
          }}>
          <Icon as={Plus} className="text-primary-foreground size-4" />
        </Button>
      </View>

      {domains.length === 0 ? (
        <ItemDetailEmptyState
          title="No domains yet"
          description="Add your first domain to expose this app."
        />
      ) : (
        <View className="gap-3">
          {domains.map((domain) => (
            <View key={domain.domainId} className="bg-card border-border/80 rounded-2xl border p-4">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-base font-semibold">{domain.host}</Text>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 px-2.5"
                  disabled={isBusy}
                  onPress={() => {
                    void openEditDomain(domain);
                  }}>
                  <Icon as={PencilIcon} className="text-secondary-foreground size-3.5" />
                  {/* <Text className="text-xs">Edit</Text> */}
                </Button>
              </View>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <View className="bg-muted rounded-full px-2 py-0.5">
                  <Text className="text-xs">Path: {domain.path ?? '/'}</Text>
                </View>
                <View className="bg-muted rounded-full px-2 py-0.5">
                  <Text className="text-xs">Port: {domain.port ?? '—'}</Text>
                </View>
                <View className="bg-muted rounded-full px-2 py-0.5">
                  <Text className="text-xs">{domain.https ? 'HTTPS' : 'HTTP'}</Text>
                </View>
                {domain.https ? (
                  <View className="bg-muted rounded-full px-2 py-0.5">
                    <Text className="text-xs">Cert: {domain.certificateType}</Text>
                  </View>
                ) : null}
              </View>
              <View className="mt-4 flex-row items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 gap-2"
                  disabled={isBusy}
                  onPress={() => handleValidate(domain)}>
                  {activeDomainId === domain.domainId && activeAction === 'validate' ? (
                    <View className="w-4 items-center">
                      <ActivityIndicator size="small" color={secondarySpinner} />
                    </View>
                  ) : (
                    <View className="w-4 items-center">
                      <Icon as={ShieldCheckIcon} className="text-secondary-foreground size-4" />
                    </View>
                  )}
                  <Text className="text-xs">Validate DNS</Text>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-2"
                  disabled={isBusy}
                  onPress={() => handleDelete(domain)}>
                  <Icon as={Trash2Icon} className="size-4 text-white" />
                  <Text className="text-xs">
                    {activeDomainId === domain.domainId && activeAction === 'delete'
                      ? 'Deleting...'
                      : 'Delete'}
                  </Text>
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
