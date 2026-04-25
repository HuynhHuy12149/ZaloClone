import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

/**
 * AnimatedTabBar — sub-tab used inside screen content
 * @param {string[]} tabs     – tab labels
 * @param {number}   active   – active index
 * @param {func}     onChange – (index) => void
 * @param {object}   style    – extra container style
 */
export default function AnimatedTabBar({ tabs, active, onChange, style }) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / tabs.length;
  const translateX = useRef(new Animated.Value(active * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: active * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 260,
      mass: 0.5,
    }).start();
  }, [active, tabWidth]);

  return (
    <View
      style={[
        ss.container,
        {
          backgroundColor: colors.bgCard,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      {/* Sliding bottom indicator container */}
      <Animated.View
        style={[
          ss.indicatorWrap,
          {
            width: `${100 / tabs.length}%`,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={[ss.indicatorLine, { backgroundColor: colors.accent }]} />
      </Animated.View>

      {tabs.map((label, i) => {
        const isActive = active === i;
        return (
          <TouchableOpacity
            key={label}
            style={ss.tab}
            onPress={() => onChange(i)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                ss.label,
                {
                  color: isActive ? colors.accent : colors.textSub,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ss = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    position: 'relative',
    height: 48,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.1,
  },
  indicatorWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    alignItems: 'center',
  },
  indicatorLine: {
    width: 44,
    height: 3,
    borderRadius: 3,
  },
});
