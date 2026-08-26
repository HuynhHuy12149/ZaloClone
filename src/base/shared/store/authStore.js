import { create } from 'zustand';
import { CACHE_KEYS, getCache, setCache, removeCache } from './cache';

// === ZUSTAND STORE ===
export const useAuthStore = create((set) => ({
  user: null,
  isInitialized: false,

  initialize: async () => {
    const cachedUser = await getCache(CACHE_KEYS.AUTH_INFO);
    set({ user: cachedUser, isInitialized: true });
  },

  // Khi login thành công, lưu thông tin vào cả cache lẫn store
  logIn: async (authInfo) => {
    const user = {
      ...authInfo,
      fullName: authInfo.full_name || authInfo.fullName,
      profilePic: authInfo.avatar_url || authInfo.profilePic,
    };
    await setCache(CACHE_KEYS.AUTH_INFO, user);
    set({ user });
  },

  // Xóa cache và xóa state
  logOut: async () => {
    await removeCache(CACHE_KEYS.AUTH_INFO);
    set({ user: null });
  },

  // Cập nhật state nội bộ và ghi đè cache
  updateUserAvatar: async (avatarUrl) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { 
        ...state.user, 
        profilePic: avatarUrl,
        avatar_url: avatarUrl 
      };
      setCache(CACHE_KEYS.AUTH_INFO, updatedUser); // Sync to cache
      return { user: updatedUser };
    });
  },
}));
