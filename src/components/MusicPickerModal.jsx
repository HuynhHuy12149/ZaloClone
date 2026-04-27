import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, TouchableWithoutFeedback, 
  TextInput, FlatList, Animated, Dimensions, Image,
  ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import axios from 'axios';
import { useTheme } from '../utils/ThemeContext';
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
      } catch (e) {}
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
    <View style={[styles.songItem, { borderBottomColor: colors.border + '20' }]}>
      <Image source={{ uri: item.cover }} style={styles.cover} />
      <View style={styles.songMeta}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.songArtist, { color: colors.textMuted }]}>{item.artist}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => playPreview(item.preview, item.id)}
          style={[styles.playBtn, { backgroundColor: colors.bgInput }]}
        >
          <Ionicons 
            name={playingId === item.id ? "pause" : "play"} 
            size={18} 
            color={colors.accent} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            onSelect(item);
            hide();
          }}
          style={[styles.selectBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.selectBtnText}>Chọn</Text>
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
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[
            styles.sheetWrap,
            { transform: [{ translateY: sheetTranslateY }] }
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.sheet, { backgroundColor: colors.bgCard, height: SCREEN_HEIGHT * 0.85 }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Tìm nhạc</Text>
              <TouchableOpacity onPress={hide} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <View style={[styles.searchBar, { backgroundColor: colors.bgInput }]}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginLeft: 12 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Bài hát, ca sĩ bạn yêu thích..."
                  placeholderTextColor={colors.textPlaceholder}
                  value={search}
                  onChangeText={setSearch}
                />
                {loading && <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 12 }} />}
              </View>
            </View>

            <FlatList
              data={songs}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={!loading && (
                <View style={styles.emptyWrap}>
                  <MaterialCommunityIcons name="music-box-outline" size={60} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Tìm bài hát bạn yêu thích</Text>
                </View>
              )}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheetWrap: { width: '100%' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 12 },
  handle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 12 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingHorizontal: 20, marginBottom: 15, position: 'relative' 
  },
  title: { fontSize: 18, fontWeight: '800' },
  closeBtn: { position: 'absolute', right: 20 },
  searchWrap: { paddingHorizontal: 16, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, height: 44 },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 15 },
  songItem: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 12, borderBottomWidth: 1,
  },
  cover: { width: 52, height: 52, borderRadius: 10, marginRight: 12 },
  songMeta: { flex: 1 },
  songTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  songArtist: { fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playBtn: { 
    width: 36, height: 36, borderRadius: 18, 
    alignItems: 'center', justifyContent: 'center' 
  },
  selectBtn: { 
    paddingHorizontal: 14, paddingVertical: 8, 
    borderRadius: 18, minWidth: 60, alignItems: 'center' 
  },
  selectBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '500' },
});

export default MusicPickerModal;
