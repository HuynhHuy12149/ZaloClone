import React from 'react';
import { View, Text } from 'react-native';
import { REACTIONS } from '@/base/shared/enums/postEnums';

const REACTION_STYLE = {
  heart: { color: '#FF4757' },
  like: { color: '#0084FF' },
  haha: { color: '#FFD32D' },
  wow: { color: '#FFD32D' },
  sad: { color: '#FFD32D' },
  angry: { color: '#FFD32D' },
};

export default function ReactionStats({ types = [], count = 0, colors }) {
  if (count === 0 || types.length === 0) return null;

  return (
    <View className="flex-row items-center">
      <View className="flex-row items-center">
        {types.slice(0, 3).map((type, idx) => {
          const reaction = REACTIONS.find(r => r.id === type) || REACTIONS[0];
          const style = REACTION_STYLE[type];

          return (
            <View
              key={type}
              className="w-5 h-5 rounded-full items-center justify-center border-2"
              style={{
                backgroundColor: style?.color || '#FFD32D',
                borderColor: colors?.bgCard || '#ffffff',
                zIndex: 10 - idx,
                marginLeft: idx > 0 ? -6 : 0
              }}
            >
              <Text className="text-[9px]">{reaction.emoji}</Text>
            </View>
          );
        })}
      </View>
      <Text 
        className="text-[13px] ml-1.5 font-semibold"
        style={{ color: colors?.textSub || '#6b7280' }}
      >
        {count}
      </Text>
    </View>
  );
}
