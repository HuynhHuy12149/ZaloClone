import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/base/components/Avatar';

const STORIES = [
  { id: 'add', label: 'Tạo mới', isAdd: true },
  { id: 's1', label: 'Lan Anh' },
  { id: 's2', label: 'Sơn Núi' },
  { id: 's3', label: 'Annnnn' },
  { id: 's4', label: 'Kiệt Vip' },
];

export default function StoryBar({ colors, onAddStory }) {
  return (
    <View 
      className="rounded-[32px] py-4 shadow-sm"
      style={{ elevation: 1, backgroundColor: colors.bgCard }}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      >
        {STORIES.map((story) => (
          <TouchableOpacity 
            key={story.id} 
            className="items-center w-16"
            activeOpacity={0.8}
            onPress={story.isAdd ? onAddStory : undefined}
          >
            <View 
              className="p-0.5 rounded-3xl border-2 mb-2"
              style={{ borderColor: story.isAdd ? 'transparent' : (colors?.storyBorder || colors?.accent || '#0068ff') }}
            >
              {story.isAdd ? (
                <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.bgInput }}>
                  <View className="w-6 h-6 rounded-full bg-zalo-blue items-center justify-center">
                    <Ionicons name="add" size={18} color="#fff" />
                  </View>
                </View>
              ) : (
                <Avatar url={null} name={story.label} size={54} rounded={false} />
              )}
            </View>
            <Text className="text-[11px] font-bold text-center" style={{ color: colors?.text || '#000' }} numberOfLines={1}>
              {story.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
