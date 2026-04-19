import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database helpers
export const db = {
  // Users
  getUser: (userId) => supabase.from('users').select('*').eq('id', userId).single(),
  
  updateUser: (userId, data) => supabase.from('users').update(data).eq('id', userId),

  // Groups
  createGroup: (data) => supabase.from('groups').insert(data).select().single(),
  
  getGroups: (userId) => supabase
    .from('members')
    .select('*, groups(*)')
    .eq('user_id', userId),

  getGroupById: (groupId) => supabase
    .from('groups')
    .select('*, members(*, users(*))')
    .eq('id', groupId)
    .single(),

  getGroupByCode: (code) => supabase
    .from('groups')
    .select('*')
    .eq('invite_code', code)
    .single(),

  // Members
  joinGroup: (userId, groupId, position) => supabase
    .from('members')
    .insert({ user_id: userId, group_id: groupId, payout_position: position }),

  getGroupMembers: (groupId) => supabase
    .from('members')
    .select('*, users(*)')
    .eq('group_id', groupId)
    .order('payout_position'),

  // Contributions
  createContribution: (data) => supabase.from('contributions').insert(data).select().single(),
  
  getContributions: (userId, groupId) => supabase
    .from('contributions')
    .select('*')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false }),

  getAllContributions: (userId) => supabase
    .from('contributions')
    .select('*, groups(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }),

  updateContribution: (id, data) => supabase
    .from('contributions')
    .update(data)
    .eq('id', id),

  // Transactions
  createTransaction: (data) => supabase.from('transactions').insert(data).select().single(),
  logActivity: (data) => supabase.from('activity_logs').insert(data).select().single(),
  getActivityLogs: (limit = 25) => supabase
    .from('activity_logs')
    .select('*, users(id, name, role)')
    .order('created_at', { ascending: false })
    .limit(limit),
  
  getTransactions: (userId) => supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }),

  // Chat
  getMessages: (groupId) => supabase
    .from('messages')
    .select('*, users(name, avatar_url)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true }),

  sendMessage: (data) => supabase.from('messages').insert(data).select().single(),

  // Realtime subscription
  subscribeToMessages: (groupId, callback) => supabase
    .channel(`messages:${groupId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `group_id=eq.${groupId}`,
    }, callback)
    .subscribe(),
};
