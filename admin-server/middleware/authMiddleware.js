const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// 中间件：验证学校管理员 JWT
const verifySchoolAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: '未提供有效的认证令牌' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 验证令牌并解码
        const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
        
        // 检查角色是否为学校管理员 (如果需要严格区分)
        if (decoded.role !== 'school_admin') {
             return res.status(403).json({ success: false, message: '无权访问此资源 (需要学校管理员权限)' });
        }

        // 将解码后的管理员信息附加到请求对象
        // 确保包含 schoolId 等后续控制器需要的信息
        req.admin = decoded; 
        console.log('学校管理员认证中间件 - 令牌验证成功:', decoded);
        next(); // 继续处理请求
    } catch (error) {
        console.error('学校管理员认证中间件 - 令牌验证失败:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: '认证令牌已过期' });
        } else if (error.name === 'JsonWebTokenError') {
             return res.status(401).json({ success: false, message: '无效的认证令牌' });
        } else {
             return res.status(500).json({ success: false, message: '认证时发生错误' });
        }
    }
};

// 可以添加其他中间件，例如验证超级管理员的
// const verifySuperAdminToken = (req, res, next) => { ... };

module.exports = {
    verifySchoolAdminToken,
    // verifySuperAdminToken 
}; 