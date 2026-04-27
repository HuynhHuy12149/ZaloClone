import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PostMediaGallery = ({ item, onOpenPreview }) => {
  const urls = item?.media_urls;
  if (!urls || urls.length === 0) return null;

  const count = urls.length;
  
  if (count === 1) {
    return (
      <TouchableOpacity style={styles.postMediaWrap} activeOpacity={0.9} onPress={() => onOpenPreview(item, 0)}>
        <Image source={{ uri: urls[0] }} style={styles.postMediaSingle} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  if (count === 2) {
    return (
      <View style={[styles.postMediaWrap, styles.mediaRow]}>
        <TouchableOpacity style={styles.postMediaHalf} onPress={() => onOpenPreview(item, 0)}>
          <Image source={{ uri: urls[0] }} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postMediaHalf} onPress={() => onOpenPreview(item, 1)}>
          <Image source={{ uri: urls[1] }} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
      </View>
    );
  }

  if (count === 3) {
    return (
      <View style={styles.postMediaWrap}>
        <TouchableOpacity onPress={() => onOpenPreview(item, 0)}>
          <Image source={{ uri: urls[0] }} style={styles.postMediaFullWidth} />
        </TouchableOpacity>
        <View style={[styles.mediaRow, { marginTop: 4 }]}>
          <TouchableOpacity style={styles.postMediaHalfSmall} onPress={() => onOpenPreview(item, 1)}>
            <Image source={{ uri: urls[1] }} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.postMediaHalfSmall} onPress={() => onOpenPreview(item, 2)}>
            <Image source={{ uri: urls[2] }} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.postMediaWrap}>
      <View style={styles.mediaRow}>
        <TouchableOpacity style={styles.postMediaHalfSmall} onPress={() => onOpenPreview(item, 0)}>
          <Image source={{ uri: urls[0] }} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postMediaHalfSmall} onPress={() => onOpenPreview(item, 1)}>
          <Image source={{ uri: urls[1] }} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
      </View>
      <View style={[styles.mediaRow, { marginTop: 4 }]}>
        <TouchableOpacity style={styles.postMediaHalfSmall} onPress={() => onOpenPreview(item, 2)}>
          <Image source={{ uri: urls[2] }} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postMediaHalfSmall} onPress={() => onOpenPreview(item, 3)}>
          <Image source={{ uri: urls[3] }} style={[StyleSheet.absoluteFill, { borderRadius: 12 }]} />
          {count > 4 && (
            <View style={styles.mediaOverlay}>
              <Text style={styles.mediaOverlayText}>+{count - 3}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postMediaWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  mediaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  postMediaSingle: { width: '100%', height: 260, borderRadius: 16 },
  postMediaHalf: { width: '49%', height: 200, borderRadius: 12, overflow: 'hidden' },
  postMediaFullWidth: { width: '100%', height: 180, borderRadius: 12 },
  postMediaHalfSmall: { width: '49%', height: 120, borderRadius: 12, position: 'relative', overflow: 'hidden' },
  mediaOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  mediaOverlayText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});

export default PostMediaGallery;
