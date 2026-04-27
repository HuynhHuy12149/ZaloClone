import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ImagePreviewFooter = ({ post, accentColor, visibleAnim }) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View 
      style={[
        styles.modalFooter, 
        { 
          paddingBottom: Math.max(insets.bottom, 20),
          transform: [{ translateY: visibleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [200, 0]
          }) }],
          opacity: visibleAnim
        }
      ]}
    >
      <BlurView intensity={50} tint="dark" style={styles.blurWrap}>
        <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalContent}>{post?.content}</Text>
        </ScrollView>
        
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalActionBtn} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
            <Text style={styles.modalActionText}>Thích</Text>
            <View style={[styles.modalHeartBadge, { backgroundColor: accentColor }]}>
              <Text style={{ fontSize: 10, color: '#fff' }}>❤️ 1</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalActionBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="comment-outline" size={22} color="#fff" />
            <Text style={styles.modalActionText}>Bình luận</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
  },
  blurWrap: {
    paddingHorizontal: 20, 
    paddingTop: 16,
    paddingBottom: 10,
  },
  modalContent: { color: '#fff', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  modalActionBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20
  },
  modalActionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalHeartBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 4 },
});

export default ImagePreviewFooter;
