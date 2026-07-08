/**
 * 学校管理员认证控制器 (开发模式 - 明文密码)
 * !!! 警告：生产环境严禁使用明文密码，请务必恢复 bcrypt 哈希 !!!
 */
// const bcrypt = require('bcrypt'); // 暂时禁用 bcrypt
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db'); // 引入数据库连接池
const jwtConfig = require('../config/jwt'); // 引入JWT配置

/**
 * 处理学校管理员登录请求
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    // 1. 根据用户名查询管理员账户
    const [rows] = await pool.query('SELECT * FROM school_admin_accounts WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const adminAccount = rows[0];

    // 2. 检查账户状态
    if (adminAccount.status !== 'active') {
       let message = '账户已被禁用';
       if (adminAccount.status === 'locked') message = '账户已被锁定';
       return res.status(403).json({ success: false, message: message });
    }

    // --- 【重要修改】直接比较明文密码 ---
    // const isMatch = await bcrypt.compare(password, adminAccount.password); // 禁用 bcrypt 比较
    const isMatch = (password === adminAccount.password); // 直接比较明文
    // ------------------------------------

    if (!isMatch) {
      // 可选：增加登录失败次数记录和账户锁定逻辑
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 4. 登录成功，生成JWT令牌
    const payload = {
      adminAccountId: adminAccount.admin_account_id, // 使用 admin_account_id
      schoolId: adminAccount.school_id,
      username: adminAccount.username,
      role: 'school_admin', // 明确角色
      permissions: adminAccount.permissions ? JSON.parse(adminAccount.permissions) : {} // 解析权限
      // 可以添加其他需要的信息到 payload
    };

    const token = jwt.sign(payload, jwtConfig.JWT_SECRET, { expiresIn: jwtConfig.JWT_EXPIRES_IN });

    // 5. 更新最后登录时间 (异步执行，不阻塞响应)
    pool.query('UPDATE school_admin_accounts SET last_login = NOW() WHERE admin_account_id = ?', [adminAccount.admin_account_id])
      .catch(err => console.error('更新最后登录时间失败:', err));

    // 6. 返回成功响应
    res.json({
      success: true,
      message: '登录成功 (开发模式 - 明文密码)', // 提示当前为明文模式
      data: {
        token,
        user: { // 返回用户信息，结构尽量与普通用户登录保持一致，但包含管理员特定信息
          id: adminAccount.admin_account_id, // 使用管理员账户ID
          username: adminAccount.username,
          fullName: adminAccount.full_name,
          email: adminAccount.email,
          schoolId: adminAccount.school_id,
          role: 'school_admin', // 明确角色
          roleName: adminAccount.role_name,
          permissions: payload.permissions // 返回解析后的权限
        }
      }
    });

  } catch (error) {
    console.error('学校管理员登录时出错:', error);
    res.status(500).json({ success: false, message: '服务器内部错误，登录失败' });
  }
}; 