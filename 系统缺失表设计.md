# 校园社交平台 - 系统缺失表设计

## 一、角色与权限管理相关表

### 1. 角色表（roles）

```sql
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `priority` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '角色优先级',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
```

**初始数据**:

```sql
INSERT INTO `roles` (`name`, `code`, `description`, `priority`) VALUES 
('系统管理员', 'SYSTEM_ADMIN', '拥有系统全部权限', 100),
('学校管理员', 'SCHOOL_ADMIN', '管理学校各项事务', 90),
('学院管理员', 'FACULTY_ADMIN', '管理学院各项事务', 80),
('社团管理员', 'CLUB_ADMIN', '管理社团各项事务', 70),
('普通学生', 'STUDENT', '普通学生用户', 10);
```

### 2. 权限表（permissions）

```sql
CREATE TABLE `permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL COMMENT '权限编码',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '权限描述',
  `category` VARCHAR(50) NOT NULL COMMENT '权限类别',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';
```

**初始数据**:

```sql
INSERT INTO `permissions` (`name`, `code`, `description`, `category`) VALUES 
-- 用户管理权限
('查看用户', 'USER:VIEW', '查看用户信息', '用户管理'),
('编辑用户', 'USER:EDIT', '编辑用户信息', '用户管理'),
('删除用户', 'USER:DELETE', '删除用户', '用户管理'),
('审核用户', 'USER:AUDIT', '审核用户验证申请', '用户管理'),

-- 内容管理权限
('发布动态', 'POST:CREATE', '发布动态', '内容管理'),
('编辑动态', 'POST:EDIT', '编辑动态内容', '内容管理'),
('删除动态', 'POST:DELETE', '删除动态', '内容管理'),
('审核动态', 'POST:AUDIT', '审核动态内容', '内容管理'),

-- 商品管理权限
('发布商品', 'PRODUCT:CREATE', '发布商品', '商品管理'),
('编辑商品', 'PRODUCT:EDIT', '编辑商品信息', '商品管理'),
('删除商品', 'PRODUCT:DELETE', '删除商品', '商品管理'),
('审核商品', 'PRODUCT:AUDIT', '审核商品信息', '商品管理'),

-- 悬赏管理权限
('发布悬赏', 'MISSION:CREATE', '发布悬赏', '悬赏管理'),
('编辑悬赏', 'MISSION:EDIT', '编辑悬赏信息', '悬赏管理'),
('删除悬赏', 'MISSION:DELETE', '删除悬赏', '悬赏管理'),
('审核悬赏', 'MISSION:AUDIT', '审核悬赏内容', '悬赏管理'),

-- 社团管理权限
('创建社团', 'CLUB:CREATE', '创建社团', '社团管理'),
('编辑社团', 'CLUB:EDIT', '编辑社团信息', '社团管理'),
('删除社团', 'CLUB:DELETE', '删除社团', '社团管理'),
('管理社团成员', 'CLUB:MANAGE_MEMBERS', '管理社团成员', '社团管理'),
('发布社团公告', 'CLUB:ANNOUNCE', '发布社团公告', '社团管理'),

-- 学校管理权限
('管理学校信息', 'SCHOOL:MANAGE', '管理学校基本信息', '学校管理'),
('管理学院', 'FACULTY:MANAGE', '管理学院信息', '学校管理'),

-- 系统管理权限
('角色管理', 'ROLE:MANAGE', '管理角色', '系统管理'),
('权限分配', 'PERMISSION:ASSIGN', '分配权限', '系统管理'),
('系统监控', 'SYSTEM:MONITOR', '监控系统运行状态', '系统管理'),
('系统配置', 'SYSTEM:CONFIG', '配置系统参数', '系统管理'),
('查看日志', 'SYSTEM:VIEW_LOGS', '查看系统日志', '系统管理');
```

### 3. 用户角色关联表（user_roles）

```sql
CREATE TABLE `user_roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `expired_at` TIMESTAMP NULL DEFAULT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';
```

### 4. 角色权限关联表（role_permissions）

```sql
CREATE TABLE `role_permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`,`permission_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';
```

## 二、财务相关表

### 1. 用户账户表（accounts）

```sql
CREATE TABLE `accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
  `frozen_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '冻结金额',
  `total_income` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '总收入',
  `total_expense` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '总支出',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0-冻结，1-正常',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账户表';
