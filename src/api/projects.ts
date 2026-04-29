import useSWR from 'swr';

import { getRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import { ProjectAllResponse, ProjectOneResponse } from '@/types/projects';

/* 
/ --------------------------------------------------------------------
/ Project
/ --------------------------------------------------------------------
*/

export function useProjectAll() {
  const key = useActiveOrganizationSWRKey(['project/all']);

  return useSWR<ProjectAllResponse>(key, () => getRequest('project/all'));
}

export function useProjectOne(projectId: string) {
  const key = useActiveOrganizationSWRKey(projectId ? ['project/one', projectId] : null);

  return useSWR<ProjectOneResponse>(key, () => getRequest('project/one', { projectId }));
}
