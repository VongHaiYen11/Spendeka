import { useTheme } from '@/contexts/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  try {
    const { colorScheme } = useTheme();
    return colorScheme;
  } catch {
    // If ThemeProvider is not available, return light as fallback
    return 'light';
  }
}
