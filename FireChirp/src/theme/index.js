import {MD3LightTheme as DefaultTheme} from 'react-native-paper';
import {palette} from './colors';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    secondary: palette.secondary,
    background: palette.background,
    surface: palette.card,
    onBackground: palette.text,
    onSurface: palette.text,
  },
};
