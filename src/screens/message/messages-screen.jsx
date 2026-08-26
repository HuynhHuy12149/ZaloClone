import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ZaloHeader from "@/base/components/ZaloHeader";
import Avatar from "@/base/components/Avatar";
import { useTheme } from "@/base/context/ThemeContext";
import {
  getAllProfiles,
  getLatestMessagesForUser,
  getUserGroups,
  createGroup,
} from "@/base/services/messageService";
import { useAuthStore } from "@/base/shared/store/authStore";
import { supabase } from "@/base/services/supabase";

const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestMessages, setLatestMessages] = useState({});
  const [isCreateGroupModalVisible, setCreateGroupModalVisible] =
    useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  // Notification State & Animation
  const [notification, setNotification] = useState(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;
      try {
        const [usersRes, messagesRes, groupsRes] = await Promise.all([
          getAllProfiles(),
          getLatestMessagesForUser(currentUser.id),
          getUserGroups(currentUser.id),
        ]);

        let filteredUsers =
          usersRes.data?.filter((u) => u.id !== currentUser.id) || [];
        setFriendsList(filteredUsers);

        const userGroups = groupsRes.data?.map((g) => g.groups).filter(Boolean) || [];
        const latestMsgs = {};

        if (messagesRes.data) {
          messagesRes.data.forEach((msg) => {
            const isGroup = msg.conversation_id.length === 36;
            const otherId = isGroup
              ? msg.conversation_id
              : msg.conversation_id.replace(currentUser.id, "").replace(/^-|-$/g, "");

            if (otherId && !latestMsgs[otherId]) {
              latestMsgs[otherId] = msg;
            }
          });
        }
        setLatestMessages(latestMsgs);

        const allChats = [
          ...filteredUsers.map((u) => ({ ...u, isGroup: false })),
          ...userGroups.map((g) => ({
            ...g,
            isGroup: true,
            id: g.id,
            full_name: g.name,
            avatar_url: g.avatar_url || null,
          })),
        ];

        allChats.sort((a, b) => {
          const timeA = latestMsgs[a.id]?.created_at || "1970-01-01";
          const timeB = latestMsgs[b.id]?.created_at || "1970-01-01";
          return new Date(timeB) - new Date(timeA);
        });

        setUsers(allChats);
      } catch (error) {
        console.error("Error fetching message list data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for Realtime Changes in Messages
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          if (!newMsg) return;

          const isGroup = newMsg.conversation_id.length === 36;
          const targetId = isGroup
            ? newMsg.conversation_id
            : newMsg.conversation_id.replace(currentUser.id, "").replace(/^-|-$/g, "");

          setLatestMessages((prev) => ({
            ...prev,
            [targetId]: newMsg,
          }));

          setUsers((prevUsers) => {
            const targetChat = prevUsers.find((u) => u.id === targetId);
            if (!targetChat) return prevUsers;

            const remaining = prevUsers.filter((u) => u.id !== targetId);
            return [targetChat, ...remaining];
          });

          // Show floating banner if message is from someone else
          if (newMsg.sender_id !== currentUser.id) {
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
  }, [currentUser]);

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

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;
    try {
      const res = await createGroup(
        groupName,
        [...selectedFriends, currentUser.id],
        currentUser.id
      );
      if (res.data) {
        setUsers((prev) => [
          {
            id: res.data.id,
            full_name: res.data.name,
            avatar_url: res.data.avatar_url,
            isGroup: true,
          },
          ...prev,
        ]);
        setCreateGroupModalVisible(false);
        setGroupName("");
        setSelectedFriends([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => {
    const latestMsg = latestMessages[item.id];
    const isUnread =
      latestMsg &&
      !latestMsg.is_read &&
      latestMsg.sender_id !== currentUser?.id;

    return (
      <TouchableOpacity
        className="flex-row px-4 py-3.5 items-center bg-white dark:bg-zalo-darkCard"
        activeOpacity={0.65}
        onPress={() =>
          navigation.navigate("MessageDetail", {
            conversationId: item.id,
            chatName: item.full_name || item.username,
            avatar: item.avatar_url,
            isGroup: item.isGroup,
          })
        }
      >
        {/* Avatar */}
        <View className="relative mr-3.5">
          <Avatar
            url={item.avatar_url}
            name={item.full_name || item.username}
            size={56}
            rounded={false}
          />
          {/* Online dot */}
          <View className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zalo-darkCard" />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center flex-1 mr-2">
              <Text
                className={`text-base text-black dark:text-white flex-1 ${isUnread ? 'font-extrabold' : 'font-bold'}`}
                numberOfLines={1}
              >
                {item.full_name || item.username}
              </Text>
            </View>
            <Text
              className={`text-xs ${isUnread ? 'text-zalo-blue font-semibold' : 'text-gray-400'}`}
            >
              {latestMsg ? formatTime(latestMsg.created_at) : "-"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text
              className={`text-sm flex-1 mr-2 ${isUnread ? 'text-black dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
              numberOfLines={1}
            >
              {latestMsg
                ? latestMsg.sender_id === currentUser?.id
                  ? `Bạn: ${latestMsg.content} ${latestMsg.is_read ? '· Đã xem' : ''}`
                  : `${users.find(u => u.id === latestMsg.sender_id)?.full_name || item.full_name || item.username || 'Ai đó'}: ${latestMsg.content}`
                : "Chưa có tin nhắn..."}
            </Text>
            {isUnread && <View className="w-2.5 h-2.5 rounded-full bg-red-500" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f2f2f7] dark:bg-black">
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
            className="bg-white dark:bg-zalo-darkCard rounded-2xl p-3 flex-row items-center shadow-lg border border-black/5"
            activeOpacity={0.8}
            onPress={() => {
              closeNotification();
              const targetChat = users.find((u) => u.id === notification.targetId);
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
              const senderUser = users.find((u) => u.id === notification.sender_id);
              const targetChat = users.find((u) => u.id === notification.targetId);

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
                    <Text className="text-black dark:text-white font-bold text-[15px] mb-0.5" numberOfLines={1}>
                      {title}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>
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
              className={`px-4 py-2 rounded-full shadow-sm ${
                i === 0 ? 'bg-zalo-blue' : 'bg-white dark:bg-zalo-darkCard'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  i === 0 ? 'text-white font-semibold' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 2, paddingBottom: 110 }}
      >
        <View className="bg-white dark:bg-zalo-darkCard rounded-3xl shadow-sm overflow-hidden py-1">
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors?.accent || '#0068ff'}
              className="my-5"
            />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              extraData={latestMessages}
              ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-[86px]" />}
            />
          )}
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      {isCreateGroupModalVisible && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="w-[85%] bg-white dark:bg-zalo-darkCard rounded-2xl p-5 max-h-[80%]">
            <Text className="text-lg font-bold text-black dark:text-white mb-3">Tạo nhóm mới</Text>
            <TextInput
              className="bg-gray-200 dark:bg-zalo-darkInput rounded-lg px-3 py-2.5 text-black dark:text-white mb-4"
              placeholder="Tên nhóm..."
              placeholderTextColor={colors?.textMuted || '#9ca3af'}
              value={groupName}
              onChangeText={setGroupName}
            />
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Chọn thành viên:</Text>
            <ScrollView className="max-h-[300px] mb-4">
              {friendsList.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  className="flex-row items-center py-2"
                  onPress={() => toggleFriendSelect(f.id)}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedFriends.includes(f.id)
                        ? "checkbox-marked-circle"
                        : "checkbox-blank-circle-outline"
                    }
                    size={24}
                    color={
                      selectedFriends.includes(f.id)
                        ? (colors?.accent || '#0068ff')
                        : (colors?.border || '#e5e7eb')
                    }
                  />
                  <Avatar
                    url={f.avatar_url}
                    name={f.full_name || f.username}
                    size={36}
                    className="mx-3"
                  />
                  <Text className="text-base text-black dark:text-white">{f.full_name || f.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zalo-darkInput"
                onPress={() => setCreateGroupModalVisible(false)}
              >
                <Text className="text-black dark:text-white font-semibold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-zalo-blue"
                onPress={handleCreateGroup}
              >
                <Text className="text-white font-semibold">Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
