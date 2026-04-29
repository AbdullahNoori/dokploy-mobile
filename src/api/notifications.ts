import useSWR from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type {
  NotificationAllResponse,
  NotificationCreateCustomRequest,
  NotificationCreateCustomResponse,
} from '@/types/notifications';

export function useNotificationAll() {
  const key = useActiveOrganizationSWRKey(['notification/all']);

  return useSWR<NotificationAllResponse>(key, () => getRequest('notification/all'));
}

export function notificationCreateCustom(payload: NotificationCreateCustomRequest) {
  return postRequest<NotificationCreateCustomResponse>('notification/createCustom', payload);
}
