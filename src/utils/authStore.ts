import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { LoginProps } from "../types/MainType";

const isWeb = Platform.OS === "web";

type UserState = {
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  user?: {
    id?: string;
    username?: string;
    fullName: string;
    email?: string;
    profilePic?: string | null;
  };
  logIn: (payload: LoginProps, userInfo?: { id: string, username: string, full_name: string, avatar_url: string | null }) => boolean;
  logOut: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  logInAsVip: () => void;
  setHasHydrated: (value: boolean) => void;
  updateUserAvatar: (avatar_url: string) => void;
};

export const useAuthStore = create(
  persist<UserState>(
    (set) => ({
      isLoggedIn: false,
      shouldCreateAccount: false,
      hasCompletedOnboarding: false,
      isVip: false,
      _hasHydrated: false,
      logIn: (payload, userInfo?: { id: string, username: string, full_name: string, avatar_url: string | null }) => {
        if (userInfo) {
          set((state) => ({
            ...state,
            isLoggedIn: true,
            user: {
              id: userInfo.id,
              username: userInfo.username,
              fullName: userInfo.full_name,
              profilePic: userInfo.avatar_url,
            }
          }));
          return true;
        }
      },
      logInAsVip: () => {
        set((state) => {
          return {
            ...state,
            isVip: true,
            isLoggedIn: true,
          };
        });
      },
      logOut: () => {
        set((state) => {
          return {
            ...state,
            isVip: false,
            isLoggedIn: false,
          };
        });
      },
      completeOnboarding: () => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: true,
          };
        });
      },
      resetOnboarding: () => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: false,
          };
        });
      },
      setHasHydrated: (value: boolean) => {
        set((state) => {
          return {
            ...state,
            _hasHydrated: value,
          };
        });
      },
      updateUserAvatar: (avatar_url: string) => {
        set((state) => ({
          ...state,
          user: state.user ? { ...state.user, profilePic: avatar_url } : undefined,
        }));
      },
    }),
    {
      name: "auth-store",
      storage: isWeb
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
          setItem: (key: string, value: string) =>
            SecureStore.setItemAsync(key, value),
          getItem: (key: string) => SecureStore.getItemAsync(key),
          removeItem: (key: string) => SecureStore.deleteItemAsync(key),
        })),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
