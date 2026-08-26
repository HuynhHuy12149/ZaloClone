import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/base/context/ThemeContext';
import { 
  useMessagesQuery, 
  useSendMessageMutation, 
  useProfilesQuery,
  useAddMemberToGroupMutation,
  useMarkMessagesAsReadMutation,
  MESSAGE_KEYS 
} from '@/base/services/queries';
import { useAuthStore } from '@/base/shared/store/authStore';
import { supabase } from '@/base/services/supabase';
import { showToast } from '@/base/shared/utils/toast';
import ChatInput from './chat-input';
import Avatar from '@/base/components/Avatar';

export default function MessageDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const currentUser = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { conversationId, chatName, avatar, isGroup } = route?.params || {};
  const chatRoomId = isGroup ? conversationId : [currentUser?.id, conversationId].sort().join('-');

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const [typingUsers, setTypingUsers] = useState({});
  const channelRef = useRef(null);
  const typingTimers = useRef({});
  const lastTypingTime = useRef(0);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // TanStack Query: Messages & Mutations
  const { data: messages = [], isLoading } = useMessagesQuery(chatRoomId);
  const { data: friendsList = [] } = useProfilesQuery(currentUser?.id);
  const sendMessageMutation = useSendMessageMutation(chatRoomId, currentUser?.id);
  const addMemberMutation = useAddMemberToGroupMutation(chatRoomId);
  const markReadMutation = useMarkMessagesAsReadMutation();

  const handleAddFriendToGroup = (userId) => {
    addMemberMutation.mutate(
      { userId },
      {
        onSuccess: () => {
          showToast.success('Thành công', 'Đã thêm thành viên vào nhóm');
          setShowAddMember(false);
        },
        onError: (e) => {
          showToast.error('Lỗi', 'Thêm thành viên thất bại hoặc đã có trong nhóm');
          console.error(e);
        },
      }
    );
  };

  useEffect(() => {
    if (currentUser?.id) {
      markReadMutation.mutate({ conversationId: chatRoomId, userId: currentUser.id });
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
          queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.messages(chatRoomId) });
          if (newMsg.sender_id !== currentUser?.id) {
            markReadMutation.mutate({ conversationId: chatRoomId, userId: currentUser?.id });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, queryClient]);

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

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    sendTypingStatus(false);
    lastTypingTime.current = 0;

    sendMessageMutation.mutate({ content: textToSend });
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
                : 'rounded-3xl rounded-bl-sm shadow-sm'
            }`}
            style={!isMe ? { backgroundColor: colors.bgCard } : {}}
          >
            <Text className={`text-base leading-[22px] ${isMe ? 'text-white' : ''}`} style={!isMe ? { color: colors.text } : {}}>
              {item.content}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['right', 'left']}>
      {/* Header */}
      <View 
        className="flex-row items-center px-3 py-2.5 shadow-sm z-10"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10, backgroundColor: colors.bgHeader }}
      >
        <TouchableOpacity className="p-1.5 mr-1.5 -ml-1" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors?.text || '#000'} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center flex-1"
          activeOpacity={0.8}
        >
          <View className="relative">
            <Avatar
              url={avatar}
              name={chatName}
              size={42}
              rounded={!isGroup}
            />
            {!isGroup && (
              <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2" style={{ borderColor: colors.bgCard }} />
            )}
          </View>

          <View className="ml-2.5 flex-1">
            <Text className="text-base font-bold" style={{ color: colors.text }} numberOfLines={1}>
              {chatName || 'Người dùng'}
            </Text>
            <Text className="text-xs text-green-500 font-medium mt-0.5">
              {typingText || (isGroup ? 'Nhóm trò chuyện' : 'Vừa mới truy cập')}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity className="p-2">
            <Ionicons name="call-outline" size={22} color={colors?.text || '#000'} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="videocam-outline" size={24} color={colors?.text || '#000'} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={() => setShowAddMember(!showAddMember)}>
            <Ionicons name={isGroup ? "person-add-outline" : "reorder-three-outline"} size={24} color={colors?.text || '#000'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Member Dropdown for Groups */}
      {showAddMember && (
        <View className="border-b p-3 max-h-48 shadow-md z-20" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
          <Text className="font-bold mb-2" style={{ color: colors.text }}>Thêm thành viên vào nhóm:</Text>
          <FlatList
            data={friendsList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-row items-center py-2 border-b"
                style={{ borderColor: colors.border }}
                onPress={() => handleAddFriendToGroup(item.id)}
              >
                <Avatar url={item.avatar_url} name={item.full_name || item.username} size={30} />
                <Text className="ml-2 flex-1" style={{ color: colors.text }}>{item.full_name || item.username}</Text>
                <Ionicons name="add-circle" size={20} color={colors?.accent || '#0068ff'} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Messages list */}
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-4">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={colors?.accent || '#0068ff'} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              inverted
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Input Bar */}
        <ChatInput 
          inputText={inputText}
          handleInputChange={handleInputChange}
          handleSend={handleSend}
          colors={colors}
          showPlusMenu={showPlusMenu}
          setShowPlusMenu={setShowPlusMenu}
          chatRoomId={chatRoomId}
          currentUser={currentUser}
          insets={insets}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