```

### 2. 交易记录表（transactions）

```sql
CREATE TABLE `transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '交易ID',
  `transaction_no` VARCHAR(64) NOT NULL COMMENT '交易编号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` TINYINT UNSIGNED NOT NULL COMMENT '交易类型：1-充值，2-提现，3-支付，4-收入，5-退款，6-其他',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '交易金额',
  `balance` DECIMAL(10,2) NOT NULL COMMENT '交易后余额',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '交易描述',
  `reference_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID（订单ID、悬赏ID等）',
  `reference_type` VARCHAR(50) DEFAULT NULL COMMENT '关联类型',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0-失败，1-成功，2-处理中',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transaction_no` (`transaction_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_reference` (`reference_id`, `reference_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_transactions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易记录表';
```

## 三、公告管理表

### 1. 公告表（announcements）

```sql
CREATE TABLE `announcements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` VARCHAR(100) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `publisher_id` BIGINT UNSIGNED NOT NULL COMMENT '发布者ID',
  `publisher_type` VARCHAR(50) NOT NULL COMMENT '发布者类型：SYSTEM-系统，SCHOOL-学校，FACULTY-学院，CLUB-社团',
  `reference_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID',
  `level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '重要程度：0-普通，1-重要，2-紧急',
  `start_time` TIMESTAMP NULL DEFAULT NULL COMMENT '生效时间',
  `end_time` TIMESTAMP NULL DEFAULT NULL COMMENT '结束时间',
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '查看次数',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0-草稿，1-已发布，2-已下线',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_publisher` (`publisher_id`, `publisher_type`),
  KEY `idx_reference_id` (`reference_id`),
  KEY `idx_status` (`status`),
  KEY `idx_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';
```

### 2. 公告媒体表（announcement_media）

```sql
CREATE TABLE `announcement_media` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `announcement_id` BIGINT UNSIGNED NOT NULL COMMENT '公告ID',
  `media_type` TINYINT UNSIGNED NOT NULL COMMENT '媒体类型：1-图片，2-视频，3-文档',
  `media_url` VARCHAR(255) NOT NULL COMMENT '媒体URL',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_announcement_id` (`announcement_id`),
  CONSTRAINT `fk_announcement_media_announcement_id` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告媒体表';
```

## 四、用户验证相关表

### 1. 验证申请表（verification_requests）

```sql
CREATE TABLE `verification_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` TINYINT UNSIGNED NOT NULL COMMENT '验证类型：1-学生验证，2-教师验证，3-员工验证',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `id_number` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
  `school_id` BIGINT UNSIGNED NOT NULL COMMENT '学校ID',
  `faculty_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '学院ID',
  `student_id` VARCHAR(20) DEFAULT NULL COMMENT '学号',
  `employee_id` VARCHAR(20) DEFAULT NULL COMMENT '教工号',
  `grade` VARCHAR(20) DEFAULT NULL COMMENT '年级',
  `class_name` VARCHAR(50) DEFAULT NULL COMMENT '班级',
  `mobile` VARCHAR(15) DEFAULT NULL COMMENT '联系电话',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '联系邮箱',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已拒绝，3-需补充材料',
  `reject_reason` VARCHAR(255) DEFAULT NULL COMMENT '拒绝原因',
  `auditor_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '审核人ID',
  `audit_time` TIMESTAMP NULL DEFAULT NULL COMMENT '审核时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_school_id` (`school_id`),
  KEY `idx_faculty_id` (`faculty_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_verification_requests_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_verification_requests_school_id` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证申请表';
```

### 2. 验证文档表（verification_documents）

```sql
CREATE TABLE `verification_documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `verification_id` BIGINT UNSIGNED NOT NULL COMMENT '验证申请ID',
  `document_type` TINYINT UNSIGNED NOT NULL COMMENT '文档类型：1-身份证，2-学生证，3-教师证，4-其他证明',
  `document_url` VARCHAR(255) NOT NULL COMMENT '文档URL',
  `document_name` VARCHAR(100) DEFAULT NULL COMMENT '文档名称',
  `upload_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `is_valid` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否有效：0-无效，1-有效',
  PRIMARY KEY (`id`),
  KEY `idx_verification_id` (`verification_id`),
  CONSTRAINT `fk_verification_documents_verification_id` FOREIGN KEY (`verification_id`) REFERENCES `verification_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证文档表';
```

## 五、系统管理相关表

### 1. 系统指标表（system_metrics）

```sql
CREATE TABLE `system_metrics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `metric_name` VARCHAR(50) NOT NULL COMMENT '指标名称',
  `metric_value` DOUBLE NOT NULL COMMENT '指标值',
  `metric_unit` VARCHAR(20) DEFAULT NULL COMMENT '指标单位',
  `host` VARCHAR(50) DEFAULT NULL COMMENT '主机名',
  `instance` VARCHAR(50) DEFAULT NULL COMMENT '实例名',
  `collect_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '采集时间',
  PRIMARY KEY (`id`),
  KEY `idx_metric_name` (`metric_name`),
  KEY `idx_collect_time` (`collect_time`),
  KEY `idx_host` (`host`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统指标表';
```

### 2. 系统日志表（system_logs）

```sql
CREATE TABLE `system_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `level` VARCHAR(10) NOT NULL COMMENT '日志级别',
  `message` TEXT NOT NULL COMMENT '日志消息',
  `source` VARCHAR(100) DEFAULT NULL COMMENT '日志来源',
  `trace_id` VARCHAR(64) DEFAULT NULL COMMENT '跟踪ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联用户ID',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(255) DEFAULT NULL COMMENT '用户代理',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_level` (`level`),
  KEY `idx_source` (`source`),
  KEY `idx_trace_id` (`trace_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';
```

### 3. 系统配置分类表（config_categories）

```sql
CREATE TABLE `config_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `code` VARCHAR(50) NOT NULL COMMENT '分类编码',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置分类表';
```

**初始数据**:

```sql
INSERT INTO `config_categories` (`name`, `code`, `description`, `sort_order`) VALUES 
('基础配置', 'BASIC', '系统基础配置', 10),
('安全配置', 'SECURITY', '系统安全相关配置', 20),
('功能配置', 'FEATURE', '系统功能相关配置', 30),
('通知配置', 'NOTIFICATION', '系统通知相关配置', 40),
('内容配置', 'CONTENT', '内容展示相关配置', 50),
('交易配置', 'TRANSACTION', '交易相关配置', 60);
```

### 4. 系统配置表（system_configs）

```sql
CREATE TABLE `system_configs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '配置名称',
  `code` VARCHAR(100) NOT NULL COMMENT '配置编码',
  `value` TEXT DEFAULT NULL COMMENT '配置值',
  `value_type` VARCHAR(20) NOT NULL COMMENT '值类型: STRING, NUMBER, BOOLEAN, JSON',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '配置描述',
  `is_system` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否系统配置：0-否，1-是',
  `is_hidden` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否隐藏：0-否，1-是',
  `is_readonly` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否只读：0-否，1-是',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `updated_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_system_configs_category_id` FOREIGN KEY (`category_id`) REFERENCES `config_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
```

**初始数据**:

```sql
INSERT INTO `system_configs` (`category_id`, `name`, `code`, `value`, `value_type`, `description`, `is_system`) VALUES 
((SELECT id FROM config_categories WHERE code = 'BASIC'), '网站名称', 'SITE_NAME', '校园社交平台', 'STRING', '网站名称', 1),
((SELECT id FROM config_categories WHERE code = 'BASIC'), '网站描述', 'SITE_DESCRIPTION', '校园社交服务平台', 'STRING', '网站描述', 0),
((SELECT id FROM config_categories WHERE code = 'BASIC'), '网站LOGO', 'SITE_LOGO', '/assets/images/logo.png', 'STRING', '网站LOGO路径', 0),
((SELECT id FROM config_categories WHERE code = 'BASIC'), '联系邮箱', 'CONTACT_EMAIL', 'contact@campus.com', 'STRING', '联系邮箱', 0),
((SELECT id FROM config_categories WHERE code = 'SECURITY'), '登录尝试次数', 'LOGIN_ATTEMPT_LIMIT', '5', 'NUMBER', '用户登录失败尝试次数限制', 1),
((SELECT id FROM config_categories WHERE code = 'SECURITY'), '登录锁定时间', 'LOGIN_LOCK_TIME', '30', 'NUMBER', '登录锁定时间(分钟)', 1),
((SELECT id FROM config_categories WHERE code = 'SECURITY'), '密码最小长度', 'PASSWORD_MIN_LENGTH', '6', 'NUMBER', '密码最小长度', 1),
((SELECT id FROM config_categories WHERE code = 'FEATURE'), '启用打赏功能', 'ENABLE_REWARD', 'true', 'BOOLEAN', '是否启用打赏功能', 0),
((SELECT id FROM config_categories WHERE code = 'FEATURE'), '启用交易功能', 'ENABLE_TRANSACTION', 'true', 'BOOLEAN', '是否启用交易功能', 0),
((SELECT id FROM config_categories WHERE code = 'NOTIFICATION'), '新消息通知', 'NOTIFY_NEW_MESSAGE', 'true', 'BOOLEAN', '收到新消息时是否通知', 0),
((SELECT id FROM config_categories WHERE code = 'NOTIFICATION'), '评论通知', 'NOTIFY_COMMENT', 'true', 'BOOLEAN', '收到评论时是否通知', 0),
((SELECT id FROM config_categories WHERE code = 'NOTIFICATION'), '点赞通知', 'NOTIFY_LIKE', 'true', 'BOOLEAN', '收到点赞时是否通知', 0),
((SELECT id FROM config_categories WHERE code = 'TRANSACTION'), '最小提现金额', 'MIN_WITHDRAW_AMOUNT', '10', 'NUMBER', '最小提现金额(元)', 0),
((SELECT id FROM config_categories WHERE code = 'TRANSACTION'), '提现手续费率', 'WITHDRAW_FEE_RATE', '0.01', 'NUMBER', '提现手续费率', 1);
```

### 5. 配置变更日志表（config_change_logs）

```sql
CREATE TABLE `config_change_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `config_id` BIGINT UNSIGNED NOT NULL COMMENT '配置ID',
  `old_value` TEXT DEFAULT NULL COMMENT '旧值',
  `new_value` TEXT DEFAULT NULL COMMENT '新值',
  `changed_by` BIGINT UNSIGNED NOT NULL COMMENT '变更人ID',
  `change_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '变更备注',
  PRIMARY KEY (`id`),
  KEY `idx_config_id` (`config_id`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_change_time` (`change_time`),
  CONSTRAINT `fk_config_change_logs_config_id` FOREIGN KEY (`config_id`) REFERENCES `system_configs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配置变更日志表';
```

## 索引策略和优化建议

1. **合理使用联合索引**
   - 对于多字段查询的场景，可以创建联合索引以提高查询效率
   - 例如：在`user_roles`表中可以创建`(user_id, role_id)`的联合索引

2. **避免过度索引**
   - 索引虽然能加速查询，但会降低写入性能
   - 针对频繁更新但查询不频繁的字段，应当避免创建索引

3. **考虑分表策略**
   - 对于日志表和交易记录表等高频写入表，可以考虑按时间分表
   - 例如：`system_logs_202301`, `system_logs_202302`等

4. **关注缓存策略**
   - 对于频繁读取的配置数据，应该建立缓存机制
   - 对于权限数据，可以在用户登录时加载到会话中，避免频繁查询数据库

5. **使用预热数据**
   - 针对角色、权限等基础数据，系统启动时可以加载到内存
   - 减少运行时数据库访问压力

## 系统升级与迁移建议

1. **数据迁移脚本**
   - 编写增量SQL脚本用于表结构创建
   - 创建基础数据的初始化脚本
   - 准备回滚脚本以应对升级失败情况

2. **版本管理**
   - 引入数据库版本管理工具，如Flyway或Liquibase
   - 维护数据库版本变更记录

3. **兼容性维护**
   - 新表设计应考虑与现有数据的兼容性
   - 避免直接修改现有表的主键或外键关系

4. **系统冗余设计**
   - 考虑引入读写分离机制，提高系统性能
   - 为高频访问表设计合理的缓存策略 