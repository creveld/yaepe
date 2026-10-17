import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInputFocusEventData,
  TextInputProps,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Shadow } from 'react-native-shadow-2';
import { useMutation, useQueryClient } from 'react-query';
import styled, { useTheme } from 'styled-components/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';

import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import { addCard, removeCard, updateCard } from '../data/cards';
import { useCardUid } from '../hooks/useCardUid';
import { CARD_ASPECT_RATIO } from '../components/cardLayout';
import { SCREEN_PADDING, SPACING } from '../themes/spacing';
import { useActiveCard } from '../state/ActiveCardContext';
import type { Card as CardModel } from '../types';
import type { RootStackParams } from '../navigation/types';

type CardEditScreenProps = NativeStackScreenProps<
  RootStackParams,
  'Add' | 'Edit'
>;

const generateRandomCardNumber = () => {
  const randomChunk = () =>
    Math.trunc(Math.random() * 0x10000)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');

  return `02FE${randomChunk()}${randomChunk()}${randomChunk()}`;
};

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const FieldTitle = styled(Text)<{ focused: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props =>
    props.focused
      ? props.theme.colors.primary
      : props.theme.colors.onSurfaceVariant};
`;

const FieldBottomBorder = styled.View<{ focused: boolean }>`
  padding-top: 2px;
  background-color: ${props =>
    props.focused
      ? props.theme.colors.primary
      : props.theme.colors.outlineVariant};
  height: ${props => (props.focused ? 2 : 1)}px;
`;

const StyledTextInput = styled.TextInput`
  font-size: 16px;
  padding-top: ${SPACING.xs}px;
  color: ${props =>
    props.editable !== false
      ? props.theme.colors.onSurface
      : props.theme.colors.disabled};
`;

const ToggleTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.onSurface};
`;

const ToggleSubtitle = styled.Text`
  font-size: 13px;
  margin-top: ${SPACING.xs}px;
  color: ${props => props.theme.colors.onSurfaceVariant};
`;

const ToggleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING.lg}px;
`;

const ToggleLabel = styled.View`
  flex: 1;
  padding-right: ${SPACING.lg}px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${props => props.theme.colors.outlineVariant};
`;

const ButtonContainer = styled.TouchableOpacity<{
  variant?: 'primary' | 'outline' | 'danger';
}>`
  height: 48px;
  justify-content: center;
  align-items: center;
  border-radius: 24px;
  background-color: ${props =>
    props.variant === 'outline' || props.variant === 'danger'
      ? 'transparent'
      : props.theme.colors.primary};
  border-width: ${props =>
    props.variant === 'outline' || props.variant === 'danger' ? 1 : 0}px;
  border-color: ${props => {
    if (props.variant === 'outline') {
      return props.theme.colors.outline;
    }
    if (props.variant === 'danger') {
      return props.theme.colors.error;
    }
    return 'transparent';
  }};
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'outline' | 'danger' }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => {
    if (props.variant === 'outline') {
      return props.theme.colors.primary;
    }
    if (props.variant === 'danger') {
      return props.theme.colors.error;
    }
    return props.theme.colors.onPrimary;
  }};
