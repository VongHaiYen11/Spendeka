// Cloudinary Configuration
// 1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com/
// 2. Vào Dashboard để lấy Cloud Name
// 3. Vào Settings -> Upload -> Add upload preset (chọn Unsigned)

export const CLOUDINARY_CONFIG = {
  cloudName: 'dgrb3asof',      // Thay bằng cloud name của bạn
  uploadPreset: 'spendeka_images', // Tạo unsigned upload preset trong Settings
};

// URL để upload
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
