import { useUniwind } from "uniwind";

type AppColorScheme = "light" | "dark" | undefined;

export function useColorScheme(): AppColorScheme {
  const { theme } = useUniwind();

  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return undefined;
}
