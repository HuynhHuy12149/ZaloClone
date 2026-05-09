import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Platform, Alert, Dimensions, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import PostContent from './PostContent';
import PostMediaGallery from './PostMediaGallery';
import ReactionStats from './ReactionStats';
import PostActions from './PostActions';
import { formatRelativeTime } from '../../../../../utils/dateUtils';
import Avatar from '../../../../../components/Avatar';

const { width } = Dimensions.get('window');

export default function PostItem({ item, colors, onOpenPreview, onLike, navigation, onPress, isDetail }) {
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
      Alert.alert('Thông báo', 'Bài viết này không có dữ liệu tọa độ bản đồ.');
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
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
    }
  };

  return (
    <View style={[s.postCard, { backgroundColor: colors.bgCard }]}>
      {/* HEADER SECTION */}
      <Pressable onPress={goToDetail}>
        <View style={s.postHeader}>
          <Avatar
            url={item.profiles?.avatar_url}
            name={item.profiles?.full_name || 'Người dùng'}
            size={48}
            rounded={false}
          />
          <View style={s.postMeta}>
            <View style={s.authorRow}>
              <Text style={[s.postAuthor, { color: colors.text }]} numberOfLines={1}>
                {item.profiles?.full_name || 'Người dùng'}
              </Text>
              {item.tagged_friends?.length > 0 && (
                <View style={[s.tagBadge, { backgroundColor: colors.accent + '15' }]}>
                  <Text style={[s.tagBadgeText, { color: colors.accent }]}>
                    +{item.tagged_friends.length} người bạn
                  </Text>
                </View>
              )}
            </View>
            
            <View style={s.subMetaRow}>
              <Text style={[s.postTime, { color: colors.textMuted }]}>
                {formatRelativeTime(item.created_at)}
              </Text>
              <View style={[s.dot, { backgroundColor: colors.textMuted + '40' }]} />
              <Ionicons 
                name={
                  item.privacy === 'Private' ? 'lock-closed' : 
                  item.privacy === 'Friends' ? 'people' : 'earth'
                } 
                size={12} 
                color={colors.textMuted} 
              />
            </View>
          </View>
          
          {!isDetail && (
            <TouchableOpacity style={[s.moreBtn, { backgroundColor: colors.bgInput + '40' }]}>
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* LOCATION PILL (IF EXISTS) */}
        {item.location_name && (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleLocationPress} 
            style={s.locationContainer}
          >
            <View style={[s.locationPill, { backgroundColor: colors.bgInput + '60' }]}>
              <Ionicons name="location" size={14} color={colors.accent} />
              <Text style={[s.locationText, { color: colors.text }]} numberOfLines={1}>
                {item.location_name}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}
      </Pressable>

      {/* SENSITIVE WRAPPER */}
      <View style={{ position: 'relative', overflow: 'hidden', minHeight: isSensitive ? 260 : undefined }}>
        <Pressable onPress={goToDetail}>
          {/* CONTENT SECTION */}
          <View style={[s.contentWrapper, isSensitive && { opacity: 0.3 }]}>
            <PostContent 
              content={item.content} 
              colors={colors} 
              fontStyle={item.font_style} 
              textColor={item.text_color} 
            />
          </View>
        </Pressable>

        {/* MEDIA SECTION */}
        <View style={isSensitive && { opacity: 0.3 }}>
          <PostMediaGallery item={item} onOpenPreview={onOpenPreview} />
        </View>

        {/* SENSITIVE OVERLAY */}
        {isSensitive && (
          <BlurView 
            style={[StyleSheet.absoluteFill, s.sensitiveOverlay]} 
            intensity={90} 
            tint="systemMaterial"
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgCard + 'B3' }]} />
            <View style={[s.sensitiveIconBox, { backgroundColor: colors.bgInput }]}>
              <MaterialCommunityIcons name="eye-off-outline" size={32} color={colors.text} />
            </View>
            <Text style={[s.sensitiveTitle, { color: colors.text }]}>Nội dung nhạy cảm</Text>
            <Text style={[s.sensitiveDesc, { color: colors.textMuted }]}>
              Bài viết này bị ẩn vì có thể chứa nội dung không phù hợp.
            </Text>
          </BlurView>
        )}
      </View>

      {/* MUSIC CARD SECTION */}
      {item.music_data && (
        <View style={s.musicWrapper}>
          <View style={[s.musicCard, { backgroundColor: colors.bgInput + '50' }]}>
            <Image source={{ uri: item.music_data.cover }} style={s.musicCover} />
            <View style={s.musicMeta}>
              <Text style={[s.musicTitle, { color: colors.text }]} numberOfLines={1}>
                {item.music_data.title}
              </Text>
              <Text style={[s.musicArtist, { color: colors.textMuted }]} numberOfLines={1}>
                {item.music_data.artist}
              </Text>
            </View>
            <View style={[s.musicIconBox, { backgroundColor: colors.accent + '20' }]}>
              <MaterialCommunityIcons name="music" size={18} color={colors.accent} />
            </View>
          </View>
        </View>
      )}

      {/* STATS SECTION */}
      <View style={s.footerSection}>
        <View style={s.statsRow}>
          <ReactionStats 
            types={localReactionTypes} 
            count={localLikeCount} 
            colors={colors} 
          />
          <Text style={[s.statsText, { color: colors.textSub }]}>
            {item.comment_count > 0 ? `${item.comment_count} bình luận` : ''}
          </Text>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border + '30' }]} />

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

const s = StyleSheet.create({
  postCard: { 
    marginHorizontal: 12, 
    marginBottom: 16, 
    borderRadius: 32, // Siêu bo góc
    paddingTop: 16,
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 24, 
    elevation: 2,
  },
  postHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  postAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 18, // Squircle style
    backgroundColor: '#f0f0f0' 
  },
  postMeta: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  postAuthor: { fontSize: 16, fontWeight: '800', maxWidth: width * 0.4 },
  tagBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10, 
    marginLeft: 8 
  },
  tagBadgeText: { fontSize: 11, fontWeight: '700' },
  subMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  postTime: { fontSize: 12, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 6 },
  moreBtn: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  locationContainer: { paddingHorizontal: 16, marginBottom: 10 },
  locationPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 14,
    alignSelf: 'flex-start',
    gap: 6
  },
  locationText: { fontSize: 13, fontWeight: '600', maxWidth: width * 0.6 },
  
  contentWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  
  musicWrapper: { paddingHorizontal: 16, marginBottom: 16 },
  musicCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  musicCover: { width: 44, height: 44, borderRadius: 14 },
  musicMeta: { flex: 1, marginLeft: 12 },
  musicTitle: { fontSize: 14, fontWeight: '800' },
  musicArtist: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  musicIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  
  footerSection: { paddingBottom: 8 },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 10 
  },
  reactGroup: { flexDirection: 'row', alignItems: 'center' },
  emojiStack: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: { 
    width: 20, height: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF' // Cần sync với màu nền card
  },
  statsText: { fontSize: 13, marginLeft: 6, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 20, marginBottom: 4 },
  actionsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    position: 'relative'
  },
  pickerWrapper: {
    position: 'absolute',
    top: -55,
    left: 12,
    zIndex: 9999,
  },
  actionBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    gap: 8 
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
  sensitiveOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  sensitiveIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sensitiveTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  sensitiveDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  sensitiveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  sensitiveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
