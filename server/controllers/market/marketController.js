/**
 * 集市控制器
 * 
 * 负责处理与集市相关的API请求
 */
const asyncHandler = require('express-async-handler');
const { pool } = require('../../config/db');

/**
 * @desc    获取商品列表
 * @route   GET /api/market/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  try {
    // 解析查询参数
    const { 
      category, 
      condition, 
      price_min, 
      price_max,
      sort,
      page = 1,
      limit = 10,
      bargain_only,
      search
    } = req.query;
    
    // 构建查询条件
    let conditions = ['p.status = "active"'];
    let params = [];
    
    if (category && category !== '全部商品' && category !== 'undefined') {
      conditions.push('p.category = ?');
      params.push(category);
    }
    
    if (condition && condition !== 'all' && condition !== 'undefined') {
      conditions.push('p.condition_type = ?');
      params.push(condition);
    }
    
    if (price_min && price_min !== 'undefined') {
      conditions.push('p.price >= ?');
      params.push(parseFloat(price_min));
    }
    
    if (price_max && price_max !== 'undefined') {
      conditions.push('p.price <= ?');
      params.push(parseFloat(price_max));
    }
    
    if (bargain_only === 'true') {
      conditions.push('p.is_negotiable = 1');
    }
    
    if (search && search !== 'undefined') {
      conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // 构建排序条件
    let orderBy;
    switch (sort) {
      case 'price-asc':
        orderBy = 'p.price ASC';
        break;
      case 'price-desc':
        orderBy = 'p.price DESC';
        break;
      case 'discount':
        orderBy = '((p.original_price - p.price) / p.original_price) DESC';
        break;
      case 'created_at-desc':
        orderBy = 'p.created_at DESC';
        break;
      case 'created_at-asc':
        orderBy = 'p.created_at ASC';
        break;
      default:
        orderBy = 'p.created_at DESC';
    }
    
    console.log('商品查询条件:', conditions, params);
    console.log('商品排序方式:', orderBy);
    
    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 执行查询
    let query = `
      SELECT 
        p.product_id, p.title, p.description, p.price, p.original_price, 
        p.category, p.condition_type, p.location, p.is_negotiable, 
        p.view_count, p.created_at, p.status,
        u.user_id, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM product_images WHERE product_id = p.product_id) AS image_count
      FROM 
        products p
      JOIN 
        users u ON p.user_id = u.user_id
      WHERE 
        ${conditions.join(' AND ')}
      ORDER BY 
        ${orderBy}
      LIMIT ? OFFSET ?
    `;
    
    const [products] = await pool.query(query, [...params, parseInt(limit), offset]);
    
    // 获取商品图片
    const productIds = products.map(product => product.product_id);
    let productImages = [];
    
    if (productIds.length > 0) {
      const [images] = await pool.query(
        `SELECT product_id, image_url FROM product_images 
         WHERE product_id IN (?) ORDER BY display_order ASC`,
        [productIds]
      );
      productImages = images;
    }
    
    // 获取总商品数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products p WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = countResult[0].total;
    
    // 构建响应数据
    const formattedProducts = products.map(product => {
      const images = productImages.filter(img => img.product_id === product.product_id)
                                .map(img => img.image_url);
      
      return {
        id: product.product_id,
        title: product.title,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        description: product.description,
        category: product.category,
        condition: product.condition_type,
        location: product.location,
        bargain: product.is_negotiable === 1,
        viewCount: product.view_count,
        time: product.created_at,
        status: product.status,
        imageUrl: images[0] || null,
        images: images,
        seller: {
          id: product.user_id,
          name: product.username,
          avatar: product.avatar_url
        }
      };
    });
    
    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
});

/**
 * @desc    获取商品详情
 * @route   GET /api/market/products/:id
 * @access  Public
 */
const getProductDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '无效的商品ID'
      });
    }
    
    console.log(`获取商品详情，ID: ${id}`);
    
    // 增加浏览次数
    await pool.query(
      `UPDATE products SET view_count = view_count + 1 WHERE product_id = ?`,
      [id]
    );
    
    // 查询商品详情
    const [products] = await pool.query(
      `SELECT 
        p.product_id, p.title, p.description, p.price, p.original_price, 
        p.category, p.condition_type, p.location, p.is_negotiable, 
        p.view_count, p.created_at, p.status,
        u.user_id, u.username, u.avatar_url
      FROM 
        products p
      JOIN 
        users u ON p.user_id = u.user_id
      WHERE 
        p.product_id = ?`,
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    const product = products[0];
    
    // 获取商品图片
    const [images] = await pool.query(
      `SELECT image_url FROM product_images 
       WHERE product_id = ? ORDER BY display_order ASC`,
      [id]
    );
    
    const imageUrls = images.map(img => img.image_url);
    
    // 构建响应数据
    const formattedProduct = {
      id: product.product_id,
      title: product.title,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : null,
      description: product.description,
      category: product.category,
      condition: product.condition_type,
      location: product.location,
      bargain: product.is_negotiable === 1,
      viewCount: product.view_count,
      time: product.created_at,
      status: product.status,
      images: imageUrls,
      seller: {
        id: product.user_id,
        name: product.username,
        avatar: product.avatar_url
      }
    };
    
    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
});

/**
 * @desc    获取商品分类
 * @route   GET /api/market/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  try {
    console.log('获取商品分类...');
    let formattedCategories = [];
    let totalCount = 0;

    // 1. 查询有效的商品分类及其计数 (排除 NULL 或空字符串, 以及 '全部商品' 本身)
    try {
      const [categories] = await pool.query(
        `SELECT category, COUNT(*) as count
         FROM products
         WHERE status = 'active' AND category IS NOT NULL AND category <> '' AND category <> '全部商品'
         GROUP BY category
         ORDER BY count DESC`
      );

      if (categories && categories.length > 0) {
        formattedCategories = categories.map(cat => ({
          value: cat.category,
          label: cat.category,
          count: cat.count
        }));
        console.log(`找到 ${formattedCategories.length} 个有效商品分类 (已排除 '全部商品' 若存在)`);
      } else {
         console.log('数据库中未找到明确分类的商品');
      }
    } catch (dbError) {
      console.warn('数据库查询商品分类出错:', dbError.message);
       // 继续执行，即使分类查询失败，仍需返回总数和 "全部商品"
    }

    // 2. 查询总活跃商品数
     try {
        const [totalResult] = await pool.query(
            "SELECT COUNT(*) as total FROM products WHERE status = 'active'"
        );
        if (totalResult && totalResult.length > 0) {
            totalCount = totalResult[0].total;
            console.log(`数据库查询总活跃商品数: ${totalCount}`);
        } else {
             console.warn('未能查询到总商品数');
        }
    } catch(countError) {
         console.error('查询总商品数失败:', countError.message);
         totalCount = 0; // Fallback to 0 if query fails
    }

    // 3. 如果没有找到分类数据，可以选择是否添加默认分类 (当前不添加)
    // if (formattedCategories.length === 0 && totalCount > 0) {
    //   console.log('未找到具体分类，但存在商品，可以考虑补充默认分类');
    // }

    // 4. 添加 "全部商品" 选项到最前面
    formattedCategories.unshift({
      value: '全部商品', // 使用 "全部商品"
      label: '全部商品', // 使用 "全部商品"
      count: totalCount  // 使用独立查询的总数
    });

    console.log('返回商品分类数据:', formattedCategories);
    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    // 捕获总数查询或其他意外错误
    console.error('获取商品分类失败 (顶层错误):', error);
    res.status(500).json({
      success: false,
      message: '获取商品分类失败',
      error: error.message
    });
  }
});

/**
 * @desc    发布商品
 * @route   POST /api/market/products
 * @access  Private
 */
