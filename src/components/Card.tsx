import React from 'react';
import { StyleSheet } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import styled from 'styled-components/native';

import CardFace from './CardFace';
import { useCardUid } from '../hooks/useCardUid';
import { CARD_RADIUS } from './cardLayout';
import type { Card as CardModel } from '../types';

interface CardProps {
  card: CardModel;
  /** Short status line rendered under the card number. */
  hint?: string;
}

const Surface = styled.View`
  flex: 1;
  border-radius: ${CARD_RADIUS}px;
  overflow: hidden;
  background-color: ${props => props.theme.colors.card};
`;

/**
 * Flat, non-interactive card used as a live preview (e.g. on the edit screen).
 */
const Card = ({ card, hint }: CardProps) => {
  const { display, copy } = useCardUid(card.sid);

  return (
    <Shadow
      containerStyle={styles.container}
      style={styles.shadow}
      distance={4}
      offset={[0, 2]}
    >
      <Surface>
        <CardFace card={card} uid={display} hint={hint} onCopyUid={copy} />
      </Surface>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

export default Card;
