import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Keyboard, Image, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPost } from '../../services/postService';
import { useTheme } from '../../utils/ThemeContext';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = styles(colors);

  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const sub1 = Keyboard.addListener(showEvent, (e) => {
      if (Platform.OS === 'ios') {
        setKbHeight(e.endCoordinates.height);
      }
    });
    const sub2 = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === 'ios') {
        setKbHeight(0);
      }
    });
    
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bài viết');
      return;
    }
    setLoading(true);
    const response = await createPost(content);
    setLoading(false);
    if (response.success) {
      setContent('');
      Keyboard.dismiss();
      // Modal tự dismiss, quay về màn hình trước (Nhật ký)
      navigation.goBack();
    } else {
      Alert.alert('Lỗi', response.message || 'Đăng bài thất bại');
    }
  };

  const canPost = content.trim().length > 0;

  const TOOLBAR_BTNS = [
    { icon: 'emoticon-outline', lib: 'mci', color: colors.postAction },
    { icon: 'image-outline', lib: 'ion', color: colors.icon },
    { icon: 'play-circle-outline', lib: 'ion', color: colors.postAction },
    { icon: 'link-outline', lib: 'ion', color: colors.postAction },
    { icon: 'camera-outline', lib: 'ion', color: colors.postAction },
  ];

  const MEDIA_OPTS = [
    { icon: 'image-outline', lib: 'ion', color: '#4caf50', label: 'Album' },
    { icon: 'music-note', lib: 'mci', color: '#a855f7', label: 'Nhạc' },
    { icon: 'person-add-outline', lib: 'ion', color: '#f59e0b', label: 'Với bạn bè' },
    { icon: 'location-outline', lib: 'ion', color: '#ef4444', label: 'Vị trí' },
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={s.audienceBtn}>
            <FontAwesome5 name="users" size={11} color={colors.textSub} />
            <Text style={s.audienceText}>Bạn bè Zalo</Text>
            <Entypo name="chevron-small-down" size={16} color={colors.textSub} />
          </TouchableOpacity>
        </View>

        <View style={s.headerRight}>
          <TouchableOpacity style={s.styleBtnBg}>
            <Text style={s.styleBtnText}>Aa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="push-outline" size={22} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.postBtn, canPost && s.postBtnActive]}
            onPress={handlePost}
            disabled={loading || !canPost}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={[s.postBtnText, canPost && s.postBtnTextActive]}>Đăng</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={{ flex: 1, paddingBottom: kbHeight }}>
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Author row */}
            <View style={s.authorRow}>
              <Image source={{ uri: 'https://i.pravatar.cc/100?u=me' }} style={s.authorAvatar} />
              <View>
                <Text style={s.authorName}>Huynh Huy</Text>
                <TouchableOpacity style={s.privacyBtn}>
                  <Ionicons name="people-outline" size={12} color={colors.icon} />
                  <Text style={s.privacyText}>Bạn bè</Text>
                  <Ionicons name="chevron-down" size={11} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Text input */}
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Bạn đang nghĩ gì?"
              placeholderTextColor={colors.textPlaceholder}
              multiline
              autoFocus
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />

          </ScrollView>
        </Pressable>

        {/* Media option chips (Fixed at bottom) */}
        <View style={s.mediaScrollWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.mediaRow}>
            {MEDIA_OPTS.map((opt) => (
              <TouchableOpacity key={opt.label} style={s.mediaChip}>
                {opt.lib === 'mci'
                  ? <MaterialCommunityIcons name={opt.icon} size={18} color={opt.color} />
                  : <Ionicons name={opt.icon} size={18} color={opt.color} />
                }
                <Text style={[s.mediaChipText, { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Bottom toolbar ── */}
        <View style={[s.toolbar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {TOOLBAR_BTNS.map((btn, i) => (
            <TouchableOpacity key={i} style={s.toolbarBtn} hitSlop={6}>
              {btn.lib === 'mci'
                ? <MaterialCommunityIcons name={btn.icon} size={26} color={btn.color} />
                : <Ionicons name={btn.icon} size={26} color={btn.color} />
              }
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={s.overlay}>
          <View style={s.overlayCard}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[s.overlayText, { color: colors.text }]}>Đang đăng bài...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bgCard },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
    backgroundColor: c.bgCard,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: { padding: 4 },
  audienceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: c.bgInput,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  audienceText: { fontSize: 13, color: c.text, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  styleBtnBg: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: c.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  styleBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  iconBtn: { padding: 5 },
  postBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: c.bgInput,
    minWidth: 60, alignItems: 'center',
  },
  postBtnActive: { backgroundColor: c.accent },
  postBtnText: { fontSize: 14, fontWeight: '700', color: c.textSub },
  postBtnTextActive: { color: '#fff' },

  // Scroll body
  scrollContent: { padding: 16, paddingBottom: 24, flexGrow: 1 },

  // Author
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  authorAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.bgInput },
  authorName: { fontSize: 15, fontWeight: '700', color: c.text },
  privacyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 5, backgroundColor: c.accentLight,
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 12,
  },
  privacyText: { fontSize: 11, color: c.icon, fontWeight: '600' },

  // Input
  input: {
    fontSize: 17, color: c.text, lineHeight: 26,
    minHeight: 120, textAlignVertical: 'top',
  },

  // Media chips
  mediaScrollWrap: {
    backgroundColor: c.bgCard,
  },
  mediaRow: {
    paddingHorizontal: 16, paddingVertical: 10,
  },
  mediaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5, borderColor: c.border,
    backgroundColor: c.bg,
    marginRight: 10,
  },
  mediaChipText: { fontSize: 13, fontWeight: '500' },

  // Bottom toolbar
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 0.5, borderTopColor: c.border,
    backgroundColor: c.bgCard,
  },
  toolbarBtn: { padding: 8 },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: c.bgCard,
    borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 12,
  },
  overlayText: { fontSize: 14, fontWeight: '500' },
});
