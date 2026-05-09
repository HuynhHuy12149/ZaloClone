import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Image,
  ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { getMessages, sendMessage, markMessagesAsRead, addMemberToGroup, getAllProfiles } from '../../../../services/supabaseService/messageService';
import { useAuthStore } from '../../../../store/authStore';
import { supabase } from '../../../../libs/supabase';
import ChatInput from './chat-input';

export default function MessageDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const currentUser = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();

  // Params from navigation (with fallbacks for testing)
  const { conversationId, chatName, avatar, isGroup } = route?.params || {};

  // Create a unique conversation ID from the two user IDs
  const chatRoomId = isGroup ? conversationId : [currentUser?.id, conversationId].sort().join('-');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const flatListRef = useRef(null);

  // Typing Status State
  const [typingUsers, setTypingUsers] = useState({});
  const channelRef = useRef(null);
  const typingTimers = useRef({});
  const lastTypingTime = useRef(0);

  // Add Member State
  const [showAddMember, setShowAddMember] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  useEffect(() => {
    if (showAddMember && friendsList.length === 0) {
      getAllProfiles().then(res => {
        if (res.data) setFriendsList(res.data.filter(u => u.id !== currentUser?.id));
      }).catch(console.error);
    }
  }, [showAddMember]);

  const handleAddFriendToGroup = async (userId) => {
    try {
      await addMemberToGroup(chatRoomId, userId);
      alert('Đã thêm thành viên');
      setShowAddMember(false);
    } catch (e) {
      alert('Thêm thành viên thất bại hoặc đã có trong nhóm');
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages(1);

    // Mark messages as read
    if (currentUser?.id) {
      markMessagesAsRead(chatRoomId, currentUser.id).catch(err => console.log('Error marking messages as read:', err));
    }

    const channel = supabase.channel(`room:${chatRoomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, payload => {
        const { userId, username, isTyping } = payload.payload;
        if (userId === currentUser?.id) return;

        if (isTyping) {
          setTypingUsers(prev => ({ ...prev, [userId]: username }));
          if (typingTimers.current[userId]) {
            clearTimeout(typingTimers.current[userId]);
          }
          typingTimers.current[userId] = setTimeout(() => {
            setTypingUsers(prev => {
              const next = { ...prev };
              delete next[userId];
              return next;
            });
          }, 3000);
        } else {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
          if (typingTimers.current[userId]) {
            clearTimeout(typingTimers.current[userId]);
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${chatRoomId}` }, async payload => {
        if (payload.new.sender_id === currentUser?.id) return; // Ignore own messages from realtime

        // Fetch sender profile to show avatar and name correctly
        const { data: senderData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, full_name')
          .eq('id', payload.new.sender_id)
          .single();

        const newMsg = {
          ...payload.new,
          sender: senderData || null
        };

        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [newMsg, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [chatRoomId]);

  const handleTyping = (text) => {
    setInputText(text);
    
    if (!channelRef.current || !currentUser?.id) return;

    if (text.length === 0) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id, username: currentUser.full_name || currentUser.username || 'Ai đó', isTyping: false }
      });
      lastTypingTime.current = 0;
    } else {
      const now = Date.now();
      if (now - lastTypingTime.current > 2000) { // Throttle broadcast to every 2 seconds
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUser.id, username: currentUser.full_name || currentUser.username || 'Ai đó', isTyping: true }
        });
        lastTypingTime.current = now;
      }
    }
  };

  const fetchMessages = async (pageNumber = 1) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data, error } = await getMessages(chatRoomId, pageNumber, limit);
      if (data) {
        if (data.length < limit) setHasMore(false);
        else setHasMore(true);

        if (pageNumber === 1) {
          setMessages(data);
        } else {
          setMessages(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentUser?.id) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id, isTyping: false }
      });
      lastTypingTime.current = 0;
    }

    // Optimistic UI update
    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      sender_id: currentUser.id,
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [newMessage, ...prev]);

    try {
      const { data, error } = await sendMessage(chatRoomId, currentUser.id, textToSend);
      if (data) {
        // Replace optimistic message with actual DB message
        setMessages(prev => prev.map(m => m.id === tempId ? data : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === currentUser?.id;
    const senderAvatar = item.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.sender?.full_name || item.sender?.username || 'U')}&background=random`;

    return (
      <View style={[s.messageWrapper, isMe ? s.messageWrapperRight : s.messageWrapperLeft]}>
        {!isMe && (
          <Image source={{ uri: isGroup ? senderAvatar : (avatar || senderAvatar) }} style={s.messageAvatar} />
        )}
        <View style={{ maxWidth: '75%' }}>
          {isGroup && !isMe && (
            <Text style={s.senderName}>{item.sender?.full_name || item.sender?.username}</Text>
          )}
          <View style={[s.bubble, isMe ? s.bubbleRight : s.bubbleLeft]}>
            <Text style={[s.messageText, isMe ? s.messageTextRight : s.messageTextLeft]}>
              {item.content}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const typingUserNames = Object.values(typingUsers);
  let typingText = '';
  if (typingUserNames.length === 1) {
    typingText = `${typingUserNames[0]} đang soạn tin...`;
  } else if (typingUserNames.length > 1) {
    typingText = `${typingUserNames.join(', ')} đang soạn tin...`;
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: colors.bgCard }} edges={['top']} />
      <SafeAreaView style={s.safeArea} edges={['left', 'right']}>
        <KeyboardAvoidingView
          style={s.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <TouchableOpacity style={s.headerBtn} onPress={() => navigation?.goBack?.()}>
                <Ionicons name="chevron-back" size={26} color={colors.text} />
              </TouchableOpacity>
              <Image source={{ uri: avatar || 'https://via.placeholder.com/150' }} style={s.headerAvatar} />
            </View>

            <View style={s.headerInfo}>
              <Text style={s.headerTitle} numberOfLines={1}>{chatName}</Text>
              <Text style={s.headerStatus}>Đang hoạt động</Text>
            </View>

            <View style={s.headerActions}>
              {isGroup && (
                <TouchableOpacity style={s.headerBtnAction} onPress={() => setShowAddMember(true)}>
                  <Feather name="user-plus" size={18} color={colors.iconAction || colors.text} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.headerBtnAction}>
                <Feather name="phone" size={18} color={colors.iconAction || colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={s.headerBtnAction}>
                <Feather name="video" size={18} color={colors.iconAction || colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[s.headerBtnAction, { marginRight: 0 }]}>
                <Feather name="list" size={20} color={colors.iconAction || colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={{ flex: 1 }}>
            {/* Messages List */}
            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ flex: 1 }} />
            ) : (
              <FlatList
                style={{ flex: 1 }}
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={[s.listContent, { paddingTop: Platform.OS === 'android' ? 80 : 90 }]}
                showsVerticalScrollIndicator={false}
                inverted
                onEndReached={() => {
                  if (hasMore && !loadingMore && !loading) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchMessages(nextPage);
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 10 }} /> : null}
              />
            )}

            {/* Floating Input Area */}
            <ChatInput
              inputText={inputText}
              setInputText={handleTyping}
              showPlusMenu={showPlusMenu}
              setShowPlusMenu={setShowPlusMenu}
              handleSend={handleSend}
              insets={insets}
              colors={colors}
              typingText={typingText}
            />
          </View>
        </KeyboardAvoidingView>

        {/* Add Member Modal */}
        {showAddMember && (
          <View style={s.modalOverlay}>
            <View style={s.modalContainer}>
              <Text style={s.modalTitle}>Thêm thành viên</Text>
              <FlatList
                data={friendsList}
                keyExtractor={item => item.id}
                style={{ maxHeight: 300, width: '100%' }}
                renderItem={({ item: f }) => (
                  <View style={s.friendRow}>
                    <Image source={{ uri: f.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.full_name || f.username)}&background=random` }} style={s.friendAvatar} />
                    <Text style={s.friendName}>{f.full_name || f.username}</Text>
                    <TouchableOpacity style={s.addBtn} onPress={() => handleAddFriendToGroup(f.id)}>
                      <Text style={s.addBtnText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity style={s.modalBtnClose} onPress={() => setShowAddMember(false)}>
                <Text style={s.modalBtnTextClose}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </SafeAreaView>
    </>
  );
}

