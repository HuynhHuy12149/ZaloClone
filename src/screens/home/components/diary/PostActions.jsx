import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MenuControl from '@/base/components/MenuControl';
import { REACTIONS } from '@/base/shared/enums/postEnums';
import { handleReaction } from '@/base/services/postService';

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
    <View className="flex-row items-center py-3 px-3 gap-2">
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
        className={`flex-row items-center justify-center py-2.5 rounded-full gap-1 ${
          isDetail ? 'px-5' : 'flex-1'
        }`}
        style={{ backgroundColor: localLiked ? '#ff475715' : colors?.bgInput + '40' }}
        activeOpacity={0.7}
        onPress={handleLike}
        onLongPress={() => setShowPicker(true)}
      >
        {localLiked ? (
          <>
            <Text className="text-lg mr-1">
              {REACTIONS.find(r => r.id === reactionType)?.emoji || '👍'}
            </Text>
            <Text className="text-[13px] font-bold text-[#ff4757]">
              {REACTIONS.find(r => r.id === reactionType)?.label || 'Thích'}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="heart-outline" size={20} color={colors?.text || '#000'} />
            <Text 
              className="text-[13px] font-bold"
              style={{ color: colors?.text }}
            >
              Yêu thích
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      {!isDetail && (
        <>
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-full gap-1"
            style={{ backgroundColor: colors?.bgInput + '40' }} 
            activeOpacity={0.7} 
            onPress={onCommentPress}
          >
            <MaterialCommunityIcons name="comment-outline" size={19} color={colors?.text || '#000'} />
            <Text 
              className="text-[13px] font-bold"
              style={{ color: colors?.text }}
            >
              Phản hồi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-full gap-1"
            style={{ backgroundColor: colors?.bgInput + '40' }} 
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={20} color={colors?.text || '#000'} />
            <Text 
              className="text-[13px] font-bold"
              style={{ color: colors?.text }}
            >
              Gửi
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
