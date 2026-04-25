import React, { useEffect, useState } from "react";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../libs/supabase";

import LoginScreen from "../screens/auths/Login";
import RegisterScreen from "../screens/auths/Register";
import CreatePostScreen from "../screens/main/CreatePostScreen";

import TabsNavigator from "./TabsNavigator";
import { ThemeProvider, useTheme } from "../utils/ThemeContext";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [session, setSession] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} translucent={true} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          <>
            <Stack.Screen name="MainApp" component={TabsNavigator} />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
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
