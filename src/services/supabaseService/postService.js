import { supabase } from '../../libs/supabase';
import { supabaseProxy } from '../config/Proxy';
<<<<<<< HEAD
import { ServerEndpoint } from '../config/ServerEndpoint';
=======
import { ServerEndpoint } from '../../constants/ServerEndpoint';
>>>>>>> b4ac8c244cc4c5eb128ea99dff7edde18a003ecd

// Lấy danh sách bài viết (kèm thông tin tác giả)
export const getPosts = async () => {
  return await supabaseProxy(
    supabase
      .from(ServerEndpoint.POSTS)
      .select('*, profiles(username, full_name, avatar_url)')
      .order('created_at', { ascending: false })
  );
};

// Tạo bài viết mới
export const createPost = async (content, mediaUrls = []) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'Chưa đăng nhập' };

  return await supabaseProxy(
    supabase.from(ServerEndpoint.POSTS).insert([
      {
        author_id: user.id,
        content: content,
        media_urls: mediaUrls,
      }
    ])
  );
};
