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
DROP TYPE IF EXISTS order_status CASCADE;
DROP TABLE IF EXISTS return_request_item CASCADE;
DROP TYPE IF EXISTS return_request CASCADE;

-- ===============================
-- RETURN REQUEST
-- ===============================

CREATE TABLE return_request (

    id VARCHAR(36) PRIMARY KEY,

    order_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,

    reason VARCHAR(50) NOT NULL,
    return_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    expected_fee NUMERIC(12,2),
    price_difference NUMERIC(12,2),
    refund_amount NUMERIC(12,2),
    additional_payment NUMERIC(12,2),

    financial_processed BOOLEAN NOT NULL DEFAULT FALSE,

    bank_name VARCHAR(255),
    bank_account VARCHAR(255),
    account_number VARCHAR(255),
    account_holder VARCHAR(255),

    manager_note VARCHAR(1000),

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,


    CONSTRAINT fk_return_request_order
        FOREIGN KEY(order_id)
        REFERENCES orders(id),


    CONSTRAINT fk_return_request_customer
        FOREIGN KEY(customer_id)
        REFERENCES users(id)

);

-- ===============================
-- RETURN REQUEST ITEM
-- ===============================

CREATE TABLE return_request_item (

    id VARCHAR(36) PRIMARY KEY,

    return_request_id VARCHAR(36) NOT NULL,

    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL,


    CONSTRAINT fk_return_item_request
        FOREIGN KEY(return_request_id)
        REFERENCES return_request(id)
        ON DELETE CASCADE,


    CONSTRAINT fk_return_item_order_detail
        FOREIGN KEY(order_id, product_id)
        REFERENCES order_detail(order_id, product_id)

);



-- ===============================
-- RETURN EVIDENCE
-- ===============================

CREATE TABLE return_evidence (

    id BIGSERIAL PRIMARY KEY,

    return_request_id VARCHAR(36) NOT NULL,

    image_url TEXT NOT NULL,

    image_data BYTEA,

    file_name VARCHAR(255),

    content_type VARCHAR(255),

    description TEXT,


    CONSTRAINT fk_return_evidence_request
        FOREIGN KEY(return_request_id)
        REFERENCES return_request(id)
        ON DELETE CASCADE

);



-- ===============================
-- RETURN EXCHANGE PRODUCT
-- ===============================

CREATE TABLE return_exchange_product (

    id BIGSERIAL PRIMARY KEY,

    return_request_id VARCHAR(36) NOT NULL UNIQUE,

    product_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 1,


    CONSTRAINT fk_exchange_request
        FOREIGN KEY(return_request_id)
        REFERENCES return_request(id)
        ON DELETE CASCADE,


    CONSTRAINT fk_exchange_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)

);

CREATE TABLE role
(
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
        CHECK (name IN ('CUSTOMER', 'MANAGER', 'SHIPPER', 'SUPPORT_AGENT', 'SYSTEM_ADMIN'))
);

-- ============================================================

CREATE TABLE users
(
    id         BIGSERIAL PRIMARY KEY,
    role_id    BIGINT       NOT NULL DEFAULT 1 REFERENCES role (id),
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255),
    full_name  VARCHAR(150) NOT NULL,
    phone      VARCHAR(20),
    status     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role_id ON users (role_id);

-- ============================================================

CREATE TABLE categories
(
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id   BIGINT       REFERENCES categories (id) ON DELETE SET NULL
);

-- ============================================================

