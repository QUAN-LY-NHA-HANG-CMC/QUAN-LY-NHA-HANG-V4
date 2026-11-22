# ============================================================================
# DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN QR TẠI BÀN (QUÁN MỘC POS & E-MENU)
# DOCKERFILE: MÔI TRƯỜNG ẢO CONTAINER TỰ ĐỘNG VẬN HÀNH 100% NHƯ MÁY CHỦ THỰC TẾ
# ============================================================================

# --- GIAI ĐOẠN 1: BIÊN DỊCH GIAO DIỆN FRONTEND REACT + VITE ---
FROM node:22-alpine AS build-frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- GIAI ĐOẠN 2: RUNTIME MÁY CHỦ SẢN XUẤT (BACKEND + SPA + SQLITE) ---
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV CONG_BACKEND=3001
ENV DB_PATH=/app/data/coSoDuLieu.sqlite

# Cài đặt các thư viện backend
COPY package*.json ./
RUN npm ci --omit=dev

# Sao chép mã nguồn backend và cơ sở dữ liệu
COPY backend/ ./backend/
COPY scripts/khoiTaoQuanLy.js ./scripts/khoiTaoQuanLy.js
COPY database/ ./database/

# Sao chép gói giao diện đã build từ Giai đoạn 1 vào thư mục frontend/dist
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Tạo thư mục logs và sao lưu nếu chưa có
RUN mkdir -p logs database/saoLuu

# Đảm bảo CSDL được khởi tạo nếu chưa có
RUN mkdir -p /app/data

# Mở cổng dịch vụ duy nhất phục vụ toàn bộ 5 phân hệ
EXPOSE 3001

# Lệnh khởi chạy chính thức
CMD ["node", "backend/mayChu.js"]
