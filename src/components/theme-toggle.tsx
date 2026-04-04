import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { Uniwind, useUniwind } from 'uniwind';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

export function ThemeToggle() {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

  function toggleTheme() {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    Uniwind.setTheme(newTheme);
  }

  return (
    <Button
      onPressIn={toggleTheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 web:mx-4 rounded-full">
      <Icon as={THEME_ICONS[resolvedTheme]} className="size-5" />
    </Button>
  );
}
