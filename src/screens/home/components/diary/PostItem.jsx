import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Platform, Dimensions, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import PostContent from './PostContent';
import PostMediaGallery from './PostMediaGallery';
import ReactionStats from './ReactionStats';
import PostActions from './PostActions';
import { formatRelativeTime } from '@/base/shared/utils/dateUtils';
import { showToast } from '@/base/shared/utils/toast';
import Avatar from '@/base/components/Avatar';
import { useTheme } from '@/base/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function PostItem({ item, colors: propColors, onOpenPreview, onLike, navigation, onPress, isDetail }) {
  const { colors: themeColors, isDark } = useTheme();
  const colors = propColors || themeColors;
  const [localLiked, setLocalLiked] = useState(item.is_liked);
  const [localLikeCount, setLocalLikeCount] = useState(item.like_count || 0);
  const [localReactionTypes, setLocalReactionTypes] = useState(item.reaction_types || []);
  
  const isSensitive = item.moderation_status === 'sensitive';

  // Sync with props when they change from outside
  useEffect(() => {
    setLocalLiked(item.is_liked);
    setLocalLikeCount(item.like_count || 0);
    setLocalReactionTypes(item.reaction_types || []);
  }, [item.is_liked, item.like_count, item.reaction_types]);
  const [localUserReaction, setLocalUserReaction] = useState(item.user_reaction || null);

  // Sync with prop changes
  useEffect(() => {
    setLocalLiked(item.is_liked);
    setLocalLikeCount(item.like_count || 0);
    setLocalReactionTypes(item.reaction_types || []);
    setLocalUserReaction(item.user_reaction || null);
  }, [item.is_liked, item.like_count, item.reaction_types, item.user_reaction]);

  const onReactionUpdate = (isLiked, type) => {
    if (isLiked) {
      if (!localLiked) {
        setLocalLikeCount(prev => prev + 1);
      }
      
      // Cập nhật danh sách icon: Xóa icon cũ của user này, thêm icon mới vào đầu
      setLocalReactionTypes(prev => {
        const filtered = prev.filter(t => t !== localUserReaction);
        if (filtered.includes(type)) return filtered;
        return [type, ...filtered].slice(0, 3);
      });
      setLocalUserReaction(type);
    } else {
      setLocalLikeCount(prev => Math.max(0, prev - 1));
      // Khi bỏ like, xóa icon của user này khỏi danh sách tạm thời
      setLocalReactionTypes(prev => prev.filter(t => t !== localUserReaction));
      setLocalUserReaction(null);
    }
    setLocalLiked(isLiked);
  };

  const goToDetail = () => {
    if (onPress) {
      onPress();
    } else if (navigation) {
      navigation.navigate('PostDetail', { post: item });
    }
  };

  const handleLocationPress = async () => {
    if (!item.latitude || !item.longitude) {
      showToast.info('Thông báo', 'Bài viết này không có dữ liệu tọa độ bản đồ.');
      return;
    }

    try {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${item.latitude},${item.longitude}`;
      const label = item.location_name;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      showToast.error('Lỗi', 'Không thể mở ứng dụng bản đồ');
    }
  };

  return (
    <View 
      className="mx-3 mb-4 rounded-[32px] pt-4 overflow-hidden shadow-sm"
      style={{ elevation: 2, backgroundColor: colors.bgCard }}
    >
      {/* HEADER SECTION */}
      <Pressable onPress={goToDetail}>
        <View className="flex-row items-center px-4 mb-3">
          <Avatar
            url={item.profiles?.avatar_url}
            name={item.profiles?.full_name || 'Người dùng'}
            size={48}
            rounded={false}
          />
          <View className="flex-1 ml-3 justify-center">
            <View className="flex-row items-center">
              <Text 
                className="text-base font-extrabold" 
                style={{ maxWidth: width * 0.4, color: colors?.text || '#000' }}
                numberOfLines={1}
              >
                {item.profiles?.full_name || 'Người dùng'}
              </Text>
              {item.tagged_friends?.length > 0 && (
                <View className="px-2 py-0.5 rounded-xl ml-2 bg-zalo-blue/15">
                  <Text className="text-[11px] font-bold text-zalo-blue">
                    +{item.tagged_friends.length} người bạn
                  </Text>
                </View>
              )}
            </View>
            
            <View className="flex-row items-center mt-0.5">
              <Text className="text-xs font-medium" style={{ color: colors?.textSub || '#9ca3af' }}>
                {formatRelativeTime(item.created_at)}
              </Text>
              <View className="w-1 h-1 rounded-full mx-1.5 bg-gray-400/40" />
              <Ionicons 
                name={
                  item.privacy === 'Private' ? 'lock-closed' : 
                  item.privacy === 'Friends' ? 'people' : 'earth'
                } 
                size={12} 
                color={colors?.textMuted || '#9ca3af'} 
              />
            </View>
          </View>
          
          {!isDetail && (
            <TouchableOpacity className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: colors.bgInput }}>
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors?.textMuted || '#9ca3af'} />
            </TouchableOpacity>
          )}
        </View>

        {/* LOCATION PILL (IF EXISTS) */}
        {item.location_name && (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleLocationPress} 
            className="px-4 mb-2.5"
          >
            <View className="flex-row items-center px-3 py-1.5 rounded-2xl self-start gap-1.5" style={{ backgroundColor: colors.bgInput }}>
              <Ionicons name="location" size={14} color={colors?.accent || '#0068ff'} />
              <Text 
                className="text-[13px] font-semibold" 
                style={{ maxWidth: width * 0.6, color: colors?.text || '#000' }}
                numberOfLines={1}
              >
                {item.location_name}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors?.textMuted || '#9ca3af'} />
            </View>
          </TouchableOpacity>
        )}
      </Pressable>

      {/* SENSITIVE WRAPPER */}
      <View 
        className="relative overflow-hidden"
        style={{ minHeight: isSensitive ? 260 : undefined }}
      >
        <Pressable onPress={goToDetail}>
          {/* CONTENT SECTION */}
          <View className={`px-4 mb-3 ${isSensitive ? 'opacity-30' : ''}`}>
            <PostContent 
              content={item.content} 
              colors={colors} 
              fontStyle={item.font_style} 
              textColor={item.text_color} 
            />
          </View>
        </Pressable>

        {/* MEDIA SECTION */}
        <View className={isSensitive ? 'opacity-30' : ''}>
          <PostMediaGallery item={item} onOpenPreview={onOpenPreview} />
        </View>

        {/* SENSITIVE OVERLAY */}
        {isSensitive && (
          <BlurView 
            className="absolute inset-0 items-center justify-center p-6 z-10"
            intensity={90} 
            tint="systemMaterial"
          >
            <View className="absolute inset-0" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }} />
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.bgInput }}>
              <MaterialCommunityIcons name="eye-off-outline" size={32} color={colors?.text || '#000'} />
            </View>
            <Text className="text-lg font-extrabold mb-2" style={{ color: colors?.text || '#000' }}>Nội dung nhạy cảm</Text>
            <Text className="text-sm text-center mb-5 leading-5" style={{ color: colors?.textSub || '#6b7280' }}>
              Bài viết này bị ẩn vì có thể chứa nội dung không phù hợp.
            </Text>
          </BlurView>
        )}
      </View>

      {/* MUSIC CARD SECTION */}
      {item.music_data && (
        <View className="px-4 mb-4">
          <View className="flex-row items-center p-2 rounded-2xl border border-white/10" style={{ backgroundColor: colors.bgInput }}>
            <Image source={{ uri: item.music_data.cover }} className="w-11 h-11 rounded-xl" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-extrabold" style={{ color: colors?.text || '#000' }} numberOfLines={1}>
                {item.music_data.title}
              </Text>
              <Text className="text-xs font-medium text-gray-400 mt-0.5" numberOfLines={1}>
                {item.music_data.artist}
              </Text>
            </View>
            <View className="w-8 h-8 rounded-xl items-center justify-center bg-zalo-blue/20">
              <MaterialCommunityIcons name="music" size={18} color={colors?.accent || '#0068ff'} />
            </View>
          </View>
        </View>
      )}

      {/* STATS SECTION */}
      <View className="pb-2">
        <View className="flex-row justify-between items-center px-5 mb-2.5">
          <ReactionStats 
            types={localReactionTypes} 
            count={localLikeCount} 
            colors={colors} 
          />
          <Text className="text-[13px] font-semibold" style={{ color: colors?.textSub || '#6b7280' }}>
            {item.comment_count > 0 ? `${item.comment_count} bình luận` : ''}
          </Text>
        </View>

        <View className="h-[1px] mx-5 mb-1" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />

        <PostActions 
          item={item} 
          colors={colors} 
          onReactionUpdate={onReactionUpdate}
          onCommentPress={goToDetail}
          isDetail={isDetail}
        />
      </View>
    </View>
  );
}
