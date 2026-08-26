import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatRelativeTime } from '@/base/shared/utils/dateUtils';

const ImagePreviewHeader = ({ onClose, index, total, post, visibleAnim }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Animated.View 
      className="absolute top-0 left-0 right-0 z-50"
      style={{ 
        paddingTop: insets.top,
        transform: [{ translateY: visibleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0]
        }) }],
        opacity: visibleAnim
      }}
    >
      <BlurView intensity={40} tint="dark" className="pb-2">
        <View className="flex-row items-center justify-between w-full px-4 h-14">
          <TouchableOpacity onPress={onClose} hitSlop={15} className="w-10 h-10 items-center justify-center">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View className="items-center">
            <View className="flex-row items-center">
              <Text className="text-gray-300 text-xs font-medium">{formatRelativeTime(post?.created_at)}</Text>
              <Ionicons 
                name={
                  post?.privacy === 'Private' ? 'lock-closed' : 
                  post?.privacy === 'Friends' ? 'people' : 'earth'
                } 
                size={10} 
                color="#ccc" 
                style={{ marginLeft: 4 }} 
              />
            </View>
            <Text className="text-white text-base font-bold mt-0.5">{index + 1}/{total}</Text>
          </View>

          <TouchableOpacity hitSlop={15} className="w-10 h-10 items-center justify-center">
            <MaterialCommunityIcons name="dots-horizontal" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

export default ImagePreviewHeader;
