import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 * @param {string|Date} date - 日期字符串或Date对象
 * @param {string} format - 格式化模式，'relative'为相对时间，其他为格式字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'relative') => {
  if (!date) return '';
  
  const dayjsDate = dayjs(date);
  
  if (format === 'relative') {
    return dayjsDate.fromNow();
  } else {
    return dayjsDate.format(format);
  }
};

/**
 * 格式化价格
 * @param {number|string} price - 价格数值
 * @param {string} currency - 货币符号
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (price, currency = '¥') => {
  if (price === null || price === undefined) return '';
  
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) return '';
  
  return `${currency} ${numPrice.toFixed(2)}`.replace(/\.00$/, '');
};

/**
 * 计算折扣百分比
 * @param {number} originalPrice - 原价
 * @param {number} currentPrice - 现价
 * @returns {number|null} 折扣百分比或null（如果无折扣）
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return null;
  }
  
  return Math.round((1 - currentPrice / originalPrice) * 100);
};

/**
 * 截断文本
 * @param {string} text - 文本内容
 * @param {number} length - 最大长度
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 文件扩展名
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  
  return filename.split('.').pop().toLowerCase();
};

/**
 * 检查是否为图片文件
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为图片
 */
export const isImageFile = (filename) => {
  const ext = getFileExtension(filename);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  
  return imageExtensions.includes(ext);
};

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
export const generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

 