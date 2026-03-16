import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { ProjectAllResponse, ProjectOneResponse } from '@/types/projects';
import { getRequest } from '../lib/http';

/* 
/ --------------------------------------------------------------------
/ Project
/ --------------------------------------------------------------------
*/

export function useProjectAll() {
  return useSWR<ProjectAllResponse>('project/all', getRequest);
}

export function useProjectOne(projectId: string) {
  return useSWR<ProjectOneResponse>(
    projectId ? ['project/one', projectId] : null,
    ([endpoint, id]) => getRequest(endpoint, { projectId: id })
  );
}
