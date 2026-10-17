import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

import type { Card } from '../types';
import Card3D from './Card3D';
import { CARD_GAP, useCardSize } from './cardLayout';

interface CardCarouselProps {
  cards: Card[];
  centerIndex: number;
  setCenterIndex: (index: number) => void;
  onPress: (index: number) => void;
  onEdit?: (index: number) => void;
  /** SID of the card being emulated, highlighted with a badge. */
  activeSid?: string | null;
}

/**
 * A vertical, snap-scrolling stack of 3D cards. Only the centred card is
 * interactive; its neighbours recede, shrink and blur to create depth.
 */
const CardCarousel = ({
  cards,
  centerIndex,
  setCenterIndex,
  onPress,
  onEdit,
  activeSid,
}: CardCarouselProps) => {
  const { width: cardWidth, height: cardHeight } = useCardSize();
  const interval = cardHeight + CARD_GAP;

  const [viewportHeight, setViewportHeight] = useState(0);
  const listRef = useRef<FlatList<Card>>(null);

  // Keeps the latest centre index available to the realign effect without
  // making it a dependency (which would fight the user's scrolling).
  const centerRef = useRef(centerIndex);
  centerRef.current = centerIndex;

  // Scroll offsets that centre each card in the viewport.
  const snapOffsets = cards.map((_card, index) => index * interval);

  useEffect(() => {
    if (viewportHeight <= 0) {
      return;
    }

    const target = Math.max(0, Math.min(centerRef.current, cards.length - 1));
    listRef.current?.scrollToOffset({
      offset: target * interval,
      animated: false,
    });
    // Only realign when the list of cards itself changes (add/remove) or the
    // layout is relaid out.
  }, [cards.length, interval, viewportHeight]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const raw = Math.round(event.nativeEvent.contentOffset.y / interval);
      const index = Math.max(0, Math.min(raw, cards.length - 1));

      if (index !== centerIndex) {
        setCenterIndex(index);
      }
    },
    [cards.length, centerIndex, interval, setCenterIndex],
  );

  const renderItem: ListRenderItem<Card> = useCallback(
    ({ item, index }) => (
      <Card3D
        card={item}
        index={index}
        offset={index - centerIndex}
        isCenter={index === centerIndex}
        isActive={item.sid === activeSid}
        width={cardWidth}
        height={cardHeight}
        onPress={onPress}
        onEdit={onEdit}
      />
    ),
    [activeSid, cardWidth, cardHeight, centerIndex, onEdit, onPress],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const sideInset = Math.max(0, (viewportHeight - cardHeight) / 2);

  return (
    <View
      style={styles.container}
      onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
    >
      {viewportHeight > 0 ? (
        <FlatList
          ref={listRef}
          data={cards}
          renderItem={renderItem}
          keyExtractor={(_item, index) => String(index)}
          extraData={[centerIndex, activeSid]}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToOffsets={snapOffsets}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingVertical: sideInset },
          ]}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  separator: {
    height: CARD_GAP,
  },
});

export default CardCarousel;
