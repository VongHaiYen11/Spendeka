import {
    DEFAULT_ACCENT_KEY,
    getAccentPrimary,
    type AccentKey,
} from "@/constants/AccentColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

type ThemeMode = "auto" | "light" | "dark";
type ColorScheme = "light" | "dark";
export type LanguageKey = "vie" | "eng";

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  accentKey: AccentKey;
  setAccentKey: (key: AccentKey) => Promise<void>;
  primaryColor: string;
  languageKey: LanguageKey;
  setLanguageKey: (key: LanguageKey) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@spendeka_theme_mode";
const ACCENT_STORAGE_KEY = "@spendeka_accent_key";
const LANGUAGE_STORAGE_KEY = "@spendeka_language";

const VALID_ACCENT_KEYS: AccentKey[] = [
  "yellow",
  "green",
  "pink",
  "blue",
  "red",
  "orange",
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [accentKey, setAccentKeyState] =
    useState<AccentKey>(DEFAULT_ACCENT_KEY);
  const [languageKey, setLanguageKeyState] =
    useState<LanguageKey>("eng");
  const [isLoading, setIsLoading] = useState(true);

  // Load theme, accent and language preferences from storage
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedTheme, savedAccent, savedLanguage] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(ACCENT_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
      ]);
      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "auto"
      ) {
        setThemeModeState(savedTheme);
      }
      if (savedAccent && VALID_ACCENT_KEYS.includes(savedAccent as AccentKey)) {
        setAccentKeyState(savedAccent as AccentKey);
      }
      if (savedLanguage === "vie" || savedLanguage === "eng") {
        setLanguageKeyState(savedLanguage);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  // Determine the actual color scheme based on themeMode
  const colorScheme: ColorScheme =
    themeMode === "auto" ? (deviceColorScheme ?? "light") : themeMode;

  const isDarkMode = colorScheme === "dark";

  const toggleDarkMode = async () => {
    const newMode = isDarkMode ? "light" : "dark";
    await setThemeMode(newMode);
  };

  const setAccentKey = async (key: AccentKey) => {
    try {
      await AsyncStorage.setItem(ACCENT_STORAGE_KEY, key);
      setAccentKeyState(key);
    } catch (error) {
      console.error("Failed to save accent preference:", error);
    }
  };

  const setLanguageKey = async (key: LanguageKey) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, key);
      setLanguageKeyState(key);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  const primaryColor = getAccentPrimary(accentKey, colorScheme);

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colorScheme,
        setThemeMode,
        isDarkMode,
        toggleDarkMode,
        accentKey,
        setAccentKey,
        primaryColor,
        languageKey,
        setLanguageKey,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/** Primary accent color for the current theme. Use CAMERA_PRIMARY on camera screen instead. */
export function usePrimaryColor(): string {
  return useTheme().primaryColor;
}
