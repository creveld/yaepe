import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { SCREEN_PADDING } from '../themes/spacing';

/**
 * Shared geometry for the physical-card styled UI. Keeping the numbers in one
 * place keeps the edit-screen preview and the 3D carousel in sync.
 */

/** Real payment-card proportions (85.60mm x 53.98mm). */
export const CARD_ASPECT_RATIO = 85.6 / 53.98;

/** Vertical gap between two stacked cards in the carousel. */
export const CARD_GAP = 20;

/** Corner radius of a card surface. */
export const CARD_RADIUS = 20;

/**
 * Card size derived from the current window width, so a card always spans the
 * content area (screen width minus the page padding) on any device.
 */
export const useCardSize = () => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const cardWidth = Math.round(width - SCREEN_PADDING * 2);
    return {
      width: cardWidth,
      height: Math.round(cardWidth / CARD_ASPECT_RATIO),
    };
  }, [width]);
};
