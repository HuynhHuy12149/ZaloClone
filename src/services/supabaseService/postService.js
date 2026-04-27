import { supabase } from '../../libs/supabase';
import { supabaseProxy } from '../config/Proxy';
import { ServerEndpoint } from '../../constants/ServerEndpoint';

// Lấy danh sách bài viết (kèm thông tin tác giả, đếm like/comment)
export const getPosts = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  // Dùng .select với count để lấy số lượng
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
    // Lấy thông tin chi tiết về tất cả reaction của các bài này để biết có những loại nào
    const postIds = result.data.map(p => p.id);
    const { data: allReactions } = await supabase
      .from(ServerEndpoint.LIKES)
      .select('post_id, type, user_id')
      .in('post_id', postIds);

    const reactionMap = {};
    const userReactionMap = {};

    allReactions?.forEach(r => {
      if (!reactionMap[r.post_id]) reactionMap[r.post_id] = new Set();
      reactionMap[r.post_id].add(r.type);
      
      if (user && r.user_id === user.id) {
        userReactionMap[r.post_id] = r.type;
      }
    });

    // Gán dữ liệu cho từng bài viết
    result.data = result.data.map(post => {
      return {
        ...post,
        like_count: post.likes?.[0]?.count || 0,
        comment_count: post.comments?.[0]?.count || 0,
        is_liked: !!userReactionMap[post.id],
        user_reaction: userReactionMap[post.id] || null,
        reaction_types: Array.from(reactionMap[post.id] || [])
      };
    });
  }

  return result;
};

/**
 * Tạo bài viết mới
 * @param {string} content Nội dung văn bản
 * @param {string[]} mediaUrls Danh sách link ảnh/video
 * @param {object} locationData Đối tượng chứa thông tin vị trí {name, address, latitude, longitude, place_id}
 * @param {string} privacy Chế độ riêng tư
 * @param {object} musicData Đối tượng chứa thông tin nhạc
 * @param {object[]} taggedFriends Danh sách bạn bè được gắn thẻ
 */
export const createPost = async (content, mediaUrls = [], locationData = null, privacy = 'Public', musicData = null, taggedFriends = [], fontStyle = 'normal', textColor = null) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  return await supabaseProxy(
    supabase
      .from(ServerEndpoint.POSTS)
      .insert([
        {
          author_id: user.id,
          content: content,
          media_urls: mediaUrls,
          location_name: locationData?.name || null,
          location_address: locationData?.address || null,
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null,
          goong_place_id: locationData?.place_id || null,

          privacy: privacy,
          music_data: musicData,
          tagged_friends: taggedFriends,
          font_style: fontStyle,
          text_color: textColor,
          created_at: new Date().toISOString(),
        }
      ])
  );
};

export const handleReaction = async (postId, type = 'heart') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  // 1. Kiểm tra xem đã có reaction chưa để biết là muốn "Bỏ chọn" (Unlike) hay "Đổi cảm xúc"
  const { data: existing } = await supabase
    .from(ServerEndpoint.LIKES)
    .select('id, type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing && existing.type === type) {
    // Nếu chọn đúng cái đang có -> Xóa (Unlike)
    return await supabaseProxy(
      supabase
        .from(ServerEndpoint.LIKES)
        .delete()
        .eq('id', existing.id)
    );
  }

  // 2. Nếu chưa có hoặc chọn loại khác -> Dùng UPSERT (Cập nhật nếu đã có cặp post_id+user_id, chưa có thì thêm)
  // Lệnh này đảm bảo 1 user chỉ có 1 reaction trên 1 bài viết
  return await supabaseProxy(
    supabase
      .from(ServerEndpoint.LIKES)
      .upsert({
        post_id: postId,
        user_id: user.id,
        type: type,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'post_id, user_id' 
      })
  );
};
