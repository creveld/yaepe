import React from 'react';

import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';

interface ThemeToggleButtonProps extends TouchableOpacityProps {
  isDarkMode: boolean;
  color: string;
}

/**
 * Header button that switches between the light and dark themes.
 */
const ThemeToggleButton = ({
  isDarkMode,
  color,
  ...touchableProps
}: ThemeToggleButtonProps) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={t('theme.toggle')}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      {...touchableProps}
    >
      <FontAwesome5
        name={isDarkMode ? 'sun' : 'moon'}
        size={20}
        color={color}
      />
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;
