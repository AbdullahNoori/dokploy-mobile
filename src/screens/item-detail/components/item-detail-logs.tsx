import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import { useContainerLogSocket } from '@/hooks/use-container-log-socket';
import { useHaptics } from '@/hooks/use-haptics';
import { createLogPalette, getContainerOptionLabel, getUniqueContainerIds } from '@/lib/utils';

import { LogPanelHeader, LogSourceSelect, LogViewport } from './item-detail-log-panel';
import { TerminalEmpty, TerminalSkeleton } from './item-detail-log-states';

type Props = {
  hasLookupName: boolean;
  containerIds: string[];
  isLookupLoading: boolean;
  lookupError: string | null;
  onRetryLookup: () => void;
};

export function ItemDetailLogs({
  hasLookupName,
  containerIds,
  isLookupLoading,
  lookupError,
  onRetryLookup,
}: Props) {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { impact } = useHaptics();
  const palette = useMemo(() => createLogPalette(resolvedTheme), [resolvedTheme]);
  const availableContainerIds = useMemo(() => getUniqueContainerIds(containerIds), [containerIds]);
  const containerOptions = useMemo(
    () =>
      availableContainerIds.map((containerId, index) => ({
        label: getContainerOptionLabel(containerId, index),
        value: containerId,
      })),
    [availableContainerIds]
  );
  const [selectedContainerId, setSelectedContainerId] = useState<string | undefined>(
    availableContainerIds[0]
  );

  useEffect(() => {
    setSelectedContainerId((currentContainerId) => {
      if (currentContainerId && availableContainerIds.includes(currentContainerId)) {
        return currentContainerId;
      }

      return availableContainerIds[0];
    });
  }, [availableContainerIds]);

  const { lines, isConnecting, error, reconnect, isEmpty } = useContainerLogSocket({
    containerId: selectedContainerId,
    enabled: Boolean(selectedContainerId),
  });

  const handleSelectContainer = useCallback(
    (containerId: string) => {
      if (containerId === selectedContainerId) {
        return;
      }

      setSelectedContainerId(containerId);
    },
    [selectedContainerId]
  );

  const handleReconnect = useCallback(() => {
    void impact();
    reconnect();
  }, [impact, reconnect]);

  if (!hasLookupName) {
    return (
      <TerminalEmpty
        title="Logs unavailable"
        description="This item does not expose a lookup name for container logs yet."
      />
    );
  }

  if (isLookupLoading) {
    return <TerminalSkeleton />;
  }

  if (lookupError) {
    return (
      <TerminalEmpty
        title="Lookup failed"
        description={lookupError}
        actionLabel="Retry lookup"
        onAction={onRetryLookup}
      />
    );
  }

  if (availableContainerIds.length === 0 || !selectedContainerId) {
    return (
      <TerminalEmpty
        title="No containers found"
        description="No matching container IDs were returned for this service."
      />
    );
  }

  const hasMultipleContainers = availableContainerIds.length > 1;
  const headerDetail = hasMultipleContainers
    ? `${availableContainerIds.length} containers available`
    : selectedContainerId;

  return (
    <View
      className="mt-4 overflow-hidden rounded-2xl border"
      style={{ borderColor: palette.border, backgroundColor: palette.surface }}>
      <LogPanelHeader detail={headerDetail} palette={palette} />

      {hasMultipleContainers ? (
        <LogSourceSelect
          value={selectedContainerId}
          options={containerOptions}
          onValueChange={handleSelectContainer}
          palette={palette}
        />
      ) : null}

      <LogViewport
        lines={lines}
        isConnecting={isConnecting}
        isEmpty={isEmpty}
        error={error}
        onReconnect={handleReconnect}
        palette={palette}
      />
    </View>
  );
}
