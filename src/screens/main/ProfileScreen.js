import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Switch, StyleSheet, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { useAuthStore } from '../../utils/authStore';
import { logout as supabaseLogout, updateProfileAvatar } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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
  const { user, logOut, updateUserAvatar } = useAuthStore();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  const [avatarUri, setAvatarUri] = useState(user?.profilePic || 'https://i.pravatar.cc/150?u=me');
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await supabaseLogout();
      await AsyncStorage.removeItem('auth_info');
      logOut();
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <Text style={s.headerTitle}>Hồ sơ</Text>
        <TouchableOpacity style={s.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        {/* Profile Info - Center Aligned */}
        <View style={s.profileHeader}>
          <TouchableOpacity style={s.avatarWrap} onPress={pickAndUploadImage} disabled={isUploading} activeOpacity={0.8}>
            <Image source={{ uri: avatarUri }} style={s.avatar} />
            {isUploading && (
              <View style={[StyleSheet.absoluteFill, s.avatarOverlay]}>
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            )}
            <View style={[s.editBadge, { backgroundColor: colors.accent }]}>
               <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={s.profileName}>{user?.fullName || 'Người dùng Zalo'}</Text>
          <Text style={s.profileSub}>@{user?.username || 'username'}</Text>
          
          <View style={s.profileActionsRow}>
            <TouchableOpacity style={[s.pillBtn, { backgroundColor: colors.accent }]} activeOpacity={0.8}>
              <Text style={s.pillBtnText}>Cập nhật giới thiệu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.bgCard }]} activeOpacity={0.8}>
               <Ionicons name="qr-code" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bento Grid Actions */}
        <View style={s.bentoContainer}>
          {QUICK_ACTIONS.map((item, i) => (
            <TouchableOpacity key={item.label} style={[s.bentoBox, { backgroundColor: item.color + '15' }]} activeOpacity={0.7}>
              <View style={[s.bentoIcon, { backgroundColor: item.color + '30' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={[s.bentoLabel, { color: colors.text }]}>{item.label.replace('\n', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grouped Lists */}
        <View style={s.listGroup}>
          {SECTION1.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION1.length - 1} />)}
        </View>

        <View style={s.listGroup}>
          {SECTION2.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION2.length - 1} />)}
        </View>

        <View style={s.listGroup}>
          {SECTION3.map((item, i) => <ProfileItem key={item.title} item={item} colors={colors} isLast={i === SECTION3.length - 1} />)}
        </View>

        {/* Dark Mode */}
        <View style={s.listGroup}>
          <View style={s.toggleRow}>
            <View style={[s.itemIconBox, { backgroundColor: isDark ? '#2a1f5c' : '#fef3c7' }]}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={22}
                color={isDark ? '#a78bfa' : '#f59e0b'}
              />
            </View>
            <View style={s.itemContent}>
              <Text style={s.itemTitle}>Giao diện tối</Text>
              <Text style={s.itemDesc}>{isDark ? 'Bật' : 'Tắt'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: colors.accent }}
              thumbColor="#ffffff"
              ios_backgroundColor="#d1d5db"
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} activeOpacity={0.8} onPress={() => {
          Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: handleLogout }
          ]);
        }}>
          <Text style={s.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}

function ProfileItem({ item, colors, isLast }) {
  const s = styles(colors);
  return (
    <TouchableOpacity style={[s.item, !isLast && s.itemBorder]} activeOpacity={0.7}>
      <View style={[s.itemIconBox, { backgroundColor: item.color + '1a' }]}>
        {item.lib === 'ion'
          ? <Ionicons name={item.icon} size={22} color={item.color} />
          : <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
        }
      </View>
      <View style={s.itemContent}>
        <Text style={s.itemTitle}>{item.title}</Text>
        {item.desc && <Text style={s.itemDesc} numberOfLines={1}>{item.desc}</Text>}
      </View>
      <Entypo name="chevron-small-right" size={24} color={colors.iconSub || '#999'} />
    </TouchableOpacity>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg }, 
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 16,
    backgroundColor: c.bg,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
  settingsBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: c.bgCard, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  avatarWrap: { 
    marginBottom: 16,
    shadowColor: c.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8
  },
  avatar: { width: 110, height: 110, borderRadius: 40, backgroundColor: c.bgInput },
  avatarOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 32, height: 32, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: c.bg,
  },
  profileName: { fontSize: 24, fontWeight: '800', color: c.text, marginBottom: 4 },
  profileSub: { fontSize: 15, fontWeight: '500', color: c.textSub, marginBottom: 20 },
  
  profileActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pillBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24,
  },
  pillBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  iconBtn: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },

  bentoContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    marginBottom: 24, gap: 12,
  },
  bentoBox: {
    width: (width - 40 - 12) / 2,
    backgroundColor: c.bgCard,
    borderRadius: 24,
    padding: 16,
    alignItems: 'flex-start',
  },
  bentoIcon: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  bentoLabel: { fontSize: 15, fontWeight: '700' },

  listGroup: {
    backgroundColor: c.bgCard,
    borderRadius: 24,
    marginBottom: 16,
    paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1, borderBottomColor: c.border + '60',
  },
  itemIconBox: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  itemContent: { flex: 1, marginLeft: 16 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 2 },
  itemDesc: { fontSize: 13, color: c.textSub },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },

  logoutBtn: {
    backgroundColor: '#ff475715',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#ff4757' },
});

