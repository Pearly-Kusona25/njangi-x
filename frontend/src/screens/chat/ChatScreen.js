import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db, supabase } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatTime } from '../../utils/helpers';

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  const { groupId, groupName } = route.params || {};
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`messages:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupId]);

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await db.getMessages(groupId);
    if (!error) setMessages(data || []);
    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    setSending(true);
    await db.sendMessage({
      group_id: groupId,
      user_id: profile.id,
      content: trimmed,
      created_at: new Date().toISOString(),
    });
    setSending(false);
  };

  const isMe = (msg) => msg.user_id === profile?.id;

  const renderMessage = ({ item, index }) => {
    const mine = isMe(item);
    const prevMsg = messages[index - 1];
    const showAvatar = !mine && (!prevMsg || prevMsg.user_id !== item.user_id);
    const showName = !mine && showAvatar;

    return (
      <View style={[styles.msgRow, mine && styles.msgRowMe]}>
        {!mine && (
          <View style={styles.avatarSpace}>
            {showAvatar ? (
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>
                  {(item.users?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.msgContent}>
          {showName && (
            <Text style={styles.msgSender}>{item.users?.name}</Text>
          )}
          <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, mine && styles.bubbleTextMe]}>
              {item.content}
            </Text>
          </View>
          <Text style={[styles.msgTime, mine && styles.msgTimeMe]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={18} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{groupName}</Text>
            <Text style={styles.headerOnline}>Group Chat • Active</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <Ionicons name="chatbubbles-outline" size={40} color={COLORS.gray300} />
              </View>
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSub}>Start the conversation!</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray400}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
        >
          <LinearGradient
            colors={text.trim() ? [COLORS.primary, COLORS.primaryDark] : [COLORS.gray300, COLORS.gray300]}
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
  },
  headerOnline: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  infoBtn: { padding: SPACING.xs },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msgList: { padding: SPACING.md, gap: SPACING.xs, paddingBottom: SPACING.lg },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, marginBottom: SPACING.xs },
  msgRowMe: { flexDirection: 'row-reverse' },
  avatarSpace: { width: 36 },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  msgContent: { maxWidth: '72%' },
  msgSender: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginBottom: 2,
    marginLeft: SPACING.sm,
  },
  bubble: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  bubbleText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
    lineHeight: 22,
  },
  bubbleTextMe: { color: COLORS.white },
  msgTime: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    marginTop: 4,
    marginLeft: SPACING.sm,
  },
  msgTimeMe: { textAlign: 'right', marginRight: SPACING.sm },
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyChatText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  emptyChatSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 120,
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
