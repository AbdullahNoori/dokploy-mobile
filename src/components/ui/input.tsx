import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import { Platform, StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { useUniwind } from 'uniwind';

const Input = forwardRef<TextInput, TextInputProps>(function Input({ className, style, ...props }, ref) {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const androidStyle =
    Platform.OS === 'android'
      ? [styles.androidInput, className?.includes('bg-transparent') && styles.androidTransparentInput]
      : undefined;

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={THEME[resolvedTheme].mutedForeground}
      className={cn(
        'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground transition-[color,box-shadow] outline-none md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className
      )}
      style={androidStyle ? [androidStyle, style] : style}
      {...props}
      underlineColorAndroid="transparent"
    />
  );
});

const styles = StyleSheet.create({
  androidInput: {
    borderBottomWidth: 0,
  },
  androidTransparentInput: {
    backgroundColor: 'transparent',
  },
});

export { Input };