`;

type ButtonProps = {
  text: string;
  containerStyle: ViewStyle;
  variant?: 'primary' | 'outline' | 'danger';
} & TouchableOpacityProps;

const Button = ({
  text,
  containerStyle,
  variant,
  ...touchableProps
}: ButtonProps) => {
  const content = (
    <ButtonContainer
      {...touchableProps}
      style={[
        styles.buttonBorderRadius,
        touchableProps.disabled ? styles.buttonDisabled : undefined,
      ]}
      variant={variant}
    >
      <ButtonText variant={variant}>{text}</ButtonText>
    </ButtonContainer>
  );

  // Material 3 outlined buttons are flat; only filled buttons are elevated.
  if (variant && variant !== 'primary') {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <Shadow
      style={styles.buttonShadow}
      containerStyle={containerStyle}
      distance={4}
    >
      {content}
    </Shadow>
  );
};

type TextFieldProps = TextInputProps & {
  title: string;
  containerStyle?: ViewStyle;
};

const TextField = ({
  onFocus,
  onBlur,
  title,
  containerStyle,
  ...textInputProps
}: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  return (
    <View style={containerStyle}>
      <FieldTitle focused={isFocused}>{title}</FieldTitle>
      <StyledTextInput
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
      />
      <FieldBottomBorder focused={isFocused} />
    </View>
  );
};

const CardEditScreen = (props: CardEditScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const editParams = props.route.params;
  const initialData = editParams?.card;
  const isEditMode = Boolean(editParams);

  const [cardName, setCardName] = useState(initialData?.name ?? 'Yaepe');
  const [cardNumber, setCardNumber] = useState(
    () => initialData?.sid ?? generateRandomCardNumber(),
  );
  const [customImage, setCustomImage] = useState(initialData?.customImage);
  const [showCustomDesign, setShowCustomDesign] = useState(
    Boolean(initialData?.showCustomDesign),
  );

  // Card number (SID) preview: converted to a KONAMI ID by the native module.
  const { display: styledUid, isReady: isUidReady } = useCardUid(cardNumber);

  const pickImage = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      },
      response => {
        const base64 = response.assets?.[0]?.base64;
        if (base64) {
          setCustomImage(`data:image/jpeg;base64,${base64}`);
          setShowCustomDesign(true);
        } else if (response.errorMessage) {
          Alert.alert(t('alert.title.error'), response.errorMessage);
        }
      },
    );
  }, [t]);

  const removeCustomImage = useCallback(() => {
    setCustomImage(undefined);
    setShowCustomDesign(false);
  }, []);

  const queryClient = useQueryClient();

  const { mutate: saveCard } = useMutation(
    (card: CardModel) =>
      isEditMode && editParams
        ? updateCard(editParams.index, card)
        : addCard(card),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cards');
        props.navigation.goBack();
      },
      onError: error => {
        Alert.alert(
          t('alert.title.error'),
          error instanceof Error ? error.message : String(error),
        );
      },
    },
  );

  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isChangeNumberDialogVisible, setChangeNumberDialogVisible] =
    useState(false);

  const confirmChangeCardNumber = useCallback(() => {
    setChangeNumberDialogVisible(false);
    setCardNumber(generateRandomCardNumber());
  }, []);

  const { deactivate } = useActiveCard();

  const { mutate: deleteCard } = useMutation(
    async ({ index, sid }: { index: number; sid: string }) => {
      // Stop emulating the card before it disappears from storage.
      await deactivate(sid);
      await removeCard(index);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cards');
        props.navigation.goBack();
      },
      onError: error => {
        Alert.alert(
          t('alert.title.error'),
          error instanceof Error ? error.message : String(error),
        );
      },
    },
  );

  const confirmDelete = useCallback(() => {
    setDeleteDialogVisible(false);

    if (editParams) {
      deleteCard({ index: editParams.index, sid: editParams.card.sid });
    }
  }, [deleteCard, editParams]);

  const save = useCallback(() => {
    const card: CardModel = {
      sid: cardNumber,
      name: cardName.trim(),
    };

    if (showCustomDesign && customImage) {
      card.customImage = customImage;
      card.showCustomDesign = true;
    }

    saveCard(card);
  }, [cardName, cardNumber, customImage, saveCard, showCustomDesign]);

  const previewCard = useMemo<CardModel>(
    () => ({
      sid: cardNumber,
      name: cardName,
      customImage: showCustomDesign ? customImage : undefined,
      showCustomDesign,
    }),
    [cardName, cardNumber, customImage, showCustomDesign],
  );

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.previewContainer}>
          <Card card={previewCard} hint={t('card_edit.card_preview')} />
        </View>

        <ToggleRow>
          <ToggleLabel>
            <ToggleTitle>{t('card_edit.custom_design')}</ToggleTitle>
            <ToggleSubtitle>
              {t(
                showCustomDesign
                  ? 'card_edit.custom_design_on'
                  : 'card_edit.custom_design_off',
              )}
            </ToggleSubtitle>
          </ToggleLabel>
          <Switch
            value={showCustomDesign}
            onValueChange={setShowCustomDesign}
            disabled={!customImage}
            style={customImage ? undefined : styles.disabledControl}
            trackColor={{
              false: theme.colors.outlineVariant,
              true: theme.colors.primary,
            }}
            thumbColor={
              showCustomDesign ? theme.colors.onPrimary : theme.colors.outline
            }
            ios_backgroundColor={theme.colors.outlineVariant}
          />
        </ToggleRow>

        <View style={styles.customControlRow}>
          {customImage ? (
            <View style={styles.buttonRow}>
              <Button
                variant="outline"
                onPress={pickImage}
                containerStyle={styles.flexButton}
                text={t('card_edit.change_image')}
              />
              <Button
                variant="outline"
                onPress={removeCustomImage}
                containerStyle={styles.flexButton}
                text={t('card_edit.remove_image')}
              />
            </View>
          ) : (
            <Button
              onPress={pickImage}
              containerStyle={styles.fullWidth}
              text={t('card_edit.choose_image')}
            />
          )}
        </View>

        <View style={styles.fieldItemContainer}>
          <TextField
            title={t('card_edit.card_name')}
            value={cardName}
            onChangeText={setCardName}
          />
        </View>

        <View style={styles.fieldItemContainer}>
          <TextField
            title={t('card_edit.card_number')}
            value={styledUid}
            editable={false}
          />
          <Button
            containerStyle={styles.cardNumberChangeButton}
            onPress={() => setChangeNumberDialogVisible(true)}
            disabled={!isUidReady}
            text={t('card_edit.change_card_number')}
          />
        </View>

        <Divider />

        <Button
          onPress={save}
          disabled={!cardName.trim()}
          containerStyle={styles.saveButton}
          text={t('card_edit.save')}
        />

        {isEditMode ? (
          <Button
            variant="danger"
            onPress={() => setDeleteDialogVisible(true)}
            containerStyle={styles.deleteButton}
            text={t('card_edit.delete_card')}
          />
        ) : null}
      </ScrollView>

      {isEditMode ? (
        <ConfirmDialog
          visible={isDeleteDialogVisible}
          title={t('alert.title.card_remove')}
          message={t('alert.body.card_remove', {
            cardName: initialData?.name ?? '',
          })}
          confirmLabel={t('alert.button.remove')}
          cancelLabel={t('alert.button.cancel')}
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialogVisible(false)}
        />
      ) : null}

      <ConfirmDialog
        visible={isChangeNumberDialogVisible}
        title={t('alert.title.card_number_change')}
        message={t('alert.body.card_number_change')}
        confirmLabel={t('alert.button.change')}
        cancelLabel={t('alert.button.cancel')}
        onConfirm={confirmChangeCardNumber}
        onCancel={() => setChangeNumberDialogVisible(false)}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: SCREEN_PADDING,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: CARD_ASPECT_RATIO,
    marginBottom: SPACING.xxl,
  },
  customControlRow: {
    marginBottom: SPACING.xxl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flexButton: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabledControl: {
    opacity: 0.5,
  },
  fieldItemContainer: {
    marginBottom: SPACING.xxl,
  },
  buttonShadow: {
    width: '100%',
  },
  buttonBorderRadius: {
    borderRadius: 24,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
  deleteButton: {
    marginTop: SPACING.md,
  },
  cardNumberChangeButton: {
    marginTop: SPACING.lg,
  },
});

export default CardEditScreen;
