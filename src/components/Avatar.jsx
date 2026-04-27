import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

/**
 * Avatar Component
 * @param {string} url - Image URL
 * @param {string} name - User's name (used for initials if url is missing)
 * @param {number} size - Size of the avatar (width and height)
 * @param {boolean} rounded - If true, avatar is fully rounded (circle). If false, it's a squircle.
 * @param {object} style - Additional styles for the container
 * @param {function} onPress - Callback when avatar is pressed
 */
export default function Avatar({
  url,
  name,
  size = 40,
  rounded = true,
  style,
  onPress,
}) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);

  const borderRadius = rounded ? size / 2 : size * 0.35; // Squircle effect if not rounded

  const getInitials = (nameStr) => {
    if (!nameStr) return '';
    const parts = nameStr.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRandomColor = (nameStr) => {
    if (!nameStr) return colors.bgInput;
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorInt = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const colorHex = '#' + '000000'.substring(0, 6 - colorInt.length) + colorInt;
    return colorHex;
  };

  const renderContent = () => {
    if (url && !imgError) {
      return (
        <Image
          source={{ uri: url }}
          style={[{ width: size, height: size, borderRadius }, styles.image]}
          onError={() => setImgError(true)}
        />
      );
    }

    // Default to the blank silhouette requested by the user
    return (
      <View style={[{ width: size, height: size, borderRadius, backgroundColor: '#c9ccd1' }, styles.iconContainer]}>
        <FontAwesome5 name="user-alt" size={size * 0.5} color="#ffffff" />
      </View>
    );
  };

  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[
        { width: size, height: size, borderRadius },
        styles.container,
        style
      ]}
    >
      {renderContent()}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
