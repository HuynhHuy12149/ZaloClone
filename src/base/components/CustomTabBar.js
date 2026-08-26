import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/base/context/ThemeContext';

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
      className="flex-1 items-center justify-center relative"
      activeOpacity={0.7}
    >
      <Animated.View 
        className="relative items-center justify-center w-12 h-12"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        {isFocused && (
          <Animated.View
            className="absolute w-12 h-12 rounded-full"
            style={{
              backgroundColor: colors.accentLight,
              opacity: dotAnim,
              transform: [{ scaleX: dotAnim }],
            }}
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

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 px-5 bg-transparent"
      style={{
        paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 24) : Math.max(insets.bottom, 16),
      }}
    >
      <View
        className="h-16 flex-row rounded-full shadow-lg bg-white dark:bg-zalo-darkCard"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
        }}
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
