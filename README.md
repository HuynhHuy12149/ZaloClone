# 🚀 Zalo Clone Mobile App - Expo SDK 54 & Tailwind CSS (Base Framework)

Ứng dụng Zalo Clone được xây dựng trên nền tảng **React Native (Expo SDK 54)**, giao diện được tối ưu hóa 100% bằng **Tailwind CSS (NativeWind v4)** với kiến trúc **Base Framework Boilerplate** chuẩn doanh nghiệp, phục vụ làm nền tảng cốt lõi có thể tái sử dụng trực tiếp cho các dự án sau này.

---

## 📌 Công Nghệ & Thư Viện Sử Dụng

- **Framework**: [Expo SDK 54](https://docs.expo.dev/) (React Native 0.81.5)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) & [NativeWind v4](https://www.nativewind.dev/)
- **State Management**: [Zustand v5](https://github.com/pmndrs/zustand)
- **Backend / Database / Realtime**: [Supabase JS v2](https://supabase.com/docs/reference/javascript)
- **Media Upload**: [Cloudinary REST API](https://cloudinary.com/) & [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)
- **Audio Playback**: [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- **Navigation**: [React Navigation v7](https://reactnavigation.org/) (Native Stack + Bottom Tabs)
- **Bottom Sheet & Modals**: [@gorhom/bottom-sheet v5](https://gorhom.github.io/react-native-bottom-sheet/) & Custom Modals

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu hệ thống
- **Node.js**: >= 18.x (khuyến nghị Node 20 LTS)
- **Yarn** hoặc **npm**
- Ứng dụng **Expo Go** trên điện thoại (iOS / Android) hoặc Emulator/Simulator

### 2. Cài đặt Dependencies
```bash
# Clone repo về máy (nếu chưa có)
git clone <URL_REPO>
cd ZaloClone

# Cài đặt các gói phụ thuộc
npm install
```

### 3. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc với các thông số sau:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Cloudinary Configuration (Upload ảnh & video)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_API_KEY=your-api-key
EXPO_PUBLIC_CLOUDINARY_API_SECRET=your-api-secret
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset

# Goong Map API (Gợi ý địa điểm Check-in)
EXPO_PUBLIC_GOONG_MAP=your-goong-api-key
```

### 4. Khởi động ứng dụng
```bash
# Chạy Expo Dev Server
npm start

# Hoặc chạy trực tiếp trên Android / iOS
npm run android
npm run ios
```

---

## 📁 Cấu Trúc Thư Mục Chuẩn "Base Framework"

Cấu trúc thư mục tại `src/` chỉ gồm đúng **2 thư mục cốt lõi**: `base/` (hạ tầng nền tảng) và `screens/` (màn hình nghiệp vụ):

```text
src/
├── base/                              # 🏗️ NỀN TẢNG FRAMEWORK DỰ ÁN
│   ├── components/                    # 1. UI Components & Modals dùng chung
│   │   ├── Avatar.jsx                 # Avatar bo tròn / squircle
│   │   ├── ZaloHeader.js              # Header Zalo tìm kiếm
│   │   ├── CustomTabBar.js            # Bottom Tab Bar
│   │   ├── AnimatedTabBar.js          # Sub-tabs animation
│   │   ├── MenuControl.jsx            # Popover menu
│   │   └── modals/                    # EmojiPicker, FriendPicker, LocationPicker, MusicPicker, PrivacyPicker
│   │
│   ├── context/                       # 2. React Contexts độc lập (ThemeContext, SocketContext...)
│   │   └── ThemeContext.js            # Quản lý Dark / Light mode và animation
│   │
│   ├── navigation/                    # 3. Toàn bộ điều hướng & định tuyến
│   │   ├── MainNavigator.js           # Root Stack Navigator
│   │   ├── TabsNavigator.js           # 5 Tabs chính
│   │   └── Router.js                  # Modal & Sub-screens config
│   │
│   ├── services/                      # 4. Tầng API, SDKs & TanStack Query
│   │   ├── supabase.js                # Client Supabase
│   │   ├── cloudinary.js              # Client Cloudinary Upload
│   │   ├── supabaseProxy.js           # Proxy bọc query Supabase
│   │   ├── queryClient.js             # TanStack QueryClient cấu hình cho Mobile
│   │   └── queries/                   # Tầng API & Custom Hooks (Auth, Post, Message, Friend)
│   │       ├── useAuthQueries.js      # Auth API & Hooks
│   │       ├── usePostQueries.js      # Post & Comment API & Hooks
│   │       ├── useMessageQueries.js   # Chat & Realtime API & Hooks
│   │       └── useFriendQueries.js    # Friend API & Hooks
│   │
│   └── shared/                        # 5. Hệ thống phụ trợ
│       ├── enums/                     # Thư mục Enums riêng (postEnums.js, serverEndpoint.js)
│       ├── store/                     # Zustand store (authStore) & AsyncStorage Cache
│       ├── types/                     # apiResponse.js, mainType.ts
│       └── utils/                     # dateUtils, imageUtils
│
└── screens/                           # 📱 TOÀN BỘ MÀN HÌNH NGHIỆP VỤ (Đã làm phẳng)
    ├── auth/                          # login, register
    ├── home/                          # home-screen, post-detail, components/diary
    ├── message/                       # messages-screen, detail (khung chat & chat-input)
    ├── contact/                       # contacts-screen
    ├── discover/                      # discover-screen
    ├── profile/                       # profile-screen
    └── post/                          # create-post-screen
```

---

## 🎨 Cách Dùng Tailwind CSS (NativeWind) & Path Alias

### 1. Dùng Path Alias `@/*`
Trong bất kỳ file nào, bạn có thể import trực tiếp:
```javascript
import Avatar from '@/base/components/Avatar';
import { useTheme } from '@/base/context/ThemeContext';
import { getPosts } from '@/base/services/postService';
import { formatRelativeTime } from '@/base/shared/utils/dateUtils';
import { PostPrivacy } from '@/base/shared/enums/postEnums';
import { HomeScreen } from '@/screens/home';
```

### 2. Styling 100% bằng Tailwind CSS
```jsx
<View className="flex-1 bg-white dark:bg-zalo-darkCard p-4 rounded-3xl shadow-sm">
  <Text className="text-base font-bold text-black dark:text-white">
    Tiêu đề bài viết
  </Text>
</View>
```
