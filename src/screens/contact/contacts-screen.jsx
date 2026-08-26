import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  LayoutAnimation, Platform, UIManager, RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import ZaloHeader from '@/base/components/ZaloHeader';
import AnimatedTabBar from '@/base/components/AnimatedTabBar';
import { useTheme } from '@/base/context/ThemeContext';
import Avatar from '@/base/components/Avatar';
import { useAuthStore } from '@/base/shared/store/authStore';
import { useFriendsQuery } from '@/base/services/queries';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const TABS = ['Bạn bè', 'Nhóm', 'OA'];

const DEFAULT_FRIENDS = [
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
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState(0);

  // TanStack Query: Fetch friends
  const { data: dbFriends = [], isLoading, isRefetching, refetch } = useFriendsQuery(user?.id);

  const displayFriends = dbFriends.length > 0
    ? dbFriends.map(f => ({
        id: f.id,
        name: f.full_name || f.username,
        avatar_url: f.avatar_url,
        status: 'Đang hoạt động',
        online: true,
      }))
    : DEFAULT_FRIENDS;

  const handleTabChange = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(index);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors?.accent || '#0068ff'}
            colors={[colors?.accent || '#0068ff']}
          />
        }
      >
        {/* Quick actions group */}
        <View className="rounded-3xl mx-4 mt-4 py-1 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
          <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
            <View className="w-11 h-11 rounded-2xl bg-blue-700 items-center justify-center">
              <FontAwesome5 name="user-friends" size={18} color="#fff" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Lời mời kết bạn</Text>
            </View>
            <View className="bg-red-500 rounded-full min-w-[22px] h-[22px] items-center justify-center px-1.5 mr-2">
              <Text className="text-white text-[11px] font-bold">3</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors?.iconSub || '#9ca3af'} />
          </TouchableOpacity>
          
          <View className="h-[1px] ml-20" style={{ backgroundColor: colors.border }} />
          
          <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
            <View className="w-11 h-11 rounded-2xl bg-cyan-600 items-center justify-center">
              <FontAwesome5 name="birthday-cake" size={16} color="#fff" />
            </View>
            <View className="flex-1 ml-3.5">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Sinh nhật</Text>
              <Text className="text-[13px] mt-0.5" style={{ color: colors.textSub }} numberOfLines={1}>
                Hôm nay là sinh nhật bạn bè 🎂
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
                {[`Tất cả ${displayFriends.length}`, 'Mới truy cập', 'Yêu thích'].map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    className={`px-4 py-2 rounded-full shadow-sm`}
                    style={i === 0 ? { backgroundColor: '#0068ff' } : { backgroundColor: colors.bgCard }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '500', color: i === 0 ? 'white' : colors.textSub }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Friends list */}
            <View className="rounded-3xl mx-4 py-1 shadow-sm" style={{ backgroundColor: colors.bgCard }}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors?.accent || '#0068ff'} className="my-6" />
              ) : (
                displayFriends.map((friend, index) => (
                  <View key={friend.id}>
                    <TouchableOpacity className="flex-row items-center px-4 py-3" activeOpacity={0.7}>
                      <View className="relative">
                        <Avatar
                          url={friend.avatar_url}
                          name={friend.name}
                          size={50}
                        />
                        {friend.online && (
                          <View className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2" style={{ borderColor: colors.bgCard }} />
                        )}
                      </View>
                      <View className="flex-1 ml-3.5">
                        <Text className="text-base font-semibold" style={{ color: colors.text }}>{friend.name}</Text>
                        <Text className={`text-[13px] font-medium mt-0.5`} style={{ color: friend.online ? '#22c55e' : colors.textSub }}>
                          {friend.status}
                        </Text>
                      </View>
                      <View className="flex-row gap-1.5">
                        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.bgInput }}>
                          <Ionicons name="call-outline" size={20} color={colors?.icon || '#0068ff'} />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.bgInput }}>
                          <Ionicons name="videocam-outline" size={22} color={colors?.icon || '#0068ff'} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                    {index < displayFriends.length - 1 && (
                      <View className="h-[1px] ml-20" style={{ backgroundColor: colors.border }} />
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View className="pt-16 items-center gap-2">
            <MaterialIcons name={activeTab === 1 ? 'groups' : 'storefront'} size={64} color={colors?.iconSub || '#9ca3af'} />
            <Text className="text-base font-bold" style={{ color: colors.textSub }}>
              {activeTab === 1 ? 'Nhóm' : 'Official Account'}
            </Text>
            <Text className="text-sm text-gray-400">Chưa có dữ liệu</Text>
          </View>
        )}
      </ScrollView>

      {/* Alphabet sidebar */}
      {activeTab === 0 && (
        <View className="absolute right-1 top-1/4 justify-center items-center rounded-2xl py-2 px-1" style={{ backgroundColor: colors.bgInput + '80' }}>
          {ALPHABET.map((l) => (
            <Text key={l} className="text-[10px] py-0.5 font-bold" style={{ color: colors?.textSub || '#6b7280' }}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
