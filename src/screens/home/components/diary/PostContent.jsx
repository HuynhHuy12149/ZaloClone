import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform } from 'react-native';

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
    <View className="px-4 pb-4">
      <Text 
        className="text-[15px] leading-[22px]"
        style={[
          { 
            color: textColor || colors?.text || '#000',
            ...textStyle
          }
        ]}
      >
        {isLong && !expanded ? `${content.substring(0, 120)}...` : content}
      </Text>
      {isLong && (
        <TouchableOpacity onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}>
          <Text className="font-bold mt-1 text-sm text-zalo-blue">
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostContent;
