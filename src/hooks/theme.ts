import { createMMKV } from "react-native-mmkv";

export type ThemeName = "light" | "dark";

export const themeStorage = createMMKV({ id: "dokploy-theme" });
export const THEME_STORAGE_KEY = "theme"; // simpler key

export function loadStoredTheme(): ThemeName | null {
  const stored = themeStorage.getString(THEME_STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}

export function persistTheme(themeName: ThemeName): void {
  themeStorage.set(THEME_STORAGE_KEY, themeName);
}

export { THEME_STORAGE_KEY as themeStorageKey };
