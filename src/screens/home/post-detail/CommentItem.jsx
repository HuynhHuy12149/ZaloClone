import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Avatar from '@/base/components/Avatar';
import { useTheme } from '@/base/context/ThemeContext';

export default function CommentItem({ comment, level = 0, onReply }) {
  const { colors } = useTheme();
  return (
    <View className={`mb-6 ${level > 0 ? 'ml-8' : ''}`}>
      <View className="flex-row">
        <Avatar 
          url={comment.profiles?.avatar_url} 
          name={comment.profiles?.full_name} 
          size={level > 0 ? 32 : 40} 
          rounded={false} 
        />
        <View className="flex-1 ml-3.5">
          <View className="rounded-3xl rounded-tl-sm px-4 py-3 self-start" style={{ backgroundColor: colors.bgInput }}>
            <Text className="font-extrabold text-sm mb-1" style={{ color: colors.text }}>
              {comment.profiles?.full_name}
            </Text>
            <Text className="text-[15px] leading-[22px]" style={{ color: colors.text }}>
              {comment.content}
            </Text>
          </View>
          <View className="flex-row items-center mt-1.5 ml-1 gap-5">
            <Text className="text-xs font-medium text-gray-400">27 phút</Text>
            <TouchableOpacity onPress={() => onReply(comment)}>
              <Text className="text-xs font-bold text-zalo-blue">Phản hồi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {comment.children?.map(child => (
        <CommentItem key={child.id} comment={child} level={level + 1} onReply={onReply} />
      ))}
    </View>
  );
}
