import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  Modal, TouchableWithoutFeedback, Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/base/context/ThemeContext';
import { PrivacyOptions } from '@/base/shared/enums/postEnums';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PrivacyPickerSheet = forwardRef(({ onSelect, selectedValue }, ref) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const show = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setVisible(false);
    });
  };

  useImperativeHandle(ref, () => ({
    present: show,
    dismiss: hide,
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View
            className="absolute inset-0 bg-black/50"
            style={{ opacity: backdropOpacity }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          className="rounded-t-[32px] px-5 pt-3"
          style={{ transform: [{ translateY: sheetTranslateY }], backgroundColor: colors.bgCard }}
        >
          <View className="w-10 h-1 rounded-full self-center mb-5" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />

          <Text className="text-[17px] font-bold text-center mb-6" style={{ color: colors?.text || '#000' }}>
            Ai có thể xem bài viết này?
          </Text>

          <View className="gap-2.5">
            {PrivacyOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className="flex-row items-center gap-3.5 py-3"
                onPress={() => {
                  onSelect(opt.value);
                  hide();
                }}
              >
                <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: colors.bgInput }}>
                  <Ionicons name={opt.icon} size={22} color={colors?.text || '#000'} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold mb-0.5" style={{ color: colors?.text || '#000' }}>{opt.label}</Text>
                  <Text className="text-[13px] text-gray-400">{opt.desc}</Text>
                </View>

                <View className="w-6 h-6 items-center justify-center">
                  {selectedValue === opt.value ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors?.accent || '#0068ff'} />
                  ) : (
                    <View className="w-5 h-5 rounded-full border-[1.5px]" style={{ borderColor: colors?.border || '#d1d5db' }} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="h-10" />
        </Animated.View>
      </View>
    </Modal>
  );
});

export default PrivacyPickerSheet;
