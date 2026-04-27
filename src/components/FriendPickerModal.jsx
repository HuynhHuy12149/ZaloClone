import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, Image, ActivityIndicator, Modal,
  Platform, StatusBar, Animated, Dimensions, TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';
import { useAuthStore } from '../store/authStore';
import { getAcceptedFriends } from '../services/supabaseService/friendService';

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
      console.log('FriendPicker: Result from Service:', response);
      if (response && response.data) {
        // Biến đổi dữ liệu từ dạng quan hệ (user-friend) sang danh sách Profile phẳng
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
        style={[s.friendItem, { borderBottomColor: colors.border + '20' }]}
        onPress={() => toggleFriend(item)}
        activeOpacity={0.7}
      >
        <Avatar
          url={item.avatar_url}
          name={item.full_name}
          size={42}
        />
        <View style={s.friendInfo}>
          <Text style={[s.friendName, { color: colors.text }]}>{item.full_name}</Text>
          <Text style={[s.friendUsername, { color: colors.textMuted }]}>@{item.username || 'user'}</Text>
        </View>
        <View style={[s.checkbox, { borderColor: colors.border }, isSelected && s.checkboxActive]}>
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
      <View style={s.container}>
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View
            style={[
              s.backdrop,
              { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.5)' }
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            s.sheetWrap,
            { transform: [{ translateY: sheetTranslateY }] }
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[s.sheet, { backgroundColor: colors.bgCard, height: SCREEN_HEIGHT * 0.85 }]}
          >
            <View style={[s.handle, { backgroundColor: colors.border }]} />

            <View style={s.header}>
              <TouchableOpacity onPress={hide} style={s.headerBtn}>
                <Text style={[s.cancelText, { color: colors.text }]}>Hủy</Text>
              </TouchableOpacity>
              <Text style={[s.headerTitle, { color: colors.text }]}>Gắn thẻ bạn bè</Text>
              <TouchableOpacity onPress={handleConfirm} style={s.headerBtn}>
                <Text style={[s.doneText, { color: colors.accent }]}>Xong</Text>
              </TouchableOpacity>
            </View>

            <View style={s.searchSection}>
              <View style={[s.searchContainer, { backgroundColor: colors.bgInput }]}>
                <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginLeft: 12 }} />
                <TextInput
                  style={[s.searchInput, { color: colors.text }]}
                  placeholder="Tìm kiếm bạn bè"
                  placeholderTextColor={colors.textPlaceholder}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {loading && friends.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={colors.accent} />
            ) : (
              <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={s.emptyBox}>
                    <Text style={[s.emptyText, { color: colors.textMuted }]}>
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

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheetWrap: { width: '100%' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 12 },
  handle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 48 },
  headerBtn: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  cancelText: { fontSize: 16 },
  doneText: { fontSize: 16, fontWeight: '700' },
  searchSection: { paddingHorizontal: 16, paddingVertical: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  friendInfo: { flex: 1, marginLeft: 12 },
  friendName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  friendUsername: { fontSize: 13 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#006af5', borderColor: '#006af5' },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 15 },
});

export default FriendPickerModal;
