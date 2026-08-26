import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ImagePreviewFooter = ({ post, accentColor, visibleAnim }) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View 
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{ 
        paddingBottom: Math.max(insets.bottom, 20),
        transform: [{ translateY: visibleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [200, 0]
        }) }],
        opacity: visibleAnim
      }}
    >
      <BlurView intensity={50} tint="dark" className="px-5 pt-4 pb-2.5">
        <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
          <Text className="text-white text-[15px] leading-[22px] mb-4">{post?.content}</Text>
        </ScrollView>
        
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="flex-row items-center gap-2 bg-white/15 px-4 py-2.5 rounded-full" activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
            <Text className="text-white font-bold text-sm">Thích</Text>
            <View className="flex-row items-center px-1.5 py-0.5 rounded-full ml-1" style={{ backgroundColor: accentColor }}>
              <Text className="text-[10px] text-white">❤️ 1</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-2 bg-white/15 px-4 py-2.5 rounded-full" activeOpacity={0.7}>
            <MaterialCommunityIcons name="comment-outline" size={22} color="#fff" />
            <Text className="text-white font-bold text-sm">Bình luận</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

export default ImagePreviewFooter;