const styles = (c) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.bg, // Changed back to bg for the bottom chin
  },
  container: {
    flex: 1,
    backgroundColor: c.bg, // Main background for chat
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    backgroundColor: c.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: c.border + '15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 6,
    marginRight: 6,
    marginLeft: -4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: c.border + '30',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.3,
  },
  headerStatus: {
    fontSize: 12,
    color: '#10B981', // A green dot/text color for 'Active'
    marginTop: 2,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtnAction: {
    padding: 8,
    marginLeft: 6,
    backgroundColor: c.bgInput || '#F0F2F5',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperLeft: {
    justifyContent: 'flex-start',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    color: c.textMuted || '#888',
    marginLeft: 4,
    marginBottom: 2,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleLeft: {
    backgroundColor: c.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleRight: {
    backgroundColor: c.accent,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextLeft: {
    color: c.text,
  },
  messageTextRight: {
    color: '#fff',
  },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContainer: { width: '85%', backgroundColor: c.bgCard, borderRadius: 16, padding: 20, maxHeight: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 16 },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, width: '100%' },
  friendAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  friendName: { fontSize: 16, color: c.text, flex: 1 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: c.accent, borderRadius: 6 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalBtnClose: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: c.bgInput, marginTop: 16 },
  modalBtnTextClose: { color: c.text, fontWeight: '600' },
});
