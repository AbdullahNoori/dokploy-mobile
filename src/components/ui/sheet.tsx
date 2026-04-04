import * as Dialog from '@rn-primitives/dialog';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({
  className,
  children,
  ...props
}: ViewProps & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="absolute inset-0 bg-black/40" />
      <View className="absolute inset-x-0 bottom-0 px-2 pb-2">
        <Dialog.Content
          className={cn(
            'bg-popover border-border max-h-[88%] rounded-[28px] border px-4 pt-3 pb-6',
            className
          )}
          {...props}>
          <View className="mb-3 items-center">
            <View className="bg-muted h-1.5 w-12 rounded-full" />
          </View>
          {children}
        </Dialog.Content>
      </View>
    </Dialog.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTrigger };
