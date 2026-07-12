DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS blog_votes CASCADE;
DROP TABLE IF EXISTS blog_images CASCADE;
DROP TABLE IF EXISTS blog_tags CASCADE;
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
   idBIGSERIAL PRIMARY KEY,
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
        idBIGSERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================

CREATE TABLE products (
      idBIGSERIAL PRIMARY KEY,
      category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
      name        VARCHAR(200) NOT NULL,
      price       DECIMAL(15,2) NOT NULL CHECK (price >= 0),
      stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
      skuVARCHAR(50) NOT NULL UNIQUE,
      status      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku      ON products(sku);

-- ============================================================

CREATE TABLE product_details (
   id    BIGSERIAL PRIMARY KEY,
   product_id      BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
   description     TEXT,
   contentTEXT,
   care_guide      TEXT,
   sunlight_level  VARCHAR(50),
   water_freq      VARCHAR(50),
   difficulty      VARCHAR(50),
   feng_shui_element VARCHAR(50),
   images            JSON
);

ALTER TABLE product_details ADD COLUMN IF NOT EXISTS care_guide TEXT;
ALTER TABLE product_details ADD COLUMN IF NOT EXISTS sunlight_level TEXT;
ALTER TABLE product_details ADD COLUMN IF NOT EXISTS water_freq TEXT;
ALTER TABLE product_details ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE product_details ADD COLUMN IF NOT EXISTS feng_shui_element TEXT;

-- ============================================================

CREATE TABLE orders (
    id     BIGSERIAL PRIMARY KEY,
    customer_id      BIGINT NOT NULL REFERENCES users(id),
    shipper_id       BIGINT REFERENCES users(id),
    shipping_address TEXT,
    shipping_fee     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discountDECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
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
  idBIGSERIAL PRIMARY KEY,
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
     id BIGSERIAL PRIMARY KEY,
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
      id BIGSERIAL PRIMARY KEY,
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
        id        BIGSERIAL PRIMARY KEY,
        author_id BIGINT NOT NULL REFERENCES users(id),

        title     VARCHAR(300) NOT NULL,
        content   TEXT NOT NULL,
        thumbnail TEXT,

        is_published        BOOLEAN NOT NULL DEFAULT FALSE,

        status    VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
  CHECK (
      status IN (
 'DRAFT',
 'PENDING',
 'PUBLISHED',
 'REJECTED'
)
      ),

        pending_reason      TEXT,

    -- staged edit
        pending_title       VARCHAR(300),
        pending_content     TEXT,
        pending_thumbnail   TEXT,
        has_pending_edit    BOOLEAN NOT NULL DEFAULT FALSE,

        view_countINT NOT NULL DEFAULT 0,

        created_atTIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_atTIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published_at        TIMESTAMP
);

CREATE INDEX idx_blog_author
    ON blog_posts(author_id);

CREATE INDEX idx_blog_published
    ON blog_posts(is_published);

CREATE INDEX idx_blog_status
    ON blog_posts(status);

-- ============================================================
--  BLOG IMAGES
-- ============================================================

CREATE TABLE blog_images (
id    BIGSERIAL PRIMARY KEY,

    -- giữ blog_id cho code/seed từ branch cũ
blog_idBIGINT REFERENCES blog_posts(id) ON DELETE CASCADE,

    -- giữ post_id cho code blog mới
post_idBIGINT REFERENCES blog_posts(id) ON DELETE CASCADE,

image_url       TEXT NOT NULL,

    -- binary image
image_data      BYTEA,
file_name       VARCHAR(255),
content_type    VARCHAR(100),

    -- staged edit
is_pending      BOOLEAN NOT NULL DEFAULT FALSE,

    -- metadata từ branch hiện tại
is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
sort_order      INT NOT NULL DEFAULT 0,
created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_images_blog
    ON blog_images(blog_id);

CREATE INDEX idx_blog_images_post
    ON blog_images(post_id);

-- ============================================================
--  BLOG TAGS
-- ============================================================

CREATE TABLE blog_tags (
       id  BIGSERIAL PRIMARY KEY,
       blog_post_id  BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
       tag VARCHAR(100) NOT NULL,
       created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(blog_post_id, tag)
);

CREATE INDEX idx_blog_tags_blog ON blog_tags(blog_post_id);
CREATE INDEX idx_blog_tags_name ON blog_tags(tag);

-- ============================================================
--  BLOG VOTES
-- ============================================================

CREATE TABLE blog_votes (
        idBIGSERIAL PRIMARY KEY,

    -- branch cũ
        blog_id     BIGINT REFERENCES blog_posts(id) ON DELETE CASCADE,

    -- branch mới
        post_id     BIGINT REFERENCES blog_posts(id) ON DELETE CASCADE,

        user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        is_upvote   BOOLEAN NOT NULL DEFAULT TRUE,

        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_votes_blog
    ON blog_votes(blog_id);

CREATE INDEX idx_blog_votes_post
    ON blog_votes(post_id);

CREATE INDEX idx_blog_votes_user
    ON blog_votes(user_id);

-- ============================================================
--  NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
 id        BIGSERIAL PRIMARY KEY,

    -- notification hệ thống hiện tại
 user_id   BIGINT REFERENCES users(id) ON DELETE CASCADE,

    -- notification email từ branch merge
 recipient_user_id   BIGINT REFERENCES users(id),
 recipient_role_id   BIGINT REFERENCES role(id),

 type      VARCHAR(50) NOT NULL,

 title     VARCHAR(255),
 message   TEXT,
 reference_id        BIGINT,

 recipient_email     VARCHAR(150),
 subject   VARCHAR(255),
 content   TEXT,

 sent_via_email      BOOLEAN NOT NULL DEFAULT FALSE,
 email_send_failed   BOOLEAN NOT NULL DEFAULT FALSE,

 is_read   BOOLEAN NOT NULL DEFAULT FALSE,

 created_atTIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user
    ON notifications(user_id);

CREATE INDEX idx_notifications_recipient_user
    ON notifications(recipient_user_id);

CREATE INDEX idx_notifications_recipient_role
    ON notifications(recipient_role_id);

CREATE INDEX idx_notifications_read
    ON notifications(is_read);

CREATE INDEX idx_notifications_created
    ON notifications(created_at DESC);
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
(1, 'khach6@gmail.com',     '$2a$10$lLkYkek4Cc39DHC4WVnWJuKWVJS1nOSmHVdxYYfobuEjxVcbM57f2','Lý Thị Mai','0912345606', TRUE);

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
(1, 'Cây Trầu Bà Xanh', 85000,  50, 'SKU-001', TRUE),
(1, 'Cây Lưỡi Hổ Nhỏ',  95000,  45, 'SKU-002', TRUE),
(1, 'Cây Kim Tiền',     120000,  60, 'SKU-003', TRUE),
(1, 'Cây Phát Lộc',     150000,  40, 'SKU-004', TRUE),
(1, 'Cây Dây Leo Pothos',75000,  80, 'SKU-005', TRUE),
(1, 'Cây Monstera Nhỏ', 250000,  30, 'SKU-006', TRUE),
(1, 'Cây Trầu Bà Vàng',  90000,  55, 'SKU-007', TRUE),
(1, 'Cây Dracaena Xanh',180000,  25, 'SKU-008', TRUE),
(1, 'Cây Ficus Nhỏ',   200000,  20, 'SKU-009', TRUE),
(1, 'Cây Lan Ý',        120000,  35, 'SKU-010', TRUE),
(1, 'Cây ZZ Plant',     280000,  15, 'SKU-011', TRUE),
(1, 'Cây Xương Rồng Tai Thỏ',     45000, 100, 'SKU-012', TRUE),
(1, 'Cây Lưỡi Hổ Vàng',110000,  40, 'SKU-013', TRUE),
(1, 'Cây Hồng Môn Đỏ', 180000,  25, 'SKU-014', TRUE),
(1, 'Cây Thiết Mộc Lan',220000,  20, 'SKU-015', TRUE),
(1, 'Cây Trầu Bà Sọc Vàng',       85000,  65, 'SKU-016', TRUE),
(1, 'Cây Phú Quý Thủy Sinh',     150000,  30, 'SKU-017', TRUE),
(1, 'Cây Cau Cọnh',     95000,  50, 'SKU-018', TRUE),
(1, 'Cây Huyết Dụ',    130000,  30, 'SKU-019', TRUE),
(1, 'Cây Bạc Ngọc',     75000,  70, 'SKU-020', TRUE),
-- Cây ngoài trời (category 2)
(2, 'Cây Bàng Đài Loan',350000,  15, 'SKU-021', TRUE),
(2, 'Cây Muồng Đen',   450000,  10, 'SKU-022', TRUE),
(2, 'Cây Sấu Nhỏ',     280000,  20, 'SKU-023', TRUE),
(2, 'Cây Chi Chét',     180000,  25, 'SKU-024', TRUE),
(2, 'Cây Hoa Giấy',     85000,  60, 'SKU-025', TRUE),
(2, 'Cây Hoa Lan Ý',   120000,  40, 'SKU-026', TRUE),
(2, 'Cây Đa Búp Đỏ',   320000,  15, 'SKU-027', TRUE),
(2, 'Cây Lộc Vừng',    550000,   8, 'SKU-028', TRUE),
(2, 'Cây Tùng La Hán', 280000,  20, 'SKU-029', TRUE),
(2, 'Cây Cau Vàng',    420000,  12, 'SKU-030', TRUE),
(2, 'Cây Bông Trang',   75000,  55, 'SKU-031', TRUE),
(2, 'Cây Dền Đỏ',      35000,  80, 'SKU-032', TRUE),
(2, 'Cây Cẩm Nhung',   95000,  45, 'SKU-033', TRUE),
(2, 'Cây Môn Tía',     65000,  60, 'SKU-034', TRUE),
(2, 'Cây Ngải Cứu',    45000,  70, 'SKU-035', TRUE),
(2, 'Cây Hương Thảo',  85000,  50, 'SKU-036', TRUE),
(2, 'Cây Oải Hương',  120000,  35, 'SKU-037', TRUE),
(2, 'Cây Bạc Hà',      55000,  65, 'SKU-038', TRUE),
(2, 'Cây Rau Mùi',     35000,  90, 'SKU-039', TRUE),
(2, 'Cây Húng Quế',    45000,  75, 'SKU-040', TRUE),
-- Cây để bàn (category 3)
(3, 'Cây Sen Đá Thạch Ngọc',     35000, 120, 'SKU-041', TRUE),
(3, 'Cây Sen Đá Hồng Phấn',       45000,  90, 'SKU-042', TRUE),
(3, 'Cây Sen Đá Xanh Thanh',      40000, 100, 'SKU-043', TRUE),
(3, 'Cây Xương Rồng Cactus Nhỏ', 55000,  80, 'SKU-044', TRUE),
(3, 'Cây Xương Rồng San Hô',     75000,  60, 'SKU-045', TRUE),
(3, 'Cây Mạc Ma Nhỏ', 120000,  40, 'SKU-046', TRUE),
(3, 'Cây Kim Ngân Bàn',180000,  30, 'SKU-047', TRUE),
(3, 'Cây Ngọc Bích',   65000,  70, 'SKU-048', TRUE),
(3, 'Cây Lưỡi Hổ Mini',85000,  50, 'SKU-049', TRUE),
(3, 'Cây Trầu Bà Mini',55000,  85, 'SKU-050', TRUE),
(3, 'Cây Lan Phi Điển Nhỏ',     150000,  25, 'SKU-051', TRUE),
(3, 'Cây Địa Lan',     220000,  15, 'SKU-052', TRUE),
(3, 'Cây Mai Chiếu Thủy',        95000,  45, 'SKU-053', TRUE),
(3, 'Cây Si Tây Mini',280000,  12, 'SKU-054', TRUE),
(3, 'Cây Đuôi Công Xanh',       130000,  30, 'SKU-055', TRUE),
(3, 'Cây Ổi Cảnh',    180000,  20, 'SKU-056', TRUE),
(3, 'Cây Khế Cảnh',    220000,  18, 'SKU-057', TRUE),
(3, 'Cây Tắc Cảnh',    150000,  25, 'SKU-058', TRUE),
(3, 'Cây Vạn Tuế',    350000,  10, 'SKU-059', TRUE),
(3, 'Cây Lược Vàng',   85000,  55, 'SKU-060', TRUE),
-- Sen đá & Xương rồng (category 4)
(4, 'Sen Đá Hồng Lan', 45000,  80, 'SKU-061', TRUE),
(4, 'Sen Đá Kim Cương',55000,  70, 'SKU-062', TRUE),
(4, 'Sen Đá Ngũ Sắc',  65000,  60, 'SKU-063', TRUE),
(4, 'Sen Đá Mặt Trăng',85000,  45, 'SKU-064', TRUE),
(4, 'Sen Đá Nhật Nguyệt',        95000,  40, 'SKU-065', TRUE),
(4, 'Sen Đá Tứ Quý',   75000,  55, 'SKU-066', TRUE),
(4, 'Sen Đá Tiểu Hồng',45000,  75, 'SKU-067', TRUE),
(4, 'Sen Đá Đô La',    35000, 100, 'SKU-068', TRUE),
(4, 'Xương Rồng Sao Biển',      85000,  50, 'SKU-069', TRUE),
(4, 'Xương Rồng Óp Pích',       65000,  60, 'SKU-070', TRUE),
(4, 'Xương Rồng Cầu Vàng',     120000,  35, 'SKU-071', TRUE),
(4, 'Xương Rồng Cầu Đỏ',       130000,  30, 'SKU-072', TRUE),
(4, 'Xương Rồng Bông Tím',       95000,  40, 'SKU-073', TRUE),
(4, 'Xương Rồng Chuột Tai',     55000,  65, 'SKU-074', TRUE),
(4, 'Xương Rồng Gỗ Nhỏ',       180000,  25, 'SKU-075', TRUE),
(4, 'Sedum Tricolor',  55000,  70, 'SKU-076', TRUE),
(4, 'Echeveria Lọ Vàng',75000,  50, 'SKU-077', TRUE),
(4, 'Graptopetalum Mây',        85000,  45, 'SKU-078', TRUE),
(4, 'Haworthia Gioi Lim',        95000,  40, 'SKU-079', TRUE),
(4, 'Aeonium Cuộn Trứng',       65000,  55, 'SKU-080', TRUE),
-- Cây phong thủy (category 5)
(5, 'Cây Kim Tiền Phong Thủy',   150000,  50, 'SKU-081', TRUE),
(5, 'Cây Phát Lộc Phong Thủy',   180000,  40, 'SKU-082', TRUE),
(5, 'Cây Thiết Mộc Lan',220000,  25, 'SKU-083', TRUE),
(5, 'Cây Lộc Vừng Phong Thủy',  450000,  10, 'SKU-084', TRUE),
(5, 'Cây Ngũ Lộc Phong Thủy',    280000,  15, 'SKU-085', TRUE),
(5, 'Cây Dây Leo May Mắn',       85000,  60, 'SKU-086', TRUE),
(5, 'Cây Trầu Bà Đế Chế',       120000,  35, 'SKU-087', TRUE),
(5, 'Cây Lan Ý Phong Thủy',      150000,  30, 'SKU-088', TRUE),
(5, 'Cây Hồng Môn Phong Thủy',   200000,  20, 'SKU-089', TRUE),
(5, 'Cây Đại Cát Tường',        180000,  25, 'SKU-090', TRUE),
(5, 'Cây Kim Ngân Xoắn',        320000,  15, 'SKU-091', TRUE),
(5, 'Cây Vạn Niên Thanh',       130000,  30, 'SKU-092', TRUE),
(5, 'Cây Cọ Nhật Phong Thủy',    450000,   8, 'SKU-093', TRUE),
(5, 'Cây Bạch Mã Hoàng Tử',      280000,  12, 'SKU-094', TRUE),
(5, 'Cây Sung Ngự Lộc',550000,   5, 'SKU-095', TRUE),
(5, 'Cây Đào Tiên Cảnh',        220000,  18, 'SKU-096', TRUE),
(5, 'Cây Trà Hoa Vàng',180000,  22, 'SKU-097', TRUE),
(5, 'Cây San Hô Phong Thủy',     150000,  28, 'SKU-098', TRUE),
-- Phụ kiện (category 6)
(6, 'Chậu Sứ Trắng Đường Kính 15cm', 35000, 200, 'SKU-099', TRUE),
(6, 'Chậu Nhựa Đen Đường Kính 12cm', 15000, 300, 'SKU-100', TRUE),
(6, 'Chậu Xi Măng Nhỏ',25000, 180, 'SKU-101', TRUE),
(6, 'Đất Trồng Cây Đa Năng 5L',  45000, 150, 'SKU-102', TRUE),
(6, 'Phân Bón NPK 20-20-20',     55000, 120, 'SKU-103', TRUE),
(6, 'Phân Bón Hữu Cơ Viên Nén',  65000, 100, 'SKU-104', TRUE),
(6, 'Dụng Cụ Tưới Nước Mini',    25000, 200, 'SKU-105', TRUE),
(6, 'Bình Xịt Nước 500ml',       35000, 180, 'SKU-106', TRUE),
(6, 'Găng Tay Làm Vườn',30000, 150, 'SKU-107', TRUE),
(6, 'Kéo Cắt Cành Nhỏ',55000,  80, 'SKU-108', TRUE),
(6, 'Khay Ươm Hạt',    35000, 120, 'SKU-109', TRUE),
(6, 'Than Hoạt Tính Trồng Cây',   25000, 200, 'SKU-110', TRUE),
(6, 'Xơ Dừa Viên Nén', 30000, 150, 'SKU-111', TRUE),
(6, 'Đá Trang Trí Phủ Bề Mặt',   40000, 180, 'SKU-112', TRUE),
(6, 'Dây Buộc Cây Leo',15000, 250, 'SKU-113', TRUE),
(6, 'Ghim Đất Cho Dây Leo',      20000, 200, 'SKU-114', TRUE),
(6, 'Chậu Treo Đường Kính 10cm',  30000, 150, 'SKU-115', TRUE),
(6, 'Ống Tưới Nhỏ Giọt',45000, 100, 'SKU-116', TRUE),
(6, 'Thuốc Trừ Sâu Sinh Học',     55000,  80, 'SKU-117', TRUE),
(6, 'Viên Nén Ươm Giống',35000, 120, 'SKU-118', TRUE);

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
(10, 'Lan ý hoa trắng thanh tao, lọc formaldehyde hiệu quả, dễ chăm sóc trong nhà.', '["lanYi_1.jpg","lanYi_2.jpg"]'),
(11, 'ZZ Plant cây khỏe chịu bóng tối, ít cần nước, phù hợp văn phòng điều hòa.', '["zzplant_1.jpg"]'),
(12, 'Xương rồng tai thỏ nhỏ xinh, dễ chăm sóc, tưới 1-2 lần/tuần, nhiều nắng.', '["xuongrong_taitho_1.jpg"]'),
(13, 'Lưỡi hổ vàng lá sọc vàng xanh đẹp mắt, phong thủy tốt cho tài lộc.', '["luoiho_vang_1.jpg"]'),
(14, 'Hồng môn đỏ hoa tươi lâu, biểu tượng sung túc, phù hợp trang trí bàn làm việc.', '["hongmon_do_1.jpg"]'),
(15, 'Thiết mộc lan lá dài xanh đậm, thanh lọc không khí, phù hợp phòng khách và văn phòng.', '["thietmoclan_1.jpg"]'),
(16, 'Trầu bà sọc vàng lá xanh với sọc vàng rực rỡ, dễ trồng, sinh trưởng nhanh.', '["trauba_socvang_1.jpg"]'),
(17, 'Phú quý thủy sinh rễ bám trên đá, mang lại tài lộc, dễ chăm sóc trong bình thủy sinh.', '["phuquy_thuysinh_1.jpg"]'),
(18, 'Cau cọnh tán lá xanh mát, thanh lọc không khí, phù hợp trang trí phòng khách.', '["caucohn_1.jpg"]'),
(19, 'Huyết dụ lá dài mảnh như lông chim, màu đỏ tía đẹp mắt, phù hợp bàn làm việc.', '["huyetdu_1.jpg"]'),
(20, 'Bạc ngọc lá nhỏ xanh bạc, phù hợp terrarium, bàn làm việc, dễ chăm sóc.', '["bacngoc_1.jpg"]'),
(21, 'Bàng Đài Loan tán rộng xanh tốt, cây lâu năm, phù hợp sân vườn lớn.', '["bang_dailoan_1.jpg"]'),
(22, 'Muồng đen hoa vàng đẹp mùa nở hoa, tán rộng mát mẻ, phù hợp công viên.', '["muongden_1.jpg"]'),
(23, 'Sấu nhỏ tán tròn đẹp, lá xanh tươi, phù hợp trồng ngoài vườn, chịu nắng tốt.', '["sau_nho_1.jpg"]'),
(24, 'Chi chét hoa trắng thơm ngát, tán lá nhỏ xinh, phù hợp hàng rào, bờ tường.', '["chichet_1.jpg"]'),
(25, 'Hoa giấy nhiều màu tươi sáng, leo bám tốt, phù hợp ban công, hàng rào.', '["hoagiay_1.jpg","hoagiay_2.jpg"]'),
(26, 'Hoa lan ý điểm xuyết hoa trắng trên nền xanh, trang trí bàn tiệc sang trọng.', '["hoalan_yi_1.jpg"]'),
(27, 'Đa búp đỏ lá non màu đỏ nổi bật, tán lá rậm rạp, phù hợp cảnh quan sân vườn.', '["dabup_do_1.jpg"]'),
(28, 'Lộc vừng tán lá tròn đẹp, biểu tượng tài lộc, phù hợp trồng trước nhà.', '["locvung_1.jpg"]'),
(29, 'Tùng la hán lá kim xanh đẹp, cây cảnh phong thủy, phù hợp văn phòng, biệt thự.', '["tunglahhanh_1.jpg"]'),
(30, 'Cau vàng tán lá xanh vòng cung đẹp mắt, mang ý nghĩa phong thủy tốt lành.', '["cauvang_1.jpg"]'),
(31, 'Bông trang hoa trắng nở quanh năm, dễ trồng, phù hợp hàng rào, tiểu cảnh.', '["bongtrang_1.jpg"]'),
(32, 'Dền đỏ lá màu đỏ tía rực rỡ, trồng viền, trang trí tiểu cảnh đẹp mắt.', '["den_do_1.jpg"]'),
(33, 'Cẩm nhung lá xanh có gân đỏ, mềm mại như nhung, phù hợp trang trí bàn.', '["camnhung_1.jpg"]'),
(34, 'Môn tía lá hình tim màu tím đẹp mắt, phù hợp trồng trong chậu treo.', '["mon_tia_1.jpg"]'),
(35, 'Ngải cứu lá thơm, dùng làm thuốc, trồng trong vườn hoặc chậu nhỏ.', '["ngaicu_1.jpg"]'),
(36, 'Hương thảo cây thơm, hoa tím nhỏ xinh, trồng trong bếp hoặc ban công.', '["huongthao_1.jpg"]'),
(37, 'Oải hương hoa tím thơm, cây thân gỗ nhỏ, phù hợp trang trí ban công.', '["oaihuong_1.jpg"]'),
(38, 'Bạc hà lá xanh thơm mát, dễ trồng, dùng làm thuốc hoặc đồ uống giải khát.', '["bacha_1.jpg"]'),
(39, 'Rau mùi lá xanh thơm, gia vị nấu ăn, trồng trong vườn hoặc chậu nhỏ.', '["raumui_1.jpg"]'),
(40, 'Húng quế lá xanh thơm, gia vị cho món Ý hoặc Thai, dễ trồng trong chậu.', '["hungque_1.jpg"]'),
(41, 'Sen đá thạch ngọc lá xanh ngọc, hình hoa, trồng terrarium, chậu nhỏ xinh.', '["senda_thachngoc_1.jpg"]'),
(42, 'Sen đá hồng phấn lá xếp hình hoa màu hồng nhạt, phù hợp trang trí bàn.', '["senda_hongphen_1.jpg"]'),
(43, 'Sen đá xanh thanh lá xanh màu xanh ngọc, dễ chăm, phù hợp người mới chơi cây.', '["senda_xanhthanh_1.jpg"]'),
(44, 'Xương rồng cactus nhỏ thân tròn, nhiều gai mềm, trồng chậu để bàn.', '["cactus_nho_1.jpg"]'),
(45, 'Xương rồng san hô tạo hình như san hô biển, màu xanh đẹp mắt.', '["xuongrong_sanho_1.jpg"]'),
(46, 'Mạc ma nhỏ lá xanh bóng, tán nhỏ xinh, trang trí bàn làm việc, kệ sách.', '["macma_1.jpg"]'),
(47, 'Kim ngân bàn lá xanh mướt, tán tròn đẹp, mang tài lộc, dễ chăm cây.', '["kimngan_ban_1.jpg"]'),
(48, 'Ngọc bích lá tròn xanh mọng nước, cây may mắn, dễ chăm, nhiều nắng.', '["ngocbich_1.jpg"]'),
(49, 'Lưỡi hổ mini lá ngắn xanh đẹp, phù hợp bàn làm việc, chịu bóng tốt.', '["luoiho_mini_1.jpg"]'),
(50, 'Trầu bà mini dây leo nhỏ xinh, trồng chậu treo, trang trí góc phòng.', '["trauba_mini_1.jpg"]'),
(51, 'Lan phi điển nhỏ hoa tím đẹp, phong thủy tốt, phù hợp bàn thờ, trang trí.', '["lanphidien_nho_1.jpg"]'),
(52, 'Địa lan hoa to đẹp nhiều màu, thanh tao sang trọng, phù hợp phòng khách.', '["dialan_1.jpg"]'),
(53, 'Mai chiếu thủy tán nhỏ xanh đẹp, dễ uốn, phù hợp làm bonsai mini.', '["maichieuthuy_1.jpg"]'),
(54, 'Si tây mini thân gỗ nhỏ, dáng đẹp, phù hợp làm bonsai trên bàn.', '["siday_mini_1.jpg"]'),
(55, 'Đuôi công xanh lá dài xoắn như đuôi công, trang trí bàn làm việc độc đáo.', '["duoicong_1.jpg"]'),
(56, 'Ổi cảnh tạo dáng đẹp, quả nhỏ xanh, phù hợp làm cây cảnh bonsai.', '["oicanh_1.jpg"]'),
(57, 'Khế cảnh tạo dáng đẹp, quả vàng, phong thủy tốt, phù hợp sân vườn.', '["khecanh_1.jpg"]'),
(58, 'Tắc cảnh quả tròn xanh vàng, trang trí đẹp mắt, mang ý nghĩa sung túc.', '["taccanh_1.jpg"]'),
(59, 'Vạn tuế tán lá xòe đẹp, cây sống lâu năm, phù hợp trang trí sảnh, văn phòng.', '["vantu_1.jpg"]'),
(60, 'Lược vàng lá dài xanh vàng, dễ chăm, lọc không khí hiệu quả.', '["lucvu_vang_1.jpg"]'),
(61, 'Sen đá hồng lan lá xếp hình hoa hồng, màu hồng nhạt đẹp mắt.', '["senda_honglan_1.jpg"]'),
(62, 'Sen đá kim cương lá xanh bạc, hình ngôi sao, trồng chậu xinh xắn.', '["senda_kimcuong_1.jpg"]'),
(63, 'Sen đá ngũ sắc lá nhiều màu từ xanh đến đỏ, trồng terrarium đẹp.', '["senda_ngusac_1.jpg"]'),
(64, 'Sen đá mặt trăng lá xanh bạc hình trăng lưỡi liềm, độc đáo.', '["senda_mattrang_1.jpg"]'),
(65, 'Sen đá nhật nguyệt lá trắng bạc hình trăng non, hiếm và đẹp.', '["senda_nhatnguyet_1.jpg"]'),
(66, 'Sen đá tứ quý lá xếp 4 hướng, xanh đẹp, dễ chăm.', '["senda_tuquy_1.jpg"]'),
(67, 'Sen đá tiểu hồng lá nhỏ màu hồng nhạt, trồng chậu treo xinh xắn.', '["senda_tieuhong_1.jpg"]'),
(68, 'Sen đá đô la lá xanh dẹt như đồng xu, mọng nước, dễ trồng.', '["senda_dola_1.jpg"]'),
(69, 'Xương rồng sao biển tạo hình như sao biển, màu xanh đẹp mắt.', '["xuongrong_saobien_1.jpg"]'),
(70, 'Xương rồng ốp pích thân dẹt như lá, nhiều gai nhỏ, dễ chăm.', '["xuongrong_oppich_1.jpg"]'),
(71, 'Xương rồng cầu vàng thân tròn màu vàng, nở hoa vàng đẹp.', '["xuongrong_cauvang_1.jpg"]'),
(72, 'Xương rồng cầu đỏ thân tròn màu đỏ, nở hoa hồng đẹp.', '["xuongrong_caudo_1.jpg"]'),
(73, 'Xương rồng bông tím hoa tím đẹp, thân xanh tím, trồng chậu trang trí.', '["xuongrong_bongtim_1.jpg"]'),
(74, 'Xương rồng chuột tai lá dài như tai chuột, xanh mềm, dễ chăm.', '["xuongrong_chuottai_1.jpg"]'),
(75, 'Xương rồng gỗ nhỏ tạo dáng như cây gỗ mini, độc đáo và đẹp mắt.', '["xuongrong_gnho_1.jpg"]'),
(76, 'Sedum tricolor lá ba màu xanh trắng hồng, mọng nước, dễ trồng.', '["sedum_tricolor_1.jpg"]'),
(77, 'Echeveria lọ vàng lá xếp hình bông hoa trong chậu sứ trắng xinh xắn.', '["echeveria_lo_vang_1.jpg"]'),
(78, 'Graptopetalum mây lá màu xanh bạc, hình hoa đẹp, dễ chăm.', '["graptopetalum_may_1.jpg"]'),
(79, 'Haworthia gioi lim lá nhọn xanh có chấm trắng trong suốt đẹp mắt.', '["haworthia_1.jpg"]'),
(80, 'Aeonium cuộn trứng lá xanh xếp chồng như trứng, đẹp mắt.', '["aeonium_1.jpg"]'),
(81, 'Kim tiền phong thủy lá tròn xanh bóng, rễ khỏe, mang tài lộc, dễ chăm.', '["kimtien_pthuy_1.jpg"]'),
(82, 'Phát lộc phong thủy thân thẳng lá xòe, biểu tượng phát tài, đặt phòng khách.', '["phatloc_pthuy_1.jpg"]'),
(83, 'Thiết mộc lan lá xanh đậm thanh lọc không khí, phong thủy tốt, văn phòng.', '["thietmoclan_pthuy_1.jpg"]'),
(84, 'Lộc vừng phong thủy tán tròn xanh đẹp, đặt trước nhà thu hút tài lộc.', '["locvung_pthuy_1.jpg"]'),
(85, 'Ngũ lộc phong thủy 5 lá xòe đẹp, mang ngũ phúc, trang trí phòng khách.', '["nguloc_1.jpg"]'),
(86, 'Dây leo may mắn dây xanh dài, lá tim, trang trí giá sách, kệ đẹp.', '["dayleo_mayman_1.jpg"]'),
(87, 'Trầu bà đế chế tạo hình đẹp, phong thủy tốt, đặt bàn làm việc manager.', '["trauba_deche_1.jpg"]'),
(88, 'Lan ý phong thủy hoa trắng thanh tao, lọc không khí, đặt phòng khách.', '["lanYi_pthuy_1.jpg"]'),
(89, 'Hồng môn phong thủy hoa đỏ tươi, tượng trưng sung túc, phòng khách.', '["hongmon_pthuy_1.jpg"]'),
(90, 'Đại cát tường lá xanh to khỏe, tượng trưng cát tường, đặt cửa hàng.', '["daicattuong_1.jpg"]'),
(91, 'Kim ngân xoắn thân xoắn độc đáo, mang tài lộc, phù hợp văn phòng.', '["kimngan_xoan_1.jpg"]'),
(92, 'Vạn niên thanh lá xanh to, sống lâu năm, biểu tượng sự bền vững.', '["vannienthanh_1.jpg"]'),
(93, 'Cọ nhật phong thủy tán lá xòe đẹp, mang ý nghĩa thịnh vượng.', '["conhat_1.jpg"]'),
(94, 'Bạch mã hoàng tử lá xanh vệt trắng, tượng trưng quý phái, phong thủy.', '["bachmahoangtu_1.jpg"]'),
(95, 'Sung ngự lộc tạo dáng đẹp, quả màu đỏ, biểu tượng phú quý.', '["sung_nguloc_1.jpg"]'),
(96, 'Đào tiên cảnh hoa đào nhỏ đẹp, tượng trưng may mắn, trang trí Tết.', '["daotien_canh_1.jpg"]'),
(97, 'Trà hoa vàng hoa vàng thơm, lá xanh đẹp, trồng vườn hoặc chậu lớn.', '["tahoavang_1.jpg"]'),
(98, 'San hô phong thủy tạo hình như san hô, mang biển cả, thịnh vượng.', '["sanhho_pthuy_1.jpg"]'),
(99, 'Chậu sứ trắng đường kính 15cm men bóng đẹp, trồng sen đá, xương rồng.', '["chausu_15_1.jpg"]'),
(100,'Chậu nhựa đen đường kính 12cm nhẹ bền, trồng cây văn phòng nhỏ.', '["chaunhua_den_12_1.jpg"]'),
(101,'Chậu xi măng nhỏ tổ ong xốp nhẹ, trồng cây để bàn, giá rẻ.', '["chauxima_1.jpg"]'),
(102,'Đất trồng đa năng 5L phù hợp hầu hết cây trồng trong nhà và ngoài trời.', '["datrong_5l_1.jpg"]'),
(103,'Phân NPK 20-20-20 cân bằng dinh dưỡng, bón cây xanh lá, hoa và cây ăn quả.', '["phan_npk_1.jpg"]'),
(104,'Phân hữu cơ viên nén tan chậm, cải thiện đất, an toàn cho cây trồng.', '["phan_huuco_1.jpg"]'),
(105,'Dụng cụ tưới mini nhỏ gọn, phù hợp tưới cây để bàn, chậu nhỏ.', '["cuotuoi_mini_1.jpg"]'),
(106,'Bình xịt nước 500ml phun sương mịn, tưới cây mini, làm ẩm lá.', '["binhxit_500_1.jpg"]'),
(107,'Găng tay làm vườn chống gai, bảo vệ tay khi bón phân, cắt tỉa.', '["gangtay_vuon_1.jpg"]'),
(108,'Kéo cắt cành nhỏ sắc bén, cắt tỉa cây cảnh, hoa hồng.', '["keocatcanh_1.jpg"]'),
(109,'Khay ươm hạt 24 ô tiện lợi, ươm hạt giống, cây con.', '["khay_uom_1.jpg"]'),
(110,'Than hoạt tính trồng cây, dùng phối trộn đất, chống úng rễ.', '["thanhoattinh_1.jpg"]'),
(111,'Xơ dừa viên nén xốp nhẹ, giữ ẩm tốt, phối trộn đất trồng.', '["xodua_vien_1.jpg"]'),
(112,'Đá trang trí phủ bề mặt chậu, chống bốc hơi, thẩm mỹ đẹp.', '["datrangtri_1.jpg"]'),
(113,'Dây buộc cây leo mềm dai, buộc cố định dây leo, hoa giấy.', '["daybuoc_1.jpg"]'),
(114,'Ghim đất cho dây leo inox chống gỉ, ghim cố định dây vào đất.', '["ghimdat_1.jpg"]'),
(115,'Chậu treo đường kính 10cm lỗ thoát nước, trồng sen đá, cây treo.', '["chautreo_10_1.jpg"]'),
(116,'Ống tưới nhỏ giọt tiết kiệm nước, lắp đặt đơn giản cho vườn nhỏ.', '["ongtuoi_nhogiọt_1.jpg"]'),
(117,'Thuốc trừ sâu sinh học an toàn, pha xịt phòng sâu bệnh cho cây.', '["thuoc_trasinhhoc_1.jpg"]'),
(118,'Viên nén ươm giống xốp, đặt hạt vào ươm, nảy mầm nhanh.', '["viennan_uom_1.jpg"]');

-- ============================================================
--  BLOG POSTS — 10 bài viết
-- ============================================================
UPDATE product_details
  SET content = description
  WHERE content IS NULL;

UPDATE product_details
  SET care_guide = 'Đặt nơi sáng nhẹ, tưới khi mặt đất khô, lau lá định kỳ.',
      sunlight_level = 'Ánh sáng gián tiếp thấp đến trung bình',
      water_freq = '1 lần/tuần',
      difficulty = 'Dễ',
      feng_shui_element = 'Mộc'
  WHERE product_id = 1;

UPDATE product_details
  SET care_guide = 'Để nơi sáng dịu, tránh nắng gắt buổi trưa, tưới ít nhưng đều.',
      sunlight_level = 'Ánh sáng gián tiếp thấp',
      water_freq = '7-10 ngày/lần',
      difficulty = 'Dễ',
      feng_shui_element = 'Mộc'
  WHERE product_id = 2;

UPDATE product_details
  SET care_guide = 'Ưa sáng vừa, tưới khi đất ráo, phù hợp góc phòng thoáng.',
      sunlight_level = 'Ánh sáng trung bình',
      water_freq = '1 lần/tuần',
      difficulty = 'Dễ',
      feng_shui_element = 'Kim'
  WHERE product_id = 3;

UPDATE product_details
  SET care_guide = 'Cần ánh sáng ổn định, tưới vừa phải và kiểm tra thoát nước.',
      sunlight_level = 'Ánh sáng trung bình đến cao',
      water_freq = '1 lần/tuần',
      difficulty = 'Trung bình',
      feng_shui_element = 'Mộc'
  WHERE product_id = 4;

UPDATE product_details
  SET care_guide = 'Có thể treo hoặc đặt kệ, chịu thiếu sáng tốt, tưới khi khô bề mặt.',
      sunlight_level = 'Ánh sáng thấp đến trung bình',
      water_freq = '1 lần/tuần',
      difficulty = 'Dễ',
      feng_shui_element = 'Thủy'
  WHERE product_id = 5;

UPDATE product_details
  SET care_guide = 'Ưa nơi sáng, giữ ẩm vừa phải, lau lá để giữ bề mặt đẹp.',
      sunlight_level = 'Ánh sáng gián tiếp sáng',
      water_freq = '5-7 ngày/lần',
      difficulty = 'Trung bình',
      feng_shui_element = 'Mộc'
  WHERE product_id = 6;

UPDATE product_details
  SET care_guide = 'Phù hợp người mới, chăm đơn giản, tưới khi đất khô nhẹ.',
      sunlight_level = 'Ánh sáng thấp đến trung bình',
      water_freq = '7-10 ngày/lần',
      difficulty = 'Dễ',
      feng_shui_element = 'Mộc'
  WHERE product_id = 7;

UPDATE product_details
  SET care_guide = 'Thân cao, cần ánh sáng tốt và chỗ đứng ổn định.',
      sunlight_level = 'Ánh sáng trung bình',
      water_freq = '7-10 ngày/lần',
      difficulty = 'Dễ',
      feng_shui_element = 'Mộc'
  WHERE product_id = 8;

UPDATE product_details
  SET care_guide = 'Ưa không gian sáng nhẹ, tưới vừa đủ để giữ tán lá cân đối.',
      sunlight_level = 'Ánh sáng trung bình',
      water_freq = '1 lần/tuần',
      difficulty = 'Dễ',
      feng_shui_element = 'Mộc'
  WHERE product_id = 9;

UPDATE product_details
  SET care_guide = 'Rất dễ chăm, tưới ít, tránh ngập nước và giữ nơi thoáng.',
      sunlight_level = 'Ánh sáng thấp',
      water_freq = '10 ngày/lần',
      difficulty = 'Dễ',
      feng_shui_element = 'Thủy'
  WHERE product_id = 10;

UPDATE product_details
  SET care_guide = 'Ưa nơi sáng nhưng không gắt, giữ độ ẩm đều để lá đẹp.',
      sunlight_level = 'Ánh sáng gián tiếp sáng',
      water_freq = '5-7 ngày/lần',
      difficulty = 'Trung bình',
      feng_shui_element = 'Kim'
  WHERE product_id = 11;

UPDATE product_details
  SET care_guide = 'Hợp không gian sảnh hoặc phòng khách, tưới vừa phải và cắt tỉa gọn.',
      sunlight_level = 'Ánh sáng trung bình',
      water_freq = '1 lần/tuần',
      difficulty = 'Dễ',
      feng_shui_element = 'Mộc'
  WHERE product_id = 12;

INSERT INTO blog_posts (author_id, title, content, thumbnail, is_published, status, published_at) VALUES
(2, 'Top 10 cây trong nhà dễ chăm nhất cho người bận rộn',
 'Bạn yêu cây nhưng không có nhiều thời gian chăm sóc? Đây là danh sách 10 loại cây cực dễ chăm: Lưỡi hổ, ZZ Plant, Pothos, Trầu bà... Những loại cây này chỉ cần tưới 1-2 lần mỗi tuần, chịu bóng tốt và vẫn phát triển khỏe mạnh.',
 'top10_cay_de_cham.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Hướng dẫn chăm sóc sen đá cho người mới bắt đầu',
 'Sen đá là lựa chọn hoàn hảo cho người mới chơi cây. Bài viết này hướng dẫn chi tiết: cách chọn đất, tưới nước đúng cách, chọn vị trí đặt cây, và cách nhân giống sen đá tại nhà đơn giản.',
 'cham_soc_sen_da.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Cây phong thủy nào phù hợp với từng không gian trong nhà?',
 'Mỗi không gian trong nhà có những cây phong thủy phù hợp khác nhau. Cùng Greenshop tìm hiểu cây nào đặt phòng khách, cây nào đặt phòng ngủ, và cây nào cho nhà bếp để mang lại may mắn và tài lộc.',
 'cay_phong_thuy.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, '5 sai lầm phổ biến khi chăm sóc cây xanh trong nhà',
 'Chăm sóc cây xanh tưởng dễ nhưng không phải ai cũng làm đúng. Bài viết liệt kê 5 sai lầm phổ biến nhất: tưới quá nhiều nước, đặt cây ở nơi thiếu ánh sáng, không bón phân đúng cách... và cách khắc phục.',
 'sai_lam_cham_cay.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Xu hướng trồng cây xanh trong văn phòng 2026',
 'Trồng cây xanh trong văn phòng không chỉ giúp không gian đẹp hơn mà còn tăng năng suất làm việc. Khám phá những loại cây được ưa chuộng nhất trong văn phòng hiện đại và cách bố trí hợp lý.',
 'xu_huong_cay_van_phong.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Trồng rau thơm tại nhà: Hướng dẫn từ A đến Z',
 'Bạn muốn có rau thơm tươi ngon ngay tại bếp nhà mình? Hướng dẫn chi tiết cách trồng rau mùi, húng quế, bạc hà và các loại rau thơm phổ biến trong chậu nhỏ, trên ban công.',
 'trong_rau_thom.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Cách phòng và trị bệnh phổ biến ở cây trồng trong nhà',
 'Cây trồng trong nhà thường gặp các bệnh như vàng lá, rụng lá, nấm mốc. Bài viết hướng dẫn cách nhận biết sớm các dấu hiệu bệnh và phương pháp điều trị an toàn bằng thuốc sinh học.',
 'benh_cay_trong_nha.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Bonsai mini: Nghệ thuật thu nhỏ thiên nhiên',
 'Bonsai không chỉ dành cho người lớn tuổi. Xu hướng bonsai mini đang rất hot với những cây nhỏ xinh trồng trong chậu, phù hợp trang trí bàn làm việc, kệ sách. Cùng Greenshop khám phá nghệ thuật này.',
 'bonsai_mini.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Terrarium: Khu vườn thu nhỏ trong lòng bàn tay',
 'Terrarium là xu hướng trồng cây rất được yêu thích, đặc biệt với những người sống trong căn hộ nhỏ. Tạo một terrarium xanh mát với sen đá, xương rồng và các loại cây nhỏ để bàn.',
 'terrarium.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP),

(2, 'Cây lọc không khí tốt nhất theo nghiên cứu của NASA',
 'NASA đã nghiên cứu và chứng minh nhiều loại cây có khả năng lọc các chất độc hại trong không khí. Bài viết điểm danh top 5 loại cây hiệu quả nhất: Lan ý, Lưỡi hổ, Dây leo vàng, Peace Lily và Dracaena.',
 'cay_loc_khong_khi.jpg', TRUE, 'PUBLISHED', CURRENT_TIMESTAMP);

-- ============================================================
--  BLOG TAGS
-- ============================================================
INSERT INTO blog_tags (blog_post_id, tag) VALUES
(1, 'BEGINNER_GUIDE'),
(1, 'CARE_TIPS'),
(2, 'CARE_TIPS'),
(2, 'BEGINNER_GUIDE'),
(3, 'DECOR_IDEAS'),
(3, 'PLANT_SPOTLIGHT'),
(4, 'CARE_TIPS'),
(5, 'DECOR_IDEAS'),
(5, 'NEWS_EVENT'),
(6, 'DIY_PROJECT'),
(6, 'BEGINNER_GUIDE'),
(7, 'PEST_DISEASE'),
(8, 'DIY_PROJECT'),
(8, 'DECOR_IDEAS'),
(9, 'DIY_PROJECT'),
(9, 'DECOR_IDEAS'),
(10, 'PLANT_SPOTLIGHT'),
(10, 'NEWS_EVENT');

-- ============================================================
--  BLOG IMAGES
-- ============================================================
INSERT INTO blog_images (blog_id, image_url, is_primary, sort_order) VALUES
       (1, 'blog/top10_cay_1.jpg', TRUE, 0),
       (2, 'blog/senda_huongdan_1.jpg', TRUE, 0),
       (2, 'blog/senda_huongdan_2.jpg', FALSE, 1),
       (3, 'blog/phongthuy_1.jpg', TRUE, 0),
       (4, 'blog/sailam_1.jpg', TRUE, 0),
       (5, 'blog/vanphong_1.jpg', TRUE, 0),
       (6, 'blog/rauthom_1.jpg', TRUE, 0),
       (6, 'blog/rauthom_2.jpg', FALSE, 1),
       (7, 'blog/benhcay_1.jpg', TRUE, 0),
       (8, 'blog/bonsai_1.jpg', TRUE, 0),
       (9, 'blog/terrarium_1.jpg', TRUE, 0),
       (10, 'blog/loc_khong_khi_1.jpg', TRUE, 0);
UPDATE blog_images
SET post_id = blog_id
WHERE post_id IS NULL
  AND blog_id IS NOT NULL;
-- ============================================================
--  BLOG VOTES
-- ============================================================

INSERT INTO blog_votes (blog_id, user_id, is_upvote) VALUES
 (1, 5, TRUE),
 (1, 6, TRUE),
 (1, 7, TRUE),
 (2, 5, TRUE),
 (2, 6, TRUE),
 (3, 5, TRUE),
 (3, 6, TRUE),
 (3, 7, TRUE),
 (4, 6, TRUE),
 (5, 5, TRUE),
 (5, 7, TRUE),
 (6, 5, TRUE),
 (7, 6, TRUE),
 (8, 5, TRUE),
 (8, 6, TRUE),
 (9, 5, TRUE),
 (10, 5, TRUE),
 (10, 6, TRUE),
 (10, 7, TRUE);

UPDATE blog_votes
SET post_id = blog_id
WHERE post_id IS NULL
  AND blog_id IS NOT NULL;

-- ============================================================
--  NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, type, title, message, reference_id) VALUES
(5, 'ORDER_STATUS', 'Đơn hàng đang được giao', 'Đơn hàng #1 của bạn đang được giao đến địa chỉ 123 Nguyễn Trãi, Quận 1, TP.HCM', 1),
(6, 'ORDER_STATUS', 'Đơn hàng đang được giao', 'Đơn hàng #2 của bạn đang được giao đến địa chỉ 45 Lê Lợi, Quận Hải Châu, Đà Nẵng', 2),
(7, 'ORDER_STATUS', 'Giao hàng thành công', 'Đơn hàng #3 của bạn đã được giao thành công', 3),
(5, 'TICKET_UPDATE', 'Ticket đã được xử lý', 'Ticket "Yêu cầu đổi cây bị hư" đã được xử lý', 1),
(5, 'BLOG', 'Bài viết mới', 'Greenshop vừa đăng bài viết mới: "Top 10 cây trong nhà dễ chăm nhất cho người bận rộn"', 1),
(6, 'BLOG', 'Bài viết mới', 'Greenshop vừa đăng bài viết mới: "Hướng dẫn chăm sóc sen đá cho người mới bắt đầu"', 2),
(7, 'BLOG', 'Bài viết mới', 'Greenshop vừa đăng bài viết mới: "Cây phong thủy nào phù hợp với từng không gian trong nhà?"', 3),
(1, 'PROMOTION', 'Khuyến mãi mới', 'Giảm 20% cho đơn hàng đầu tiên! Mã: GREENSHOOT20', NULL),
(2, 'SYSTEM', 'Chào mừng', 'Chào mừng bạn đến với Greenshop! Hãy khám phá các sản phẩm cây xanh của chúng tôi.', NULL);

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
  (6, 22, 3),
  (6, 84, 2);

-- ============================================================
--  ORDERS — 8 đơn hàng
-- ============================================================
INSERT INTO orders (customer_id, shipper_id, shipping_address, shipping_fee, discount, status) VALUES
       (5,  3, '123 Nguyễn Trãi, Quận 1, TP.HCM',30000, 0,      'DELIVERING'),
       (6,  3, '45 Lê Lợi, Quận Hải Châu, Đà Nẵng',        30000, 15000,  'DELIVERING'),
       (7,  3, '78 Hoàn Kiếm, Hà Nội', 30000, 0,      'ARRIVED'),
       (5, NULL, '56 Trần Hưng Đạo, Quận 5, TP.HCM',        30000, 0,      'PROCESSING'),
       (6, NULL, '89 Lý Thường Kiệt, Quận 10, TP.HCM',      30000, 0,      'PROCESSING'),
       (8, NULL, '12 Hai Bà Trưng, Quận 1, TP.HCM',30000, 30000,  'PENDING'),
       (9, NULL, '34 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',30000, 0,    'PENDING'),
       (10, NULL,'67 Nguyễn Huệ, Quận 1, TP.HCM',  30000, 0,      'PENDING');

-- ============================================================
--  ORDER DETAILS
-- ============================================================
INSERT INTO order_detail (order_id, product_id, quantity, price_paid) VALUES
        (1, 3,  2, 240000),
        (1, 51, 1, 150000),
        (2, 6,  1, 250000),
        (2, 28, 1, 550000),
        (3, 14, 2, 360000),
        (4, 41, 3, 105000),
        (5, 76, 2, 170000),
        (6, 22, 1, 350000),
        (7, 83, 1, 220000),
        (8, 64, 2, 190000);

-- ============================================================
--  REVIEWS
-- ============================================================
INSERT INTO reviews (order_id, product_id, customer_id, rating, comment, is_curated, is_hidden) VALUES
        (3, 14, 7, 5, 'Cây rất đẹp, giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ tiếp!', TRUE, FALSE),
        (1, 3,  5, 4, 'Cây xanh tốt, chăm sóc dễ dàng. Nhưng giao hơi trễ 1 ngày.', FALSE, FALSE),
        (2, 6,  6, 5, 'Monstera đẹp vượt mong đợi! Lá xẻ đều, tươi tắn. Đóng gói rất chuyên nghiệp.', TRUE, FALSE),
        (4, 41, 5, 3, 'Sen đá nhỏ hơn hình, nhưng chất lượng OK.', FALSE, FALSE),
        (5, 76, 6, 5, 'Sedum tricolor đẹp mê ly! Đã đặt thêm 2 chậu nữa.', TRUE, FALSE);
        (1, 3, 5, 5, 'Cây đẹp đúng như mô tả, đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!', TRUE, FALSE),
        (1, 76, 5, 4, 'Chậu đẹp, chất lượng tốt, giá hợp lý. Sẽ mua lại lần sau.', TRUE, FALSE),
        (2, 6, 6, 5, 'Monstera đẹp lắm, lá to khỏe, không bị dập nát khi vận chuyển. 5 sao!', TRUE, FALSE),
        (3, 14, 7, 4, 'ZZ Plant khỏe mạnh, đúng size, tuy nhiên chậu hơi nhỏ so với cây.', TRUE, FALSE),
        (7, 3, 5, 5, 'Mua lần 2 vẫn rất hài lòng, kim tiền lên nhanh tốt lắm!', TRUE, FALSE),
        (9, 11, 5, 5, 'Cây Sanh Bonsai dáng rất nghệ thuật, giao nhanh.', TRUE, FALSE),
        (10, 24, 5, 3, 'Hoa giấy hơi nhỏ so với ảnh chụp nhưng bù lại cây khá tươi.', FALSE, FALSE);

-- ============================================================
--  TICKETS
-- ============================================================
INSERT INTO tickets (creator_id, assignee_id, title, detail, state, priority) VALUES
      (5, 4, 'Yêu cầu đổi cây bị hư', 'Cây Kim Tiền giao đến bị vàng lá, xin đổi cây mới.', 'RESOLVED', 'HIGH'),
      (7, 4, 'Hỏi về chính sách bảo hành', 'Cây mua được 5 ngày có được bảo hành không?', 'DONE', 'LOW'),
      (8, NULL, 'Yêu cầu tư vấn chọn cây', 'Cần tư vấn cây phù hợp cho phòng ngủ hướng Bắc.', 'PROCESSING', 'MEDIUM');

-- ============================================================
--  COMMENTS
-- ============================================================
INSERT INTO comments (ticket_id, creator_id, detail) VALUES
(1, 4, 'Cảm ơn bạn đã phản hồi. Chúng tôi sẽ gửi cây thay thế trong 24h.'),
(2, 4, 'Cây được bảo hành 7 ngày. Bạn cung cấp hình ảnh để chúng tôi kiểm tra nhé.'),
(1, 5, 'Cảm ơn shop đã hỗ trợ nhanh chóng!');
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

