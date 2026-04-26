import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ZaloHeader from "../../../components/ZaloHeader";
import { useTheme } from "../../../utils/ThemeContext";
import {
  getAllProfiles,
  getLatestMessagesForUser,
  getUserGroups,
  createGroup,
} from "../../../services/supabaseService/messageService";
import { useAuthStore } from "../../../store/authStore";
import { supabase } from "../../../libs/supabase";

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
  const s = styles(colors);
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
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name)}&background=random`,
          })),
        ];

        allChats.sort((a, b) => {
          const timeA = latestMsgs[a.id]
            ? new Date(latestMsgs[a.id].created_at).getTime()
            : 0;
          const timeB = latestMsgs[b.id]
            ? new Date(latestMsgs[b.id].created_at).getTime()
            : 0;
          return timeB - timeA;
        });

        setUsers(allChats);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const subscription = supabase
      .channel("messages_list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          const isGroup = newMsg.conversation_id.length === 36;

          let targetId = null;
          if (isGroup) {
            targetId = newMsg.conversation_id;
          } else if (newMsg.conversation_id.includes(currentUser.id)) {
            targetId = newMsg.conversation_id.replace(currentUser.id, "").replace(/^-|-$/g, "");
          }

          if (targetId) {
            // Show notification if it's from someone else
            if (newMsg.sender_id !== currentUser.id) {
              setNotification({ ...newMsg, targetId, isGroup });
            }

            setLatestMessages((prev) => ({
              ...prev,
              [targetId]: newMsg,
            }));

            setUsers((prevUsers) => {
              const userIndex = prevUsers.findIndex((u) => u.id === targetId);
              if (userIndex >= 0) {
                const user = prevUsers[userIndex];
                const newUsers = [...prevUsers];
                newUsers.splice(userIndex, 1);
                newUsers.unshift({ ...user }); // Force new reference
                return newUsers;
              } else if (isGroup) {
                // If it's a new group we don't know about, fetch its details
                supabase
                  .from("groups")
                  .select("*")
                  .eq("id", targetId)
                  .single()
                  .then(({ data }) => {
                    if (data) {
                      setUsers((curr) => [
                        {
                          ...data,
                          isGroup: true,
                          id: data.id,
                          full_name: data.name,
                          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
                        },
                        ...curr,
                      ]);
                    }
                  });
              } else if (!isGroup) {
                // Fetch the new user's profile
                supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", targetId)
                  .single()
                  .then(({ data }) => {
                    if (data) {
                      setUsers((curr) => [
                        {
                          ...data,
                          isGroup: false,
                        },
                        ...curr,
                      ]);
                    }
                  });
              }
              return prevUsers;
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updatedMsg = payload.new;
          const isGroup = updatedMsg.conversation_id.length === 36;
          let targetId = null;
          if (isGroup) {
            targetId = updatedMsg.conversation_id;
          } else if (updatedMsg.conversation_id.includes(currentUser.id)) {
            targetId = updatedMsg.conversation_id.replace(currentUser.id, "").replace(/^-|-$/g, "");
          }

          if (targetId) {
            setLatestMessages((prev) => {
              // Only update if this is the latest message
              if (prev[targetId]?.id === updatedMsg.id) {
                return {
                  ...prev,
                  [targetId]: updatedMsg,
                };
              }
              return prev;
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  // Handle Notification Animation
  useEffect(() => {
    if (notification) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();

      const timer = setTimeout(() => {
        closeNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const closeNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;
    try {
      const newGroup = await createGroup(
        groupName,
        currentUser.id,
        selectedFriends,
      );
      setCreateGroupModalVisible(false);
      setGroupName("");
      setSelectedFriends([]);
      // Reload or append to list locally
      setUsers((prev) => [
        {
          ...newGroup,
          isGroup: true,
          id: newGroup.id,
          full_name: newGroup.name,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(newGroup.name)}&background=random`,
        },
        ...prev,
      ]);
    } catch (e) {
      console.error(e);
      alert("Tạo nhóm thất bại");
    }
  };

  const toggleFriendSelect = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const renderItem = ({ item }) => {
    const latestMsg = latestMessages[item.id];
    const isUnread =
      latestMsg &&
      !latestMsg.is_read &&
      latestMsg.sender_id !== currentUser?.id;

    return (
      <TouchableOpacity
        style={s.chatRow}
        activeOpacity={0.65}
        onPress={() =>
          navigation.navigate("MessageDetail", {
            conversationId: item.isGroup ? item.id : item.id, // for group it's group_id
            chatName: item.full_name || item.username,
            avatar: item.avatar_url,
            isGroup: item.isGroup, // pass isGroup to detail screen
          })
        }
      >
        {/* Avatar */}
        <View style={s.avatarContainer}>
          <Image
            source={{
              uri:
                item.avatar_url ||
                `https://ui-avatars.com/api/?name=${item.full_name || item.username}&background=random`,
            }}
            style={s.avatar}
          />
          {/* Online dot */}
          <View style={s.onlineDot} />
        </View>

        {/* Content */}
        <View style={s.chatContent}>
          <View style={s.chatTop}>
            <View style={s.nameRow}>
              <Text
                style={[s.chatName, isUnread && { fontWeight: "800" }]}
                numberOfLines={1}
              >
                {item.full_name || item.username}
              </Text>
            </View>
            <Text
              style={[
                s.chatTime,
                isUnread && { color: colors.accent, fontWeight: "600" },
              ]}
            >
              {latestMsg ? formatTime(latestMsg.created_at) : "-"}
            </Text>
          </View>
          <View style={s.chatBottom}>
            <Text
              style={[
                s.chatMsg,
                isUnread && { color: colors.text, fontWeight: "600" },
              ]}
              numberOfLines={1}
            >
              {latestMsg
                ? latestMsg.sender_id === currentUser?.id
                  ? `Bạn: ${latestMsg.content} ${latestMsg.is_read ? '· Đã xem' : ''}`
                  : `${users.find(u => u.id === latestMsg.sender_id)?.full_name || item.full_name || item.username || 'Ai đó'}: ${latestMsg.content}`
                : "Chưa có tin nhắn..."}
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
          {
            component: (
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={22}
                color={colors.iconAction}
              />
            ),
          },
          {
            component: (
              <Ionicons
                name="add-circle-outline"
                size={26}
                color={colors.iconAction}
              />
            ),
            onPress: () => setCreateGroupModalVisible(true),
          },
        ]}
      />

      {/* Animated Notification Banner */}
      {notification && (
        <Animated.View
          style={[
            s.notificationBanner,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={s.notificationContent}
            activeOpacity={0.8}
            onPress={() => {
              closeNotification();
              const targetChat = users.find((u) => u.id === notification.targetId);
              if (targetChat) {
                navigation.navigate("MessageDetail", {
                  conversationId: targetChat.id,
                  chatName: targetChat.full_name || targetChat.username,
                  avatar:
                    targetChat.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(targetChat.full_name || targetChat.username)}&background=random`,
                  isGroup: notification.isGroup,
                });
              }
            }}
          >
            {(() => {
              const senderUser = users.find(
                (u) => u.id === notification.sender_id,
              );
              const targetChat = users.find(
                (u) => u.id === notification.targetId,
              );

              const avatarUrl = notification.isGroup
                ? targetChat?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(targetChat?.full_name || targetChat?.username || "Group")}&background=random`
                : senderUser?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(senderUser?.full_name || senderUser?.username || "U")}&background=random`;

              const title = notification.isGroup
                ? `${senderUser?.full_name || senderUser?.username || "Ai đó"} trong ${targetChat?.full_name || targetChat?.username || "Nhóm"}`
                : senderUser?.full_name || senderUser?.username || "Tin nhắn mới";

              return (
                <>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={s.notificationAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.notificationTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={s.notificationText} numberOfLines={1}>
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
      <View style={s.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterScroll}
        >
          {["Tất cả", "Chưa đọc", "Nhóm", "OA"].map((label, i) => (
            <TouchableOpacity
              key={label}
              style={[s.chip, i === 0 && { backgroundColor: colors.accent }]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.chipText,
                  i === 0 && { color: "#fff", fontWeight: "600" },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
      >
        <View style={s.listWrapper}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.accent}
              style={{ marginVertical: 20 }}
            />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              extraData={latestMessages}
              ItemSeparatorComponent={() => <View style={s.separator} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      {isCreateGroupModalVisible && (
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <Text style={s.modalTitle}>Tạo nhóm mới</Text>
            <TextInput
              style={s.groupNameInput}
              placeholder="Tên nhóm..."
              placeholderTextColor={colors.textMuted}
              value={groupName}
              onChangeText={setGroupName}
            />
            <Text style={s.modalSubTitle}>Chọn thành viên:</Text>
            <ScrollView style={s.friendsList}>
              {friendsList.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={s.friendRow}
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
                        ? colors.accent
                        : colors.border
                    }
                  />
                  <Image
                    source={{
                      uri:
                        f.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(f.full_name || f.username)}&background=random`,
                    }}
                    style={s.friendAvatar}
                  />
                  <Text style={s.friendName}>{f.full_name || f.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalBtnClose}
                onPress={() => setCreateGroupModalVisible(false)}
              >
                <Text style={s.modalBtnTextClose}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalBtnCreate}
                onPress={handleCreateGroup}
              >
                <Text style={s.modalBtnTextCreate}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    notificationBanner: {
      position: "absolute",
      top: 90,
      left: 16,
      right: 16,
      zIndex: 1000,
    },
    notificationContent: {
      backgroundColor: c.bgCard,
      borderRadius: 20,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 1,
      borderColor: c.border + "30",
    },
    notificationAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    notificationTitle: {
      color: c.text,
      fontWeight: "700",
      fontSize: 15,
      marginBottom: 2,
    },
    notificationText: {
      color: c.textSub,
      fontSize: 14,
    },
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 0,
    },
    chipText: { fontSize: 14, fontWeight: "500", color: c.textSub },

    listContent: {
      paddingHorizontal: 16,
      marginTop: 2,
      paddingBottom: 110,
    },
    listWrapper: {
      backgroundColor: c.bgCard,
      borderRadius: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
      elevation: 0,
      overflow: "hidden",
      paddingVertical: 4,
    },
    chatRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: c.bgCard,
    },
    avatarContainer: { position: "relative", marginRight: 14 },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.bgInput,
    },
    onlineDot: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: c.online,
      borderWidth: 2.5,
      borderColor: c.bgCard,
    },
    chatContent: {
      flex: 1,
    },
    chatTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    chatName: { fontSize: 16, fontWeight: "700", color: c.text, flex: 1 },
    chatTime: { fontSize: 12, color: c.textMuted },
    chatBottom: { flexDirection: "row", alignItems: "center" },
    chatMsg: { fontSize: 14, color: c.textSub, flex: 1, marginRight: 8 },
    badge: {
      backgroundColor: c.badge,
      borderRadius: 12,
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.badge,
    },
    separator: { height: 1, backgroundColor: c.border + "50", marginLeft: 86 },

    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    modalContainer: {
      width: "85%",
      backgroundColor: c.bgCard,
      borderRadius: 16,
      padding: 20,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
      marginBottom: 12,
    },
    groupNameInput: {
      backgroundColor: c.bgInput,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: c.text,
      marginBottom: 16,
    },
    modalSubTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: c.textSub,
      marginBottom: 8,
    },
    friendsList: { flexGrow: 0, maxHeight: 300, marginBottom: 16 },
    friendRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    friendAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginHorizontal: 12,
    },
    friendName: { fontSize: 16, color: c.text },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
    modalBtnClose: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: c.bgInput,
    },
    modalBtnTextClose: { color: c.text, fontWeight: "600" },
    modalBtnCreate: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: c.accent,
    },
    modalBtnTextCreate: { color: "#fff", fontWeight: "600" },
  });
