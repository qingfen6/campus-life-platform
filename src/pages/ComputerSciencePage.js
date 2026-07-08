/**
 * 计算机学院页面组件
 * 
 * 功能：
 * - 展示计算机学院基本信息
 * - 专业设置与课程介绍
 * - 师资力量展示
 * - 科研成果与项目
 * - 学院新闻与公告
 * - 招聘信息
 * - 实验室资源
 * - 学生活动
 * 
 * 特点：
 * - 组件化设计，便于复用
 * - 每个组件可独立编辑
 * - 可配置组件顺序
 */
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Card, Tabs, Button, Divider, message, Space, Collapse } from 'antd';
import { 
  LaptopOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  NotificationOutlined,
  ExperimentOutlined,
  UserOutlined,
  BulbOutlined,
  BookOutlined,
  EditOutlined,
  SaveOutlined,
  UndoOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import Header from '../components/common/Header';
import SchoolSidebar from '../components/common/SchoolSidebar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../assets/styles/ComputerSciencePage.css';

// 导入学院页面组件
import FacultyInfoComponent from '../components/faculty/FacultyInfoComponent';
import MajorSettingsComponent from '../components/faculty/MajorSettingsComponent';
import FacultyStaffComponent from '../components/faculty/FacultyStaffComponent';
import ResearchComponent from '../components/faculty/ResearchComponent';
import FacultyNewsComponent from '../components/faculty/FacultyNewsComponent';
import RecruitmentComponent from '../components/faculty/RecruitmentComponent';
import LabResourceComponent from '../components/faculty/LabResourceComponent';
import StudentActivityComponent from '../components/faculty/StudentActivityComponent';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

/**
 * 计算机学院页面组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 是否为深色模式
 * @param {Function} props.toggleDarkMode - 切换主题的回调函数
 * @returns {JSX.Element} 计算机学院页面
 */
const ComputerSciencePage = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [componentOrder, setComponentOrder] = useState([
    'faculty-info',
    'major-settings',
    'faculty-staff',
    'research',
    'news',
    'recruitment',
    'lab-resource',
    'student-activity'
  ]);
  
  // 模拟管理员权限检查
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 长按拖动相关状态
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  // 学院信息数据
  const facultyData = {
    name: "计算机学院",
    shortName: "计算机学院",
    englishName: "School of Computer Science",
    establishYear: "1978",
    intro: "计算机学院成立于1978年，是国内最早设立的计算机专业院系之一，在人工智能、数据科学、计算机系统等领域具有重要影响力。学院拥有优秀的师资团队，先进的教学设施，致力于培养具有创新精神和实践能力的高素质计算机人才。",
    mission: "培养具有扎实理论基础、突出工程能力、良好创新意识的计算机专业高级人才，推动计算机科学与技术的学术发展和产业应用。",
    vision: "建设国际一流计算机学科，引领信息技术前沿发展，成为计算机人才培养和科学研究的重要基地。",
    deanMessage: "计算机科学与技术正处于蓬勃发展的黄金时期，人工智能、大数据、区块链等技术正在深刻改变人类社会。我院秉承'厚基础、强能力、重创新'的教育理念，注重学生综合素质培养，欢迎各位有志之士加入我们的大家庭，共同探索计算机科学的奥秘，开创信息技术的未来。",
    contact: {
      address: "XX大学XX楼A区",
      phone: "010-12345678",
      email: "cs@university.edu.cn",
      website: "http://cs.university.edu.cn"
    }
  };

  // 处理长按开始
  const handleLongPressStart = (componentId) => {
    if (!isEditMode) return;
    
    const timer = setTimeout(() => {
      setIsLongPressing(true);
      // 触发拖拽开始
      const dragHandle = document.querySelector(`[data-rbd-draggable-id="${componentId}"] .drag-handle`);
      if (dragHandle) {
        dragHandle.click();
      }
    }, 500); // 500ms 长按阈值
    
    setLongPressTimer(timer);
  };
  
  // 处理长按结束
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      setIsLongPressing(false);
    }
  };
  
  // 处理触摸移动
  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      setIsLongPressing(false);
    }
  };
  
  // 切换编辑模式
  const toggleEditMode = () => {
    if (isAdmin) {
      setIsEditMode(!isEditMode);
      if (isEditMode) {
        message.success('已退出编辑模式');
      } else {
        message.success('已进入编辑模式，可以长按拖动组件调整顺序或编辑内容');
      }
    } else {
      message.warning('您没有编辑权限，请联系管理员');
    }
  };
  
  // 处理拖拽结束事件
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(componentOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setComponentOrder(items);
    message.success('组件顺序已更新');
    setIsLongPressing(false);
  };
  
  // 切换管理员模式（模拟用，实际项目中应有权限管理系统）
  const toggleAdminMode = () => {
    setIsAdmin(!isAdmin);
    message.info(`管理员模式已${!isAdmin ? '开启' : '关闭'}`);
    if (isEditMode && !isAdmin) {
      setIsEditMode(false);
    }
  };
  
  // 重置组件顺序
  const resetComponentOrder = () => {
    setComponentOrder([
      'faculty-info',
      'major-settings',
      'faculty-staff',
      'research',
      'news',
      'recruitment',
      'lab-resource',
      'student-activity'
    ]);
    message.success('组件顺序已重置');
  };
  
  // 渲染组件映射
  const componentMap = {
    'faculty-info': <FacultyInfoComponent data={facultyData} isEditMode={isEditMode} />,
    'major-settings': <MajorSettingsComponent isEditMode={isEditMode} />,
    'faculty-staff': <FacultyStaffComponent isEditMode={isEditMode} />,
    'research': <ResearchComponent isEditMode={isEditMode} />,
    'news': <FacultyNewsComponent isEditMode={isEditMode} />,
    'recruitment': <RecruitmentComponent isEditMode={isEditMode} />,
    'lab-resource': <LabResourceComponent isEditMode={isEditMode} />,
    'student-activity': <StudentActivityComponent isEditMode={isEditMode} />
  };
  
  // 组件标题映射
  const componentTitleMap = {
    'faculty-info': '学院基本信息',
    'major-settings': '专业设置',
    'faculty-staff': '师资力量',
    'research': '科研成果',
    'news': '学院新闻公告',
    'recruitment': '招聘信息',
    'lab-resource': '实验室资源',
    'student-activity': '学生活动'
  };
  
  // 组件图标映射
  const componentIconMap = {
    'faculty-info': <BookOutlined />,
    'major-settings': <LaptopOutlined />,
    'faculty-staff': <TeamOutlined />,
    'research': <TrophyOutlined />,
    'news': <NotificationOutlined />,
    'recruitment': <UserOutlined />,
    'lab-resource': <ExperimentOutlined />,
    'student-activity': <BulbOutlined />
  };

  return (
    <Layout className="app-layout">
      <SchoolSidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      <Layout className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Content className="faculty-content">
          {/* 页面顶部标题区域 */}
          <div className="faculty-header">
            <div className="faculty-title-container">
              <Title level={2} className="faculty-title">
                <LaptopOutlined className="faculty-icon" /> 计算机学院
              </Title>
              <Text type="secondary" className="faculty-subtitle">
                School of Computer Science
              </Text>
            </div>
            
            {/* 管理工具栏（仅在管理员模式下显示） */}
            <div className="faculty-admin-tools">
              <Space>
                {isAdmin && (
                  <>
                    <Button 
                      type={isEditMode ? "primary" : "default"}
                      icon={isEditMode ? <SaveOutlined /> : <EditOutlined />}
                      onClick={toggleEditMode}
                    >
                      {isEditMode ? '完成编辑' : '编辑页面'}
                    </Button>
                    {isEditMode && (
                      <Button 
                        icon={<UndoOutlined />}
                        onClick={resetComponentOrder}
                      >
                        重置顺序
                      </Button>
                    )}
                  </>
                )}
                {/* 管理员模式切换按钮（实际项目中应隐藏或替换为权限管理系统） */}
                <Button 
                  type="dashed"
                  onClick={toggleAdminMode}
                >
                  {isAdmin ? '退出管理' : '管理员登录'}
                </Button>
              </Space>
            </div>
          </div>
          
          {/* 编辑模式提示 */}
          {isEditMode && (
            <div className="edit-mode-tip">
              <Text>当前处于编辑模式，可以长按拖动组件调整顺序，点击各组件的编辑按钮修改内容</Text>
            </div>
          )}
          
          {/* 学院内容主体 */}
          <div className="faculty-body">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="faculty-components">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`faculty-components-container ${snapshot.isDraggingOver ? 'drag-active' : ''}`}
                  >
                    {componentOrder.map((componentKey, index) => (
                      <Draggable 
                        key={componentKey} 
                        draggableId={componentKey} 
                        index={index}
                        isDragDisabled={!isEditMode}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`faculty-component-container ${isEditMode ? 'editable' : ''} ${snapshot.isDragging ? 'dragging' : ''} ${isLongPressing ? 'long-press' : ''}`}
                            onTouchStart={() => handleLongPressStart(componentKey)}
                            onTouchEnd={handleLongPressEnd}
                            onTouchMove={handleTouchMove}
                          >
                            <Card
                              title={
                                <div className="component-header">
                                  {componentIconMap[componentKey]} {componentTitleMap[componentKey]}
                                  {isEditMode && (
                                    <div 
                                      className="drag-handle"
                                      {...provided.dragHandleProps}
                                      title="长按此处拖动排序"
                                    >
                                      <SortAscendingOutlined /> 拖动排序
                                    </div>
                                  )}
                                </div>
                              }
                              className="faculty-component-card"
                            >
                              {componentMap[componentKey]}
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ComputerSciencePage; 