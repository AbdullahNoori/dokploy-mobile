import useSWR from 'swr';

import type { ComposeOneResponse } from '@/types/compose';
import { getRequest } from '@/lib/http';

export function useComposeOne(composeId: string | undefined) {
  return useSWR<ComposeOneResponse>(
    composeId ? ['compose/one', composeId] : null,
    () => getRequest('compose/one', { composeId })
  );
}
