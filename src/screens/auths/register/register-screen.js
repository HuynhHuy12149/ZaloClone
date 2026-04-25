import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../../../services/supabaseService/authService';
import { useTheme } from '../../../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const s = styles(colors);

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, password, email, fullName);
      if (response.success) {
        Alert.alert('Thành công', 'Đăng ký thành công! Hãy dùng tài khoản này để đăng nhập.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi đăng ký', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi hệ thống', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.headerBox}>
            <View style={s.iconWrap}>
              <Ionicons name="person-add" size={36} color="#fff" />
            </View>
            <Text style={s.title}>Tạo tài khoản</Text>
            <Text style={s.subtitle}>Khám phá thế giới Zalo cùng bạn bè</Text>
          </View>

          {/* Form */}
          <View style={s.formGroup}>
            <View style={s.inputGroup}>
              <View style={s.inputWrap}>
                <Ionicons name="person-outline" size={20} color={colors.iconSub} />
                <TextInput
                  style={s.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors.textPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              <View style={s.divider} />
              <View style={s.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={colors.iconSub} />
                <TextInput
                  style={s.input}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor={colors.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={s.divider} />
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.iconSub} />
                <TextInput
                  style={s.input}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor={colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={s.loginBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.loginBtnText}>Tiếp tục</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <TouchableOpacity
            style={s.registerLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.footerText}>
              Đã có tài khoản? <Text style={s.registerText}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: c.bg },
  flex1: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 60,
  },

  // Header
  headerBox: { alignItems: 'center', marginBottom: 40 },
  iconWrap: {
    width: 72, height: 72,
    borderRadius: 24,
    backgroundColor: c.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: c.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 8
  },
  title: { fontSize: 36, fontWeight: '800', color: c.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: c.textSub },

  // Form
  formGroup: { width: '100%' },
  inputGroup: {
    backgroundColor: c.bgCard,
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1,
    paddingVertical: 4,
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    gap: 12,
  },
  divider: { height: 1, backgroundColor: c.border + '60', marginLeft: 52 },
  input: { flex: 1, fontSize: 16, color: c.text, height: 32 },

  loginBtn: {
    backgroundColor: c.accent,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: c.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
    marginBottom: 32,
  },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Footer
  registerLink: { alignItems: 'center', marginTop: 'auto', paddingTop: 20 },
  footerText: { fontSize: 15, color: c.textSub },
  registerText: { fontWeight: '700', color: c.accent },
});
