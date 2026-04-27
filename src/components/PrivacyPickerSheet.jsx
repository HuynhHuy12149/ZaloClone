import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, TouchableWithoutFeedback, Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { PrivacyOptions } from '../utils/postEnums';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PrivacyPickerSheet = forwardRef(({ onSelect, selectedValue }, ref) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const show = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setVisible(false);
    });
  };

  useImperativeHandle(ref, () => ({
    present: show,
    dismiss: hide,
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={hide}>
          <Animated.View 
            style={[
              styles.backdrop, 
              { 
                opacity: backdropOpacity,
                backgroundColor: 'rgba(0,0,0,0.5)' 
              }
            ]} 
          />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[
            styles.sheet, 
            { 
              backgroundColor: colors.bgCard,
              transform: [{ translateY: sheetTranslateY }]
            }
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.title, { color: colors.text }]}>Ai có thể xem bài viết này?</Text>
          
          <View style={styles.optionsWrap}>
            {PrivacyOptions.map((opt) => (
              <TouchableOpacity 
                key={opt.value} 
                style={styles.optionItem}
                onPress={() => {
                  onSelect(opt.value);
                  hide();
                }}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.bgInput }]}>
                  <Ionicons name={opt.icon} size={22} color={colors.text} />
                </View>
                <View style={styles.meta}>
                  <Text style={[styles.label, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.desc, { color: colors.textMuted }]}>{opt.desc}</Text>
                </View>
                
                <View style={styles.radioOuter}>
                  {selectedValue === opt.value ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                  ) : (
                    <View style={[styles.radioInner, { borderColor: colors.border }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 40 }} />
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 25 },
  optionsWrap: { gap: 10 },
  optionItem: { 
    flexDirection: 'row', alignItems: 'center', gap: 14, 
    paddingVertical: 12 
  },
  iconWrap: { 
    width: 44, height: 44, borderRadius: 22, 
    alignItems: 'center', justifyContent: 'center' 
  },
  meta: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  desc: { fontSize: 13 },
  radioOuter: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  radioInner: { 
    width: 20, height: 20, borderRadius: 10, 
    borderWidth: 1.5, 
  }
});

export default PrivacyPickerSheet;
