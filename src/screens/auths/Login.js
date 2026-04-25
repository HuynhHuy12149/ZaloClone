import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, getProfile } from '../../services/authService';
import { useAuthStore } from '../../utils/authStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const logInAction = useAuthStore((state) => state.logIn);

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
          
          await AsyncStorage.setItem('auth_info', JSON.stringify(authInfo));
          logInAction({ email, password }, authInfo);
        }
      } catch (error) {
        console.error('Error saving auth info:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1a1a1a]">
      <View className="flex-1 justify-center px-8">
        <Text className="text-4xl font-bold mb-2 text-white">Zalo</Text>
        <Text className="text-gray-400 mb-10 text-lg">Đăng nhập để kết nối với bạn bè</Text>
        
        <View className="mb-4">
          <Text className="text-gray-500 mb-2 ml-1">Email hoặc Số điện thoại</Text>
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
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-[#0084ff] rounded-full p-4 items-center mb-6 shadow-lg shadow-blue-500/30"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-gray-400">Bạn chưa có tài khoản? <Text className="text-[#0084ff] font-bold">Đăng ký ngay</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
