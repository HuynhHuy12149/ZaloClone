import { supabase } from '../libs/supabase';
import { supabaseProxy } from './Proxy';

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
