import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Image,
  SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../utils/ThemeContext';
import { getMessages, sendMessage } from '../../../../services/supabaseService/messageService';
import { useAuthStore } from '../../../../store/authStore';
import { supabase } from '../../../../libs/supabase';

export default function MessageDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const s = styles(colors);
  const currentUser = useAuthStore(state => state.user);

  // Params from navigation (with fallbacks for testing)
  const { conversationId, chatName, avatar } = route?.params || {};

  // Create a unique conversation ID from the two user IDs
  const chatRoomId = [currentUser?.id, conversationId].sort().join('-');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages(1);

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room:${chatRoomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${chatRoomId}` }, payload => {
        setMessages(prev => {
          // Check if message already exists (to avoid duplicates from optimistic update)
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatRoomId]);

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

    return (
      <View style={[s.messageWrapper, isMe ? s.messageWrapperRight : s.messageWrapperLeft]}>
        {!isMe && (
          <Image source={{ uri: avatar }} style={s.messageAvatar} />
        )}
        <View style={[s.bubble, isMe ? s.bubbleRight : s.bubbleLeft]}>
          <Text style={[s.messageText, isMe ? s.messageTextRight : s.messageTextLeft]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation?.goBack?.() || console.log('Go back')}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={s.headerInfo}>
            <Text style={s.headerTitle} numberOfLines={1}>{chatName}</Text>
            <Text style={s.headerStatus}>Vừa mới truy cập</Text>
          </View>

          <View style={s.headerActions}>
            <TouchableOpacity style={s.headerBtn}>
              <Feather name="phone" size={22} color={colors.iconAction || colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={s.headerBtn}>
              <Feather name="video" size={22} color={colors.iconAction || colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.headerBtn, { marginRight: 0 }]}>
              <Feather name="list" size={24} color={colors.iconAction || colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={s.listContent}
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

        {/* Input Area */}
        <View style={s.inputContainer}>
          <TouchableOpacity style={s.attachBtn}>
            <Feather name="plus" size={26} color={colors.iconAction || colors.text} />
          </TouchableOpacity>

          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              placeholder="Tin nhắn..."
              placeholderTextColor={colors.textMuted || '#999'}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={s.iconInsideBtn}>
              <Feather name="smile" size={24} color={colors.iconAction || colors.text} />
            </TouchableOpacity>
          </View>

          {inputText.trim().length > 0 ? (
            <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.attachBtn}>
              <Feather name="mic" size={24} color={colors.iconAction || colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 20,
    paddingTop: 40,
    backgroundColor: c.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: c.border + '30',
  },
  headerBtn: {
    padding: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
  },
  headerStatus: {
    fontSize: 13,
    color: c.accent,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 100,
    paddingBottom: 20,
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
  bubble: {
    maxWidth: '75%',
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
  inputContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: c.bgCard,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  attachBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgInput || '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: Platform.OS === 'ios' ? 4 : 0,
  },
  iconInsideBtn: {
    paddingLeft: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
