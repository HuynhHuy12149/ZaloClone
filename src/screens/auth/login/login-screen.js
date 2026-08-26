import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginMutation } from '@/base/services/queries';
import { useTheme } from '@/base/context/ThemeContext';
import { showToast } from '@/base/shared/utils/toast';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginMutation();
  const { colors } = useTheme();

  const handleLogin = () => {
    if (!email || !password) {
      showToast.error('Thông báo', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onError: (error) => {
          showToast.error('Đăng nhập thất bại', error.message || 'Vui lòng thử lại');
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
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
            <Text className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: colors?.text || '#000' }}>Zalo</Text>
            <Text className="text-base" style={{ color: colors?.textSub || '#6b7280' }}>Đăng nhập để kết nối với bạn bè</Text>
          </View>

          {/* Form */}
          <View className="w-full">
            <View 
              className="rounded-3xl py-1 mb-4 shadow-sm"
              style={{ elevation: 1, backgroundColor: colors.bgCard }}
            >
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="mail-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base min-h-[40px] p-0"
                  style={{ color: colors?.text || '#000' }}
                  placeholder="Email hoặc Số điện thoại"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View className="h-[1px] ml-14" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="lock-closed-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base min-h-[40px] p-0"
                  style={{ color: colors?.text || '#000' }}
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
              className={`bg-zalo-blue rounded-3xl py-4 items-center justify-center shadow-md shadow-zalo-blue/30 mb-8 ${loginMutation.isPending ? 'opacity-70' : ''}`}
              style={{ elevation: 4 }}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              activeOpacity={0.8}
            >
              {loginMutation.isPending ? (
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
            <Text className="text-[15px]" style={{ color: colors?.textSub || '#6b7280' }}>
              Bạn chưa có tài khoản? <Text className="font-bold text-zalo-blue">Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
