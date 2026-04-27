import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator,
  Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions,
  LayoutAnimation, Platform, UIManager, Modal, Pressable
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPosts, toggleLike } from '../../../services/supabaseService/postService';
import { supabase } from '../../../libs/supabase';
import ZaloHeader from '../../../components/ZaloHeader';
import AnimatedTabBar from '../../../components/AnimatedTabBar';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import PostItem from './components/diary/PostItem';
import ImagePreviewModal from './components/diary/ImagePreviewModal';
import Avatar from '../../../components/Avatar';

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
  const [previewData, setPreviewData] = useState({ visible: false, images: [], index: 0, post: null });
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);
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
        <Avatar
          url={user?.avatar_url}
          name={user?.full_name}
          size={44}
          rounded={false}
        />
        <View style={s.composerTextWrap}>
          <Text style={s.composerPlaceholder}>Hôm nay bạn thế nào?</Text>
        </View>
        <View style={[s.composerBtnWrap, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons name="image" size={20} color={colors.accent} />
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
                  <Avatar url={null} name={story.label} size={54} rounded={false} />
                )}
              </View>
              <Text style={[s.storyLabel, { color: colors.text }]} numberOfLines={1}>{story.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const handleLike = async (postId) => {
    await toggleLike(postId);
    // Tùy chọn: Refresh dữ liệu để cập nhật số lượng thực tế từ server
    // fetchPosts(); 
  };

  const openPreview = (post, index) => {
    setPreviewData({
      visible: true,
      images: post?.media_urls || [],
      index: index,
      post: post
    });
  };

  const renderItem = ({ item }) => (
    <PostItem item={item} colors={colors} onOpenPreview={openPreview} onLike={handleLike} />
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
              <View style={[s.emptyIconCircle, { backgroundColor: colors.bgInput }]}>
                <MaterialCommunityIcons name="post-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={[s.emptyText, { color: colors.text }]}>Chưa có bài viết nào</Text>
              <Text style={[s.emptySub, { color: colors.textMuted }]}>Hãy là người đăng bài đầu tiên 🚀</Text>
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
          <Text style={[s.emptyText, { color: colors.text }]}>Zalo Video</Text>
          <Text style={[s.emptySub, { color: colors.textMuted }]}>Khám phá video ngắn thú vị</Text>
        </View>
      )}

      <ImagePreviewModal
        visible={previewData.visible}
        data={previewData}
        colors={colors}
        onClose={() => setPreviewData(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 100, paddingTop: 12 },
  headerContainer: { paddingHorizontal: 12, marginBottom: 16, marginTop: 12 },

  // Composer (Thanh đăng bài)
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgCard,
    borderRadius: 32, // Tăng lên 32px
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 1,
  },
  composerAvatar: { width: 44, height: 44, borderRadius: 16 }, // Squircle
  composerTextWrap: { flex: 1, marginLeft: 12 },
  composerPlaceholder: { fontSize: 15, color: c.textPlaceholder, fontWeight: '600' },
  composerBtnWrap: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center'
  },

  // Stories
  storiesSection: {
    backgroundColor: c.bgCard,
    borderRadius: 32, // Tăng lên 32px
    paddingVertical: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  storiesScroll: { paddingHorizontal: 16, gap: 16 },
  storyWrap: { alignItems: 'center', width: 64 },
  storyRing: {
    padding: 3,
    borderRadius: 24, // Squircle cho tin
    borderWidth: 2,
    borderColor: c.storyBorder || c.accent,
    marginBottom: 8,
  },
  storyImg: { width: 54, height: 54, borderRadius: 20, backgroundColor: c.bgInput },
  addBtn: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  storyLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Empty State
  emptyBox: { paddingTop: 80, alignItems: 'center' },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 17, fontWeight: '800' },
  emptySub: { fontSize: 14, marginTop: 4 },
});
