import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/base/context/ThemeContext';
import Avatar from '@/base/components/Avatar';
import { useAuthStore } from '@/base/shared/store/authStore';

/**
 * ZaloHeader
 * @param {string} placeholder  - search placeholder text
 * @param {string} title        - if set, shows a plain title instead of search bar
 * @param {Array}  rightIcons   - [{ component, onPress }]
 * @param {func}   onSearchPress
 */
export default function ZaloHeader({
  placeholder = 'Tìm kiếm',
  title,
  rightIcons = [],
  onSearchPress,
}) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const user = useAuthStore(state => state.user);

  return (
    <View 
      className="pb-3 z-10"
      style={{ paddingTop: insets.top + 8, backgroundColor: colors.bgHeader }}
    >
      <View className="flex-row items-center px-4 h-14">
        {!title && (
          <TouchableOpacity className="mr-3" activeOpacity={0.7}>
            <Avatar
              url={user?.avatar_url}
              name={user?.full_name}
              size={36}
            />
          </TouchableOpacity>
        )}
        {title ? (
          <Text className="flex-1 text-xl font-bold" style={{ color: colors?.headerText || colors?.text || '#000' }}>{title}</Text>
        ) : (
          <TouchableOpacity 
            className="flex-1 flex-row items-center rounded-full px-4 h-11 gap-2.5" 
            style={{ backgroundColor: colors.bgInput }}
            onPress={onSearchPress} 
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color={colors.searchText} />
            <Text className="text-base font-medium" style={{ color: colors?.searchText || colors?.textSub || '#9ca3af' }}>{placeholder}</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center ml-3">
          {rightIcons.map((icon, index) => (
            <TouchableOpacity 
              key={index} 
              className="p-1.5 ml-1.5 rounded-full" 
              style={{ backgroundColor: colors.bgInput }}
              onPress={icon.onPress}
            >
              {icon.component}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
