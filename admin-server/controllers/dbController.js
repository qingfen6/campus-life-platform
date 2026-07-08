// 数据库查询控制器
const { pool } = require('../config/db');

// 获取表名列表
exports.getTables = async (req, res) => {
  try {
    console.log('数据库控制器: 开始获取表名列表');
    console.log('数据库控制器: 当前用户:', req.user);
    console.log('数据库控制器: 使用数据库:', process.env.DB_NAME);
    
    const [rows] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'campuslife']);

    console.log('数据库控制器: 原始查询结果:', JSON.stringify(rows));
    
    // 确保我们提取正确的表名
    const tables = rows.map(row => row.TABLE_NAME || row.table_name);
    console.log('数据库控制器: 映射后的表名:', tables);
    
    // 如果表名是null，尝试直接使用行数据
    if (tables.every(name => name === null || name === undefined)) {
      console.log('数据库控制器: 所有表名为null，使用原始行数据');
      
      // 返回完整的行数据，让前端处理
      const responseData = {
        success: true,
        data: {
          tables: rows,
          count: rows.length
        }
      };
      
      console.log('数据库控制器: 响应数据:', JSON.stringify(responseData));
      res.status(200).json(responseData);
      return;
    }
    
    console.log('数据库控制器: 获取到的表数量:', tables.length);
    console.log('数据库控制器: 表名列表:', JSON.stringify(tables));
    
    if (tables.length === 0) {
      console.log('数据库控制器: 警告 - 未找到表');
    } else {
      console.log('数据库控制器: 前5个表名:', tables.slice(0, 5));
    }

    // 构建响应数据
    const responseData = {
      success: true,
      data: {
        tables,
        count: tables.length
      }
    };
    
    console.log('数据库控制器: 响应数据:', JSON.stringify(responseData));
    res.status(200).json(responseData);
    console.log('数据库控制器: 表名列表请求响应成功');
  } catch (error) {
    console.error('数据库控制器: 获取表名列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取表名列表失败',
      error: error.message
    });
  }
};

// 获取表的结构信息
exports.getTableStructure = async (req, res) => {
  try {
    const { tableName } = req.params;
    console.log('数据库控制器: 开始获取表结构, 表名:', tableName);
    
    // 验证表名是否存在
    const [tableExists] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    if (tableExists.length === 0) {
      console.log('数据库控制器: 表不存在:', tableName);
      return res.status(404).json({
        success: false,
        message: `表 ${tableName} 不存在`
      });
    }

    // 获取表结构
    const [columns] = await pool.query(`
      SELECT column_name, column_type, is_nullable, column_key, column_default, extra, column_comment
      FROM information_schema.columns
      WHERE table_schema = ? AND table_name = ?
      ORDER BY ordinal_position
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    console.log('数据库控制器: 获取到的字段数量:', columns.length);
    console.log('数据库控制器: 字段信息:', columns);

    // 获取主键信息
    const [primaryKeys] = await pool.query(`
      SELECT k.column_name
      FROM information_schema.key_column_usage k
      JOIN information_schema.table_constraints c
      ON k.constraint_name = c.constraint_name
      WHERE k.table_schema = ? 
      AND k.table_name = ? 
      AND c.constraint_type = 'PRIMARY KEY'
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    console.log('数据库控制器: 主键数量:', primaryKeys.length);
    console.log('数据库控制器: 主键信息:', primaryKeys);

    // 如果没有找到主键，尝试从columns中查找
    let primaryKeyColumns = primaryKeys.map(pk => pk.column_name);
    if (primaryKeyColumns.length === 0) {
      primaryKeyColumns = columns
        .filter(col => col.column_key === 'PRI')
        .map(col => col.column_name);
    }
    
    console.log('数据库控制器: 最终主键列表:', primaryKeyColumns);

    // 获取外键信息
    const [foreignKeys] = await pool.query(`
      SELECT 
        k.column_name, 
        k.referenced_table_name, 
        k.referenced_column_name
      FROM 
        information_schema.key_column_usage k
      JOIN 
        information_schema.table_constraints c
      ON 
        k.constraint_name = c.constraint_name
      WHERE 
        k.table_schema = ? AND 
        k.table_name = ? AND 
        c.constraint_type = 'FOREIGN KEY'
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    console.log('数据库控制器: 外键数量:', foreignKeys.length);
    console.log('数据库控制器: 外键信息:', foreignKeys);

    res.status(200).json({
      success: true,
      data: {
        tableName,
        columns,
        primaryKeys: primaryKeyColumns,
        foreignKeys
      }
    });
    console.log('数据库控制器: 表结构请求响应成功');
  } catch (error) {
    console.error(`数据库控制器: 获取表 ${req.params.tableName} 结构失败:`, error);
    res.status(500).json({
      success: false,
      message: `获取表 ${req.params.tableName} 结构失败`,
      error: error.message
    });
  }
};

// 查询表的所有数据
exports.getAllData = async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 1000; // 默认限制1000条
    const offset = parseInt(req.query.offset) || 0;
    
    console.log('数据库控制器: 开始查询表数据, 表名:', tableName, '限制:', limit, '偏移:', offset);

    // 验证表名是否存在
    const [tableExists] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    if (tableExists.length === 0) {
      console.log('数据库控制器: 表不存在:', tableName);
      return res.status(404).json({
        success: false,
        message: `表 ${tableName} 不存在`
      });
    }

    // 获取总记录数
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM ${tableName}`);
    const total = countResult[0].total;
    console.log('数据库控制器: 表总记录数:', total);

    // 查询数据
    const [rows] = await pool.query(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [limit, offset]);
    console.log('数据库控制器: 获取到的记录数:', rows.length);

    res.status(200).json({
      success: true,
      data: {
        tableName,
        rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + rows.length < total
        }
      }
    });
    console.log('数据库控制器: 表数据请求响应成功');
  } catch (error) {
    console.error(`数据库控制器: 查询表 ${req.params.tableName} 数据失败:`, error);
    res.status(500).json({
      success: false,
      message: `查询表 ${req.params.tableName} 数据失败`,
      error: error.message
    });
  }
};

