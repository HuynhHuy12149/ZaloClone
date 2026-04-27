import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={[styles.container, { backgroundColor: colors.bgCard || '#fff' }]}>
      {REACTIONS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => onSelect(item.id)}
          activeOpacity={0.7}
        >
          {item.isIcon ? (
            <Ionicons name={item.icon} size={24} color={item.color} />
          ) : (
            <Text style={styles.emoji}>{item.emoji}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  item: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});
