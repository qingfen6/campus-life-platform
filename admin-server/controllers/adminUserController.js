/**
 * @file adminUserController.js
 * @description Controller for managing users in the admin panel.
 */

const { pool } = require('../config/db'); // 导入数据库连接池

/**
 * 获取所有用户 (支持分页、搜索、筛选)
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '', // 搜索用户名, 真实姓名, 邮箱
        school_id = '', 
        user_status = '' // active, inactive, banned
    } = req.query;

    const offset = (page - 1) * limit;
    let queryParams = [];
    
    let baseQuery = 'FROM users u LEFT JOIN schools s ON u.school_id = s.school_id WHERE 1=1';
    let countBaseQuery = 'FROM users u WHERE 1=1'; // Count query might not need join if school name is not part of search criteria directly tied to count
    
    if (search) {
        const searchTerm = `%${search}%`;
        baseQuery += ' AND (u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)';
        countBaseQuery += ' AND (u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)';
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (school_id) {
        baseQuery += ' AND u.school_id = ?';
        countBaseQuery += ' AND u.school_id = ?';
        queryParams.push(school_id);
    }
    if (user_status) {
        baseQuery += ' AND u.user_status = ?';
        countBaseQuery += ' AND u.user_status = ?';
        queryParams.push(user_status);
    }

    const countQuery = `SELECT COUNT(*) as count ${countBaseQuery}`;
    // Select specific fields to avoid exposing sensitive data like password hashes if they were included with u.*
    const dataQuery = `SELECT u.user_id, u.username, u.email, u.phone, u.real_name, u.nickname, u.avatar_url, u.bio, u.gender, u.birth_date, u.school_id, s.school_name, u.faculty_id, u.student_id, u.enrollment_year, u.user_status, u.last_login, u.created_at, u.updated_at ${baseQuery} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    
    let dataQueryParams = [...queryParams]; // queryParams are already set for count
    dataQueryParams.push(parseInt(limit), parseInt(offset));

    try {
        const [countRows] = await pool.query(countQuery, queryParams);
        const totalUsers = countRows[0].count;
        const [users] = await pool.query(dataQuery, dataQueryParams);

        res.json({
            message: '用户列表获取成功',
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalItems: totalUsers,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({ message: '服务器错误，获取用户列表失败', error: error.message });
    }
};

/**
 * 根据ID获取用户详情
 * @route GET /api/admin/users/:userId
 */
exports.getUserById = async (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT u.user_id, u.username, u.email, u.phone, u.real_name, u.nickname, u.avatar_url, u.bio, u.gender, u.birth_date, u.school_id, s.school_name, u.faculty_id, u.student_id, u.enrollment_year, u.user_status, u.last_login, u.created_at, u.updated_at FROM users u LEFT JOIN schools s ON u.school_id = s.school_id WHERE u.user_id = ?';
    try {
        const [userRows] = await pool.query(query, [userId]);
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        const user = userRows[0]; // Get the first user object
        res.json({
            message: '用户详情获取成功',
            data: user
        });
    } catch (error) {
        console.error(`获取用户 ${userId} 详情失败:`, error);
        res.status(500).json({ message: '服务器错误，获取用户详情失败', error: error.message });
    }
};

/**
 * 更新用户信息 (管理员操作)
 * @route PUT /api/admin/users/:userId
 */
exports.updateUserById = async (req, res) => {
    const { userId } = req.params;
    const {
        nickname,
        avatar_url,
        bio,
        phone,
        real_name,
        user_status, // 'active', 'inactive', 'banned'
        school_id,
        faculty_id,
        student_id,
        enrollment_year,
        gender,
        birth_date
    } = req.body;

    let fieldsToUpdate = {};
    if (nickname !== undefined) fieldsToUpdate.nickname = nickname;
    if (avatar_url !== undefined) fieldsToUpdate.avatar_url = avatar_url;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (phone !== undefined) fieldsToUpdate.phone = phone; // Consider validation for phone format
    if (real_name !== undefined) fieldsToUpdate.real_name = real_name;
    if (user_status !== undefined && ['active', 'inactive', 'banned'].includes(user_status)) {
        fieldsToUpdate.user_status = user_status;
    }
    // Ensure school_id and faculty_id are either valid numbers or null
    if (school_id !== undefined) fieldsToUpdate.school_id = school_id ? parseInt(school_id) : null;
    if (faculty_id !== undefined) fieldsToUpdate.faculty_id = faculty_id ? parseInt(faculty_id) : null;
    if (student_id !== undefined) fieldsToUpdate.student_id = student_id;
    if (enrollment_year !== undefined) fieldsToUpdate.enrollment_year = enrollment_year ? parseInt(enrollment_year) : null; // ensure it's a year or null
    if (gender !== undefined && ['male', 'female', 'other', 'undisclosed'].includes(gender) ) fieldsToUpdate.gender = gender;
    if (birth_date !== undefined) fieldsToUpdate.birth_date = birth_date || null; // ensure it's a valid date string or null

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: '没有提供可更新的字段' });
    }
    
    fieldsToUpdate.updated_at = new Date(); // Automatically update timestamp

    const fieldEntries = Object.entries(fieldsToUpdate);
    const setClause = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldEntries.map(([, value]) => value);
    values.push(userId); // Add userId for the WHERE clause

    const query = `UPDATE users SET ${setClause} WHERE user_id = ?`;

    try {
        const [result] = await pool.query(query, values);
        
        // Check if any row was actually updated
        // Note: The structure of 'result' depends on your db library. For mysql2, it's often result[0].affectedRows or result.affectedRows.
        // Assuming the mock returns { affectedRows: X }
        if (result.affectedRows === 0) {
           return res.status(404).json({ message: '用户不存在或数据未更改' });
        }

        // Fetch the updated user details to return
        const [updatedUserRows] = await pool.query('SELECT u.user_id, u.username, u.email, u.phone, u.real_name, u.nickname, u.avatar_url, u.bio, u.gender, u.birth_date, u.school_id, s.school_name, u.faculty_id, u.student_id, u.enrollment_year, u.user_status, u.last_login, u.created_at, u.updated_at FROM users u LEFT JOIN schools s ON u.school_id = s.school_id WHERE u.user_id = ?', [userId]);
        if (!updatedUserRows || updatedUserRows.length === 0) {
             // This case should ideally not happen if update was successful, but good for robustness
            return res.status(404).json({ message: '更新后无法找到用户信息' });
        }

        res.json({
            message: '用户信息更新成功',
            data: updatedUserRows[0]
        });
    } catch (error) {
        console.error(`更新用户 ${userId} 信息失败:`, error);
        res.status(500).json({ message: '服务器错误，更新用户信息失败', error: error.message });
    }
};

// Future consideration: Soft delete a user
// exports.deleteUserById = async (req, res) => { ... }; 