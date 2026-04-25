import React from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, StatusBar, ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ZaloHeader from '../../components/ZaloHeader';
import { useTheme } from '../../utils/ThemeContext';

const CHATS = [
  { id: '1', name: 'Lop_NC312_T260', message: 'Ngoc Tran tham gia bằng link nhóm', time: '6 phút', count: 0, isGroup: true, unread: true, pinned: true },
  { id: '2', name: 'My Documents', message: 'Bạn: [Hình ảnh]', time: '7 phút', count: 0 },
  { id: '3', name: 'Ykhoath', message: '[Sticker] 😂', time: '53 phút', count: 3 },
  { id: '4', name: 'Nguyễn Hào', message: 'Bạn: haha', time: '1 giờ', count: 0 },
  { id: '5', name: 'Tổng Kho Laptop Nhật', message: 'Nguyễn Cường: Dell latitude...', time: '1 giờ', count: 5, isGroup: true },
  { id: '6', name: 'Nhóm Tấu Hài 🎭', message: 'Hùng Gà: @Giang(TH) 2 cái luôn', time: '2 giờ', count: 0, isGroup: true },
  { id: '7', name: 'Minh Tú', message: 'Gọi nhỡ', time: '3 giờ', count: 0, missed: true },
  { id: '8', name: 'Hoàng Long', message: 'ok em nhé 👍', time: 'Hôm qua', count: 0 },
];

export default function MessagesScreen() {
  const { colors } = useTheme();
  const s = styles(colors);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={s.chatRow} activeOpacity={0.65}>
      {/* Avatar */}
      <View style={s.avatarContainer}>
        <Image
          source={{ uri: `https://i.pravatar.cc/150?u=${item.id}` }}
          style={s.avatar}
        />
        {/* Online dot */}
        {item.id === '4' && <View style={s.onlineDot} />}
      </View>

      {/* Content */}
      <View style={s.chatContent}>
        <View style={s.chatTop}>
          <View style={s.nameRow}>
            {item.pinned && (
              <Ionicons name="pin" size={12} color={colors.icon} style={{ marginRight: 6, transform: [{ rotate: '45deg' }] }} />
            )}
            <Text style={s.chatName} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={[s.chatTime, item.unread && { color: colors.accent, fontWeight: '600' }]}>{item.time}</Text>
        </View>
        <View style={s.chatBottom}>
          <Text
            style={[s.chatMsg, item.missed && { color: colors.badge }, item.unread && { color: colors.text, fontWeight: '500' }]}
            numberOfLines={1}
          >
            {item.missed ? '📞 Gọi nhỡ' : item.message}
          </Text>
          {item.count > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{item.count > 9 ? '9+' : item.count}</Text>
            </View>
          )}
          {item.unread && item.count === 0 && <View style={s.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <ZaloHeader
        rightIcons={[
          { component: <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.iconAction} /> },
          { component: <Ionicons name="add-circle-outline" size={26} color={colors.iconAction} /> },
        ]}
      />
      
      {/* Filter chips */}
      <View style={s.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {['Tất cả', 'Chưa đọc', 'Nhóm', 'OA'].map((label, i) => (
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.listContent}>
        <View style={s.listWrapper}>
          <FlatList
            data={CHATS}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={s.separator} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  filterRow: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: c.bgCard,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  chipText: { fontSize: 14, fontWeight: '500', color: c.textSub },
  
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  listWrapper: {
    backgroundColor: c.bgCard,
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: c.bgCard,
  },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.bgInput },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: c.online,
    borderWidth: 2.5, borderColor: c.bgCard,
  },
  chatContent: {
    flex: 1,
  },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  chatName: { fontSize: 16, fontWeight: '700', color: c.text, flex: 1 },
  chatTime: { fontSize: 12, color: c.textMuted },
  chatBottom: { flexDirection: 'row', alignItems: 'center' },
  chatMsg: { fontSize: 14, color: c.textSub, flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: c.badge,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.badge },
  separator: { height: 1, backgroundColor: c.border + '50', marginLeft: 86 },
});
