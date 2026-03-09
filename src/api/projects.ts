import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { ProjectAllResponse } from '@/types/projects';
import { getRequest } from '../lib/http';

/* 
/ --------------------------------------------------------------------
/ Project
/ --------------------------------------------------------------------
*/

export function useProjectAll() {
  return useSWR<ProjectAllResponse>('project.all', getRequest);
}
