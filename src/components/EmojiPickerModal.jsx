import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  FlatList, Modal, Animated, Dimensions, 
  TouchableWithoutFeedback, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';

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
      style={s.emojiItem} 
      onPress={() => onSelect(item)}
      activeOpacity={0.6}
    >
      <Text style={s.emojiText}>{item}</Text>
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
      <View style={s.container}>
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            s.sheet, 
            { 
              backgroundColor: colors.bgCard,
              transform: [{ translateY: sheetTranslateY }],
              paddingBottom: insets.bottom + 20
            }
          ]}
        >
          <View style={[s.handle, { backgroundColor: colors.border }]} />
          <View style={s.header}>
            <Text style={[s.title, { color: colors.text }]}>Biểu tượng cảm xúc</Text>
            <TouchableOpacity onPress={hide} hitSlop={10}>
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={EMOJIS}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={8}
            contentContainerStyle={s.listContent}
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

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: { fontSize: 16, fontWeight: '700' },
  listContent: { paddingHorizontal: 10, paddingBottom: 20 },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: { fontSize: 28 },
});

export default EmojiPickerModal;
