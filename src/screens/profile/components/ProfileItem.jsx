import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

export default function ProfileItem({ item, colors, isLast }) {
  return (
    <>
      <TouchableOpacity className="flex-row items-center px-4 py-3.5" activeOpacity={0.7}>
        <View 
          className="w-11 h-11 rounded-2xl items-center justify-center" 
          style={{ backgroundColor: item.color + '1a' }}
        >
          {item.lib === 'ion'
            ? <Ionicons name={item.icon} size={22} color={item.color} />
            : <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
          }
        </View>
        <View className="flex-1 ml-3.5">
          <Text className="text-base font-semibold" style={{ color: colors.text }}>{item.title}</Text>
          {item.desc && (
            <Text className="text-[13px] mt-0.5" style={{ color: colors.textSub }} numberOfLines={1}>
              {item.desc}
            </Text>
          )}
        </View>
        <Entypo name="chevron-small-right" size={24} color={colors?.iconSub || '#999'} />
      </TouchableOpacity>
      {!isLast && (
        <View className="h-[1px] ml-20" style={{ backgroundColor: colors?.border || '#e5e7eb' }} />
      )}
    </>
  );
}
