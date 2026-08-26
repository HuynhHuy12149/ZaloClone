import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '@/base/services/authService';
import { useTheme } from '@/base/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

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
              <Ionicons name="person-add" size={36} color="#fff" />
            </View>
            <Text className="text-4xl font-extrabold text-black dark:text-white mb-2 tracking-tight">Tạo tài khoản</Text>
            <Text className="text-base text-gray-500 dark:text-gray-400">Khám phá thế giới Zalo cùng bạn bè</Text>
          </View>

          {/* Form */}
          <View className="w-full">
            <View 
              className="bg-white dark:bg-zalo-darkCard rounded-3xl py-1 mb-8 shadow-sm"
              style={{ elevation: 1 }}
            >
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="person-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base text-black dark:text-white min-h-[40px] p-0"
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              <View className="h-[1px] bg-gray-200 dark:bg-zalo-darkBorder ml-14" />
              <View className="flex-row items-center px-5 py-3.5 gap-3">
                <Ionicons name="mail-outline" size={20} color={colors?.iconSub || '#9ca3af'} />
                <TextInput
                  className="flex-1 text-base text-black dark:text-white min-h-[40px] p-0"
                  placeholder="Nhập email của bạn"
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
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor={colors?.textPlaceholder || '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-zalo-blue rounded-3xl py-4 items-center justify-center shadow-md shadow-zalo-blue/30 mb-8"
              style={{ elevation: 4 }}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
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
            <Text className="text-[15px] text-gray-500 dark:text-gray-400">
              Đã có tài khoản? <Text className="font-bold text-zalo-blue">Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
