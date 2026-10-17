import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';

import { SPACING } from '../themes/spacing';

interface ConfirmDialogProps {
  visible: boolean;
  /** Headline, e.g. "Remove card". */
  title: string;
  /** Supporting text explaining what is about to happen. */
  message: string;
  /** Label of the affirmative action (right hand side). */
  confirmLabel: string;
  /** Label of the dismissing action (left hand side). */
  cancelLabel: string;
  /** Paints the affirmative action with the error colour. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A Material 3 style alert dialog. React Native's `Alert` falls back to the
 * platform widget, which does not match the app's design language, so the
 * dialog is drawn with plain views instead.
 */
const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.scrim}>
        <View
          style={[styles.dialog, { backgroundColor: theme.elevation.level3 }]}
        >
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {message}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onCancel}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text
                style={[styles.actionLabel, { color: theme.colors.primary }]}
              >
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onConfirm}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: destructive
                      ? theme.colors.error
                      : theme.colors.primary,
                  },
                ]}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    padding: SPACING.xl,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.35,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xl,
    // Cancels the text button padding so the labels line up with the dialog
    // content edge, as Material 3 does.
    marginBottom: -SPACING.md,
    marginRight: -SPACING.md,
  },
  actionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.sm,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ConfirmDialog;
