import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { models } from '@/types/error';
import type { ProjectAllEnvironment } from '@/types/projects';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isErrorResponse(value: unknown): value is models.ErrorT {
  return Boolean(value && typeof value === 'object' && 'error' in value);
}

export function getServiceCount(environments: ProjectAllEnvironment[]) {
  return environments.reduce((total, env) => {
    return (
      total +
      (env.applications?.length ?? 0) +
      (env.compose?.length ?? 0) +
      (env.mariadb?.length ?? 0) +
      (env.mongo?.length ?? 0) +
      (env.mysql?.length ?? 0) +
      (env.postgres?.length ?? 0) +
      (env.redis?.length ?? 0)
    );
  }, 0);
}

export function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const divisions: Array<[string, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (absSeconds >= secondsInUnit || unit === 'second') {
      const value = Math.round(absSeconds / secondsInUnit);
      const label = value === 1 ? unit : `${unit}s`;
      return diffSeconds >= 0
        ? `Created ${value} ${label} ago`
        : `Created in ${value} ${label}`;
    }
  }

  return 'Created just now';
}
