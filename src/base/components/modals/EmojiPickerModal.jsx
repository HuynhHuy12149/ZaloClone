import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, Modal, Animated, Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/base/context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EMOJIS = [
  '😂', '❤️', '😍', '👍', '🙏', '😭', '😘', '🔥',
  '😊', '🥰', '✨', '🥺', '🎉', '👏', '🙌', '🤣',
  '😎', '🤔', '😢', '🤤', '🤩', '🥳', '🤯', '😴',
  '🙄', '😜', '😇', '🤠', '🤡', '👻', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽',
  '🙀', '😿', '😾', '🤲', '👐', '🙌', '👏', '🤝',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️',
  '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆',
  '👇', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧',
  '🐦', '🐤', '🦉', '🦇', '🦋', '🐌', '🐞', '🐜',
  '🍎', '🍓', '🍑', '🍐', '🍊', '🍋', '🍌', '🍉',
  '🍇', '🥝', '🫐', '🍈', '🍒', '🥭', '🍍', '🥥',
  '⚽️', '🏀', '🏈', '⚾️', '🎾', '🏐', '🏉', '🎱',
  '🏓', '🏸', '🏒', '⛳️', '🪁', '🏹', '🎣', '🥊',
  '🚗', '🚕', '🚙', '🚌', '🏎', '🚓', '🚑', '🚒',
  '🚲', '🛵', '🏍', '🛺', '✈️', '🚀', '⛵️', '🛰',
  '🏠', '🏡', '🏢', '🏦', '🏥', '🏨', '🏪', '🏫',
];

const EmojiItem = React.memo(({ item, onSelect }) => {
  return (
    <TouchableOpacity
      className="flex-1 aspect-square justify-center items-center"
      onPress={() => onSelect(item)}
      activeOpacity={0.6}
    >
      <Text className="text-[28px]">{item}</Text>
    </TouchableOpacity>
  );
});

const EmojiPickerModal = forwardRef(({ onSelect }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const show = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true })
    ]).start(() => setVisible(false));
  };

  useImperativeHandle(ref, () => ({
    present: show,
    dismiss: hide,
  }));

  const handleSelect = (emoji) => {
    onSelect(emoji);
  };

  const renderItem = ({ item }) => (
    <EmojiItem item={item} onSelect={handleSelect} />
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={hide}
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View className="absolute inset-0 bg-black/30" style={{ opacity: backdropOpacity }} />
        </TouchableWithoutFeedback>

        <Animated.View
          className="rounded-t-3xl bg-white dark:bg-zalo-darkCard"
          style={{
            height: SCREEN_HEIGHT * 0.4,
            transform: [{ translateY: sheetTranslateY }],
            paddingBottom: insets.bottom + 20
          }}
        >
          <View className="w-10 h-1 rounded-full self-center my-2.5 bg-gray-300 dark:bg-zalo-darkBorder" />
          <View className="flex-row justify-between items-center px-5 py-2.5">
            <Text className="text-base font-bold text-black dark:text-white">Biểu tượng cảm xúc</Text>
            <TouchableOpacity onPress={hide} hitSlop={10}>
              <Text className="font-semibold text-zalo-blue">Đóng</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={EMOJIS}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={8}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={40}
            maxToRenderPerBatch={40}
            windowSize={5}
            removeClippedSubviews={true}
            keyboardShouldPersistTaps="always"
          />
        </Animated.View>
      </View>
    </Modal>
  );
});

export default EmojiPickerModal;
