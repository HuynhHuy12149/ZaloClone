import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import ZaloHeader from '@/base/components/ZaloHeader';
import AnimatedTabBar from '@/base/components/AnimatedTabBar';
import { useTheme } from '@/base/context/ThemeContext';
import Avatar from '@/base/components/Avatar';

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

  const handleTabChange = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(index);
  };

  return (
    <View className="flex-1 bg-[#f2f2f7] dark:bg-black">
      <ZaloHeader
        rightIcons={[
          { component: <MaterialIcons name="person-add-alt" size={24} color={colors?.iconAction || '#374151'} /> },
        ]}
      />

      {/* Tabs */}
      <AnimatedTabBar
        tabs={TABS}
        active={activeTab}
        onChange={handleTabChange}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Quick actions group */}
        <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 mt-4 py-1 shadow-sm">
          <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
            <View className="w-11 h-11 rounded-2xl bg-blue-700 items-center justify-center">
              <FontAwesome5 name="user-friends" size={18} color="#fff" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-base font-semibold text-black dark:text-white">Lời mời kết bạn</Text>
            </View>
            <View className="bg-red-500 rounded-full min-w-[22px] h-[22px] items-center justify-center px-1.5 mr-2">
              <Text className="text-white text-[11px] font-bold">3</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors?.iconSub || '#9ca3af'} />
          </TouchableOpacity>
          
          <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-20" />
          
          <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
            <View className="w-11 h-11 rounded-2xl bg-cyan-600 items-center justify-center">
              <FontAwesome5 name="birthday-cake" size={16} color="#fff" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-base font-semibold text-black dark:text-white">Sinh nhật</Text>
              <Text className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
                Hôm nay là sinh nhật Huỳnh Khanh Phol 🎂
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors?.iconSub || '#9ca3af'} />
          </TouchableOpacity>
        </View>

        {activeTab === 0 ? (
          <>
            {/* Filter chips */}
            <View className="py-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                {['Tất cả 255', 'Mới truy cập', 'Yêu thích'].map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    className={`px-4 py-2 rounded-full shadow-sm ${
                      i === 0 ? 'bg-zalo-blue' : 'bg-white dark:bg-zalo-darkCard'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm font-medium ${i === 0 ? 'text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Section A */}
            <View className="px-6 pb-2">
              <Text className="text-sm font-extrabold text-gray-400 dark:text-gray-500">A</Text>
            </View>

            <View className="bg-white dark:bg-zalo-darkCard rounded-3xl mx-4 py-1 shadow-sm">
              {FRIENDS.map((friend, index) => (
                <View key={friend.id}>
                  <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
                    <View className="relative">
                      <Avatar
                        url={null}
                        name={friend.name}
                        size={50}
                      />
                      {friend.online && (
                        <View className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zalo-darkCard" />
                      )}
                    </View>
                    <View className="flex-1 ml-3.5">
                      <Text className="text-base font-semibold text-black dark:text-white">{friend.name}</Text>
                      <Text className={`text-[13px] font-medium mt-0.5 ${friend.online ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {friend.status}
                      </Text>
                    </View>
                    <View className="flex-row gap-1.5">
                      <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zalo-darkInput items-center justify-center">
                        <Ionicons name="call-outline" size={20} color={colors?.icon || '#0068ff'} />
                      </TouchableOpacity>
                      <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zalo-darkInput items-center justify-center">
                        <Ionicons name="videocam-outline" size={22} color={colors?.icon || '#0068ff'} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  {index < FRIENDS.length - 1 && (
                    <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-20" />
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="pt-16 items-center gap-2">
            <MaterialIcons name={activeTab === 1 ? 'groups' : 'storefront'} size={64} color={colors?.iconSub || '#9ca3af'} />
            <Text className="text-base font-bold text-gray-500 dark:text-gray-400">
              {activeTab === 1 ? 'Nhóm' : 'Official Account'}
            </Text>
            <Text className="text-sm text-gray-400">Chưa có dữ liệu</Text>
          </View>
        )}
      </ScrollView>

      {/* Alphabet sidebar */}
      {activeTab === 0 && (
        <View className="absolute right-1 top-1/4 justify-center items-center bg-gray-200/50 dark:bg-zalo-darkInput/50 rounded-2xl py-2 px-1">
          {ALPHABET.map((l) => (
            <Text key={l} className="text-[10px] text-gray-500 dark:text-gray-400 py-0.5 font-bold">
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
