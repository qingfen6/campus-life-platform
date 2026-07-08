// 高德地图配置
export const AMAP_CONFIG = {
  key: '9a42d838624873a2e95253b5fba324ff',
  version: '2.0',
  plugins: ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.AutoComplete']
};

// 其他配置项可以在这里添加
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'; 