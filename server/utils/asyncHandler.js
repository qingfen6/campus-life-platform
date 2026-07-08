/**
 * 异步处理器中间件
 * 用于处理异步路由处理函数中的错误
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} 包装后的异步函数
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler; 