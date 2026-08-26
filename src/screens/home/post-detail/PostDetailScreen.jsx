import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/base/context/ThemeContext';
import PostItem from '../components/diary/PostItem';
import CommentItem from './CommentItem';
import { 
  usePostDetailQuery, 
  useCommentsQuery, 
  useAddCommentMutation,
  useToggleLikeMutation
} from '@/base/services/queries';
import Avatar from '@/base/components/Avatar';

export default function PostDetailScreen({ route, navigation }) {
  const { post: initialPost } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  // TanStack Query: Fetch Post Detail & Comments
  const { data: post = initialPost } = usePostDetailQuery(initialPost.id, initialPost);
  const { data: comments = [], isLoading: loadingComments } = useCommentsQuery(initialPost.id);
  const addCommentMutation = useAddCommentMutation(initialPost.id);
  const toggleLikeMutation = useToggleLikeMutation();

  const handleSendComment = async (parentId = null) => {
    if (!commentText.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      { content: commentText.trim(), type: 'text', parentId },
      {
        onSuccess: () => {
          setCommentText('');
          setReplyTo(null);
        },
      }
    );
  };

  const handleReactionUpdate = (isLiked, type) => {
    toggleLikeMutation.mutate({ postId: post.id, reactionType: type });
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setCommentText(`@${comment.profiles?.full_name} `);
  };

  const nestedComments = () => {
    const map = {};
    comments.forEach(c => map[c.id] = { ...c, children: [] });
    const roots = [];
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else if (!c.parent_id) {
        roots.push(map[c.id]);
      }
    });
    return roots;
  };

  const renderHeader = () => (
    <View 
      className="px-6 pb-4"
      style={{ paddingTop: insets.top + 10, backgroundColor: colors.bg }}
    >
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-11 h-11 rounded-full items-center justify-center -ml-2.5">
          <Ionicons name="chevron-back" size={26} color={colors?.text || '#000'} />
        </TouchableOpacity>
        <Text className="flex-1 text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Bình luận</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center ml-2" style={{ backgroundColor: colors.bgInput }}>
            <MaterialCommunityIcons name="comment-text-multiple-outline" size={22} color={colors?.text || '#000'} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center ml-2" style={{ backgroundColor: colors.bgInput }}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors?.text || '#000'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="items-center py-10">
      <View className="w-20 h-20 rounded-3xl items-center justify-center mb-4 bg-zalo-blue/15">
        <MaterialCommunityIcons name="comment-outline" size={48} color={colors?.accent || '#0068ff'} />
      </View>
      <Text className="text-[17px] font-extrabold mb-1.5" style={{ color: colors.text }}>Chưa có bình luận</Text>
      <View className="flex-row items-center">
        <Text className="text-sm font-medium text-gray-400">Hãy là người đầu tiên </Text>
        <TouchableOpacity>
          <Text className="text-sm font-extrabold text-zalo-blue">thử ngay 🚀</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Post Content */}
          <View className="mb-2">
            <PostItem 
              item={post} 
              colors={colors} 
              onPress={() => {}} 
              isDetail={true}
              onLike={handleReactionUpdate}
            />
          </View>

          {/* Comments Section */}
          <View className="mx-3 rounded-[32px] p-6 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-lg font-extrabold mb-5 tracking-tight" style={{ color: colors.text }}>Mọi người nói gì</Text>
            
            {loadingComments ? (
              <ActivityIndicator size="small" color={colors?.accent || '#0068ff'} className="my-8" />
            ) : comments.length === 0 ? (
              renderEmptyState()
            ) : (
              nestedComments().map((comment) => (
                <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
              ))
            )}
          </View>
        </ScrollView>

        {/* Floating Pill Input Bar */}
        <View 
          className="px-4 border-t pt-2"
          style={{ borderColor: colors.border, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.bg }}
        >
          {replyTo && (
            <View className="flex-row items-center px-4 py-2.5 rounded-2xl mb-2 justify-between border border-black/5" style={{ backgroundColor: colors.bgInput }}>
              <Text className="text-[13px] flex-1" style={{ color: colors.textSub }} numberOfLines={1}>
                Trả lời <Text className="font-extrabold" style={{ color: colors.text }}>{replyTo.profiles?.full_name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close-circle" size={20} color={colors?.textMuted || '#9ca3af'} />
              </TouchableOpacity>
            </View>
          )}
          
          <View className="flex-row items-center rounded-full px-2 py-2 mb-2 shadow-lg" style={{ backgroundColor: colors.bgCard }}>
            <TouchableOpacity className="p-2">
              <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={colors?.text || '#000'} />
            </TouchableOpacity>
            
            <TextInput
              className="flex-1 text-[15px] px-3 max-h-[100px] font-medium"
              style={{ color: colors.text }}
              placeholder="Nhập bình luận của bạn..."
              placeholderTextColor={colors?.textMuted || '#9ca3af'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />

            <TouchableOpacity className="p-2">
              <Ionicons name="image-outline" size={24} color={colors?.text || '#000'} />
            </TouchableOpacity>

            <TouchableOpacity 
              className={`w-10 h-10 rounded-full items-center justify-center ml-1 bg-zalo-blue ${!commentText.trim() ? 'opacity-50' : ''}`}
              onPress={() => handleSendComment(replyTo?.id)}
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
