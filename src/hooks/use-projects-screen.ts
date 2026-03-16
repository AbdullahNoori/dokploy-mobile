import { useCallback, useMemo, useState } from 'react';

import { useProjectAll } from '@/api/projects';
import { isErrorResponse } from '@/lib/utils';
import type { ProjectAllResponseBody } from '@/types/projects';

type SortOrder = 'newest' | 'oldest';

type ProjectsScreenState = {
  query: string;
  setQuery: (value: string) => void;
  sortOrder: SortOrder;
  toggleSort: () => void;
  filteredProjects: ProjectAllResponseBody[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  retry: () => void;
};

export function useProjectsScreen(): ProjectsScreenState {
  const { data, error, isLoading, mutate } = useProjectAll();
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const projects = useMemo(() => {
    if (!data || isErrorResponse(data)) {
      return [];
    }
    return data;
  }, [data]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = normalizedQuery
      ? projects.filter((project) => {
          const nameMatch = project.name.toLowerCase().includes(normalizedQuery);
          const descriptionMatch = project.description
            ? project.description.toLowerCase().includes(normalizedQuery)
            : false;
          return nameMatch || descriptionMatch;
        })
      : projects.slice();

    return result.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }, [projects, query, sortOrder]);

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
  }, []);

  const retry = useCallback(() => {
    void mutate();
  }, [mutate]);

  const hasError = Boolean(error) || isErrorResponse(data);
  const isEmpty = !isLoading && !hasError && filteredProjects.length === 0;

  return {
    query,
    setQuery,
    sortOrder,
    toggleSort,
    filteredProjects,
    isLoading,
    isError: hasError,
    isEmpty,
    retry,
  };
}
