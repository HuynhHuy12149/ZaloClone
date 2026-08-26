import { supabase } from './supabase';
import { supabaseProxy } from './supabaseProxy';
import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';

export const login = async (email, password) => {
  return await supabaseProxy(supabase.auth.signInWithPassword({ email, password }));
};

export const register = async (email, password, username, fullName) => {
  // 1. Đăng ký auth với metadata để Trigger trong Database tự tạo Profile
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

  // Trả về kết quả auth (Database trigger sẽ tự tạo dòng trong bảng profiles)
  return authResponse;
};

export const logout = async () => {
  return await supabaseProxy(supabase.auth.signOut());
};

export const getCurrentUser = async () => {
  return await supabaseProxy(supabase.auth.getUser());
};

export const getProfile = async (userId) => {
  return await supabaseProxy(
    supabase.from(ServerEndpoint.PROFILES).select('*').eq('id', userId).single()
  );
};

export const updateProfileAvatar = async (userId, avatarUrl) => {
  return await supabaseProxy(
    supabase.from(ServerEndpoint.PROFILES).update({ avatar_url: avatarUrl }).eq('id', userId)
  );
};
