import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatInput({
  inputText,
  setInputText,
  showPlusMenu,
  setShowPlusMenu,
  handleSend,
  insets,
  colors,
  typingText
}) {
  const s = styles(colors);

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      {typingText ? (
        <View style={s.typingContainer}>
          <Text style={s.typingText}>{typingText.replace('...', '')}</Text>
          <AnimatedTypingDots color={colors.textMuted || '#888'} />
        </View>
      ) : null}

      {showPlusMenu && (
        <View style={[s.plusMenu, { bottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) + 60 : Math.max(insets.bottom - 10, 12) + 60 }]}>
          <TouchableOpacity style={s.plusMenuItem}>
            <View style={[s.plusMenuIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="mic" size={18} color="#fff" />
            </View>
            <Text style={s.plusMenuText}>Giọng nói</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.plusMenuItem}>
            <View style={[s.plusMenuIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="image" size={18} color="#fff" />
            </View>
            <Text style={s.plusMenuText}>Hình ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.plusMenuItem}>
            <View style={[s.plusMenuIcon, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="location" size={18} color="#fff" />
            </View>
            <Text style={s.plusMenuText}>Vị trí</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[s.inputContainer, { marginBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom - 10, 12) }]}>
        <TouchableOpacity style={s.attachBtn} onPress={() => setShowPlusMenu(!showPlusMenu)}>
          <Ionicons name="add-circle" size={30} color={colors.textMuted || '#888'} />
        </TouchableOpacity>

        <View style={s.inputWrapper}>
          <TextInput
            style={s.input}
            placeholder="Tin nhắn..."
            placeholderTextColor={colors.textMuted || '#999'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onFocus={() => setShowPlusMenu(false)}
          />
          {inputText.trim().length === 0 ? (
            <TouchableOpacity style={s.iconInsideBtn}>
              <Ionicons name="happy-outline" size={26} color={colors.textMuted || '#888'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.sendBtnInside} onPress={handleSend}>
              <Ionicons name="paper-plane" size={16} color="#fff" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const AnimatedTypingDots = ({ color }) => {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const createAnimation = (dot) =>
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -4,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]);

    Animated.loop(
      Animated.stagger(150, [
        createAnimation(dot1),
        createAnimation(dot2),
        createAnimation(dot3)
      ])
    ).start();
  }, [dot1, dot2, dot3]);

  const dotStyle = {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color,
    marginHorizontal: 2,
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 2, marginTop: 4 }}>
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: c.bgCard,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 30, // More rounded modern look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8, // Higher elevation to cast distinct shadow on Android
    borderWidth: 1,
    borderColor: c.border + '20', // Subtle border
  },
  attachBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginLeft: 8,
    marginRight: 0,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
  iconInsideBtn: {
    paddingLeft: 8,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  sendBtnInside: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2, // 32 width + 2 margin = 34 (matches icon size 26 + padding 8)
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  plusMenu: {
    position: 'absolute',
    left: 16,
    backgroundColor: c.bgCard,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: c.border + '20',
  },
  plusMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  plusMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plusMenuText: {
    fontSize: 15,
    color: c.text,
    fontWeight: '500',
  },
  typingContainer: {
    paddingHorizontal: 24,
    marginBottom: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 12,
    color: c.textMuted || '#888',
    fontStyle: 'italic',
  },
});
