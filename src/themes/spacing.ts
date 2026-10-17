/**
 * Spacing scale on a 4dp grid, shared by every screen and component. Using the
 * same handful of steps everywhere keeps the vertical rhythm and the screen
 * insets consistent across the app.
 */
export const SPACING = {
  /** 4dp - hairline gaps between tightly related lines of text. */
  xs: 4,
  /** 8dp - gap between related controls. */
  sm: 8,
  /** 12dp - gap between buttons in a row. */
  md: 12,
  /** 16dp - gap between a control and its label/description. */
  lg: 16,
  /** 24dp - gap between blocks, and the screen edge inset. */
  xl: 24,
  /** 32dp - gap between top level sections. */
  xxl: 32,
} as const;

/** Horizontal inset between the screen edges and the content. */
export const SCREEN_PADDING = SPACING.xl;
