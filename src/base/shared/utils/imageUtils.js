import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Nén và giảm dung lượng hình ảnh
 * @param {string} uri - URI của hình ảnh gốc
 * @returns {Promise<string>} - URI của hình ảnh đã xử lý
 */
export const compressImage = async (uri) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Giới hạn chiều rộng tối đa 1200px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Nén 70% chất lượng
    );
    return result.uri;
  } catch (error) {
    console.error('Lỗi khi nén ảnh:', error);
    return uri; // Trả về uri gốc nếu lỗi
  }
};
