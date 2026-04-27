/**
 * Enum cho các chế độ quyền riêng tư của bài viết
 * Khớp với kiểu dữ liệu ENUM trong Database Supabase
 */
export const PostPrivacy = {
  PUBLIC: 'Public',
  FRIENDS: 'Friends',
  PRIVATE: 'Private',
};

/**
 * Mapping để hiển thị Tiếng Việt tương ứng với Enum
 */
export const PrivacyLabels = {
  [PostPrivacy.PUBLIC]: 'Công khai',
  [PostPrivacy.FRIENDS]: 'Bạn bè',
  [PostPrivacy.PRIVATE]: 'Chỉ mình tôi',
};

/**
 * Các lựa chọn cho giao diện Picker
 */
export const PrivacyOptions = [
  { 
    label: PrivacyLabels[PostPrivacy.PUBLIC], 
    value: PostPrivacy.PUBLIC, 
    icon: 'earth-outline', 
    desc: 'Tất cả mọi người trên Zalo' 
  },
  { 
    label: PrivacyLabels[PostPrivacy.FRIENDS], 
    value: PostPrivacy.FRIENDS, 
    icon: 'people-outline', 
    desc: 'Chỉ bạn bè của bạn xem được' 
  },
  { 
    label: PrivacyLabels[PostPrivacy.PRIVATE], 
    value: PostPrivacy.PRIVATE, 
    icon: 'lock-closed-outline', 
  },
];

/**
 * Các loại cảm xúc cho bài viết
 */
export const REACTIONS = [
  { id: 'like', label: 'Thích', emoji: '👍' },
  { id: 'heart', label: 'Yêu thích', emoji: '❤️' },
  { id: 'haha', label: 'Haha', emoji: '😂' },
  { id: 'wow', label: 'Wow', emoji: '😮' },
  { id: 'sad', label: 'Buồn', emoji: '😢' },
  { id: 'angry', label: 'Phẫn nộ', emoji: '😡' },
];

export const getReactionById = (id) => REACTIONS.find(r => r.id === id) || REACTIONS[0];
