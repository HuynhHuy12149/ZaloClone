import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatInput({
  inputText,
  setInputText,
  showPlusMenu,
  setShowPlusMenu,
  handleSend,
  insets,
  colors,
  typingText
}) {
  return (
    <View className="absolute bottom-0 left-0 right-0">
      {typingText ? (
        <View className="px-6 flex-row items-center bg-transparent">
          <Text className="text-xs italic text-gray-400">{typingText.replace('...', '')}</Text>
          <AnimatedTypingDots color={colors?.textMuted || '#888'} />
        </View>
      ) : null}

      {showPlusMenu && (
        <View 
          className="absolute left-4 bg-white dark:bg-zalo-darkCard rounded-xl p-2 shadow-lg border border-black/5 z-50"
          style={{ bottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) + 60 : Math.max(insets.bottom - 10, 12) + 60 }}
        >
          <TouchableOpacity className="flex-row items-center py-2.5 px-3">
            <View className="w-8 h-8 rounded-full justify-center items-center mr-3 bg-amber-500">
              <Ionicons name="mic" size={18} color="#fff" />
            </View>
            <Text className="text-[15px] font-medium text-black dark:text-white">Giọng nói</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2.5 px-3">
            <View className="w-8 h-8 rounded-full justify-center items-center mr-3 bg-green-500">
              <Ionicons name="image" size={18} color="#fff" />
            </View>
            <Text className="text-[15px] font-medium text-black dark:text-white">Hình ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2.5 px-3">
            <View className="w-8 h-8 rounded-full justify-center items-center mr-3 bg-blue-500">
              <Ionicons name="location" size={18} color="#fff" />
            </View>
            <Text className="text-[15px] font-medium text-black dark:text-white">Vị trí</Text>
          </TouchableOpacity>
        </View>
      )}

      <View 
        className="flex-row items-center px-2 py-2.5 bg-white dark:bg-zalo-darkCard mx-4 mt-2 rounded-[30px] shadow-lg border border-black/5"
        style={{ marginBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom - 10, 12) }}
      >
        <TouchableOpacity className="p-2 justify-center items-center" onPress={() => setShowPlusMenu(!showPlusMenu)}>
          <Ionicons name="add-circle" size={30} color={colors?.textMuted || '#888'} />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center rounded-3xl pl-4 pr-2 ml-2 min-h-[44px] max-h-[120px]">
          <TextInput
            className="flex-1 text-base text-black dark:text-white pt-0 pb-0"
            placeholder="Tin nhắn..."
            placeholderTextColor={colors?.textMuted || '#999'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onFocus={() => setShowPlusMenu(false)}
          />
          {inputText.trim().length === 0 ? (
            <TouchableOpacity className="pl-2">
              <Ionicons name="happy-outline" size={26} color={colors?.textMuted || '#888'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-zalo-blue justify-center items-center ml-1" 
              onPress={handleSend}
            >
              <Ionicons name="paper-plane" size={16} color="#fff" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const AnimatedTypingDots = ({ color }) => {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const createAnimation = (dot) =>
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -4,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]);

    Animated.loop(
      Animated.stagger(150, [
        createAnimation(dot1),
        createAnimation(dot2),
        createAnimation(dot3)
      ])
    ).start();
  }, [dot1, dot2, dot3]);

  const dotStyle = {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color,
    marginHorizontal: 2,
  };

  return (
    <View className="flex-row items-center ml-0.5 mt-1">
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};
