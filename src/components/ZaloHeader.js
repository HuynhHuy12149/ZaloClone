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
    <View style={[s.container, { paddingTop: insets.top + 8 }]}>
      <View style={s.inner}>
        {title ? (
          <Text style={s.title}>{title}</Text>
        ) : (
          <TouchableOpacity style={s.searchBar} onPress={onSearchPress} activeOpacity={0.8}>
            <Ionicons name="search" size={20} color={colors.searchText} />
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
    paddingBottom: 12,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.searchBg,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    gap: 10,
  },
  searchText: {
    fontSize: 16,
    color: c.searchText,
    fontWeight: '500',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: c.bgInput,
    borderRadius: 20,
  },
});
