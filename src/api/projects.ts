import { AxiosRequestConfig } from 'axios';
import { getRequest } from 'src/lib/http';
import { PAT_STORAGE_KEY, patStorage } from 'src/lib/pat-storage';

export type Project = {
  id?: string;
  projectId?: string;
  name: string;
  [key: string]: unknown;
};

export type ProjectEnvironment = {
  environmentId?: string;
  name?: string;
  description?: string;
  applications?: unknown[];
  compose?: unknown[];
  mariadb?: unknown[];
  mongo?: unknown[];
  mysql?: unknown[];
  postgres?: unknown[];
  redis?: unknown[];
  [key: string]: unknown;
};

export type ProjectDetail = Project & {
  environments?: ProjectEnvironment[];
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

export function fetchProject(projectId: string, config?: AxiosRequestConfig<any>) {
  return getRequest<ProjectDetail>('project.one', { projectId }, withPatHeader(config));
}
