import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import { queryClient } from '@/base/services/queryClient';
import { ThemeProvider } from '@/base/context/ThemeContext';
import { LanguageProvider } from '@/base/context/LanguageContext';
import MainNavigator from '@/base/navigation/MainNavigator';
import './global.css';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <ThemeProvider>
              <LanguageProvider>
                <MainNavigator />
              </LanguageProvider>
            </ThemeProvider>
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
