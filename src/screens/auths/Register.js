import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { register } from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

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
    <SafeAreaView className="flex-1 bg-[#1a1a1a]">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text className="text-3xl font-bold mb-2 text-white">Tạo tài khoản</Text>
        <Text className="text-gray-400 mb-8 text-lg">Khám phá thế giới Zalo cùng bạn bè</Text>
        
        <View className="mb-4">
          <Text className="text-gray-500 mb-2 ml-1">Họ và tên</Text>
          <TextInput
            className="w-full bg-[#262626] text-white rounded-xl p-4 border border-[#333]"
            placeholder="Nhập họ và tên"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-500 mb-2 ml-1">Email</Text>
          <TextInput
            className="w-full bg-[#262626] text-white rounded-xl p-4 border border-[#333]"
            placeholder="Nhập email của bạn"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View className="mb-8">
          <Text className="text-gray-500 mb-2 ml-1">Mật khẩu</Text>
          <TextInput
            className="w-full bg-[#262626] text-white rounded-xl p-4 border border-[#333]"
            placeholder="Tối thiểu 6 ký tự"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-[#0084ff] rounded-full p-4 items-center mb-6 shadow-lg shadow-blue-500/30"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Tiếp tục</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-400">Đã có tài khoản? <Text className="text-[#0084ff] font-bold">Đăng nhập</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
