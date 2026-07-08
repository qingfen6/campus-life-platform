/**
 * 性能优化工具
 * 
 * 功能：
 * - 防抖函数
 * - 节流函数
 * - 图片懒加载
 * - 虚拟列表
 */

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 图片懒加载
export const lazyLoadImage = (imageElement) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  imageObserver.observe(imageElement);
};

// 虚拟列表
export class VirtualList {
  constructor(options) {
    this.options = {
      itemHeight: 50,
      containerHeight: 400,
      buffer: 5,
      ...options
    };
    this.state = {
      startIndex: 0,
      endIndex: 0,
      scrollTop: 0
    };
  }

  // 计算可见区域的索引
  calculateVisibleRange(scrollTop) {
    const { itemHeight, containerHeight, buffer } = this.options;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * buffer;
    const endIndex = Math.min(
      this.options.items.length,
      startIndex + visibleCount
    );
    return { startIndex, endIndex };
  }

  // 更新状态
  update(scrollTop) {
    const { startIndex, endIndex } = this.calculateVisibleRange(scrollTop);
    this.state = {
      startIndex,
      endIndex,
      scrollTop
    };
  }

  // 获取可见项
  getVisibleItems() {
    const { startIndex, endIndex } = this.state;
    return this.options.items.slice(startIndex, endIndex);
  }

  // 获取总高度
  getTotalHeight() {
    return this.options.items.length * this.options.itemHeight;
  }

  // 获取偏移量
  getOffset() {
    return this.state.startIndex * this.options.itemHeight;
  }
}

// 性能监控
export const performanceMonitor = {
  // 开始计时
  start(label) {
    this.timers = this.timers || {};
    this.timers[label] = performance.now();
  },

  // 结束计时
  end(label) {
    if (!this.timers || !this.timers[label]) {
      console.warn(`No timer found for label: ${label}`);
      return;
    }

    const duration = performance.now() - this.timers[label];
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    delete this.timers[label];
  },

  // 测量函数执行时间
  measure(label, fn) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
};

// 缓存工具
export const cache = {
  // 内存缓存
  memory: new Map(),

  // 设置缓存
  set(key, value, ttl = 0) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    this.memory.set(key, item);
  },

  // 获取缓存
  get(key) {
    const item = this.memory.get(key);
    if (!item) return null;

    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.memory.delete(key);
      return null;
    }

    return item.value;
  },

  // 清除缓存
  clear(key) {
    if (key) {
      this.memory.delete(key);
    } else {
      this.memory.clear();
    }
  }
}; 