# Firestore Setup Instructions

## Đã chuyển từ AsyncStorage sang Firebase Firestore

App hiện tại đã được cập nhật để lưu tất cả expenses vào Firebase Firestore thay vì AsyncStorage local. Điều này cho phép **tất cả người dùng xem được tất cả expense** mà ai đó đã upload.

## Cần làm gì tiếp theo:

### 1. Cấu hình Firestore Rules

Vào Firebase Console: https://console.firebase.google.com/project/spendeka-97ad5/firestore

1. Vào tab **"Rules"**
2. Thay đổi rules thành:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{document=**} {
      // Cho phép đọc và ghi công khai (tất cả mọi người)
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"** để lưu rules

⚠️ **Lưu ý**: Rules này cho phép **bất kỳ ai** cũng có thể đọc và ghi vào collection `expenses`. Nếu bạn muốn bảo mật hơn sau này, có thể thêm authentication và chỉ cho phép user đã đăng nhập.

### 2. Kiểm tra hoạt động

Sau khi setup rules:
- Upload một expense từ thiết bị A
- Mở app trên thiết bị B → bạn sẽ thấy expense từ thiết bị A
- Tất cả expenses sẽ được đồng bộ giữa các thiết bị

### 3. Migration dữ liệu cũ (nếu có)

Nếu bạn đã có dữ liệu trong AsyncStorage và muốn migrate sang Firestore, bạn có thể:
1. Export dữ liệu từ AsyncStorage
2. Import vào Firestore thủ công hoặc viết script migration

---

## Cách hoạt động:

- **Upload expense**: Ảnh upload lên Cloudinary → Metadata lưu vào Firestore collection `expenses`
- **Load expenses**: Lấy tất cả documents từ Firestore collection `expenses` → Hiển thị cho tất cả người dùng
- **Delete expense**: Xóa document khỏi Firestore → Tất cả người dùng sẽ không thấy expense đó nữa
