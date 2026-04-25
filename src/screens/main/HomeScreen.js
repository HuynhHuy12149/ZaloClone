import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator,
  Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { getPosts } from '../../services/postService';
import { supabase } from '../../libs/supabase';
import ZaloHeader from '../../components/ZaloHeader';
import AnimatedTabBar from '../../components/AnimatedTabBar';
import { useTheme } from '../../utils/ThemeContext';

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

  const renderHeader = () => (
    <View>
      {/* Post composer — Instagram/Zalo style */}
      <TouchableOpacity
        style={s.composer}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={s.composerAvatar} />
        <Text style={s.composerPlaceholder}>Hôm nay bạn thế nào?</Text>
        <View style={s.composerDivider} />
        <View style={s.composerActions}>
          <TouchableOpacity style={s.composerBtn}>
            <Ionicons name="image" size={20} color="#4caf50" />
          </TouchableOpacity>
          <TouchableOpacity style={s.composerBtn}>
            <Ionicons name="happy-outline" size={20} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Stories — Instagram style */}
      <View style={s.storiesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 12 }}>
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

      {/* Divider */}
      <View style={s.sectionDivider} />
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
        <Image
          source={{ uri: item.media_urls[0] }}
          style={s.postMedia}
          resizeMode="cover"
        />
      )}

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.reactRow}>
          <Text style={s.reactEmoji}>❤️</Text>
          <Text style={s.reactEmoji}>😂</Text>
          <Text style={s.statsText}>24</Text>
        </View>
        <Text style={s.statsText}>5 bình luận</Text>
      </View>

      {/* Divider */}
      <View style={s.actionsDivider} />

      {/* Action buttons */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionItem}>
          <Ionicons name="heart-outline" size={22} color={colors.postAction} />
          <Text style={s.actionText}>Thích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionItem}>
          <MaterialCommunityIcons name="comment-outline" size={22} color={colors.postAction} />
          <Text style={s.actionText}>Bình luận</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionItem}>
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
        onChange={setActiveTab}
      />

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
          ItemSeparatorComponent={() => <View style={{ height: 8, backgroundColor: colors.bg }} />}
        />
      )}
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Composer
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  composerAvatar: { width: 40, height: 40, borderRadius: 20 },
  composerPlaceholder: { flex: 1, marginLeft: 12, fontSize: 15, color: c.textPlaceholder },
  composerDivider: { width: 0.5, height: 24, backgroundColor: c.border, marginHorizontal: 10 },
  composerActions: { flexDirection: 'row', gap: 8 },
  composerBtn: { padding: 4 },

  // Stories
  storiesSection: { backgroundColor: c.bgCard, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border },
  storyWrap: { alignItems: 'center', width: 72 },
  storyRing: {
    padding: 2.5,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: c.storyBorder,
    marginBottom: 5,
  },
  storyImg: { width: 62, height: 62, borderRadius: 31, backgroundColor: c.bgInput },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  storyLabel: { fontSize: 11, color: c.text, textAlign: 'center' },

  sectionDivider: { height: 8, backgroundColor: c.bg },

  // Post card
  postCard: { backgroundColor: c.bgCard },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  postAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.bgInput },
  postMeta: { flex: 1, marginLeft: 10 },
  postAuthor: { fontSize: 14, fontWeight: '700', color: c.text },
  postTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  postTime: { fontSize: 11, color: c.textMuted },
  moreBtn: { padding: 6 },
  postContent: { fontSize: 15, color: c.text, lineHeight: 22, paddingHorizontal: 14, paddingBottom: 12 },
  postMedia: { width: '100%', height: 260, backgroundColor: c.bgInput },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  reactRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reactEmoji: { fontSize: 14 },
  statsText: { fontSize: 12, color: c.textSub, marginLeft: 4 },
  actionsDivider: { height: 0.5, backgroundColor: c.border, marginHorizontal: 14 },
  actionsRow: { flexDirection: 'row', paddingVertical: 4 },
  actionItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 6 },
  actionText: { fontSize: 13, fontWeight: '500', color: c.postAction },

  // Empty
  emptyBox: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: c.textSub },
  emptySub: { fontSize: 13, color: c.textMuted },
});
