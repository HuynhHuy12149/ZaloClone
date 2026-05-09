import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MenuControl from '../../../../../components/MenuControl';
import { REACTIONS } from '../../../../../utils/constants/postEnums';
import { handleReaction } from '../../../../../services/supabaseService/postService';

export default function PostActions({ item, colors, onReactionUpdate, onCommentPress, isDetail }) {
  const [localLiked, setLocalLiked] = useState(item.is_liked);
  const [reactionType, setReactionType] = useState(item.user_reaction || 'heart');
  const [showPicker, setShowPicker] = useState(false);
  const likeBtnRef = useRef(null);

  useEffect(() => {
    setLocalLiked(item.is_liked);
    setReactionType(item.user_reaction || 'heart');
  }, [item.is_liked, item.user_reaction]);

  const handleLike = async () => {
    const newLikedState = !localLiked;
    const type = newLikedState ? 'heart' : reactionType;
    const oldLiked = localLiked;
    const oldType = reactionType;

    setLocalLiked(newLikedState);
    if (newLikedState) setReactionType('heart');
    if (onReactionUpdate) onReactionUpdate(newLikedState, type);

    const res = await handleReaction(item.id, type);
    if (!res.success) {
      setLocalLiked(oldLiked);
      setReactionType(oldType);
      if (onReactionUpdate) onReactionUpdate(oldLiked, oldType);
    }
  };

  const onSelectReaction = async (type) => {
    setShowPicker(false);
    const oldLiked = localLiked;
    const oldType = reactionType;

    setLocalLiked(true);
    setReactionType(type);
    if (onReactionUpdate) onReactionUpdate(true, type);

    const res = await handleReaction(item.id, type);
    if (!res.success) {
      setLocalLiked(oldLiked);
      setReactionType(oldType);
      if (onReactionUpdate) onReactionUpdate(oldLiked, oldType);
    }
  };

  return (
    <View style={styles.actionsRow}>
      <MenuControl
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        from={likeBtnRef}
        horizontal
        isModal={false}
        items={REACTIONS.map(r => ({
          ...r,
          onPress: () => onSelectReaction(r.id)
        }))}
      />

      <TouchableOpacity
        ref={likeBtnRef}
        collapsable={false}
        style={[
          styles.actionBtn, 
          { backgroundColor: localLiked ? '#ff475715' : colors.bgInput + '40' },
          isDetail && { flex: 0, paddingHorizontal: 20 } // Don't take full width in detail
        ]}
        activeOpacity={0.7}
        onPress={handleLike}
        onLongPress={() => setShowPicker(true)}
      >
        {localLiked ? (
          <>
            <Text style={{ fontSize: 18, marginRight: 4 }}>
              {REACTIONS.find(r => r.id === reactionType)?.emoji || '👍'}
            </Text>
            <Text style={[styles.actionBtnText, { color: '#ff4757' }]}>
              {REACTIONS.find(r => r.id === reactionType)?.label || 'Thích'}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="heart-outline" size={20} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Yêu thích</Text>
          </>
        )}
      </TouchableOpacity>
      
      {!isDetail && (
        <>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.bgInput + '40' }]} 
            activeOpacity={0.7} 
            onPress={onCommentPress}
          >
            <MaterialCommunityIcons name="comment-outline" size={19} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Phản hồi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.bgInput + '40' }]} 
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Gửi</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20, // Pill style
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700', // Bolder font
  },
});
