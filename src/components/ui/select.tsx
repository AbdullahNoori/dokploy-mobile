import * as React from 'react';
import { Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/use-haptics';
import { Icon } from './icon';
import { Text } from './text';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  className,
  disabled,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const { selection } = useHaptics();

  const handleOpen = () => {
    void selection();
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({
        top: pageY + height + 4,
        left: pageX,
        width: width,
      });
      setOpen(true);
    });
  };

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  return (
    <>
      <Pressable
        ref={triggerRef}
        disabled={disabled}
        onPress={handleOpen}
        className={cn(
          'dark:bg-input/30 border-input bg-background flex h-10 w-full min-w-0 flex-row items-center justify-between rounded-md border px-3 py-1 shadow-sm shadow-black/5 sm:h-9',
          disabled &&
            cn(
              'opacity-50',
              Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
            ),
          Platform.select({
            web: cn(
              'transition-[color,box-shadow] outline-none md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
            ),
          }),
          className
        )}>
        <Text
          numberOfLines={1}
          className={cn(
            'text-base leading-5',
            !selectedOption &&
              Platform.select({
                web: 'text-muted-foreground',
                native: 'text-muted-foreground/50',
              })
          )}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Icon
          as={ChevronDown}
          className={cn(
            'size-4 shrink-0 opacity-50',
            Platform.select({
              web: 'text-muted-foreground',
              native: 'text-muted-foreground/50',
            })
          )}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            className="bg-popover border-border max-h-[300px] rounded-md border shadow-md">
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="py-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      void selection();
                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'active:bg-accent dark:active:bg-accent/50 flex flex-row items-center px-2 py-2.5',
                      Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' }),
                      isSelected && 'bg-accent/30 dark:bg-accent/30'
                    )}>
                    <View className="w-6 items-start justify-center pl-1">
                      {isSelected && <Icon as={Check} className="text-foreground size-4" />}
                    </View>
                    <Text className="text-foreground flex-1 text-base sm:text-sm">
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
