import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { REACTIONS } from '../../../../../utils/constants/postEnums';

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
    <View style={styles.container}>
      <View style={styles.emojiStack}>
        {types.slice(0, 3).map((type, idx) => {
          const reaction = REACTIONS.find(r => r.id === type) || REACTIONS[0];
          const style = REACTION_STYLE[type];

          return (
            <View
              key={type}
              style={[
                styles.emojiCircle,
                {
                  backgroundColor: style?.color || '#FFD32D',
                  zIndex: 10 - idx,
                  marginLeft: idx > 0 ? -6 : 0
                }
              ]}
            >
              <Text style={{ fontSize: 9 }}>{reaction.emoji}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.statsText, { color: colors.textSub }]}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  statsText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600'
  },
});
