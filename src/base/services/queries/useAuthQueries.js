import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/base/services/supabase';
import { supabaseProxy } from '@/base/services/supabaseProxy';
import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';
import { useAuthStore } from '@/base/shared/store/authStore';

// ==========================================
// 1. RAW SUPABASE FETCH FUNCTIONS
// ==========================================

export const loginApi = async (email, password) => {
  return await supabaseProxy(supabase.auth.signInWithPassword({ email, password }));
};

export const registerApi = async (email, password, username, fullName) => {
  const authResponse = await supabaseProxy(
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: fullName,
        },
      },
    })
  );
  return authResponse;
};

export const logoutApi = async () => {
  return await supabaseProxy(supabase.auth.signOut());
};

export const getCurrentUserApi = async () => {
  return await supabaseProxy(supabase.auth.getUser());
};

export const getProfileApi = async (userId) => {
  return await supabaseProxy(
    supabase.from(ServerEndpoint.PROFILES).select('*').eq('id', userId).single()
  );
};

export const updateProfileAvatarApi = async (userId, avatarUrl) => {
  return await supabaseProxy(
    supabase.from(ServerEndpoint.PROFILES).update({ avatar_url: avatarUrl }).eq('id', userId)
  );
};

// ==========================================
// 2. TANSTACK QUERY HOOKS & MUTATIONS
// ==========================================

export const AUTH_KEYS = {
  currentUser: ['currentUser'],
  profile: (userId) => ['profile', userId],
};

// Hook lấy profile của user
export const useProfileQuery = (userId) => {
  return useQuery({
    queryKey: AUTH_KEYS.profile(userId),
    queryFn: async () => {
      if (!userId) return null;
      const res = await getProfileApi(userId);
      return res.success ? res.data : null;
    },
    enabled: !!userId,
  });
};

// Mutation Đăng nhập
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const logInAction = useAuthStore((state) => state.logIn);

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await loginApi(email, password);
      if (!response.success) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }

      const user = response.data?.user;
      if (user) {
        const profileRes = await getProfileApi(user.id);
        const profile = profileRes.success ? profileRes.data : null;

        const authInfo = {
          id: user.id,
          username: profile?.username || user.user_metadata?.username,
          full_name: profile?.full_name || user.user_metadata?.full_name,
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        };

        await logInAction(authInfo);
        return authInfo;
      }
      return null;
    },
    onSuccess: (authInfo) => {
      if (authInfo?.id) {
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile(authInfo.id) });
      }
    },
  });
};

// Mutation Đăng ký
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({ email, password, username, fullName }) => {
      const response = await registerApi(email, password, username, fullName);
      if (!response.success) {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
      return response.data;
    },
  });
};

// Mutation Đăng xuất
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const logOutAction = useAuthStore((state) => state.logOut);

  return useMutation({
    mutationFn: async () => {
      await logoutApi();
      await logOutAction();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Mutation Cập nhật Avatar
export const useUpdateAvatarMutation = (userId) => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async (avatarUrl) => {
      const res = await updateProfileAvatarApi(userId, avatarUrl);
      if (!res.success) throw new Error(res.message);
      return avatarUrl;
    },
    onSuccess: (avatarUrl) => {
      updateUser({ avatar_url: avatarUrl });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile(userId) });
    },
  });
};
