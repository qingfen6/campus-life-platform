/**
 * @file adminSchoolController.js
 * @description Controller for managing schools in the admin panel.
 */
const { pool } = require('../config/db');

/**
 * 创建新学校
 * @route POST /api/admin/schools
 */
exports.createSchool = async (req, res) => {
    const {
        school_name,
        school_code,
        province,
        city,
        address,
        school_type,
        logo_url,
        website,
        description
    } = req.body;

    if (!school_name || !school_code) {
        return res.status(400).json({ message: '学校名称和代码不能为空' });
    }

    const query = `
        INSERT INTO schools (school_name, school_code, province, city, address, school_type, logo_url, website, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [school_name, school_code, province, city, address, school_type, logo_url, website, description];

    try {
        const [result] = await pool.query(query, values);
        res.status(201).json({
            success: true,
            message: '学校创建成功',
            data: { school_id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('创建学校失败:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: '学校代码或名称已存在', error: error.message });
        }
        res.status(500).json({ success: false, message: '服务器错误，创建学校失败', error: error.message });
    }
};

/**
 * 获取所有学校 (支持分页和搜索)
 * @route GET /api/admin/schools
 */
exports.getAllSchools = async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '' // 搜索校名, 代码
    } = req.query;

    const offset = (page - 1) * limit;
    let queryParams = [];
    let countQueryParams = [];
    
    let baseQuery = 'FROM schools WHERE 1=1';
    
    if (search) {
        const searchTerm = `%${search}%`;
        baseQuery += ' AND (school_name LIKE ? OR school_code LIKE ?)';
        queryParams.push(searchTerm, searchTerm);
        countQueryParams.push(searchTerm, searchTerm);
    }

    const countQuery = `SELECT COUNT(*) as count ${baseQuery}`;
    const dataQuery = `SELECT school_id, school_name, school_code, province, city, address, school_type, logo_url, website, description, created_at, updated_at ${baseQuery} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    queryParams.push(parseInt(limit), parseInt(offset));

    try {
        const [countRows] = await pool.query(countQuery, countQueryParams);
        const totalSchools = countRows[0].count;
        const [schools] = await pool.query(dataQuery, queryParams);

        res.json({
            success: true,
            message: '学校列表获取成功',
            data: schools,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalSchools / limit),
                totalItems: totalSchools,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取学校列表失败:', error);
        res.status(500).json({ success: false, message: '服务器错误，获取学校列表失败', error: error.message });
    }
};

/**
 * 根据ID获取学校详情
 * @route GET /api/admin/schools/:schoolId
 */
exports.getSchoolById = async (req, res) => {
    const { schoolId } = req.params;
    const query = 'SELECT school_id, school_name, school_code, province, city, address, school_type, logo_url, website, description, created_at, updated_at FROM schools WHERE school_id = ?';
    try {
        const [rows] = await pool.query(query, [schoolId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '学校不存在' });
        }
        res.json({
            success: true,
            message: '学校详情获取成功',
            data: rows[0]
        });
    } catch (error) {
        console.error(`获取学校 ${schoolId} 详情失败:`, error);
        res.status(500).json({ success: false, message: '服务器错误，获取学校详情失败', error: error.message });
    }
};

/**
 * 更新学校信息
 * @route PUT /api/admin/schools/:schoolId
 */
exports.updateSchoolById = async (req, res) => {
    const { schoolId } = req.params;
    const {
        school_name,
        school_code,
        province,
        city,
        address,
        school_type,
        logo_url,
        website,
        description
    } = req.body;

    if (!school_name && !school_code && !province && !city && !address && !school_type && !logo_url && !website && !description) {
        return res.status(400).json({ success: false, message: '没有提供可更新的字段' });
    }

    let fieldsToUpdate = {};
    if (school_name !== undefined) fieldsToUpdate.school_name = school_name;
    if (school_code !== undefined) fieldsToUpdate.school_code = school_code;
    if (province !== undefined) fieldsToUpdate.province = province;
    if (city !== undefined) fieldsToUpdate.city = city;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (school_type !== undefined) fieldsToUpdate.school_type = school_type;
    if (logo_url !== undefined) fieldsToUpdate.logo_url = logo_url;
    if (website !== undefined) fieldsToUpdate.website = website;
    if (description !== undefined) fieldsToUpdate.description = description;
    
    fieldsToUpdate.updated_at = new Date();

    const fieldEntries = Object.entries(fieldsToUpdate);
    const setClause = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldEntries.map(([, value]) => value);
    values.push(schoolId);

    const query = `UPDATE schools SET ${setClause} WHERE school_id = ?`;

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) {
           return res.status(404).json({ success: false, message: '学校不存在或数据未更改' });
        }
        const [updatedSchoolRows] = await pool.query('SELECT * FROM schools WHERE school_id = ?', [schoolId]);
        res.json({
            success: true,
            message: '学校信息更新成功',
            data: updatedSchoolRows[0]
        });
    } catch (error) {
        console.error(`更新学校 ${schoolId} 信息失败:`, error);
         if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: '学校代码或名称已存在', error: error.message });
        }
        res.status(500).json({ success: false, message: '服务器错误，更新学校信息失败', error: error.message });
    }
};

/**
 * 删除学校
 * @route DELETE /api/admin/schools/:schoolId
 */
exports.deleteSchoolById = async (req, res) => {
    const { schoolId } = req.params;
    const query = 'DELETE FROM schools WHERE school_id = ?';
    try {
        const [result] = await pool.query(query, [schoolId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '学校不存在' });
        }
        res.json({ success: true, message: '学校删除成功' });
    } catch (error) {
        console.error(`删除学校 ${schoolId} 失败:`, error);
        // 考虑外键约束错误，例如 ER_ROW_IS_REFERENCED_2
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ success: false, message: '无法删除学校，该学校可能关联了其他数据（如用户、活动等）', error: error.message });
        }
        res.status(500).json({ success: false, message: '服务器错误，删除学校失败', error: error.message });
    }
}; 