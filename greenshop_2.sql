DROP TABLE IF EXISTS blog_votes CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS shopping_cart_entry CASCADE;
DROP TABLE IF EXISTS shopping_carts CASCADE;
DROP TABLE IF EXISTS order_detail CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_details CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS policies CASCADE;

CREATE TABLE role (
   id      BIGSERIAL PRIMARY KEY,
   name    VARCHAR(50) NOT NULL UNIQUE
            CHECK (name IN ('CUSTOMER','MANAGER','SHIPPER','SUPPORT_AGENT','SYSTEM_ADMIN'))
);

-- ============================================================

CREATE TABLE users (
   id          BIGSERIAL PRIMARY KEY,
   role_id     BIGINT NOT NULL DEFAULT 1 REFERENCES role(id),
   email       VARCHAR(150) NOT NULL UNIQUE,
   password    VARCHAR(255),
   full_name   VARCHAR(150) NOT NULL,
   phone       VARCHAR(20),
   status      BOOLEAN NOT NULL DEFAULT TRUE,
   created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ============================================================

CREATE TABLE categories (
   id          BIGSERIAL PRIMARY KEY,
   name        VARCHAR(100) NOT NULL UNIQUE,
   description TEXT
,
   parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL);

-- ============================================================

CREATE TABLE products (
   id          BIGSERIAL PRIMARY KEY,
   category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
   name        VARCHAR(200) NOT NULL,
   price       DECIMAL(15,2) NOT NULL CHECK (price >= 0),
   stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
   sku         VARCHAR(50) NOT NULL UNIQUE,
   status      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku      ON products(sku);

-- ============================================================

CREATE TABLE product_details (
   id          BIGSERIAL PRIMARY KEY,
   product_id  BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
   description TEXT,
   images      JSON
);

-- ============================================================

CREATE TABLE orders (
   id               BIGSERIAL PRIMARY KEY,
   customer_id      BIGINT NOT NULL REFERENCES users(id),
   shipper_id BIGINT REFERENCES users(id),
   shipping_address TEXT,
   shipping_fee     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
   discount         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
   status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PROCESSING','PENDING','DELIVERING','ARRIVED','RECEIVED','RETURN_PROCESSING','RETURN_PENDING','RETURNING','FAILED')),
   created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   delivery_date    TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at DESC);

-- ============================================================

CREATE TABLE order_detail (
   order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
   product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
   quantity    INT NOT NULL CHECK (quantity > 0),
   price_paid  DECIMAL(15,2) NOT NULL,
   PRIMARY KEY (order_id, product_id)
);

-- ============================================================

CREATE TABLE shopping_carts (
   id          BIGSERIAL PRIMARY KEY,
   customer_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE shopping_cart_entry (
   cart_id     BIGINT NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
   product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
   quantity    INT NOT NULL CHECK (quantity > 0),
   PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE wishlist_items (
   customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
   PRIMARY KEY (customer_id, product_id)
);

-- ============================================================

CREATE TABLE reviews (
   id          BIGSERIAL PRIMARY KEY,
   order_id    BIGINT NOT NULL REFERENCES orders(id) ,
   product_id BIGINT NOT NULL REFERENCES products(id)ON DELETE CASCADE,
   customer_id BIGINT NOT NULL REFERENCES users(id),
   rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
   comment     TEXT,
   created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   is_curated  BOOLEAN NOT NULL DEFAULT FALSE,
   is_hidden   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_reviews_order    ON reviews(order_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);

-- ============================================================

CREATE TABLE tickets (
   id           BIGSERIAL PRIMARY KEY,
   creator_id   BIGINT NOT NULL REFERENCES users(id),
   assignee_id  BIGINT REFERENCES users(id),
   title        VARCHAR(255) NOT NULL,
   detail       TEXT NOT NULL,
   state        VARCHAR(20) NOT NULL DEFAULT 'CREATED'
                CHECK (state IN ('CREATED','PROCESSING','RESOLVED','DONE')),
   priority     VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
                CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
   time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   time_resolved TIMESTAMP
);

CREATE INDEX idx_tickets_creator  ON tickets(creator_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_state    ON tickets(state);

-- ============================================================

CREATE TABLE comments (
   id           BIGSERIAL PRIMARY KEY,
   ticket_id    BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
   creator_id   BIGINT NOT NULL REFERENCES users(id),
   detail       TEXT NOT NULL,
   time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_ticket ON comments(ticket_id);

-- ============================================================

CREATE TABLE policies (
   id          BIGSERIAL PRIMARY KEY,
   title       VARCHAR(300) NOT NULL,
   description TEXT NOT NULL,
   status      VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
   updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO policies (title, description, status) VALUES
('Chính sách Đổi trả & Hoàn tiền', '## 1. Điều kiện đổi trả
- Cây bị dập nát, héo úa, gãy cành hoặc chết trong quá trình vận chuyển.
- Giao sai loại cây, sai kích thước hoặc thiếu phụ kiện so với đơn đặt hàng.
- Khách hàng cần thông báo và gửi hình ảnh/video tình trạng cây trong vòng **3 ngày** kể từ khi nhận hàng.

## 2. Các trường hợp không hỗ trợ đổi trả
- Cây chết hoặc héo úa do khách hàng chăm sóc sai cách (tưới quá nhiều nước, để sai vị trí thiếu sáng/quá nắng,...).
- Sản phẩm phụ kiện đã qua sử dụng hoặc không còn nguyên vẹn bao bì.

## 3. Quy trình hoàn tiền
- **Thời gian xử lý:** Từ 3-5 ngày làm việc sau khi Greenshop xác nhận yêu cầu hợp lệ.
- **Phương thức hoàn tiền:** Chuyển khoản ngân hàng hoặc ví điện tử theo thông tin khách hàng cung cấp.', 'PUBLISHED'),
('Chính sách Vận chuyển & Giao hàng', '## 1. Thời gian giao hàng
- **Nội thành:** Giao hàng trong vòng 1-2 ngày làm việc.
- **Ngoại tỉnh/Toàn quốc:** Giao hàng từ 3-5 ngày làm việc tùy thuộc vào đơn vị vận chuyển.

## 2. Chi phí vận chuyển
- **Phí tiêu chuẩn:** 30.000 VNĐ cho các đơn hàng thông thường.
- **Miễn phí vận chuyển (Freeship):** Áp dụng cho mọi đơn hàng có giá trị từ **500.000 VNĐ** trở lên.

## 3. Quy cách đóng gói cây xanh
- Cây luôn được bọc màng bảo vệ chuyên dụng xung quanh tán lá.
- Bầu đất được quấn màng bọc nilon để tránh rơi vãi đất và giữ ẩm.
- Cây được cố định chắc chắn trong thùng carton hộp chữ nhật hoặc khung gỗ (đối với cây lớn) để chống sốc và chống lật.', 'PUBLISHED'),
('Chính sách Bảo hành Cây xanh', '## 1. Thời gian bảo hành
Tất cả các loại cây xanh mua tại **Greenshop** đều được bảo hành sức khỏe trong vòng **7 ngày** đầu kể từ khi nhận hàng.

## 2. Hỗ trợ trọn đời
- Chúng tôi cung cấp dịch vụ **tư vấn chăm sóc cây miễn phí trọn đời**. 
- Bất cứ khi nào cây của bạn có dấu hiệu bất thường (vàng lá, rụng lá, nấm mốc,...), hãy chụp ảnh và gửi qua kênh chat hoặc Zalo của cửa hàng để được đội ngũ kỹ thuật hỗ trợ kịp thời.

## 3. Thay cây mới
Nếu cây bị chết trong thời gian bảo hành do nguyên nhân bệnh lý có sẵn từ nhà vườn (được xác nhận bởi kỹ thuật viên của chúng tôi), Greenshop sẽ **1 đổi 1** cây mới cùng loại cho bạn.', 'PUBLISHED'),
('Chính sách Bảo mật Thông tin', '## 1. Mục đích thu thập thông tin
Greenshop thu thập thông tin cá nhân (Họ tên, Số điện thoại, Địa chỉ, Email) của khách hàng chỉ nhằm mục đích:
- Xử lý đơn đặt hàng và giao hàng.
- Cung cấp dịch vụ hỗ trợ khách hàng và giải quyết khiếu nại.
- Gửi thông tin khuyến mãi, ưu đãi dành cho khách hàng thân thiết (nếu khách hàng đăng ký nhận tin).

## 2. Cam kết bảo mật
- Mọi thông tin của khách hàng được bảo mật tuyệt đối trên hệ thống máy chủ của chúng tôi.
- **Greenshop cam kết không bán, trao đổi hay chia sẻ** thông tin của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại, ngoại trừ việc cung cấp địa chỉ cho đơn vị vận chuyển.

## 3. Quyền của khách hàng
Khách hàng có quyền yêu cầu Greenshop kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bất cứ lúc nào.', 'PUBLISHED'),
('Chính sách Khách hàng Thân thiết', '## 1. Tích điểm thưởng
- Cứ mỗi **10.000 VNĐ** giá trị đơn hàng được thanh toán thành công, khách hàng sẽ tích lũy được **1 điểm**.
- Điểm thưởng được tự động cộng vào tài khoản sau khi đơn hàng chuyển sang trạng thái "Giao hàng thành công".

## 2. Quy đổi và Ưu đãi
- Điểm thưởng có thể được dùng để quy đổi thành **Mã giảm giá** cho các lần mua sắm tiếp theo.
- Khách hàng có ngày sinh nhật trong tháng sẽ nhận được Voucher giảm giá **20%** cho một đơn hàng bất kỳ.

## 3. Hạng thành viên
- **Thành viên Bạc:** Tổng chi tiêu trên 2.000.000 VNĐ - Giảm thêm 5% mọi đơn hàng.
- **Thành viên Vàng:** Tổng chi tiêu trên 5.000.000 VNĐ - Giảm thêm 10% mọi đơn hàng + Quà tặng kèm theo mùa.', 'PUBLISHED'),
('Chính sách Thanh toán', '## 1. Các phương thức thanh toán
Greenshop hiện đang hỗ trợ các phương thức thanh toán linh hoạt và an toàn:
- **Thanh toán khi nhận hàng (COD):** Khách hàng kiểm tra hàng và thanh toán trực tiếp cho nhân viên giao hàng.
- **Chuyển khoản ngân hàng:** Khách hàng chuyển khoản qua Internet Banking vào số tài khoản của cửa hàng.
- **Thanh toán qua Ví điện tử:** Hỗ trợ thanh toán qua VNPay, Momo, ZaloPay tiện lợi.

## 2. Quy định thanh toán đối với đơn hàng lớn
Đối với các đơn hàng có giá trị lớn hơn **2.000.000 VNĐ** hoặc các đơn hàng đặt thiết kế thi công tiểu cảnh, khách hàng vui lòng đặt cọc trước **30%** giá trị đơn hàng. 

## 3. Bảo mật thanh toán
Tất cả các giao dịch trực tuyến qua thẻ hay ví điện tử đều được mã hóa an toàn theo tiêu chuẩn SSL, đảm bảo không rò rỉ dữ liệu tài chính của khách hàng.', 'PUBLISHED');

-- ============================================================
--  THÊM BẢNG BLOG
-- ============================================================

CREATE TABLE blog_posts (
   id           BIGSERIAL PRIMARY KEY,
   author_id    BIGINT NOT NULL REFERENCES users(id),
   title        VARCHAR(300) NOT NULL,
   content      TEXT NOT NULL,
   thumbnail    TEXT,
   is_published BOOLEAN NOT NULL DEFAULT FALSE,
   created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_author    ON blog_posts(author_id);
CREATE INDEX idx_blog_published ON blog_posts(is_published);

-- ============================================================
--  DỮ LIỆU MẪU
-- ============================================================

-- ROLES (đã có từ trước, bỏ qua nếu đã chạy)
INSERT INTO role (name) VALUES
   ('CUSTOMER'), ('MANAGER'), ('SHIPPER'), ('SUPPORT_AGENT'), ('SYSTEM_ADMIN');


-- ============================================================
--  USERS — 10 người
-- ============================================================
INSERT INTO users (role_id, email, password, full_name, phone, status) VALUES
(5, 'admin@greenshop.vn',   '$2a$10$zUuzRUvsOH8nimZ/6lsPjulnRHrSvOzYJBTTi4oHlOqWgHzt4a6qW', 'Nguyễn Văn Admin',    '0901000001', TRUE),
(2, 'manager@greenshop.vn', '$2a$10$A9Q6dl4y.iQJP17qh9bhO.iNLk6rXYJgRPsaRLdftmv6SBfqIiE2a', 'Trần Thị Manager',    '0901000002', TRUE),
(3, 'shipper1@greenshop.vn','$2a$10$v/Tois3Yz7/IUAjX1xa8zucglisqqtzIDMxkx8w8UZfDgEM2/DQ0i', 'Lê Văn Shipper',      '0901000003', TRUE),
(4, 'support@greenshop.vn', '$2a$10$WD9TzMIoFF2HeQ2i8mg9COIf8o7MY.jlAo3mR58q1ASMduxLxwIoe', 'Phạm Thị Support',    '0901000004', TRUE),
(1, 'khach1@gmail.com',     '$2a$10$bYepmqDIFtLHufQ39FhQxuX2dhPeUtzDcvf0868FSOgyGpCf0lhmi', 'Hoàng Minh Tuấn',     '0912345601', TRUE),
(1, 'khach2@gmail.com',     '$2a$10$uSQpjK3zgkNtvaCz4daxt.jlbT7p05zWykHz2qqtCff4tfIjKw5dm', 'Nguyễn Thị Lan',      '0912345602', TRUE),
(1, 'khach3@gmail.com',     '$2a$10$6C6K1VVzL3AU1awnFwIs/erFeGnZa2afajieslO/VWhUUPADeW2re', 'Vũ Đức Thành',        '0912345603', TRUE),
(1, 'khach4@gmail.com',     '$2a$10$DSoyFP33CagNeomlF.gUteBOxPzTICRHfWtwlg0jD6i.wDfUuqDDm', 'Đặng Thu Hương',      '0912345604', TRUE),
(1, 'khach5@gmail.com',     '$2a$10$cIjhGxmnba.JgJcr7qi9a.Q25KOvM0O2tucA3l7gpQueqNbyQN6gG', 'Bùi Quang Huy',       '0912345605', TRUE),
(1, 'khach6@gmail.com',     '$2a$10$lLkYkek4Cc39DHC4WVnWJuKWVJS1nOSmHVdxYYfobuEjxVcbM57f2','Lý Thị Mai',          '0912345606', TRUE);

-- ============================================================
--  CATEGORIES — 6 danh mục
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Cây trong nhà',   'Các loại cây phù hợp trồng trong nhà, ít cần ánh sáng'),
('Cây ngoài trời',  'Các loại cây phù hợp trồng ngoài ban công, sân vườn'),
('Cây để bàn',      'Cây nhỏ gọn trang trí bàn làm việc'),
('Sen đá & Xương rồng', 'Các loại cây mọng nước dễ chăm sóc'),
('Cây phong thủy',  'Cây mang ý nghĩa phong thủy, may mắn'),
('Phụ kiện',        'Chậu cây, đất trồng, phân bón và dụng cụ làm vườn');

-- ============================================================
--  PRODUCTS — 100 sản phẩm
-- ============================================================
INSERT INTO products (category_id, name, price, stock, sku, status) VALUES
-- Cây trong nhà (category 1)
(1, 'Cây Trầu Bà Xanh',           85000,  50, 'SKU-001', TRUE),
(1, 'Cây Lưỡi Hổ Nhỏ',            95000,  45, 'SKU-002', TRUE),
(1, 'Cây Kim Tiền',               120000,  60, 'SKU-003', TRUE),
(1, 'Cây Phát Lộc',               150000,  40, 'SKU-004', TRUE),
(1, 'Cây Dây Leo Pothos',          75000,  80, 'SKU-005', TRUE),
(1, 'Cây Monstera Nhỏ',           250000,  30, 'SKU-006', TRUE),
(1, 'Cây Trầu Bà Vàng',            90000,  55, 'SKU-007', TRUE),
(1, 'Cây Dracaena Xanh',          180000,  25, 'SKU-008', TRUE),
(1, 'Cây Ficus Nhỏ',              160000,  35, 'SKU-009', TRUE),
(1, 'Cây Bóng Nước',               65000,  70, 'SKU-010', TRUE),
(1, 'Cây Lan Ý Trắng',            130000,  42, 'SKU-011', TRUE),
(1, 'Cây Cọ Cảnh Mini',           220000,  20, 'SKU-012', TRUE),
(1, 'Cây Trầu Bà Đỏ',             110000,  48, 'SKU-013', TRUE),
(1, 'Cây ZZ Plant',               195000,  28, 'SKU-014', TRUE),
(1, 'Cây Calathea Hoa Văn',       280000,  15, 'SKU-015', TRUE),
(1, 'Cây Dương Xỉ Boston',        145000,  38, 'SKU-016', TRUE),
(1, 'Cây Rubber Plant',           320000,  18, 'SKU-017', TRUE),
(1, 'Cây Spider Plant',            80000,  65, 'SKU-018', TRUE),
(1, 'Cây Anthurium Đỏ',           350000,  12, 'SKU-019', TRUE),
(1, 'Cây Peace Lily Lớn',         420000,  10, 'SKU-020', TRUE),

-- Cây ngoài trời (category 2)
(2, 'Cây Hoa Hồng Đỏ',           180000,  35, 'SKU-021', TRUE),
(2, 'Cây Hoa Cúc Vàng',           95000,  50, 'SKU-022', TRUE),
(2, 'Cây Hoa Nhài',              120000,  45, 'SKU-023', TRUE),
(2, 'Cây Hoa Giấy Đỏ',           150000,  40, 'SKU-024', TRUE),
(2, 'Cây Hoa Lan Vàng',          380000,  15, 'SKU-025', TRUE),
(2, 'Cây Hoa Tigôn',             130000,  42, 'SKU-026', TRUE),
(2, 'Cây Hoa Tường Vi',          160000,  30, 'SKU-027', TRUE),
(2, 'Cây Hoa Lavender',          220000,  25, 'SKU-028', TRUE),
(2, 'Cây Hoa Sứ Trắng',          350000,  18, 'SKU-029', TRUE),
(2, 'Cây Trúc Nhật',             140000,  55, 'SKU-030', TRUE),
(2, 'Cây Sanh Bonsai Mini',      450000,  10, 'SKU-031', TRUE),
(2, 'Cây Hoa Mai Vàng',          520000,   8, 'SKU-032', TRUE),
(2, 'Cây Hoa Đào Mini',          480000,   8, 'SKU-033', TRUE),
(2, 'Cây Ngâu',                  175000,  32, 'SKU-034', TRUE),
(2, 'Cây Hoa Mộc',               195000,  28, 'SKU-035', TRUE),

-- Cây để bàn (category 3)
(3, 'Cây Xương Rồng Bàn',         55000,  90, 'SKU-036', TRUE),
(3, 'Cây Sen Đá Mix',             65000,  85, 'SKU-037', TRUE),
(3, 'Cây Kim Ngân Bàn',           95000,  60, 'SKU-038', TRUE),
(3, 'Cây Lưỡi Hổ Mini',           75000,  70, 'SKU-039', TRUE),
(3, 'Cây Pothos Mini',             60000,  80, 'SKU-040', TRUE),
(3, 'Cây Tre Lucky Bamboo',       110000,  55, 'SKU-041', TRUE),
(3, 'Cây Phú Quý Mini',            85000,  65, 'SKU-042', TRUE),
(3, 'Cây Cẩm Thạch Bàn',         125000,  45, 'SKU-043', TRUE),
(3, 'Cây Thanh Long Mini',         70000,  75, 'SKU-044', TRUE),
(3, 'Cây Peperomia Tròn',          90000,  58, 'SKU-045', TRUE),
(3, 'Cây Haworthia Mini',         105000,  50, 'SKU-046', TRUE),
(3, 'Cây Hoya Tim',               145000,  35, 'SKU-047', TRUE),
(3, 'Cây Pilea Tròn',             115000,  48, 'SKU-048', TRUE),
(3, 'Cây String of Pearls',       160000,  28, 'SKU-049', TRUE),
(3, 'Cây Cactus Mix Bàn',          50000, 100, 'SKU-050', TRUE),

-- Sen đá & Xương rồng (category 4)
(4, 'Sen Đá Echeveria Hồng',       45000, 120, 'SKU-051', TRUE),
(4, 'Sen Đá Echeveria Tím',        45000, 115, 'SKU-052', TRUE),
(4, 'Sen Đá Echeveria Xanh',       40000, 130, 'SKU-053', TRUE),
(4, 'Sen Đá Haworthia Sọc',        55000, 100, 'SKU-054', TRUE),
(4, 'Sen Đá Crassula Jade',        60000,  90, 'SKU-055', TRUE),
(4, 'Sen Đá Aloe Mini',            50000, 110, 'SKU-056', TRUE),
(4, 'Xương Rồng Cầu Vàng',         65000,  95, 'SKU-057', TRUE),
(4, 'Xương Rồng Cột',              75000,  80, 'SKU-058', TRUE),
(4, 'Xương Rồng Tai Thỏ',          55000, 105, 'SKU-059', TRUE),
(4, 'Xương Rồng Hoa Đỏ',           85000,  70, 'SKU-060', TRUE),
(4, 'Sen Đá Sedum Mix',            35000, 150, 'SKU-061', TRUE),
(4, 'Sen Đá Aeonium Đen',          95000,  55, 'SKU-062', TRUE),
(4, 'Xương Rồng Thanh Long Mini',  70000,  85, 'SKU-063', TRUE),
(4, 'Sen Đá Hộp Mix 5 cây',       150000,  40, 'SKU-064', TRUE),
(4, 'Xương Rồng San Hô',           80000,  75, 'SKU-065', TRUE),

-- Cây phong thủy (category 5)
(5, 'Cây Kim Tiền Phong Thủy',    180000,  40, 'SKU-066', TRUE),
(5, 'Cây Kim Ngân Phong Thủy',    220000,  35, 'SKU-067', TRUE),
(5, 'Cây Phát Lộc Phong Thủy',    195000,  38, 'SKU-068', TRUE),
(5, 'Cây Trúc Phú Quý',           250000,  25, 'SKU-069', TRUE),
(5, 'Cây Vạn Lộc',               170000,  42, 'SKU-070', TRUE),
(5, 'Cây Cẩm Thạch Đứng',        280000,  20, 'SKU-071', TRUE),
(5, 'Cây Thiết Mộc Lan',          320000,  15, 'SKU-072', TRUE),
(5, 'Cây Sung Bonsai',            450000,  10, 'SKU-073', TRUE),
(5, 'Cây Hạnh Phúc',             160000,  45, 'SKU-074', TRUE),
(5, 'Cây Đại Phú Gia',           380000,  12, 'SKU-075', TRUE),

-- Phụ kiện (category 6)
(6, 'Chậu Nhựa Tròn Nhỏ',         25000, 200, 'SKU-076', TRUE),
(6, 'Chậu Nhựa Tròn Vừa',         45000, 150, 'SKU-077', TRUE),
(6, 'Chậu Đất Nung Nhỏ',           55000, 120, 'SKU-078', TRUE),
(6, 'Chậu Đất Nung Vừa',           85000, 100, 'SKU-079', TRUE),
(6, 'Chậu Sứ Trắng Nhỏ',           65000, 110, 'SKU-080', TRUE),
(6, 'Chậu Sứ Trắng Vừa',           95000,  90, 'SKU-081', TRUE),
(6, 'Chậu Treo Nhựa',              35000, 180, 'SKU-082', TRUE),
(6, 'Đất Trồng Cây Thông Dụng 5L', 45000, 160, 'SKU-083', TRUE),
(6, 'Đất Trồng Sen Đá 3L',         55000, 140, 'SKU-084', TRUE),
(6, 'Phân Bón Lá Hữu Cơ',          65000, 130, 'SKU-085', TRUE),
(6, 'Phân NPK Tổng Hợp',           75000, 120, 'SKU-086', TRUE),
(6, 'Bình Tưới Nhỏ 1L',            45000, 150, 'SKU-087', TRUE),
(6, 'Bình Tưới Vừa 3L',            65000, 120, 'SKU-088', TRUE),
(6, 'Kéo Cắt Tỉa Cây',             85000,  90, 'SKU-089', TRUE),
(6, 'Bộ Dụng Cụ Làm Vườn Mini',   120000,  70, 'SKU-090', TRUE),
(6, 'Chậu Xi Măng Thủ Công',      145000,  50, 'SKU-091', TRUE),
(6, 'Giá Đỡ Cây Gỗ',             195000,  40, 'SKU-092', TRUE),
(6, 'Lưới Che Nắng 2x3m',         120000,  60, 'SKU-093', TRUE),
(6, 'Thuốc Trừ Sâu Hữu Cơ',        55000, 110, 'SKU-094', TRUE),
(6, 'Que Đo Độ Ẩm Đất',            85000,  80, 'SKU-095', TRUE),
(6, 'Chậu Nhựa Vuông Nhỏ',         30000, 170, 'SKU-096', TRUE),
(6, 'Đá Bọt Thoát Nước 1kg',       35000, 160, 'SKU-097', TRUE),
(6, 'Phân Trùn Quế 2kg',           65000, 130, 'SKU-098', TRUE),
(6, 'Bình Xịt Phun Sương 500ml',   45000, 140, 'SKU-099', TRUE),
(6, 'Chậu Nhựa Treo Hàng Rào',     55000, 120, 'SKU-100', TRUE);

-- ============================================================
--  PRODUCT DETAILS — 100 bản ghi
-- ============================================================
INSERT INTO product_details (product_id, description, images) VALUES
(1,  'Trầu bà xanh dễ chăm, chịu bóng tốt, lọc không khí hiệu quả. Phù hợp để bàn hoặc góc phòng.', '["traubaxanh_1.jpg","traubaxanh_2.jpg"]'),
(2,  'Lưỡi hổ nhỏ thanh lịch, chịu hạn tốt, phù hợp người bận rộn ít có thời gian chăm cây.', '["luoiho_1.jpg","luoiho_2.jpg"]'),
(3,  'Cây kim tiền mang lại may mắn tài lộc, lá tròn xanh bóng đẹp mắt, dễ trồng trong nhà.', '["kimtien_1.jpg","kimtien_2.jpg"]'),
(4,  'Cây phát lộc thân thẳng mọc từ bẹ lá, biểu tượng phát tài phát lộc trong phong thủy.', '["phatLoc_1.jpg"]'),
(5,  'Pothos dây leo mềm mại, lá tim xanh vàng, có thể để treo hoặc đặt bàn để tua rua.', '["pothos_1.jpg","pothos_2.jpg"]'),
(6,  'Monstera lá xẻ độc đáo, biểu tượng của nội thất hiện đại, phù hợp góc phòng khách.', '["monstera_1.jpg","monstera_2.jpg","monstera_3.jpg"]'),
(7,  'Trầu bà vàng lá xanh vàng xen kẽ bắt mắt, sinh trưởng nhanh, dễ nhân giống.', '["traubavang_1.jpg"]'),
(8,  'Dracaena thân thẳng lá dài xanh đậm, phù hợp góc phòng, văn phòng công sở.', '["dracaena_1.jpg","dracaena_2.jpg"]'),
(9,  'Ficus nhỏ tán tròn đẹp, lá bóng xanh, phù hợp trang trí bàn tiếp khách.', '["ficus_1.jpg"]'),
(10, 'Cây bóng nước thân mọng nước, lá xanh bóng, cực dễ chăm, tưới ít vẫn sống tốt.', '["bongnuoc_1.jpg"]'),
(11, 'Lan ý hoa trắng thanh tao, lọc không khí tốt, thích hợp phòng ngủ phòng làm việc.', '["lanY_1.jpg","lanY_2.jpg"]'),
(12, 'Cọ cảnh mini dáng sang trọng, phù hợp trang trí sảnh, phòng khách cao cấp.', '["cocanhMini_1.jpg"]'),
(13, 'Trầu bà đỏ lá đỏ tía nổi bật, tạo điểm nhấn màu sắc cho không gian sống.', '["traubaDo_1.jpg"]'),
(14, 'ZZ Plant cực chịu bóng và chịu hạn, lá bóng xanh đẹp, phù hợp văn phòng ít sáng.', '["zzplant_1.jpg","zzplant_2.jpg"]'),
(15, 'Calathea hoa văn lá đẹp như tranh vẽ, mỗi lá một hoa văn độc đáo, cây trang trí cao cấp.', '["calathea_1.jpg","calathea_2.jpg"]'),
(16, 'Dương xỉ Boston lá rủ mềm mại, phù hợp treo hoặc đặt trên giá để tạo không gian xanh.', '["duongXi_1.jpg"]'),
(17, 'Rubber Plant lá to bóng đỏ đen huyền bí, cây to khỏe phù hợp góc phòng khách lớn.', '["rubberPlant_1.jpg","rubberPlant_2.jpg"]'),
(18, 'Spider Plant lá xanh sọc trắng, tạo con nhiều, dễ nhân giống, phù hợp người mới chơi cây.', '["spiderPlant_1.jpg"]'),
(19, 'Anthurium đỏ hoa bền màu sắc rực rỡ, biểu tượng của sự nhiệt huyết và may mắn.', '["anthurium_1.jpg","anthurium_2.jpg"]'),
(20, 'Peace Lily lớn hoa trắng sang trọng, lọc không khí cực tốt, phù hợp phòng ngủ.', '["peaceLily_1.jpg","peaceLily_2.jpg"]'),
(21, 'Hoa hồng đỏ kinh điển thơm ngát, biểu tượng tình yêu, phù hợp trang trí sân vườn ban công.', '["hoaHong_1.jpg","hoaHong_2.jpg"]'),
(22, 'Hoa cúc vàng rực rỡ, nở bền, phù hợp trang trí ban công hoặc làm quà tặng.', '["hoaCuc_1.jpg"]'),
(23, 'Hoa nhài thơm dịu, hoa trắng tinh khiết, phù hợp trồng ban công hoặc sân thượng.', '["hoaNhai_1.jpg"]'),
(24, 'Hoa giấy đỏ rực rỡ, leo giàn đẹp, phù hợp trang trí cổng nhà, hàng rào, ban công.', '["hoaGiay_1.jpg","hoaGiay_2.jpg"]'),
(25, 'Lan vàng hoa sang trọng quý phái, phù hợp làm quà tặng khai trương, sự kiện quan trọng.', '["lanVang_1.jpg","lanVang_2.jpg"]'),
(26, 'Hoa tigôn leo giàn hoa nhỏ hồng xinh, phủ kín giàn tạo không gian lãng mạn.', '["tigon_1.jpg"]'),
(27, 'Hoa tường vi leo giàn hoa nhỏ nhiều màu, phù hợp trang trí hàng rào sân vườn.', '["tuongVi_1.jpg"]'),
(28, 'Lavender tím thơm dịu, đuổi muỗi tự nhiên, phù hợp trồng ban công hoặc cửa sổ.', '["lavender_1.jpg","lavender_2.jpg"]'),
(29, 'Hoa sứ trắng thanh tao hương thơm nhẹ nhàng, phù hợp trồng sân vườn hoặc ban công lớn.', '["hoaSu_1.jpg"]'),
(30, 'Trúc nhật lá nhỏ xanh mướt, phù hợp trồng hàng rào hoặc trang trí sân vườn.', '["trucNhat_1.jpg"]'),
(31, 'Sanh bonsai mini dáng đẹp uốn lượn nghệ thuật, phù hợp để bàn làm việc hoặc kệ trang trí.', '["sanhBonsai_1.jpg","sanhBonsai_2.jpg"]'),
(32, 'Mai vàng bonsai mini cánh vàng rực rỡ, biểu tượng may mắn ngày Tết.', '["maiVang_1.jpg","maiVang_2.jpg"]'),
(33, 'Hoa đào mini cánh hồng dịu dàng, biểu tượng mùa xuân phương Bắc.', '["hoaDào_1.jpg"]'),
(34, 'Cây ngâu hoa vàng thơm ngát, phù hợp trồng sân vườn, biểu tượng may mắn.', '["ngau_1.jpg"]'),
(35, 'Hoa mộc hương thơm đặc trưng, hoa trắng nhỏ li ti, phù hợp sân vườn ban công.', '["hoaMoc_1.jpg"]'),
(36, 'Xương rồng để bàn hình cầu đẹp, dễ chăm, phù hợp trang trí bàn làm việc.', '["xuongRongBan_1.jpg"]'),
(37, 'Combo sen đá mix nhiều màu đẹp mắt, phù hợp trang trí bàn học bàn làm việc.', '["senDaMix_1.jpg","senDaMix_2.jpg"]'),
(38, 'Kim ngân bàn lá xanh bóng nhỏ gọn, mang lại tài lộc, phù hợp để bàn làm việc.', '["kimNganBan_1.jpg"]'),
(39, 'Lưỡi hổ mini cực nhỏ gọn, có thể đặt trên bàn phím, cửa sổ nhỏ.', '["luoiHoMini_1.jpg"]'),
(40, 'Pothos mini để bàn lá xanh tươi, tưới ít, phù hợp văn phòng bận rộn.', '["pothosMini_1.jpg"]'),
(41, 'Tre lucky bamboo thân thẳng xanh mướt, biểu tượng may mắn bền lâu trong phong thủy.', '["luckyBamboo_1.jpg","luckyBamboo_2.jpg"]'),
(42, 'Cây phú quý mini lá đẹp bóng xanh, mang lại phú quý sung túc cho gia chủ.', '["phuQuy_1.jpg"]'),
(43, 'Cẩm thạch bàn lá xanh đậm sọc vàng thanh lịch, phù hợp trang trí bàn tiếp khách.', '["camThach_1.jpg"]'),
(44, 'Thanh long mini cảnh dáng thẳng độc đáo, dễ chăm, phù hợp bàn làm việc.', '["thanhLongMini_1.jpg"]'),
(45, 'Peperomia tròn lá dày mọng nước, chịu hạn tốt, nhiều màu sắc đẹp mắt.', '["peperomia_1.jpg","peperomia_2.jpg"]'),
(46, 'Haworthia mini lá cứng hoa văn đẹp, chịu bóng tốt, phù hợp bàn làm việc ít sáng.', '["haworthia_1.jpg"]'),
(47, 'Hoya tim lá hình trái tim độc đáo, leo giàn hoặc để treo tạo điểm nhấn.', '["hoyaTim_1.jpg","hoyaTim_2.jpg"]'),
(48, 'Pilea tròn lá tròn xanh bóng như đồng xu, biểu tượng may mắn tài lộc.', '["pilea_1.jpg"]'),
(49, 'String of Pearls lá hình hạt ngọc độc đáo, thích hợp treo tạo màn lá ấn tượng.', '["stringOfPearls_1.jpg","stringOfPearls_2.jpg"]'),
(50, 'Combo cactus mix để bàn nhiều hình dáng độc đáo, phù hợp trang trí bàn làm việc.', '["cactusMix_1.jpg"]'),
(51, 'Sen đá Echeveria hồng cánh hoa xếp tầng đẹp như hoa hồng thu nhỏ.', '["echeveriaHong_1.jpg","echeveriaHong_2.jpg"]'),
(52, 'Sen đá Echeveria tím màu tím xanh huyền bí, phù hợp trang trí bàn học.', '["echeveriaTim_1.jpg"]'),
(53, 'Sen đá Echeveria xanh lá xanh mướt tươi mát, dễ trồng phù hợp người mới.', '["echeveriaXanh_1.jpg"]'),
(54, 'Haworthia sọc lá cứng sọc trắng đặc trưng, chịu bóng xuất sắc.', '["haworthiaSoc_1.jpg"]'),
(55, 'Crassula Jade lá xanh dày mọng, biểu tượng may mắn tài lộc trong phong thủy.', '["crassula_1.jpg","crassula_2.jpg"]'),
(56, 'Aloe mini lá dày có gai nhỏ, nhựa lô hội dưỡng da, đa công dụng.', '["aloeMini_1.jpg"]'),
(57, 'Xương rồng cầu vàng hình cầu tròn đẹp, gai vàng nổi bật, dễ chăm.', '["caulVang_1.jpg","cauVang_2.jpg"]'),
(58, 'Xương rồng cột thân cột thẳng cao, phù hợp trang trí góc phòng hoặc sân vườn.', '["xuongRongCot_1.jpg"]'),
(59, 'Xương rồng tai thỏ hình dáng độc đáo như tai thỏ, màu xanh mướt dễ thương.', '["taiTho_1.jpg","taiTho_2.jpg"]'),
(60, 'Xương rồng hoa đỏ nở hoa đỏ rực rỡ theo mùa, tạo điểm nhấn bắt mắt.', '["xuongRongHoa_1.jpg"]'),
(61, 'Sedum mix combo nhiều loại sedum màu sắc đa dạng, phù hợp làm vườn mini.', '["sedumMix_1.jpg"]'),
(62, 'Aeonium đen lá đen huyền bí độc đáo, điểm nhấn ấn tượng trong bộ sưu tập sen đá.', '["aeoniumDen_1.jpg","aeoniumDen_2.jpg"]'),
(63, 'Thanh long mini cảnh cây nhỏ gọn dễ chăm, phù hợp ban công nhỏ.', '["thanhLongMiniSD_1.jpg"]'),
(64, 'Hộp sen đá mix 5 cây nhiều màu được chọn lọc kỹ, phù hợp làm quà tặng.', '["hopSenDa_1.jpg","hopSenDa_2.jpg"]'),
(65, 'Xương rồng san hô hình dáng phân nhánh như san hô biển, độc đáo và lạ mắt.', '["sanHo_1.jpg"]'),
(66, 'Kim tiền phong thủy lá tròn xanh bóng, trồng trong chậu đẹp mang lại tài lộc.', '["kimTienPT_1.jpg","kimTienPT_2.jpg"]'),
(67, 'Kim ngân phong thủy thân xoắn biểu tượng may mắn, phù hợp để bàn làm việc.', '["kimNganPT_1.jpg"]'),
(68, 'Phát lộc phong thủy chậu đẹp sang trọng, phù hợp làm quà tặng khai trương.', '["phatLocPT_1.jpg","phatLocPT_2.jpg"]'),
(69, 'Trúc phú quý thân thẳng xanh mướt, biểu tượng phú quý thịnh vượng lâu dài.', '["trucPhuQuy_1.jpg"]'),
(70, 'Cây vạn lộc lá xanh bóng đẹp, mang lại vạn điều may mắn cho gia chủ.', '["vanLoc_1.jpg"]'),
(71, 'Cẩm thạch đứng dáng thẳng thanh lịch, lá xanh đậm sọc vàng nổi bật.', '["camThachDung_1.jpg","camThachDung_2.jpg"]'),
(72, 'Thiết mộc lan hoa nhỏ thơm ngát đặc trưng, mang lại vượng khí cho không gian.', '["thietMocLan_1.jpg"]'),
(73, 'Sung bonsai quả đỏ sum suê biểu tượng sung túc đủ đầy, phù hợp phong thủy.', '["sungBonsai_1.jpg","sungBonsai_2.jpg"]'),
(74, 'Cây hạnh phúc lá xanh mướt tươi tốt, biểu tượng gia đình hạnh phúc bền vững.', '["hanhPhuc_1.jpg"]'),
(75, 'Đại phú gia cây to lớn sang trọng, phù hợp trang trí sảnh công ty biệt thự.', '["daiPhuGia_1.jpg","daiPhuGia_2.jpg"]'),
(76, 'Chậu nhựa tròn nhỏ nhẹ bền chắc, nhiều màu sắc, phù hợp cây nhỏ để bàn.', '["chauNhuaNho_1.jpg"]'),
(77, 'Chậu nhựa tròn vừa dày dặn bền bỉ, phù hợp các loại cây cảnh vừa và nhỏ.', '["chauNhuaVua_1.jpg"]'),
(78, 'Chậu đất nung nhỏ thoáng khí tốt cho rễ cây, phù hợp sen đá xương rồng.', '["chauDatNungNho_1.jpg"]'),
(79, 'Chậu đất nung vừa thoát nước tốt, phù hợp cây cảnh trong nhà và ngoài trời.', '["chauDatNungVua_1.jpg"]'),
(80, 'Chậu sứ trắng nhỏ sang trọng tinh tế, phù hợp trang trí nội thất hiện đại.', '["chauSuTrangNho_1.jpg"]'),
(81, 'Chậu sứ trắng vừa cao cấp sang trọng, tôn lên vẻ đẹp của mọi loại cây cảnh.', '["chauSuTrangVua_1.jpg","chauSuTrangVua_2.jpg"]'),
(82, 'Chậu treo nhựa nhẹ có lỗ thoát nước, phù hợp cây dây leo treo ban công.', '["chauTreo_1.jpg"]'),
(83, 'Đất trồng thông dụng 5L đã xử lý sạch, tơi xốp, phù hợp mọi loại cây cảnh.', '["datTrong_1.jpg"]'),
(84, 'Đất trồng sen đá 3L thoát nước tốt pha sẵn cát, phù hợp sen đá xương rồng.', '["datSenDa_1.jpg"]'),
(85, 'Phân bón lá hữu cơ an toàn tự nhiên, giúp lá cây xanh bóng đẹp hơn.', '["phanBonLa_1.jpg"]'),
(86, 'Phân NPK tổng hợp đầy đủ dinh dưỡng, phù hợp bón gốc cho mọi loại cây cảnh.', '["phanNPK_1.jpg"]'),
(87, 'Bình tưới nhỏ 1L vòi dài tiện tưới cây trong nhà, nhẹ dễ sử dụng.', '["binhTuoiNho_1.jpg"]'),
(88, 'Bình tưới vừa 3L dung tích lớn hơn, phù hợp tưới nhiều cây hoặc cây to.', '["binhTuoiVua_1.jpg"]'),
(89, 'Kéo cắt tỉa cây lưỡi thép không gỉ sắc bén, cán nhựa chống trơn dễ cầm.', '["keoTia_1.jpg"]'),
(90, 'Bộ dụng cụ làm vườn mini 5 món xẻng bay kéo tưới, phù hợp vườn mini trong nhà.', '["boLamVuon_1.jpg","boLamVuon_2.jpg"]'),
(91, 'Chậu xi măng thủ công độc đáo handmade, phong cách rustic, mỗi cái một kiểu riêng.', '["chauXiMang_1.jpg","chauXiMang_2.jpg"]'),
(92, 'Giá đỡ cây gỗ tự nhiên thiết kế tối giản, phù hợp nội thất Bắc Âu hiện đại.', '["giaDoGo_1.jpg"]'),
(93, 'Lưới che nắng 2x3m che 70% ánh nắng, bảo vệ cây khỏi nắng gắt mùa hè.', '["luoiCheNang_1.jpg"]'),
(94, 'Thuốc trừ sâu hữu cơ an toàn cho người vật nuôi, diệt sâu bệnh hiệu quả.', '["thuocTruSau_1.jpg"]'),
(95, 'Que đo độ ẩm đất giúp biết chính xác khi nào cần tưới, tránh tưới thừa thiếu.', '["queDoAmDat_1.jpg"]'),
(96, 'Chậu nhựa vuông nhỏ thiết kế vuông vắn hiện đại, phù hợp xếp thành dãy.', '["chauVuong_1.jpg"]'),
(97, 'Đá bọt 1kg thoát nước và thông khí tốt cho rễ, dùng lót đáy chậu rất hiệu quả.', '["daBotLot_1.jpg"]'),
(98, 'Phân trùn quế 2kg hữu cơ tự nhiên giàu dinh dưỡng, an toàn cho cây và đất.', '["phanTrunQue_1.jpg"]'),
(99, 'Bình xịt phun sương 500ml phun mịn đều, phù hợp làm ẩm lá cây trong nhà.', '["binhXitSuong_1.jpg"]'),
(100,'Chậu nhựa treo hàng rào thiết kế riêng gắn hàng rào, phù hợp trồng hoa ban công.', '["chauTreoHangRao_1.jpg"]');

-- ============================================================
--  BLOG POSTS — 10 bài viết
-- ============================================================
INSERT INTO blog_posts (author_id, title, content, thumbnail, is_published) VALUES
(2, 'Top 10 cây trong nhà dễ chăm nhất cho người bận rộn',
'Bạn yêu cây nhưng không có nhiều thời gian chăm sóc? Đây là danh sách 10 loại cây cực dễ chăm: Lưỡi hổ, ZZ Plant, Pothos, Trầu bà... Những loại cây này chỉ cần tưới 1-2 lần mỗi tuần, chịu bóng tốt và vẫn phát triển khỏe mạnh.',
'top10_cay_de_cham.jpg', TRUE),

(2, 'Hướng dẫn chăm sóc sen đá cho người mới bắt đầu',
'Sen đá là lựa chọn hoàn hảo cho người mới chơi cây. Bài viết này hướng dẫn chi tiết: cách chọn đất, tưới nước đúng cách, chọn vị trí đặt cây, và cách nhân giống sen đá tại nhà đơn giản.',
'cham_soc_sen_da.jpg', TRUE),

(2, 'Cây phong thủy nào phù hợp với từng không gian trong nhà?',
'Mỗi góc trong nhà đều có một loại cây phong thủy phù hợp. Phòng khách nên đặt cây gì? Phòng ngủ thì sao? Bài viết giải đáp chi tiết dựa trên nguyên lý phong thủy truyền thống.',
'cay_phong_thuy.jpg', TRUE),

(2, 'Tại sao lá cây bị vàng và cách khắc phục',
'Lá vàng là dấu hiệu cây đang cần giúp đỡ. Nguyên nhân phổ biến gồm: tưới quá nhiều, thiếu ánh sáng, thiếu dinh dưỡng hoặc sâu bệnh. Bài viết phân tích từng trường hợp và cách xử lý hiệu quả.',
'la_cay_vang.jpg', TRUE),

(2, 'Cách tạo góc xanh đẹp cho phòng làm việc tại nhà',
'Work from home trở nên dễ chịu hơn rất nhiều khi có cây xanh xung quanh. Bài viết gợi ý các loại cây phù hợp bàn làm việc, cách sắp xếp để vừa đẹp vừa không chiếm diện tích.',
'goc_xanh_wfh.jpg', TRUE),

(2, 'Monstera - Nữ hoàng của cây trang trí nội thất',
'Monstera đang là xu hướng trang trí nội thất hot nhất hiện nay. Bài viết giới thiệu các loại Monstera phổ biến, cách chăm sóc và tại sao loại cây này lại được yêu thích đến vậy.',
'monstera_queen.jpg', TRUE),

(2, 'Hướng dẫn nhân giống cây tại nhà - Đơn giản hơn bạn nghĩ',
'Nhân giống cây tại nhà giúp bạn có thêm nhiều cây mà không tốn tiền. Bài viết hướng dẫn 3 phương pháp: giâm cành, tách bụi và chiết cành, áp dụng được cho hầu hết cây cảnh phổ biến.',
'nhan_giong_cay.jpg', TRUE),

(2, 'Xương rồng và sen đá - Bộ đôi hoàn hảo cho không gian nhỏ',
'Với không gian sống ngày càng thu hẹp, xương rồng và sen đá là giải pháp tuyệt vời. Bài viết giới thiệu cách tạo vườn mini terrarium đẹp mắt chỉ với vài loại sen đá và xương rồng.',
'xuong_rong_sen_da.jpg', TRUE),

(2, 'Chọn chậu cây đúng cách - Yếu tố quan trọng ít ai biết',
'Chậu cây không chỉ để đựng đất mà còn ảnh hưởng trực tiếp đến sức khỏe cây. Bài viết so sánh các loại chậu: chậu đất nung, chậu nhựa, chậu sứ - ưu nhược điểm và phù hợp với loại cây nào.',
'chon_chau_cay.jpg', TRUE),

(2, 'Top 5 loại cây lọc không khí tốt nhất cho gia đình',
'NASA đã nghiên cứu và chứng minh nhiều loại cây có khả năng lọc các chất độc hại trong không khí. Bài viết điểm danh top 5 loại cây hiệu quả nhất: Lan ý, Lưỡi hổ, Dây leo vàng, Peace Lily và Dracaena.',
'cay_loc_khong_khi.jpg', TRUE);

-- ============================================================
--  SHOPPING CARTS — tạo cart cho 6 customer
-- ============================================================
INSERT INTO shopping_carts (customer_id) VALUES (5),(6),(7),(8),(9),(10);

-- ============================================================
--  SHOPPING CART ENTRIES
-- ============================================================
INSERT INTO shopping_cart_entry (cart_id, product_id, quantity) VALUES
(1, 3,  2),
(1, 51, 3),
(1, 76, 1),
(2, 6,  1),
(2, 28, 2),
(3, 14, 1),
(3, 83, 2),
(4, 41, 1),
(4, 64, 1),
(5, 17, 1),
(6, 22, 3),
(6, 84, 2);

-- ============================================================
--  ORDERS — 8 đơn hàng
-- ============================================================
INSERT INTO orders (customer_id, shipper_id, shipping_address, shipping_fee, discount, status) VALUES
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 0,      'DELIVERING'),
(6,  3, '45 Lê Lợi, Quận Hải Châu, Đà Nẵng',        30000, 15000,  'DELIVERING'),
(7,  3, '78 Hoàn Kiếm, Hà Nội',                     30000, 0,      'ARRIVED'),
(8,  NULL,'22 Trần Phú, Nha Trang, Khánh Hòa',      30000, 0,      'PROCESSING'),
(9,  NULL,'55 Lý Thường Kiệt, Huế',                 30000, 20000,  'PENDING'),
(10, NULL,'99 Nguyễn Huệ, Cần Thơ',                 30000, 0,      'PENDING'),
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 0,      'DELIVERING'),
(6,  NULL,'45 Lê Lợi, Quận Hải Châu, Đà Nẵng',      30000, 10000,  'PROCESSING'),
-- Extra orders for khach1 (customer_id 5)
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 5000,   'RECEIVED'),
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 0,      'RECEIVED'),
(5,  NULL,'123 Nguyễn Trãi, Quận 1, TP.HCM',        30000, 0,      'PENDING'),
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 15000,  'ARRIVED'),
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 0,      'RETURN_PENDING'),
(5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',          30000, 10000,  'RECEIVED');

-- ============================================================
--  ORDER DETAILS
-- ============================================================
INSERT INTO order_detail (order_id, product_id, quantity, price_paid) VALUES
(1, 3,   2, 120000),
(1, 76,  1,  25000),
(2, 6,   1, 250000),
(2, 83,  1,  45000),
(3, 14,  1, 195000),
(3, 28,  1, 220000),
(4, 41,  2, 110000),
(5, 17,  1, 320000),
(5, 84,  2,  55000),
(6, 22,  3,  95000),
(7, 3,   1, 120000),
(7, 51,  2,  45000),
(8,  64,  1, 150000),
(8,  98,  1,  65000),
-- Extra order_details for khach1
(9,  11,  2, 130000),
(9,  12,  1, 220000),
(10, 24,  1, 150000),
(10, 25,  2, 380000),
(11, 31,  1, 450000),
(11, 32,  1, 520000),
(12, 44,  5,  70000),
(12, 45,  3,  90000),
(13, 58,  2,  75000),
(13, 59,  1,  55000),
(14, 76,  4,  25000),
(14, 77,  2,  45000);

-- ============================================================
--  REVIEWS
-- ============================================================
INSERT INTO reviews (order_id, product_id, customer_id, rating, comment, is_curated) VALUES
(1, 3, 5, 5, 'Cây đẹp đúng như mô tả, đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!', TRUE),
(1, 76, 5, 4, 'Chậu đẹp, chất lượng tốt, giá hợp lý. Sẽ mua lại lần sau.', TRUE),
(2, 6, 6, 5, 'Monstera đẹp lắm, lá to khỏe, không bị dập nát khi vận chuyển. 5 sao!', TRUE),
(3, 14, 7, 4, 'ZZ Plant khỏe mạnh, đúng size, tuy nhiên chậu hơi nhỏ so với cây.', TRUE),
(7, 3, 5, 5, 'Mua lần 2 vẫn rất hài lòng, kim tiền lên nhanh tốt lắm!', TRUE),
(9, 11, 5, 5, 'Cây Sanh Bonsai dáng rất nghệ thuật, giao nhanh.', TRUE),
(10, 24, 5, 3, 'Hoa giấy hơi nhỏ so với ảnh chụp nhưng bù lại cây khá tươi.', FALSE);

-- ============================================================
--  TICKETS
-- ============================================================
INSERT INTO tickets (creator_id, assignee_id, title, detail, state, priority) VALUES
(5,  4, 'Cây bị héo sau 2 ngày nhận hàng', 'Tôi nhận cây kim tiền nhưng sau 2 ngày lá bắt đầu héo vàng, không biết do vận chuyển hay cây bệnh.', 'PROCESSING', 'HIGH'),
(6,  4, 'Đơn hàng giao sai sản phẩm',       'Tôi đặt Monstera nhỏ nhưng nhận được Pothos, mong shop kiểm tra và giao đúng sản phẩm.', 'PROCESSING', 'CRITICAL'),
(7,  NULL,'Tư vấn chọn cây cho phòng ngủ', 'Phòng ngủ tôi ít ánh sáng, muốn trồng vài cây nhỏ trang trí, nhờ shop tư vấn loại cây phù hợp.', 'CREATED', 'LOW'),
(8,  4, 'Hỏi về cách chăm sóc sen đá',     'Tôi mới mua sen đá lần đầu, không biết tưới bao nhiêu và để ở đâu là đúng. Nhờ shop hướng dẫn.', 'RESOLVED', 'MEDIUM'),
(9,  NULL,'Yêu cầu đổi trả cây bị hỏng',   'Cây nhận về bị gãy cành do đóng gói không kỹ, muốn đổi cây mới hoặc hoàn tiền.', 'CREATED', 'HIGH');

-- ============================================================
--  COMMENTS
-- ============================================================
INSERT INTO comments (ticket_id, creator_id, detail) VALUES
(1, 4, 'Chào bạn, cảm ơn đã liên hệ. Bạn đang để cây ở đâu và tưới bao nhiêu nước mỗi lần? Cho mình biết thêm để hỗ trợ tốt hơn nhé.'),
(1, 5, 'Tôi để cây gần cửa sổ có ánh sáng gián tiếp và tưới khoảng nửa ly nước mỗi ngày.'),
(1, 4, 'Bạn đang tưới hơi nhiều rồi. Kim tiền chỉ cần tưới 2-3 ngày một lần, để đất khô nhẹ mới tưới. Thử giảm tưới xem cây có phục hồi không nhé!'),
(2, 4, 'Xin lỗi bạn vì sự cố này. Mình đã kiểm tra đơn hàng và xác nhận có nhầm lẫn. Shop sẽ giao đúng sản phẩm Monstera cho bạn trong 1-2 ngày tới, hoàn toàn miễn phí.'),
(4, 4, 'Sen đá cần ít nước hơn bạn nghĩ. Nguyên tắc là: để đất khô hoàn toàn rồi mới tưới, mỗi lần tưới đẫm. Nên đặt nơi có nhiều ánh sáng, tối thiểu 4-6 tiếng nắng mỗi ngày.'),
(4, 8, 'Cảm ơn shop đã tư vấn chi tiết, tôi đã hiểu rồi. Chắc trước giờ tôi tưới nhiều quá nên cây bị úng.');

-- ============================================================
--  BLOG VOTES — bảng vote cho blog posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_votes (
   user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   post_id BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (user_id, post_id)
);

-- ============================================================
--  BLOG POSTS — chuyển is_published sang status
-- ============================================================
ALTER TABLE blog_posts
   ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT'
   CHECK (status IN ('DRAFT','PENDING','REJECTED','PUBLISHED'));

UPDATE blog_posts
SET status = CASE
   WHEN is_published = TRUE THEN 'PUBLISHED'
   ELSE 'DRAFT'
END;

CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);

-- ==============================================================
-- BLOG IMAGE - bảng lưu trữ ảnh cho blog post
-- ==============================================================
CREATE TABLE IF NOT EXISTS blog_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
    );

CREATE INDEX IF NOT EXISTS idx_blog_images_post ON blog_images(post_id);

ALTER TABLE blog_images
    ADD COLUMN IF NOT EXISTS image_data BYTEA,
    ADD COLUMN IF NOT EXISTS file_name  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS content_type VARCHAR(100),
    ALTER COLUMN post_id DROP NOT NULL;
TRUNCATE TABLE policies RESTART IDENTITY;

INSERT INTO policies (title, description, status) VALUES 
('Chính sách Đổi trả & Hoàn tiền', '## 1. Điều kiện đổi trả
- Cây bị dập nát, héo úa, gãy cành hoặc chết trong quá trình vận chuyển.
- Giao sai loại cây, sai kích thước hoặc thiếu phụ kiện so với đơn đặt hàng.
- Khách hàng cần thông báo và gửi hình ảnh/video tình trạng cây trong vòng **3 ngày** kể từ khi nhận hàng.

## 2. Các trường hợp không hỗ trợ đổi trả
- Cây chết hoặc héo úa do khách hàng chăm sóc sai cách (tưới quá nhiều nước, để sai vị trí thiếu sáng/quá nắng,...).
- Sản phẩm phụ kiện đã qua sử dụng hoặc không còn nguyên vẹn bao bì.

## 3. Quy trình hoàn tiền
- **Thời gian xử lý:** Từ 3-5 ngày làm việc sau khi Greenshop xác nhận yêu cầu hoàn tiền hợp lệ.
- **Phương thức hoàn tiền:** Chuyển khoản ngân hàng theo thông tin khách hàng cung cấp.
', 'PUBLISHED'),

('Chính sách Vận chuyển & Giao hàng', '## 1. Thời gian giao hàng
- **Nội thành Hà Nội:** Giao hàng trong vòng 24 - 48 giờ.
- **Ngoại thành và các tỉnh lân cận:** Giao hàng từ 3 - 5 ngày làm việc.

## 2. Phí vận chuyển
- Miễn phí vận chuyển cho đơn hàng từ **500.000 VNĐ** trở lên.
- Phí đồng giá **30.000 VNĐ** áp dụng cho tất cả các khu vực nội thành.

## 3. Lưu ý khi nhận hàng
Khách hàng vui lòng:
1. Kiểm tra kỹ tình trạng cây và số lượng sản phẩm.
2. Xác nhận tình trạng đơn hàng với người giao hàng.
3. Liên hệ ngay với bộ phận CSKH nếu có bất kỳ vấn đề nào phát sinh.
', 'PUBLISHED'),

('Chính sách Bảo mật Thông tin', '## 1. Mục đích thu thập thông tin
Greenshop cam kết bảo mật mọi thông tin cá nhân của khách hàng. Chúng tôi chỉ sử dụng thông tin nhằm:
- Xử lý đơn hàng, thanh toán và giao nhận sản phẩm.
- Hỗ trợ và giải quyết khiếu nại, phản hồi của khách hàng.
- Cung cấp các thông tin ưu đãi hoặc hướng dẫn chăm sóc cây định kỳ.

## 2. Cam kết bảo mật
- Không chia sẻ thông tin khách hàng cho bên thứ ba ngoại trừ đối tác vận chuyển.
- Mọi dữ liệu giao dịch được mã hóa để đảm bảo an toàn tuyệt đối.
', 'PUBLISHED'),

('Chính sách Khách hàng Thân thiết', '## 1. Hạng thành viên
Hệ thống hạng thành viên của Greenshop bao gồm:
* **Hạt Giống (Seed):** Khách hàng mới đăng ký tài khoản.
* **Mầm Xanh (Sprout):** Tổng chi tiêu từ 2.000.000 VNĐ.
* **Cây Xanh (Tree):** Tổng chi tiêu từ 5.000.000 VNĐ.
* **Đại Thụ (Oak):** Tổng chi tiêu từ 15.000.000 VNĐ.

## 2. Quyền lợi tương ứng
- **Mầm Xanh:** Giảm giá 5% cho mọi đơn hàng.
- **Cây Xanh:** Giảm giá 10% + Tặng 1 chậu đất nung cỡ nhỏ vào dịp sinh nhật.
- **Đại Thụ:** Giảm giá 15% + Miễn phí vận chuyển toàn quốc + Dịch vụ chăm sóc cây tại nhà (1 lần/năm).
', 'PUBLISHED'),

('Chính sách Bảo hành Cây xanh', '> **LƯU Ý:** Chính sách này đã hết hiệu lực từ ngày 01/01/2026 và được sáp nhập vào "Chính sách Đổi trả & Hoàn tiền".

## Nội dung bảo hành (Cũ)
- Bảo hành 7 ngày đối với tất cả các loại cây để bàn.
- Khách hàng mang cây đến trực tiếp cửa hàng để được hỗ trợ đổi cây mới nếu cây chết do lỗi kỹ thuật chăm sóc tại vườn ươm.
', 'ARCHIVED'),

('Chính sách Mua sỉ & Công trình', '## 1. Ưu đãi chiết khấu
Greenshop cung cấp chính sách giá sỉ hấp dẫn cho:
- Đơn hàng mua số lượng lớn (từ 20 cây cùng loại trở lên).
- Doanh nghiệp thiết kế văn phòng, quán cafe, khách sạn.
- **Mức chiết khấu:** Dao động từ **15% đến 35%** tùy theo giá trị đơn hàng và chủng loại cây.

## 2. Dịch vụ đi kèm
- Tư vấn khảo sát và thiết kế cảnh quan xanh miễn phí.
- Hỗ trợ vận chuyển bằng xe tải chuyên dụng đảm bảo cây không bị dập nát.
- Hợp đồng mua bán và xuất hóa đơn đỏ (VAT) đầy đủ.
', 'PUBLISHED'),

('Hướng dẫn Đền bù & Khiếu nại', '## 1. Cách thức gửi khiếu nại
Khách hàng có thể tạo yêu cầu hỗ trợ (Ticket) trực tiếp trên website Greenshop hoặc gọi điện qua Hotline.
- Yêu cầu cung cấp đầy đủ: Mã đơn hàng, hình ảnh thực tế của cây và lý do khiếu nại.

## 2. Phương án đền bù
- **Lỗi từ Greenshop (giao sai, gãy hỏng nặng):** Hỗ trợ đổi cây mới hoàn toàn miễn phí hoặc hoàn tiền 100%.
- **Lỗi do đối tác vận chuyển:** Greenshop chịu trách nhiệm làm việc với đơn vị vận chuyển và bù đắp cho khách hàng cây mới.
', 'PUBLISHED'),

('Chính sách Chăm sóc Cây tại nhà', '## Giới thiệu dịch vụ chăm sóc định kỳ
Dự kiến triển khai dịch vụ đăng ký chăm sóc cây xanh tại nhà (tưới nước, bón phân, tỉa cành, phun thuốc phòng sâu bệnh) cho các hộ gia đình hoặc văn phòng bận rộn.

*Chính sách này hiện đang được soạn thảo chi tiết và thử nghiệm vận hành nội bộ.*
', 'DRAFT'),

('Chính sách Đặt trước Cây hiếm', '## Đăng ký sở hữu các dòng cây Exotic
Chính sách hướng dẫn khách hàng cách đặt cọc trước (Pre-order) đối với các loại cây đột biến (Variegated) hoặc cây nhập khẩu quý hiếm.

*Nội dung chi tiết đang được xây dựng bởi bộ phận Cung ứng.*
', 'DRAFT'),

('Chính sách Thu cũ Đổi mới Chậu cây', '> **LƯU Ý:** Chương trình này đã kết thúc từ ngày 31/12/2025.

## Nội dung chương trình (Đã đóng)
- Khách hàng mang chậu sứ cũ, chậu nhựa cũ đã mua tại Greenshop đến cửa hàng sẽ được giảm giá 20% khi mua chậu đất nung mới.
', 'ARCHIVED');

