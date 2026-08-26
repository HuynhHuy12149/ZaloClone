import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator,
  TouchableOpacity, ScrollView, Dimensions,
  LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPosts, toggleLike } from '@/base/services/postService';
import { supabase } from '@/base/services/supabase';
import ZaloHeader from '@/base/components/ZaloHeader';
import AnimatedTabBar from '@/base/components/AnimatedTabBar';
import { useTheme } from '@/base/context/ThemeContext';
import { useAuthStore } from '@/base/shared/store/authStore';
import PostItem from './components/diary/PostItem';
import ImagePreviewModal from './components/diary/ImagePreviewModal';
import Avatar from '@/base/components/Avatar';

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
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === payload.new.id 
              ? { ...post, moderation_status: payload.new.moderation_status } 
              : post
          )
        );
      })
      .subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const handleTabChange = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(index);
  };

  const renderHeader = () => (
    <View className="px-3 mb-4 mt-3">
      {/* Post composer */}
      <TouchableOpacity
        className="flex-row items-center bg-white dark:bg-zalo-darkCard rounded-[32px] px-3 py-2.5 mb-4 shadow-sm"
        style={{ elevation: 1 }}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <Avatar
          url={user?.avatar_url}
          name={user?.full_name}
          size={44}
          rounded={false}
        />
        <View className="flex-1 ml-3">
          <Text className="text-[15px] text-gray-400 dark:text-gray-500 font-semibold">Hôm nay bạn thế nào?</Text>
        </View>
        <View className="w-10 h-10 rounded-2xl items-center justify-center bg-zalo-blue/15">
          <Ionicons name="image" size={20} color={colors?.accent || '#0068ff'} />
        </View>
      </TouchableOpacity>

      {/* Stories */}
      <View 
        className="bg-white dark:bg-zalo-darkCard rounded-[32px] py-4 shadow-sm"
        style={{ elevation: 1 }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
          {STORIES.map((story) => (
            <View key={story.id} className="items-center w-16">
              <View 
                className="p-0.5 rounded-3xl border-2 mb-2"
                style={{ borderColor: story.isAdd ? 'transparent' : (colors?.storyBorder || colors?.accent || '#0068ff') }}
              >
                {story.isAdd ? (
                  <View className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-zalo-darkInput items-center justify-center">
                    <View className="w-6 h-6 rounded-full bg-zalo-blue items-center justify-center">
                      <Ionicons name="add" size={18} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <Avatar url={null} name={story.label} size={54} rounded={false} />
                )}
              </View>
              <Text className="text-[11px] font-bold text-center text-black dark:text-white" numberOfLines={1}>
                {story.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const handleLike = async (postId) => {
    await toggleLike(postId);
  };

  const openPreview = (post, index) => {
    setPreviewData({
      visible: true,
      images: post?.media_urls || [],
      index: index,
      post: post
    });
  };

  const updatePost = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
  };

  const renderItem = ({ item }) => (
    <PostItem 
      item={item} 
      colors={colors} 
      onOpenPreview={openPreview} 
      onLike={handleLike} 
      navigation={navigation}
      onPress={() => navigation.navigate('PostDetail', { post: item, onUpdatePost: updatePost })}
    />
  );

  return (
    <View className="flex-1 bg-[#f2f2f7] dark:bg-black">
      <ZaloHeader
        rightIcons={[
          { component: <MaterialCommunityIcons name="pencil-box-outline" size={24} color={colors?.iconAction || '#374151'} />, onPress: () => navigation.navigate('CreatePost') },
          { component: <Ionicons name="notifications-outline" size={24} color={colors?.iconAction || '#374151'} /> },
        ]}
      />

      {/* Sub-tabs pinned at the top */}
      <AnimatedTabBar
        tabs={['Nhật Ký', 'Zalo Video']}
        active={activeTab}
        onChange={handleTabChange}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors?.accent || '#0068ff'} />
        </View>
      ) : activeTab === 0 ? (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={posts}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }}
          ListEmptyComponent={
            <View className="pt-20 items-center">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-gray-200 dark:bg-zalo-darkInput">
                <MaterialCommunityIcons name="post-outline" size={32} color={colors?.textMuted || '#9ca3af'} />
              </View>
              <Text className="text-[17px] font-extrabold text-black dark:text-white">Chưa có bài viết nào</Text>
              <Text className="text-sm mt-1 text-gray-500 dark:text-gray-400">Hãy là người đăng bài đầu tiên 🚀</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchPosts(); }}
              tintColor={colors?.accent || '#0068ff'}
              colors={[colors?.accent || '#0068ff']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="pt-20 items-center">
          <MaterialCommunityIcons name="play-circle-outline" size={64} color={colors?.iconSub || '#9ca3af'} />
          <Text className="text-lg font-bold text-black dark:text-white mt-2">Zalo Video</Text>
          <Text className="text-sm mt-1 text-gray-500 dark:text-gray-400">Khám phá video ngắn thú vị</Text>
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
