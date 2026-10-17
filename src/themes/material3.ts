import type { DefaultTheme } from 'styled-components/native';

export const monochromeLight: DefaultTheme = {
  colors: {
    // Material 3 - Primary (Monochrome Black)
    primary: '#000000',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E7E7E7',
    onPrimaryContainer: '#000000',

    // Secondary
    secondary: '#1A1A1A',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E7E7E7',
    onSecondaryContainer: '#000000',

    // Tertiary
    tertiary: '#333333',
    onTertiary: '#FFFFFF',

    // Surface
    surface: '#FFFFFF',
    onSurface: '#000000',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#333333',

    // Background
    background: '#FAFAFA',
    onBackground: '#000000',

    // Outline & Divider
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',

    // Error
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',

    // Inverse
    inverseSurface: '#000000',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#FFFFFF',

    // Physical card (always dark)
    card: '#1A1A1A',
    cardVariant: '#2C2C2C',
    onCard: '#FFFFFF',
    onCardVariant: 'rgba(255, 255, 255, 0.6)',

    disabled: '#9E9E9E',
  },
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#FFFFFF',
    level3: '#FFFFFF',
    level4: '#FFFFFF',
    level5: '#FFFFFF',
  },
};

export const monochromeDark: DefaultTheme = {
  colors: {
    // Material 3 - Primary (Monochrome White)
    primary: '#FFFFFF',
    onPrimary: '#000000',
    primaryContainer: '#1A1A1A',
    onPrimaryContainer: '#FFFFFF',

    // Secondary
    secondary: '#E7E7E7',
    onSecondary: '#000000',
    secondaryContainer: '#1A1A1A',
    onSecondaryContainer: '#FFFFFF',

    // Tertiary
    tertiary: '#BDBDBD',
    onTertiary: '#000000',

    // Surface
    surface: '#121212',
    onSurface: '#FFFFFF',
    surfaceVariant: '#1E1E1E',
    onSurfaceVariant: '#BDBDBD',

    // Background
    background: '#0A0A0A',
    onBackground: '#FFFFFF',

    // Outline & Divider
    outline: '#4A4A4A',
    outlineVariant: '#333333',

    // Error
    error: '#CF6679',
    onError: '#000000',
    errorContainer: '#2C000E',
    onErrorContainer: '#F9DEDC',

    // Inverse
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#000000',
    inversePrimary: '#000000',

    // Physical card (always dark)
    card: '#1A1A1A',
    cardVariant: '#2C2C2C',
    onCard: '#FFFFFF',
    onCardVariant: 'rgba(255, 255, 255, 0.6)',

    disabled: '#616161',
  },
  elevation: {
    level0: 'transparent',
    level1: '#1E1E1E',
    level2: '#212121',
    level3: '#272727',
    level4: '#2D2D2D',
    level5: '#333333',
  },
};
