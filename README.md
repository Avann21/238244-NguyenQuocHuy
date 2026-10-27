# Hệ Thống Quản Lý Nhân Sự (HR Management System)

## I. Thông tin sinh viên
- **Họ và tên**: Nguyễn Quốc Huy
- **MSSV**: 238244
- **Lớp**: DH23TIN10

---

## II. Mô tả đề tài
Hệ thống quản lý nhân sự cho phép người dùng xem danh sách, tìm kiếm, thêm mới, xem chi tiết, cập nhật và xóa hồ sơ nhân viên.
- **Frontend**: React (Vite), giao diện tương thích responsive, thông báo trạng thái trực quan, modal xác nhận xóa an toàn.
- **Backend**: Node.js, Express REST API, xác thực dữ liệu đầu vào, kiểm tra trùng lặp mã nhân viên, có endpoint kiểm tra trạng thái `/health`.
- **Database**: MongoDB Atlas cluster, database `238244_NguyenQuocHuy`, collection `employees`.
- **Containerization**: Docker & Docker Hub.
- **Deployment**: Triển khai cloud trên nền tảng Render.

---

## III. Cấu trúc thư mục
```
238244_NguyenQuocHuy/
├── backend/
│   ├── models/
│   │   └── Employee.js       # Mongoose Schema nhân viên
│   ├── routes/
│   │   └── employeeRoutes.js # REST API CRUD và Search
│   ├── .dockerignore
│   ├── .env.example          # Mẫu biến môi trường
│   ├── Dockerfile            # Đóng gói Docker Backend
│   ├── package.json
│   ├── seed.js               # Script nạp 3 nhân viên mẫu
│   └── server.js             # Entry point Express server & /health
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Giao diện chính quản lý nhân viên
│   │   ├── App.css           # Định kiểu giao diện hiện đại
│   │   └── main.jsx          # Entry point React
│   ├── .dockerignore
│   ├── .env.example          # Cấu hình VITE_API_BASE_URL
│   ├── Dockerfile            # Đóng gói Docker Multi-stage + Nginx
│   ├── index.html
│   ├── nginx.conf            # Cấu hình Nginx phục vụ SPA
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## IV. Bảng nộp bài (6 Đường link)

| STT | Hạng mục | Đường link |
|---|---|---|
| 1 | **GitHub Repository** | https://github.com/huy238244/238244-NguyenQuocHuy |
| 2 | **Docker Hub Backend** | https://hub.docker.com/r/quochuy238244h/backend |
| 3 | **Docker Hub Frontend** | https://hub.docker.com/r/quochuy238244h/frontend |
| 4 | **Render App (Frontend)** | https://web-238244.onrender.com |
| 5 | **Render API (Backend)** | https://api-238244.onrender.com |
| 6 | **MongoDB Atlas** | `mongodb+srv://...` *(đã cấu hình trong biến môi trường Render)* |

---

## V. Hướng dẫn chạy cục bộ (Local Development)

### 1. Backend
```bash
cd backend
# Tạo file .env dựa trên .env.example và điền chuỗi kết nối MongoDB Atlas:
# PORT=5000
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/238244_NguyenQuocHuy?retryWrites=true&w=majority

npm install
# Nạp 3 nhân viên mẫu vào MongoDB Atlas:
npm run seed
# Chạy server API:
npm start
```
- Endpoint API danh sách: `http://localhost:5000/api/employees`
- Endpoint Health check: `http://localhost:5000/health`

### 2. Frontend
```bash
cd frontend
# Tạo file .env với:
# VITE_API_BASE_URL=http://localhost:5000

npm install
npm run dev
```
Ứng dụng React sẽ chạy tại: `http://localhost:3000`
