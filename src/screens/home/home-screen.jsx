import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator,
  LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { usePostsQuery, useToggleLikeMutation, POST_KEYS } from '@/base/services/queries';
import { supabase } from '@/base/services/supabase';
import ZaloHeader from '@/base/components/ZaloHeader';
import AnimatedTabBar from '@/base/components/AnimatedTabBar';
import { useTheme } from '@/base/context/ThemeContext';
import { useLanguage } from '@/base/context/LanguageContext';
import { useAuthStore } from '@/base/shared/store/authStore';
import PostItem from './components/diary/PostItem';
import ImagePreviewModal from './components/diary/ImagePreviewModal';
import StoryBar from './components/StoryBar';
import PostComposerBar from './components/PostComposerBar';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);
  const [previewData, setPreviewData] = useState({ visible: false, images: [], index: 0, post: null });
  const { colors } = useTheme();
  const { t } = useLanguage();
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  // TanStack Query: Fetch Posts with automatic caching
  const { data: posts = [], isLoading, isRefetching, refetch } = usePostsQuery();
  const toggleLikeMutation = useToggleLikeMutation();

  // Realtime Supabase subscription: Invalidate Query on any DB changes
  useEffect(() => {
    const channelId = `posts_feed_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        queryClient.invalidateQueries({ queryKey: POST_KEYS.all });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
        queryClient.invalidateQueries({ queryKey: POST_KEYS.all });
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleTabChange = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(index);
  };

  const renderHeader = () => (
    <View className="px-3 mb-4 mt-3">
      <PostComposerBar
        user={user}
        colors={colors}
        placeholder={t('home.whatsOnYourMind')}
        onPress={() => navigation.navigate('CreatePost')}
      />
      <StoryBar
        colors={colors}
        onAddStory={() => navigation.navigate('CreatePost')}
      />
    </View>
  );

  const handleLike = (postId, reactionType) => {
    toggleLikeMutation.mutate({ postId, reactionType });
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
    <PostItem 
      item={item} 
      colors={colors} 
      onOpenPreview={openPreview} 
      onLike={handleLike} 
      navigation={navigation}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ZaloHeader
        placeholder={t('common.search')}
        rightIcons={[
          { component: <MaterialCommunityIcons name="pencil-box-outline" size={24} color={colors?.iconAction || '#374151'} />, onPress: () => navigation.navigate('CreatePost') },
          { component: <Ionicons name="notifications-outline" size={24} color={colors?.iconAction || '#374151'} /> },
        ]}
      />

      {/* Sub-tabs pinned at the top */}
      <AnimatedTabBar
        tabs={[t('home.diaryTab'), t('home.zaloVideoTab')]}
        active={activeTab}
        onChange={handleTabChange}
      />

      {isLoading ? (
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
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.bgInput }}>
                <MaterialCommunityIcons name="post-outline" size={32} color={colors?.textMuted || '#9ca3af'} />
              </View>
              <Text className="text-[17px] font-extrabold" style={{ color: colors.text }}>{t('home.noPosts')}</Text>
              <Text className="text-sm mt-1" style={{ color: colors.textSub }}>{t('home.beTheFirstPost')}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors?.accent || '#0068ff'}
              colors={[colors?.accent || '#0068ff']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="pt-20 items-center">
          <MaterialCommunityIcons name="play-circle-outline" size={64} color={colors?.iconSub || '#9ca3af'} />
          <Text className="text-lg font-bold mt-2" style={{ color: colors.text }}>{t('home.zaloVideoTab')}</Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSub }}>Khám phá video ngắn thú vị</Text>
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
