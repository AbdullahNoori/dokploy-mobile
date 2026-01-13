import { AxiosRequestConfig } from 'axios';
import { getRequest } from 'src/lib/http';
import { PAT_STORAGE_KEY, patStorage } from 'src/lib/pat-storage';

export type Project = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type ProjectsResponse =
  | Project[]
  | {
      projects: Project[];
    };

const withPatHeader = (config?: AxiosRequestConfig<any>): AxiosRequestConfig<any> | undefined => {
  const storedPat = patStorage.getString(PAT_STORAGE_KEY);

  if (!storedPat) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      'x-api-key': storedPat,
    },
  };
};

export function fetchProjects(config?: AxiosRequestConfig<any>) {
  return getRequest<ProjectsResponse>('project.all', undefined, withPatHeader(config));
}
