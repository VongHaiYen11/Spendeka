const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// Primary color used across the app
export const PRIMARY_COLOR = '#FFD60A';

export default {
  primary: PRIMARY_COLOR,
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: PRIMARY_COLOR,
    border: '#E5E7EB',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: PRIMARY_COLOR,
    border: '#374151',
  },
  general: {
    // Chart colors
    income: '#C1E59F',
    spent: '#FA5C5C',
    // Background colors
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    // Text colors
    gray900: '#111827',
    gray700: '#4B5563',
    gray600: '#6B7280',
    // Shadow
    black: '#000000',
  },
};