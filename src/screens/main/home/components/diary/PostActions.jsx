import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MenuControl from '../../../../../components/MenuControl';
import { REACTIONS } from '../../../../../utils/postEnums';
import { handleReaction } from '../../../../../services/supabaseService/postService';

export default function PostActions({ item, colors, onReactionUpdate }) {
  const [localLiked, setLocalLiked] = useState(item.is_liked);
  const [reactionType, setReactionType] = useState(item.user_reaction || 'heart');
  const [showPicker, setShowPicker] = useState(false);
  const likeBtnRef = useRef(null);

  // Đồng bộ khi item thay đổi từ bên ngoài
  useEffect(() => {
    setLocalLiked(item.is_liked);
    setReactionType(item.user_reaction || 'heart');
  }, [item.is_liked, item.user_reaction]);

  const handleLike = async () => {
    const newLikedState = !localLiked;
    // Nếu like mới thì mặc định là heart, nếu bỏ like thì gửi type hiện tại để DB xóa đúng dòng đó
    const type = newLikedState ? 'heart' : reactionType;
    
    const oldLiked = localLiked;
    const oldType = reactionType;

    // Optimistic UI
    setLocalLiked(newLikedState);
    if (newLikedState) setReactionType('heart');
    if (onReactionUpdate) onReactionUpdate(newLikedState, type);

    const res = await handleReaction(item.id, type);
    if (!res.success) {
      // Rollback nếu lỗi
      setLocalLiked(oldLiked);
      setReactionType(oldType);
      if (onReactionUpdate) onReactionUpdate(oldLiked, oldType);
    }
  };

  const onSelectReaction = async (type) => {
    setShowPicker(false);
    const oldLiked = localLiked;
    const oldType = reactionType;

    // Optimistic UI
    setLocalLiked(true);
    setReactionType(type);
    if (onReactionUpdate) onReactionUpdate(true, type);

    const res = await handleReaction(item.id, type);
    if (!res.success) {
      // Rollback
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
        style={styles.actionBtn} 
        activeOpacity={0.6} 
        onPress={handleLike}
        onLongPress={() => setShowPicker(true)}
      >
        {localLiked ? (
          <>
            <Text style={{ fontSize: 20, marginRight: 6 }}>
              {REACTIONS.find(r => r.id === reactionType)?.emoji || '👍'}
            </Text>
            <Text style={[styles.actionBtnText, { color: colors.accent, fontWeight: '700' }]}>
              {REACTIONS.find(r => r.id === reactionType)?.label || 'Thích'}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="heart-outline" size={22} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Yêu thích</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
        <MaterialCommunityIcons name="comment-outline" size={21} color={colors.text} />
        <Text style={[styles.actionBtnText, { color: colors.text }]}>Phản hồi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
        <Ionicons name="share-social-outline" size={22} color={colors.text} />
        <Text style={[styles.actionBtnText, { color: colors.text }]}>Gửi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
