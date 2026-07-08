/**
 * 文件上传中间件
 * 
 * 处理文件上传的通用逻辑
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 确保上传目录存在
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`目录创建成功: ${dirPath}`);
    } catch (err) {
      console.error(`创建目录失败: ${dirPath}`, err);
      throw new Error(`无法创建上传目录: ${err.message}`);
    }
  }
};

// 创建主上传目录
const uploadBaseDir = path.join(__dirname, '../../public/uploads');
ensureDir(uploadBaseDir);

// 配置产品图片存储
const productImagesDir = path.join(uploadBaseDir, 'products');
ensureDir(productImagesDir);

// 配置动态媒体存储目录
const postMediaDir = path.join(uploadBaseDir, 'posts');
ensureDir(postMediaDir);

// 产品图片存储配置
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 为每个产品创建子目录 (可选)
    const productDir = path.join(productImagesDir, new Date().toISOString().slice(0, 10));
    ensureDir(productDir);
    cb(null, productDir);
  },
  filename: (req, file, cb) => {
    // 使用UUID生成唯一文件名，防止冲突
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    cb(null, fileName);
  }
});

// 动态媒体存储配置
const postMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 为每日动态创建子目录
    const postDir = path.join(postMediaDir, new Date().toISOString().slice(0, 10));
    ensureDir(postDir);
    cb(null, postDir);
  },
  filename: (req, file, cb) => {
    // 使用UUID生成唯一文件名
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    cb(null, fileName);
  }
});

// 通用文件过滤器
const imageFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件!'), false);
  }
};

// 媒体文件过滤器（接受图片和视频）
const mediaFilter = (req, file, cb) => {
  // 接受图片和视频
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片或视频文件!'), false);
  }
};

// 配置上传限制
const uploadLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 5 // 最多5个文件
};

// 动态媒体上传限制
const postMediaLimits = {
  fileSize: 10 * 1024 * 1024, // 10MB（视频文件较大）
  files: 9 // 最多9张图片/视频
};

// 导出产品图片上传配置
const uploadProductImages = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: uploadLimits
});

// 导出动态媒体上传配置
const uploadPostMedia = multer({
  storage: postMediaStorage,
  fileFilter: mediaFilter,
  limits: postMediaLimits
});

// 错误处理中间件
const handleMulterError = (err, req, res, next) => {
  console.log('处理Multer错误', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制(5MB/10MB)',
        error: err.message
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: '文件数量超过限制',
        error: err.message
      });
    }
    return res.status(400).json({
      success: false,
      message: '文件上传失败',
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: '文件上传过程中出错',
      error: err.message
    });
  }
  next();
};

module.exports = {
  uploadProductImages,
  uploadPostMedia,
  handleMulterError
}; 