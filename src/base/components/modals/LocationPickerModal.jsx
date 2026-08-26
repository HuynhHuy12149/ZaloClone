import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Modal,
  TouchableWithoutFeedback, TextInput, FlatList,
  KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { useTheme } from '@/base/context/ThemeContext';
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
      className="flex-row items-center py-3.5 border-b"
      style={{ borderBottomColor: colors?.border || '#e5e7eb' }}
      onPress={() => handleSelect(item)}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.bgInput }}>
        <Ionicons name="location-sharp" size={20} color={colors?.accent || '#0068ff'} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold mb-0.5" style={{ color: colors?.text || '#000' }}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        <Text className="text-[13px] text-gray-400" numberOfLines={1}>
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
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View
            className="absolute inset-0 bg-black/50"
            style={{ opacity: backdropOpacity }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          className="w-full"
          style={{ transform: [{ translateY: sheetTranslateY }] }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="rounded-t-[32px] pt-3"
            style={{ height: SCREEN_HEIGHT * 0.85, backgroundColor: colors.bgCard }}
          >
            <View className="w-10 h-1 rounded-full self-center mb-2.5" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />

            <View className="px-4 pb-4 items-center">
              <Text className="text-lg font-extrabold" style={{ color: colors?.text || '#000' }}>Địa điểm</Text>
            </View>

            <View className="px-4 pb-4">
              <View className="flex-row items-center rounded-full h-11" style={{ backgroundColor: colors.bgInput }}>
                <Ionicons name="search" size={20} color={colors?.textMuted || '#9ca3af'} style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 px-2.5 text-[15px]"
                  style={{ color: colors?.text || '#000' }}
                  placeholder="Tìm kiếm địa điểm"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
                    <Ionicons name="close-circle" size={18} color={colors?.textMuted || '#9ca3af'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {loading && (
              <ActivityIndicator className="my-2.5" color={colors?.accent || '#0068ff'} />
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
                  <View className="flex-row items-center gap-1.5 py-2.5 mt-1">
                    <MaterialIcons name="my-location" size={16} color={colors?.textSub || '#6b7280'} />
                    <Text className="text-[13px] font-semibold uppercase" style={{ color: colors?.textSub || '#6b7280' }}>
                      Địa điểm gần bạn
                    </Text>
                  </View>
                )
              }
              ListEmptyComponent={!loading && search.length > 0 && (
                <Text className="text-center mt-10 text-[15px] text-gray-400">
                  Không tìm thấy địa điểm nào
                </Text>
              )}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default LocationPickerModal;
