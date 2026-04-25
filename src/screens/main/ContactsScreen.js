import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import ZaloHeader from '../../components/ZaloHeader';
import AnimatedTabBar from '../../components/AnimatedTabBar';
import { useTheme } from '../../utils/ThemeContext';

const TABS = ['Bạn bè', 'Nhóm', 'OA'];

const FRIENDS = [
  { id: '1', name: 'A. Kiệt', status: 'Đang hoạt động', online: true },
  { id: '2', name: 'A. Nguyên', status: '2 giờ trước', online: false },
  { id: '3', name: 'A. Tuấn', status: 'Đang hoạt động', online: true },
  { id: '4', name: 'An Nguyên', status: '5 giờ trước', online: false },
  { id: '5', name: 'Bảo Trân', status: 'Đang hoạt động', online: true },
  { id: '6', name: 'Bình Dương', status: '1 ngày trước', online: false },
];

const ALPHABET = 'ABCDEGHIKLMNPQSTUVYZ'.split('');

export default function ContactsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const s = styles(colors);

  return (
    <View style={s.container}>
      <ZaloHeader
        rightIcons={[
          { component: <MaterialIcons name="person-add-alt" size={24} color={colors.iconAction} /> },
        ]}
      />

      {/* Tabs */}
      <AnimatedTabBar
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick actions */}
        <TouchableOpacity style={s.actionRow} activeOpacity={0.7}>
          <View style={[s.actionIcon, { backgroundColor: '#1d4ed8' }]}>
            <FontAwesome5 name="user-friends" size={18} color="#fff" />
          </View>
          <View style={s.actionContent}>
            <Text style={s.actionTitle}>Lời mời kết bạn</Text>
          </View>
          <View style={s.reqBadge}><Text style={s.reqBadgeText}>3</Text></View>
          <Ionicons name="chevron-forward" size={18} color={colors.iconSub} />
        </TouchableOpacity>

        <TouchableOpacity style={s.actionRow} activeOpacity={0.7}>
          <View style={[s.actionIcon, { backgroundColor: '#0891b2' }]}>
            <FontAwesome5 name="birthday-cake" size={16} color="#fff" />
          </View>
          <View style={s.actionContent}>
            <Text style={s.actionTitle}>Sinh nhật</Text>
            <Text style={s.actionSub} numberOfLines={1}>Hôm nay là sinh nhật Huỳnh Khanh Phol 🎂</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.iconSub} />
        </TouchableOpacity>

        {/* Filter chips */}
        <View style={s.filterRow}>
          {['Tất cả 255', 'Mới truy cập', 'Yêu thích'].map((label, i) => (
            <TouchableOpacity
              key={label}
              style={[s.chip, i === 0 && { backgroundColor: colors.accent }]}
            >
              <Text style={[s.chipText, i === 0 && { color: '#fff' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section A */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLetter}>A</Text>
        </View>
        {FRIENDS.map((friend) => (
          <TouchableOpacity key={friend.id} style={s.friendRow} activeOpacity={0.7}>
            <View style={s.avatarWrap}>
              <Image
                source={{ uri: `https://i.pravatar.cc/100?u=${friend.id}` }}
                style={s.avatar}
              />
              {friend.online && <View style={s.onlineDot} />}
            </View>
            <View style={s.friendInfo}>
              <Text style={s.friendName}>{friend.name}</Text>
              <Text style={[s.friendStatus, friend.online && { color: colors.online }]}>
                {friend.status}
              </Text>
            </View>
            <View style={s.friendActions}>
              <TouchableOpacity style={s.actionBtn}>
                <Ionicons name="call-outline" size={20} color={colors.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn}>
                <Ionicons name="videocam-outline" size={22} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Alphabet sidebar */}
      <View style={s.sidebar}>
        {ALPHABET.map((l) => (
          <Text key={l} style={s.sidebarLetter}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    backgroundColor: c.bgCard, borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1, marginLeft: 14 },
  actionTitle: { fontSize: 15, fontWeight: '500', color: c.text },
  actionSub: { fontSize: 12, color: c.textSub, marginTop: 2 },
  reqBadge: {
    backgroundColor: c.badge,
    borderRadius: 12, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6, marginRight: 8,
  },
  reqBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: c.bg,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: c.bgCard,
    borderWidth: 0.5, borderColor: c.border,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: c.textSub },
  sectionHeader: {
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: c.bgSection,
  },
  sectionLetter: { fontSize: 13, fontWeight: '700', color: c.textMuted },
  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: c.bgCard, borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: c.bgInput },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: c.online, borderWidth: 2, borderColor: c.bgCard,
  },
  friendInfo: { flex: 1, marginLeft: 14 },
  friendName: { fontSize: 15, fontWeight: '500', color: c.text },
  friendStatus: { fontSize: 12, color: c.textSub, marginTop: 2 },
  friendActions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: c.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  sidebar: {
    position: 'absolute', right: 4, top: 140, bottom: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  sidebarLetter: { fontSize: 10, color: c.iconSub, paddingVertical: 1, fontWeight: '600' },
});
