import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/base/components/Avatar';

export default function PostComposerBar({ user, colors, placeholder = 'Hôm nay bạn thế nào?', onPress }) {
  return (
    <TouchableOpacity
      className="flex-row items-center rounded-[32px] px-3 py-2.5 mb-4 shadow-sm"
      style={{ elevation: 1, backgroundColor: colors.bgCard }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Avatar
        url={user?.avatar_url}
        name={user?.full_name}
        size={44}
        rounded={false}
      />
      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-semibold" style={{ color: colors?.textPlaceholder || colors?.textSub || '#9ca3af' }}>
          {placeholder}
        </Text>
      </View>
      <View className="w-10 h-10 rounded-2xl items-center justify-center bg-zalo-blue/15">
        <Ionicons name="image" size={20} color={colors?.accent || '#0068ff'} />
      </View>
    </TouchableOpacity>
  );
}
