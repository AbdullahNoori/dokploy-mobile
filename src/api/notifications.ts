import useSWR from 'swr';

import type { NotificationAllResponse } from '@/types/notifications';
import { getRequest } from '../lib/http';

export function useNotificationAll() {
  return useSWR<NotificationAllResponse>('notification/all', getRequest);
}
