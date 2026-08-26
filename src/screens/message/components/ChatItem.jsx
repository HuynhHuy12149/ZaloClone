import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Avatar from '@/base/components/Avatar';
import { useTheme } from '@/base/context/ThemeContext';

const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export default function ChatItem({ item, latestMsg, currentUserId, senderName, onPress }) {
  const { colors } = useTheme();
  const isUnread =
    latestMsg &&
    !latestMsg.is_read &&
    latestMsg.sender_id !== currentUserId;

  return (
    <TouchableOpacity
      className="flex-row px-4 py-3.5 items-center"
      style={{ backgroundColor: colors.bgCard }}
      activeOpacity={0.65}
      onPress={onPress}
    >
      {/* Avatar */}
      <View className="relative mr-3.5">
        <Avatar
          url={item.avatar_url}
          name={item.full_name || item.username}
          size={56}
          rounded={false}
        />
        {/* Online dot */}
        <View className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2" style={{ borderColor: colors.bgCard }} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center flex-1 mr-2">
            <Text
              className={`text-base flex-1 ${isUnread ? 'font-extrabold' : 'font-bold'}`}
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {item.full_name || item.username}
            </Text>
          </View>
          <Text
            className={`text-xs ${isUnread ? 'text-zalo-blue font-semibold' : 'text-gray-400'}`}
          >
            {latestMsg ? formatTime(latestMsg.created_at) : '-'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text
            className={`text-sm flex-1 mr-2 ${isUnread ? 'font-semibold' : ''}`}
            style={{ color: isUnread ? colors.text : colors.textSub }}
            numberOfLines={1}
          >
            {latestMsg
              ? latestMsg.sender_id === currentUserId
                ? `Bạn: ${latestMsg.content} ${latestMsg.is_read ? '· Đã xem' : ''}`
                : `${senderName || item.full_name || item.username || 'Ai đó'}: ${latestMsg.content}`
              : 'Chưa có tin nhắn...'}
          </Text>
          {isUnread && <View className="w-2.5 h-2.5 rounded-full bg-red-500" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
