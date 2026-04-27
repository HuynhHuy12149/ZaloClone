import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import ZaloHeader from '../../../components/ZaloHeader';
import { useTheme } from '../../../utils/ThemeContext';
import Avatar from '../../../components/Avatar';

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

  const renderCardGroup = (title, data) => (
    <View style={s.sectionWrap}>
      <View style={s.sectionLabel}>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={s.card}>
        {data.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity style={s.item} activeOpacity={0.7}>
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
                <Avatar
                  url={null}
                  size={40}
                  rounded={false}
                  style={s.preview}
                />
              )}
              <Entypo name="chevron-small-right" size={22} color={colors.iconSub} />
            </TouchableOpacity>
            {index < data.length - 1 && <View style={s.itemDivider} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <ZaloHeader
        placeholder="Khám phá dịch vụ"
        rightIcons={[
          { component: <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.iconAction} /> },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Banner */}
        <View style={s.banner}>
          <View style={[s.bannerCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={[s.bannerText, { color: colors.accent }]}>Khám phá dịch vụ mới nhất cho bạn</Text>
          </View>
        </View>

        {renderCardGroup("Giải trí", ITEMS)}
        {renderCardGroup("Tài chính & Dịch vụ", ITEMS2)}
        {renderCardGroup("Công cụ thông minh", ITEMS3)}
      </ScrollView>
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  scrollContent: { paddingBottom: 110 },
  
  banner: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  bannerCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 24,
  },
  bannerText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  
  sectionWrap: {
    marginTop: 8,
  },
  sectionLabel: { paddingHorizontal: 24, paddingVertical: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  card: { 
    backgroundColor: c.bgCard, 
    borderRadius: 24,
    marginHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 0,
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  itemDivider: { height: 1, backgroundColor: c.border + '50', marginLeft: 74 },
  iconBox: {
    width: 44, height: 44, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  itemContent: { flex: 1, marginLeft: 14 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: c.text },
  itemDesc: { fontSize: 13, color: c.textSub, marginTop: 2 },
  preview: { width: 56, height: 40, borderRadius: 10, marginRight: 8 },
});
