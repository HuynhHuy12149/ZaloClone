import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/base/services/supabase';
import { supabaseProxy } from '@/base/services/supabaseProxy';
import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';

// ==========================================
// 1. RAW SUPABASE FETCH FUNCTIONS
// ==========================================

export const getPostsApi = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from(ServerEndpoint.POSTS)
    .select(`
      *,
      profiles(username, full_name, avatar_url),
      likes:likes(count),
      comments:comments(count)
    `)
    .order('created_at', { ascending: false });

  const result = await supabaseProxy(query);

  if (result.success && user) {
    const postIds = result.data.map(p => p.id);
    const { data: allReactions } = await supabase
      .from(ServerEndpoint.LIKES)
      .select('post_id, type, user_id')
      .in('post_id', postIds);

    const postsWithLikes = result.data.map(post => {
      const postReactions = allReactions?.filter(r => r.post_id === post.id) || [];
      const userReaction = postReactions.find(r => r.user_id === user.id);
      
      const reactionTypes = [...new Set(postReactions.map(r => r.type))];

      return {
        ...post,
        is_liked: !!userReaction,
        user_reaction: userReaction ? userReaction.type : null,
        reaction_types: reactionTypes.length > 0 ? reactionTypes : ['like'],
        like_count: post.likes?.[0]?.count || 0,
        comment_count: post.comments?.[0]?.count || 0
      };
    });
    return { ...result, data: postsWithLikes };
  } else if (result.success) {
    const postsWithCounts = result.data.map(post => ({
      ...post,
      is_liked: false,
      user_reaction: null,
      reaction_types: [],
      like_count: post.likes?.[0]?.count || 0,
      comment_count: post.comments?.[0]?.count || 0
    }));
    return { ...result, data: postsWithCounts };
  }

  return result;
};

export const getPostByIdApi = async (postId) => {
  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from(ServerEndpoint.POSTS)
    .select(`
      *,
      profiles(username, full_name, avatar_url),
      likes:likes(count),
      comments:comments(count)
    `)
    .eq('id', postId)
    .single();

  const result = await supabaseProxy(query);

  if (result.success && user) {
    const { data: userLike } = await supabase
      .from(ServerEndpoint.LIKES)
      .select('type')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    return {
      ...result,
      data: {
        ...result.data,
        is_liked: !!userLike,
        user_reaction: userLike ? userLike.type : null,
        like_count: result.data.likes?.[0]?.count || 0,
        comment_count: result.data.comments?.[0]?.count || 0
      }
    };
  }

  return result;
};

export const createPostApi = async (content, mediaUrls = [], location = null, privacy = 'public', music = null, taggedFriends = [], fontStyle = 'normal', color = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  return await supabaseProxy(
    supabase
      .from(ServerEndpoint.POSTS)
      .insert({
        user_id: user.id,
        content: content || '',
        media_urls: mediaUrls,
        location: location,
        privacy: privacy,
        music: music,
        tagged_friends: taggedFriends,
        font_style: fontStyle,
        color: color,
      })
      .select(`
        *,
        profiles(username, full_name, avatar_url)
      `)
      .single()
  );
};

export const toggleLikeApi = async (postId, reactionType = 'like') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  const { data: existingLike } = await supabase
    .from(ServerEndpoint.LIKES)
    .select('id, type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingLike) {
    if (existingLike.type !== reactionType && reactionType) {
      return await supabaseProxy(
        supabase
          .from(ServerEndpoint.LIKES)
          .update({ type: reactionType })
          .eq('id', existingLike.id)
      );
    }
    return await supabaseProxy(
      supabase
        .from(ServerEndpoint.LIKES)
        .delete()
        .eq('id', existingLike.id)
    );
  } else {
    return await supabaseProxy(
      supabase
        .from(ServerEndpoint.LIKES)
        .insert({
          post_id: postId,
          user_id: user.id,
          type: reactionType || 'like'
        })
    );
  }
};

export const handleReactionApi = async (postId, reactionType = 'heart') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  const { data: existingLike } = await supabase
    .from(ServerEndpoint.LIKES)
    .select('id, type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingLike) {
    return await supabaseProxy(
      supabase
        .from(ServerEndpoint.LIKES)
        .update({ type: reactionType })
        .eq('id', existingLike.id)
    );
  } else {
    return await supabaseProxy(
      supabase
        .from(ServerEndpoint.LIKES)
        .insert({
          post_id: postId,
          user_id: user.id,
          type: reactionType
        })
    );
  }
};

export const getCommentsApi = async (postId) => {
  return await supabaseProxy(
    supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_user_id_fkey(username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
  );
};

export const addCommentApi = async (postId, content, type = 'text', parentId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  return await supabaseProxy(
    supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        type,
        parent_id: parentId
      })
      .select(`
        *,
        profiles!comments_user_id_fkey(username, full_name, avatar_url)
      `)
      .single()
  );
};

// ==========================================
// 2. TANSTACK QUERY HOOKS & MUTATIONS
// ==========================================

export const POST_KEYS = {
  all: ['posts'],
  detail: (id) => ['posts', id],
  comments: (postId) => ['comments', postId],
};

// Hook lấy danh sách bài viết Feed
export const usePostsQuery = () => {
  return useQuery({
    queryKey: POST_KEYS.all,
    queryFn: async () => {
      const res = await getPostsApi();
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
  });
};

// Hook lấy chi tiết bài viết
export const usePostDetailQuery = (postId, initialData = null) => {
  return useQuery({
    queryKey: POST_KEYS.detail(postId),
    queryFn: async () => {
      const res = await getPostByIdApi(postId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    initialData: initialData,
    enabled: !!postId,
  });
};

// Hook lấy bình luận
export const useCommentsQuery = (postId) => {
  return useQuery({
    queryKey: POST_KEYS.comments(postId),
    queryFn: async () => {
      const res = await getCommentsApi(postId);
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
    enabled: !!postId,
  });
};

// Mutation Đăng bài viết mới
export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, mediaUrls, location, privacy, music, taggedFriends, fontStyle, color }) =>
      createPostApi(content, mediaUrls, location, privacy, music, taggedFriends, fontStyle, color),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: POST_KEYS.all });
      }
    },
  });
};

// Mutation Like/Thả tim bài viết (Optimistic update)
export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reactionType }) => toggleLikeApi(postId, reactionType),
    onMutate: async ({ postId, reactionType }) => {
      await queryClient.cancelQueries({ queryKey: POST_KEYS.all });
      const previousPosts = queryClient.getQueryData(POST_KEYS.all);

      queryClient.setQueryData(POST_KEYS.all, (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.map((post) => {
          if (post.id === postId) {
            const isLiked = !post.is_liked;
            return {
              ...post,
              is_liked: isLiked,
              user_reaction: isLiked ? (reactionType || 'like') : null,
              like_count: isLiked ? (post.like_count || 0) + 1 : Math.max(0, (post.like_count || 1) - 1),
            };
          }
          return post;
        });
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(POST_KEYS.all, context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POST_KEYS.all });
    },
  });
};

// Mutation Thêm bình luận
export const useAddCommentMutation = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, type = 'text', parentId = null }) =>
      addCommentApi(postId, content, type, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POST_KEYS.comments(postId) });
      queryClient.invalidateQueries({ queryKey: POST_KEYS.detail(postId) });
      queryClient.invalidateQueries({ queryKey: POST_KEYS.all });
    },
  });
};
