# Quản lý điểm sinh viên

Ứng dụng HTML, CSS và JavaScript thuần. Dữ liệu mẫu gồm 30 sinh viên, 5 môn học và điểm thành phần trong thư mục `data/`.

## Chạy thử

- Mở thư mục bằng VS Code và chạy `index.html` với tiện ích Live Server; hoặc
- Đưa toàn bộ thư mục lên GitHub, bật **Settings → Pages → Deploy from a branch**, chọn nhánh `main` và thư mục `/ (root)`.

Không mở `index.html` bằng đường dẫn `file://`, vì trình duyệt chặn `fetch()` đọc JSON cục bộ.

## Chức năng

- Tìm kiếm và sắp xếp theo tên tiếng Việt (tên gọi trước, họ và tên đệm sau).
- Xem chi tiết và chỉnh sửa điểm chuyên cần, giữa kỳ, cuối kỳ; điểm hợp lệ từ 0 đến 10.
- Tự tính điểm môn theo công thức 0,1 × chuyên cần + 0,4 × giữa kỳ + 0,5 × cuối kỳ.
- Tính trung bình học kỳ bằng trung bình cộng 5 môn; xếp loại theo ngưỡng trong đề.
- Học bổng thường: từ 8,5 nhận 1.500.000 VNĐ; từ 8,0 nhận 1.000.000 VNĐ.
- Trang thống kê, so sánh hai sinh viên và phân bổ quỹ học bổng 100 triệu.

Điểm chỉnh sửa được lưu trong `localStorage` của trình duyệt để website tĩnh trên GitHub Pages vẫn hoạt động. Dữ liệu JSON gốc không bị ghi đè. Nếu xóa dữ liệu trang web/trình duyệt, các chỉnh sửa lưu cục bộ sẽ mất.
