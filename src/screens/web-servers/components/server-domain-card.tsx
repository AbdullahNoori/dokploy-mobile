import { View } from 'react-native';
import { GlobeIcon } from 'lucide-react-native';
import { SettingsAssignDomainServerCertificateType } from 'dokploy-sdk/models/operations';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import type { WebServerCertificateType, WebServerSettings } from '@/types/web-servers';

import { WebServersErrorState } from './web-servers-error';

const CERTIFICATE_OPTIONS: Array<{
  label: string;
  value: WebServerCertificateType;
}> = [
  { label: 'Let’s Encrypt', value: SettingsAssignDomainServerCertificateType.Letsencrypt },
  { label: 'None', value: SettingsAssignDomainServerCertificateType.None },
];

type Props = {
  status: 'loading' | 'ready' | 'error' | 'unauthorized';
  value: WebServerSettings;
  error: {
    kind: 'error' | 'unauthorized';
    message: string;
  } | null;
  validationMessage: string | null;
  isSaving: boolean;
  canSave: boolean;
  onChangeHost: (value: string) => void;
  onChangeLetsEncryptEmail: (value: string) => void;
  onChangeHttps: (value: boolean) => void;
  onChangeCertificateType: (value: WebServerCertificateType) => void;
  onRetry: () => void;
  onSave: () => void;
};

export function ServerDomainCard({
  status,
  value,
  error,
  validationMessage,
  isSaving,
  canSave,
  onChangeHost,
  onChangeLetsEncryptEmail,
  onChangeHttps,
  onChangeCertificateType,
  onRetry,
  onSave,
}: Props) {
  const { selection } = useHaptics();
  const showCertificateProvider =
    value.https || value.certificateType === SettingsAssignDomainServerCertificateType.None;

  const handleHttpsChange = (nextValue: boolean) => {
    void selection();
    onChangeHttps(nextValue);
  };

  const handleCertificateTypeChange = (nextValue: WebServerCertificateType) => {
    void selection();
    onChangeCertificateType(nextValue);
  };

  return (
    <View className="bg-card border-border/80 overflow-hidden rounded-3xl border">
      <View className="border-border/70 flex-row items-start gap-3 border-b px-4 py-4">
        <View className="mt-0.5 size-10 items-center justify-center rounded-2xl bg-transparent">
          <Icon as={GlobeIcon} className="size-5" />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="h3" className="text-2xl">
            Server Domain
          </Text>
          <Text variant="muted">
            Add or update the public domain and certificate behavior for your Dokploy server.
          </Text>
        </View>
      </View>

      {status === 'loading' ? (
        <View className="gap-4 p-4">
          <View className="gap-3">
            <Skeleton className="h-14 rounded-2xl" />
            <Skeleton className="h-14 rounded-2xl" />
          </View>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <View className="items-end">
            <Skeleton className="h-12 w-24 rounded-2xl" />
          </View>
        </View>
      ) : status === 'error' || status === 'unauthorized' ? (
        <View className="p-4">
          <WebServersErrorState
            kind={error?.kind}
            message={error?.message ?? 'Unable to load settings.'}
            onAction={onRetry}
          />
        </View>
      ) : (
        <View className="gap-4 p-4">
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold">Domain</Text>
              <Input
                placeholder="deployment.example.com"
                value={value.host}
                onChangeText={onChangeHost}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold">Let’s Encrypt Email</Text>
              <Input
                placeholder="ops@example.com"
                value={value.letsEncryptEmail}
                onChangeText={onChangeLetsEncryptEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="bg-background border-border/70 flex-row items-center justify-between rounded-2xl border p-4">
            <View className="flex-1 pr-4">
              <Text className="font-semibold">HTTPS</Text>
              <Text variant="muted" className="text-xs">
                Automatically provision SSL certificate when the domain is active.
              </Text>
            </View>
            <Switch
              checked={value.https}
              onCheckedChange={handleHttpsChange}
              accessibilityLabel="HTTPS"
            />
          </View>

          {showCertificateProvider ? (
            <View className="gap-2">
              <Text className="text-sm font-semibold">Certificate Provider</Text>
              <View className="flex-row flex-wrap gap-2">
                {CERTIFICATE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={value.certificateType === option.value ? 'default' : 'outline'}
                    onPress={() => handleCertificateTypeChange(option.value)}
                    className="px-4">
                    <Text>{option.label}</Text>
                  </Button>
                ))}
              </View>
            </View>
          ) : null}

          {validationMessage ? (
            <Text className="text-destructive text-sm">{validationMessage}</Text>
          ) : null}

          <View className="items-end">
            <Button disabled={!canSave} onPress={onSave} className="min-w-24">
              <Text>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
