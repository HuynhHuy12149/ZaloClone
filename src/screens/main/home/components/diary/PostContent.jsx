import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';

import { Platform } from 'react-native';

const FONT_MAP = {
  normal: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: 'normal', fontStyle: 'normal' },
  bold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: 'bold', fontStyle: 'normal' },
  italic: { fontFamily: Platform.OS === 'ios' ? 'System' : 'normal', fontWeight: 'normal', fontStyle: 'italic' },
  serif: { fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontWeight: 'normal', fontStyle: 'normal' },
};

const PostContent = ({ content, colors, fontStyle = 'normal', textColor = null }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_CHAR = 150;
  const isLong = content?.length > MAX_CHAR;

  const textStyle = FONT_MAP[fontStyle] || FONT_MAP.normal;

  return (
    <View style={styles.postContentWrap}>
      <Text style={[
        styles.postContent, 
        { 
          color: textColor || colors.text,
          ...textStyle
        }
      ]}>
        {isLong && !expanded ? `${content.substring(0, 120)}...` : content}
      </Text>
      {isLong && (
        <TouchableOpacity onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}>
          <Text style={[styles.seeMoreText, { color: colors.accent }]}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  postContentWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  postContent: { fontSize: 15, lineHeight: 22 },
  seeMoreText: { fontWeight: '700', marginTop: 4, fontSize: 14 },
});

export default PostContent;
