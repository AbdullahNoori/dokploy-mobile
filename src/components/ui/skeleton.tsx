import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

type SkeletonProps = ViewProps & {
  className?: string;
};

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <View className={cn('bg-muted/50 animate-pulse rounded-md', className)} {...props} />;
}