const addProduct = asyncHandler(async (req, res) => {
  try {
    console.log('接收到发布商品请求:');
    console.log('请求体:', req.body);
    console.log('文件数量:', req.files ? req.files.length : 0);
    
    const { 
      title, 
      description, 
      price, 
      originalPrice, 
      category, 
      condition, 
      location, 
      negotiable, 
      tags
    } = req.body;
    
    const userId = req.user.id;
    
    // 验证必填字段
    const missingFields = [];
    if (!title) missingFields.push('标题(title)');
    if (!price) missingFields.push('价格(price)');
    if (!category) missingFields.push('分类(category)');
    if (!condition) missingFields.push('商品成色(condition)');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `请提供必要信息: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    // 检查是否有图片上传
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请上传至少一张商品图片'
      });
    }
    
    console.log('发布商品:', title, category, condition);
    console.log(`收到 ${req.files.length} 张图片`);
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 插入商品记录
      const [result] = await connection.query(
        `INSERT INTO products (
          user_id, title, description, price, original_price, 
          category, condition_type, location, is_negotiable, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          userId, title, description, price, originalPrice || null, 
          category, condition, location || null, negotiable === 'true' || negotiable === true ? 1 : 0
        ]
      );
      
      const productId = result.insertId;
      console.log(`创建商品成功, ID: ${productId}`);
      
      // 处理上传的图片文件
      if (req.files && req.files.length > 0) {
        console.log("上传的文件信息:");
        req.files.forEach((file, idx) => {
          console.log(`文件 ${idx+1}:`, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            destination: file.destination,
            filename: file.filename,
            path: file.path,
            size: file.size
          });
        });

        const imageValues = req.files.map((file, index) => {
          // 获取相对于public目录的路径
          // Windows路径兼容处理
          let relativePath = file.path.replace(/\\/g, '/');
          const publicIndex = relativePath.indexOf('/public/');
          if (publicIndex >= 0) {
            relativePath = relativePath.substring(publicIndex + 7); // 7 是 '/public' 的长度
          } else {
            // 直接尝试获取 uploads 及之后的部分
            const uploadsIndex = relativePath.indexOf('/uploads/');
            if (uploadsIndex >= 0) {
              relativePath = relativePath.substring(uploadsIndex);
            }
          }
          console.log(`处理图片 ${index+1}/${req.files.length}:`);
          console.log(`  原始路径: ${file.path}`);
          console.log(`  处理后路径: ${relativePath}`);
          return [productId, relativePath, index];
        });
        
        // 将图片数据插入数据库
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, display_order) VALUES ?`,
          [imageValues]
        );
        
        console.log(`保存 ${imageValues.length} 张图片到数据库成功`);
      }
      
      // 处理商品标签
      if (tags) {
        try {
          const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
          if (parsedTags.length > 0) {
            const tagValues = parsedTags.map(tag => [productId, tag]);
            
            await connection.query(
              `INSERT INTO product_tags (product_id, tag_name) VALUES ?`,
              [tagValues]
            );
            
            console.log(`保存 ${parsedTags.length} 个标签到数据库成功`);
          }
        } catch (tagError) {
          console.error('解析标签失败:', tagError);
          // 继续处理，不因标签解析失败而回滚整个事务
        }
      }
      
      // 提交事务
      await connection.commit();
      
      res.status(201).json({
        success: true,
        data: {
          id: productId,
          message: '商品发布成功',
          imagesCount: req.files.length
        }
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('发布商品失败:', error);
    res.status(500).json({
      success: false,
      message: '发布商品失败',
      error: error.message
    });
  }
});

/**
 * @desc    砍价/议价
 * @route   POST /api/market/bargain
 * @access  Private
 */
const bargainProduct = asyncHandler(async (req, res) => {
  try {
    const { productId, price } = req.body;
    const userId = req.user.id;
    
    if (!productId || !price) {
      return res.status(400).json({
        success: false,
        message: '请提供必要信息'
      });
    }
    
    console.log(`用户${userId}对商品${productId}进行议价: ${price}`);
    
    // 检查商品是否存在且可议价
    const [products] = await pool.query(
      `SELECT price, is_negotiable, user_id FROM products WHERE product_id = ? AND status = 'active'`,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在或已下架'
      });
    }
    
    const product = products[0];
    
    if (product.is_negotiable !== 1) {
      return res.status(400).json({
        success: false,
        message: '该商品不支持议价'
      });
    }
    
    if (product.user_id === userId) {
      return res.status(400).json({
        success: false,
        message: '不能对自己的商品进行议价'
      });
    }
    
    // 价格检查
    if (parseFloat(price) >= parseFloat(product.price)) {
      return res.status(400).json({
        success: false,
        message: '议价必须低于原价'
      });
    }
    
    // TODO: 实际项目中，这里应该保存议价记录到数据库
    
    res.json({
      success: true,
      data: {
        message: '议价请求已发送',
        originalPrice: parseFloat(product.price),
        bargainPrice: parseFloat(price)
      }
    });
  } catch (error) {
    console.error('议价失败:', error);
    res.status(500).json({
      success: false,
      message: '议价失败',
      error: error.message
    });
  }
});

// ... (其他控制器函数，例如 addProduct, bargainProduct 等) ...

/**
 * @desc    获取当前用户发布的商品列表
 * @route   GET /api/market/my/products
 * @access  Private
 */
const getMyProducts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  // 从 req.user 中获取 username 和 avatar，如果 protect 中间件已正确填充
  const { username: currentUsername, avatar: currentUserAvatar } = req.user; 
  const { page = 1, limit = 10, status } = req.query; // 接收 status 查询参数
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let queryConditions = 'p.user_id = ?';
  let queryParams = [userId];

  // 如果提供了 status 参数，并且不是 'all' 或空，则添加到查询条件
  if (status && status !== 'all' && status !== 'undefined' && status.trim() !== '') {
    queryConditions += ' AND p.status = ?';
    queryParams.push(status);
  }

  try {
    // 查询用户发布的商品，并获取第一张图片作为 imageUrl
    const [products] = await pool.query(
      `SELECT 
        p.product_id, p.title, p.description, p.price, p.original_price, 
        p.category, p.condition_type, p.location, p.is_negotiable, 
        p.view_count, p.created_at, p.status,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id ORDER BY display_order ASC LIMIT 1) as imageUrl
      FROM products p
      WHERE ${queryConditions}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    // 查询符合条件的总商品数，用于分页
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products p WHERE ${queryConditions}`,
      queryParams
    );
    const total = countResult[0].total;
    
    // 格式化商品数据以匹配前端 ProductCard 的期望结构
    const formattedProducts = products.map(product => ({
      id: product.product_id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : null,
      category: product.category,
      condition: product.condition_type, // ProductCard 可能使用 'condition'
      location: product.location,
      bargain: product.is_negotiable === 1, // ProductCard 使用 'bargain'
      viewCount: product.view_count,
      time: product.created_at, // ProductCard 使用 'time'
      status: product.status,
      imageUrl: product.imageUrl || null,
      seller: { // ProductCard 需要 seller 对象
          id: userId, 
          name: currentUsername, 
          avatar: currentUserAvatar 
      }
    }));

    // ProfilePage.js 的 setTabData 期望 response.data 直接是数组
    res.json({
      success: true,
      data: formattedProducts, 
      pagination: { // pagination 信息也一并返回
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取我的商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取我的商品列表失败',
      error: error.message
    });
  }
});



module.exports = {
  getProducts,
  getProductDetail,
  getCategories,
  addProduct,
  bargainProduct,
  getMyProducts 
}; 