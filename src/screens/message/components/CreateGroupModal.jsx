import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '@/base/components/Avatar';

export default function CreateGroupModal({
  visible,
  onClose,
  groupName,
  setGroupName,
  friendsList,
  selectedFriends,
  toggleFriendSelect,
  onSubmit,
  isPending,
  colors,
}) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
      <View className="w-[85%] rounded-2xl p-5 max-h-[80%]" style={{ backgroundColor: colors.bgCard }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors?.text || '#000' }}>Tạo nhóm mới</Text>
        <TextInput
          className="rounded-lg px-3 py-2.5 mb-4"
          style={{ backgroundColor: colors.bgInput, color: colors?.text || '#000' }}
          placeholder="Tên nhóm..."
          placeholderTextColor={colors?.textMuted || '#9ca3af'}
          value={groupName}
          onChangeText={setGroupName}
        />
        <Text className="text-sm font-semibold mb-2" style={{ color: colors?.textSub || '#6b7280' }}>
          Chọn thành viên:
        </Text>
        <ScrollView className="max-h-[300px] mb-4">
          {friendsList.map((f) => (
            <TouchableOpacity
              key={f.id}
              className="flex-row items-center py-2"
              onPress={() => toggleFriendSelect(f.id)}
            >
              <MaterialCommunityIcons
                name={
                  selectedFriends.includes(f.id)
                    ? 'checkbox-marked-circle'
                    : 'checkbox-blank-circle-outline'
                }
                size={24}
                color={
                  selectedFriends.includes(f.id)
                    ? (colors?.accent || '#0068ff')
                    : (colors?.border || '#e5e7eb')
                }
              />
              <Avatar
                url={f.avatar_url}
                name={f.full_name || f.username}
                size={36}
                className="mx-3"
              />
              <Text className="text-base" style={{ color: colors?.text || '#000' }}>
                {f.full_name || f.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className="flex-row justify-end gap-3">
          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.bgInput }}
            onPress={onClose}
          >
            <Text className="font-semibold" style={{ color: colors?.text || '#000' }}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg bg-zalo-blue ${isPending ? 'opacity-50' : ''}`}
            onPress={onSubmit}
            disabled={isPending}
          >
            <Text className="text-white font-semibold">Tạo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
