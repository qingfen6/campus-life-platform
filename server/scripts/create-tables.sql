--这是目前数据库已经建立的所有表

-- 1. 用户相关表
-- 1.1 用户表(users)
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

-- 1.2 用户关系表(user_relations)
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

-- 2. 学校与学院表
-- 2.1 学校表(schools)
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

-- 2.2 学院表(faculties)
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

-- 3. 内容发布表
-- 3.1 动态表(posts)
CREATE TABLE IF NOT EXISTS posts (
    post_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    post_type ENUM('general', 'question', 'activity', 'resource') DEFAULT 'general',
    visibility ENUM('public', 'school', 'followers') DEFAULT 'public',
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

-- 3.2 动态媒体表(post_media)
CREATE TABLE IF NOT EXISTS post_media (
    media_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT UNSIGNED NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    display_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.3 商品表(products)
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

-- 3.4 产品图片表(product_images)
CREATE TABLE product_images (
    image_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.5 悬赏任务表(missions)
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

-- 3.6 悬赏接取表(mission_takes)
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
-- 
-- 4. 社交互动表
-- 4.1 评论表(comments)
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

-- 4.2 点赞表(likes)
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

-- 4.3 分享表(shares)
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

-- 4.4 打赏表(rewards)
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

-- 5. 活动与社团表
-- 5.1 活动表(activities)
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

-- 5.2 活动参与表(activity_participants)
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

-- 5.3 社团表(clubs)
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

-- 5.4 社团成员表(club_members)
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

-- 6. 通信与通知表
-- 6.1 消息表(messages)
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

-- 6.2 通知表(notifications)
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

-- 7. 标签与分类表
-- 7.1 标签表(tags)
CREATE TABLE IF NOT EXISTS tags (
    tag_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL,
    count INT UNSIGNED DEFAULT 0,
    trending BOOLEAN DEFAULT FALSE,
    hot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tag_name (tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.2 内容标签关联表(content_tags)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 订单与交易表
-- 8.1 订单表(orders)
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
