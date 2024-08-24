# DoAn_QLKS
## Giới thiệu
Mục tiêu chính của đồ án là xây dựng một hệ thống quản lý khách sạn hiện đại, thân thiện với người dùng và đáp ứng các nhu cầu cơ bản như quản lý phòng, quản lý khách hàng, dịch vụ, đặt phòng và còn tích hợp cả thanh toán trực tuyến giúp khách hàng giao dịch nhanh chóng và an toàn hơn. 

Hệ thống được phát triển bằng Python Django (backend), MySQL để lưu trữ dữ liệu  và ReactJS (frontend) nhằm dễ sử dụng và linh hoạt cho admin, khách hàng và các nhân viên.

## Hình ảnh website

## Cài Đặt và Sử Dụng
### Backend (Django)

1. Clone repository:   
```
git clone https://github.com/thanhlemm/DoAn_QLKS
```

2. Tạo và kích hoạt môi trường ảo:
```
python3 -m venv env
source env/bin/activate
```

3. Cài đặt các thư viện cần thiết:
```
 pip install -r requirements.txt
```

4. Thiết lập cơ sở dữ liệu: Tạo mới cơ sở dữ liệu với tên là: hoteldb
>Cập nhật mật khẩu và user name csdl trong file setting.py

```
python3 manage.py migrate
```

5. Chạy server:
```
python3 manage.py runserver
```


### Frontend (ReactJs)

1. Cài đặt 
```
npm install react react-dom

```

2. Chạy chương trình
```
npm start
```
