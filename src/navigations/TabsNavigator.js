import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/main/home';
import { MessagesScreen } from '../screens/main/message';
import { ContactsScreen } from '../screens/main/contact';
import { DiscoverScreen } from '../screens/main/discover';
import { ProfileScreen } from '../screens/main/profile';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Messages"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
