import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/base/context/ThemeContext';
import { useLanguage } from '@/base/context/LanguageContext';
import { useAuthStore } from '@/base/shared/store/authStore';
import { useLogoutMutation, useUpdateAvatarMutation } from '@/base/services/queries';
import Avatar from '@/base/components/Avatar';
import ProfileItem from './components/ProfileItem';
import { showToast } from '@/base/shared/utils/toast';

export default function ProfileScreen() {
  const { themeMode, setThemeMode, isDark, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const user = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();

  const logoutMutation = useLogoutMutation();
  const updateAvatarMutation = useUpdateAvatarMutation(user?.id);

  const [avatarUri, setAvatarUri] = useState(user?.profilePic || user?.avatar_url);
  const [isUploading, setIsUploading] = useState(false);

  const QUICK_ACTIONS = [
    { icon: 'qr-code-outline', label: t('profile.myQr'), lib: 'ion', color: '#ff6b6b' },
    { icon: 'wallet-outline', label: t('profile.zaloPay'), lib: 'ion', color: '#4ecdc4' },
    { icon: 'cloud-outline', label: t('profile.myCloud'), lib: 'ion', color: '#45b7d1' },
    { icon: 'apps-outline', label: t('profile.more'), lib: 'ion', color: '#9b59b6' },
  ];

  const SECTION1 = [
    { icon: 'cloud-outline', lib: 'ion', color: '#0a84ff', title: 'zCloud', desc: t('profile.storageDesc') },
    { icon: 'magic-staff', lib: 'mci', color: '#a78bfa', title: 'zStyle', desc: 'Nổi bật trên Zalo' },
  ];
  const SECTION2 = [
    { icon: 'folder-outline', lib: 'ion', color: '#34d399', title: 'My Documents' },
    { icon: 'phone-portrait-outline', lib: 'ion', color: '#fb923c', title: t('profile.storage') },
    { icon: 'wallet-outline', lib: 'ion', color: '#60a5fa', title: 'Ví QR' },
  ];
  const SECTION3 = [
    { icon: 'shield-outline', lib: 'ion', color: '#f87171', title: t('profile.accountAndSecurity'), desc: t('profile.accountDesc') },
    { icon: 'lock-closed-outline', lib: 'ion', color: '#818cf8', title: t('profile.privacyAndSecurity'), desc: t('profile.privacyDesc') },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onError: () => {
        showToast.error(t('common.error'), 'Không thể đăng xuất. Vui lòng thử lại.');
      },
    });
  };

  const pickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadToCloudinary(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image: ', error);
      showToast.error(t('common.error'), 'Không thể chọn ảnh');
    }
  };

  const uploadToCloudinary = async (uri) => {
    setIsUploading(true);
    try {
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        showToast.error(t('common.error'), 'Thiếu cấu hình Cloudinary trong .env');
        return;
      }

      const data = new FormData();
      data.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      data.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.secure_url) {
        setAvatarUri(result.secure_url);
        if (user?.id) {
          await updateAvatarMutation.mutateAsync(result.secure_url);
        }
        showToast.success(t('common.success'), t('profile.avatarUpdateSuccess'));
      } else {
        showToast.error(t('common.error'), result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.log('Error uploading image: ', error);
      showToast.error(t('common.error'), 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-5 pb-3 shadow-sm"
        style={{ paddingTop: insets.top + 16, backgroundColor: colors.bgHeader }}
      >
        <View className="flex-row items-center gap-3">
          <Avatar url={user?.avatar_url} name={user?.full_name} size={36} />
          <Text className="text-xl font-bold" style={{ color: colors.text }}>{t('profile.title')}</Text>
        </View>
        <TouchableOpacity className="p-1">
          <Ionicons name="settings-outline" size={24} color={colors?.text || '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Profile Info - Center Aligned */}
        <View className="items-center pt-8 pb-6 px-4">
          <TouchableOpacity 
            className="relative mb-4" 
            onPress={pickAndUploadImage} 
            disabled={isUploading} 
            activeOpacity={0.8}
          >
            <Avatar url={avatarUri} name={user?.fullName || user?.full_name} size={110} rounded={false} />
            {isUploading && (
              <View className="absolute inset-0 bg-black/50 rounded-3xl justify-center items-center">
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            )}
            <View 
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full justify-center items-center border-2"
              style={{ backgroundColor: '#0068ff', borderColor: colors.bg }}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
            {user?.fullName || user?.full_name || 'Người dùng Zalo'}
          </Text>
          <Text className="text-sm mb-4" style={{ color: colors.textSub }}>
            @{user?.username || 'username'}
          </Text>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              className="bg-zalo-blue px-6 py-2.5 rounded-full shadow-md shadow-zalo-blue/20" 
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-semibold">Cập nhật giới thiệu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 rounded-full justify-center items-center shadow-sm" 
              style={{ backgroundColor: colors.bgCard }}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={20} color={colors?.text || '#000'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bento Grid Actions */}
        <View className="flex-row justify-between px-4 mb-4 gap-2.5">
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity 
              key={item.label} 
              className="flex-1 items-center py-3.5 px-2 rounded-2xl" 
              style={{ backgroundColor: item.color + '15' }}
              activeOpacity={0.7}
            >
              <View 
                className="w-11 h-11 rounded-2xl items-center justify-center mb-2" 
                style={{ backgroundColor: item.color + '30' }}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text 
                className="text-xs font-semibold text-center"
                style={{ color: colors.text }}  numberOfLines={2}
              >
                {item.label.replace('\n', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Mode Selector Card (Light / Dark / System) */}
        <View className="rounded-3xl mx-4 mb-4 p-4 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
          <View className="flex-row items-center mb-3">
            <View 
              className="w-10 h-10 rounded-2xl items-center justify-center mr-3" 
              style={{ backgroundColor: isDark ? '#2a1f5c' : '#fef3c7' }}
            >
              <Ionicons
                name={themeMode === 'system' ? 'phone-portrait-outline' : (isDark ? 'moon' : 'sunny')}
                size={22}
                color={isDark ? '#a78bfa' : '#f59e0b'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {t('profile.themeSetting')}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSub }}>
                {themeMode === 'system' 
                  ? t('profile.themeSystem') 
                  : (themeMode === 'dark' ? t('profile.themeDark') : t('profile.themeLight'))}
              </Text>
            </View>
          </View>

          {/* 3-Way Segmented Control */}
          <View className="flex-row rounded-2xl p-1 gap-1" style={{ backgroundColor: colors.bgInput }}>
            {[
              { id: 'light', label: `☀️ ${t('profile.themeLight')}` },
              { id: 'dark', label: `🌙 ${t('profile.themeDark')}` },
              { id: 'system', label: `📱 ${t('profile.themeSystem')}` },
            ].map((option) => {
              const isSelected = themeMode === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center`}
                  style={isSelected ? { backgroundColor: colors.bgCard, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 } : {}}
                  activeOpacity={0.7}
                  onPress={() => setThemeMode(option.id)}
                >
                  <Text 
                    className="text-xs font-bold"
                    style={{ color: isSelected ? '#0068ff' : colors.textSub }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Multi-Language Selector Card */}
        <View className="rounded-3xl mx-4 mb-4 p-4 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: colors.accentLight }}>
              <Ionicons name="language" size={22} color="#0068ff" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {t('profile.language')}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSub }}>
                {language === 'vi' ? 'Tiếng Việt' : 'English'}
              </Text>
            </View>
          </View>

          {/* 2-Way Language Selector */}
          <View className="flex-row rounded-2xl p-1 gap-1" style={{ backgroundColor: colors.bgInput }}>
            {[
              { id: 'vi', label: '🇻🇳 Tiếng Việt' },
              { id: 'en', label: '🇬🇧 English' },
            ].map((option) => {
              const isSelected = language === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center`}
                  style={isSelected ? { backgroundColor: colors.bgCard, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 } : {}}
                  activeOpacity={0.7}
                  onPress={() => setLanguage(option.id)}
                >
                  <Text 
                    className="text-xs font-bold"
                    style={{ color: isSelected ? '#0068ff' : colors.textSub }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Grouped Lists */}
        <View className="rounded-3xl mx-4 mb-4 py-1 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
          {SECTION1.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION1.length - 1} />)}
        </View>

        <View className="rounded-3xl mx-4 mb-4 py-1 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
          {SECTION2.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION2.length - 1} />)}
        </View>

        <View className="rounded-3xl mx-4 mb-4 py-1 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
          {SECTION3.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION3.length - 1} />)}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="mx-4 mt-2 py-4 rounded-3xl items-center justify-center border" 
          style={{ 
            backgroundColor: isDark ? 'rgba(127, 29, 29, 0.2)' : '#fef2f2', 
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca' 
          }}
          activeOpacity={0.8} 
          onPress={() => {
            Alert.alert(t('auth.logout'), t('auth.logoutConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('auth.logout'), style: 'destructive', onPress: handleLogout }
            ]);
          }}
        >
          <Text className="text-base font-bold text-red-500">{t('auth.logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
