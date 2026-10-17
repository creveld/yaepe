import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import CardFace from './CardFace';
import { useCardUid } from '../hooks/useCardUid';
import { CARD_RADIUS } from './cardLayout';
import type { Card } from '../types';

interface Card3DProps {
  card: Card;
  index: number;
  /** Distance from the centre card, in card units (0 = centred). */
  offset: number;
  isCenter: boolean;
  isActive: boolean;
  width: number;
  height: number;
  onPress: (index: number) => void;
  /** When provided, the centred card shows an edit button. */
  onEdit?: (index: number) => void;
}

/** Offsets beyond this are flattened so cards stack instead of flying away. */
const MAX_VISIBLE_OFFSET = 3;
/** How far a card tilts per step of distance (degrees). */
const TILT_PER_STEP = 20;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const Card3D = ({
  card,
  index,
  offset,
  isCenter,
  isActive,
  width,
  height,
  onPress,
  onEdit,
}: Card3DProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { display } = useCardUid(card.sid);

  const clamped = clamp(offset, -MAX_VISIBLE_OFFSET, MAX_VISIBLE_OFFSET);
  const absOffset = Math.abs(clamped);

  const scale = Math.max(0.82, 1 - absOffset * 0.06);
  const opacity = Math.max(0.25, 1 - absOffset * 0.25);
  const outOfFocus = Math.min(1, absOffset / MAX_VISIBLE_OFFSET);

  // The vertical position is handled by the list layout; the transform adds the
  // depth effect only. Cards further from the centre tilt their far edge away
  // from the viewer, forming a vertical drum (perspective must come first).
  const transform = [
    { perspective: 1000 },
    { rotateX: `${-clamped * TILT_PER_STEP}deg` },
    { scale },
  ];

  return (
    <View
      style={[
        styles.container,
        { width, height, opacity, transform, zIndex: 10 - absOffset },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.surface,
          { width, height, backgroundColor: theme.colors.card },
        ]}
        activeOpacity={0.9}
        disabled={!isCenter}
        onPress={() => onPress(index)}
      >
        <CardFace
          card={card}
          uid={display}
          outOfFocus={outOfFocus}
          badge={isActive ? t('card.active') : undefined}
          hint={
            isCenter
              ? t(
                  isActive
                    ? 'card.touch_to_deactivate'
                    : 'card.touch_to_activate',
                )
              : undefined
          }
          onEditPress={isCenter && onEdit ? () => onEdit(index) : undefined}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    shadowOpacity: 0.3,
    elevation: 16,
  },
});

export default Card3D;
