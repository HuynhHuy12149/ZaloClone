import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, StatusBar, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ZaloHeader from '../../../components/ZaloHeader';
import { useTheme } from '../../../utils/ThemeContext';
import { getAllProfiles } from '../../../services/supabaseService/messageService';
import { getLatestMessagesForUser } from '../../../services/supabaseService/messageService';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../libs/supabase';

const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestMessages, setLatestMessages] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;
      try {
        const [usersRes, messagesRes] = await Promise.all([
          getAllProfiles(),
          getLatestMessagesForUser(currentUser.id)
        ]);

        let filteredUsers = usersRes.data?.filter(u => u.id !== currentUser.id) || [];
        const latestMsgs = {};
        
        if (messagesRes.data) {
          messagesRes.data.forEach(msg => {
            const otherUserId = msg.conversation_id.split('-').find(id => id !== currentUser.id);
            if (otherUserId && !latestMsgs[otherUserId]) {
              latestMsgs[otherUserId] = msg;
            }
          });
        }
        setLatestMessages(latestMsgs);

        filteredUsers.sort((a, b) => {
          const timeA = latestMsgs[a.id] ? new Date(latestMsgs[a.id].created_at).getTime() : 0;
          const timeB = latestMsgs[b.id] ? new Date(latestMsgs[b.id].created_at).getTime() : 0;
          return timeB - timeA;
        });

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const subscription = supabase
      .channel('messages_list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMsg = payload.new;
        if (newMsg.conversation_id.includes(currentUser.id)) {
          const otherUserId = newMsg.conversation_id.split('-').find(id => id !== currentUser.id);
          
          if (otherUserId) {
            setLatestMessages(prev => ({
              ...prev,
              [otherUserId]: newMsg
            }));
            
            setUsers(prevUsers => {
              const userIndex = prevUsers.findIndex(u => u.id === otherUserId);
              if (userIndex > 0) {
                const user = prevUsers[userIndex];
                const newUsers = [...prevUsers];
                newUsers.splice(userIndex, 1);
                newUsers.unshift(user);
                return newUsers;
              }
              return prevUsers;
            });
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
        const updatedMsg = payload.new;
        if (updatedMsg.conversation_id.includes(currentUser.id)) {
          const otherUserId = updatedMsg.conversation_id.split('-').find(id => id !== currentUser.id);
          if (otherUserId) {
            setLatestMessages(prev => {
              // Only update if this is the latest message
              if (prev[otherUserId]?.id === updatedMsg.id) {
                return {
                  ...prev,
                  [otherUserId]: updatedMsg
                };
              }
              return prev;
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  const renderItem = ({ item }) => {
    const latestMsg = latestMessages[item.id];
    const isUnread = latestMsg && !latestMsg.is_read && latestMsg.sender_id !== currentUser?.id;

    return (
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
              <Text style={[s.chatName, isUnread && { fontWeight: '800' }]} numberOfLines={1}>{item.full_name || item.username}</Text>
            </View>
            <Text style={[s.chatTime, isUnread && { color: colors.accent, fontWeight: '600' }]}>
              {latestMsg ? formatTime(latestMsg.created_at) : '-'}
            </Text>
          </View>
          <View style={s.chatBottom}>
            <Text
              style={[s.chatMsg, isUnread && { color: colors.text, fontWeight: '600' }]}
              numberOfLines={1}
            >
              {latestMsg ? (latestMsg.sender_id === currentUser?.id ? `Bạn: ${latestMsg.content}` : latestMsg.content) : 'Chưa có tin nhắn...'}
            </Text>
            {isUnread && <View style={s.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
