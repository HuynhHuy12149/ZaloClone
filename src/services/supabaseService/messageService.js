import { supabase } from '../../libs/supabase';
import { supabaseProxy } from '../config/Proxy';
import { ServerEndpoint } from '../../constants/ServerEndpoint';


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
  return await supabaseProxy(
    supabase
      .from('messages')
      .select('*')
      .ilike('conversation_id', `%${userId}%`)
      .order('created_at', { ascending: false })
      .limit(500)
  );
};
