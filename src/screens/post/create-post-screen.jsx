import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, Platform, Keyboard, Image,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createPost } from '@/base/services/postService';
import { useTheme } from '@/base/context/ThemeContext';
import { useAuthStore } from '@/base/shared/store/authStore';
import { uploadImageToCloudinary } from '@/base/services/cloudinary';
import { compressImage } from '@/base/shared/utils/imageUtils';
import LocationPickerModal from '@/base/components/modals/LocationPickerModal';
import PrivacyPickerSheet from '@/base/components/modals/PrivacyPickerSheet';
import MusicPickerModal from '@/base/components/modals/MusicPickerModal';
import FriendPickerModal from '@/base/components/modals/FriendPickerModal';
import { PostPrivacy, PrivacyLabels } from '@/base/shared/enums/postEnums';
import Avatar from '@/base/components/Avatar';
import EmojiPickerModal from '@/base/components/modals/EmojiPickerModal';
import MenuControl from '@/base/components/MenuControl';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [privacy, setPrivacy] = useState(PostPrivacy.FRIENDS);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedFontStyle, setSelectedFontStyle] = useState('normal');
  const [selectedColor, setSelectedColor] = useState(null);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const soundRef = useRef(null);

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);

  const locationSheetRef = useRef(null);
  const privacySheetRef = useRef(null);
  const musicSheetRef = useRef(null);
  const friendSheetRef = useRef(null);
  const emojiSheetRef = useRef(null);
  const fontBtnRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
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
      } catch (e) { }
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
    } catch (error) { }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
      if (!result.canceled && result.assets) {
        const remainingSlots = 6 - images.length;
        const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) { }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled && result.assets) setImages(prev => [...prev, result.assets[0].uri]);
    } catch (error) { }
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
    { label: '--- Màu sắc ---', onPress: () => { }, color: '#999', autoClose: false },
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
    if (taggedFriends.length === 1) return <Text className="text-sm text-gray-400"> — cùng với <Text className="font-bold text-black dark:text-white">{taggedFriends[0].full_name}</Text></Text>;
    return (
      <Text className="text-sm text-gray-400"> - với <Text className="font-bold text-black dark:text-white">{taggedFriends[0].full_name}</Text> và <Text className="font-bold text-black dark:text-white">{taggedFriends.length - 1} người khác</Text></Text>
    );
  };

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-white dark:bg-zalo-darkCard" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-3 py-2.5">
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity className="p-1" onPress={() => navigation.goBack()} hitSlop={8}>
              <Ionicons name="close" size={26} color={colors?.text || '#000'} />
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-row items-center gap-1 bg-gray-200 dark:bg-zalo-darkInput px-3 py-1.5 rounded-full" 
              onPress={() => privacySheetRef.current?.present()}
            >
              <FontAwesome5 name="users" size={11} color={colors?.textSub || '#6b7280'} />
              <Text className="text-[13px] font-medium text-black dark:text-white">{PrivacyLabels[privacy]}</Text>
              <Entypo name="chevron-small-down" size={16} color={colors?.textSub || '#6b7280'} />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              ref={fontBtnRef}
              collapsable={false}
              className="w-8 h-8 rounded-full bg-zalo-blue items-center justify-center"
              onPress={() => setMenuVisible(true)}
            >
              <Text className="text-white font-extrabold text-xs">Aa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-4 py-1.5 rounded-full min-w-[60px] items-center ${
                canPost ? 'bg-zalo-blue' : 'bg-gray-200 dark:bg-zalo-darkInput'
              }`}
              onPress={handlePost} 
              disabled={loading || !canPost}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className={`text-sm font-bold ${canPost ? 'text-white' : 'text-gray-400'}`}>
                  Đăng
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-2" keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center gap-3 mb-4">
            <Avatar url={user?.avatar_url} name={user?.full_name} size={46} />
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center">
                <Text className="text-base font-bold text-black dark:text-white">{user?.full_name || 'Người dùng Zalo'}</Text>
                {renderTaggedFriendsText()}
              </View>
              <View className="flex-row items-center mt-1">
                {selectedLocation ? (
                  <View className="flex-row items-center">
                    <Text className="text-[13px] text-gray-400">tại </Text>
                    <Text className="text-[13px] font-bold text-zalo-blue">{selectedLocation.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedLocation(null)} hitSlop={5}>
                      <Ionicons name="close-circle" size={14} color={colors?.textMuted || '#9ca3af'} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    className="flex-row items-center gap-1 bg-zalo-blue/15 px-2 py-0.5 rounded-xl" 
                    onPress={() => privacySheetRef.current?.present()}
                  >
                    <Ionicons name="people-outline" size={12} color={colors?.icon || '#0068ff'} />
                    <Text className="text-[11px] font-semibold text-zalo-blue">{PrivacyLabels[privacy]}</Text>
                    <Ionicons name="chevron-down" size={11} color={colors?.icon || '#0068ff'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <TextInput
            className="text-lg leading-[26px] min-h-[80px] mb-4 text-black dark:text-white"
            style={[
              {
                fontFamily: FONT_STYLES.find(f => f.id === selectedFontStyle)?.fontFamily || 'System',
                fontWeight: FONT_STYLES.find(f => f.id === selectedFontStyle)?.fontWeight || 'normal',
                fontStyle: FONT_STYLES.find(f => f.id === selectedFontStyle)?.fontStyle || 'normal',
                color: selectedColor || colors?.text || '#000',
              }
            ]}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            editable={!loading}
          />

          {images.length > 0 && (
            <View className="flex-row flex-wrap justify-between gap-y-2.5 mt-2.5 mb-4">
              {images.map((uri, idx) => (
                <View key={idx} className="w-[48.5%] aspect-square relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-zalo-darkInput">
                  <Image source={{ uri }} className="w-full h-full" />
                  <TouchableOpacity 
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 items-center justify-center" 
                    onPress={() => removeImage(idx)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {selectedMusic && (
            <View className="mt-2.5 mb-5">
              <View className="flex-row items-center justify-between p-2.5 rounded-2xl bg-gray-200 dark:bg-zalo-darkInput">
                <View className="flex-row items-center flex-1">
                  <TouchableOpacity className="w-10 h-10 relative" onPress={togglePlayMusic} activeOpacity={0.8}>
                    <Image source={{ uri: selectedMusic.cover }} className="w-10 h-10 rounded-lg" />
                    <View className="absolute inset-0 bg-black/30 rounded-lg items-center justify-center">
                      <MaterialCommunityIcons name={isMusicPlaying ? "pause" : "play"} size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-black dark:text-white" numberOfLines={1}>{selectedMusic.title}</Text>
                    <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>{selectedMusic.artist}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={async () => { await stopMusic(); setSelectedMusic(null); }} className="p-1" hitSlop={10}>
                  <Ionicons name="close" size={20} color={colors?.textMuted || '#9ca3af'} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View 
          className="bg-white dark:bg-zalo-darkCard rounded-t-3xl shadow-sm" 
          style={{ paddingBottom: getBottomPadding() }}
        >
          <View className="pt-3 pb-1">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
              {MEDIA_OPTS.map((opt) => (
                <TouchableOpacity 
                  key={opt.label} 
                  className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-200 dark:bg-zalo-darkInput mr-2.5" 
                  onPress={opt.onPress}
                >
                  {opt.lib === 'mci' ? <MaterialCommunityIcons name={opt.icon} size={18} color={opt.color} /> : <Ionicons name={opt.icon} size={18} color={opt.color} />}
                  <Text className="text-sm font-semibold" style={{ color: opt.color }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="flex-row justify-around pt-2">
            <TouchableOpacity className="p-2.5" onPress={() => emojiSheetRef.current?.present()}>
              <MaterialCommunityIcons name="emoticon-outline" size={26} color={colors?.postAction || '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity className="p-2.5" onPress={pickImages}><Ionicons name="image-outline" size={26} color={colors?.icon || '#0068ff'} /></TouchableOpacity>
            <TouchableOpacity className="p-2.5" onPress={() => musicSheetRef.current?.present()}><Ionicons name="play-circle-outline" size={26} color={colors?.postAction || '#6b7280'} /></TouchableOpacity>
            <TouchableOpacity className="p-2.5" onPress={() => friendSheetRef.current?.present()}><Ionicons name="person-add-outline" size={26} color={colors?.postAction || '#6b7280'} /></TouchableOpacity>
            <TouchableOpacity className="p-2.5" onPress={takePhoto}><Ionicons name="camera-outline" size={26} color={colors?.postAction || '#6b7280'} /></TouchableOpacity>
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
          <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
            <View className="bg-white dark:bg-zalo-darkCard rounded-3xl p-6 items-center gap-3">
              <ActivityIndicator size="large" color={colors?.accent || '#0068ff'} />
              <Text className="text-[15px] font-semibold text-black dark:text-white">Đang đăng bài...</Text>
            </View>
          </View>
        )}
      </View>
    </BottomSheetModalProvider>
  );
}
