import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '@/screens/home';
import { MessagesScreen } from '@/screens/message';
import { ContactsScreen } from '@/screens/contact';
import { DiscoverScreen } from '@/screens/discover';
import { ProfileScreen } from '@/screens/profile';
import CustomTabBar from '@/base/components/CustomTabBar';
import { useTheme } from '@/base/context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Messages"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
