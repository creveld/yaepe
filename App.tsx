import React, { useCallback, useMemo, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components/native';
import { useTranslation } from 'react-i18next';

import MainScreen from './src/screens/MainScreen';
import CardEditScreen from './src/screens/CardEditScreen';
import ThemeToggleButton from './src/components/ThemeToggleButton';
import { monochromeDark, monochromeLight } from './src/themes/material3';
import { ActiveCardProvider } from './src/state/ActiveCardContext';
import type { RootStackParams } from './src/navigation/types';
import { queryClient } from './src/queryClient';

import './src/locales/i18n';

const Stack = createNativeStackNavigator<RootStackParams>();

const App = () => {
  const { t } = useTranslation();
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const theme = isDarkMode ? monochromeDark : monochromeLight;

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const screenOptions = useMemo(
    () => ({
      animation: 'slide_from_right' as const,
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        color: theme.colors.onSurface,
        fontWeight: '600' as const,
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <ThemeToggleButton
          isDarkMode={isDarkMode}
          color={theme.colors.onSurface}
          onPress={toggleTheme}
        />
      ),
    }),
    [theme, isDarkMode, toggleTheme],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ActiveCardProvider>
          <NavigationContainer>
            <StatusBar
              backgroundColor="transparent"
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              translucent
            />
            <Stack.Navigator screenOptions={screenOptions}>
              <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{ title: t('title.home') }}
              />
              <Stack.Screen
                name="Add"
                component={CardEditScreen}
                options={{ title: t('title.card_add') }}
              />
              <Stack.Screen
                name="Edit"
                component={CardEditScreen}
                options={{ title: t('title.card_edit') }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ActiveCardProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
