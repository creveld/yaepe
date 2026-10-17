import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';

import { SPACING } from '../themes/spacing';
import type { Card } from '../types';

/** Inset of the overlaid details from the card edges. */
const CARD_INSET = SPACING.lg;
/** Diameter of the corner controls (badge / edit button). */
const CARD_CONTROL_SIZE = 32;

interface CardFaceProps {
  card: Card;
  /** Pre-formatted KONAMI ID to display. */
  uid: string;
  /** Optional short status line shown under the UID. */
  hint?: string;
  /** Optional badge (e.g. "Active") shown on the top-left corner. */
  badge?: string;
  /** 0 = focused, 1 = fully out of focus (blurred artwork + fog). */
  outOfFocus?: number;
  /** When provided, a copy button copies the UID. */
  onCopyUid?: () => void;
  /** When provided, an edit button is shown on the top-right corner. */
  onEditPress?: () => void;
}

/**
 * The visual "face" of a card, laid out like a real payment card: the artwork
 * fills the whole surface and the details sit on a dimmed layer on top of it.
 *
 * Shared by the flat preview and the 3D carousel so both always look the same.
 */
const CardFace = ({
  card,
  uid,
  hint,
  badge,
  outOfFocus = 0,
  onCopyUid,
  onEditPress,
}: CardFaceProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const showImage = Boolean(card.showCustomDesign && card.customImage);

  const blurRadius = Math.round(Math.pow(outOfFocus, 2) * 24);
  const fogOpacity = outOfFocus * 0.4;

  return (
    <View style={styles.face}>
      {showImage ? (
        <ImageBackground
          source={{ uri: card.customImage }}
          style={styles.artwork}
          imageStyle={blurRadius > 0 ? styles.blurredImage : undefined}
          blurRadius={blurRadius}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.artwork,
            styles.pattern,
            { backgroundColor: theme.colors.cardVariant },
          ]}
        >
          <Text style={styles.patternText}>
            {card.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Dim layer so the overlaid details stay legible on any artwork. */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.35)',
          'rgba(0, 0, 0, 0.82)',
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Fog pulls out-of-focus cards back towards the surface colour. */}
      {fogOpacity > 0 ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0, 0, 0, ${fogOpacity})` },
          ]}
          pointerEvents="none"
        />
      ) : null}

      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}

      {onEditPress ? (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('card.edit')}
        >
          <FontAwesome5 name="pen" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: theme.colors.onCard }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {card.name}
        </Text>

        <TouchableOpacity
          style={styles.uidRow}
          onPress={onCopyUid}
          disabled={!onCopyUid}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.uid, { color: theme.colors.onCardVariant }]}
            numberOfLines={1}
          >
            {uid}
          </Text>
          {onCopyUid ? (
            <FontAwesome5
              name="copy"
              size={13}
              color={theme.colors.onCardVariant}
              style={styles.copyIcon}
            />
          ) : null}
        </TouchableOpacity>

        {hint ? (
          <Text
            style={[styles.hint, { color: theme.colors.onCardVariant }]}
            numberOfLines={1}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  face: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  artwork: {
    ...StyleSheet.absoluteFillObject,
  },
  blurredImage: {
    // Slightly over-scale the artwork so blurred edges are clipped away.
    transform: [{ scale: 1.08 }],
  },
  pattern: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternText: {
    fontSize: 108,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.08)',
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: CARD_INSET,
    paddingBottom: CARD_INSET,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  uidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  uid: {
    fontSize: 15,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  copyIcon: {
    paddingLeft: SPACING.sm,
  },
  hint: {
    fontSize: 12,
    marginTop: SPACING.sm,
  },
  badge: {
    position: 'absolute',
    top: CARD_INSET,
    left: CARD_INSET,
    height: CARD_CONTROL_SIZE,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_CONTROL_SIZE / 2,
    paddingHorizontal: SPACING.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  editButton: {
    position: 'absolute',
    top: CARD_INSET,
    right: CARD_INSET,
    width: CARD_CONTROL_SIZE,
    height: CARD_CONTROL_SIZE,
    borderRadius: CARD_CONTROL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});

export default CardFace;
