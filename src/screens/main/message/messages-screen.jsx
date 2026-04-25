import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, StatusBar, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ZaloHeader from '../../../components/ZaloHeader';
import { useTheme } from '../../../utils/ThemeContext';
import { getAllProfiles } from '../../../services/supabaseService/authService';
import { useAuthStore } from '../../../store/authStore';

export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await getAllProfiles();
        if (data) {
          const filteredUsers = data.filter(u => u.id !== currentUser?.id);
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={s.chatRow} 
      activeOpacity={0.65}
      onPress={() => navigation.navigate('MessageDetail', {
        conversationId: item.id, // using user id as conversation id for direct messages
        chatName: item.full_name || item.username,
        avatar: item.avatar_url || `https://ui-avatars.com/api/?name=${item.full_name || item.username}&background=random`
      })}
    >
      {/* Avatar */}
      <View style={s.avatarContainer}>
        <Image
          source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${item.full_name || item.username}&background=random` }}
          style={s.avatar}
        />
        {/* Online dot */}
        <View style={s.onlineDot} />
      </View>

      {/* Content */}
      <View style={s.chatContent}>
        <View style={s.chatTop}>
          <View style={s.nameRow}>
            <Text style={s.chatName} numberOfLines={1}>{item.full_name || item.username}</Text>
          </View>
          <Text style={s.chatTime}>-</Text>
        </View>
        <View style={s.chatBottom}>
          <Text
            style={s.chatMsg}
            numberOfLines={1}
          >
            Chưa có tin nhắn...
          </Text>
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
          {loading ? (
             <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={s.separator} />}
            />
          )}
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
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 0,
  },
  chipText: { fontSize: 14, fontWeight: '500', color: c.textSub },
  
  listContent: {
    paddingHorizontal: 16,
    marginTop:2,
    paddingBottom: 110,
  },
  listWrapper: {
    backgroundColor: c.bgCard,
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 0,
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
