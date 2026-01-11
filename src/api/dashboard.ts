import { getRequest } from 'src/lib/http';
import { AxiosRequestConfig } from 'axios';

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

export function fetchProjects(config?: AxiosRequestConfig<any>) {
  return getRequest<ProjectsResponse>('project.all', undefined, config);
}
