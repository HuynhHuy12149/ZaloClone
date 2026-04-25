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
  logIn: (payload: LoginProps) => boolean;
  logOut: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  logInAsVip: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create(
  persist<UserState>(
    (set) => ({
      isLoggedIn: false,
      shouldCreateAccount: false,
      hasCompletedOnboarding: false,
      isVip: false,
      _hasHydrated: false,
      logIn: (payload) => {
        if (payload.email === "khoa@gmail.com" && payload.password === "123456") {
          set((state) => {
            return {
              ...state,
              isLoggedIn: true,
              user: {
                fullName: "Khoa Tran",
                email: "khoa@gmail.com",
                profilePic: "https://res.cloudinary.com/df4dqpvoz/image/upload/v1754452415/my_upload/mrof5rukwvfxmdiydhcc.jpg"
              }
            };
          });
          return true
        }
        return false
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
