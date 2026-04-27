import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import ZaloHeader from '../../../components/ZaloHeader';
import AnimatedTabBar from '../../../components/AnimatedTabBar';
import { useTheme } from '../../../utils/ThemeContext';
import Avatar from '../../../components/Avatar';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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

  const handleTabChange = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(index);
  };

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
        onChange={handleTabChange}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Quick actions group */}
        <View style={s.actionGroup}>
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
          <View style={s.actionDivider} />
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
        </View>

        {activeTab === 0 ? (
          <>
            {/* Filter chips */}
            <View style={s.filterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
                {['Tất cả 255', 'Mới truy cập', 'Yêu thích'].map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[s.chip, i === 0 && { backgroundColor: colors.accent }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, i === 0 && { color: '#fff', fontWeight: '600' }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Section A */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionLetter}>A</Text>
            </View>

            <View style={s.friendGroup}>
              {FRIENDS.map((friend, index) => (
                <View key={friend.id}>
                  <TouchableOpacity style={s.friendRow} activeOpacity={0.7}>
                    <View style={s.avatarWrap}>
                      <Avatar
                        url={null}
                        name={friend.name}
                        size={50}
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
                  {index < FRIENDS.length - 1 && <View style={s.friendDivider} />}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={s.emptyBox}>
            <MaterialIcons name={activeTab === 1 ? 'groups' : 'storefront'} size={64} color={colors.iconSub} />
            <Text style={s.emptyText}>{activeTab === 1 ? 'Nhóm' : 'Official Account'}</Text>
            <Text style={s.emptySub}>Chưa có dữ liệu</Text>
          </View>
        )}
      </ScrollView>

      {/* Alphabet sidebar */}
      {activeTab === 0 && (
        <View style={s.sidebar}>
          {ALPHABET.map((l) => (
            <Text key={l} style={s.sidebarLetter}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  scrollContent: { paddingBottom: 110 },

  actionGroup: {
    backgroundColor: c.bgCard,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 0,
    paddingVertical: 4,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  actionDivider: { height: 1, backgroundColor: c.border + '60', marginLeft: 74 },
  actionIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1, marginLeft: 14 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: c.text },
  actionSub: { fontSize: 13, color: c.textSub, marginTop: 2 },
  reqBadge: {
    backgroundColor: c.badge,
    borderRadius: 12, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6, marginRight: 8,
  },
  reqBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  filterRow: {
    paddingVertical: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 24, backgroundColor: c.bgCard,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 0,
  },
  chipText: { fontSize: 14, fontWeight: '500', color: c.textSub },

  sectionHeader: {
    paddingHorizontal: 24, paddingBottom: 8,
  },
  sectionLetter: { fontSize: 14, fontWeight: '800', color: c.textMuted },

  friendGroup: {
    backgroundColor: c.bgCard,
    borderRadius: 24,
    marginHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 0,
    paddingVertical: 4,
  },
  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  friendDivider: { height: 1, backgroundColor: c.border + '60', marginLeft: 80 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: c.bgInput },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: c.online, borderWidth: 2.5, borderColor: c.bgCard,
  },
  friendInfo: { flex: 1, marginLeft: 14 },
  friendName: { fontSize: 16, fontWeight: '600', color: c.text },
  friendStatus: { fontSize: 13, color: c.textSub, marginTop: 2, fontWeight: '500' },
  friendActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: c.bgInput,
    alignItems: 'center', justifyContent: 'center',
  },

  sidebar: {
    position: 'absolute', right: 4, top: '25%',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: c.bgInput + '40',
    borderRadius: 16,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  sidebarLetter: { fontSize: 10, color: c.iconSub, paddingVertical: 1.5, fontWeight: '700' },

  emptyBox: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: c.textSub },
  emptySub: { fontSize: 14, color: c.textMuted },
});
