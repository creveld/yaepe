import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import { useQuery } from 'react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Hcef from '../modules/Hcef';
import CardCarousel from '../components/CardCarousel';
import { getCards } from '../data/cards';
import { ensureNotificationPermission } from '../modules/notifications';
import { useActiveCard } from '../state/ActiveCardContext';
import { SCREEN_PADDING, SPACING } from '../themes/spacing';
import type { RootStackParams } from '../navigation/types';

/** Diameter of the circular "add card" button. */
const FAB_SIZE = 56;

/** Blur applied to the active card's artwork behind the carousel. */
const BACKDROP_BLUR = 25;
/** Opacity of the blurred artwork itself. */
const BACKDROP_IMAGE_OPACITY = 0.5;
/** Opacity of the theme-coloured layer that mutes the artwork underneath. */
const BACKDROP_DIM_OPACITY = 0.5;
/** How long the backdrop takes to fade in and out (milliseconds). */
const BACKDROP_FADE_MS = 700;
/** Length of the confirmation buzz when a card is activated (milliseconds). */
const ACTIVATION_VIBRATION = 25;

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-horizontal: ${SCREEN_PADDING}px;
`;

const Message = styled.Text`
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: ${props => props.theme.colors.onSurfaceVariant};
`;

/**
 * Sits on top of the blurred artwork and pulls it back towards the background
 * colour, so an activated card stays a hint rather than a second picture.
 */
const BackdropDim = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.background};
  opacity: ${BACKDROP_DIM_OPACITY};
`;

const AddButton = styled.TouchableOpacity`
  position: absolute;
  right: ${SCREEN_PADDING}px;
  width: ${FAB_SIZE}px;
  height: ${FAB_SIZE}px;
  border-radius: ${FAB_SIZE / 2}px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.primary};
  elevation: 6;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
`;

const AddButtonIcon = styled(FontAwesome5).attrs({ name: 'plus' })`
  color: ${props => props.theme.colors.onPrimary};
  font-size: 24px;
`;

type MainScreenProps = NativeStackScreenProps<RootStackParams, 'Main'>;

const MainScreen = ({ navigation }: MainScreenProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const fabStyle = useMemo(
    () => ({ bottom: insets.bottom + SCREEN_PADDING }),
    [insets.bottom],
  );

  const [centerIndex, setCenterIndex] = useState(0);
  const { activeSid, toggleActive } = useActiveCard();

  const hasCheckedHcef = useRef(false);

  // Verify HCE-F support/enablement once, as early as possible.
  useEffect(() => {
    if (hasCheckedHcef.current) {
      return;
    }
    hasCheckedHcef.current = true;

    if (!Hcef.support) {
      Alert.alert(t('alert.title.error'), t('alert.body.hcef_not_support'), [
        { text: t('alert.button.confirm') },
      ]);
    } else if (!Hcef.enabled) {
      Alert.alert(t('alert.title.error'), t('alert.body.hcef_init_fail'), [
        { text: t('alert.button.confirm') },
      ]);
    }
  }, [t]);

  const cardsQuery = useQuery('cards', getCards);
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data]);

  // Deleting a card can leave the centred index pointing past the end of the
  // list; the carousel can only highlight a card that still exists.
  useEffect(() => {
    setCenterIndex(previous =>
      previous > cards.length - 1 ? Math.max(0, cards.length - 1) : previous,
    );
  }, [cards.length]);

  const activateCard = useCallback(
    async (index: number) => {
      const card = cards[index];
      if (!card) {
        return;
      }

      const isActivating = activeSid !== card.sid;

      try {
        if (isActivating) {
          // Ask early, but never hold up the activation on the system dialog.
          ensureNotificationPermission();
        }

        await toggleActive(card.sid, card.name);

        if (isActivating) {
          Vibration.vibrate(ACTIVATION_VIBRATION);
        }
      } catch (error) {
        Alert.alert(
          t('alert.title.error'),
          error instanceof Error ? error.message : String(error),
        );
      }
    },
    [activeSid, cards, t, toggleActive],
  );

  const onEdit = useCallback(
    (index: number) => {
      const card = cards[index];
      if (!card) {
        return;
      }
      navigation.navigate('Edit', { index, card });
    },
    [cards, navigation],
  );

  const goToAdd = useCallback(() => {
    navigation.navigate('Add');
  }, [navigation]);

  // The artwork of the active card also fills the screen behind the carousel,
  // heavily blurred, so an activated card is recognisable at a glance.
  const activeBackdropUri = useMemo(() => {
    const card = cards.find(item => item.sid === activeSid);

    return card?.showCustomDesign ? card.customImage : undefined;
  }, [activeSid, cards]);

  // Kept mounted while fading out, so the backdrop can also disappear softly.
  const [backdropUri, setBackdropUri] = useState(activeBackdropUri);
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeBackdropUri) {
      setBackdropUri(activeBackdropUri);
    }

    const animation = Animated.timing(backdropOpacity, {
      toValue: activeBackdropUri ? 1 : 0,
      duration: BACKDROP_FADE_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && !activeBackdropUri) {
        setBackdropUri(undefined);
      }
    });

    return () => animation.stop();
  }, [activeBackdropUri, backdropOpacity]);

  if (cardsQuery.isLoading) {
    return (
      <Container>
        <Centered>
          <ActivityIndicator size="large" />
        </Centered>
      </Container>
    );
  }

  if (cardsQuery.isError) {
    return (
      <Container>
        <Centered>
          <Message>{t('main.load_failed')}</Message>
        </Centered>
      </Container>
    );
  }

  if (cards.length === 0) {
    return (
      <Container>
        <Centered>
          <Message>{t('main.please_add_a_card')}</Message>
        </Centered>
        <AddButton onPress={goToAdd} style={fabStyle}>
          <AddButtonIcon />
        </AddButton>
      </Container>
    );
  }

  return (
    <Container>
      {backdropUri ? (
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="none"
        >
          <Image
            source={{ uri: backdropUri }}
            style={styles.backdropImage}
            blurRadius={BACKDROP_BLUR}
            resizeMode="cover"
          />
          <BackdropDim />
        </Animated.View>
      ) : null}

      <View style={styles.carouselArea}>
        <CardCarousel
          cards={cards}
          centerIndex={centerIndex}
          setCenterIndex={setCenterIndex}
          onPress={activateCard}
          onEdit={onEdit}
          activeSid={activeSid}
        />
      </View>

      <AddButton onPress={goToAdd} style={fabStyle}>
        <AddButtonIcon />
      </AddButton>
    </Container>
  );
};

const styles = StyleSheet.create({
  carouselArea: {
    flex: 1,
    paddingVertical: SPACING.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: BACKDROP_IMAGE_OPACITY,
  },
});

export default MainScreen;
