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
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: PRIMARY_COLOR,
  },
};
