import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/* ── Icon map ── */
const TAB_CONFIG = {
  Messages: {
    active: (c) => <Ionicons name="chatbubble-ellipses" size={24} color={c} />,
    inactive: (c) => <Ionicons name="chatbubble-ellipses-outline" size={26} color={c} />,
  },
  Contacts: {
    active: (c) => <Ionicons name="people" size={26} color={c} />,
    inactive: (c) => <Ionicons name="people-outline" size={28} color={c} />,
  },
  Discover: {
    active: (c) => <Ionicons name="compass" size={28} color={c} />,
    inactive: (c) => <Ionicons name="compass-outline" size={28} color={c} />,
  },
  Home: {
    active: (c) => <Ionicons name="layers" size={26} color={c} />,
    inactive: (c) => <Ionicons name="layers-outline" size={26} color={c} />,
  },
  Profile: {
    active: (c) => <Ionicons name="person" size={24} color={c} />,
    inactive: (c) => <Ionicons name="person-outline" size={26} color={c} />,
  },
};

/* ── Single animated tab item ── */
function TabItem({ route, isFocused, colors, onPress, onLongPress }) {
  const cfg = TAB_CONFIG[route.name] || {};
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.12 : 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 260,
        mass: 0.5,
      }),
      Animated.spring(dotAnim, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 220,
      }),
    ]).start();
  }, [isFocused]);

  const activeColor = colors.tabActive;
  const inactiveColor = colors.tabInactive;
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <TouchableOpacity
      key={route.key}
      onPress={onPress}
      onLongPress={onLongPress}
      style={ss.tabItem}
      activeOpacity={0.7}
    >
      {/* Icon with scale animation */}
      <Animated.View style={[ss.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        {/* Active pill background */}
        {isFocused && (
          <Animated.View
            style={[
              ss.activePill,
              {
                backgroundColor: colors.accentLight,
                opacity: dotAnim,
                transform: [{ scaleX: dotAnim }],
              },
            ]}
          />
        )}
        {isFocused
          ? cfg.active?.(iconColor)
          : cfg.inactive?.(iconColor)
        }
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ── Main CustomTabBar ── */
export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const BAR_HEIGHT = 62;

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 24) : Math.max(insets.bottom, 16),
      paddingHorizontal: 20,
      backgroundColor: 'transparent',
    }}>
      <View
        style={[
          ss.container,
          {
            backgroundColor: colors.tabBg,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              colors={colors}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    borderRadius: 32,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  activePill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
