-- 管理员初始化数据

-- 1. 插入初始管理员账号(密码都是123456)
INSERT INTO admins (username, password, email, real_name, role, status) VALUES
('admin', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'admin@example.com', '系统管理员', 'super_admin', 'active'),
('operator', '$2a$10$NxPGEBs3ReBdpkC.U.A1f.c3COgj4MZpQZ8S.5b1.LAU3kL9oQP3O', 'operator@example.com', '运营人员', 'operator', 'active');

-- 2. 插入角色
INSERT INTO roles (role_name, description) VALUES
('super_admin', '超级管理员，拥有所有权限'),
('admin', '普通管理员，拥有大部分管理权限'),
('operator', '运营人员，仅拥有内容管理和基础查询权限');

-- 3. 插入权限
INSERT INTO permissions (permission_name, description) VALUES
('user.view', '查看用户信息'),
('user.edit', '编辑用户信息'),
('user.delete', '删除用户'),
('content.view', '查看内容'),
('content.edit', '编辑内容'),
('content.delete', '删除内容'),
('system.config', '系统配置管理'),
('system.log', '系统日志查看'),
('admin.manage', '管理员账号管理'),
('role.manage', '角色权限管理'),
('database.query', '数据库查询');

-- 4. 分配角色权限
-- 超级管理员拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions;

-- 普通管理员拥有除系统配置、管理员管理和角色权限管理外的所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions WHERE permission_name NOT IN ('system.config', 'admin.manage', 'role.manage');

-- 运营人员只有基本权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions WHERE permission_name IN ('user.view', 'content.view', 'content.edit', 'database.query');

-- 5. 系统配置初始值
INSERT INTO system_configs (config_key, config_value, description, is_editable) VALUES
('site.name', 'CampusLife管理系统', '站点名称', 1),
('site.logo', '/logo.png', '站点Logo', 1),
('db.max_query_rows', '1000', '数据库查询最大返回行数', 1),
('db.timeout', '30', '数据库查询超时时间(秒)', 1),
('login.max_attempts', '5', '最大登录尝试次数', 1),
('login.lock_time', '30', '账号锁定时间(分钟)', 1); 