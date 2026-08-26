import { supabase } from './supabase';
import { supabaseProxy } from './supabaseProxy';
import { ServerEndpoint } from '@/base/shared/enums/serverEndpoint';


export const getAllProfiles = async () => {
  return await supabaseProxy(
    supabase.from(ServerEndpoint.PROFILES).select('*')
  );
};

// Fetch messages for a specific conversation
export const getMessages = async (conversationId, page = 1, limit = 15) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return await supabaseProxy(
    supabase
      .from('messages') // Assuming 'messages' table exists
      .select('*, sender:profiles(id, username, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(from, to)
  );
};

// Send a new message
export const sendMessage = async (conversationId, senderId, content) => {
  return await supabaseProxy(
    supabase
      .from('messages')
      .insert([
        { conversation_id: conversationId, sender_id: senderId, content }
      ])
      .select('*, sender:profiles(id, username, avatar_url)')
      .single()
  );
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  return await supabaseProxy(
    supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
  );
};

// Fetch latest messages for all conversations of a user
export const getLatestMessagesForUser = async (userId) => {
  // First get all groups the user belongs to
  const { data: userGroups } = await supabaseProxy(
    supabase.from('group_members').select('group_id').eq('user_id', userId)
  );

  const groupIds = userGroups ? userGroups.map(g => g.group_id) : [];

  let query = supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (groupIds.length > 0) {
    query = query.or(`conversation_id.ilike.%${userId}%,conversation_id.in.(${groupIds.join(',')})`);
  } else {
    query = query.ilike('conversation_id', `%${userId}%`);
  }

  return await supabaseProxy(query);
};

// Groups
export const createGroup = async (name, createdBy, memberIds) => {
  const { data: group, error: groupError } = await supabaseProxy(
    supabase.from('groups').insert([{ name, created_by: createdBy }]).select().single()
  );

  if (groupError || !group) throw groupError;

  const members = [
    { group_id: group.id, user_id: createdBy },
    ...memberIds.map(id => ({ group_id: group.id, user_id: id }))
  ];

  const { error: membersError } = await supabaseProxy(
    supabase.from('group_members').insert(members)
  );

  if (membersError) throw membersError;

  return group;
};

export const addMemberToGroup = async (groupId, userId) => {
  return await supabaseProxy(
    supabase.from('group_members').insert([{ group_id: groupId, user_id: userId }])
  );
};

export const getUserGroups = async (userId) => {
  return await supabaseProxy(
    supabase.from('group_members').select('group_id, groups(*)').eq('user_id', userId)
  );
};