CREATE TABLE products
(
    id          BIGSERIAL PRIMARY KEY,
    category_id BIGINT         REFERENCES categories (id) ON DELETE SET NULL,
    name        VARCHAR(200)   NOT NULL,
    price       DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    stock       INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku         VARCHAR(50)    NOT NULL UNIQUE,
    status      BOOLEAN        NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_sku ON products (sku);

-- ============================================================

CREATE TABLE product_details
(
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT NOT NULL UNIQUE REFERENCES products (id) ON DELETE CASCADE,
    description       TEXT,
    content           TEXT,
    care_guide        TEXT,
    sunlight_level    VARCHAR(50),
    water_freq        VARCHAR(50),
    difficulty        VARCHAR(50),
    feng_shui_element VARCHAR(50),
    images            JSON
);

ALTER TABLE product_details
    ADD COLUMN IF NOT EXISTS care_guide TEXT;
ALTER TABLE product_details
    ADD COLUMN IF NOT EXISTS sunlight_level TEXT;
ALTER TABLE product_details
    ADD COLUMN IF NOT EXISTS water_freq TEXT;
ALTER TABLE product_details
    ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE product_details
    ADD COLUMN IF NOT EXISTS feng_shui_element TEXT;

-- ============================================================

CREATE TYPE order_status as ENUM ('PROCESSING', 'PENDING', 'DELIVERING', 'ARRIVED', 'RETURN_PROCESSING', 'RETURN_PENDING', 'RETURNING', 'RECEIVED', 'FAILED');

CREATE TABLE orders
(
   id               BIGSERIAL PRIMARY KEY,
   customer_id      BIGINT NOT NULL REFERENCES users(id),
   shipper_id       BIGINT REFERENCES users(id),
   shipping_address TEXT,
   shipping_fee     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
   discount         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
   status           order_status NOT NULL DEFAULT 'PROCESSING',
   created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   delivery_date    TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- ============================================================

CREATE TABLE order_detail
(
    order_id   BIGINT         NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id BIGINT         NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
    quantity   INT            NOT NULL CHECK (quantity > 0),
    price_paid DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- ============================================================

CREATE TABLE shopping_carts
(
    id          BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE shopping_cart_entry
(
    cart_id    BIGINT NOT NULL REFERENCES shopping_carts (id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity   INT    NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE wishlist_items
(
    customer_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, product_id)
);

-- ============================================================

CREATE TABLE reviews
(
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT    NOT NULL REFERENCES orders (id),
    product_id  BIGINT    NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    customer_id BIGINT    NOT NULL REFERENCES users (id),
    rating      SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_curated  BOOLEAN   NOT NULL DEFAULT FALSE,
    is_hidden   BOOLEAN   NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_reviews_order ON reviews (order_id);
CREATE INDEX idx_reviews_customer ON reviews (customer_id);

-- ============================================================

CREATE TABLE tickets
(
    id            BIGSERIAL PRIMARY KEY,
    creator_id    BIGINT       NOT NULL REFERENCES users (id),
    assignee_id   BIGINT REFERENCES users (id),
    title         VARCHAR(255) NOT NULL,
    detail        TEXT         NOT NULL,
    state         VARCHAR(20)  NOT NULL DEFAULT 'CREATED'
        CHECK (state IN ('CREATED', 'PROCESSING', 'RESOLVED', 'DONE')),
    priority      VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    time_created  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_resolved TIMESTAMP
);

CREATE INDEX idx_tickets_creator ON tickets (creator_id);
CREATE INDEX idx_tickets_assignee ON tickets (assignee_id);
CREATE INDEX idx_tickets_state ON tickets (state);

-- ============================================================

CREATE TABLE comments
(
    id           BIGSERIAL PRIMARY KEY,
    ticket_id    BIGINT    NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    creator_id   BIGINT    NOT NULL REFERENCES users (id),
    detail       TEXT      NOT NULL,
    time_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_ticket ON comments (ticket_id);

-- ============================================================

CREATE TABLE policies
(
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    description TEXT         NOT NULL,
    status      VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO policies (title, description, status)
VALUES ('Chính sách Đổi trả & Hoàn tiền', '## 1. Điều kiện đổi trả
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
- Cây được cố định chắc chắn trong thùng carton hộp chữ nhật hoặc khung gỗ (đối với cây lớn) để chống sốc và chống lật.',
        'PUBLISHED'),
       ('Chính sách Bảo hành Cây xanh', '## 1. Thời gian bảo hành
Tất cả các loại cây xanh mua tại **Greenshop** đều được bảo hành sức khỏe trong vòng **7 ngày** đầu kể từ khi nhận hàng.

## 2. Hỗ trợ trọn đời
- Chúng tôi cung cấp dịch vụ **tư vấn chăm sóc cây miễn phí trọn đời**.
- Bất cứ khi nào cây của bạn có dấu hiệu bất thường (vàng lá, rụng lá, nấm mốc,...), hãy chụp ảnh và gửi qua kênh chat hoặc Zalo của cửa hàng để được đội ngũ kỹ thuật hỗ trợ kịp thời.

## 3. Thay cây mới
Nếu cây bị chết trong thời gian bảo hành do nguyên nhân bệnh lý có sẵn từ nhà vườn (được xác nhận bởi kỹ thuật viên của chúng tôi), Greenshop sẽ **1 đổi 1** cây mới cùng loại cho bạn.',
        'PUBLISHED'),
       ('Chính sách Bảo mật Thông tin', '## 1. Mục đích thu thập thông tin
Greenshop thu thập thông tin cá nhân (Họ tên, Số điện thoại, Địa chỉ, Email) của khách hàng chỉ nhằm mục đích:
- Xử lý đơn đặt hàng và giao hàng.
- Cung cấp dịch vụ hỗ trợ khách hàng và giải quyết khiếu nại.
- Gửi thông tin khuyến mãi, ưu đãi dành cho khách hàng thân thiết (nếu khách hàng đăng ký nhận tin).

## 2. Cam kết bảo mật
- Mọi thông tin của khách hàng được bảo mật tuyệt đối trên hệ thống máy chủ của chúng tôi.
- **Greenshop cam kết không bán, trao đổi hay chia sẻ** thông tin của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại, ngoại trừ việc cung cấp địa chỉ cho đơn vị vận chuyển.

## 3. Quyền của khách hàng
Khách hàng có quyền yêu cầu Greenshop kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bất cứ lúc nào.',
        'PUBLISHED'),
       ('Chính sách Khách hàng Thân thiết', '## 1. Tích điểm thưởng
- Cứ mỗi **10.000 VNĐ** giá trị đơn hàng được thanh toán thành công, khách hàng sẽ tích lũy được **1 điểm**.
- Điểm thưởng được tự động cộng vào tài khoản sau khi đơn hàng chuyển sang trạng thái "Giao hàng thành công".

## 2. Quy đổi và Ưu đãi
- Điểm thưởng có thể được dùng để quy đổi thành **Mã giảm giá** cho các lần mua sắm tiếp theo.
- Khách hàng có ngày sinh nhật trong tháng sẽ nhận được Voucher giảm giá **20%** cho một đơn hàng bất kỳ.

## 3. Hạng thành viên
- **Thành viên Bạc:** Tổng chi tiêu trên 2.000.000 VNĐ - Giảm thêm 5% mọi đơn hàng.
- **Thành viên Vàng:** Tổng chi tiêu trên 5.000.000 VNĐ - Giảm thêm 10% mọi đơn hàng + Quà tặng kèm theo mùa.',
        'PUBLISHED'),
       ('Chính sách Thanh toán', '## 1. Các phương thức thanh toán
Greenshop hiện đang hỗ trợ các phương thức thanh toán linh hoạt và an toàn:
- **Thanh toán khi nhận hàng (COD):** Khách hàng kiểm tra hàng và thanh toán trực tiếp cho nhân viên giao hàng.
- **Chuyển khoản ngân hàng:** Khách hàng chuyển khoản qua Internet Banking vào số tài khoản của cửa hàng.
- **Thanh toán qua Ví điện tử:** Hỗ trợ thanh toán qua VNPay, Momo, ZaloPay tiện lợi.

## 2. Quy định thanh toán đối với đơn hàng lớn
Đối với các đơn hàng có giá trị lớn hơn **2.000.000 VNĐ** hoặc các đơn hàng đặt thiết kế thi công tiểu cảnh, khách hàng vui lòng đặt cọc trước **30%** giá trị đơn hàng.

## 3. Bảo mật thanh toán
Tất cả các giao dịch trực tuyến qua thẻ hay ví điện tử đều được mã hóa an toàn theo tiêu chuẩn SSL, đảm bảo không rò rỉ dữ liệu tài chính của khách hàng.',
        'PUBLISHED');

-- ============================================================
--  THÊM BẢNG BLOG
-- ============================================================

CREATE TABLE blog_posts
(
    id                BIGSERIAL PRIMARY KEY,
    author_id         BIGINT       NOT NULL REFERENCES users (id),

    title             VARCHAR(300) NOT NULL,
    content           TEXT         NOT NULL,
    thumbnail         TEXT,

    is_published      BOOLEAN      NOT NULL DEFAULT FALSE,

    status            VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
        CHECK (
            status IN (
                       'DRAFT',
                       'PENDING',
                       'PUBLISHED',
                       'REJECTED'
                )
            ),

    pending_reason    TEXT,

    -- staged edit
    pending_title     VARCHAR(300),
    pending_content   TEXT,
    pending_thumbnail TEXT,
    has_pending_edit  BOOLEAN      NOT NULL DEFAULT FALSE,

    view_count        INT          NOT NULL DEFAULT 0,

    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at      TIMESTAMP
);

CREATE INDEX idx_blog_author
    ON blog_posts (author_id);

CREATE INDEX idx_blog_published
    ON blog_posts (is_published);

CREATE INDEX idx_blog_status
    ON blog_posts (status);

-- ============================================================
--  BLOG IMAGES
-- ============================================================

CREATE TABLE blog_images
(
    id           BIGSERIAL PRIMARY KEY,

    -- giữ blog_id cho code/seed từ branch cũ
    blog_id      BIGINT REFERENCES blog_posts (id) ON DELETE CASCADE,

    -- giữ post_id cho code blog mới
    post_id      BIGINT REFERENCES blog_posts (id) ON DELETE CASCADE,

    image_url    TEXT      NOT NULL,

    -- binary image
    image_data   BYTEA,
    file_name    VARCHAR(255),
    content_type VARCHAR(100),

    -- staged edit
    is_pending   BOOLEAN   NOT NULL DEFAULT FALSE,

    -- metadata từ branch hiện tại
    is_primary   BOOLEAN   NOT NULL DEFAULT FALSE,
    sort_order   INT       NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_images_blog
    ON blog_images (blog_id);

CREATE INDEX idx_blog_images_post
    ON blog_images (post_id);

-- ============================================================
--  BLOG TAGS
-- ============================================================

CREATE TABLE blog_tags
(
    id           BIGSERIAL PRIMARY KEY,
    blog_post_id BIGINT       NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
    tag          VARCHAR(100) NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (blog_post_id, tag)
);

CREATE INDEX idx_blog_tags_blog ON blog_tags (blog_post_id);
CREATE INDEX idx_blog_tags_name ON blog_tags (tag);

-- ============================================================
--  BLOG VOTES
-- ============================================================

CREATE TABLE blog_votes
(
    id         BIGSERIAL PRIMARY KEY,

    -- branch cũ
    blog_id    BIGINT REFERENCES blog_posts (id) ON DELETE CASCADE,

    -- branch mới
    post_id    BIGINT REFERENCES blog_posts (id) ON DELETE CASCADE,

    user_id    BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    is_upvote  BOOLEAN   NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_votes_blog
    ON blog_votes (blog_id);

CREATE INDEX idx_blog_votes_post
    ON blog_votes (post_id);

CREATE INDEX idx_blog_votes_user
    ON blog_votes (user_id);

-- ============================================================
--  NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications
(
    id                BIGSERIAL PRIMARY KEY,

    -- notification hệ thống hiện tại
    user_id           BIGINT REFERENCES users (id) ON DELETE CASCADE,

    -- notification email từ branch merge
    recipient_user_id BIGINT REFERENCES users (id),
    recipient_role_id BIGINT REFERENCES role (id),

    type              VARCHAR(50) NOT NULL,

    title             VARCHAR(255),
    message           TEXT,
    reference_id      BIGINT,

    recipient_email   VARCHAR(150),
    subject           VARCHAR(255),
    content           TEXT,

    sent_via_email    BOOLEAN     NOT NULL DEFAULT FALSE,
    email_send_failed BOOLEAN     NOT NULL DEFAULT FALSE,

    is_read           BOOLEAN     NOT NULL DEFAULT FALSE,

    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user
    ON notifications (user_id);

CREATE INDEX idx_notifications_recipient_user
    ON notifications (recipient_user_id);

CREATE INDEX idx_notifications_recipient_role
    ON notifications (recipient_role_id);

CREATE INDEX idx_notifications_read
    ON notifications (is_read);

CREATE INDEX idx_notifications_created
    ON notifications (created_at DESC);
-- ============================================================
--  DỮ LIỆU MẪU
-- ============================================================

-- ROLES (đã có từ trước, bỏ qua nếu đã chạy)
INSERT INTO role (name)
VALUES ('CUSTOMER'),
       ('MANAGER'),
       ('SHIPPER'),
       ('SUPPORT_AGENT'),
       ('SYSTEM_ADMIN');


-- ============================================================
--  USERS — 10 người
-- ============================================================
INSERT INTO users (role_id, email, password, full_name, phone, status)
VALUES (5, 'admin@greenshop.vn', '$2a$10$zUuzRUvsOH8nimZ/6lsPjulnRHrSvOzYJBTTi4oHlOqWgHzt4a6qW', 'Nguyễn Văn Admin',
        '0901000001', TRUE),
       (2, 'manager@greenshop.vn', '$2a$10$A9Q6dl4y.iQJP17qh9bhO.iNLk6rXYJgRPsaRLdftmv6SBfqIiE2a', 'Trần Thị Manager',
        '0901000002', TRUE),
       (3, 'shipper1@greenshop.vn', '$2a$10$v/Tois3Yz7/IUAjX1xa8zucglisqqtzIDMxkx8w8UZfDgEM2/DQ0i', 'Lê Văn Shipper',
        '0901000003', TRUE),
       (4, 'support@greenshop.vn', '$2a$10$WD9TzMIoFF2HeQ2i8mg9COIf8o7MY.jlAo3mR58q1ASMduxLxwIoe', 'Phạm Thị Support',
        '0901000004', TRUE),
       (1, 'khach1@gmail.com', '$2a$10$bYepmqDIFtLHufQ39FhQxuX2dhPeUtzDcvf0868FSOgyGpCf0lhmi', 'Hoàng Minh Tuấn',
        '0912345601', TRUE),
       (1, 'khach2@gmail.com', '$2a$10$uSQpjK3zgkNtvaCz4daxt.jlbT7p05zWykHz2qqtCff4tfIjKw5dm', 'Nguyễn Thị Lan',
        '0912345602', TRUE),
       (1, 'khach3@gmail.com', '$2a$10$6C6K1VVzL3AU1awnFwIs/erFeGnZa2afajieslO/VWhUUPADeW2re', 'Vũ Đức Thành',
        '0912345603', TRUE),
       (1, 'khach4@gmail.com', '$2a$10$DSoyFP33CagNeomlF.gUteBOxPzTICRHfWtwlg0jD6i.wDfUuqDDm', 'Đặng Thu Hương',
        '0912345604', TRUE),
       (1, 'khach5@gmail.com', '$2a$10$cIjhGxmnba.JgJcr7qi9a.Q25KOvM0O2tucA3l7gpQueqNbyQN6gG', 'Bùi Quang Huy',
        '0912345605', TRUE),
       (1, 'khach6@gmail.com', '$2a$10$lLkYkek4Cc39DHC4WVnWJuKWVJS1nOSmHVdxYYfobuEjxVcbM57f2', 'Lý Thị Mai',
        '0912345606', TRUE);

-- ============================================================
--  CATEGORIES — 6 danh mục
-- ============================================================
INSERT INTO categories (name, description)
VALUES ('Cây trong nhà', 'Các loại cây phù hợp trồng trong nhà, ít cần ánh sáng'),
       ('Cây ngoài trời', 'Các loại cây phù hợp trồng ngoài ban công, sân vườn'),
       ('Cây để bàn', 'Cây nhỏ gọn trang trí bàn làm việc'),
       ('Sen đá & Xương rồng', 'Các loại cây mọng nước dễ chăm sóc'),
       ('Cây phong thủy', 'Cây mang ý nghĩa phong thủy, may mắn'),
       ('Phụ kiện', 'Chậu cây, đất trồng, phân bón và dụng cụ làm vườn');

-- ============================================================
--  PRODUCTS — 100 sản phẩm
-- ============================================================
INSERT INTO products (category_id, name, price, stock, sku, status)
VALUES
-- Cây trong nhà (category 1)
(1, 'Cây Trầu Bà Xanh', 85000, 50, 'SKU-001', TRUE),
(1, 'Cây Lưỡi Hổ Nhỏ', 95000, 45, 'SKU-002', TRUE),
(1, 'Cây Kim Tiền', 120000, 60, 'SKU-003', TRUE),
(1, 'Cây Phát Lộc', 150000, 40, 'SKU-004', TRUE),
(1, 'Cây Dây Leo Pothos', 75000, 80, 'SKU-005', TRUE),
(1, 'Cây Monstera Nhỏ', 250000, 30, 'SKU-006', TRUE),
(1, 'Cây Trầu Bà Vàng', 90000, 55, 'SKU-007', TRUE),
(1, 'Cây Dracaena Xanh', 180000, 25, 'SKU-008', TRUE),
(1, 'Cây Ficus Nhỏ', 200000, 20, 'SKU-009', TRUE),
(1, 'Cây Lan Ý', 120000, 35, 'SKU-010', TRUE),
(1, 'Cây ZZ Plant', 280000, 15, 'SKU-011', TRUE),
(1, 'Cây Xương Rồng Tai Thỏ', 45000, 100, 'SKU-012', TRUE),
(1, 'Cây Lưỡi Hổ Vàng', 110000, 40, 'SKU-013', TRUE),
(1, 'Cây Hồng Môn Đỏ', 180000, 25, 'SKU-014', TRUE),
(1, 'Cây Thiết Mộc Lan', 220000, 20, 'SKU-015', TRUE),
(1, 'Cây Trầu Bà Sọc Vàng', 85000, 65, 'SKU-016', TRUE),
(1, 'Cây Phú Quý Thủy Sinh', 150000, 30, 'SKU-017', TRUE),
(1, 'Cây Cau Cọnh', 95000, 50, 'SKU-018', TRUE),
(1, 'Cây Huyết Dụ', 130000, 30, 'SKU-019', TRUE),
(1, 'Cây Bạc Ngọc', 75000, 70, 'SKU-020', TRUE),
-- Cây ngoài trời (category 2)
(2, 'Cây Bàng Đài Loan', 350000, 15, 'SKU-021', TRUE),
(2, 'Cây Muồng Đen', 450000, 10, 'SKU-022', TRUE),
(2, 'Cây Sấu Nhỏ', 280000, 20, 'SKU-023', TRUE),
(2, 'Cây Chi Chét', 180000, 25, 'SKU-024', TRUE),
(2, 'Cây Hoa Giấy', 85000, 60, 'SKU-025', TRUE),
(2, 'Cây Hoa Lan Ý', 120000, 40, 'SKU-026', TRUE),
(2, 'Cây Đa Búp Đỏ', 320000, 15, 'SKU-027', TRUE),
(2, 'Cây Lộc Vừng', 550000, 8, 'SKU-028', TRUE),
(2, 'Cây Tùng La Hán', 280000, 20, 'SKU-029', TRUE),
(2, 'Cây Cau Vàng', 420000, 12, 'SKU-030', TRUE),
(2, 'Cây Bông Trang', 75000, 55, 'SKU-031', TRUE),
(2, 'Cây Dền Đỏ', 35000, 80, 'SKU-032', TRUE),
(2, 'Cây Cẩm Nhung', 95000, 45, 'SKU-033', TRUE),
(2, 'Cây Môn Tía', 65000, 60, 'SKU-034', TRUE),
(2, 'Cây Ngải Cứu', 45000, 70, 'SKU-035', TRUE),
(2, 'Cây Hương Thảo', 85000, 50, 'SKU-036', TRUE),
(2, 'Cây Oải Hương', 120000, 35, 'SKU-037', TRUE),
(2, 'Cây Bạc Hà', 55000, 65, 'SKU-038', TRUE),
(2, 'Cây Rau Mùi', 35000, 90, 'SKU-039', TRUE),
(2, 'Cây Húng Quế', 45000, 75, 'SKU-040', TRUE),
-- Cây để bàn (category 3)
(3, 'Cây Sen Đá Thạch Ngọc', 35000, 120, 'SKU-041', TRUE),
(3, 'Cây Sen Đá Hồng Phấn', 45000, 90, 'SKU-042', TRUE),
(3, 'Cây Sen Đá Xanh Thanh', 40000, 100, 'SKU-043', TRUE),
(3, 'Cây Xương Rồng Cactus Nhỏ', 55000, 80, 'SKU-044', TRUE),
(3, 'Cây Xương Rồng San Hô', 75000, 60, 'SKU-045', TRUE),
(3, 'Cây Mạc Ma Nhỏ', 120000, 40, 'SKU-046', TRUE),
(3, 'Cây Kim Ngân Bàn', 180000, 30, 'SKU-047', TRUE),
(3, 'Cây Ngọc Bích', 65000, 70, 'SKU-048', TRUE),
(3, 'Cây Lưỡi Hổ Mini', 85000, 50, 'SKU-049', TRUE),
(3, 'Cây Trầu Bà Mini', 55000, 85, 'SKU-050', TRUE),
(3, 'Cây Lan Phi Điển Nhỏ', 150000, 25, 'SKU-051', TRUE),
(3, 'Cây Địa Lan', 220000, 15, 'SKU-052', TRUE),
(3, 'Cây Mai Chiếu Thủy', 95000, 45, 'SKU-053', TRUE),
(3, 'Cây Si Tây Mini', 280000, 12, 'SKU-054', TRUE),
(3, 'Cây Đuôi Công Xanh', 130000, 30, 'SKU-055', TRUE),
(3, 'Cây Ổi Cảnh', 180000, 20, 'SKU-056', TRUE),
(3, 'Cây Khế Cảnh', 220000, 18, 'SKU-057', TRUE),
(3, 'Cây Tắc Cảnh', 150000, 25, 'SKU-058', TRUE),
(3, 'Cây Vạn Tuế', 350000, 10, 'SKU-059', TRUE),
(3, 'Cây Lược Vàng', 85000, 55, 'SKU-060', TRUE),
-- Sen đá & Xương rồng (category 4)
(4, 'Sen Đá Hồng Lan', 45000, 80, 'SKU-061', TRUE),
(4, 'Sen Đá Kim Cương', 55000, 70, 'SKU-062', TRUE),
(4, 'Sen Đá Ngũ Sắc', 65000, 60, 'SKU-063', TRUE),
(4, 'Sen Đá Mặt Trăng', 85000, 45, 'SKU-064', TRUE),
(4, 'Sen Đá Nhật Nguyệt', 95000, 40, 'SKU-065', TRUE),
(4, 'Sen Đá Tứ Quý', 75000, 55, 'SKU-066', TRUE),
(4, 'Sen Đá Tiểu Hồng', 45000, 75, 'SKU-067', TRUE),
(4, 'Sen Đá Đô La', 35000, 100, 'SKU-068', TRUE),
(4, 'Xương Rồng Sao Biển', 85000, 50, 'SKU-069', TRUE),
(4, 'Xương Rồng Óp Pích', 65000, 60, 'SKU-070', TRUE),
(4, 'Xương Rồng Cầu Vàng', 120000, 35, 'SKU-071', TRUE),
(4, 'Xương Rồng Cầu Đỏ', 130000, 30, 'SKU-072', TRUE),
(4, 'Xương Rồng Bông Tím', 95000, 40, 'SKU-073', TRUE),
(4, 'Xương Rồng Chuột Tai', 55000, 65, 'SKU-074', TRUE),
(4, 'Xương Rồng Gỗ Nhỏ', 180000, 25, 'SKU-075', TRUE),
(4, 'Sedum Tricolor', 55000, 70, 'SKU-076', TRUE),
(4, 'Echeveria Lọ Vàng', 75000, 50, 'SKU-077', TRUE),
(4, 'Graptopetalum Mây', 85000, 45, 'SKU-078', TRUE),
(4, 'Haworthia Gioi Lim', 95000, 40, 'SKU-079', TRUE),
(4, 'Aeonium Cuộn Trứng', 65000, 55, 'SKU-080', TRUE),
-- Cây phong thủy (category 5)
(5, 'Cây Kim Tiền Phong Thủy', 150000, 50, 'SKU-081', TRUE),
(5, 'Cây Phát Lộc Phong Thủy', 180000, 40, 'SKU-082', TRUE),
(5, 'Cây Thiết Mộc Lan', 220000, 25, 'SKU-083', TRUE),
(5, 'Cây Lộc Vừng Phong Thủy', 450000, 10, 'SKU-084', TRUE),
(5, 'Cây Ngũ Lộc Phong Thủy', 280000, 15, 'SKU-085', TRUE),
(5, 'Cây Dây Leo May Mắn', 85000, 60, 'SKU-086', TRUE),
(5, 'Cây Trầu Bà Đế Chế', 120000, 35, 'SKU-087', TRUE),
(5, 'Cây Lan Ý Phong Thủy', 150000, 30, 'SKU-088', TRUE),
(5, 'Cây Hồng Môn Phong Thủy', 200000, 20, 'SKU-089', TRUE),
(5, 'Cây Đại Cát Tường', 180000, 25, 'SKU-090', TRUE),
(5, 'Cây Kim Ngân Xoắn', 320000, 15, 'SKU-091', TRUE),
(5, 'Cây Vạn Niên Thanh', 130000, 30, 'SKU-092', TRUE),
(5, 'Cây Cọ Nhật Phong Thủy', 450000, 8, 'SKU-093', TRUE),
(5, 'Cây Bạch Mã Hoàng Tử', 280000, 12, 'SKU-094', TRUE),
(5, 'Cây Sung Ngự Lộc', 550000, 5, 'SKU-095', TRUE),
(5, 'Cây Đào Tiên Cảnh', 220000, 18, 'SKU-096', TRUE),
(5, 'Cây Trà Hoa Vàng', 180000, 22, 'SKU-097', TRUE),
(5, 'Cây San Hô Phong Thủy', 150000, 28, 'SKU-098', TRUE),
-- Phụ kiện (category 6)
(6, 'Chậu Sứ Trắng Đường Kính 15cm', 35000, 200, 'SKU-099', TRUE),
(6, 'Chậu Nhựa Đen Đường Kính 12cm', 15000, 300, 'SKU-100', TRUE),
(6, 'Chậu Xi Măng Nhỏ', 25000, 180, 'SKU-101', TRUE),
(6, 'Đất Trồng Cây Đa Năng 5L', 45000, 150, 'SKU-102', TRUE),
(6, 'Phân Bón NPK 20-20-20', 55000, 120, 'SKU-103', TRUE),
(6, 'Phân Bón Hữu Cơ Viên Nén', 65000, 100, 'SKU-104', TRUE),
(6, 'Dụng Cụ Tưới Nước Mini', 25000, 200, 'SKU-105', TRUE),
(6, 'Bình Xịt Nước 500ml', 35000, 180, 'SKU-106', TRUE),
(6, 'Găng Tay Làm Vườn', 30000, 150, 'SKU-107', TRUE),
(6, 'Kéo Cắt Cành Nhỏ', 55000, 80, 'SKU-108', TRUE),
(6, 'Khay Ươm Hạt', 35000, 120, 'SKU-109', TRUE),
(6, 'Than Hoạt Tính Trồng Cây', 25000, 200, 'SKU-110', TRUE),
(6, 'Xơ Dừa Viên Nén', 30000, 150, 'SKU-111', TRUE),
(6, 'Đá Trang Trí Phủ Bề Mặt', 40000, 180, 'SKU-112', TRUE),
(6, 'Dây Buộc Cây Leo', 15000, 250, 'SKU-113', TRUE),
(6, 'Ghim Đất Cho Dây Leo', 20000, 200, 'SKU-114', TRUE),
(6, 'Chậu Treo Đường Kính 10cm', 30000, 150, 'SKU-115', TRUE),
(6, 'Ống Tưới Nhỏ Giọt', 45000, 100, 'SKU-116', TRUE),
(6, 'Thuốc Trừ Sâu Sinh Học', 55000, 80, 'SKU-117', TRUE),
(6, 'Viên Nén Ươm Giống', 35000, 120, 'SKU-118', TRUE);

-- ============================================================
--  PRODUCT DETAILS — 100 bản ghi
-- ============================================================
INSERT INTO product_details (product_id, description, images)
VALUES (1, 'Trầu bà xanh dễ chăm, chịu bóng tốt, lọc không khí hiệu quả. Phù hợp để bàn hoặc góc phòng.', '[
  "traubaxanh_1.jpg",
  "traubaxanh_2.jpg"
]'),
       (2, 'Lưỡi hổ nhỏ thanh lịch, chịu hạn tốt, phù hợp người bận rộn ít có thời gian chăm cây.', '[
         "luoiho_1.jpg",
         "luoiho_2.jpg"
       ]'),
       (3, 'Cây kim tiền mang lại may mắn tài lộc, lá tròn xanh bóng đẹp mắt, dễ trồng trong nhà.', '[
         "kimtien_1.jpg",
         "kimtien_2.jpg"
       ]'),
       (4, 'Cây phát lộc thân thẳng mọc từ bẹ lá, biểu tượng phát tài phát lộc trong phong thủy.', '[
         "phatLoc_1.jpg"
       ]'),
       (5, 'Pothos dây leo mềm mại, lá tim xanh vàng, có thể để treo hoặc đặt bàn để tua rua.', '[
         "pothos_1.jpg",
         "pothos_2.jpg"
       ]'),
       (6, 'Monstera lá xẻ độc đáo, biểu tượng của nội thất hiện đại, phù hợp góc phòng khách.', '[
         "monstera_1.jpg",
         "monstera_2.jpg",
         "monstera_3.jpg"
       ]'),
       (7, 'Trầu bà vàng lá xanh vàng xen kẽ bắt mắt, sinh trưởng nhanh, dễ nhân giống.', '[
         "traubavang_1.jpg"
       ]'),
       (8, 'Dracaena thân thẳng lá dài xanh đậm, phù hợp góc phòng, văn phòng công sở.', '[
         "dracaena_1.jpg",
         "dracaena_2.jpg"
       ]'),
       (9, 'Ficus nhỏ tán tròn đẹp, lá bóng xanh, phù hợp trang trí bàn tiếp khách.', '[
         "ficus_1.jpg"
       ]'),
       (10, 'Lan ý hoa trắng thanh tao, lọc formaldehyde hiệu quả, dễ chăm sóc trong nhà.', '[
         "lanYi_1.jpg",
         "lanYi_2.jpg"
       ]'),
       (11, 'ZZ Plant cây khỏe chịu bóng tối, ít cần nước, phù hợp văn phòng điều hòa.', '[
         "zzplant_1.jpg"
       ]'),
       (12, 'Xương rồng tai thỏ nhỏ xinh, dễ chăm sóc, tưới 1-2 lần/tuần, nhiều nắng.', '[
         "xuongrong_taitho_1.jpg"
       ]'),
       (13, 'Lưỡi hổ vàng lá sọc vàng xanh đẹp mắt, phong thủy tốt cho tài lộc.', '[
         "luoiho_vang_1.jpg"
       ]'),
       (14, 'Hồng môn đỏ hoa tươi lâu, biểu tượng sung túc, phù hợp trang trí bàn làm việc.', '[
         "hongmon_do_1.jpg"
       ]'),
       (15, 'Thiết mộc lan lá dài xanh đậm, thanh lọc không khí, phù hợp phòng khách và văn phòng.', '[
         "thietmoclan_1.jpg"
       ]'),
       (16, 'Trầu bà sọc vàng lá xanh với sọc vàng rực rỡ, dễ trồng, sinh trưởng nhanh.', '[
         "trauba_socvang_1.jpg"
       ]'),
       (17, 'Phú quý thủy sinh rễ bám trên đá, mang lại tài lộc, dễ chăm sóc trong bình thủy sinh.', '[
         "phuquy_thuysinh_1.jpg"
       ]'),
       (18, 'Cau cọnh tán lá xanh mát, thanh lọc không khí, phù hợp trang trí phòng khách.', '[
         "caucohn_1.jpg"
       ]'),
       (19, 'Huyết dụ lá dài mảnh như lông chim, màu đỏ tía đẹp mắt, phù hợp bàn làm việc.', '[
         "huyetdu_1.jpg"
       ]'),
       (20, 'Bạc ngọc lá nhỏ xanh bạc, phù hợp terrarium, bàn làm việc, dễ chăm sóc.', '[
         "bacngoc_1.jpg"
       ]'),
       (21, 'Bàng Đài Loan tán rộng xanh tốt, cây lâu năm, phù hợp sân vườn lớn.', '[
         "bang_dailoan_1.jpg"
       ]'),
       (22, 'Muồng đen hoa vàng đẹp mùa nở hoa, tán rộng mát mẻ, phù hợp công viên.', '[
         "muongden_1.jpg"
       ]'),
       (23, 'Sấu nhỏ tán tròn đẹp, lá xanh tươi, phù hợp trồng ngoài vườn, chịu nắng tốt.', '[
         "sau_nho_1.jpg"
       ]'),
       (24, 'Chi chét hoa trắng thơm ngát, tán lá nhỏ xinh, phù hợp hàng rào, bờ tường.', '[
         "chichet_1.jpg"
       ]'),
       (25, 'Hoa giấy nhiều màu tươi sáng, leo bám tốt, phù hợp ban công, hàng rào.', '[
         "hoagiay_1.jpg",
         "hoagiay_2.jpg"
       ]'),
       (26, 'Hoa lan ý điểm xuyết hoa trắng trên nền xanh, trang trí bàn tiệc sang trọng.', '[
         "hoalan_yi_1.jpg"
       ]'),
       (27, 'Đa búp đỏ lá non màu đỏ nổi bật, tán lá rậm rạp, phù hợp cảnh quan sân vườn.', '[
         "dabup_do_1.jpg"
       ]'),
       (28, 'Lộc vừng tán lá tròn đẹp, biểu tượng tài lộc, phù hợp trồng trước nhà.', '[
         "locvung_1.jpg"
       ]'),
       (29, 'Tùng la hán lá kim xanh đẹp, cây cảnh phong thủy, phù hợp văn phòng, biệt thự.', '[
         "tunglahhanh_1.jpg"
       ]'),
       (30, 'Cau vàng tán lá xanh vòng cung đẹp mắt, mang ý nghĩa phong thủy tốt lành.', '[
         "cauvang_1.jpg"
       ]'),
       (31, 'Bông trang hoa trắng nở quanh năm, dễ trồng, phù hợp hàng rào, tiểu cảnh.', '[
         "bongtrang_1.jpg"
       ]'),
       (32, 'Dền đỏ lá màu đỏ tía rực rỡ, trồng viền, trang trí tiểu cảnh đẹp mắt.', '[
         "den_do_1.jpg"
       ]'),
       (33, 'Cẩm nhung lá xanh có gân đỏ, mềm mại như nhung, phù hợp trang trí bàn.', '[
         "camnhung_1.jpg"
       ]'),
       (34, 'Môn tía lá hình tim màu tím đẹp mắt, phù hợp trồng trong chậu treo.', '[
         "mon_tia_1.jpg"
       ]'),
       (35, 'Ngải cứu lá thơm, dùng làm thuốc, trồng trong vườn hoặc chậu nhỏ.', '[
         "ngaicu_1.jpg"
       ]'),
       (36, 'Hương thảo cây thơm, hoa tím nhỏ xinh, trồng trong bếp hoặc ban công.', '[
         "huongthao_1.jpg"
       ]'),
       (37, 'Oải hương hoa tím thơm, cây thân gỗ nhỏ, phù hợp trang trí ban công.', '[
         "oaihuong_1.jpg"
       ]'),
       (38, 'Bạc hà lá xanh thơm mát, dễ trồng, dùng làm thuốc hoặc đồ uống giải khát.', '[
         "bacha_1.jpg"
       ]'),
       (39, 'Rau mùi lá xanh thơm, gia vị nấu ăn, trồng trong vườn hoặc chậu nhỏ.', '[
         "raumui_1.jpg"
       ]'),
       (40, 'Húng quế lá xanh thơm, gia vị cho món Ý hoặc Thai, dễ trồng trong chậu.', '[
         "hungque_1.jpg"
       ]'),
       (41, 'Sen đá thạch ngọc lá xanh ngọc, hình hoa, trồng terrarium, chậu nhỏ xinh.', '[
         "senda_thachngoc_1.jpg"
       ]'),
       (42, 'Sen đá hồng phấn lá xếp hình hoa màu hồng nhạt, phù hợp trang trí bàn.', '[
         "senda_hongphen_1.jpg"
       ]'),
       (43, 'Sen đá xanh thanh lá xanh màu xanh ngọc, dễ chăm, phù hợp người mới chơi cây.', '[
         "senda_xanhthanh_1.jpg"
       ]'),
       (44, 'Xương rồng cactus nhỏ thân tròn, nhiều gai mềm, trồng chậu để bàn.', '[
         "cactus_nho_1.jpg"
       ]'),
       (45, 'Xương rồng san hô tạo hình như san hô biển, màu xanh đẹp mắt.', '[
         "xuongrong_sanho_1.jpg"
       ]'),
       (46, 'Mạc ma nhỏ lá xanh bóng, tán nhỏ xinh, trang trí bàn làm việc, kệ sách.', '[
         "macma_1.jpg"
       ]'),
       (47, 'Kim ngân bàn lá xanh mướt, tán tròn đẹp, mang tài lộc, dễ chăm cây.', '[
         "kimngan_ban_1.jpg"
       ]'),
       (48, 'Ngọc bích lá tròn xanh mọng nước, cây may mắn, dễ chăm, nhiều nắng.', '[
         "ngocbich_1.jpg"
       ]'),
       (49, 'Lưỡi hổ mini lá ngắn xanh đẹp, phù hợp bàn làm việc, chịu bóng tốt.', '[
         "luoiho_mini_1.jpg"
       ]'),
       (50, 'Trầu bà mini dây leo nhỏ xinh, trồng chậu treo, trang trí góc phòng.', '[
         "trauba_mini_1.jpg"
       ]'),
       (51, 'Lan phi điển nhỏ hoa tím đẹp, phong thủy tốt, phù hợp bàn thờ, trang trí.', '[
         "lanphidien_nho_1.jpg"
       ]'),
       (52, 'Địa lan hoa to đẹp nhiều màu, thanh tao sang trọng, phù hợp phòng khách.', '[
         "dialan_1.jpg"
       ]'),
       (53, 'Mai chiếu thủy tán nhỏ xanh đẹp, dễ uốn, phù hợp làm bonsai mini.', '[
         "maichieuthuy_1.jpg"
       ]'),
       (54, 'Si tây mini thân gỗ nhỏ, dáng đẹp, phù hợp làm bonsai trên bàn.', '[
         "siday_mini_1.jpg"
       ]'),
       (55, 'Đuôi công xanh lá dài xoắn như đuôi công, trang trí bàn làm việc độc đáo.', '[
         "duoicong_1.jpg"
       ]'),
       (56, 'Ổi cảnh tạo dáng đẹp, quả nhỏ xanh, phù hợp làm cây cảnh bonsai.', '[
         "oicanh_1.jpg"
       ]'),
       (57, 'Khế cảnh tạo dáng đẹp, quả vàng, phong thủy tốt, phù hợp sân vườn.', '[
         "khecanh_1.jpg"
       ]'),
       (58, 'Tắc cảnh quả tròn xanh vàng, trang trí đẹp mắt, mang ý nghĩa sung túc.', '[
         "taccanh_1.jpg"
       ]'),
       (59, 'Vạn tuế tán lá xòe đẹp, cây sống lâu năm, phù hợp trang trí sảnh, văn phòng.', '[
         "vantu_1.jpg"
       ]'),
       (60, 'Lược vàng lá dài xanh vàng, dễ chăm, lọc không khí hiệu quả.', '[
         "lucvu_vang_1.jpg"
       ]'),
       (61, 'Sen đá hồng lan lá xếp hình hoa hồng, màu hồng nhạt đẹp mắt.', '[
         "senda_honglan_1.jpg"
       ]'),
       (62, 'Sen đá kim cương lá xanh bạc, hình ngôi sao, trồng chậu xinh xắn.', '[
         "senda_kimcuong_1.jpg"
       ]'),
       (63, 'Sen đá ngũ sắc lá nhiều màu từ xanh đến đỏ, trồng terrarium đẹp.', '[
         "senda_ngusac_1.jpg"
       ]'),
       (64, 'Sen đá mặt trăng lá xanh bạc hình trăng lưỡi liềm, độc đáo.', '[
         "senda_mattrang_1.jpg"
       ]'),
       (65, 'Sen đá nhật nguyệt lá trắng bạc hình trăng non, hiếm và đẹp.', '[
         "senda_nhatnguyet_1.jpg"
       ]'),
       (66, 'Sen đá tứ quý lá xếp 4 hướng, xanh đẹp, dễ chăm.', '[
         "senda_tuquy_1.jpg"
       ]'),
       (67, 'Sen đá tiểu hồng lá nhỏ màu hồng nhạt, trồng chậu treo xinh xắn.', '[
         "senda_tieuhong_1.jpg"
       ]'),
       (68, 'Sen đá đô la lá xanh dẹt như đồng xu, mọng nước, dễ trồng.', '[
         "senda_dola_1.jpg"
       ]'),
       (69, 'Xương rồng sao biển tạo hình như sao biển, màu xanh đẹp mắt.', '[
         "xuongrong_saobien_1.jpg"
       ]'),
       (70, 'Xương rồng ốp pích thân dẹt như lá, nhiều gai nhỏ, dễ chăm.', '[
         "xuongrong_oppich_1.jpg"
       ]'),
       (71, 'Xương rồng cầu vàng thân tròn màu vàng, nở hoa vàng đẹp.', '[
         "xuongrong_cauvang_1.jpg"
       ]'),
       (72, 'Xương rồng cầu đỏ thân tròn màu đỏ, nở hoa hồng đẹp.', '[
         "xuongrong_caudo_1.jpg"
       ]'),
       (73, 'Xương rồng bông tím hoa tím đẹp, thân xanh tím, trồng chậu trang trí.', '[
         "xuongrong_bongtim_1.jpg"
       ]'),
       (74, 'Xương rồng chuột tai lá dài như tai chuột, xanh mềm, dễ chăm.', '[
         "xuongrong_chuottai_1.jpg"
       ]'),
       (75, 'Xương rồng gỗ nhỏ tạo dáng như cây gỗ mini, độc đáo và đẹp mắt.', '[
         "xuongrong_gnho_1.jpg"
       ]'),
       (76, 'Sedum tricolor lá ba màu xanh trắng hồng, mọng nước, dễ trồng.', '[
         "sedum_tricolor_1.jpg"
       ]'),
       (77, 'Echeveria lọ vàng lá xếp hình bông hoa trong chậu sứ trắng xinh xắn.', '[
         "echeveria_lo_vang_1.jpg"
       ]'),
       (78, 'Graptopetalum mây lá màu xanh bạc, hình hoa đẹp, dễ chăm.', '[
         "graptopetalum_may_1.jpg"
       ]'),
       (79, 'Haworthia gioi lim lá nhọn xanh có chấm trắng trong suốt đẹp mắt.', '[
         "haworthia_1.jpg"
       ]'),
       (80, 'Aeonium cuộn trứng lá xanh xếp chồng như trứng, đẹp mắt.', '[
         "aeonium_1.jpg"
       ]'),
       (81, 'Kim tiền phong thủy lá tròn xanh bóng, rễ khỏe, mang tài lộc, dễ chăm.', '[
         "kimtien_pthuy_1.jpg"
       ]'),
       (82, 'Phát lộc phong thủy thân thẳng lá xòe, biểu tượng phát tài, đặt phòng khách.', '[
         "phatloc_pthuy_1.jpg"
       ]'),
       (83, 'Thiết mộc lan lá xanh đậm thanh lọc không khí, phong thủy tốt, văn phòng.', '[
         "thietmoclan_pthuy_1.jpg"
       ]'),
       (84, 'Lộc vừng phong thủy tán tròn xanh đẹp, đặt trước nhà thu hút tài lộc.', '[
         "locvung_pthuy_1.jpg"
       ]'),
       (85, 'Ngũ lộc phong thủy 5 lá xòe đẹp, mang ngũ phúc, trang trí phòng khách.', '[
         "nguloc_1.jpg"
       ]'),
       (86, 'Dây leo may mắn dây xanh dài, lá tim, trang trí giá sách, kệ đẹp.', '[
         "dayleo_mayman_1.jpg"
       ]'),
       (87, 'Trầu bà đế chế tạo hình đẹp, phong thủy tốt, đặt bàn làm việc manager.', '[
         "trauba_deche_1.jpg"
       ]'),
       (88, 'Lan ý phong thủy hoa trắng thanh tao, lọc không khí, đặt phòng khách.', '[
         "lanYi_pthuy_1.jpg"
       ]'),
       (89, 'Hồng môn phong thủy hoa đỏ tươi, tượng trưng sung túc, phòng khách.', '[
         "hongmon_pthuy_1.jpg"
       ]'),
       (90, 'Đại cát tường lá xanh to khỏe, tượng trưng cát tường, đặt cửa hàng.', '[
         "daicattuong_1.jpg"
       ]'),
       (91, 'Kim ngân xoắn thân xoắn độc đáo, mang tài lộc, phù hợp văn phòng.', '[
         "kimngan_xoan_1.jpg"
       ]'),
       (92, 'Vạn niên thanh lá xanh to, sống lâu năm, biểu tượng sự bền vững.', '[
         "vannienthanh_1.jpg"
       ]'),
       (93, 'Cọ nhật phong thủy tán lá xòe đẹp, mang ý nghĩa thịnh vượng.', '[
         "conhat_1.jpg"
       ]'),
       (94, 'Bạch mã hoàng tử lá xanh vệt trắng, tượng trưng quý phái, phong thủy.', '[
         "bachmahoangtu_1.jpg"
       ]'),
       (95, 'Sung ngự lộc tạo dáng đẹp, quả màu đỏ, biểu tượng phú quý.', '[
         "sung_nguloc_1.jpg"
       ]'),
       (96, 'Đào tiên cảnh hoa đào nhỏ đẹp, tượng trưng may mắn, trang trí Tết.', '[
         "daotien_canh_1.jpg"
       ]'),
       (97, 'Trà hoa vàng hoa vàng thơm, lá xanh đẹp, trồng vườn hoặc chậu lớn.', '[
         "tahoavang_1.jpg"
       ]'),
       (98, 'San hô phong thủy tạo hình như san hô, mang biển cả, thịnh vượng.', '[
         "sanhho_pthuy_1.jpg"
       ]'),
       (99, 'Chậu sứ trắng đường kính 15cm men bóng đẹp, trồng sen đá, xương rồng.', '[
         "chausu_15_1.jpg"
       ]'),
       (100, 'Chậu nhựa đen đường kính 12cm nhẹ bền, trồng cây văn phòng nhỏ.', '[
         "chaunhua_den_12_1.jpg"
       ]'),
       (101, 'Chậu xi măng nhỏ tổ ong xốp nhẹ, trồng cây để bàn, giá rẻ.', '[
         "chauxima_1.jpg"
       ]'),
       (102, 'Đất trồng đa năng 5L phù hợp hầu hết cây trồng trong nhà và ngoài trời.', '[
         "datrong_5l_1.jpg"
       ]'),
       (103, 'Phân NPK 20-20-20 cân bằng dinh dưỡng, bón cây xanh lá, hoa và cây ăn quả.', '[
         "phan_npk_1.jpg"
       ]'),
       (104, 'Phân hữu cơ viên nén tan chậm, cải thiện đất, an toàn cho cây trồng.', '[
         "phan_huuco_1.jpg"
       ]'),
       (105, 'Dụng cụ tưới mini nhỏ gọn, phù hợp tưới cây để bàn, chậu nhỏ.', '[
         "cuotuoi_mini_1.jpg"
       ]'),
       (106, 'Bình xịt nước 500ml phun sương mịn, tưới cây mini, làm ẩm lá.', '[
         "binhxit_500_1.jpg"
       ]'),
       (107, 'Găng tay làm vườn chống gai, bảo vệ tay khi bón phân, cắt tỉa.', '[
         "gangtay_vuon_1.jpg"
       ]'),
       (108, 'Kéo cắt cành nhỏ sắc bén, cắt tỉa cây cảnh, hoa hồng.', '[
         "keocatcanh_1.jpg"
       ]'),
       (109, 'Khay ươm hạt 24 ô tiện lợi, ươm hạt giống, cây con.', '[
         "khay_uom_1.jpg"
       ]'),
       (110, 'Than hoạt tính trồng cây, dùng phối trộn đất, chống úng rễ.', '[
         "thanhoattinh_1.jpg"
       ]'),
       (111, 'Xơ dừa viên nén xốp nhẹ, giữ ẩm tốt, phối trộn đất trồng.', '[
         "xodua_vien_1.jpg"
       ]'),
       (112, 'Đá trang trí phủ bề mặt chậu, chống bốc hơi, thẩm mỹ đẹp.', '[
         "datrangtri_1.jpg"
       ]'),
       (113, 'Dây buộc cây leo mềm dai, buộc cố định dây leo, hoa giấy.', '[
         "daybuoc_1.jpg"
       ]'),
       (114, 'Ghim đất cho dây leo inox chống gỉ, ghim cố định dây vào đất.', '[
         "ghimdat_1.jpg"
       ]'),
       (115, 'Chậu treo đường kính 10cm lỗ thoát nước, trồng sen đá, cây treo.', '[
         "chautreo_10_1.jpg"
       ]'),
       (116, 'Ống tưới nhỏ giọt tiết kiệm nước, lắp đặt đơn giản cho vườn nhỏ.', '[
         "ongtuoi_nhogiọt_1.jpg"
       ]'),
       (117, 'Thuốc trừ sâu sinh học an toàn, pha xịt phòng sâu bệnh cho cây.', '[
         "thuoc_trasinhhoc_1.jpg"
       ]'),
       (118, 'Viên nén ươm giống xốp, đặt hạt vào ươm, nảy mầm nhanh.', '[
         "viennan_uom_1.jpg"
       ]');

-- ============================================================
--  BLOG POSTS — 10 bài viết
-- ============================================================
UPDATE product_details
SET content = description
WHERE content IS NULL;

UPDATE product_details
SET care_guide        = 'Đặt nơi sáng nhẹ, tưới khi mặt đất khô, lau lá định kỳ.',
    sunlight_level    = 'Ánh sáng gián tiếp thấp đến trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 1;

UPDATE product_details
SET care_guide        = 'Để nơi sáng dịu, tránh nắng gắt buổi trưa, tưới ít nhưng đều.',
    sunlight_level    = 'Ánh sáng gián tiếp thấp',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 2;

UPDATE product_details
SET care_guide        = 'Ưa sáng vừa, tưới khi đất ráo, phù hợp góc phòng thoáng.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id = 3;

UPDATE product_details
SET care_guide        = 'Cần ánh sáng ổn định, tưới vừa phải và kiểm tra thoát nước.',
    sunlight_level    = 'Ánh sáng trung bình đến cao',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 4;

UPDATE product_details
SET care_guide        = 'Có thể treo hoặc đặt kệ, chịu thiếu sáng tốt, tưới khi khô bề mặt.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Thủy'
WHERE product_id = 5;

UPDATE product_details
SET care_guide        = 'Ưa nơi sáng, giữ ẩm vừa phải, lau lá để giữ bề mặt đẹp.',
    sunlight_level    = 'Ánh sáng gián tiếp sáng',
    water_freq        = '5-7 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 6;

UPDATE product_details
SET care_guide        = 'Phù hợp người mới, chăm đơn giản, tưới khi đất khô nhẹ.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 7;

UPDATE product_details
SET care_guide        = 'Thân cao, cần ánh sáng tốt và chỗ đứng ổn định.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 8;

UPDATE product_details
SET care_guide        = 'Ưa không gian sáng nhẹ, tưới vừa đủ để giữ tán lá cân đối.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 9;

UPDATE product_details
SET care_guide        = 'Rất dễ chăm, tưới ít, tránh ngập nước và giữ nơi thoáng.',
    sunlight_level    = 'Ánh sáng thấp',
    water_freq        = '10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Thủy'
WHERE product_id = 10;

UPDATE product_details
SET care_guide        = 'Ưa nơi sáng nhưng không gắt, giữ độ ẩm đều để lá đẹp.',
    sunlight_level    = 'Ánh sáng gián tiếp sáng',
    water_freq        = '5-7 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Kim'
WHERE product_id = 11;

UPDATE product_details
SET care_guide        = 'Hợp không gian sảnh hoặc phòng khách, tưới vừa phải và cắt tỉa gọn.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 12;

-- Add care data for products 13-98 (all other plant products)
UPDATE product_details
SET care_guide        = 'Để nơi sáng, tránh nắng gắt, tưới khi đất ráo.',
    sunlight_level    = 'Ánh sáng gián tiếp',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 13;

UPDATE product_details
SET care_guide        = 'Cần ánh sáng tốt, tưới vừa phải, phù hợp góc phòng khách.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 14;

UPDATE product_details
SET care_guide        = 'Thân cao sắc nét, cần chỗ yên tĩnh, tưới đều đặn.',
    sunlight_level    = 'Ánh sáng trung bình đến cao',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 15;

UPDATE product_details
SET care_guide        = 'Lá sọc vàng rực rỡ, dễ trồng, sinh trưởng nhanh.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 16;

UPDATE product_details
SET care_guide        = 'Thích hợp bình thủy sinh, rễ bám trên đá, chăm sóc dễ.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = 'Hàng ngày kiểm tra nước',
    difficulty        = 'Dễ',
    feng_shui_element = 'Thủy'
WHERE product_id = 17;

UPDATE product_details
SET care_guide        = 'Tán lá xanh mát, thanh lọc không khí tốt, chịu bóng tốt.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 18;

UPDATE product_details
SET care_guide        = 'Lá như lông chim, màu đỏ tía đẹp, phù hợp bàn làm việc.',
    sunlight_level    = 'Ánh sáng sáng vừa',
    water_freq        = '5-7 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Hỏa'
WHERE product_id = 19;

UPDATE product_details
SET care_guide        = 'Lá nhỏ bạc đẹp, chịu bóng tốt, tưới ít nhưng đều.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id = 20;

UPDATE product_details
SET care_guide        = 'Cây lâu năm, tán rộng xanh tốt, phù hợp sân vườn lớn.',
    sunlight_level    = 'Ánh sáng cao, nắng chiều',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 21;

UPDATE product_details
SET care_guide        = 'Hoa vàng đẹp mùa nở, tán rộng mát mẻ, phù hợp công viên.',
    sunlight_level    = 'Ánh sáng cao, nắng trực tiếp',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 22;

UPDATE product_details
SET care_guide        = 'Tán tròn đẹp, lá xanh tươi, chịu nắng tốt, ít chăm sóc.',
    sunlight_level    = 'Ánh sáng cao, nắng chiều',
    water_freq        = '3-5 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 23;

UPDATE product_details
SET care_guide        = 'Hoa trắng thơm ngát, tán nhỏ xinh, dễ bố trí hàng rào.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id = 24;

UPDATE product_details
SET care_guide        = 'Leo bám tốt, hoa rực rỡ, phù hợp ban công và hàng rào.',
    sunlight_level    = 'Ánh sáng cao, nắng trực tiếp',
    water_freq        = '1-2 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Hỏa'
WHERE product_id = 25;

UPDATE product_details
SET care_guide        = 'Hoa trắng tinh khôi, trang trí bàn tiệc sang trọng.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Kim'
WHERE product_id = 26;

UPDATE product_details
SET care_guide        = 'Lá đỏ nổi bật, tán rậm rạp, chịu cắt tỉa tốt.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Hỏa'
WHERE product_id = 27;

UPDATE product_details
SET care_guide        = 'Biểu tượng tài lộc, tán lá tròn đẹp, chịu sáng vừa.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 28;

UPDATE product_details
SET care_guide        = 'Cây cảnh phong thủy, lá kim xanh đậm, phù hợp biệt thự.',
    sunlight_level    = 'Ánh sáng sáng vừa',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 29;

UPDATE product_details
SET care_guide        = 'Tán lá xanh vòng cung đẹp, mang ý nghĩa phong thủy tốt.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id = 30;

UPDATE product_details
SET care_guide        = 'Hoa trắng tinh khôi, dễ chăm sóc, phù hợp sân vườn.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id = 31;

UPDATE product_details
SET care_guide        = 'Lá đỏ rực rỡ, dễ trồng, sinh trưởng nhanh, dễ cắt tỉa.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '2-3 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Hỏa'
WHERE product_id = 32;

UPDATE product_details
SET care_guide        = 'Lá xanh nhung, lưu hóa đẹp, chịu sáng vừa, tưới đều.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 33;

UPDATE product_details
SET care_guide        = 'Lá tía nhạt đẹp, dễ chăm, tưới vừa phải, chịu bóng tốt.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Thủy'
WHERE product_id = 34;

UPDATE product_details
SET care_guide        = 'Mùi thơm dễ chịu, lá xanh, dễ trồng, tưới ít.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 35;

UPDATE product_details
SET care_guide        = 'Mùi hương Pháp ngoạn mục, chịu nắng tốt, tưới ít.',
    sunlight_level    = 'Ánh sáng cao, nắng trực tiếp',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 36;

UPDATE product_details
SET care_guide        = 'Mùi thơm nhẹ nhàng, lá tím đẹp, chịu khô tốt, tưới ít.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 37;

UPDATE product_details
SET care_guide        = 'Mùi thơm thanh mát, lá bạc, dễ chăm, sinh trưởng nhanh.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id = 38;

UPDATE product_details
SET care_guide        = 'Rau thơm gia vị, dễ trồng, tưới đều, cắt bất kỳ lúc nào.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 39;

UPDATE product_details
SET care_guide        = 'Rau thơm Việt, dễ trồng, tưới đều, thu hoạch dần.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id = 40;

UPDATE product_details
SET care_guide        = 'Lá tròn đặc sắc, rất dễ chăm, tưới khi đất ráo.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '10 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id IN (41, 42, 43);

UPDATE product_details
SET care_guide        = 'Cây sen đá nhỏ xinh, rất ít nước, tưới khi đất hết nước.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '10-14 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id IN (44, 45, 46);

UPDATE product_details
SET care_guide        = 'Lá dài xanh bóng, tưới vừa phải, cắt tỉa gọn gàng.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id IN (47, 48, 49, 50);

UPDATE product_details
SET care_guide        = 'Lan mini dễ chăm, tưới ít, hoa lâu tàn, ánh sáng vừa.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Kim'
WHERE product_id IN (51, 52);

UPDATE product_details
SET care_guide        = 'Cây may mắn, bộ rễ khoẻ, tưới đều, chịu bóng tốt.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id IN (53, 54, 55);

UPDATE product_details
SET care_guide        = 'Cây cảnh tinh tế, rễ mạnh, chịu sáng vừa, tưới đều.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id IN (56, 57, 58, 59, 60);

UPDATE product_details
SET care_guide        = 'Sen đá bắt mắt, chịu hạn tốt, tưới khi đất hết nước.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '10-14 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id IN (61, 62, 63, 64, 65, 66, 67, 68);

UPDATE product_details
SET care_guide        = 'Xương rồng đặc sắc, chịu hạn cực tốt, tưới rất ít.',
    sunlight_level    = 'Ánh sáng cao, nắng trực tiếp',
    water_freq        = '2-3 tuần/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id IN (69, 70, 71, 72, 73, 74, 75);

UPDATE product_details
SET care_guide        = 'Sen đá Sedum nhỏ xinh, dễ chăm, tưới ít, chịu nắng tốt.',
    sunlight_level    = 'Ánh sáng cao',
    water_freq        = '10-14 ngày/lần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id IN (76, 77, 78, 79, 80);

UPDATE product_details
SET care_guide        = 'Cây phong thủy may mắn, lá tròn xanh, phù hợp để bàn.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Kim'
WHERE product_id IN (81, 82, 83, 84, 85);

UPDATE product_details
SET care_guide        = 'Dây leo phong thủy, may mắn tài lộc, dễ chăm, sinh trưởng nhanh.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Dễ',
    feng_shui_element = 'Mộc'
WHERE product_id IN (86, 87);

UPDATE product_details
SET care_guide        = 'Lan phong thủy sang trọng, tưới vừa phải, ánh sáng sáng.',
    sunlight_level    = 'Ánh sáng sáng vừa',
    water_freq        = '7-10 ngày/lần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Kim'
WHERE product_id IN (88, 89, 90);

UPDATE product_details
SET care_guide        = 'Kim ngân phong thủy xoắn đẹp, mang tài lộc, tưới đều.',
    sunlight_level    = 'Ánh sáng trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Kim'
WHERE product_id IN (91, 92);

UPDATE product_details
SET care_guide        = 'Cây phong thủy cao sang, tưới vừa phải, chịu bóng tốt.',
    sunlight_level    = 'Ánh sáng thấp đến trung bình',
    water_freq        = '1 lần/tuần',
    difficulty        = 'Trung bình',
    feng_shui_element = 'Mộc'
WHERE product_id IN (93, 94, 95, 96, 97, 98);

INSERT INTO blog_posts (author_id, title, content, thumbnail, is_published, status, published_at)
VALUES (2, 'Top 10 cây trong nhà dễ chăm nhất cho người bận rộn',
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
INSERT INTO blog_tags (blog_post_id, tag)
VALUES (1, 'BEGINNER_GUIDE'),
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
INSERT INTO blog_images (blog_id, image_url, is_primary, sort_order)
VALUES (1, 'blog/top10_cay_1.jpg', TRUE, 0),
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

INSERT INTO blog_votes (blog_id, user_id, is_upvote)
VALUES (1, 5, TRUE),
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
INSERT INTO notifications (user_id, type, title, message, reference_id)
VALUES (5, 'ORDER_STATUS', 'Đơn hàng đang được giao',
        'Đơn hàng #1 của bạn đang được giao đến địa chỉ 123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 1),
       (6, 'ORDER_STATUS', 'Đơn hàng đang được giao',
        'Đơn hàng #2 của bạn đang được giao đến địa chỉ 45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 2),
       (7, 'ORDER_STATUS', 'Giao hàng thành công', 'Đơn hàng #3 của bạn đã được giao thành công', 3),
       (5, 'TICKET_UPDATE', 'Ticket đã được xử lý', 'Ticket "Yêu cầu đổi cây bị hư" đã được xử lý', 1),
       (5, 'BLOG', 'Bài viết mới',
        'Greenshop vừa đăng bài viết mới: "Top 10 cây trong nhà dễ chăm nhất cho người bận rộn"', 1),
       (6, 'BLOG', 'Bài viết mới', 'Greenshop vừa đăng bài viết mới: "Hướng dẫn chăm sóc sen đá cho người mới bắt đầu"',
        2),
       (7, 'BLOG', 'Bài viết mới',
        'Greenshop vừa đăng bài viết mới: "Cây phong thủy nào phù hợp với từng không gian trong nhà?"', 3),
       (1, 'PROMOTION', 'Khuyến mãi mới', 'Giảm 20% cho đơn hàng đầu tiên! Mã: GREENSHOOT20', NULL),
       (2, 'SYSTEM', 'Chào mừng', 'Chào mừng bạn đến với Greenshop! Hãy khám phá các sản phẩm cây xanh của chúng tôi.',
        NULL);

-- ============================================================
--  SHOPPING CARTS — tạo cart cho 6 customer
-- ============================================================
INSERT INTO shopping_carts (customer_id)
VALUES (5),
       (6),
       (7),
       (8),
       (9),
       (10);

-- ============================================================
--  SHOPPING CART ENTRIES
-- ============================================================
INSERT INTO shopping_cart_entry (cart_id, product_id, quantity)
VALUES (1, 3, 2),
       (1, 51, 3),
       (1, 76, 1),
       (2, 6, 1),
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
INSERT INTO orders (customer_id, shipper_id, shipping_address, shipping_fee, discount, status, created_at, delivery_date)
VALUES (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-06-15 10:00:00', '2026-06-18 14:00:00'),
       (6, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 15000, 'RECEIVED', '2026-06-25 14:30:00', '2026-06-28 16:30:00'),
       (7, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-05 09:15:00', '2026-07-09 10:45:00'),
       (5, NULL, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-07-10 11:20:00', NULL),
       (6, NULL, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-07-15 16:45:00', NULL),
       (8, NULL, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 30000, 'PENDING', '2026-07-18 08:30:00', NULL),
       (9, NULL, '34 Điện Biên Phủ, Quận Ba Đình, Hà Nội', 30000, 0, 'PENDING', '2026-07-19 19:10:00', NULL),
       (10, NULL, '67 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-07-20 13:05:00', NULL);

-- ============================================================
--  ORDER DETAILS
-- ============================================================
INSERT INTO order_detail (order_id, product_id, quantity, price_paid)
VALUES (1, 3, 2, 240000),
       (1, 51, 1, 150000),
       (2, 6, 1, 250000),
       (2, 28, 1, 550000),
       (3, 14, 2, 360000),
       (4, 41, 3, 105000),
       (5, 76, 2, 170000),
       (6, 22, 1, 350000),
       (7, 83, 1, 220000),
       (8, 64, 2, 190000);

-- Additional generated orders
INSERT INTO orders (customer_id, shipper_id, shipping_address, shipping_fee, discount, status, created_at, delivery_date)
VALUES 
    (5, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-02-17 15:52:27', '2026-02-20 15:52:27'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'ARRIVED', '2026-01-27 15:52:27', '2026-02-01 15:52:27'),
    (5, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-05-14 15:52:27', '2026-05-20 15:52:27'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'FAILED', '2026-04-06 15:52:27', '2026-04-11 15:52:27'),
    (5, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-02-20 15:52:27', '2026-02-24 15:52:27'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-04-03 15:52:27', '2026-04-08 15:52:27'),
    (5, NULL, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-06-15 15:52:27', NULL),
    (5, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-02-18 15:52:27', NULL),
    (5, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-28 15:52:27', '2026-03-31 15:52:27'),
    (5, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-10 15:52:27', '2026-03-13 15:52:27'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-27 15:52:27', '2026-04-02 15:52:27'),
    (5, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-04-14 15:52:27', NULL),
    (5, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-07-12 15:52:27', NULL),
    (5, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-04-14 15:52:27', NULL),
    (5, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-19 15:52:27', '2026-03-23 15:52:27'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'FAILED', '2026-04-07 15:52:27', '2026-04-13 15:52:27'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-20 15:52:27', '2026-05-26 15:52:27'),
    (5, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-13 15:52:27', '2026-03-20 15:52:27'),
    (5, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-04-10 15:52:27', NULL),
    (5, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-07-19 15:52:27', NULL),
    (6, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-07-19 15:52:27', '2026-07-23 15:52:27'),
    (6, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-04-26 15:52:27', '2026-05-03 15:52:27'),
    (6, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-03-16 15:52:27', '2026-03-20 15:52:27'),
    (6, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-05-26 15:52:27', NULL),
    (6, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-11 15:52:27', '2026-05-18 15:52:27'),
    (6, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-03-31 15:52:27', NULL),
    (6, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-04-03 15:52:27', '2026-04-06 15:52:27'),
    (6, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-05-17 15:52:27', '2026-05-22 15:52:27'),
    (6, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-05 15:52:27', '2026-03-12 15:52:27'),
    (6, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-07-15 15:52:27', '2026-07-22 15:52:27'),
    (6, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-05-24 15:52:27', NULL),
    (6, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-04-04 15:52:27', NULL),
    (6, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-06-04 15:52:27', NULL),
    (6, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-24 15:52:27', '2026-05-28 15:52:27'),
    (6, NULL, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-07-07 15:52:27', NULL),
    (6, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-04-15 15:52:27', '2026-04-22 15:52:27'),
    (6, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-02-25 15:52:27', '2026-03-03 15:52:27'),
    (6, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-07-14 15:52:27', '2026-07-18 15:52:27'),
    (6, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-02-24 15:52:27', '2026-03-03 15:52:27'),
    (6, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-06 15:52:27', '2026-05-10 15:52:27'),
    (7, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-04-17 15:52:27', '2026-04-20 15:52:27'),
    (7, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-06 15:52:27', '2026-07-09 15:52:27'),
    (7, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-01-30 15:52:27', NULL),
    (7, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-04-06 15:52:27', '2026-04-13 15:52:27'),
    (7, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-01-24 15:52:27', NULL),
    (7, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-26 15:52:27', '2026-03-31 15:52:27'),
    (7, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-04-07 15:52:27', '2026-04-11 15:52:27'),
    (7, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-05-05 15:52:27', NULL),
    (7, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-07-02 15:52:27', '2026-07-06 15:52:27'),
    (7, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-03-17 15:52:27', NULL),
    (7, NULL, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-03-12 15:52:27', NULL),
    (7, NULL, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-04-28 15:52:27', NULL),
    (7, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-06-15 15:52:27', '2026-06-22 15:52:27'),
    (7, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-02-19 15:52:27', NULL),
    (7, NULL, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-06-08 15:52:27', NULL),
    (7, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-06-26 15:52:27', '2026-07-02 15:52:27'),
    (7, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-06-16 15:52:27', NULL),
    (7, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'ARRIVED', '2026-04-04 15:52:27', '2026-04-11 15:52:27'),
    (7, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-05-15 15:52:27', '2026-05-22 15:52:27'),
    (7, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-05-17 15:52:27', NULL),
    (8, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-01-23 15:52:27', NULL),
    (8, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-06-26 15:52:27', '2026-06-30 15:52:27'),
    (8, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-02-13 15:52:27', '2026-02-19 15:52:27'),
    (8, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'FAILED', '2026-04-29 15:52:27', '2026-05-02 15:52:27'),
    (8, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-02 15:52:27', '2026-05-07 15:52:27'),
    (8, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-03-09 15:52:27', '2026-03-15 15:52:27'),
    (8, NULL, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-02-12 15:52:27', NULL),
    (8, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-03-30 15:52:27', '2026-04-06 15:52:27'),
    (8, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-06-17 15:52:27', '2026-06-22 15:52:27'),
    (8, NULL, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'PENDING', '2026-07-01 15:52:27', NULL),
    (8, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-03-27 15:52:27', NULL),
    (8, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-02-06 15:52:27', NULL),
    (8, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-02-13 15:52:27', '2026-02-18 15:52:27'),
    (8, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-05-10 15:52:27', NULL),
    (8, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-02-02 15:52:27', '2026-02-09 15:52:27'),
    (8, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-06-22 15:52:27', NULL),
    (8, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RETURNING', '2026-04-04 15:52:27', '2026-04-11 15:52:27'),
    (8, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-05-14 15:52:27', '2026-05-20 15:52:27'),
    (8, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-06-20 15:52:27', NULL),
    (8, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-04-09 15:52:27', NULL),
    (9, NULL, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-01-28 15:52:27', NULL),
    (9, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-07-11 15:52:27', '2026-07-14 15:52:27'),
    (9, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-04-20 15:52:27', '2026-04-27 15:52:27'),
    (9, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-03-29 15:52:27', NULL),
    (9, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-05-31 15:52:27', '2026-06-07 15:52:27'),
    (9, NULL, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-02-16 15:52:27', NULL),
    (9, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-05-20 15:52:27', '2026-05-23 15:52:27'),
    (9, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-22 15:52:27', '2026-03-25 15:52:27'),
    (9, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-07-06 15:52:27', NULL),
    (9, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-30 15:52:27', '2026-04-06 15:52:27'),
    (9, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-02-21 15:52:27', NULL),
    (9, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PENDING', '2026-05-15 15:52:27', NULL),
    (9, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-07-11 15:52:27', NULL),
    (9, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-01 15:52:27', '2026-03-06 15:52:27'),
    (9, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-29 15:52:27', '2026-06-02 15:52:27'),
    (9, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-05-01 15:52:27', NULL),
    (9, NULL, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-06-25 15:52:27', NULL),
    (9, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURNING', '2026-07-20 15:52:27', '2026-07-23 15:52:27'),
    (9, NULL, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'FAILED', '2026-04-19 15:52:27', NULL),
    (9, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-05-24 15:52:27', '2026-05-31 15:52:27'),
    (10, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'DELIVERING', '2026-07-04 15:52:27', NULL),
    (10, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-02-02 15:52:27', '2026-02-08 15:52:27'),
    (10, NULL, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-03-28 15:52:27', NULL),
    (10, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-03-25 15:52:27', '2026-03-31 15:52:27'),
    (10, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-26 15:52:27', '2026-04-01 15:52:27'),
    (10, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-03-05 15:52:27', '2026-03-09 15:52:27'),
    (10, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-04-02 15:52:27', '2026-04-08 15:52:27'),
    (10, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-05-21 15:52:27', '2026-05-28 15:52:27'),
    (10, 3, '56 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-01-31 15:52:27', '2026-02-03 15:52:27'),
    (10, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-06-28 15:52:27', '2026-07-04 15:52:27'),
    (10, NULL, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PROCESSING', '2026-03-20 15:52:27', NULL),
    (10, 3, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-04-07 15:52:27', '2026-04-14 15:52:27'),
    (10, 3, '12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'RETURN_PROCESSING', '2026-07-12 15:52:27', '2026-07-17 15:52:27'),
    (10, NULL, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-05-04 15:52:27', NULL),
    (10, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'PENDING', '2026-05-24 15:52:27', NULL),
    (10, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-06-16 15:52:27', '2026-06-20 15:52:27'),
    (10, 3, '89 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'ARRIVED', '2026-04-21 15:52:27', '2026-04-25 15:52:27'),
    (10, 3, '78 Hoàn Kiếm, Hà Nội', 30000, 0, 'RECEIVED', '2026-03-22 15:52:27', '2026-03-28 15:52:27'),
    (10, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-06-26 15:52:27', '2026-07-01 15:52:27'),
    (10, NULL, '45 Quán Sứ, Quận Hoàn Kiếm, Hà Nội', 30000, 0, 'FAILED', '2026-04-12 15:52:27', NULL),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-01 10:00:00', '2026-07-04 15:00:00'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-05 10:00:00', '2026-07-08 15:00:00'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-10 10:00:00', '2026-07-13 15:00:00'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-15 10:00:00', '2026-07-18 15:00:00'),
    (5, 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', '2026-07-19 10:00:00', '2026-07-21 15:00:00');

-- Additional generated order details
INSERT INTO order_detail (order_id, product_id, quantity, price_paid)
VALUES 
    (9, 48, 2, 190000),
    (10, 32, 1, 160000),
    (11, 1, 1, 220000),
    (11, 96, 1, 410000),
    (11, 17, 1, 400000),
    (11, 82, 3, 310000),
    (12, 65, 1, 310000),
    (12, 59, 1, 120000),
    (12, 77, 2, 180000),
    (13, 21, 2, 260000),
    (14, 37, 1, 200000),
    (14, 65, 2, 140000),
    (14, 24, 2, 70000),
    (15, 94, 1, 110000),
    (15, 3, 2, 410000),
    (15, 36, 3, 200000),
    (15, 6, 3, 340000),
    (16, 54, 1, 270000),
    (16, 26, 2, 370000),
    (17, 4, 3, 150000),
    (18, 45, 2, 420000),
    (18, 14, 2, 230000),
    (18, 24, 3, 110000),
    (19, 12, 2, 280000),
    (20, 85, 2, 250000),
    (20, 69, 2, 240000),
    (21, 90, 3, 320000),
    (22, 23, 1, 170000),
    (23, 51, 1, 260000),
    (23, 29, 2, 240000),
    (23, 19, 2, 170000),
    (23, 4, 3, 300000),
    (24, 97, 2, 120000),
    (24, 77, 2, 310000),
    (25, 2, 1, 140000),
    (25, 33, 2, 120000),
    (26, 34, 1, 70000),
    (26, 93, 1, 70000),
    (26, 41, 3, 200000),
    (27, 76, 1, 150000),
    (28, 81, 3, 430000),
    (28, 59, 3, 260000),
    (29, 73, 3, 360000),
    (29, 34, 1, 130000),
    (29, 96, 2, 110000),
    (30, 72, 2, 210000),
    (31, 86, 2, 150000),
    (31, 29, 3, 130000),
    (31, 76, 2, 260000),
    (31, 92, 1, 240000),
    (32, 48, 3, 300000),
    (33, 75, 2, 180000),
    (33, 45, 3, 90000),
    (33, 63, 2, 70000),
    (34, 28, 1, 80000),
    (34, 61, 1, 190000),
    (34, 10, 3, 190000),
    (35, 23, 3, 170000),
    (35, 36, 1, 380000),
    (36, 100, 3, 430000),
    (36, 4, 3, 50000),
    (36, 71, 1, 300000),
    (37, 33, 3, 200000),
    (37, 3, 2, 60000),
    (37, 43, 2, 190000),
    (38, 56, 1, 160000),
    (38, 37, 1, 160000),
    (38, 54, 3, 160000),
    (39, 100, 1, 320000),
    (39, 13, 2, 290000),
    (39, 3, 1, 140000),
    (39, 2, 1, 370000),
    (40, 18, 2, 120000),
    (41, 2, 2, 260000),
    (42, 41, 2, 180000),
    (42, 80, 3, 320000),
    (43, 30, 2, 190000),
    (43, 60, 1, 350000),
    (43, 86, 2, 200000),
    (44, 41, 3, 340000),
    (44, 81, 2, 110000),
    (44, 62, 1, 90000),
    (45, 66, 1, 220000),
    (45, 99, 3, 110000),
    (45, 41, 1, 320000),
    (46, 61, 3, 130000),
    (46, 47, 2, 210000),
    (47, 36, 2, 150000),
    (47, 3, 3, 60000),
    (47, 15, 1, 290000),
    (47, 21, 2, 110000),
    (48, 80, 3, 380000),
    (48, 74, 1, 190000),
    (48, 44, 1, 330000),
    (48, 55, 1, 410000),
    (49, 29, 3, 180000),
    (49, 69, 1, 170000),
    (49, 94, 3, 400000),
    (49, 96, 2, 190000),
    (50, 73, 1, 120000),
    (50, 20, 2, 290000),
    (51, 78, 3, 440000),
    (51, 52, 1, 190000),
    (51, 79, 3, 240000),
    (52, 39, 1, 160000),
    (53, 61, 3, 380000),
    (53, 2, 2, 440000),
    (54, 12, 3, 200000),
    (55, 35, 3, 50000),
    (55, 45, 2, 170000),
    (55, 31, 2, 290000),
    (56, 58, 1, 310000),
    (56, 14, 3, 190000),
    (56, 90, 1, 160000),
    (56, 74, 2, 60000),
    (57, 80, 1, 270000),
    (57, 51, 3, 260000),
    (57, 21, 1, 150000),
    (57, 73, 1, 360000),
    (58, 73, 2, 140000),
    (59, 73, 2, 50000),
    (60, 29, 1, 280000),
    (60, 18, 3, 210000),
    (60, 30, 2, 410000),
    (60, 15, 3, 430000),
    (61, 31, 3, 60000),
    (61, 22, 2, 140000),
    (62, 64, 3, 70000),
    (62, 63, 1, 300000),
    (62, 32, 1, 140000),
    (63, 64, 3, 270000),
    (63, 43, 1, 120000),
    (64, 2, 1, 210000),
    (64, 62, 2, 400000),
    (65, 93, 3, 410000),
    (66, 64, 1, 180000),
    (67, 9, 2, 140000),
    (68, 4, 3, 420000),
    (68, 23, 1, 50000),
    (68, 27, 2, 60000),
    (69, 56, 1, 440000),
    (69, 37, 1, 260000),
    (69, 26, 3, 400000),
    (70, 40, 3, 280000),
    (71, 24, 1, 220000),
    (71, 29, 3, 200000),
    (72, 50, 3, 100000),
    (72, 18, 2, 370000),
    (72, 21, 2, 100000),
    (73, 23, 1, 330000),
    (73, 79, 3, 400000),
    (73, 88, 1, 370000),
    (73, 34, 3, 280000),
    (74, 73, 1, 350000),
    (74, 34, 2, 160000),
    (75, 95, 2, 160000),
    (76, 80, 1, 130000),
    (76, 77, 3, 70000),
    (76, 18, 2, 50000),
    (77, 18, 1, 170000),
    (77, 11, 2, 100000),
    (77, 41, 1, 430000),
    (77, 38, 3, 70000),
    (78, 18, 2, 170000),
    (78, 23, 1, 150000),
    (79, 27, 3, 300000),
    (79, 16, 2, 360000),
    (79, 9, 2, 260000),
    (79, 34, 1, 190000),
    (80, 41, 2, 100000),
    (80, 96, 1, 410000),
    (80, 54, 1, 170000),
    (80, 60, 3, 50000),
    (81, 29, 1, 430000),
    (81, 36, 2, 80000),
    (81, 40, 2, 60000),
    (81, 5, 1, 370000),
    (82, 17, 3, 290000),
    (83, 91, 2, 240000),
    (83, 41, 1, 310000),
    (84, 66, 2, 380000),
    (84, 6, 1, 280000),
    (84, 42, 3, 250000),
    (85, 86, 2, 370000),
    (85, 15, 2, 260000),
    (86, 10, 3, 140000),
    (86, 12, 3, 370000),
    (86, 46, 3, 260000),
    (87, 93, 3, 140000),
    (87, 34, 2, 440000),
    (87, 30, 3, 340000),
    (87, 47, 1, 330000),
    (88, 100, 3, 400000),
    (88, 75, 1, 270000),
    (88, 45, 3, 230000),
    (88, 89, 2, 250000),
    (89, 85, 2, 400000),
    (89, 9, 1, 300000),
    (89, 3, 3, 410000),
    (90, 11, 2, 60000),
    (91, 43, 2, 220000),
    (91, 10, 1, 70000),
    (91, 89, 1, 250000),
    (92, 68, 3, 300000),
    (93, 18, 3, 290000),
    (94, 21, 1, 190000),
    (94, 15, 3, 180000),
    (94, 61, 1, 280000),
    (95, 67, 3, 260000),
    (95, 68, 2, 280000),
    (95, 97, 2, 260000),
    (95, 80, 2, 230000),
    (96, 12, 1, 100000),
    (96, 100, 3, 190000),
    (96, 83, 1, 280000),
    (96, 88, 2, 210000),
    (97, 89, 3, 260000),
    (97, 39, 3, 290000),
    (97, 42, 3, 290000),
    (98, 58, 1, 330000),
    (98, 65, 1, 80000),
    (98, 22, 2, 240000),
    (98, 55, 2, 180000),
    (99, 48, 1, 260000),
    (99, 74, 3, 440000),
    (99, 73, 3, 410000),
    (100, 70, 3, 120000),
    (100, 49, 1, 420000),
    (100, 5, 3, 270000),
    (100, 21, 2, 280000),
    (101, 60, 3, 140000),
    (101, 34, 2, 160000),
    (101, 70, 1, 50000),
    (102, 30, 1, 360000),
    (102, 97, 2, 380000),
    (102, 100, 1, 360000),
    (102, 17, 1, 260000),
    (103, 66, 2, 440000),
    (103, 53, 1, 50000),
    (103, 18, 1, 280000),
    (104, 25, 2, 420000),
    (105, 9, 2, 440000),
    (105, 3, 3, 240000),
    (106, 33, 2, 230000),
    (107, 56, 2, 260000),
    (107, 49, 1, 240000),
    (107, 87, 1, 170000),
    (107, 88, 1, 240000),
    (108, 49, 2, 300000),
    (108, 84, 3, 300000),
    (109, 28, 2, 170000),
    (110, 58, 3, 310000),
    (111, 73, 1, 120000),
    (112, 17, 2, 260000),
    (113, 75, 1, 130000),
    (114, 85, 3, 420000),
    (115, 95, 1, 240000),
    (116, 94, 1, 360000),
    (117, 94, 3, 370000),
    (118, 61, 1, 140000),
    (118, 6, 2, 440000),
    (119, 92, 2, 170000),
    (119, 96, 3, 290000),
    (119, 74, 1, 60000),
    (119, 28, 2, 90000),
    (120, 76, 1, 180000),
    (120, 79, 1, 380000),
    (120, 26, 1, 60000),
    (120, 88, 1, 100000),
    (121, 76, 2, 410000),
    (122, 66, 2, 150000),
    (122, 17, 1, 280000),
    (123, 65, 1, 130000),
    (123, 94, 1, 230000),
    (123, 39, 1, 340000),
    (123, 51, 1, 380000),
    (124, 92, 1, 430000),
    (125, 7, 2, 200000),
    (125, 45, 1, 90000),
    (126, 28, 3, 220000),
    (126, 14, 2, 320000),
    (127, 53, 2, 100000),
    (128, 10, 1, 220000),
    (128, 23, 3, 320000),
    (128, 98, 3, 430000),
    (129, 1, 1, 85000),
    (129, 5, 1, 75000),
    (129, 8, 1, 180000),
    (129, 10, 1, 120000),
    (129, 15, 1, 220000),
    (130, 20, 1, 75000),
    (130, 25, 1, 85000),
    (130, 30, 1, 420000),
    (130, 35, 1, 45000),
    (130, 40, 1, 45000),
    (131, 45, 1, 75000),
    (131, 50, 1, 55000),
    (131, 55, 1, 130000),
    (131, 60, 1, 85000),
    (131, 65, 1, 95000),
    (132, 70, 1, 65000),
    (132, 75, 1, 180000),
    (132, 80, 1, 65000),
    (132, 85, 1, 280000),
    (132, 90, 1, 180000),
    (133, 95, 1, 550000),
    (133, 98, 1, 150000),
    (133, 99, 1, 35000),
    (133, 100, 1, 15000),
    (133, 2, 1, 95000);


-- ============================================================
--  REVIEWS
-- ============================================================
INSERT INTO reviews (order_id, product_id, customer_id, rating, comment, is_curated, is_hidden)
VALUES (3, 14, 7, 5, 'Cây rất đẹp, giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ tiếp!', TRUE, FALSE),
       (1, 3, 5, 4, 'Cây xanh tốt, chăm sóc dễ dàng. Nhưng giao hơi trễ 1 ngày.', FALSE, FALSE),
       (2, 6, 6, 5, 'Monstera đẹp vượt mong đợi! Lá xẻ đều, tươi tắn. Đóng gói rất chuyên nghiệp.', TRUE, FALSE),
       (4, 41, 5, 3, 'Sen đá nhỏ hơn hình, nhưng chất lượng OK.', FALSE, FALSE),
       (5, 76, 6, 5, 'Sedum tricolor đẹp mê ly! Đã đặt thêm 2 chậu nữa.', TRUE, FALSE),
       (1, 3, 5, 5, 'Cây đẹp đúng như mô tả, đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!', TRUE, FALSE),
       (1, 76, 5, 4, 'Chậu đẹp, chất lượng tốt, giá hợp lý. Sẽ mua lại lần sau.', TRUE, FALSE),
       (2, 6, 6, 5, 'Monstera đẹp lắm, lá to khỏe, không bị dập nát khi vận chuyển. 5 sao!', TRUE, FALSE),
       (3, 14, 7, 4, 'ZZ Plant khỏe mạnh, đúng size, tuy nhiên chậu hơi nhỏ so với cây.', TRUE, FALSE),
       (7, 3, 5, 5, 'Mua lần 2 vẫn rất hài lòng, kim tiền lên nhanh tốt lắm!', TRUE, FALSE),
       (7, 11, 5, 5, 'Cây Sanh Bonsai dáng rất nghệ thuật, giao nhanh.', TRUE, FALSE),
       (8, 24, 5, 3, 'Hoa giấy hơi nhỏ so với ảnh chụp nhưng bù lại cây khá tươi.', FALSE, FALSE);

-- ============================================================
--  TICKETS
-- ============================================================
INSERT INTO tickets (creator_id, assignee_id, title, detail, state, priority)
VALUES (5, 4, 'Yêu cầu đổi cây bị hư', 'Cây Kim Tiền giao đến bị vàng lá, xin đổi cây mới.', 'RESOLVED', 'HIGH'),
       (7, 4, 'Hỏi về chính sách bảo hành', 'Cây mua được 5 ngày có được bảo hành không?', 'DONE', 'LOW'),
       (8, NULL, 'Yêu cầu tư vấn chọn cây', 'Cần tư vấn cây phù hợp cho phòng ngủ hướng Bắc.', 'PROCESSING', 'MEDIUM');

-- ============================================================
--  COMMENTS
-- ============================================================
INSERT INTO comments (ticket_id, creator_id, detail)
VALUES (1, 4, 'Cảm ơn bạn đã phản hồi. Chúng tôi sẽ gửi cây thay thế trong 24h.'),
       (2, 4, 'Cây được bảo hành 7 ngày. Bạn cung cấp hình ảnh để chúng tôi kiểm tra nhé.'),
       (1, 5, 'Cảm ơn shop đã hỗ trợ nhanh chóng!'),
       (1, 4,
        'Chào bạn, cảm ơn đã liên hệ. Bạn đang để cây ở đâu và tưới bao nhiêu nước mỗi lần? Cho mình biết thêm để hỗ trợ tốt hơn nhé.'),
       (1, 5, 'Tôi để cây gần cửa sổ có ánh sáng gián tiếp và tưới khoảng nửa ly nước mỗi ngày.'),
       (1, 4,
        'Bạn đang tưới hơi nhiều rồi. Kim tiền chỉ cần tưới 2-3 ngày một lần, để đất khô nhẹ mới tưới. Thử giảm tưới xem cây có phục hồi không nhé!'),
       (2, 4,
        'Xin lỗi bạn vì sự cố này. Mình đã kiểm tra đơn hàng và xác nhận có nhầm lẫn. Shop sẽ giao đúng sản phẩm Monstera cho bạn trong 1-2 ngày tới, hoàn toàn miễn phí.'),
       (3, 4,
        'Sen đá cần ít nước hơn bạn nghĩ. Nguyên tắc là: để đất khô hoàn toàn rồi mới tưới, mỗi lần tưới đẫm. Nên đặt nơi có nhiều ánh sáng, tối thiểu 4-6 tiếng nắng mỗi ngày.'),
       (3, 8, 'Cảm ơn shop đã tư vấn chi tiết, tôi đã hiểu rồi. Chắc trước giờ tôi tưới nhiều quá nên cây bị úng.');

-- ============================================================
--  BLOG VOTES — bảng vote cho blog posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_votes
(
    user_id
    BIGINT
    NOT
    NULL
    REFERENCES
    users
(
    id
) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES blog_posts
(
    id
)
  ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY
(
    user_id,
    post_id
)
    );

-- ============================================================
--  BLOG POSTS — chuyển is_published sang status
-- ============================================================
ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS status VARCHAR (20) DEFAULT 'DRAFT'
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
CREATE TABLE IF NOT EXISTS blog_images
(
    id
    BIGSERIAL
    PRIMARY
    KEY,
    post_id
    BIGINT
    NOT
    NULL
    REFERENCES
    blog_posts
(
    id
) ON DELETE CASCADE,
    image_url TEXT NOT NULL
    );

CREATE INDEX IF NOT EXISTS idx_blog_images_post ON blog_images(post_id);

ALTER TABLE blog_images
    ADD COLUMN IF NOT EXISTS image_data BYTEA,
    ADD COLUMN IF NOT EXISTS file_name VARCHAR (255),
    ADD COLUMN IF NOT EXISTS content_type VARCHAR (100),
ALTER
COLUMN post_id DROP
NOT NULL;
TRUNCATE TABLE policies RESTART IDENTITY;

-- ===============================
-- RETURN REQUEST
-- ===============================

CREATE TABLE return_request (
 id UUID PRIMARY KEY,

 order_id BIGINT NOT NULL,
 customer_id BIGINT NOT NULL,

 reason VARCHAR(50) NOT NULL,
 return_type VARCHAR(50) NOT NULL,
 status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

 expected_fee NUMERIC(12,2),
 price_difference NUMERIC(12,2),
 refund_amount NUMERIC(12,2),
 additional_payment NUMERIC(12,2),

 financial_processed BOOLEAN NOT NULL DEFAULT FALSE,

 bank_name VARCHAR(255),
 bank_account VARCHAR(255),
 account_number VARCHAR(255),
 account_holder VARCHAR(255),

 manager_note VARCHAR(1000),

 created_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP NOT NULL,
 completed_at TIMESTAMP,


 CONSTRAINT fk_return_request_order
     FOREIGN KEY(order_id)
         REFERENCES orders(id),


 CONSTRAINT fk_return_request_customer
     FOREIGN KEY(customer_id)
         REFERENCES users(id)
);



-- ===============================
-- RETURN REQUEST ITEM
-- ===============================

CREATE TABLE return_request_item (

      id UUID PRIMARY KEY,

      return_request_id UUID NOT NULL,

      order_id BIGINT NOT NULL,
      product_id BIGINT NOT NULL,

      quantity INTEGER NOT NULL,


      CONSTRAINT fk_return_item_request
          FOREIGN KEY(return_request_id)
              REFERENCES return_request(id)
              ON DELETE CASCADE,


      CONSTRAINT fk_return_item_order_detail
          FOREIGN KEY(order_id, product_id)
              REFERENCES order_detail(order_id, product_id)
);



-- ===============================
-- RETURN EVIDENCE
-- ===============================

CREATE TABLE return_evidence (

  id BIGSERIAL PRIMARY KEY,

  return_request_id UUID NOT NULL,

  image_url TEXT NOT NULL,

  image_data BYTEA,

  file_name VARCHAR(255),

  content_type VARCHAR(100),

  description TEXT,


  CONSTRAINT fk_return_evidence_request
      FOREIGN KEY(return_request_id)
          REFERENCES return_request(id)
          ON DELETE CASCADE
);



-- ===============================
-- RETURN EXCHANGE PRODUCT
-- ===============================

CREATE TABLE return_exchange_product (

          id BIGSERIAL PRIMARY KEY,

          return_request_id UUID NOT NULL UNIQUE,

          product_id BIGINT NOT NULL,

          quantity INTEGER NOT NULL DEFAULT 1,


          CONSTRAINT fk_exchange_request
              FOREIGN KEY(return_request_id)
                  REFERENCES return_request(id)
                  ON DELETE CASCADE,


          CONSTRAINT fk_exchange_product
              FOREIGN KEY(product_id)
                  REFERENCES products(id)
);

INSERT INTO policies (title, description, status)
VALUES ('Chính sách Đổi trả & Hoàn tiền', '## 1. Điều kiện đổi trả
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

INSERT INTO tickets (title, detail, creator_id, assignee_id, state, priority, time_created, time_resolved)
SELECT 
    'Sample Ticket for User ' || id,
    'This is an automatically generated ticket to test the dashboard for user ' || id || '.',
    id,
    NULL,
    'CREATED',
    'MEDIUM',
    CURRENT_TIMESTAMP,
    NULL
FROM users;

INSERT INTO reviews (order_id, product_id, customer_id, rating, comment, is_curated, is_hidden, created_at)
SELECT 
    od.order_id,
    od.product_id,
    o.customer_id,
    floor(random() * 2 + 4)::int,
    (ARRAY[
        'Cây đẹp, tươi tốt, đóng gói rất cẩn thận. Sẽ ủng hộ shop dài dài!', 
        'Sản phẩm tuyệt vời, giao hàng siêu nhanh. Rất đáng tiền!', 
        'Cây y như hình, shop tư vấn nhiệt tình. Cảm ơn shop nhiều nhé.', 
        'Rất hài lòng với chất lượng sản phẩm. Trưng trong nhà rất đẹp.',
        'Mua lần thứ 2 rồi và vẫn rất ưng ý. Khuyên mọi người nên mua!'
    ])[floor(random() * 5) + 1],
    random() < 0.5,
    false,
    CURRENT_TIMESTAMP
FROM order_detail od
JOIN orders o ON od.order_id = o.id
WHERE (od.product_id % 10) < 8
  AND NOT EXISTS (
      SELECT 1 FROM reviews r 
      WHERE r.order_id = od.order_id 
        AND r.product_id = od.product_id
  );

-- ============================================================
--  25 DEDICATED REVIEWS & ORDERS FOR "Xương Rồng Gỗ Nhỏ" (product_id = 75)
-- ============================================================
DO $$
DECLARE
    u_ids INT[] := ARRAY[5, 6, 7, 8, 9, 10];
    comments TEXT[] := ARRAY[
        'Xương rồng gỗ nhỏ hình dáng rất độc đáo, cây khỏe đẹp, đóng gói cẩn thận 5 sao!',
        'Cây xinh xắn, để trên bàn làm việc rất hợp phong thủy. Giao hàng siêu nhanh.',
        'Rất ưng ý với sản phẩm này của shop. Cây tươi tốt, không bị gẫy gai hay dập.',
        'Xương rồng đẹp, nhưng kích thước hơi nhỏ hơn mình tưởng tượng một chút.',
        'Shop bọc bong bóng khí rất kỹ, cây đến tay vẫn xanh tươi rạng rỡ!',
        'Chậu đẹp, cây khỏe, tưới ít nước rất dễ chăm sóc cho người bận rộn.',
        'Giao hàng đúng hẹn, nhân viên giao hàng thân thiện, cây y như trong ảnh.',
        'Cây đáng yêu lắm, mình đã mua 2 cây để tặng bạn bè đều rất thích.',
        'Xương rồng gỗ tạo dáng độc lạ, nhìn rất nghệ thuật. Đánh giá 5 sao!',
        'Cây rồng gỗ nhỏ gọn, gai chắc chắn, chậu đất nung đi kèm rất xinh.',
        'Nhận được cây rất tươi, đất còn hơi ẩm nhẹ, đóng gói 10/10.',
        'Sản phẩm tốt, giá cả hợp lý so với thị trường. Sẽ tiếp tục mua ủng hộ.',
        'Cây nhỏ xinh để cạnh laptop vừa vặn, tạo không gian xanh rất thư thái.',
        'Giao hàng trễ mất 1 ngày do bên vận chuyển, nhưng cây vẫn rất tươi tốt.',
        'Xương rồng khá đẹp nhưng đất bị vung ra ngoài một ít khi bóc hộp.',
        'Hình dáng cây độc đáo, bạn bè ghé chơi ai cũng khen.',
        'Rất hài lòng về thái độ phục vụ của shop và chất lượng cây.',
        'Cây bị gãy 1 nhánh nhỏ do vận chuyển đường xa. Shop hỗ trợ nhiệt tình.',
        'Xương rồng gỗ màu xanh rất mướt, gai không quá nhọn, dễ thương.',
        'Tuyệt vời! Đã mua nhiều lần ở shop và lần nào cũng rất hài lòng.',
        'Cây không đúng kích thước mô tả, nhỏ hơn khá nhiều.',
        'Spam test review comment 123',
        'Cây xanh đẹp, giao hàng thần tốc trong ngày.',
        'Xương rồng khỏe mạnh, sống tốt sau 2 tuần trồng.',
        'Rất thích dáng cây này, nhìn như một tác phẩm mini bonsai.'
    ];
    ratings INT[] := ARRAY[5, 5, 5, 4, 5, 5, 5, 5, 5, 4, 5, 4, 5, 4, 3, 5, 5, 3, 4, 5, 2, 1, 5, 5, 5];
    is_curated_arr BOOLEAN[] := ARRAY[true, true, false, false, true, false, false, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, true];
    is_hidden_arr BOOLEAN[] := ARRAY[false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false];
    new_order_id BIGINT;
    cust_id INT;
    i INT;
BEGIN
    FOR i IN 1..25 LOOP
        cust_id := u_ids[(i % 6) + 1];

        INSERT INTO orders (customer_id, shipper_id, shipping_address, shipping_fee, discount, status, created_at, delivery_date)
        VALUES (cust_id, 3, 'Địa chỉ giao hàng đơn #' || i, 30000, 0, 'RECEIVED', CURRENT_TIMESTAMP - (i || ' days')::INTERVAL, CURRENT_TIMESTAMP - (i || ' days')::INTERVAL + INTERVAL '2 days')
        RETURNING id INTO new_order_id;

        INSERT INTO order_detail (order_id, product_id, quantity, price_paid)
        VALUES (new_order_id, 75, 1, 180000);

        INSERT INTO reviews (order_id, product_id, customer_id, rating, comment, is_curated, is_hidden, created_at)
        VALUES (new_order_id, 75, cust_id, ratings[i], comments[i], is_curated_arr[i], is_hidden_arr[i], CURRENT_TIMESTAMP - (i || ' days')::INTERVAL + INTERVAL '2 days');
    END LOOP;
END $$;

-- Un-curate all reviews in the database
UPDATE reviews SET is_curated = FALSE;

-- Populate tickets so that khach1 has a lot of tickets sent
INSERT INTO tickets (creator_id, assignee_id, title, detail, state, priority, time_created)
VALUES 
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Hỏi về thời gian giao hàng đơn 9999', 'Tại sao đơn hàng 9999 của tôi vẫn chưa chuyển sang trạng thái Delivering?', 'PROCESSING', 'HIGH', NOW() - INTERVAL '3 hours'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Yêu cầu hủy đơn hàng', 'Tôi muốn hủy đơn hàng vừa đặt nhầm.', 'RESOLVED', 'MEDIUM', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), NULL, 'Cây bị héo úa sau 2 ngày', 'Cây kim tiền tôi mua được 2 ngày thì lá bắt đầu vàng úa.', 'CREATED', 'CRITICAL', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Lỗi thanh toán qua VNPay', 'Giao dịch báo thành công nhưng đơn hàng vẫn hiển thị Chưa thanh toán.', 'DONE', 'HIGH', NOW() - INTERVAL '4 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), NULL, 'Tư vấn chọn chậu cây ngoài trời', 'Tôi muốn mua chậu trồng cây ngoài ban công hướng Tây.', 'CREATED', 'LOW', NOW() - INTERVAL '5 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Hỏi về chính sách tích điểm', 'Tôi mua đơn hàng 1 triệu nhưng chưa thấy điểm tích lũy thay đổi.', 'DONE', 'LOW', NOW() - INTERVAL '6 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), NULL, 'Cây không đúng kích thước', 'Chậu lưỡi hổ mini thực tế bé hơn nhiều so với mô tả.', 'CREATED', 'MEDIUM', NOW() - INTERVAL '7 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Yêu cầu xuất hóa đơn VAT', 'Công ty tôi cần xuất hóa đơn cho đơn hàng mua cây văn phòng.', 'RESOLVED', 'MEDIUM', NOW() - INTERVAL '8 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Cây bị gãy cành khi nhận', 'Shipper giao hàng làm gãy cành Monstera.', 'DONE', 'HIGH', NOW() - INTERVAL '10 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Chất lượng đất trồng không tốt', 'Đất trồng cây có xơ dừa bị mốc.', 'DONE', 'LOW', NOW() - INTERVAL '12 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), NULL, 'Không áp dụng được mã giảm giá', 'Mã GREENSHOOT20 báo không hợp lệ dù tôi mua đơn đầu tiên.', 'CREATED', 'MEDIUM', NOW() - INTERVAL '13 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Hỏi về dịch vụ chăm sóc cây tại nhà', 'Vườn nhà tôi có nhiều cây bị sâu bệnh, shop có dịch vụ phun thuốc không?', 'PROCESSING', 'MEDIUM', NOW() - INTERVAL '14 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Yêu cầu hoàn tiền', 'Đơn hàng đổi trả đã hoàn thành 5 ngày nhưng chưa nhận được tiền hoàn.', 'PROCESSING', 'HIGH', NOW() - INTERVAL '15 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), 4, 'Tư vấn trồng cây phong thủy cho tuổi Thìn', 'Tôi sinh năm 1988 muốn tìm cây đặt bàn làm việc.', 'DONE', 'LOW', NOW() - INTERVAL '16 days'),
((SELECT id FROM users WHERE email = 'khach1@gmail.com'), NULL, 'Giao thiếu chậu sứ đi kèm', 'Đơn hàng chỉ có cây và bầu đất, không thấy chậu sứ đâu.', 'CREATED', 'HIGH', NOW() - INTERVAL '18 days');

-- Make sure one of khach1's order has a lot of products inside, named order id 9999
INSERT INTO orders (id, customer_id, shipper_id, shipping_address, shipping_fee, discount, status, created_at, delivery_date)
VALUES (9999, (SELECT id FROM users WHERE email = 'khach1@gmail.com'), 3, '123 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 30000, 0, 'RECEIVED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days');

-- Update orders primary key sequence
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- Populate order details for order 9999 with 15 products
INSERT INTO order_detail (order_id, product_id, quantity, price_paid)
VALUES 
(9999, 1, 1, 85000),   -- Trầu bà xanh
(9999, 2, 2, 95000),   -- Lưỡi hổ nhỏ
(9999, 3, 1, 120000),  -- Kim tiền
(9999, 5, 1, 75000),   -- Dây leo pothos
(9999, 6, 1, 250000),  -- Monstera nhỏ
(9999, 10, 2, 120000), -- Lan ý
(9999, 12, 1, 45000),  -- Xương rồng tai thỏ
(9999, 14, 1, 180000), -- Hồng môn đỏ
(9999, 25, 2, 85000),  -- Hoa giấy
(9999, 36, 1, 85000),  -- Hương thảo
(9999, 41, 3, 35000),  -- Sen đá thạch ngọc
(9999, 47, 1, 180000), -- Kim ngân bàn
(9999, 62, 2, 55000),  -- Sen đá kim cương
(9999, 75, 1, 180000), -- Xương rồng gỗ nhỏ
(9999, 99, 4, 35000);  -- Chậu sứ trắng 15cm


