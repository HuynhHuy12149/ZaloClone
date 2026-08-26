import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';
import { supabase } from './supabase';
import { supabaseProxy } from './supabaseProxy';

/**
 * Lấy danh sách bạn bè đã chấp nhận kết bạn (Dùng Proxy chuẩn dự án)
 * @param {string} userId ID của người dùng hiện tại
 */
export const getAcceptedFriends = async (userId) => {
  if (!userId) return { data: [], error: null, success: true };

  return await supabaseProxy(
    supabase
      .from(ServerEndpoint.FRIENDS)
      .select(`
        status,
        user:user_id (id, full_name, avatar_url, username),
        friend:friend_id (id, full_name, avatar_url, username)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted')
  );
};
