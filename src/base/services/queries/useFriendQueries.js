import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/base/services/supabase';
import { supabaseProxy } from '@/base/services/supabaseProxy';
import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';

// ==========================================
// 1. RAW SUPABASE FETCH FUNCTIONS
// ==========================================

export const getAcceptedFriendsApi = async (userId) => {
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

// ==========================================
// 2. TANSTACK QUERY HOOKS
// ==========================================

export const FRIEND_KEYS = {
  friends: (userId) => ['friends', userId],
};

export const useFriendsQuery = (userId) => {
  return useQuery({
    queryKey: FRIEND_KEYS.friends(userId),
    queryFn: async () => {
      if (!userId) return [];
      const res = await getAcceptedFriendsApi(userId);
      if (res?.data) {
        return res.data
          .map((row) => (row.user?.id === userId ? row.friend : row.user))
          .filter(Boolean);
      }
      return [];
    },
    enabled: !!userId,
  });
};
