import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { Building2Icon, CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import { useUniwind } from 'uniwind';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { THEME } from '@/lib/theme';
import { useAuthStore } from '@/store/auth-store';

export default function ChangeOrganizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const switchOrganization = useAuthStore((state) => state.switchOrganization);
  const removeOrganization = useAuthStore((state) => state.removeOrganization);
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);
  const [removingOrganizationId, setRemovingOrganizationId] = useState<string | null>(null);
  const { notifyError, notifySuccess, notifyWarning, selection } = useHaptics();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

  const handleOpenAddOrganization = useCallback(() => {
    void selection();
    router.push('/(app)/modals/organization-new');
  }, [router, selection]);

  const handleSwitchOrganization = useCallback(
    async (organizationId: string, organizationName: string) => {
      await selection();

      if (organizationId === activeOrganizationId || switchingOrganizationId) {
        return;
      }

      setSwitchingOrganizationId(organizationId);

      try {
        await switchOrganization(organizationId);
        await notifySuccess();
        toast.success(`Switched to ${organizationName}.`);
      } catch {
        await notifyError();
        toast.error('Unable to switch organization. Try again.');
      } finally {
        setSwitchingOrganizationId(null);
      }
    },
    [
      activeOrganizationId,
      notifyError,
      notifySuccess,
      selection,
      switchOrganization,
      switchingOrganizationId,
    ]
  );

  const handleRemoveOrganization = useCallback(
    async (organizationId: string) => {
      if (removingOrganizationId) {
        return;
      }

      setRemovingOrganizationId(organizationId);

      try {
        await removeOrganization(organizationId);
        await notifySuccess();
        toast.success('Organization removed.');
      } catch {
        await notifyError();
        toast.error('Unable to remove organization right now.');
      } finally {
        setRemovingOrganizationId(null);
      }
    },
    [notifyError, notifySuccess, removeOrganization, removingOrganizationId]
  );

  const confirmRemoveOrganization = useCallback(
    (organizationId: string, name: string) => {
      void notifyWarning();
      Alert.alert('Remove Organization', `Remove ${name} and its saved token from this device?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void handleRemoveOrganization(organizationId);
          },
        },
      ]);
    },
    [handleRemoveOrganization, notifyWarning]
  );

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Organizations',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => (
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel="Add organization"
              className="h-10 w-10 rounded-full shadow-none"
              onPress={handleOpenAddOrganization}>
              <Icon as={PlusIcon} className="size-5" />
            </Button>
          ),
        }}
      />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
          scrollIndicatorInsets={{ bottom: Math.max(insets.bottom, 24) }}
          showsVerticalScrollIndicator={false}>
          <View className="gap-2">
            {organizations.map((organization) => {
              const isActive = organization.id === activeOrganizationId;
              const isSwitching = switchingOrganizationId === organization.id;
              const isRemoving = removingOrganizationId === organization.id;

              return (
                <View
                  key={organization.id}
                  className="bg-card border-border/80 flex-row items-center gap-3 rounded-lg border px-3 py-3">
                  <Pressable
                    onPress={() => {
                      void handleSwitchOrganization(organization.id, organization.name);
                    }}
                    disabled={isActive || Boolean(switchingOrganizationId)}
                    accessibilityRole="button"
                    accessibilityLabel={`${organization.name}${
                      isActive ? ', current organization' : ''
                    }`}
                    accessibilityState={{ selected: isActive, busy: isSwitching }}
                    className="min-w-0 flex-1 flex-row items-center gap-3">
                    <View className="bg-secondary size-9 items-center justify-center rounded-lg">
                      {isSwitching ? (
                        <ActivityIndicator size="small" color={THEME[resolvedTheme].primary} />
                      ) : isActive ? (
                        <Icon as={CheckIcon} className="text-primary size-4" />
                      ) : (
                        <Icon as={Building2Icon} className="text-muted-foreground size-4" />
                      )}
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="font-semibold" numberOfLines={1}>
                        {organization.name}
                      </Text>
                      <Text variant="muted" className="mt-0.5">
                        {isActive
                          ? 'Current organization'
                          : organization.hasOwnerAccess
                            ? 'Owner access'
                            : 'Limited access'}
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => confirmRemoveOrganization(organization.id, organization.name)}
                    disabled={isRemoving}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${organization.name}`}
                    hitSlop={8}
                    className="active:bg-destructive/10 size-10 items-center justify-center rounded-lg">
                    {isRemoving ? (
                      <ActivityIndicator size="small" color={THEME[resolvedTheme].destructive} />
                    ) : (
                      <Icon as={Trash2Icon} className="text-destructive size-4" />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
