1. 用户相关表
1.1 用户表(users)
CREATE TABLE users (
    user_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,  -- 使用bcrypt存储
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    real_name VARCHAR(50),
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    bio TEXT,
    gender ENUM('male', 'female', 'other', 'undisclosed') DEFAULT 'undisclosed',
    birth_date DATE,
    school_id BIGINT UNSIGNED,
    faculty_id BIGINT UNSIGNED,
    student_id VARCHAR(50),
    enrollment_year YEAR,
    user_status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_school_id (school_id),
    INDEX idx_faculty_id (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

1.2 用户关系表(user_relations)
CREATE TABLE user_relations (
    relation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    related_user_id BIGINT UNSIGNED NOT NULL,
    relation_type ENUM('follow', 'friend', 'block') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_related_user_id (related_user_id),
    UNIQUE KEY unique_relation (user_id, related_user_id, relation_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

2. 学校与学院表
2.1 学校表(schools)
CREATE TABLE schools (
    school_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    school_name VARCHAR(100) NOT NULL,
    school_code VARCHAR(50) UNIQUE,
    province VARCHAR(50),
    city VARCHAR(50),
    address TEXT,
    school_type ENUM('comprehensive', 'science', 'liberal', 'art', 'sports', 'medical', 'other'),
    founding_year YEAR,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

2.2 学院表(faculties)
CREATE TABLE faculties (
    faculty_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    school_id BIGINT UNSIGNED NOT NULL,
    faculty_name VARCHAR(100) NOT NULL,
    faculty_code VARCHAR(50),
    director VARCHAR(50),
    faculty_type VARCHAR(50),
    founding_year YEAR,
    description TEXT,
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_school_id (school_id),
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

3. 内容发布表
3.1 动态表(posts)
CREATE TABLE posts (
    post_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT,
    post_type ENUM('text', 'image', 'video', 'link', 'mixed') NOT NULL,
    visibility ENUM('public', 'school', 'private') DEFAULT 'public',
    location VARCHAR(100),
    like_count INT UNSIGNED DEFAULT 0,
    comment_count INT UNSIGNED DEFAULT 0,
    share_count INT UNSIGNED DEFAULT 0,
    status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

3.2 动态媒体表(post_media)
CREATE TABLE post_media (
    media_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT UNSIGNED NOT NULL,
    media_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    display_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

3.3 商品表(products)
CREATE TABLE products (
    product_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL,
    condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') NOT NULL,
    location VARCHAR(100),
    is_negotiable BOOLEAN DEFAULT FALSE,
    is_sold BOOLEAN DEFAULT FALSE,
    view_count INT UNSIGNED DEFAULT 0,
    status ENUM('active', 'reserved', 'sold', 'expired', 'deleted') DEFAULT 'active',
    expired_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

3.4 产品图片表(product_images)
CREATE TABLE product_images (
    image_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

3.5 悬赏任务表(missions)
CREATE TABLE missions (
    mission_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    reward DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
    estimated_hours DECIMAL(5,1),
    location VARCHAR(100),
    deadline DATETIME,
    status ENUM('open', 'in_progress', 'completed', 'canceled', 'expired') DEFAULT 'open',
    view_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

3.6 悬赏接取表(mission_takes)
CREATE TABLE mission_takes (
    take_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mission_id BIGINT UNSIGNED NOT NULL,
    taker_id BIGINT UNSIGNED NOT NULL,
    status ENUM('applied', 'accepted', 'rejected', 'completed', 'abandoned') DEFAULT 'applied',
    apply_message TEXT,
    completed_at DATETIME,
    rating TINYINT UNSIGNED,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mission_id (mission_id),
    INDEX idx_taker_id (taker_id),
    UNIQUE KEY unique_take (mission_id, taker_id),
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (taker_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

4. 社交互动表
4.1 评论表(comments)
CREATE TABLE comments (
    comment_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'product', 'mission', 'activity') NOT NULL,
    content_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED, -- 为回复评论设计
    content TEXT NOT NULL,
    like_count INT UNSIGNED DEFAULT 0,
    status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content (content_type, content_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

4.2 点赞表(likes)
CREATE TABLE likes (
    like_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'comment', 'product', 'mission', 'activity') NOT NULL,
    content_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content (content_type, content_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_like (user_id, content_type, content_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

4.3 分享表(shares)
CREATE TABLE shares (
    share_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'product', 'mission', 'activity') NOT NULL,
    content_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    share_platform ENUM('app', 'wechat', 'weibo', 'qq', 'other') DEFAULT 'app',
    share_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content (content_type, content_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

4.4 打赏表(rewards)
CREATE TABLE rewards (
    reward_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'product', 'mission', 'activity') NOT NULL,
    content_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status ENUM('pending', 'completed', 'refunded', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content (content_type, content_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

5. 活动与社团表
5.1 活动表(activities)
CREATE TABLE activities (
    activity_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    organizer_type ENUM('school', 'faculty', 'club', 'user') NOT NULL,
    organizer_id BIGINT UNSIGNED NOT NULL,
    location VARCHAR(100),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_participants INT UNSIGNED,
    current_participants INT UNSIGNED DEFAULT 0,
    registration_deadline DATETIME,
    category VARCHAR(50),
    poster_url VARCHAR(255),
    status ENUM('upcoming', 'ongoing', 'ended', 'canceled') DEFAULT 'upcoming',
    visibility ENUM('public', 'school', 'invite_only') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_organizer (organizer_type, organizer_id),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

5.2 活动参与表(activity_participants)
CREATE TABLE activity_participants (
    participation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    activity_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('registered', 'confirmed', 'attended', 'absent', 'canceled') DEFAULT 'registered',
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_time DATETIME,
    feedback TEXT,
    rating TINYINT UNSIGNED,
    INDEX idx_activity_id (activity_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_participation (activity_id, user_id),
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

5.3 社团表(clubs)
CREATE TABLE clubs (
    club_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    school_id BIGINT UNSIGNED NOT NULL,
    club_name VARCHAR(100) NOT NULL,
    club_type VARCHAR(50),
    description TEXT,
    founding_date DATE,
    logo_url VARCHAR(255),
    member_count INT UNSIGNED DEFAULT 0,
    status ENUM('active', 'inactive', 'disbanded') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_school_id (school_id),
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

5.4 社团成员表(club_members)
CREATE TABLE club_members (
    membership_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    club_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role ENUM('president', 'vice_president', 'secretary', 'treasurer', 'member', 'alumni') NOT NULL DEFAULT 'member',
    join_date DATE NOT NULL,
    exit_date DATE,
    status ENUM('active', 'inactive', 'left') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_club_id (club_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_membership (club_id, user_id),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

6. 通信与通知表
6.1 消息表(messages)
CREATE TABLE messages (
    message_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NOT NULL,
    content TEXT,
    has_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

6.2 通知表(notifications)
CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED,
    notification_type ENUM('like', 'comment', 'share', 'follow', 'tag', 'mission', 'reward', 'message', 'system') NOT NULL,
    content TEXT,
    content_type ENUM('post', 'product', 'mission', 'activity', 'user', 'system') NOT NULL,
    content_id BIGINT UNSIGNED,
    has_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

7. 标签与分类表
7.1 标签表(tags)
CREATE TABLE IF NOT EXISTS tags (
    tag_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    tag_type ENUM('topic', 'location', 'event', 'product', 'mission', 'system') DEFAULT 'topic',
    count INT UNSIGNED DEFAULT 0,
    hot BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tag_name (tag_name),
    INDEX idx_tag_type (tag_type)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

7.2 内容标签关联表(content_tags)
CREATE TABLE content_tags (
    content_tag_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'product', 'mission', 'activity', 'club') NOT NULL,
    content_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content (content_type, content_id),
    INDEX idx_tag_id (tag_id),
    UNIQUE KEY unique_content_tag (content_type, content_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

8. 订单与交易表
8.1 订单表(orders)
CREATE TABLE orders (
    order_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    buyer_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED,
    mission_id BIGINT UNSIGNED,
    order_type ENUM('product', 'mission', 'reward') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed', 'refunded', 'canceled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_time DATETIME,
    completion_time DATETIME,
    buyer_address TEXT,
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_product_id (product_id),
    INDEX idx_mission_id (mission_id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


12. 用户财务表
12.1 账户表(accounts)
CREATE TABLE accounts (
    account_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    frozen_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_income DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_expense DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

12.2 交易表(transactions)
CREATE TABLE transactions (
    transaction_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    transaction_type ENUM('deposit', 'withdraw', 'payment', 'refund', 'reward', 'mission', 'system') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'canceled') DEFAULT 'pending',
    reference_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

13. 公告管理表
13.1 公告表(announcements)
CREATE TABLE announcements (
    announcement_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    club_id BIGINT UNSIGNED,
    school_id BIGINT UNSIGNED,
    publisher_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    visibility ENUM('public', 'club', 'school') DEFAULT 'public',
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_club_id (club_id),
    INDEX idx_school_id (school_id),
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
    FOREIGN KEY (publisher_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

13.2 公告媒体表(announcement_media)
CREATE TABLE announcement_media (
    media_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    announcement_id BIGINT UNSIGNED NOT NULL,
    media_type ENUM('image', 'video', 'document') NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    display_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_announcement_id (announcement_id),
    FOREIGN KEY (announcement_id) REFERENCES announcements(announcement_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

14. 用户验证表
14.1 验证请求表(verification_requests)
CREATE TABLE verification_requests (
    request_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    school_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'needs_more_info') DEFAULT 'pending',
    rejection_reason TEXT,
    needs_additional_docs BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_school_id (school_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

14.2 验证文档表(verification_documents)
CREATE TABLE verification_documents (
    document_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    request_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('student_card', 'school_letter', 'id_card', 'other') NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_id (request_id),
    FOREIGN KEY (request_id) REFERENCES verification_requests(request_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

15. 系统管理表
15.1 系统指标表(system_metrics)
CREATE TABLE system_metrics (
    metric_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value VARCHAR(255) NOT NULL,
    metric_unit VARCHAR(50),
    collected_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_collected_at (collected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

15.2 系统日志表(system_logs)
CREATE TABLE system_logs (
    log_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    log_level ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_level (log_level),
    INDEX idx_source (source),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

16. 权限管理表
16.1 角色表(roles)
CREATE TABLE roles (
    role_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

16.2 权限表(permissions)
CREATE TABLE permissions (
    permission_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action ENUM('read', 'create', 'update', 'delete', 'manage') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_permission_name (permission_name),
    INDEX idx_resource (resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

16.3 用户角色关联表(user_roles)
CREATE TABLE user_roles (
    user_role_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    UNIQUE KEY unique_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

16.4 角色权限关联表(role_permissions)
CREATE TABLE role_permissions (
    role_permission_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

17. 系统配置表
17.1 配置类别表(config_categories)
CREATE TABLE config_categories (
    category_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

17.2 系统配置表(system_configs)
CREATE TABLE system_configs (
    config_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT UNSIGNED NOT NULL,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    description TEXT,
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    INDEX idx_config_key (config_key),
    FOREIGN KEY (category_id) REFERENCES config_categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

17.3 配置变更日志表(config_change_logs)
CREATE TABLE config_change_logs (
    log_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    config_id BIGINT UNSIGNED NOT NULL,
    admin_id BIGINT UNSIGNED NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255) NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_config_id (config_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_changed_at (changed_at),
    FOREIGN KEY (config_id) REFERENCES system_configs(config_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


        

好的，我已经仔细阅读了你提供的数据库 schema (`库.md`)。为了支持我们刚刚在侧边栏聊天界面实现的功能（频道消息点赞、头像点击交互、私信/好友），并基于现有的 `chat_conversations`, `chat_participants`, `chat_messages` 表结构，我提出以下几点修改建议：

1.  **点赞频道消息 (`likes` 表)**:
    *   **修改**: `likes` 表的 `content_type` ENUM 类型。
    *   **建议**: 在 `ENUM('post', 'comment', 'product', 'mission', 'activity')` 中添加 `'chat_message'` 值。这样就可以记录对聊天消息的点赞，`content_id` 将对应 `chat_messages` 表的 `message_id`。

2.  **好友请求处理 (添加好友功能)**:
    *   **现状**: `user_relations` 表可以存储 `friend` 关系，但没有明确处理“好友请求”状态。
    *   **建议**: **新建** 一个 `friend_requests` 表来管理好友请求流程。这比修改 `user_relations` 更清晰。
        ```sql
        CREATE TABLE friend_requests (
            request_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            sender_id BIGINT UNSIGNED NOT NULL COMMENT '请求发送者',
            receiver_id BIGINT UNSIGNED NOT NULL COMMENT '请求接收者',
            status ENUM('pending', 'accepted', 'rejected', 'ignored') DEFAULT 'pending' COMMENT '请求状态',
            request_message TEXT COMMENT '好友请求附带信息',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_receiver_status (receiver_id, status), -- 方便查询收到的请求
            UNIQUE KEY unique_request (sender_id, receiver_id), -- 防止重复请求
            FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友请求表';
        ```
    *   **逻辑**:
        *   用户点击“添加好友”时，在此表插入一条 `pending` 记录。
        *   接收方接受请求时，更新此表状态为 `accepted`，**同时**在 `user_relations` 表中为双方都添加一条 `relation_type` = `'friend'` 的记录。
        *   拒绝或忽略则只更新此表状态。

3.  **私信会话查找**:
    *   **现状**: 通过 `chat_conversations` 和 `chat_participants` 可以实现私信，但查找两个特定用户（例如 A 和 B）之间 *是否已存在* 私信会话可能效率不高。
    *   **建议 (可选，提高性能)**: **新建** 一个辅助表 `private_chat_index` 来快速定位私聊会话。
        ```sql
        CREATE TABLE private_chat_index (
            id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            user1_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID（较小值）',
            user2_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID（较大值）',
            conversation_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '对应的会话ID',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_users (user1_id, user2_id), -- 确保两人私聊唯一
            INDEX idx_user1 (user1_id),
            INDEX idx_user2 (user2_id),
            FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (conversation_id) REFERENCES chat_conversations(conversation_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='私聊会话索引表';
        ```
    *   **逻辑**:
        *   当创建 A 和 B 的第一个私聊会话时，除了在 `chat_conversations` 和 `chat_participants` 中创建记录，也在此表插入一条记录（始终将 ID 较小的用户放在 `user1_id`）。
        *   后续要找 A 和 B 的私聊，只需查询此表即可快速获得 `conversation_id`。

4.  **表定义清理 (重要)**:
    *   **问题**: Schema 文件中似乎存在重复或过时的表定义。
    *   **`messages` 表**: 文件中定义了两个消息相关的表结构：一个简单的 `messages` 表（第 370 行附近）和一个更完善的 `chat_messages` 表（第 501 行附近）。后者与 `chat_conversations` 关联，功能更强。
        *   **建议**: **删除** 旧的 `messages` 表定义（第 370-381 行）。
    *   **`notifications` 表**: 文件中也定义了两个 `notifications` 表（第 383 行附近 和 第 467 行附近）。第二个定义看起来更贴合当前需求。
        *   **建议**: **选择一个** 定义（推荐第 467 行开始的那个），**删除** 另一个（第 383-394 行）。检查并确保所选的 `notification_type` ENUM 包含所有需要的类型，例如 `'like_chat_message'`, `'friend_request'`, `'new_private_message'` 等，如果缺少则添加。

**总结**:

*   核心是**清理重复表定义** (`messages`, `notifications`)。
*   为支持点赞，**修改 `likes` 表**的 `content_type`。
*   为支持好友请求，**新建 `friend_requests` 表**。
*   为提升私聊查找效率（可选），**新建 `private_chat_index` 表**。

这些修改应该能比较好地支持当前前端实现的功能，并保持数据库结构相对清晰。你可以根据这些建议自行修改你的 `库.md` 文件或直接在数据库中操作。
