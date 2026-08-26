import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const REACTIONS = [
  { id: 'like', label: 'Thích', icon: 'thumbs-up', color: '#0084FF', isIcon: true },
  { id: 'heart', label: 'Yêu thích', emoji: '❤️' },
  { id: 'haha', label: 'Haha', emoji: '😂' },
  { id: 'wow', label: 'Wow', emoji: '😮' },
  { id: 'sad', label: 'Buồn', emoji: '😢' },
  { id: 'angry', label: 'Phẫn nộ', emoji: '😡' },
];

export default function ReactionPicker({ onSelect, colors }) {
  return (
    <View 
      className="flex-row p-2 rounded-full shadow-md gap-3 items-center justify-center border border-black/5 bg-white dark:bg-zalo-darkCard"
      style={{ elevation: 5 }}
    >
      {REACTIONS.map((item) => (
        <TouchableOpacity
          key={item.id}
          className="w-9 h-9 items-center justify-center"
          onPress={() => onSelect(item.id)}
          activeOpacity={0.7}
        >
          {item.isIcon ? (
            <Ionicons name={item.icon} size={24} color={item.color} />
          ) : (
            <Text className="text-2xl">{item.emoji}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
