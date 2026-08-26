import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/base/shared/store/authStore";
import { LoginScreen } from "@/screens/auth/login";
import { RegisterScreen } from "@/screens/auth/register";
import { Routers } from "./Router";
import TabsNavigator from "./TabsNavigator";
import { useTheme } from "@/base/context/ThemeContext";

import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();

function SplashScreen() {
  const { isDark, colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#f2f2f7', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors?.accent || '#0068FF'} />
    </View>
  );
}

export default function MainNavigator() {
  const { user, isInitialized, initialize } = useAuthStore();
  const { isDark, colors } = useTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {!isInitialized ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : user ? (
        <Stack.Group>
          <Stack.Screen name="MainApp" component={TabsNavigator} />
          {Routers.map((route) => (
            <Stack.Screen
              key={route.name}
              name={route.name}
              component={route.component}
              options={
                route.isModal
                  ? {
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    headerShown: false,
                  }
                  : {
                    headerShown: false,
                  }
              }
            />
          ))}
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
    </NavThemeProvider>
  );
}
