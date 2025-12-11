import { useUnistyles } from "react-native-unistyles";

type AppColorScheme = "light" | "dark" | undefined;

export function useColorScheme(): AppColorScheme {
  const { rt } = useUnistyles();

  return (rt.themeName as AppColorScheme) ?? undefined;
}
