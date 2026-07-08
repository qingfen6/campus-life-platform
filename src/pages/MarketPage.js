/**
 * 校园集市页面组件
 * 
 * 功能：
 * - 展示二手商品列表
 * - 提供多维度筛选（分类、价格区间、条件等）
 * - 支持排序和搜索
 * - 包含砍价功能
 * - 商品收藏和咨询
 */
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Input, Select, Button, Pagination, Card, Tabs, message } from 'antd';
import { 
  ShopOutlined, 
  FilterOutlined, 
  SortAscendingOutlined, 
  AppstoreOutlined, 
  UnorderedListOutlined,
  PercentageOutlined,
  StarOutlined,
  TagsOutlined,
  DollarOutlined,
  ScissorOutlined,
  ShoppingOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  TagOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import FloatingButton from '../components/common/FloatingButton';
import BargainModal from '../components/market/BargainModal';
import ProductCard from '../components/market/ProductCard';
import { marketApi } from '../utils/api';
import '../assets/styles/MarketPage.css';
import { useDispatch } from 'react-redux';
import { showAddProductModal } from '../store/slices/uiSlice';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 商品状态选项
const CONDITIONS = [
  {value: 'all', label: '全部'},
  {value: 'new', label: '全新'},
  {value: 'like_new', label: '几乎全新'},
  {value: 'good', label: '使用过'},
  {value: 'fair', label: '较旧'},
  {value: 'poor', label: '旧'}
];

// 排序选项
const SORT_OPTIONS = [
  {value: 'newest', label: '最新发布'},
  {value: 'price-asc', label: '价格从低到高'},
  {value: 'price-desc', label: '价格从高到低'},
  {value: 'discount', label: '优惠幅度'},
  {value: 'popular', label: '收藏最多'}
];

/**
 * 校园集市页面组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 校园集市页面
 */
const MarketPage = ({ darkMode, toggleDarkMode }) => {
  const dispatch = useDispatch();
  // 状态定义
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('全部商品');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [condition, setCondition] = useState('all');
  const [sortOption, setSortOption] = useState('created_at-desc');
  const [collapsed, setCollapsed] = useState(false);
  const [bargainModalVisible, setBargainModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState([]);
  
  // 获取商品分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await marketApi.getCategories();
        
        if (response.success) {
          setCategories(response.data);
        } else {
          message.error('获取商品分类失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取商品分类出错:', error);
        message.error('获取商品分类出错: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 获取商品列表
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 构建查询参数
        const params = {
          page: currentPage,
          limit: pageSize,
          category: activeTab !== 'all' ? activeTab : undefined,
          condition: condition !== 'all' ? condition : undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          search: searchText,
          sort: sortOption
        };
        
        const response = await marketApi.getProducts(params);
        
        if (response.success) {
          setProducts(response.data.products);
          setTotalProducts(response.data.pagination.total);
        } else {
          message.error('获取商品列表失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取商品列表出错:', error);
        message.error('获取商品列表出错: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, pageSize, activeTab, condition, priceRange, searchText, sortOption]);
  
  /**
   * 切换商品分类
   * @param {string} tab - 分类值
   */
  const filterProductsByTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  
  /**
   * 处理分页切换
   * @param {number} page - 页码
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 回到顶部
    document.querySelector('.app-content').scrollTop = 0;
  };
  
  /**
   * 初始化砍价
   * @param {Object} product - 商品对象
   */
  const handleBargain = (product) => {
    setCurrentProduct(product);
    setBargainModalVisible(true);
  };
  
  /**
   * 提交砍价
   * @param {number} price - 砍价金额
   * @param {string} message - 砍价留言
   */
  const handleBargainSubmit = async (price, message) => {
    try {
      setLoading(true);
      
      const response = await marketApi.bargainProduct(
        currentProduct.id, 
        price, 
        message
      );
      
      if (response.success) {
        message.success('砍价请求已发送，等待卖家回复');
        setBargainModalVisible(false);
      } else {
        message.error('砍价失败: ' + response.message);
      }
    } catch (error) {
      console.error('砍价出错:', error);
      message.error('砍价出错: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 处理商品喜欢
   * @param {number} productId - 商品ID
   */
  const handleLikeProduct = async (productId) => {
    try {
      if (likedProducts.includes(productId)) {
        // 取消喜欢
        const newLikedProducts = likedProducts.filter(id => id !== productId);
        setLikedProducts(newLikedProducts);
        
        // 这里添加API调用以更新后端状态
        await marketApi.unlikeProduct(productId);
      } else {
        // 添加喜欢
        setLikedProducts([...likedProducts, productId]);
        
        // 这里添加API调用以更新后端状态
        await marketApi.likeProduct(productId);
      }
      
      // 刷新商品列表以获取更新的喜欢计数
      const params = {
        page: currentPage,
        limit: pageSize,
        category: activeTab !== 'all' ? activeTab : undefined
      };
      
      const response = await marketApi.getProducts(params);
      
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('处理喜欢操作出错:', error);
      message.error('处理喜欢操作失败: ' + error.message);
    }
  };
  
  // 商品分类标签组件
  const productTabs = categories.length > 0 && (
    <Tabs 
      activeKey={activeTab} 
      onChange={filterProductsByTab}
      className="product-tab-bar"
    >
      {categories.map(category => (
        <TabPane 
          tab={
            <span>
              {category.value === 'all' && <ShoppingOutlined />}
              {category.label}
              {category.count > 0 && <span className="category-count">({category.count})</span>}
            </span>
          } 
          key={category.value} 
        />
      ))}
    </Tabs>
  );
  
  return (
    <Layout className="app-layout">
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Content className="market-content">
          {/* 页面标题 */}
          <div className="market-header">
            <div className="market-title-section">
              <Title level={2} className="with-icon">
                <ShoppingOutlined className="title-icon" /> 校园集市
              </Title>
              <p className="market-subtitle">
                闲置换钱，循环利用，让物品找到新主人！
              </p>
            </div>
            
            <div className="market-promotion">
              <Card className="promo-card">
                <div className="promo-content">
                  <div className="promo-text">
                    <h3>春季大促</h3>
                    <p>发布闲置，赢取积分奖励！</p>
                    <Button 
                      type="primary" 
                      className="promo-button"
                      onClick={() => dispatch(showAddProductModal())}
                    >
                      发布商品
                    </Button>
                  </div>
                  <div className="promo-image">
                    <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=60" alt="春季促销" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* 搜索栏 */}
          <div className="market-search">
            <Search
              placeholder="搜索商品..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => setCurrentPage(1)}
              className="search-input"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => dispatch(showAddProductModal())}
              className="add-product-btn"
            >
              发布商品
            </Button>
          </div>
          
          {/* 分类标签 */}
          <div className="market-tabs">
            {productTabs}
          </div>
          
          {/* 过滤和排序组件 */}
          <div className="market-filter-container">
            <div className="market-filter">
              <span className="filter-label"><FilterOutlined /> 成色:</span>
              <Select 
                defaultValue="all" 
                style={{ width: 120 }}
                className="filter-select"
                value={condition}
                onChange={(value) => {
                  setCondition(value);
                  setCurrentPage(1);
                }}
              >
                <Option value="all">全部</Option>
                <Option value="new">全新</Option>
                <Option value="like_new">几乎全新</Option>
                <Option value="good">状态良好</Option>
                <Option value="used">使用过</Option>
              </Select>
              
              <span className="filter-label ml-2"><FilterOutlined /> 排序:</span>
              <Select 
                defaultValue="created_at-desc" 
                style={{ width: 150 }}
                className="filter-select"
                value={sortOption}
                onChange={(value) => {
                  setSortOption(value);
                  setCurrentPage(1);
                }}
              >
                <Option value="created_at-desc">最新发布</Option>
                <Option value="price-asc">价格从低到高</Option>
                <Option value="price-desc">价格从高到低</Option>
                <Option value="likes-desc">最多喜欢</Option>
              </Select>
            </div>
          </div>
          
          {/* 商品列表 */}
          <div className="market-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>加载商品中...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-products">
                <div className="empty-image">
                  <img src="/images/empty-product.svg" alt="暂无商品" />
                </div>
                <p>暂无符合条件的商品</p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => dispatch(showAddProductModal())}
                >
                  发布一个商品
                </Button>
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {products.map(product => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <ProductCard 
                        product={product}
                        isLiked={likedProducts.includes(product.id)}
                        onLike={() => handleLikeProduct(product.id)}
                        onBargain={() => handleBargain(product)}
                      />
                    </Col>
                  ))}
                </Row>
                
                {totalProducts > pageSize && (
                  <div className="pagination-container">
                    <Pagination 
                      current={currentPage}
                      pageSize={pageSize}
                      total={totalProducts}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* 砍价模态框 */}
          <BargainModal
            visible={bargainModalVisible}
            onClose={() => setBargainModalVisible(false)}
            onSubmit={handleBargainSubmit}
            product={currentProduct}
            loading={loading}
          />
          
          <FloatingButton />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MarketPage; 