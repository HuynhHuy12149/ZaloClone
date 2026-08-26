import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/base/context/ThemeContext';
import { useAuthStore } from '@/base/shared/store/authStore';
import { logout as supabaseLogout, updateProfileAvatar } from '@/base/services/authService';
import Avatar from '@/base/components/Avatar';

const QUICK_ACTIONS = [
  { icon: 'qr-code-outline', label: 'Mã QR\ncủa tôi', lib: 'ion', color: '#ff6b6b' },
  { icon: 'wallet-outline', label: 'Ví\nZalo Pay', lib: 'ion', color: '#4ecdc4' },
  { icon: 'cloud-outline', label: 'Cloud\ncủa tôi', lib: 'ion', color: '#45b7d1' },
  { icon: 'apps-outline', label: 'Thêm', lib: 'ion', color: '#9b59b6' },
];

const SECTION1 = [
  { icon: 'cloud-outline', lib: 'ion', color: '#0a84ff', title: 'zCloud', desc: 'Lưu trữ đám mây' },
  { icon: 'magic-staff', lib: 'mci', color: '#a78bfa', title: 'zStyle', desc: 'Nổi bật trên Zalo' },
];
const SECTION2 = [
  { icon: 'folder-outline', lib: 'ion', color: '#34d399', title: 'My Documents' },
  { icon: 'phone-portrait-outline', lib: 'ion', color: '#fb923c', title: 'Dữ liệu trên máy' },
  { icon: 'wallet-outline', lib: 'ion', color: '#60a5fa', title: 'Ví QR' },
];
const SECTION3 = [
  { icon: 'shield-outline', lib: 'ion', color: '#f87171', title: 'Tài khoản & bảo mật' },
  { icon: 'lock-closed-outline', lib: 'ion', color: '#818cf8', title: 'Quyền riêng tư' },
];

export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const user = useAuthStore(state => state.user);
  const logOut = useAuthStore(state => state.logOut);
  const updateUserAvatar = useAuthStore(state => state.updateUserAvatar);
  const insets = useSafeAreaInsets();

  const [avatarUri, setAvatarUri] = useState(user?.profilePic);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await supabaseLogout();
      await logOut();
    } catch (error) {
      console.log('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
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
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadToCloudinary = async (uri) => {
    setIsUploading(true);
    try {
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        Alert.alert('Lỗi', 'Thiếu cấu hình Cloudinary trong .env');
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
        updateUserAvatar(result.secure_url);

        if (user?.id) {
          await updateProfileAvatar(user.id, result.secure_url);

          const authInfoStr = await AsyncStorage.getItem('auth_info');
          if (authInfoStr) {
            const authInfo = JSON.parse(authInfoStr);
            authInfo.avatar_url = result.secure_url;
            await AsyncStorage.setItem('auth_info', JSON.stringify(authInfo));
          }
        }

        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.log('Error uploading image: ', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f2f2f7] dark:bg-black">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-5 pb-3 bg-white dark:bg-zalo-darkCard shadow-sm"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center gap-3">
          <Avatar url={user?.avatar_url} name={user?.full_name} size={36} />
          <Text className="text-xl font-bold text-black dark:text-white">Hồ sơ</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-full bg-gray-200 dark:bg-zalo-darkInput">
          <Ionicons name="settings-outline" size={24} color={colors?.text || '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

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
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zalo-blue justify-center items-center border-2 border-white dark:border-black"
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black dark:text-white mb-1">
            {user?.fullName || user?.full_name || 'Người dùng Zalo'}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
              className="w-10 h-10 rounded-full bg-white dark:bg-zalo-darkCard justify-center items-center shadow-sm" 
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
                className="text-xs font-semibold text-center text-black dark:text-white"
                numberOfLines={2}
              >
                {item.label.replace('\n', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grouped Lists */}
        <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 mb-4 py-1 shadow-sm">
          {SECTION1.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION1.length - 1} />)}
        </View>

        <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 mb-4 py-1 shadow-sm">
          {SECTION2.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION2.length - 1} />)}
        </View>

        <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 mb-4 py-1 shadow-sm">
          {SECTION3.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION3.length - 1} />)}
        </View>

        {/* Dark Mode Toggle */}
        <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 mb-4 py-1 shadow-sm">
          <View className="flex-row items-center px-4 py-3.5">
            <View 
              className="w-11 h-11 rounded-2xl items-center justify-center" 
              style={{ backgroundColor: isDark ? '#2a1f5c' : '#fef3c7' }}
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={22}
                color={isDark ? '#a78bfa' : '#f59e0b'}
              />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-base font-semibold text-black dark:text-white">Giao diện tối</Text>
              <Text className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{isDark ? 'Bật' : 'Tắt'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: colors?.accent || '#0068ff' }}
              thumbColor="#ffffff"
              ios_backgroundColor="#d1d5db"
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="mx-4 mt-2 py-4 rounded-3xl bg-red-50 dark:bg-red-950/40 items-center justify-center border border-red-200 dark:border-red-900/50" 
          activeOpacity={0.8} 
          onPress={() => {
            Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive', onPress: handleLogout }
            ]);
          }}
        >
          <Text className="text-base font-bold text-red-500">Đăng xuất tài khoản</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function ProfileItem({ item, colors, isLast }) {
  return (
    <>
      <TouchableOpacity className="flex-row items-center px-4 py-3.5" activeOpacity={0.7}>
        <View 
          className="w-11 h-11 rounded-2xl items-center justify-center" 
          style={{ backgroundColor: item.color + '1a' }}
        >
          {item.lib === 'ion'
            ? <Ionicons name={item.icon} size={22} color={item.color} />
            : <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
          }
        </View>
        <View className="flex-1 ml-3.5">
          <Text className="text-base font-semibold text-black dark:text-white">{item.title}</Text>
          {item.desc && (
            <Text className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
              {item.desc}
            </Text>
          )}
        </View>
        <Entypo name="chevron-small-right" size={24} color={colors?.iconSub || '#999'} />
      </TouchableOpacity>
      {!isLast && (
        <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-20" />
      )}
    </>
  );
}
