/**
 * 悬浮按钮组件
 * 
 * 功能：
 * - 提供页面导航悬浮按钮
 * - 用于替代原有的回到顶部按钮
 */
import React, { useState } from 'react';
import { Button, Popover, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  RedoOutlined,
  EditOutlined,
  ShoppingOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { 
  showAddPostModal, 
  showAddProductModal, 
  showAddMissionModal 
} from '../../store/slices/uiSlice';
import '../../assets/styles/FloatingButton.css';

/**
 * 自定义悬浮按钮组件
 * @returns {JSX.Element} 浮动按钮组件
 */
const FloatingButton = () => {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();

  /**
   * 处理刷新页面
   */
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
  };

  const content = (
    <div className="fab-menu">
      <Tooltip title="发布动态" placement="left">
        <Button 
          shape="circle" 
          icon={<EditOutlined />} 
          className="fab-menu-item post-fab"
          onClick={() => { 
            dispatch(showAddPostModal());
            setVisible(false);
          }}
        />
      </Tooltip>
      <Tooltip title="发布商品" placement="left">
        <Button 
          shape="circle" 
          icon={<ShoppingOutlined />} 
          className="fab-menu-item product-fab"
          onClick={() => { 
            dispatch(showAddProductModal());
            setVisible(false);
          }}
        />
      </Tooltip>
      <Tooltip title="发布悬赏" placement="left">
        <Button 
          shape="circle" 
          icon={<TrophyOutlined />} 
          className="fab-menu-item mission-fab"
          onClick={() => { 
            dispatch(showAddMissionModal());
            setVisible(false);
          }}
        />
      </Tooltip>
      <Tooltip title="刷新" placement="left">
        <Button 
          shape="circle" 
          icon={<RedoOutlined />} 
          className="fab-menu-item refresh-fab"
          onClick={handleRefresh}
        />
      </Tooltip>
    </div>
  );

  return (
    <div className="floating-button-container">
      <Popover
        content={content}
        trigger="click"
        open={visible}
        onOpenChange={handleVisibleChange}
        placement="top"
        overlayClassName="fab-popover"
      >
        <Button 
          type="primary" 
          shape="circle" 
          icon={<PlusOutlined />} 
          className="floating-button"
        />
      </Popover>
    </div>
  );
};

export default FloatingButton;