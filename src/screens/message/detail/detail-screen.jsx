import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/base/context/ThemeContext';
import { getMessages, sendMessage, markMessagesAsRead, addMemberToGroup, getAllProfiles } from '@/base/services/messageService';
import { useAuthStore } from '@/base/shared/store/authStore';
import { supabase } from '@/base/services/supabase';
import ChatInput from './chat-input';
import Avatar from '@/base/components/Avatar';

export default function MessageDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const currentUser = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();

  const { conversationId, chatName, avatar, isGroup } = route?.params || {};
  const chatRoomId = isGroup ? conversationId : [currentUser?.id, conversationId].sort().join('-');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const flatListRef = useRef(null);

  const [typingUsers, setTypingUsers] = useState({});
  const channelRef = useRef(null);
  const typingTimers = useRef({});
  const lastTypingTime = useRef(0);

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMsg = payload.new;
        if (newMsg && newMsg.conversation_id === chatRoomId) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [newMsg, ...prev];
          });
          if (newMsg.sender_id !== currentUser?.id) {
            markMessagesAsRead(chatRoomId, currentUser?.id).catch(console.error);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  const sendTypingStatus = (isTyping) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUser?.id,
        username: currentUser?.full_name || currentUser?.username || 'Ai đó',
        isTyping,
      },
    });
  };

  const handleInputChange = (text) => {
    setInputText(text);
    const now = Date.now();
    if (text.length > 0) {
      if (now - lastTypingTime.current > 2000) {
        lastTypingTime.current = now;
        sendTypingStatus(true);
      }
    } else {
      sendTypingStatus(false);
      lastTypingTime.current = 0;
    }
  };

  const fetchMessages = async (pageNumber) => {
    try {
      const res = await getMessages(chatRoomId, pageNumber, limit);
      if (res.data) {
        if (pageNumber === 1) {
          setMessages(res.data);
        } else {
          setMessages(prev => [...prev, ...res.data]);
        }
        if (res.data.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    sendTypingStatus(false);
    lastTypingTime.current = 0;

    const tempId = Date.now().toString();
    const newMsg = {
      id: tempId,
      conversation_id: chatRoomId,
      sender_id: currentUser?.id,
      content: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [newMsg, ...prev]);
    setInputText('');

    try {
      await sendMessage(chatRoomId, currentUser?.id, newMsg.content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const typingUsernames = Object.values(typingUsers);
  let typingText = '';
  if (typingUsernames.length === 1) {
    typingText = `${typingUsernames[0]} đang soạn tin...`;
  } else if (typingUsernames.length > 1) {
    typingText = `${typingUsernames.join(', ')} đang soạn tin...`;
  }

  const renderItem = ({ item }) => {
    const isMe = item.sender_id === currentUser?.id;
    return (
      <View className={`flex-row mb-4 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <Avatar
            url={avatar}
            name={chatName}
            size={32}
            className="mr-2"
          />
        )}
        <View className="max-w-[75%]">
          {!isMe && isGroup && (
            <Text className="text-xs text-gray-400 ml-1 mb-0.5">{chatName}</Text>
          )}
          <View 
            className={`px-4 py-3 ${
              isMe 
                ? 'bg-zalo-blue rounded-3xl rounded-br-sm' 
                : 'bg-white dark:bg-zalo-darkCard rounded-3xl rounded-bl-sm shadow-sm'
            }`}
          >
            <Text className={`text-base leading-[22px] ${isMe ? 'text-white' : 'text-black dark:text-white'}`}>
              {item.content}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f2f2f7] dark:bg-black" edges={['right', 'left']}>
      {/* Header */}
      <View 
        className="flex-row items-center px-3 py-2.5 bg-white dark:bg-zalo-darkCard shadow-sm z-10"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10 }}
      >
        <TouchableOpacity className="p-1.5 mr-1.5 -ml-1" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors?.text || '#000'} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center flex-1"
          activeOpacity={0.7}
          onPress={() => isGroup && setShowAddMember(true)}
        >
          <Avatar
            url={avatar}
            name={chatName}
            size={36}
            className="mr-3 border border-black/10 dark:border-white/10"
          />
          <View className="flex-1 justify-center">
            <Text className="text-[17px] font-bold text-black dark:text-white tracking-tight" numberOfLines={1}>
              {chatName || 'Trò chuyện'}
            </Text>
            <Text className="text-xs font-semibold text-green-500 mt-0.5">Đang hoạt động</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zalo-darkInput items-center justify-center ml-1.5">
            <Ionicons name="call-outline" size={18} color={colors?.text || '#000'} />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zalo-darkInput items-center justify-center ml-1.5">
            <Ionicons name="videocam-outline" size={20} color={colors?.text || '#000'} />
          </TouchableOpacity>
          {isGroup && (
            <TouchableOpacity 
              className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zalo-darkInput items-center justify-center ml-1.5" 
              onPress={() => setShowAddMember(true)}
            >
              <Ionicons name="person-add-outline" size={18} color={colors?.text || '#000'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Messages View */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1, justifyContent: 'flex-end' }}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.2}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors?.accent || '#0068ff'} className="my-2" /> : null}
        />

        {/* Input Bar with Plus Menu & Typing Indicator */}
        <ChatInput
          inputText={inputText}
          setInputText={handleInputChange}
          showPlusMenu={showPlusMenu}
          setShowPlusMenu={setShowPlusMenu}
          handleSend={handleSend}
          insets={insets}
          colors={colors}
          typingText={typingText}
        />
      </View>

      {/* Add Member Modal */}
      {showAddMember && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="w-[85%] bg-white dark:bg-zalo-darkCard rounded-2xl p-5 max-h-[80%] items-center">
            <Text className="text-lg font-bold text-black dark:text-white mb-4">Thêm thành viên vào nhóm</Text>
            <FlatList
              data={friendsList}
              keyExtractor={item => item.id}
              className="w-full max-h-[300px]"
              renderItem={({ item }) => (
                <View className="flex-row items-center py-2 w-full">
                  <Avatar
                    url={item.avatar_url}
                    name={item.full_name || item.username}
                    size={36}
                    className="mr-3"
                  />
                  <Text className="text-base text-black dark:text-white flex-1">{item.full_name || item.username}</Text>
                  <TouchableOpacity 
                    className="px-3 py-1.5 bg-zalo-blue rounded-md" 
                    onPress={() => handleAddFriendToGroup(item.id)}
                  >
                    <Text className="text-white text-xs font-semibold">Thêm</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity 
              className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-zalo-darkInput mt-4" 
              onPress={() => setShowAddMember(false)}
            >
              <Text className="text-black dark:text-white font-semibold">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
