import React from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, StatusBar,
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
              <Ionicons name="pin" size={10} color={colors.icon} style={{ marginRight: 4, transform: [{ rotate: '45deg' }] }} />
            )}
            <Text style={s.chatName} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={[s.chatTime, item.unread && { color: colors.accent }]}>{item.time}</Text>
        </View>
        <View style={s.chatBottom}>
          <Text
            style={[s.chatMsg, item.missed && { color: colors.badge }]}
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
        {['Tất cả', 'Chưa đọc', 'Nhóm', 'OA'].map((label, i) => (
          <TouchableOpacity
            key={label}
            style={[s.chip, i === 0 && { backgroundColor: colors.accent }]}
          >
            <Text style={[s.chipText, i === 0 && { color: '#fff' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={CHATS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 82 }} />}
      />
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bgCard },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: c.bgCard,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: c.bgInput,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: c.textSub },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: c.bgCard,
    alignItems: 'center',
  },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: c.bgInput },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: c.online,
    borderWidth: 2, borderColor: c.bg,
  },
  chatContent: {
    flex: 1,
    paddingBottom: 11,
  },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  chatName: { fontSize: 15, fontWeight: '600', color: c.text, flex: 1 },
  chatTime: { fontSize: 11, color: c.textMuted },
  chatBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  chatMsg: { fontSize: 13, color: c.textSub, flex: 1, marginRight: 6 },
  badge: {
    backgroundColor: c.badge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.badge },
});
