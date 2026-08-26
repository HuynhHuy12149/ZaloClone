import AsyncStorage from '@react-native-async-storage/async-storage';

export const CACHE_KEYS = {
  AUTH_INFO: 'auth_info',
  THEME_MODE: 'app_theme_mode',
  LANGUAGE: 'app_language',
};

// === CACHE HELPERS ===
export const setCache = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error setting cache', e);
  }
};

export const getCache = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Error getting cache', e);
    return null;
  }
};

export const removeCache = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing cache', e);
  }
};
