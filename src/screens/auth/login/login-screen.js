import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login, getProfile } from '@/base/services/authService';
import { useAuthStore } from '@/base/shared/store/authStore';
import { useTheme } from '@/base/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const logInAction = useAuthStore((state) => state.logIn);
  const { colors, isDark } = useTheme();

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
    <SafeAreaView className="flex-1 bg-[#f2f2f7] dark:bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6 pt-14 pb-10" 
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-10">
            <View 
              className="w-[72px] h-[72px] rounded-3xl bg-zalo-blue items-center justify-center mb-5 shadow-lg shadow-zalo-blue/40"
              style={{ elevation: 8 }}
            >
              <Ionicons name="chatbubbles" size={36} color="#fff" />
            </View>
            <Text className="text-4xl font-extrabold text-black dark:text-white mb-2 tracking-tight">Zalo</Text>
            <Text className="text-base text-gray-500 dark:text-gray-400">Đăng nhập để kết nối với bạn bè</Text>
          </View>

          {/* Form */}
          <View className="w-full">
            <View 
              className="bg-white dark:bg-zalo-darkCard rounded-3xl py-1 mb-4 shadow-sm"
              style={{ elevation: 1 }}
            >
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="mail-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base text-black dark:text-white min-h-[40px] p-0"
                  placeholder="Email hoặc Số điện thoại"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-14" />
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="lock-closed-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base text-black dark:text-white min-h-[40px] p-0"
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity className="self-end mb-8 px-1">
              <Text className="text-sm font-semibold text-zalo-blue">Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-zalo-blue rounded-3xl py-4 items-center justify-center shadow-md shadow-zalo-blue/30 mb-8"
              style={{ elevation: 4 }}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[17px] font-bold text-white">Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <TouchableOpacity
            className="items-center mt-auto pt-5"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="text-[15px] text-gray-500 dark:text-gray-400">
              Bạn chưa có tài khoản? <Text className="font-bold text-zalo-blue">Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
