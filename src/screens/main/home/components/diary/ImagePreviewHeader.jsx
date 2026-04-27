import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatRelativeTime } from '../../../../../utils/dateUtils';

const ImagePreviewHeader = ({ onClose, index, total, post, visibleAnim }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Animated.View 
      style={[
        styles.modalHeader, 
        { 
          paddingTop: insets.top,
          transform: [{ translateY: visibleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0]
          }) }],
          opacity: visibleAnim
        }
      ]}
    >
      <BlurView intensity={40} tint="dark" style={styles.blurWrap}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={onClose} hitSlop={15} style={styles.btnWrap}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.titleWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.modalTime}>{formatRelativeTime(post?.created_at)}</Text>
              {/* Hiển thị icon theo privacy */}
              <Ionicons 
                name={
                  post?.privacy === 'Private' ? 'lock-closed' : 
                  post?.privacy === 'Friends' ? 'people' : 'earth'
                } 
                size={10} 
                color="#ccc" 
                style={{ marginLeft: 4 }} 
              />
            </View>
            <Text style={styles.modalIndex}>{index + 1}/{total}</Text>
          </View>

          <TouchableOpacity hitSlop={15} style={styles.btnWrap}>
            <MaterialCommunityIcons name="dots-horizontal" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
  },
  blurWrap: {
    paddingBottom: 8,
  },
  headerInner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: 16,
    height: 56,
  },
  btnWrap: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center'
  },
  titleWrap: {
    alignItems: 'center',
  },
  modalTime: { color: '#ccc', fontSize: 12, fontWeight: '500' },
  modalIndex: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 1 },
});

export default ImagePreviewHeader;
