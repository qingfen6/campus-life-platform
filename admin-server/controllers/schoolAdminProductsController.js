const db = require('../config/db');
const { Op } = require('sequelize'); // 用于复杂查询

// 获取本校商品列表 (分页、搜索、筛选)
exports.getSchoolProducts = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权访问此学校的商品信息' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { search, status, category, condition_type, is_sold } = req.query;
    const sortBy = req.query.sortBy || 'created_at'; // 默认按创建时间排序
    const order = req.query.order || 'DESC'; // 默认降序

    let productWhereClause = {};
    let userWhereClause = { school_id: schoolId }; // 过滤条件放在关联的用户表上

    if (search) {
      productWhereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      productWhereClause.status = status;
    }

    if (category) {
      productWhereClause.category = category;
    }

    if (condition_type) {
      productWhereClause.condition_type = condition_type;
    }

    // 注意：is_sold 是布尔值，从 query 获取的是字符串，需要转换
    if (is_sold !== undefined) {
        productWhereClause.is_sold = is_sold === 'true';
    }

    const queryOptions = {
        where: productWhereClause,
        limit: pageSize,
        offset: offset,
        order: [[sortBy, order]], // 应用排序
        include: [{
            model: db.User, // 关联 User 模型
            as: 'seller', // 使用在 Product 模型中定义的别名
            attributes: ['user_id', 'username', 'real_name', 'student_id'], // 选择卖方的部分信息
            where: userWhereClause, // 在关联的 User 模型上应用学校过滤
            required: true // 使用 INNER JOIN，只返回本校用户发布的商品
        }],
        // 可以选择 Product 表需要的字段
        // attributes: [
        //     'product_id', 'title', 'price', 'category', 'condition_type',
        //     'location', 'is_negotiable', 'is_sold', 'status', 'created_at',
        //     'updated_at', 'expired_at'
        // ],
        nest: true, // 嵌套关联数据
    };

    // 假设 db.Product 和 db.User 存在且关联已定义
    const { count, rows } = await db.Product.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: {
        products: rows,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / pageSize),
        pageSize: pageSize,
      },
    });
  } catch (error) {
    console.error('获取学校商品列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// 更新商品状态
exports.updateProductStatus = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId; // 从认证中间件获取 schoolId
    const { productId } = req.params;
    const { status } = req.body; // 期望 status 为 products 表中的有效状态值

    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权执行此操作' });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: '缺少商品ID' });
    }

    // 验证 status 是否为 products 表 status 字段允许的值
    const validStatuses = ['active', 'reserved', 'sold', 'expired', 'deleted'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `无效的状态值。只允许 ${validStatuses.join(', ')}。` });
    }

    // 查找商品，并验证其是否属于当前学校管理员的学校
    const product = await db.Product.findOne({
      where: {
        product_id: productId,
      },
      include: [{
          model: db.User,
          as: 'seller',
          where: { school_id: schoolId },
          required: true
      }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: '未找到指定商品或无权修改该商品' });
    }

    // 更新商品状态
    product.status = status;
    // 如果状态更新为 sold，可以将 is_sold 也设为 true
    if (status === 'sold') {
        product.is_sold = true;
    }
     // 如果状态不是 sold，但 is_sold 是 true，可能需要根据业务逻辑重置 is_sold
    // else if (status !== 'sold' && product.is_sold) {
    //     product.is_sold = false;
    // }
    
    await product.save();

    res.json({ success: true, message: '商品状态更新成功', data: { productId: product.product_id, newStatus: product.status } });

  } catch (error) {
    console.error('更新商品状态失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// TODO: 实现其他商品管理功能，如获取商品详情、编辑商品、删除商品等 