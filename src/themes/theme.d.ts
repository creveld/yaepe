import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      onPrimary: string;
      primaryContainer: string;
      onPrimaryContainer: string;

      secondary: string;
      onSecondary: string;
      secondaryContainer: string;
      onSecondaryContainer: string;

      tertiary: string;
      onTertiary: string;

      surface: string;
      onSurface: string;
      surfaceVariant: string;
      onSurfaceVariant: string;

      background: string;
      onBackground: string;

      outline: string;
      outlineVariant: string;

      error: string;
      onError: string;
      errorContainer: string;
      onErrorContainer: string;

      inverseSurface: string;
      inverseOnSurface: string;
      inversePrimary: string;

      /**
       * Physical card palette. The e-amusement pass is always rendered as a
       * dark card regardless of the app theme, so these are intentionally the
       * same in both light and dark themes.
       */
      card: string;
      cardVariant: string;
      onCard: string;
      onCardVariant: string;

      disabled: string;
    };
    elevation: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
  }
}
