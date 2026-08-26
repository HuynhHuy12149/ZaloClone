import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Modal, FlatList, Image, Dimensions, 
  StatusBar, Pressable, Animated, Easing 
} from 'react-native';
import ImagePreviewHeader from './ImagePreviewHeader';
import ImagePreviewFooter from './ImagePreviewFooter';

const { width, height } = Dimensions.get('window');

export default function ImagePreviewModal({ visible, data, onClose, colors }) {
  const [showUI, setShowUI] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(data.index);
      setTimeout(() => {
        toggleUI(true);
      }, 100);
    } else {
      visibleAnim.setValue(0);
      setShowUI(false);
    }
  }, [visible]);

  const toggleUI = (targetState) => {
    const nextState = targetState ?? !showUI;
    setShowUI(nextState);
    
    Animated.timing(visibleAnim, {
      toValue: nextState ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Auto hide after 4s if shown
    if (nextState) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        toggleUI(false);
      }, 4000);
    }
  };

  if (!visible || !data) return null;
  const { images, index, post } = data;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View className="flex-1 bg-black">
        {/* Header */}
        <ImagePreviewHeader 
          onClose={onClose} 
          index={currentIndex} 
          total={images.length} 
          post={post} 
          visibleAnim={visibleAnim}
        />

        {/* Main Image List with Toggle logic */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={index}
          getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => toggleUI()}
              className="justify-center items-center bg-black"
              style={{ width, height }}
            >
              <Image 
                source={{ uri: item }} 
                className="w-full h-4/5"
                resizeMode="contain" 
              />
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />

        {/* Footer Info */}
        <ImagePreviewFooter 
          post={post} 
          accentColor={colors?.accent || '#0068ff'} 
          visibleAnim={visibleAnim}
        />
      </View>
    </Modal>
  );
}
