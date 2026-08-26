import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegisterMutation } from '@/base/services/queries';
import { useTheme } from '@/base/context/ThemeContext';
import { showToast } from '@/base/shared/utils/toast';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const registerMutation = useRegisterMutation();
  const { colors } = useTheme();

  const handleRegister = () => {
    if (!email || !password || !fullName) {
      showToast.error('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    registerMutation.mutate(
      { email, password, username: email, fullName },
      {
        onSuccess: () => {
          showToast.success('Thành công', 'Đăng ký thành công! Hãy dùng tài khoản này để đăng nhập.');
          navigation.navigate('Login');
        },
        onError: (error) => {
          showToast.error('Lỗi đăng ký', error.message || 'Vui lòng thử lại');
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
              <Ionicons name="person-add" size={36} color="#fff" />
            </View>
            <Text className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: colors?.text || '#000' }}>Tạo tài khoản</Text>
            <Text className="text-base" style={{ color: colors?.textSub || '#6b7280' }}>Khám phá thế giới Zalo cùng bạn bè</Text>
          </View>

          {/* Form */}
          <View className="w-full">
            <View 
              className="rounded-3xl py-1 mb-8 shadow-sm"
              style={{ elevation: 1, backgroundColor: colors.bgCard }}
            >
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="person-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base min-h-[40px] p-0"
                  style={{ color: colors?.text || '#000' }}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              <View className="h-[1px] ml-14" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="mail-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base min-h-[40px] p-0"
                  style={{ color: colors?.text || '#000' }}
                  placeholder="Nhập email của bạn"
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
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              className={`bg-zalo-blue rounded-3xl py-4 items-center justify-center shadow-md shadow-zalo-blue/30 mb-8 ${registerMutation.isPending ? 'opacity-70' : ''}`}
              style={{ elevation: 4 }}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
              activeOpacity={0.8}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[17px] font-bold text-white">Tiếp tục</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <TouchableOpacity
            className="items-center mt-auto pt-5"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-[15px]" style={{ color: colors?.textSub || '#6b7280' }}>
              Đã có tài khoản? <Text className="font-bold text-zalo-blue">Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
