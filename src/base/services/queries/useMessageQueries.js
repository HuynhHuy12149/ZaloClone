import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/base/services/supabase';
import { supabaseProxy } from '@/base/services/supabaseProxy';
import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';

// ==========================================
// 1. RAW SUPABASE FETCH FUNCTIONS
// ==========================================

export const getAllProfilesApi = async () => {
  return await supabaseProxy(
    supabase.from(ServerEndpoint.PROFILES).select('*')
  );
};

export const getMessagesApi = async (conversationId, page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return await supabaseProxy(
    supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (id, full_name, avatar_url, username)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(from, to)
  );
};

export const sendMessageApi = async (conversationId, senderId, content) => {
  return await supabaseProxy(
    supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
        },
      ])
      .select(`
        *,
        sender:sender_id (id, full_name, avatar_url, username)
      `)
      .single()
  );
};

export const markMessagesAsReadApi = async (conversationId, userId) => {
  return await supabaseProxy(
    supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)
  );
};

export const getLatestMessagesForUserApi = async (userId) => {
  const { data: userGroups } = await supabaseProxy(
    supabase.from('group_members').select('group_id').eq('user_id', userId)
  );

  const groupIds = userGroups?.map((g) => g.group_id) || [];

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (id, full_name, avatar_url, username)
    `)
    .order('created_at', { ascending: false });

  if (groupIds.length > 0) {
    query = query.or(
      `conversation_id.ilike.%${userId}%,conversation_id.in.(${groupIds.join(',')})`
    );
  } else {
    query = query.ilike('conversation_id', `%${userId}%`);
  }

  return await supabaseProxy(query);
};

export const getUserGroupsApi = async (userId) => {
  return await supabaseProxy(
    supabase
      .from('group_members')
      .select('group_id, groups(id, name, created_by, created_at)')
      .eq('user_id', userId)
  );
};

export const createGroupApi = async (name, memberIds, createdBy) => {
  const { data: group, error: groupError } = await supabaseProxy(
    supabase
      .from('groups')
      .insert([{ name, created_by: createdBy }])
      .select()
      .single()
  );

  if (groupError || !group) return { data: null, error: groupError, success: false };

  const membersData = memberIds.map((userId) => ({
    group_id: group.id,
    user_id: userId,
  }));

  const { error: membersError } = await supabaseProxy(
    supabase.from('group_members').insert(membersData)
  );

  if (membersError) return { data: null, error: membersError, success: false };

  return { data: group, error: null, success: true };
};

export const addMemberToGroupApi = async (groupId, userId) => {
  return await supabaseProxy(
    supabase.from('group_members').insert([{ group_id: groupId, user_id: userId }])
  );
};

export const getGroupMembersApi = async (groupId) => {
  return await supabaseProxy(
    supabase
      .from('group_members')
      .select('user_id, profiles(id, full_name, avatar_url, username)')
      .eq('group_id', groupId)
  );
};

// ==========================================
// 2. TANSTACK QUERY HOOKS & MUTATIONS
// ==========================================

export const MESSAGE_KEYS = {
  conversations: (userId) => ['conversations', userId],
  messages: (roomId) => ['messages', roomId],
  profiles: ['profiles'],
};

// Hook lấy danh sách tất cả profiles
export const useProfilesQuery = (currentUserId) => {
  return useQuery({
    queryKey: MESSAGE_KEYS.profiles,
    queryFn: async () => {
      const res = await getAllProfilesApi();
      const all = res.data || [];
      return currentUserId ? all.filter((u) => u.id !== currentUserId) : all;
    },
  });
};

// Hook lấy danh sách hội thoại cho màn hình Messages
export const useConversationsQuery = (currentUserId) => {
  return useQuery({
    queryKey: MESSAGE_KEYS.conversations(currentUserId),
    queryFn: async () => {
      if (!currentUserId) return { chats: [], users: [], latestMessages: {} };

      const [usersRes, messagesRes, groupsRes] = await Promise.all([
        getAllProfilesApi(),
        getLatestMessagesForUserApi(currentUserId),
        getUserGroupsApi(currentUserId),
      ]);

      const filteredUsers = usersRes.data?.filter((u) => u.id !== currentUserId) || [];
      const userGroups = groupsRes.data?.map((g) => g.groups).filter(Boolean) || [];
      const latestMsgs = {};

      if (messagesRes.data) {
        messagesRes.data.forEach((msg) => {
          const isGroup = msg.conversation_id.length === 36;
          const otherId = isGroup
            ? msg.conversation_id
            : msg.conversation_id.replace(currentUserId, '').replace(/^-|-$/g, '');

          if (otherId && !latestMsgs[otherId]) {
            latestMsgs[otherId] = msg;
          }
        });
      }

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
        const timeA = latestMsgs[a.id]?.created_at || '1970-01-01';
        const timeB = latestMsgs[b.id]?.created_at || '1970-01-01';
        return new Date(timeB) - new Date(timeA);
      });

      return {
        chats: allChats,
        friendsList: filteredUsers,
        latestMessages: latestMsgs,
      };
    },
    enabled: !!currentUserId,
  });
};

// Hook lấy tin nhắn trong phòng chat chi tiết
export const useMessagesQuery = (chatRoomId, page = 1, limit = 20) => {
  return useQuery({
    queryKey: MESSAGE_KEYS.messages(chatRoomId),
    queryFn: async () => {
      const res = await getMessagesApi(chatRoomId, page, limit);
      return res.data || [];
    },
    enabled: !!chatRoomId,
  });
};

// Mutation gửi tin nhắn (Optimistic update)
export const useSendMessageMutation = (chatRoomId, currentUserId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content }) => sendMessageApi(chatRoomId, currentUserId, content),
    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({ queryKey: MESSAGE_KEYS.messages(chatRoomId) });
      const previousMessages = queryClient.getQueryData(MESSAGE_KEYS.messages(chatRoomId));

      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        conversation_id: chatRoomId,
        sender_id: currentUserId,
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(MESSAGE_KEYS.messages(chatRoomId), (old = []) => [
        optimisticMsg,
        ...old,
      ]);

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(MESSAGE_KEYS.messages(chatRoomId), context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.messages(chatRoomId) });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Mutation tạo nhóm chat
export const useCreateGroupMutation = (currentUserId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupName, memberIds }) =>
      createGroupApi(groupName, [...memberIds, currentUserId], currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.conversations(currentUserId) });
    },
  });
};

// Mutation thêm thành viên vào nhóm
export const useAddMemberToGroupMutation = (chatRoomId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }) => addMemberToGroupApi(chatRoomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Mutation đánh dấu tin nhắn đã đọc
export const useMarkMessagesAsReadMutation = () => {
  return useMutation({
    mutationFn: ({ conversationId, userId }) => markMessagesAsReadApi(conversationId, userId),
  });
};
