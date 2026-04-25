import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

/* ── Icon map ── */
const TAB_CONFIG = {
  Messages: {
    label: 'Tin nhắn',
    active: (c) => <MaterialCommunityIcons name="message-text" size={26} color={c} />,
    inactive: (c) => <MaterialCommunityIcons name="message-text-outline" size={26} color={c} />,
  },
  Contacts: {
    label: 'Danh bạ',
    active: (c) => <MaterialCommunityIcons name="contacts" size={26} color={c} />,
    inactive: (c) => <MaterialCommunityIcons name="contacts-outline" size={26} color={c} />,
  },
  Discover: {
    label: 'Khám phá',
    active: (c) => <Ionicons name="compass" size={27} color={c} />,
    inactive: (c) => <Ionicons name="compass-outline" size={27} color={c} />,
  },
  Home: {
    label: 'Nhật ký',
    active: (c) => <Ionicons name="time" size={26} color={c} />,
    inactive: (c) => <Ionicons name="time-outline" size={26} color={c} />,
  },
  Profile: {
    label: 'Cá nhân',
    active: (c) => <FontAwesome5 name="user-alt" size={22} color={c} />,
    inactive: (c) => <FontAwesome5 name="user" size={22} color={c} />,
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

      {/* Label */}
      <Text
        style={[
          ss.label,
          { color: isFocused ? activeColor : inactiveColor,
            fontWeight: isFocused ? '700' : '400' },
        ]}
        numberOfLines={1}
      >
        {cfg.label || route.name}
      </Text>

      {/* Active dot */}
      <Animated.View
        style={[
          ss.dot,
          {
            backgroundColor: activeColor,
            opacity: dotAnim,
            transform: [{ scaleX: dotAnim }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

/* ── Main CustomTabBar ── */
export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const BAR_HEIGHT = 62;

  return (
    <View
      style={[
        ss.container,
        {
          backgroundColor: colors.tabBg,
          borderTopColor: colors.tabBorder,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 0),
          height: BAR_HEIGHT + Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 0),
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
  );
}

const ss = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 2,
    position: 'relative',
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
  },
  activePill: {
    position: 'absolute',
    width: 48,
    height: 28,
    borderRadius: 14,
  },
  label: {
    fontSize: 10.5,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  dot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
