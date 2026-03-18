import useSWR from 'swr';

import type { ApplicationOneResponse } from '@/types/application';
import { getRequest } from '@/lib/http';

export function useApplicationOne(applicationId: string | undefined) {
  return useSWR<ApplicationOneResponse>(
    applicationId ? ['application/one', applicationId] : null,
    () => getRequest('application/one', { applicationId })
  );
}
