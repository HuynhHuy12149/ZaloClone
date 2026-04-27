import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal,
  TouchableWithoutFeedback, TextInput, FlatList,
  KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { useTheme } from '../utils/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_MAP;

const LocationPickerModal = forwardRef(({ onSelect, onClose }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const show = () => {
    setVisible(true);
    getCurrentLocation();
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      })
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

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      setUserLocation(coords);
      fetchNearbyPlaces(coords);
    } catch (error) {
      console.log('Error getting location', error);
    }
  };

  useEffect(() => {
    if (!visible) return;
    if (search.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        searchLocations(search);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else if (userLocation) {
      fetchNearbyPlaces(userLocation);
    }
  }, [search, visible]);

  const fetchNearbyPlaces = async (coords) => {
    if (!coords) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://rsapi.goong.io/Place/Autocomplete`, {
        params: {
          api_key: GOONG_API_KEY,
          input: ' ', 
          location: `${coords.latitude},${coords.longitude}`,
          limit: 10,
          radius: 1000
        }
      });
      if (res.data.predictions) {
        setLocations(res.data.predictions);
      }
    } catch (error) {
      console.log('Nearby places error', error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (text) => {
    setLoading(true);
    try {
      const params = {
        api_key: GOONG_API_KEY,
        input: text,
        limit: 15
      };
      if (userLocation) {
        params.location = `${userLocation.latitude},${userLocation.longitude}`;
      }
      const res = await axios.get(`https://rsapi.goong.io/Place/Autocomplete`, { params });
      if (res.data.predictions) {
        setLocations(res.data.predictions);
      }
    } catch (error) {
      console.log('Search error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (place) => {
    setLoading(true);
    try {
      // Gọi API Place Detail để lấy tọa độ lat/lng chính xác
      const res = await axios.get(`https://rsapi.goong.io/Place/Detail`, {
        params: {
          api_key: GOONG_API_KEY,
          place_id: place.place_id
        }
      });
      
      const details = res.data.result;
      const lat = details.geometry.location.lat;
      const lng = details.geometry.location.lng;

      onSelect({
        name: place.structured_formatting?.main_text || place.description,
        address: place.description,
        latitude: lat,
        longitude: lng,
        place_id: place.place_id
      });
      hide();
    } catch (error) {
      console.log('Error getting place detail', error);
      // Fallback nếu không lấy được detail
      onSelect({
        name: place.structured_formatting?.main_text || place.description,
        address: place.description,
        place_id: place.place_id
      });
      hide();
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border + '30' }]} 
      onPress={() => handleSelect(item)}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.bgInput }]}>
        <Ionicons name="location-sharp" size={20} color={colors.accent} />
      </View>
      <View style={styles.itemMeta}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        <Text style={[styles.itemAddress, { color: colors.textMuted }]} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View 
            style={[
              styles.backdrop, 
              { 
                opacity: backdropOpacity,
                backgroundColor: 'rgba(0,0,0,0.5)' 
              }
            ]} 
          />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.sheetWrap,
            { transform: [{ translateY: sheetTranslateY }] }
          ]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.sheet, { backgroundColor: colors.bgCard, height: SCREEN_HEIGHT * 0.85 }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Địa điểm</Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: colors.bgInput }]}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginLeft: 12 }} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tìm kiếm địa điểm"
                  placeholderTextColor={colors.textPlaceholder}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {loading && (
              <ActivityIndicator style={{ marginVertical: 10 }} color={colors.accent} />
            )}

            <FlatList
              data={locations}
              keyExtractor={(item) => item.place_id}
              renderItem={renderItem}
              contentContainerStyle={{ 
                paddingHorizontal: 16, 
                paddingBottom: insets.bottom + 40 
              }}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                !search && locations.length > 0 && (
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="my-location" size={16} color={colors.textSub} />
                    <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Địa điểm gần bạn</Text>
                  </View>
                )
              }
              ListEmptyComponent={!loading && search.length > 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Không tìm thấy địa điểm nào</Text>
              )}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center'
  },
  title: { fontSize: 18, fontWeight: '800' },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 22, height: 44,
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 15 },
  sectionHeader: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, marginTop: 5 
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  itemMeta: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  itemAddress: { fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
});

export default LocationPickerModal;
