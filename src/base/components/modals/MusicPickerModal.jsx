import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  Modal, TouchableWithoutFeedback,
  TextInput, FlatList, Animated, Dimensions, Image,
  ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import axios from 'axios';
import { useTheme } from '@/base/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MusicPickerModal = forwardRef(({ onSelect, onClose }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const soundRef = useRef(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const show = () => {
    setVisible(true);
    fetchSongs('nhạc trẻ');
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 350, useNativeDriver: true })
    ]).start();
  };

  const hide = async () => {
    await stopSound();
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setVisible(false);
      setSearch('');
      if (onClose) onClose();
    });
  };

  useImperativeHandle(ref, () => ({
    present: show,
    dismiss: hide,
  }));

  const stopSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) { }
      soundRef.current = null;
      setPlayingId(null);
    }
  };

  const playPreview = async (url, id) => {
    try {
      if (playingId === id) {
        await stopSound();
        return;
      }

      await stopSound();
      setLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingId(id);
      setLoading(false);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.log('Error playing sound', error);
      setLoading(false);
    }
  };

  const fetchSongs = async (term) => {
    if (!term) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://itunes.apple.com/search`, {
        params: {
          term: term,
          media: 'music',
          limit: 20,
          country: 'VN'
        }
      });
      const results = response.data.results.map(item => ({
        id: item.trackId.toString(),
        title: item.trackName,
        artist: item.artistName,
        cover: item.artworkUrl100.replace('100x100', '300x300'),
        preview: item.previewUrl
      }));
      setSongs(results);
    } catch (error) {
      console.log('Error fetching songs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    const delayDebounceFn = setTimeout(() => {
      if (search) fetchSongs(search);
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const renderItem = ({ item }) => (
    <View className="flex-row items-center py-3 border-b border-gray-200/20 dark:border-zalo-darkBorder/20">
      <Image source={{ uri: item.cover }} className="w-[52px] h-[52px] rounded-xl mr-3" />
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-black dark:text-white mb-0.5" numberOfLines={1}>{item.title}</Text>
        <Text className="text-[13px] text-gray-400">{item.artist}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => playPreview(item.preview, item.id)}
          className="w-9 h-9 rounded-full items-center justify-center bg-gray-200 dark:bg-zalo-darkInput"
        >
          <Ionicons
            name={playingId === item.id ? "pause" : "play"}
            size={18}
            color={colors?.accent || '#0068ff'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onSelect(item);
            hide();
          }}
          className="px-3.5 py-2 rounded-full min-w-[60px] items-center bg-zalo-blue"
        >
          <Text className="text-white text-[13px] font-bold">Chọn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View className="absolute inset-0 bg-black/50" style={{ opacity: backdropOpacity }} />
        </TouchableWithoutFeedback>

        <Animated.View
          className="w-full"
          style={{ transform: [{ translateY: sheetTranslateY }] }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="rounded-t-[32px] pt-3 bg-white dark:bg-zalo-darkCard"
            style={{ height: SCREEN_HEIGHT * 0.85 }}
          >
            <View className="w-10 h-1 rounded-full self-center mb-3 bg-gray-300 dark:bg-zalo-darkBorder" />

            <View className="flex-row items-center justify-center px-5 mb-4 relative">
              <Text className="text-lg font-extrabold text-black dark:text-white">Tìm nhạc</Text>
              <TouchableOpacity onPress={hide} className="absolute right-5">
                <Ionicons name="close-circle" size={24} color={colors?.textMuted || '#9ca3af'} />
              </TouchableOpacity>
            </View>

            <View className="px-4 mb-4">
              <View className="flex-row items-center rounded-full h-11 bg-gray-200 dark:bg-zalo-darkInput">
                <Ionicons name="search" size={20} color={colors?.textMuted || '#9ca3af'} style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 px-2.5 text-[15px] text-black dark:text-white"
                  placeholder="Bài hát, ca sĩ bạn yêu thích..."
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={search}
                  onChangeText={setSearch}
                />
                {loading && <ActivityIndicator size="small" color={colors?.accent || '#0068ff'} className="mr-3" />}
              </View>
            </View>

            <FlatList
              data={songs}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={!loading && (
                <View className="items-center mt-24">
                  <MaterialCommunityIcons name="music-box-outline" size={60} color={colors?.textMuted || '#9ca3af'} />
                  <Text className="mt-3.5 text-base font-medium text-gray-400">Tìm bài hát bạn yêu thích</Text>
                </View>
              )}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default MusicPickerModal;