// 执行自定义SQL查询
exports.executeQuery = async (req, res) => {
  try {
    const { sql } = req.body;
    
    // 简单检查SQL是否是SELECT语句
    const isSelectQuery = sql.trim().toLowerCase().startsWith('select');
    
    if (!isSelectQuery) {
      return res.status(403).json({
        success: false,
        message: '仅允许执行SELECT查询'
      });
    }

    const [result] = await pool.query(sql);
    
    res.status(200).json({
      success: true,
      data: {
        result,
        rowCount: result.length
      }
    });
  } catch (error) {
    console.error('执行SQL查询失败:', error);
    res.status(500).json({
      success: false,
      message: '执行SQL查询失败',
      error: error.message
    });
  }
};

// 插入数据行
exports.insertRow = async (req, res) => {
  try {
    const { tableName } = req.params;
    const { data } = req.body;
    
    console.log('数据库控制器: 开始插入数据, 表名:', tableName);
    console.log('数据库控制器: 插入数据:', data);
    
    // 验证表名是否存在
    const [tableExists] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    if (tableExists.length === 0) {
      console.log('数据库控制器: 表不存在:', tableName);
      return res.status(404).json({
        success: false,
        message: `表 ${tableName} 不存在`
      });
    }
    
    // 构建插入SQL
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    console.log('数据库控制器: 执行SQL:', sql);
    
    const [result] = await pool.query(sql, values);
    
    res.status(201).json({
      success: true,
      data: {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      }
    });
    console.log('数据库控制器: 插入数据成功, 新ID:', result.insertId);
  } catch (error) {
    console.error(`数据库控制器: 插入数据到表 ${req.params.tableName} 失败:`, error);
    res.status(500).json({
      success: false,
      message: `插入数据到表 ${req.params.tableName} 失败`,
      error: error.message
    });
  }
};

// 更新数据行
exports.updateRow = async (req, res) => {
  try {
    const { tableName } = req.params;
    const { primaryKey, primaryValue, data } = req.body;
    
    console.log('数据库控制器: 开始更新数据, 表名:', tableName);
    console.log(`数据库控制器: 更新条件: ${primaryKey} = ${primaryValue}`);
    console.log('数据库控制器: 更新数据:', data);
    
    // 验证表名是否存在
    const [tableExists] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    if (tableExists.length === 0) {
      console.log('数据库控制器: 表不存在:', tableName);
      return res.status(404).json({
        success: false,
        message: `表 ${tableName} 不存在`
      });
    }
    
    // 构建更新SQL
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), primaryValue];
    
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKey} = ?`;
    console.log('数据库控制器: 执行SQL:', sql);
    
    const [result] = await pool.query(sql, values);
    
    res.status(200).json({
      success: true,
      data: {
        affectedRows: result.affectedRows
      }
    });
    console.log('数据库控制器: 更新数据成功, 影响行数:', result.affectedRows);
  } catch (error) {
    console.error(`数据库控制器: 更新表 ${req.params.tableName} 数据失败:`, error);
    res.status(500).json({
      success: false,
      message: `更新表 ${req.params.tableName} 数据失败`,
      error: error.message
    });
  }
};

// 删除数据行
exports.deleteRow = async (req, res) => {
  try {
    const { tableName } = req.params;
    const { primaryKey, primaryValue } = req.body;
    
    console.log('数据库控制器: 开始删除数据, 表名:', tableName);
    console.log(`数据库控制器: 删除条件: ${primaryKey} = ${primaryValue}`);
    
    // 验证表名是否存在
    const [tableExists] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME || 'campuslife', tableName]);
    
    if (tableExists.length === 0) {
      console.log('数据库控制器: 表不存在:', tableName);
      return res.status(404).json({
        success: false,
        message: `表 ${tableName} 不存在`
      });
    }
    
    const sql = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;
    console.log('数据库控制器: 执行SQL:', sql);
    
    const [result] = await pool.query(sql, [primaryValue]);
    
    res.status(200).json({
      success: true,
      data: {
        affectedRows: result.affectedRows
      }
    });
    console.log('数据库控制器: 删除数据成功, 影响行数:', result.affectedRows);
  } catch (error) {
    console.error(`数据库控制器: 从表 ${req.params.tableName} 删除数据失败:`, error);
    res.status(500).json({
      success: false,
      message: `从表 ${req.params.tableName} 删除数据失败`,
      error: error.message
    });
  }
}; 