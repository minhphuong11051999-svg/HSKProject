# Luyện viết văn ứng dụng HSK6 (3.0)

Web động luyện viết văn ứng dụng HSK6: đăng ký/đăng nhập, làm bài luyện viết (đề mẫu + đề thi thật), lưu lịch sử bài làm, trang quản trị cho admin thêm/sửa bài học.

## Cấu trúc

```
backend/         Express + Prisma + PostgreSQL (REST API, JWT auth)
frontend/        React + Vite (giao diện người dùng)
legacy-static/   8 file HTML tĩnh cũ, giữ lại làm tài liệu nội dung tham khảo
```

## Chạy local

### Backend

```bash
cd backend
cp .env.example .env   # rồi điền DATABASE_URL (Postgres) + các secret
npm install
npm run prisma:migrate
npm run seed            # tạo tài khoản admin mẫu + dữ liệu bài học
npm run dev              # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL trỏ về backend ở trên
npm install
npm run dev              # http://localhost:5173
```

## Deploy

- **Frontend**: Netlify (build command `npm run build`, publish dir `dist`), biến môi trường `VITE_API_URL` trỏ sang backend đã deploy.
- **Backend**: Render.com (Web Service, auto-deploy từ GitHub).
- **Database**: Neon (PostgreSQL serverless, free tier).

Chi tiết schema dữ liệu và kế hoạch triển khai từng bước xem trong lịch sử trao đổi / plan đã thống nhất.
