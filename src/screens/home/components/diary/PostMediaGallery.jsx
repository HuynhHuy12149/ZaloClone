import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const PostMediaGallery = ({ item, onOpenPreview }) => {
  const urls = item?.media_urls;
  if (!urls || urls.length === 0) return null;

  const count = urls.length;
  
  if (count === 1) {
    return (
      <TouchableOpacity className="px-4 pb-4" activeOpacity={0.9} onPress={() => onOpenPreview(item, 0)}>
        <Image source={{ uri: urls[0] }} className="w-full h-[260px] rounded-2xl" resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  if (count === 2) {
    return (
      <View className="px-4 pb-4 flex-row justify-between">
        <TouchableOpacity className="w-[49%] h-[200px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 0)}>
          <Image source={{ uri: urls[0] }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
        <TouchableOpacity className="w-[49%] h-[200px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 1)}>
          <Image source={{ uri: urls[1] }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
      </View>
    );
  }

  if (count === 3) {
    return (
      <View className="px-4 pb-4">
        <TouchableOpacity onPress={() => onOpenPreview(item, 0)}>
          <Image source={{ uri: urls[0] }} className="w-full h-[180px] rounded-xl" resizeMode="cover" />
        </TouchableOpacity>
        <View className="flex-row justify-between mt-1">
          <TouchableOpacity className="w-[49%] h-[120px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 1)}>
            <Image source={{ uri: urls[1] }} className="w-full h-full" resizeMode="cover" />
          </TouchableOpacity>
          <TouchableOpacity className="w-[49%] h-[120px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 2)}>
            <Image source={{ uri: urls[2] }} className="w-full h-full" resizeMode="cover" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 pb-4">
      <View className="flex-row justify-between">
        <TouchableOpacity className="w-[49%] h-[120px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 0)}>
          <Image source={{ uri: urls[0] }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
        <TouchableOpacity className="w-[49%] h-[120px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 1)}>
          <Image source={{ uri: urls[1] }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between mt-1">
        <TouchableOpacity className="w-[49%] h-[120px] rounded-xl overflow-hidden" onPress={() => onOpenPreview(item, 2)}>
          <Image source={{ uri: urls[2] }} className="w-full h-full" resizeMode="cover" />
        </TouchableOpacity>
        <TouchableOpacity className="w-[49%] h-[120px] rounded-xl relative overflow-hidden" onPress={() => onOpenPreview(item, 3)}>
          <Image source={{ uri: urls[3] }} className="w-full h-full rounded-xl" resizeMode="cover" />
          {count > 4 && (
            <View className="absolute inset-0 bg-black/40 items-center justify-center">
              <Text className="text-white text-xl font-extrabold">+{count - 3}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostMediaGallery;
