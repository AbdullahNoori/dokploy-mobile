import type { ProjectAllEnvironment } from '@/types/projects';

type Props = {
  environments: ProjectAllEnvironment[];
  activeEnvironmentId: string | null;
  activeEnvironmentName?: string | null;
  onSelectEnvironment: (environmentId: string) => void;
};

export function ProjectEnvironmentMenu(_: Props) {
  return null;
}
