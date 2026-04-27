import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, Platform, Keyboard, Image,
  ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createPost } from '../../../services/supabaseService/postService';
import { useTheme } from '../../../utils/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import { uploadImageToCloudinary } from '../../../utils/cloudinaryClient';
import { compressImage } from '../../../utils/imageUtils';
import LocationPickerModal from '../../../components/LocationPickerModal';
import PrivacyPickerSheet from '../../../components/PrivacyPickerSheet';
import MusicPickerModal from '../../../components/MusicPickerModal';
import FriendPickerModal from '../../../components/FriendPickerModal';
import { PostPrivacy, PrivacyLabels } from '../../../utils/postEnums';
import Avatar from '../../../components/Avatar';
import EmojiPickerModal from '../../../components/EmojiPickerModal';
import MenuControl from '../../../components/MenuControl';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [privacy, setPrivacy] = useState(PostPrivacy.FRIENDS);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedFontStyle, setSelectedFontStyle] = useState('normal'); 
  const [selectedColor, setSelectedColor] = useState(null); // Text color state
  const [isScheduled, setIsScheduled] = useState(false);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const soundRef = useRef(null);
  
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);
  const s = styles(colors);

  const locationSheetRef = useRef(null);
  const privacySheetRef = useRef(null);
  const musicSheetRef = useRef(null);
  const friendSheetRef = useRef(null);
  const emojiSheetRef = useRef(null);
  const fontBtnRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    // Cấu hình âm thanh cho iOS để phát được cả khi ở chế độ im lặng
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // Cho phép phát khi bật gạt rung im lặng
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Audio Setup Error:', e);
      }
    };
    setupAudio();

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKbHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKbHeight(0);
    });
    
    return () => {
      showSub.remove();
      hideSub.remove();
      stopMusic();
    };
  }, []);

  const stopMusic = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
      setIsMusicPlaying(false);
    }
  };

  const togglePlayMusic = async () => {
    if (!selectedMusic?.preview) return;
    try {
      if (isMusicPlaying) await stopMusic();
      else {
        const { sound } = await Audio.Sound.createAsync({ uri: selectedMusic.preview }, { shouldPlay: true });
        soundRef.current = sound;
        setIsMusicPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => { if (status.didJustFinish) setIsMusicPlaying(false); });
      }
    } catch (error) {}
  };

  const handleComingSoon = () => {
    Alert.alert('Tính năng đang phát triển', 'Chúng tôi sẽ sớm ra mắt tính năng này trong bản cập nhật tới!');
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
      if (!result.canceled && result.assets) {
        const remainingSlots = 6 - images.length;
        const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {}
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled && result.assets) setImages(prev => [...prev, result.assets[0].uri]);
    } catch (error) {}
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    Keyboard.dismiss();
    await stopMusic();
    setLoading(true);
    try {
      const uploadedUrls = [];
      if (images.length > 0) {
        const compressedImages = await Promise.all(images.map(uri => compressImage(uri)));
        const uploadPromises = compressedImages.map(uri => uploadImageToCloudinary(uri));
        uploadedUrls.push(...(await Promise.all(uploadPromises)));
      }
      const response = await createPost(content, uploadedUrls, selectedLocation, privacy, selectedMusic, taggedFriends, selectedFontStyle, selectedColor);
      if (response.success) navigation.goBack();
      else Alert.alert('Lỗi', response.message || 'Đăng bài thất bại');
    } catch (error) {
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji);
  };

  const FONT_STYLES = [
    { id: 'normal', label: 'Mặc định', icon: 'type', fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: 'normal', fontStyle: 'normal' },
    { id: 'bold', label: 'In đậm', icon: 'bold', fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: 'bold', fontStyle: 'normal' },
    { id: 'italic', label: 'In nghiêng', icon: 'italic', fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: 'normal', fontStyle: 'italic' },
    { id: 'serif', label: 'Có chân', icon: 'edit-2', fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontWeight: 'normal', fontStyle: 'normal' },
  ];

  const COLOR_OPTIONS = [
    { label: 'Đen', color: '#000000', icon: 'circle' },
    { label: 'Xanh Zalo', color: '#0084ff', icon: 'circle' },
    { label: 'Đỏ', color: '#ff4d4f', icon: 'circle' },
    { label: 'Xanh lá', color: '#52c41a', icon: 'circle' },
    { label: 'Cam', color: '#fa8c16', icon: 'circle' },
  ];

  const menuItems = [
    ...FONT_STYLES.map(style => ({
      label: style.label,
      icon: style.icon,
      active: selectedFontStyle === style.id,
      onPress: () => setSelectedFontStyle(style.id)
    })),
    { label: '--- Màu sắc ---', onPress: () => {}, color: '#999', autoClose: false },
    ...COLOR_OPTIONS.map(opt => ({
      label: opt.label,
      icon: opt.icon,
      color: opt.color,
      active: selectedColor === opt.color,
      onPress: () => setSelectedColor(opt.color === selectedColor ? null : opt.color)
    }))
  ];

  const canPost = content.trim().length > 0 || images.length > 0;

  const MEDIA_OPTS = [
    { icon: 'image-outline', lib: 'ion', color: '#4caf50', label: 'Album', onPress: () => { Keyboard.dismiss(); pickImages(); } },
    { icon: 'music-note', lib: 'mci', color: '#a855f7', label: 'Nhạc', onPress: () => { Keyboard.dismiss(); musicSheetRef.current?.present(); } },
    { icon: 'person-add-outline', lib: 'ion', color: '#f59e0b', label: 'Với bạn bè', onPress: () => { Keyboard.dismiss(); friendSheetRef.current?.present(); } },
    { icon: 'location-outline', lib: 'ion', color: '#ef4444', label: 'Vị trí', onPress: () => { Keyboard.dismiss(); locationSheetRef.current?.present(); } },
  ];

  const getBottomPadding = () => {
    if (kbHeight > 0) {
      return kbHeight - (Platform.OS === 'ios' ? insets.bottom : 0);
    }
    return Math.max(insets.bottom, 12);
  };

  const renderTaggedFriendsText = () => {
    if (taggedFriends.length === 0) return null;
    if (taggedFriends.length === 1) return <Text style={s.taggedFriendsText}> — cùng với <Text style={s.taggedFriendsBold}>{taggedFriends[0].full_name}</Text></Text>;
    return (
      <Text style={s.taggedFriendsText}> - với <Text style={s.taggedFriendsBold}>{taggedFriends[0].full_name}</Text> và <Text style={s.taggedFriendsBold}>{taggedFriends.length - 1} người khác</Text></Text>
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} hitSlop={8}><Ionicons name="close" size={26} color={colors.text} /></TouchableOpacity>
            <TouchableOpacity style={s.audienceBtn} onPress={() => privacySheetRef.current?.present()}>
              <FontAwesome5 name="users" size={11} color={colors.textSub} />
              <Text style={s.audienceText}>{PrivacyLabels[privacy]}</Text>
              <Entypo name="chevron-small-down" size={16} color={colors.textSub} />
            </TouchableOpacity>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity 
              ref={fontBtnRef}
              collapsable={false}
              style={[s.styleBtnBg, selectedFontStyle !== 'normal' && { backgroundColor: colors.accent }]} 
              onPress={() => setMenuVisible(true)}
            >
              <Text style={[s.styleBtnText, { color: '#fff' }]}>Aa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.postBtn, canPost && s.postBtnActive]} onPress={handlePost} disabled={loading || !canPost}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={[s.postBtnText, canPost && s.postBtnTextActive]}>Đăng</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={s.authorRow}>
            <Avatar url={user?.avatar_url} name={user?.full_name} size={46} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={s.authorName}>{user?.full_name || 'Người dùng Zalo'}</Text>
                {renderTaggedFriendsText()}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedLocation ? (
                  <View style={s.locationRow}>
                    <Text style={s.locationAtText}>tại </Text>
                    <Text style={[s.locationNameText, { color: colors.accent }]}>{selectedLocation.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedLocation(null)} hitSlop={5}><Ionicons name="close-circle" size={14} color={colors.textMuted} style={{ marginLeft: 4 }} /></TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={s.privacyBtn} onPress={() => privacySheetRef.current?.present()}>
                    <Ionicons name="people-outline" size={12} color={colors.icon} /><Text style={s.privacyText}>{PrivacyLabels[privacy]}</Text><Ionicons name="chevron-down" size={11} color={colors.icon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <TextInput
            style={[
              s.input, 
              { 
                fontFamily: FONT_STYLES.find(f => f.id === selectedFontStyle)?.fontFamily || 'System',
                fontWeight: FONT_STYLES.find(f => f.id === selectedFontStyle)?.fontWeight || 'normal',
                fontStyle: FONT_STYLES.find(f => f.id === selectedFontStyle)?.fontStyle || 'normal',
                color: selectedColor || colors.text,
              }
            ]}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={colors.textPlaceholder}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            editable={!loading}
          />

          {images.length > 0 && (
            <View style={s.imageGrid}>
              {images.map((uri, idx) => (
                <View key={idx} style={s.imageWrapper}>
                  <Image source={{ uri }} style={s.previewImage} />
                  <TouchableOpacity style={s.removeImageBtn} onPress={() => removeImage(idx)}><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {selectedMusic && (
            <View style={s.musicBarContainer}>
              <View style={[s.musicBar, { backgroundColor: colors.bgInput }]}>
                <View style={s.musicMain}>
                  <TouchableOpacity style={s.musicIconBox} onPress={togglePlayMusic} activeOpacity={0.8}>
                    <Image source={{ uri: selectedMusic.cover }} style={s.musicCover} />
                    <View style={s.musicOverlayIcon}><MaterialCommunityIcons name={isMusicPlaying ? "pause" : "play"} size={16} color="#fff" /></View>
                  </TouchableOpacity>
                  <View style={s.musicInfo}>
                    <Text style={[s.musicTitle, { color: colors.text }]} numberOfLines={1}>{selectedMusic.title}</Text>
                    <Text style={[s.musicArtist, { color: colors.textMuted }]} numberOfLines={1}>{selectedMusic.artist}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={async () => { await stopMusic(); setSelectedMusic(null); }} style={s.musicCloseBtn} hitSlop={10}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[s.bottomArea, { paddingBottom: getBottomPadding() }]}>
          <View style={s.mediaScrollWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.mediaRow} keyboardShouldPersistTaps="handled">
              {MEDIA_OPTS.map((opt) => (
                <TouchableOpacity key={opt.label} style={s.mediaChip} onPress={opt.onPress}>
                  {opt.lib === 'mci' ? <MaterialCommunityIcons name={opt.icon} size={18} color={opt.color} /> : <Ionicons name={opt.icon} size={18} color={opt.color} />}
                  <Text style={[s.mediaChipText, { color: opt.color }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.toolbar}>
            <TouchableOpacity 
              style={s.toolbarBtn} 
              onPress={() => emojiSheetRef.current?.present()}
            >
              <MaterialCommunityIcons name="emoticon-outline" size={26} color={colors.postAction} />
            </TouchableOpacity>
            <TouchableOpacity style={s.toolbarBtn} onPress={pickImages}><Ionicons name="image-outline" size={26} color={colors.icon} /></TouchableOpacity>
            <TouchableOpacity style={s.toolbarBtn} onPress={() => musicSheetRef.current?.present()}><Ionicons name="play-circle-outline" size={26} color={colors.postAction} /></TouchableOpacity>
            <TouchableOpacity style={s.toolbarBtn} onPress={() => friendSheetRef.current?.present()}><Ionicons name="person-add-outline" size={26} color={colors.postAction} /></TouchableOpacity>
            <TouchableOpacity style={s.toolbarBtn} onPress={takePhoto}><Ionicons name="camera-outline" size={26} color={colors.postAction} /></TouchableOpacity>
          </View>
        </View>

        <LocationPickerModal ref={locationSheetRef} onSelect={setSelectedLocation} />
        <PrivacyPickerSheet ref={privacySheetRef} selectedValue={privacy} onSelect={setPrivacy} />
        <MusicPickerModal ref={musicSheetRef} onSelect={setSelectedMusic} />
        <FriendPickerModal ref={friendSheetRef} onSelect={setTaggedFriends} initialSelected={taggedFriends} />
        <EmojiPickerModal ref={emojiSheetRef} onSelect={handleEmojiSelect} />
        <MenuControl 
          visible={menuVisible} 
          onClose={() => setMenuVisible(false)} 
          items={menuItems} 
          from={fontBtnRef} 
          isModal={true}
        />

        {loading && (
          <View style={s.overlay}>
            <View style={s.overlayCard}><ActivityIndicator size="large" color={colors.accent} /><Text style={[s.overlayText, { color: colors.text }]}>Đang đăng bài...</Text></View>
          </View>
        )}
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = (c) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bgCard },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: { padding: 4 },
  audienceBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.bgInput, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  audienceText: { fontSize: 13, color: c.text, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  styleBtnBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  styleBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  iconBtn: { padding: 5 },
  postBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 24, backgroundColor: c.bgInput, minWidth: 60, alignItems: 'center' },
  postBtnActive: { backgroundColor: c.accent },
  postBtnText: { fontSize: 14, fontWeight: '700', color: c.textSub },
  postBtnTextActive: { color: '#fff' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  authorAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.bgInput },
  authorName: { fontSize: 16, fontWeight: '700', color: c.text },
  taggedFriendsText: { fontSize: 14, color: c.textMuted },
  taggedFriendsBold: { fontWeight: '700', color: c.text },
  privacyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, backgroundColor: c.accentLight, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12 },
  privacyText: { fontSize: 11, color: c.icon, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationAtText: { fontSize: 13, color: c.textMuted },
  locationNameText: { fontSize: 13, fontWeight: '700' },
  input: { fontSize: 18, color: c.text, lineHeight: 26, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 10, marginBottom: 16 },
  imageWrapper: { width: '48.5%', aspectRatio: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', backgroundColor: c.bgInput },
  previewImage: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  musicBarContainer: { marginTop: 10, marginBottom: 20 },
  musicBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 16 },
  musicMain: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  musicIconBox: { width: 42, height: 42, position: 'relative' },
  musicCover: { width: 42, height: 42, borderRadius: 8 },
  musicOverlayIcon: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  musicInfo: { marginLeft: 12, flex: 1 },
  musicTitle: { fontSize: 14, fontWeight: '700' },
  musicArtist: { fontSize: 12, marginTop: 2 },
  musicCloseBtn: { padding: 4 },
  bottomArea: { backgroundColor: c.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 16 },
  mediaScrollWrap: { paddingTop: 12, paddingBottom: 4 },
  mediaRow: { paddingHorizontal: 16 },
  mediaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, backgroundColor: c.bgInput, marginRight: 10 },
  mediaChipText: { fontSize: 14, fontWeight: '600' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  toolbarBtn: { padding: 10 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  overlayCard: { backgroundColor: c.bgCard, borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  overlayText: { fontSize: 15, fontWeight: '600' },
  bgPicker: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.bgCard,
  },
  fontOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    backgroundColor: c.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  fontOptionText: { fontSize: 14 },
});
