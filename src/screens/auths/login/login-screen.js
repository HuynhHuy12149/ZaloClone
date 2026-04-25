import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login, getProfile } from '../../../services/supabaseService/authService';
import { useAuthStore } from '../../../store/authStore';
import { useTheme } from '../../../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const logInAction = useAuthStore((state) => state.logIn);
  const { colors } = useTheme();
  const s = styles(colors);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    const response = await login(email, password);

    if (!response.success) {
      setLoading(false);
      Alert.alert('Đăng nhập thất bại', response.message);
    } else {
      try {
        const user = response.data?.user;
        if (user) {
          const profileRes = await getProfile(user.id);
          const profile = profileRes.success ? profileRes.data : null;

          const authInfo = {
            id: user.id,
            username: profile?.username || user.user_metadata?.username,
            full_name: profile?.full_name || user.user_metadata?.full_name,
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
          };

          await logInAction(authInfo);
        }
      } catch (error) {
        console.error('Error saving auth info:', error);
      } finally {
        setLoading(false);
      }
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
              <Ionicons name="chatbubbles" size={36} color="#fff" />
            </View>
            <Text style={s.title}>Zalo</Text>
            <Text style={s.subtitle}>Đăng nhập để kết nối với bạn bè</Text>
          </View>

          {/* Form */}
          <View style={s.formGroup}>
            <View style={s.inputGroup}>
              <View style={s.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={colors.iconSub} />
                <TextInput
                  style={s.input}
                  placeholder="Email hoặc Số điện thoại"
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
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={s.forgotBtn}>
              <Text style={s.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <TouchableOpacity
            style={s.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={s.footerText}>
              Bạn chưa có tài khoản? <Text style={s.registerText}>Đăng ký ngay</Text>
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
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 0,
    paddingVertical: 4,
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    gap: 12,
  },
  divider: { height: 1, backgroundColor: c.border + '60', marginLeft: 52 },
  input: { flex: 1, fontSize: 16, color: c.text, minHeight: 40, padding: 0 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 32, paddingHorizontal: 4 },
  forgotText: { fontSize: 14, fontWeight: '600', color: c.accent },

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
