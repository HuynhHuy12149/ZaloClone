import React, { useEffect, useState } from "react";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../store/authStore";
import { LoginScreen } from "../screens/auths/login";
import { RegisterScreen } from "../screens/auths/register";
import { Routers } from "../router/Router";
import TabsNavigator from "./TabsNavigator";
import { ThemeProvider, useTheme } from "../utils/ThemeContext";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isDark, colors } = useTheme();
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors?.background || '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors?.primary || '#0068FF'} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} translucent={true} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainApp" component={TabsNavigator} />
            {Routers.map((route, index) => (
              <Stack.Screen
                key={index}
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
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function MainNavigator() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
