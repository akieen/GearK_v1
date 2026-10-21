# 🚀 GearK E-Commerce REST API Backend

Hệ thống API Backend hoàn chỉnh viết bằng **Node.js & Express**, kết nối trực tiếp với cơ sở dữ liệu MySQL `geark_db` chạy trên **localhost port 3306** (phpMyAdmin).

---

## 📋 Mục lục
1. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Cài đặt & Khởi chạy](#cài-đặt--khởi-chạy)
4. [Tài khoản mẫu dùng thử](#tài-khoản-mẫu-dùng-thử)
5. [Tài liệu API (Endpoints)](#tài-liệu-api-endpoints)

---

## 📁 Cấu trúc thư mục

```
Backend/
├── .env                  # Cấu hình môi trường (Port, MySQL, JWT)
├── .env.example          # Mẫu cấu hình môi trường
├── package.json          # Danh sách dependencies & npm scripts
├── README.md             # Hướng dẫn chi tiết
└── src/
    ├── app.js            # Khởi tạo Express, CORS, logging, routing
    ├── server.js         # Entry point kiểm tra kết nối DB và lắng nghe port 5000
    ├── config/
    │   └── db.js         # Kết nối MySQL Connection Pool (mysql2/promise)
    ├── middlewares/
    │   ├── auth.js       # Xác thực JWT & phân quyền Role (admin, staff, customer)
    │   └── errorHandler.js # Bắt lỗi tập trung và xử lý lỗi cú pháp / DB
    ├── controllers/
    │   ├── authController.js       # Đăng ký, đăng nhập, hồ sơ, quản lý user
    │   ├── productController.js    # Sản phẩm, lọc, tìm kiếm, variants, hình ảnh
    │   ├── categoryController.js   # Danh mục & cây danh mục
    │   ├── brandController.js      # Thương hiệu Gaming Gear
    │   ├── cartController.js       # Giỏ hàng & số lượng
    │   ├── orderController.js      # Đặt hàng, trừ kho, thanh toán, trạng thái
    │   ├── reviewController.js     # Đánh giá & nhận xét sản phẩm
    │   ├── couponController.js     # Mã giảm giá (voucher / coupon)
    │   ├── addressController.js    # Địa chỉ giao hàng của người dùng
    │   ├── wishlistController.js   # Sản phẩm yêu thích
    │   └── dashboardController.js  # Thống kê doanh thu, đơn hàng, kho cho Admin
    ├── routes/
    │   ├── index.js                # Tổng hợp các routes (/api)
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── categoryRoutes.js
    │   ├── brandRoutes.js
    │   ├── cartRoutes.js
    │   ├── orderRoutes.js
    │   ├── reviewRoutes.js
    │   ├── couponRoutes.js
    │   ├── addressRoutes.js
    │   ├── wishlistRoutes.js
    │   └── dashboardRoutes.js
    ├── seeds/
    │   └── seedData.js             # Dữ liệu mẫu (sản phẩm, tài khoản, danh mục)
    └── utils/
        └── helpers.js              # Tiện ích slugify, format response, order code
```

---

## ⚙️ Yêu cầu hệ thống

- **Node.js**: Phiên bản 18+ (đã kiểm tra tương thích Node v22.14.0)
- **MySQL / MariaDB**: Port `3306`
  - Đã import file `geark_db.sql` vào cơ sở dữ liệu `geark_db` qua phpMyAdmin:
  - `http://localhost/phpmyadmin/index.php?route=/database/structure&db=geark_db`

---

## 🚀 Cài đặt & Khởi chạy

### 1. Di chuyển vào thư mục backend
```bash
cd e:\GearK\Backend
```

### 2. Cài đặt các thư viện (đã cài đặt sẵn)
```bash
npm install
```

### 3. Cấu hình file `.env`
File `.env` đã được thiết lập sẵn với các thông số mặc định của XAMPP:
```ini
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=geark_db
DB_CONNECTION_LIMIT=10
JWT_SECRET=geark_jwt_secret_token_secure_key_2026
JWT_EXPIRES_IN=7d
```

### 4. Nạp dữ liệu mẫu (Seed Data)
Để tạo sẵn tài khoản test, thương hiệu, danh mục và các sản phẩm Gaming Gear thực tế:
```bash
npm run seed
```

### 5. Khởi động Server
- **Chế độ phát triển (Tự động reload khi sửa code - Nodemon):**
  ```bash
  npm run dev
  ```
- **Chế độ chạy thông thường:**
  ```bash
  npm start
  ```

Server sẽ chạy tại: **`http://localhost:5000`**

---

## 👥 Tài khoản mẫu dùng thử

Sau khi chạy lệnh `npm run seed`, bạn có thể dùng các tài khoản sau để test:

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@geark.vn` | `admin123` | Toàn quyền (Thêm/Sửa/Xóa SP, xem Dashboard thống kê, đổi trạng thái đơn) |
| **Staff** | `staff@geark.vn` | `staff123` | Quản lý sản phẩm, cập nhật đơn hàng |
| **Customer** | `customer@geark.vn` | `customer123` | Mua hàng, giỏ hàng, đặt hàng, viết đánh giá, wishlist |

---

## 📡 Danh sách API Endpoints

### 1. Kiểm tra trạng thái hệ thống
- `GET /api/health`: Kiểm tra kết nối tới MySQL database `geark_db`.

### 2. Xác thực & Người dùng (`/api/auth`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới (`full_name`, `email`, `password`) | Public |
| `POST` | `/api/auth/login` | Đăng nhập nhận JWT Token (`email`, `password`) | Public |
| `GET` | `/api/auth/profile` | Xem thông tin cá nhân | Đăng nhập |
| `PUT` | `/api/auth/profile` | Cập nhật họ tên, mật khẩu | Đăng nhập |
| `GET` | `/api/auth/users` | Lấy danh sách tất cả tài khoản | Admin |
| `PUT` | `/api/auth/users/:id/role` | Phân quyền tài khoản (`customer`, `staff`, `admin`) | Admin |

### 3. Sản phẩm (`/api/products`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Danh sách sản phẩm (Hỗ trợ phân trang, lọc theo danh mục, thương hiệu, giá, tìm kiếm keyword, sắp xếp) | Public |
| `GET` | `/api/products/:slug` | Chi tiết sản phẩm theo slug (kèm đầy đủ biến thể variants và hình ảnh) | Public |
| `GET` | `/api/products/id/:id` | Chi tiết sản phẩm theo id | Public |
| `POST` | `/api/products` | Thêm sản phẩm mới kèm các biến thể | Admin/Staff |
| `PUT` | `/api/products/:id` | Cập nhật thông tin sản phẩm | Admin/Staff |
| `DELETE` | `/api/products/:id` | Xóa / chuyển sản phẩm vào lưu trữ | Admin |
| `POST` | `/api/products/:id/variants` | Thêm phiên bản mới (màu, kích thước, switch) cho SP | Admin/Staff |
| `PUT` | `/api/products/variants/:variantId` | Sửa giá, tồn kho, cấu hình phiên bản | Admin/Staff |
| `DELETE` | `/api/products/variants/:variantId` | Xóa phiên bản | Admin |

**Các tham số Query của `GET /api/products`:**
- `page`: Trang hiện tại (mặc định: `1`)
- `limit`: Số sản phẩm mỗi trang (mặc định: `12`)
- `search`: Từ khóa tìm kiếm theo tên hoặc mô tả
- `category_slug` hoặc `category_id`: Lọc theo danh mục
- `brand_slug` hoặc `brand_id`: Lọc theo thương hiệu
- `min_price`, `max_price`: Lọc theo khoảng giá
- `sort`: `newest` (mới nhất), `price_asc` (giá tăng dần), `price_desc` (giá giảm dần), `rating` (đánh giá cao), `name_asc` (tên A-Z)

### 4. Danh mục & Thương hiệu (`/api/categories`, `/api/brands`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Lấy tất cả danh mục (thêm `?tree=true` để lấy dạng cây lồng nhau) | Public |
| `GET` | `/api/categories/:slug`| Xem chi tiết danh mục | Public |
| `POST` | `/api/categories` | Tạo danh mục mới | Admin |
| `PUT` | `/api/categories/:id` | Sửa danh mục | Admin |
| `DELETE` | `/api/categories/:id` | Xóa danh mục | Admin |
| `GET` | `/api/brands` | Lấy danh sách thương hiệu | Public |
| `GET` | `/api/brands/:slug` | Chi tiết thương hiệu | Public |
| `POST` | `/api/brands` | Thêm thương hiệu | Admin |
| `PUT` | `/api/brands/:id` | Sửa thương hiệu | Admin |
| `DELETE` | `/api/brands/:id` | Xóa thương hiệu | Admin |

### 5. Giỏ hàng (`/api/cart`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Lấy giỏ hàng của user đang đăng nhập kèm giá tạm tính | Đăng nhập |
| `POST` | `/api/cart/items` | Thêm vào giỏ (`variant_id`, `quantity`) - tự kiểm tra tồn kho | Đăng nhập |
| `PUT` | `/api/cart/items/:id` | Cập nhật số lượng sản phẩm trong giỏ | Đăng nhập |
| `DELETE` | `/api/cart/items/:id` | Xóa 1 mục khỏi giỏ hàng | Đăng nhập |
| `DELETE` | `/api/cart` | Xóa sạch toàn bộ giỏ hàng | Đăng nhập |

### 6. Đơn hàng (`/api/orders`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Đặt hàng từ giỏ hàng hoặc danh sách items tùy chọn (Tự động trừ kho, tính voucher, tạo lịch sử đơn) | Đăng nhập |
| `GET` | `/api/orders` | Xem danh sách đơn hàng đã đặt của bản thân | Đăng nhập |
| `GET` | `/api/orders/:codeOrId` | Xem chi tiết 1 đơn hàng (theo mã đơn hoặc ID) | Đăng nhập |
| `GET` | `/api/orders/admin/all` | Quản lý tất cả đơn hàng (lọc theo trạng thái, tìm mã đơn) | Admin/Staff |
| `PUT` | `/api/orders/:id/status` | Cập nhật trạng thái đơn hàng (`pending`, `confirmed`, `shipping`, `completed`, `cancelled`) | Admin/Staff |

### 7. Mã giảm giá (`/api/coupons`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/coupons/validate` | Kiểm tra mã voucher và tính tiền được giảm (`coupon_code`, `total_amount`) | Public |
| `GET` | `/api/coupons` | Xem danh sách mã giảm giá | Admin/Staff |
| `POST` | `/api/coupons` | Tạo mã giảm giá mới | Admin |
| `DELETE` | `/api/coupons/:id` | Xóa mã giảm giá | Admin |

### 8. Đánh giá sản phẩm (`/api/reviews`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews/product/:productId` | Lấy danh sách đánh giá của sản phẩm | Public |
| `POST` | `/api/reviews` | Gửi đánh giá (1-5 sao kèm nhận xét) | Đăng nhập |
| `DELETE` | `/api/reviews/:id` | Xóa nhận xét | Người viết / Admin |

### 9. Địa chỉ nhận hàng & Wishlist (`/api/addresses`, `/api/wishlist`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/addresses` | Lấy danh sách địa chỉ nhận hàng | Đăng nhập |
| `POST` | `/api/addresses` | Thêm địa chỉ nhận hàng mới | Đăng nhập |
| `PUT` | `/api/addresses/:id` | Cập nhật địa chỉ nhận hàng | Đăng nhập |
| `DELETE` | `/api/addresses/:id` | Xóa địa chỉ | Đăng nhập |
| `GET` | `/api/wishlist` | Xem danh sách yêu thích | Đăng nhập |
| `POST` | `/api/wishlist/toggle` | Thêm / xóa sản phẩm khỏi danh sách yêu thích | Đăng nhập |

### 10. Thống kê Dashboard (`/api/dashboard`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Thống kê tổng doanh thu, số đơn hàng, số user, danh sách sản phẩm sắp hết hàng (< 5 món), đơn hàng mới nhất | Admin/Staff |
