import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/base/context/ThemeContext';

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
      className="flex-row relative h-[52px] z-[5] bg-white dark:bg-zalo-darkCard"
      style={style}
    >
      {/* Sliding bottom indicator container */}
      <Animated.View
        className="absolute bottom-0 left-0 h-[3px] items-center"
        style={{
          width: `${100 / tabs.length}%`,
          transform: [{ translateX }],
        }}
      >
        <View 
          className="w-[50px] h-[3px] rounded-full"
          style={{ backgroundColor: colors.accent }} 
        />
      </Animated.View>

      {tabs.map((label, i) => {
        const isActive = active === i;
        return (
          <TouchableOpacity
            key={label}
            className="flex-1 items-center justify-center"
            onPress={() => onChange(i)}
            activeOpacity={0.75}
          >
            <Text
              className="text-base tracking-wide"
              style={{
                color: isActive ? colors.accent : colors.textSub,
                fontWeight: isActive ? '700' : '500',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
