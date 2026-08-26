import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/base/context/ThemeContext';
import PostItem from '../components/diary/PostItem';
import { getComments, addComment, getPostById } from '@/base/services/postService';
import Avatar from '@/base/components/Avatar';

export default function PostDetailScreen({ route, navigation }) {
  const { post: initialPost, onUpdatePost } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [post, setLocalPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  // Sync when initialPost changes
  useEffect(() => {
    setLocalPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [initialPost.id]);

  const fetchPostDetails = async () => {
    const res = await getPostById(initialPost.id);
    if (res.success) {
      setLocalPost(res.data);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    const res = await getComments(initialPost.id);
    if (res.success) {
      setComments(res.data);
    }
    setLoading(false);
  };

  const handleSendComment = async (parentId = null) => {
    if (!commentText.trim() || isSending) return;
    
    setIsSending(true);
    const res = await addComment(post.id, commentText.trim(), 'text', parentId);
    if (res.success) {
      setCommentText('');
      setReplyTo(null);
      fetchComments(); 
      
      const updated = { 
        ...post, 
        comment_count: (post.comment_count || 0) + 1 
      };
      setLocalPost(updated);
      if (onUpdatePost) onUpdatePost(updated);
    }
    setIsSending(false);
  };

  const handleReactionUpdate = (isLiked, type) => {
    const updated = {
      ...post,
      is_liked: isLiked,
      user_reaction: type,
      like_count: isLiked ? (post.like_count || 0) + 1 : Math.max(0, (post.like_count || 1) - 1)
    };
    setLocalPost(updated);
    if (onUpdatePost) onUpdatePost(updated);
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

  const CommentItem = ({ comment, level = 0 }) => (
    <View className={`mb-6 ${level > 0 ? 'ml-8' : ''}`}>
      <View className="flex-row">
        <Avatar 
          url={comment.profiles?.avatar_url} 
          name={comment.profiles?.full_name} 
          size={level > 0 ? 32 : 40} 
          rounded={false} 
        />
        <View className="flex-1 ml-3.5">
          <View className="rounded-3xl rounded-tl-sm px-4 py-3 self-start bg-gray-200/50 dark:bg-zalo-darkInput/50">
            <Text className="font-extrabold text-sm mb-1 text-black dark:text-white">{comment.profiles?.full_name}</Text>
            <Text className="text-[15px] leading-[22px] text-black dark:text-white">{comment.content}</Text>
          </View>
          <View className="flex-row items-center mt-1.5 ml-1 gap-5">
            <Text className="text-xs font-medium text-gray-400">27 phút</Text>
            <TouchableOpacity onPress={() => {
              setReplyTo(comment);
              setCommentText(`@${comment.profiles?.full_name} `);
            }}>
              <Text className="text-xs font-bold text-zalo-blue">Phản hồi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {comment.children.map(child => (
        <CommentItem key={child.id} comment={child} level={level + 1} />
      ))}
    </View>
  );

  const renderHeader = () => (
    <View 
      className="px-6 pb-4 bg-[#f2f2f7] dark:bg-black"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-11 h-11 rounded-full items-center justify-center -ml-2.5">
          <Ionicons name="chevron-back" size={26} color={colors?.text || '#000'} />
        </TouchableOpacity>
        <Text className="flex-1 text-[22px] font-extrabold tracking-tight text-black dark:text-white">Bình luận</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-200/80 dark:bg-zalo-darkInput/80 ml-2">
            <MaterialCommunityIcons name="comment-text-multiple-outline" size={22} color={colors?.text || '#000'} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-200/80 dark:bg-zalo-darkInput/80 ml-2">
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
      <Text className="text-[17px] font-extrabold mb-1.5 text-black dark:text-white">Chưa có bình luận</Text>
      <View className="flex-row items-center">
        <Text className="text-sm font-medium text-gray-400">Hãy là người đầu tiên </Text>
        <TouchableOpacity>
          <Text className="text-sm font-extrabold text-zalo-blue">thử ngay 🚀</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f2f2f7] dark:bg-black">
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
          <View className="mx-3 rounded-[32px] p-6 shadow-sm bg-white dark:bg-zalo-darkCard">
            <Text className="text-lg font-extrabold mb-5 tracking-tight text-black dark:text-white">Mọi người nói gì</Text>
            
            {loading ? (
              <ActivityIndicator size="small" color={colors?.accent || '#0068ff'} className="my-8" />
            ) : comments.length === 0 ? (
              renderEmptyState()
            ) : (
              nestedComments().map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </View>
        </ScrollView>

        {/* Floating Pill Input Bar */}
        <View 
          className="px-4 bg-[#f2f2f7] dark:bg-black border-t border-gray-200/40 dark:border-zalo-darkBorder/40 pt-2"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {replyTo && (
            <View className="flex-row items-center px-4 py-2.5 rounded-2xl mb-2 justify-between border border-black/5 bg-gray-200 dark:bg-zalo-darkInput">
              <Text className="text-[13px] flex-1 text-gray-500 dark:text-gray-400" numberOfLines={1}>
                Trả lời <Text className="font-extrabold text-black dark:text-white">{replyTo.profiles?.full_name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close-circle" size={20} color={colors?.textMuted || '#9ca3af'} />
              </TouchableOpacity>
            </View>
          )}
          
          <View className="flex-row items-center rounded-full px-2 py-2 mb-2 shadow-lg bg-white dark:bg-zalo-darkCard">
            <TouchableOpacity className="p-2">
              <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={colors?.text || '#000'} />
            </TouchableOpacity>
            
            <TextInput
              className="flex-1 text-[15px] px-3 max-h-[100px] font-medium text-black dark:text-white"
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
              disabled={!commentText.trim() || isSending}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
