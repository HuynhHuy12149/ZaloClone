import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/base/context/ThemeContext';

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

  const renderContent = () => {
    if (url && !imgError) {
      return (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size, borderRadius, resizeMode: 'cover' }}
          onError={() => setImgError(true)}
        />
      );
    }

    // Default to blank silhouette
    return (
      <View 
        className="justify-center items-center bg-[#c9ccd1]"
        style={{ width: size, height: size, borderRadius }}
      >
        <FontAwesome5 name="user-alt" size={size * 0.5} color="#ffffff" />
      </View>
    );
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      className="overflow-hidden justify-center items-center"
      style={[
        { width: size, height: size, borderRadius },
        style
      ]}
    >
      {renderContent()}
    </Container>
  );
}
