import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';

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
  const { colors } = useTheme();
  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: insets.top + 6 }]}>
      <View style={s.inner}>
        {title ? (
          <Text style={s.title}>{title}</Text>
        ) : (
          <TouchableOpacity style={s.searchBar} onPress={onSearchPress} activeOpacity={0.7}>
            <Ionicons name="search" size={18} color={colors.searchText} />
            <Text style={s.searchText}>{placeholder}</Text>
          </TouchableOpacity>
        )}

        <View style={s.rightRow}>
          {rightIcons.map((icon, index) => (
            <TouchableOpacity key={index} style={s.iconBtn} onPress={icon.onPress}>
              {icon.component}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = (c) => StyleSheet.create({
  container: {
    backgroundColor: c.bgCard,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.searchBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchText: {
    fontSize: 15,
    color: c.searchText,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconBtn: {
    padding: 5,
    marginLeft: 4,
  },
});
