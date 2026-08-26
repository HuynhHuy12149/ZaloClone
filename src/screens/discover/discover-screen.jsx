import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import ZaloHeader from '@/base/components/ZaloHeader';
import { useTheme } from '@/base/context/ThemeContext';
import Avatar from '@/base/components/Avatar';

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

  const renderCardGroup = (title, data) => (
    <View className="mt-2">
      <View className="px-6 py-2">
        <Text className="text-[13px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </Text>
      </View>
      <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 py-1 shadow-sm">
        {data.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
              <View 
                className="w-11 h-11 rounded-2xl items-center justify-center"
                style={{ backgroundColor: item.iconColor + '22' }}
              >
                {item.iconLib === 'ion'
                  ? <Ionicons name={item.icon} size={24} color={item.iconColor} />
                  : <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
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
              {item.hasPreview && (
                <Avatar
                  url={null}
                  size={40}
                  rounded={false}
                  className="w-14 h-10 rounded-xl mr-2"
                />
              )}
              <Entypo name="chevron-small-right" size={22} color={colors?.iconSub || '#9ca3af'} />
            </TouchableOpacity>
            {index < data.length - 1 && (
              <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-20" />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f2f2f7] dark:bg-black">
      <ZaloHeader
        placeholder="Khám phá dịch vụ"
        rightIcons={[
          { component: <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors?.iconAction || '#374151'} /> },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Banner */}
        <View className="px-4 pt-4 pb-2">
          <View 
            className="flex-row items-center px-4 py-3.5 rounded-3xl"
            style={{ backgroundColor: colors?.accentLight || '#e8f0fe' }}
          >
            <Ionicons name="sparkles" size={20} color={colors?.accent || '#0068ff'} />
            <Text 
              className="text-sm font-semibold ml-2"
              style={{ color: colors?.accent || '#0068ff' }}
            >
              Khám phá dịch vụ mới nhất cho bạn
            </Text>
          </View>
        </View>

        {renderCardGroup("Giải trí", ITEMS)}
        {renderCardGroup("Tài chính & Dịch vụ", ITEMS2)}
        {renderCardGroup("Công cụ thông minh", ITEMS3)}
      </ScrollView>
    </View>
  );
}
