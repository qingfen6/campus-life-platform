/**
 * 错误处理中间件
 * 
 * 统一处理API请求中的错误响应
 */

/**
 * 处理404错误的中间件
 * 当请求的路由不存在时调用
 */
const notFound = (req, res, next) => {
  const error = new Error(`未找到 - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * 通用错误处理中间件
 * 处理应用中抛出的所有错误，返回统一的JSON错误响应
 */
const errorHandler = (err, req, res, next) => {
  // 如果状态码仍为200，则将其设置为500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // 设置响应状态码
  res.status(statusCode);
  
  // 返回JSON格式的错误信息
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    timestamp: new Date().toISOString()
  });
};

module.exports = { notFound, errorHandler }; 