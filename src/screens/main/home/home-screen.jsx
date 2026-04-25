import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator,
  Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions,
  LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPosts } from '../../../services/supabaseService/postService';
import { supabase } from '../../../libs/supabase';
import ZaloHeader from '../../../components/ZaloHeader';
import AnimatedTabBar from '../../../components/AnimatedTabBar';
import { useTheme } from '../../../utils/ThemeContext';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width } = Dimensions.get('window');

const STORIES = [
  { id: 'add', label: 'Tạo mới', isAdd: true },
  { id: 's1', label: 'Lan Anh' },
  { id: 's2', label: 'Sơn Núi' },
  { id: 's3', label: 'Annnnn' },
  { id: 's4', label: 'Kiệt Vip' },
];

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { colors } = useTheme();
  const s = styles(colors);

  const fetchPosts = async () => {
    const response = await getPosts();
    if (response.success) setPosts(response.data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
    const channelId = `posts_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const handleTabChange = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(index);
  };

  const renderHeader = () => (
    <View style={s.headerContainer}>
      {/* Post composer */}
      <TouchableOpacity
        style={s.composer}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={s.composerAvatar} />
        <Text style={s.composerPlaceholder}>Hôm nay bạn thế nào?</Text>
        <View style={s.composerDivider} />
        <View style={s.composerActions}>
          <View style={s.composerBtnWrap}>
            <Ionicons name="image" size={20} color="#4caf50" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Stories */}
      <View style={s.storiesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storiesScroll}>
          {STORIES.map((story) => (
            <View key={story.id} style={s.storyWrap}>
              <View style={[s.storyRing, story.isAdd && { borderColor: 'transparent' }]}>
                {story.isAdd ? (
                  <View style={[s.storyImg, { backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center' }]}>
                    <View style={[s.addBtn, { backgroundColor: colors.accent }]}>
                      <Ionicons name="add" size={18} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <Image source={{ uri: `https://i.pravatar.cc/150?u=${story.id}` }} style={s.storyImg} />
                )}
              </View>
              <Text style={s.storyLabel} numberOfLines={1}>{story.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={s.postCard}>
      {/* Post header */}
      <View style={s.postHeader}>
        <Image
          source={{ uri: item.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${item.id}` }}
          style={s.postAvatar}
        />
        <View style={s.postMeta}>
          <Text style={s.postAuthor}>{item.profiles?.full_name || 'Người dùng'}</Text>
          <View style={s.postTimeRow}>
            <Text style={s.postTime}>{new Date(item.created_at).getHours()} giờ trước</Text>
            <Ionicons name="earth" size={11} color={colors.textMuted} style={{ marginLeft: 4 }} />
          </View>
        </View>
        <TouchableOpacity style={s.moreBtn}>
          <MaterialCommunityIcons name="dots-horizontal" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={s.postContent}>{item.content}</Text>

      {/* Media */}
      {item.media_urls && item.media_urls.length > 0 && (
        <View style={s.postMediaWrap}>
          <Image
            source={{ uri: item.media_urls[0] }}
            style={s.postMedia}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.reactRow}>
          <View style={s.emojiWrap}><Text style={s.reactEmoji}>❤️</Text></View>
          <View style={[s.emojiWrap, { marginLeft: -8 }]}><Text style={s.reactEmoji}>😂</Text></View>
          <Text style={s.statsText}>24</Text>
        </View>
        <Text style={s.statsText}>5 bình luận</Text>
      </View>

      {/* Divider */}
      <View style={s.actionsDivider} />

      {/* Action buttons */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionItem} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={22} color={colors.postAction} />
          <Text style={s.actionText}>Thích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="comment-outline" size={22} color={colors.postAction} />
          <Text style={s.actionText}>Bình luận</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionItem} activeOpacity={0.7}>
          <Ionicons name="arrow-redo-outline" size={22} color={colors.postAction} />
          <Text style={s.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <ZaloHeader
        rightIcons={[
          { component: <MaterialCommunityIcons name="pencil-box-outline" size={24} color={colors.iconAction} />, onPress: () => navigation.navigate('CreatePost') },
          { component: <Ionicons name="notifications-outline" size={24} color={colors.iconAction} /> },
        ]}
      />
      
      {/* Sub-tabs pinned at the top */}
      <AnimatedTabBar
        tabs={['Nhật Ký', 'Zalo Video']}
        active={activeTab}
        onChange={handleTabChange}
      />

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : activeTab === 0 ? (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <MaterialCommunityIcons name="post-outline" size={48} color={colors.iconSub} />
              <Text style={s.emptyText}>Chưa có bài viết nào</Text>
              <Text style={s.emptySub}>Hãy là người đăng bài đầu tiên 🚀</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchPosts(); }}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={s.emptyBox}>
          <MaterialCommunityIcons name="play-circle-outline" size={64} color={colors.iconSub} />
          <Text style={s.emptyText}>Zalo Video</Text>
          <Text style={s.emptySub}>Khám phá video ngắn thú vị</Text>
        </View>
      )}
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 100, paddingTop: 16 },
  headerContainer: { paddingHorizontal: 16, marginBottom: 16 },

  // Composer
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgCard,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 0,
  },
  composerAvatar: { width: 44, height: 44, borderRadius: 22 },
  composerPlaceholder: { flex: 1, marginLeft: 12, fontSize: 16, color: c.textPlaceholder, fontWeight: '500' },
  composerDivider: { width: 1, height: 24, backgroundColor: c.border + '60', marginHorizontal: 12 },
  composerActions: { flexDirection: 'row', gap: 8 },
  composerBtnWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: c.bgInput,
    alignItems: 'center', justifyContent: 'center'
  },

  // Stories
  storiesSection: { 
    backgroundColor: c.bgCard, 
    borderRadius: 24, 
    paddingVertical: 16, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 0,
  },
  storiesScroll: { paddingHorizontal: 16, gap: 14 },
  storyWrap: { alignItems: 'center', width: 68 },
  storyRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: c.storyBorder || c.accent,
    marginBottom: 6,
  },
  storyImg: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.bgInput },
  addBtn: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  storyLabel: { fontSize: 12, fontWeight: '500', color: c.text, textAlign: 'center' },

  // Post card
  postCard: { 
    backgroundColor: c.bgCard, 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 0,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.bgInput },
  postMeta: { flex: 1, marginLeft: 12 },
  postAuthor: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 2 },
  postTimeRow: { flexDirection: 'row', alignItems: 'center' },
  postTime: { fontSize: 12, color: c.textMuted },
  moreBtn: { padding: 6, backgroundColor: c.bgInput, borderRadius: 16 },
  postContent: { fontSize: 15, color: c.text, lineHeight: 22, paddingHorizontal: 16, paddingBottom: 16 },
  postMediaWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  postMedia: { width: '100%', height: 240, borderRadius: 16, backgroundColor: c.bgInput },
  
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  reactRow: { flexDirection: 'row', alignItems: 'center' },
  emojiWrap: { 
    width: 24, height: 24, borderRadius: 12, backgroundColor: c.bgCard, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: c.bgCard,
    zIndex: 1,
  },
  reactEmoji: { fontSize: 12 },
  statsText: { fontSize: 13, color: c.textSub, marginLeft: 6, fontWeight: '500' },
  
  actionsDivider: { height: 1, backgroundColor: c.border + '60', marginHorizontal: 16 },
  actionsRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8 },
  actionItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8, borderRadius: 16 },
  actionText: { fontSize: 14, fontWeight: '600', color: c.postAction },

  // Empty
  emptyBox: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: c.textSub },
  emptySub: { fontSize: 14, color: c.textMuted },
});
