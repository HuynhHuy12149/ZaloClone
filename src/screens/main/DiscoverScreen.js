import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import ZaloHeader from '../../components/ZaloHeader';
import { useTheme } from '../../utils/ThemeContext';

const ITEMS = [
  { id: '1', icon: 'play-skip-forward', iconLib: 'ion', iconColor: '#facc15', title: 'Zalo Video', desc: '[Xem nhiều] Đây có phải là Cổ Khiết...', hasPreview: true },
  { id: '2', icon: 'newspaper-outline', iconLib: 'ion', iconColor: '#f87171', title: 'Trang tin tổng hợp', desc: 'Tin tức nổi bật trong ngày' },
  { id: '3', icon: 'game-controller-outline', iconLib: 'ion', iconColor: '#60a5fa', title: 'Game Center', desc: 'Tam Quốc Động Khởi, Tiên Nghịch' },
];

const ITEMS2 = [
  { id: '4', icon: 'home-outline', iconLib: 'ion', iconColor: '#4ade80', title: 'Dịch vụ đời sống', desc: 'Nạp điện thoại, Tra hóa đơn, ...' },
  { id: '5', icon: 'wallet-outline', iconLib: 'ion', iconColor: '#fb923c', title: 'Tiện ích tài chính', desc: 'Vay nhanh, Thẻ hoàn tiền, VN-Index, ...' },
  { id: '6', icon: 'shield-checkmark-outline', iconLib: 'ion', iconColor: '#818cf8', title: 'Bảo hiểm online', desc: 'Mua và quản lý bảo hiểm dễ dàng' },
];

const ITEMS3 = [
  { id: '7', icon: 'robot-industrial', iconLib: 'mci', iconColor: '#38bdf8', title: 'Trợ lý Công Dân Số', desc: 'AI hỏi đáp thủ tục hành chính công' },
  { id: '8', icon: 'flash-outline', iconLib: 'ion', iconColor: '#a78bfa', title: 'Mini App', desc: 'Khám phá ứng dụng nhỏ tiện ích' },
];

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const s = styles(colors);

  const renderItem = (item) => (
    <TouchableOpacity key={item.id} style={s.item} activeOpacity={0.7}>
      <View style={[s.iconBox, { backgroundColor: item.iconColor + '22' }]}>
        {item.iconLib === 'ion'
          ? <Ionicons name={item.icon} size={24} color={item.iconColor} />
          : <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
        }
      </View>
      <View style={s.itemContent}>
        <Text style={s.itemTitle}>{item.title}</Text>
        {item.desc && <Text style={s.itemDesc} numberOfLines={1}>{item.desc}</Text>}
      </View>
      {item.hasPreview && (
        <Image
          source={{ uri: 'https://i.pravatar.cc/50?u=zv' }}
          style={s.preview}
        />
      )}
      <Entypo name="chevron-small-right" size={22} color={colors.iconSub} />
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <ZaloHeader
        placeholder="Khám phá dịch vụ"
        rightIcons={[
          { component: <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.iconAction} /> },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={s.banner}>
          <View style={[s.bannerCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={[s.bannerText, { color: colors.accent }]}>  Khám phá dịch vụ mới nhất cho bạn</Text>
          </View>
        </View>

        <View style={s.sectionLabel}>
          <Text style={s.sectionTitle}>Giải trí</Text>
        </View>
        <View style={s.card}>
          {ITEMS.map(renderItem)}
        </View>

        <View style={[s.sectionLabel, { marginTop: 8 }]}>
          <Text style={s.sectionTitle}>Tài chính & Dịch vụ</Text>
        </View>
        <View style={s.card}>
          {ITEMS2.map(renderItem)}
        </View>

        <View style={[s.sectionLabel, { marginTop: 8 }]}>
          <Text style={s.sectionTitle}>Công cụ thông minh</Text>
        </View>
        <View style={s.card}>
          {ITEMS3.map(renderItem)}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  banner: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: c.bg },
  bannerCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12,
  },
  bannerText: { fontSize: 13, fontWeight: '500' },
  sectionLabel: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: c.bg },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: c.bgCard, borderRadius: 0 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 0.5, borderBottomColor: c.border,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  itemContent: { flex: 1, marginLeft: 14 },
  itemTitle: { fontSize: 15, fontWeight: '500', color: c.text },
  itemDesc: { fontSize: 12, color: c.textSub, marginTop: 2 },
  preview: { width: 48, height: 36, borderRadius: 6, marginRight: 8 },
});
