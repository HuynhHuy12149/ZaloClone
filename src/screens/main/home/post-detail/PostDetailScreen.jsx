import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Pressable, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import PostItem from '../components/diary/PostItem';
import { getComments, addComment, getPostById } from '../../../../services/supabaseService/postService';
import Avatar from '../../../../components/Avatar';

const { width } = Dimensions.get('window');

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

  const s = styles(colors);

  // Sync when initialPost changes (e.g. re-navigating with new data)
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
      // Optional: sync initial fetch back to home screen if needed
      // if (onUpdatePost) onUpdatePost(res.data);
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
      
      // Update comment count locally and notify home screen
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
    <View style={[s.commentWrapper, { marginLeft: level > 0 ? 32 : 0 }]}>
      <View style={s.commentItem}>
        <Avatar 
          url={comment.profiles?.avatar_url} 
          name={comment.profiles?.full_name} 
          size={level > 0 ? 32 : 40} 
          rounded={false} 
          style={{ borderRadius: 14 }}
        />
        <View style={s.commentBody}>
          <View style={[s.commentBubble, { backgroundColor: colors.bgInput + '40' }]}>
            <Text style={[s.commentUser, { color: colors.text }]}>{comment.profiles?.full_name}</Text>
            <Text style={[s.commentText, { color: colors.text }]}>{comment.content}</Text>
          </View>
          <View style={s.commentActions}>
            <Text style={[s.commentTime, { color: colors.textMuted }]}>27 phút</Text>
            <TouchableOpacity onPress={() => {
              setReplyTo(comment);
              setCommentText(`@${comment.profiles?.full_name} `);
            }}>
              <Text style={[s.commentActionText, { color: colors.accent }]}>Phản hồi</Text>
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
    <View style={[s.header, { backgroundColor: colors.bg, paddingTop: insets.top + 10 }]}>
      <View style={s.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>Bình luận</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn}>
            <MaterialCommunityIcons name="comment-text-multiple-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <View style={[s.emptyIconBox, { backgroundColor: colors.accent + '15' }]}>
        <MaterialCommunityIcons name="comment-outline" size={48} color={colors.accent} />
      </View>
      <Text style={[s.emptyText, { color: colors.text }]}>Chưa có bình luận</Text>
      <View style={s.emptyActionRow}>
        <Text style={[s.emptySubText, { color: colors.textMuted }]}>Hãy là người đầu tiên </Text>
        <TouchableOpacity>
          <Text style={[s.emptyLink, { color: colors.accent }]}>thử ngay 🚀</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {/* Post Content with Inset Group Style */}
          <View style={s.postCardWrapper}>
            <PostItem 
              item={post} 
              colors={colors} 
              onPress={() => {}} 
              isDetail={true}
              onLike={handleReactionUpdate}
            />
          </View>

          {/* Comments Section in a Card */}
          <View style={[s.commentsCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Mọi người nói gì</Text>
            
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 30 }} />
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
        <View style={[s.bottomFloatingArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {replyTo && (
            <View style={[s.replyInfo, { backgroundColor: colors.bgInput }]}>
              <Text style={[s.replyText, { color: colors.textSub }]} numberOfLines={1}>
                Trả lời <Text style={{ fontWeight: '800', color: colors.text }}>{replyTo.profiles?.full_name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={[s.inputContainer, { backgroundColor: colors.bgCard }]}>
            <TouchableOpacity style={s.inputAction}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TextInput
              style={[s.input, { color: colors.text }]}
              placeholder="Nhập bình luận của bạn..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />

            <TouchableOpacity style={s.inputAction}>
              <Ionicons name="image-outline" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.sendBtn, { backgroundColor: colors.accent }, !commentText.trim() && { opacity: 0.5 }]}
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

const styles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22, // Reduced from 28
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgInput + '80', // Tinted background like home header
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  postCardWrapper: {
    // Inset Group Style
    marginBottom: 8,
  },
  commentsCard: {
    marginHorizontal: 12,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  commentWrapper: {
    marginBottom: 24,
  },
  commentItem: {
    flexDirection: 'row',
  },
  commentBody: {
    flex: 1,
    marginLeft: 14,
  },
  commentBubble: {
    borderRadius: 24,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  commentUser: {
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
    gap: 20,
  },
  commentTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyLink: {
    fontSize: 14,
    fontWeight: '800',
  },
  bottomFloatingArea: {
    paddingHorizontal: 16,
    backgroundColor: colors.bg, // Dùng màu nền của theme
    borderTopWidth: 1,
    borderTopColor: colors.bgInput + '40', // Đường kẻ mờ tạo sự liền mạch
    paddingTop: 8,
  },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  replyText: {
    fontSize: 13,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    maxHeight: 100,
    fontWeight: '500',
  },
  inputAction: {
    padding: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
