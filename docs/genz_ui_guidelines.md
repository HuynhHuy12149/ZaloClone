# Hướng dẫn Thiết kế UI - Phong cách Gen Z (Gen Z Modern UI Guidelines)

Tài liệu này quy định các quy tắc thiết kế giao diện (UI) đã được áp dụng trên `ProfileScreen`. Mục tiêu là tạo ra một ngôn ngữ thiết kế đồng nhất, trẻ trung, hiện đại và chuẩn "Gen Z" cho toàn bộ ứng dụng ZaloClone. Bạn có thể sử dụng các quy tắc này để apply (áp dụng) cho những màn hình khác.

## 1. Triết lý Thiết kế (Design Philosophy)

- **Bo góc cực sâu (Deep Border Radius):** Mọi thứ đều được bo tròn mạnh để tạo cảm giác thân thiện, mềm mại. `borderRadius` tiêu chuẩn là từ `16` đến `24` cho các block, `40` cho hình ảnh lớn.
- **Nổi bật (Floating & Shadows):** Loại bỏ các đường kẻ cứng nhắc (hard borders) chạy ngang màn hình. Thay vào đó, gom nhóm nội dung vào các thẻ (Cards) có đổ bóng nhẹ (soft shadows) để làm nổi bật nội dung.
- **Typography cá tính (Bold Typography):** Tiêu đề và tên được nhấn mạnh với `fontWeight: '800'` và kích thước lớn, tạo ra sự rõ ràng, dễ đọc và rất "mạng xã hội".
- **Bento Box:** Sử dụng bố cục dạng lưới khối (Bento Grid) cho các tính năng/chức năng ngắn gọn thay vì dùng list thông thường.

---

## 2. Các Thành phần Core (Core Components & Styles)

### 2.1. Cấu trúc trang & Tiêu đề (Header & Layout)
- **Background:** Nền ngoài cùng nên sử dụng màu `c.bg` hoặc màu xám/trắng nhạt giúp các thẻ (Cards) bên trong nổi bật lên.
- **Header:** Đơn giản, không đường kẻ viền đáy.
  - Chữ tiêu đề: `fontSize: 28, fontWeight: '800', letterSpacing: -0.5`
  - Padding: `paddingHorizontal: 24`, khoảng không rộng rãi.

### 2.2. Khối Nhóm (Inset Grouped Lists)
Đừng dùng các thẻ danh sách kéo dài từ mép trái sang mép phải màn hình.
- **Container Style:** 
  - `backgroundColor: c.bgCard`
  - `borderRadius: 24`
  - `marginBottom: 16`
  - Bóng đổ (Soft shadow): `shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1`
- **Border:** Các đường kẻ ngang giữa các item trong khối sử dụng `borderBottomWidth: 1` với màu `c.border + '60'` (thêm độ trong suốt) và **item cuối cùng không có border**.

### 2.3. Bento Box (Khối lưới tính năng)
Thích hợp cho các "Quick Actions" hoặc danh sách công cụ ngắn.
- **Container:**
  - `flexDirection: 'row', flexWrap: 'wrap', gap: 12`
- **Từng ô bento:**
  - Chiều rộng: Tính toán theo màn hình `(width - 40 - 12) / 2` cho 2 cột.
  - `backgroundColor`: Dùng màu của app theme (`c.bgCard`) hoặc màu nhận diện với độ mờ 15% (ví dụ: `color + '15'`).
  - `borderRadius: 24, padding: 16`
- **Bento Icon Box:** 
  - `width: 48, height: 48, borderRadius: 16`
  - `backgroundColor: color + '30'` (Màu đậm hơn nền để tạo sự phân cấp).

### 2.4. Buttons (Nút bấm)
Sử dụng các loại nút mềm mại thay vì hình chữ nhật cứng:
- **Pill Button (Nút viên thuốc):**
  - Dùng cho các Call-to-action chính.
  - `borderRadius: 24`, `paddingHorizontal: 24, paddingVertical: 12`.
  - `fontWeight: '700'`.
- **Icon Button (Nút tròn chứa icon):**
  - `width: 46, height: 46, borderRadius: 23`
  - Cần thêm shadow nhẹ để nổi lên.
- **Large Action Button (Nút khối lớn - ví dụ: Đăng xuất):**
  - Chiếm gần hết chiều ngang, `borderRadius: 24`, `paddingVertical: 18`.
  - Dùng nền có độ trong suốt thấp (ví dụ: `#ff475715`) kèm chữ cùng tông màu.

### 2.5. Avatar & Profile Headers
Thay vì căn trái truyền thống, có thể căn giữa (Center-aligned) để giống các MXH hiện đại:
- **Avatar:** `width: 110, height: 110, borderRadius: 40` (Bo tròn siêu cong thay vì chỉ là hình tròn, hoặc hình tròn tuyệt đối nếu thích).
- Có đổ bóng chính màu nhấn (Accent) xuống avatar: `shadowColor: c.accent, shadowOpacity: 0.2, shadowRadius: 16`.
- **Badge (Nút camera sửa ảnh):** `absolute`, đè lên góc dưới avatar với viền bao quanh (Viền bằng màu nền của app để tạo hiệu ứng cắt - cut out).

---

## 3. Template Code Mẫu (Cheat Sheet)

### A. Khối Nhóm List (Inset Group)
```javascript
<View style={s.listGroup}>
  {items.map((item, index) => (
    <TouchableOpacity 
      key={index} 
      style={[s.item, index !== items.length - 1 && s.itemBorder]}
    >
       {/* Nội dung item */}
    </TouchableOpacity>
  ))}
</View>

// Styles:
listGroup: {
  backgroundColor: colors.bgCard,
  borderRadius: 24,
  marginBottom: 16,
  paddingVertical: 4,
  shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 1,
},
item: { paddingHorizontal: 16, paddingVertical: 12 },
itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border + '60' }
```

### B. Bento Box
```javascript
<View style={s.bentoContainer}>
  <TouchableOpacity style={[s.bentoBox, { backgroundColor: '#4ecdc415' }]}>
    <View style={[s.bentoIcon, { backgroundColor: '#4ecdc430' }]}>
      <Ionicons name="wallet" size={26} color="#4ecdc4" />
    </View>
    <Text style={s.bentoLabel}>Ví Zalo Pay</Text>
  </TouchableOpacity>
</View>

// Styles:
bentoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
bentoBox: { width: (width - 40 - 12) / 2, borderRadius: 24, padding: 16, backgroundColor: colors.bgCard },
bentoIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
bentoLabel: { fontSize: 15, fontWeight: '700' }
```

### C. Large Tinted Button
```javascript
<TouchableOpacity style={s.largeBtn}>
  <Text style={s.largeBtnText}>Đăng xuất</Text>
</TouchableOpacity>

// Styles:
largeBtn: {
  backgroundColor: '#ff475715',
  borderRadius: 24,
  paddingVertical: 18,
  alignItems: 'center', justifyContent: 'center',
},
largeBtnText: { fontSize: 16, fontWeight: '700', color: '#ff4757' }
```

Sử dụng tài liệu này làm kim chỉ nam khi tạo hoặc refactor các component/screens trong ZaloClone để tạo ra trải nghiệm thị giác nhất quán!
