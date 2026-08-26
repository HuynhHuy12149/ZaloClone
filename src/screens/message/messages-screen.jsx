import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import ZaloHeader from "@/base/components/ZaloHeader";
import Avatar from "@/base/components/Avatar";
import { useTheme } from "@/base/context/ThemeContext";
import { useConversationsQuery, useCreateGroupMutation, MESSAGE_KEYS } from "@/base/services/queries";
import { useAuthStore } from "@/base/shared/store/authStore";
import { supabase } from "@/base/services/supabase";
import ChatItem from "./components/ChatItem";
import CreateGroupModal from "./components/CreateGroupModal";

export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [isCreateGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Notification State & Animation
  const [notification, setNotification] = useState(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  // TanStack Query: Fetch Conversations & Friends
  const { 
    data = { chats: [], friendsList: [], latestMessages: {} }, 
    isLoading, 
    isRefetching, 
    refetch 
  } = useConversationsQuery(currentUser?.id);

  const { chats, friendsList, latestMessages } = data;
  const createGroupMutation = useCreateGroupMutation(currentUser?.id);

  useEffect(() => {
    // Listen for Realtime Changes in Messages and invalidate Query
    const channel = supabase
      .channel("public:messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          if (!newMsg) return;

          queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.conversations(currentUser?.id) });

          const isGroup = newMsg.conversation_id.length === 36;
          const targetId = isGroup
            ? newMsg.conversation_id
            : newMsg.conversation_id.replace(currentUser?.id, "").replace(/^-|-$/g, "");

          // Show floating banner if message is from someone else
          if (newMsg.sender_id !== currentUser?.id) {
            triggerNotification({
              ...newMsg,
              targetId,
              isGroup,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, queryClient]);

  const triggerNotification = (notifData) => {
    setNotification(notifData);
    Animated.sequence([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 12,
        stiffness: 150,
      }),
      Animated.delay(4000),
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setNotification(null));
  };

  const closeNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  };

  const toggleFriendSelect = (id) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedFriends((prev) => [...prev, id]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;
    createGroupMutation.mutate(
      { groupName: groupName.trim(), memberIds: selectedFriends },
      {
        onSuccess: () => {
          setCreateGroupModalVisible(false);
          setGroupName("");
          setSelectedFriends([]);
        },
      }
    );
  };

  const renderItem = ({ item }) => {
    const latestMsg = latestMessages[item.id];
    const senderName = latestMsg ? chats.find(u => u.id === latestMsg.sender_id)?.full_name : null;

    return (
      <ChatItem
        item={item}
        latestMsg={latestMsg}
        currentUserId={currentUser?.id}
        senderName={senderName}
        onPress={() =>
          navigation.navigate("MessageDetail", {
            conversationId: item.id,
            chatName: item.full_name || item.username,
            avatar: item.avatar_url,
            isGroup: item.isGroup,
          })
        }
      />
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ZaloHeader
        rightIcons={[
          {
            component: (
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={22}
                color={colors?.iconAction || '#374151'}
              />
            ),
          },
          {
            component: (
              <Ionicons
                name="add-circle-outline"
                size={26}
                color={colors?.iconAction || '#374151'}
              />
            ),
            onPress: () => setCreateGroupModalVisible(true),
          },
        ]}
      />

      {/* Animated Notification Banner */}
      {notification && (
        <Animated.View
          className="absolute top-[90px] left-4 right-4 z-50"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          <TouchableOpacity
            className="rounded-2xl p-3 flex-row items-center shadow-lg border border-black/5"
            style={{ backgroundColor: colors.bgCard }}
            activeOpacity={0.8}
            onPress={() => {
              closeNotification();
              const targetChat = chats.find((u) => u.id === notification.targetId);
              if (targetChat) {
                navigation.navigate("MessageDetail", {
                  conversationId: targetChat.id,
                  chatName: targetChat.full_name || targetChat.username,
                  avatar: targetChat.avatar_url,
                  isGroup: notification.isGroup,
                });
              }
            }}
          >
            {(() => {
              const senderUser = chats.find((u) => u.id === notification.sender_id);
              const targetChat = chats.find((u) => u.id === notification.targetId);

              const title = notification.isGroup
                ? `${senderUser?.full_name || senderUser?.username || "Ai đó"} trong ${targetChat?.full_name || targetChat?.username || "Nhóm"}`
                : senderUser?.full_name || senderUser?.username || "Tin nhắn mới";

              return (
                <>
                  <Avatar
                    url={notification.isGroup ? targetChat?.avatar_url : senderUser?.avatar_url}
                    name={notification.isGroup ? (targetChat?.full_name || targetChat?.username || "Group") : (senderUser?.full_name || senderUser?.username || "U")}
                    size={44}
                    rounded={!notification.isGroup}
                    className="mr-3"
                  />
                  <View className="flex-1">
                    <Text className="font-bold text-[15px] mb-0.5" style={{ color: colors.text }} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textSub }} numberOfLines={1}>
                      {notification.content}
                    </Text>
                  </View>
                </>
              );
            })()}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Filter chips */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {["Tất cả", "Chưa đọc", "Nhóm", "OA"].map((label, i) => (
            <TouchableOpacity
              key={label}
              className={`px-4 py-2 rounded-full shadow-sm`}
              style={i === 0 ? { backgroundColor: '#0068ff' } : { backgroundColor: colors.bgCard }}
              activeOpacity={0.7}
            >
              <Text style={{ color: i === 0 ? 'white' : colors.textSub, fontSize: 14, fontWeight: '500' }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 2, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors?.accent || '#0068ff'}
            colors={[colors?.accent || '#0068ff']}
          />
        }
      >
        <View className="rounded-3xl shadow-sm overflow-hidden py-1" style={{ backgroundColor: colors.bgCard }}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors?.accent || '#0068ff'}
              className="my-5"
            />
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              extraData={latestMessages}
              ItemSeparatorComponent={() => <View className="h-[1px] ml-[86px]" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Create Group Modal Component */}
      <CreateGroupModal
        visible={isCreateGroupModalVisible}
        onClose={() => setCreateGroupModalVisible(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        friendsList={friendsList}
        selectedFriends={selectedFriends}
        toggleFriendSelect={toggleFriendSelect}
        onSubmit={handleCreateGroup}
        isPending={createGroupMutation.isPending}
        colors={colors}
      />
    </View>
  );
}
