import useSWR from 'swr';

import type {
  NotificationAllResponse,
  NotificationCreateCustomRequest,
  NotificationCreateCustomResponse,
} from '@/types/notifications';
import { getRequest, postRequest } from '../lib/http';

export function useNotificationAll() {
  return useSWR<NotificationAllResponse>('notification/all', getRequest);
}

export function notificationCreateCustom(payload: NotificationCreateCustomRequest) {
  return postRequest<NotificationCreateCustomResponse>('notification/createCustom', payload);
}
