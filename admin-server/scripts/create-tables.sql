-- 1. 用户相关表
-- 1.1 用户表(users)
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS user_relations (
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
CREATE TABLE IF NOT EXISTS schools (
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
CREATE TABLE IF NOT EXISTS faculties (
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

-- 3.2 动态媒体表(post_media)
CREATE TABLE IF NOT EXISTS post_media (
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

-- 3.3 商品表(products)
CREATE TABLE IF NOT EXISTS products (
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

-- 4. 社交互动表
-- 4.1 评论表(comments)
CREATE TABLE IF NOT EXISTS comments (
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
CREATE TABLE IF NOT EXISTS likes (
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

-- 5. 活动与社团表
-- 5.1 活动表(activities)
CREATE TABLE IF NOT EXISTS activities (
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

-- 5.3 社团表(clubs)
CREATE TABLE IF NOT EXISTS clubs (
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