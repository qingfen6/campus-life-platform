/**
 * 学院新闻公告组件
 * 
 * 功能：
 * - 展示学院新闻
 * - 展示学院公告
 * - 按类型和时间筛选
 * - 支持编辑模式下的内容修改
 */
import React, { useState } from 'react';
import { List, Typography, Card, Tag, Button, Tabs, Modal, Form, Input, message, Select, DatePicker, Radio, Badge } from 'antd';
import { EditOutlined, SaveOutlined, NotificationOutlined, CalendarOutlined, ReadOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import './faculty.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 模拟新闻公告数据
const INITIAL_NEWS = [
  {
    id: 1,
    title: '计算机学院举办2023年学术论坛',
    content: '我院于2023年6月10日至12日成功举办了"人工智能与未来计算"学术论坛，邀请了国内外多位知名学者进行学术报告，分享最新研究成果。论坛吸引了300余名师生参与，取得了良好的学术交流效果。',
    type: '新闻',
    importance: 'normal',
    date: '2023-06-15',
    publisher: '学院办公室',
    tags: ['学术', '论坛', '人工智能']
  },
  {
    id: 2,
    title: '关于2023年秋季学期课程安排的通知',
    content: '2023年秋季学期将于9月4日正式开始，现将本学期各专业课程安排及教室分配情况公布如下。请各位师生提前做好准备，按时参加教学活动。特此通知。',
    type: '公告',
    importance: 'important',
    date: '2023-08-20',
    publisher: '教务办公室',
    tags: ['教学', '课程', '通知']
  },
  {
    id: 3,
    title: '我院教师在国际顶级会议发表重要论文',
    content: '我院张教授研究团队近期在计算机视觉领域顶级会议CVPR 2023上发表了题为《Advanced Deep Learning for Computer Vision》的论文，该成果解决了计算机视觉中的关键问题，获得了国际同行的高度评价。',
    type: '新闻',
    importance: 'normal',
    date: '2023-07-05',
    publisher: '宣传部',
    tags: ['科研', '论文', '计算机视觉']
  },
  {
    id: 4,
    title: '计算机学院与腾讯公司签署校企合作协议',
    content: '我院于2023年5月18日与腾讯公司签署了校企合作协议，双方将在人才培养、科学研究、实习就业等方面开展深度合作，共建实验室、联合培养研究生，为学生提供更多实践机会。',
    type: '新闻',
    importance: 'normal',
    date: '2023-05-20',
    publisher: '学院办公室',
    tags: ['校企合作', '就业', '实践']
  },
  {
    id: 5,
    title: '关于评选2023年度优秀学生的通知',
    content: '为表彰先进，激励学生奋发向上，学院决定开展2023年度优秀学生评选工作。请各班级于9月30日前推荐候选人，并将相关材料提交至学院学工办。具体评选标准和流程见附件。',
    type: '公告',
    importance: 'important',
    date: '2023-09-10',
    publisher: '学生工作办公室',
    tags: ['评优', '学生工作', '通知']
  },
  {
    id: 6,
    title: '计算机学院成功举办毕业生招聘会',
    content: '我院于2023年10月15日成功举办了毕业生专场招聘会，吸引了包括华为、阿里巴巴、百度、字节跳动等在内的50余家知名企业参与。招聘会现场气氛热烈，为毕业生提供了约800个就业岗位。',
    type: '新闻',
    importance: 'normal',
    date: '2023-10-18',
    publisher: '就业指导中心',
    tags: ['就业', '招聘', '毕业生']
  },
  {
    id: 7,
    title: '紧急通知：关于调整期末考试时间的公告',
    content: '因学校统一安排，原定于2024年1月10日至14日的期末考试将调整为2024年1月8日至12日进行。请各位师生相应调整复习和监考安排，以免耽误考试。详细考试安排将另行通知。',
    type: '公告',
    importance: 'urgent',
    date: '2023-12-20',
    publisher: '教务办公室',
    tags: ['考试', '教学', '调整']
  },
];

/**
 * 学院新闻公告组件
 * @param {Object} props 组件属性
 * @param {boolean} props.isEditMode 是否处于编辑模式
 * @returns {JSX.Element} 学院新闻公告组件
 */
const FacultyNewsComponent = ({ isEditMode }) => {
  const [news, setNews] = useState(INITIAL_NEWS);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditNews, setCurrentEditNews] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  
  // 筛选新闻公告
  const getFilteredNews = () => {
    if (activeTab === 'all') {
      return news;
    }
    return news.filter(item => item.type === activeTab);
  };
  
  // 按时间排序（降序）
  const getSortedNews = () => {
    return getFilteredNews().sort((a, b) => {
      // 首先按照重要性排序
      const importanceOrder = { urgent: 0, important: 1, normal: 2 };
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      }
      // 其次按照日期排序
      return new Date(b.date) - new Date(a.date);
    });
  };
  
  // 打开编辑模态框
  const showEditModal = (newsItem) => {
    setCurrentEditNews(newsItem);
    form.resetFields();
    
    if (newsItem) {
      // 编辑现有新闻
      form.setFieldsValue({
        ...newsItem,
        date: moment(newsItem.date),
        tags: newsItem.tags
      });
    } else {
      // 默认值
      form.setFieldsValue({
        type: '新闻',
        importance: 'normal',
        date: moment(),
        publisher: '学院办公室'
      });
    }
    
    setEditModalVisible(true);
  };
  
  // 关闭编辑模态框
  const handleCancel = () => {
    setEditModalVisible(false);
  };
  
  // 保存编辑内容
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        let newNews = [...news];
        const formattedValues = {
          ...values,
          date: values.date.format('YYYY-MM-DD')
        };
        
        if (currentEditNews) {
          // 更新现有新闻
          const index = newNews.findIndex(n => n.id === currentEditNews.id);
          if (index > -1) {
            newNews[index] = { ...newNews[index], ...formattedValues };
            setNews(newNews);
            message.success('新闻公告已更新');
          }
        } else {
          // 添加新新闻
          const newId = Math.max(0, ...newNews.map(n => n.id)) + 1;
          newNews.push({ ...formattedValues, id: newId });
          setNews(newNews);
          message.success('新闻公告已添加');
        }
        
        setEditModalVisible(false);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };
  
  // 获取重要性标签
  const getImportanceTag = (importance) => {
    switch (importance) {
      case 'urgent':
        return <Tag color="red">紧急</Tag>;
      case 'important':
        return <Tag color="orange">重要</Tag>;
      default:
        return null;
    }
  };

  return (
    <div className="faculty-news-component">
      {/* 选项卡筛选 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="全部" key="all" />
        <TabPane tab="新闻" key="新闻" />
        <TabPane tab="公告" key="公告" />
      </Tabs>
      
      {/* 添加按钮（仅编辑模式可见） */}
      {isEditMode && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showEditModal(null)}
          >
            添加新闻公告
          </Button>
        </div>
      )}
      
      {/* 新闻公告列表 */}
      <List
        itemLayout="vertical"
        dataSource={getSortedNews()}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={isEditMode ? [
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => showEditModal(item)}
              >
                编辑
              </Button>
            ] : []}
          >
            <List.Item.Meta
              title={
                <div className="news-title">
                  {item.type === '公告' ? <NotificationOutlined style={{ color: '#faad14' }} /> : <ReadOutlined style={{ color: '#1890ff' }} />}
                  <Text>{item.title}</Text>
                  {getImportanceTag(item.importance)}
                </div>
              }
              description={
                <div className="news-info">
                  <span><CalendarOutlined /> {item.date}</span>
                  <span>发布：{item.publisher}</span>
                </div>
              }
            />
            <Paragraph ellipsis={{ rows: 3 }}>{item.content}</Paragraph>
            <div>
              {item.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </div>
          </List.Item>
        )}
      />
      
      {/* 编辑模态框 */}
      <Modal
        title={`${currentEditNews ? '编辑' : '添加'}新闻公告`}
        open={editModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={6} placeholder="请输入内容" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Radio.Group>
              <Radio value="新闻">新闻</Radio>
              <Radio value="公告">公告</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="importance"
            label="重要性"
            rules={[{ required: true, message: '请选择重要性' }]}
          >
            <Radio.Group>
              <Radio value="normal">普通</Radio>
              <Radio value="important">重要</Radio>
              <Radio value="urgent">紧急</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="date"
            label="发布日期"
            rules={[{ required: true, message: '请选择发布日期' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          
          <Form.Item
            name="publisher"
            label="发布部门"
            rules={[{ required: true, message: '请输入发布部门' }]}
          >
            <Input placeholder="请输入发布部门" />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Select mode="tags" placeholder="请输入标签，按Enter键确认">
              <Option value="学术">学术</Option>
              <Option value="教学">教学</Option>
              <Option value="科研">科研</Option>
              <Option value="就业">就业</Option>
              <Option value="招聘">招聘</Option>
              <Option value="通知">通知</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyNewsComponent; 