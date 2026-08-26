import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator, Modal,
  Platform, Animated, Dimensions, TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/base/context/ThemeContext';
import Avatar from '@/base/components/Avatar';
import { useAuthStore } from '@/base/shared/store/authStore';
import { getAcceptedFriends } from '@/base/services/friendService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FriendPickerModal = forwardRef(({ onSelect, initialSelected = [] }, ref) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState(initialSelected);
  const [loading, setLoading] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const show = () => {
    setSelectedFriends(initialSelected);
    setVisible(true);
    fetchFriends();
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 350, useNativeDriver: true })
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setVisible(false);
      setSearch('');
    });
  };

  useImperativeHandle(ref, () => ({
    present: show,
    dismiss: hide,
  }));

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getAcceptedFriends(user.id);
      if (response && response.data) {
        const friendList = response.data.map(row => {
          return row.user?.id === user.id ? row.friend : row.user;
        }).filter(p => p !== null);

        setFriends(friendList);
      }
    } catch (e) {
      console.error('FriendPicker UI Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friend) => {
    const isSelected = selectedFriends.some(f => f.id === friend.id);
    if (isSelected) {
      setSelectedFriends(prev => prev.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends(prev => [...prev, friend]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedFriends);
    hide();
  };

  const filteredFriends = friends.filter(f =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const isSelected = selectedFriends.some(f => f.id === item.id);
    return (
      <TouchableOpacity
        className="flex-row items-center py-3.5 border-b border-gray-200/40 dark:border-zalo-darkBorder/40"
        onPress={() => toggleFriend(item)}
        activeOpacity={0.7}
      >
        <Avatar
          url={item.avatar_url}
          name={item.full_name}
          size={42}
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-black dark:text-white mb-0.5">{item.full_name}</Text>
          <Text className="text-[13px] text-gray-400">@{item.username || 'user'}</Text>
        </View>
        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          isSelected ? 'bg-zalo-blue border-zalo-blue' : 'border-gray-300 dark:border-gray-600'
        }`}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View
            className="absolute inset-0 bg-black/50"
            style={{ opacity: backdropOpacity }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          className="w-full"
          style={{ transform: [{ translateY: sheetTranslateY }] }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="rounded-t-[32px] pt-3 bg-white dark:bg-zalo-darkCard"
            style={{ height: SCREEN_HEIGHT * 0.85 }}
          >
            <View className="w-10 h-1 rounded-full self-center mb-2.5 bg-gray-300 dark:bg-zalo-darkBorder" />

            <View className="flex-row items-center justify-between px-2 h-12">
              <TouchableOpacity onPress={hide} className="px-3 h-full justify-center">
                <Text className="text-base text-black dark:text-white">Hủy</Text>
              </TouchableOpacity>
              <Text className="text-lg font-extrabold text-black dark:text-white">Gắn thẻ bạn bè</Text>
              <TouchableOpacity onPress={handleConfirm} className="px-3 h-full justify-center">
                <Text className="text-base font-bold text-zalo-blue">Xong</Text>
              </TouchableOpacity>
            </View>

            <View className="px-4 py-3">
              <View className="flex-row items-center rounded-full h-11 bg-gray-200 dark:bg-zalo-darkInput">
                <Ionicons name="search" size={18} color={colors?.textMuted || '#9ca3af'} style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 ml-2 text-[15px] text-black dark:text-white"
                  placeholder="Tìm kiếm bạn bè"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
                    <Ionicons name="close-circle" size={18} color={colors?.textMuted || '#9ca3af'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {loading && friends.length === 0 ? (
              <ActivityIndicator className="mt-5" color={colors?.accent || '#0068ff'} />
            ) : (
              <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View className="items-center mt-10">
                    <Text className="text-[15px] text-gray-400">
                      {search ? 'Không tìm thấy kết quả' : 'Chưa có bạn bè nào'}
                    </Text>
                  </View>
                }
              />
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default FriendPickerModal;
