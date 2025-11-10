# Hướng dẫn cấu hình PayOS cho thanh toán đơn thuốc

## Bước 1: Đăng ký tài khoản PayOS

1. Truy cập https://payos.vn
2. Đăng ký tài khoản doanh nghiệp
3. Hoàn tất xác thực KYC

## Bước 2: Lấy thông tin API

Sau khi đăng nhập PayOS Dashboard:

1. Vào **Cài đặt** → **API Keys**
2. Copy các thông tin sau:
   - **Client ID**
   - **API Key**
   - **Checksum Key**

## Bước 3: Cập nhật biến môi trường

Mở file `.env` và cập nhật các giá trị:

```env
PAYOS_CLIENT_ID=your_actual_client_id
PAYOS_API_KEY=your_actual_api_key
PAYOS_CHECKSUM_KEY=your_actual_checksum_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Lưu ý:** Trong production, thay `http://localhost:3000` bằng domain thực tế của bạn.

## Bước 4: Cấu hình Webhook (để nhận thông báo thanh toán)

Trong PayOS Dashboard:

1. Vào **Cài đặt** → **Webhooks**
2. Thêm URL webhook: `https://your-domain.com/api/payment/webhook`
3. Chọn các sự kiện:
   - Payment success
   - Payment failed
4. Lưu cấu hình

## Bước 5: Test thanh toán

1. Khởi động lại server: `pnpm run dev`
2. Truy cập `/staff/prescriptions/[id]`
3. Click nút **Thanh toán**
4. Sẽ chuyển hướng đến trang thanh toán PayOS
5. Sử dụng thẻ test để thanh toán

### Thẻ test của PayOS:

```
Số thẻ: 9704 0000 0000 0018
Tên: NGUYEN VAN A
Ngày hết hạn: 03/07
OTP: 123456
```

## Cách hoạt động

1. **Tạo thanh toán**: Khi nhấn nút "Thanh toán", hệ thống gọi API `/api/payment/create`
2. **Chuyển hướng**: User được chuyển đến trang PayOS để thanh toán
3. **Thanh toán**: User thanh toán bằng QR, thẻ, hoặc ví điện tử
4. **Callback**: PayOS gửi webhook đến `/api/payment/webhook`
5. **Cập nhật**: Hệ thống tự động cập nhật trạng thái đơn thuốc thành "Đã hoàn thành"
6. **Quay về**: User được chuyển về trang chi tiết đơn thuốc

## Tính năng đã tích hợp

✅ Tạo link thanh toán tự động
✅ Hỗ trợ nhiều phương thức: QR, thẻ, ví
✅ Webhook tự động cập nhật trạng thái
✅ Bảo mật với checksum verification
✅ Lưu mã đơn hàng để tra cứu

## Lưu ý quan trọng

- **Giá tiền hiện tại**: Đang tính 50,000 VNĐ/thuốc (cần cập nhật theo giá thực tế)
- **Production**: Nhớ thay đổi `NEXT_PUBLIC_BASE_URL` sang domain thật
- **Webhook**: Cần domain public để PayOS gọi webhook được

## Cập nhật giá thuốc

Để thay đổi cách tính giá, sửa file `/app/(role)/staff/prescriptions/[id]/page.tsx`:

```typescript
// Thay vì tính theo số lượng thuốc
const total = prescription.medicines.length * 50000;

// Có thể lấy giá từ database
const total = prescription.medicines.reduce((sum, med) => {
  return sum + (med.medicine.price || 0);
}, 0);
```

## Hỗ trợ

- Tài liệu PayOS: https://payos.vn/docs
- Hỗ trợ kỹ thuật: support@payos.vn
