import { View } from 'react-native';

import { cn } from '@/lib/utils';
import type { HomePriorityLevel } from '@/hooks/use-home-health-overview';

const DOT_CLASS: Record<HomePriorityLevel, string> = {
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  ok: 'bg-emerald-500',
};

type Props = {
  level: HomePriorityLevel;
  className?: string;
};

export function HomeStatusDot({ level, className }: Props) {
  return <View className={cn('size-2.5 rounded-full', DOT_CLASS[level], className)} />;
}
