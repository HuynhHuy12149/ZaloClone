import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Switch, StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';

const QUICK_ACTIONS = [
  { icon: 'qr-code-outline', label: 'Mã QR\ncủa tôi', lib: 'ion' },
  { icon: 'wallet-outline', label: 'Ví\nZalo Pay', lib: 'ion' },
  { icon: 'cloud-outline', label: 'Cloud\ncủa tôi', lib: 'ion' },
  { icon: 'apps-outline', label: 'Thêm', lib: 'ion' },
];

const SECTION1 = [
  { icon: 'cloud-outline', lib: 'ion', color: '#0a84ff', title: 'zCloud', desc: 'Không gian lưu trữ dữ liệu trên đám mây' },
  { icon: 'magic-staff', lib: 'mci', color: '#a78bfa', title: 'zStyle – Nổi bật trên Zalo', desc: 'Hình nền và nhạc cho cuộc gọi Zalo' },
];
const SECTION2 = [
  { icon: 'folder-outline', lib: 'ion', color: '#34d399', title: 'My Documents', desc: 'Lưu trữ các tin nhắn quan trọng' },
  { icon: 'phone-portrait-outline', lib: 'ion', color: '#fb923c', title: 'Dữ liệu trên máy', desc: 'Quản lý dữ liệu Zalo của bạn' },
  { icon: 'wallet-outline', lib: 'ion', color: '#60a5fa', title: 'Ví QR', desc: 'Lưu trữ và xuất trình các mã QR' },
];
const SECTION3 = [
  { icon: 'shield-outline', lib: 'ion', color: '#f87171', title: 'Tài khoản và bảo mật' },
  { icon: 'lock-closed-outline', lib: 'ion', color: '#818cf8', title: 'Quyền riêng tư' },
];

export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = styles(colors);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Text style={s.headerTitle}>Cá nhân</Text>
        <TouchableOpacity style={s.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={colors.iconAction} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity style={s.profileCard} activeOpacity={0.8}>
          <View style={s.avatarWrap}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=me' }} style={s.avatar} />
            <View style={[s.emojiBadge, { backgroundColor: colors.bgCard }]}>
              <Text style={{ fontSize: 12 }}>😊</Text>
            </View>
          </View>
          <View style={s.profileMeta}>
            <Text style={s.profileName}>Huynh Huy</Text>
            <Text style={s.profileSub}>Xem trang cá nhân</Text>
          </View>
          <View style={s.profileRight}>
            <View style={[s.qrSmallBtn, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="qr-code-outline" size={18} color={colors.accent} />
            </View>
            <MaterialCommunityIcons name="account-sync-outline" size={24} color={colors.icon} style={{ marginLeft: 10 }} />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={s.quickRow}>
          {QUICK_ACTIONS.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={s.quickItem} activeOpacity={0.7}>
                <View style={[s.quickIconBox, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name={item.icon} size={22} color={colors.icon} />
                </View>
                <Text style={s.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
              {i < QUICK_ACTIONS.length - 1 && <View style={s.quickDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={s.gap} />

        {/* Section 1 */}
        {SECTION1.map((item) => <ProfileItem key={item.title} item={item} colors={colors} />)}

        <View style={s.gap} />

        {/* Section 2 */}
        {SECTION2.map((item) => <ProfileItem key={item.title} item={item} colors={colors} />)}

        <View style={s.gap} />

        {/* Section 3 */}
        {SECTION3.map((item) => <ProfileItem key={item.title} item={item} colors={colors} />)}

        <View style={s.gap} />

        {/* Dark Mode Toggle */}
        <View style={s.toggleRow}>
          <View style={[s.toggleIcon, { backgroundColor: isDark ? '#2a1f5c' : '#fef3c7' }]}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={21}
              color={isDark ? '#a78bfa' : '#f59e0b'}
            />
          </View>
          <View style={s.toggleContent}>
            <Text style={s.toggleTitle}>Giao diện tối</Text>
            <Text style={s.toggleSub}>{isDark ? 'Đang bật' : 'Đang tắt'}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#d1d5db', true: colors.accent }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d1d5db"
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

function ProfileItem({ item, colors }) {
  const s = styles(colors);
  return (
    <TouchableOpacity style={s.item} activeOpacity={0.7}>
      <View style={[s.itemIconBox, { backgroundColor: item.color + '1a' }]}>
        {item.lib === 'ion'
          ? <Ionicons name={item.icon} size={21} color={item.color} />
          : <MaterialCommunityIcons name={item.icon} size={21} color={item.color} />
        }
      </View>
      <View style={s.itemContent}>
        <Text style={s.itemTitle}>{item.title}</Text>
        {item.desc && <Text style={s.itemDesc} numberOfLines={1}>{item.desc}</Text>}
      </View>
      <Entypo name="chevron-small-right" size={22} color={colors.iconSub} />
    </TouchableOpacity>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: c.bgCard,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: c.text },
  settingsBtn: { padding: 4 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: c.bgCard,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: c.bgInput },
  emojiBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: c.bg,
  },
  profileMeta: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 18, fontWeight: '700', color: c.text },
  profileSub: { fontSize: 13, color: c.textSub, marginTop: 3 },
  profileRight: { flexDirection: 'row', alignItems: 'center' },
  qrSmallBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  quickRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.bgCard,
    paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  quickItem: { flex: 1, alignItems: 'center', gap: 7 },
  quickIconBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, color: c.text, textAlign: 'center' },
  quickDivider: { width: 0.5, height: 40, backgroundColor: c.border },

  gap: { height: 8, backgroundColor: c.bg },

  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    backgroundColor: c.bgCard,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  itemIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  itemContent: { flex: 1, marginLeft: 14 },
  itemTitle: { fontSize: 15, fontWeight: '500', color: c.text },
  itemDesc: { fontSize: 12, color: c.textSub, marginTop: 2 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    backgroundColor: c.bgCard,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  toggleIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleContent: { flex: 1, marginLeft: 14 },
  toggleTitle: { fontSize: 15, fontWeight: '500', color: c.text },
  toggleSub: { fontSize: 12, color: c.textSub, marginTop: 2 },
});
