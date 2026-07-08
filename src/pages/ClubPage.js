/**
 * 社团活动页面组件
 * 
 * 功能：
 * - 展示社团活动日历和个人日历
 * - 显示社团最新动态
 * - 支持图文、短视频等多种形式内容展示
 * - 支持点赞、评论、分享等交互
 * - 支持关注社团功能
 * - 响应式设计
 * - 暗色模式支持
 */

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Tabs, Button, Card, message, Spin, Space, Switch, Empty, Pagination } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  TeamOutlined,
  NotificationOutlined, 
  FireOutlined
} from '@ant-design/icons';
import { Calendar } from 'antd';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ActivityCard from '../components/club/ActivityCard';
import RecruitmentCard from '../components/club/RecruitmentCard';
import DynamicCard from '../components/club/DynamicCard';
import '../assets/styles/club.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { TabPane } = Tabs;

// 模拟社团活动数据
const activities = [
  {
    id: 1,
    title: '摄影社春季外拍活动',
    club: '摄影爱好者协会',
    date: '2025-04-15',
    time: '14:00-17:00',
    location: '校园湖畔',
    description: '春暖花开，一起来捕捉校园的美丽春色。适合各种水平的摄影爱好者，将提供专业指导。',
    coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    type: '文化艺术',
    status: '报名中',
    participants: 28,
    maxParticipants: 50,
    likes: 45,
    comments: 12,
    tags: ['摄影', '春季活动', '校园风光']
  },
  {
    id: 2,
    title: '英语角交流会',
    club: '外语协会',
    date: '2025-04-20',
    time: '19:00-21:00',
    location: '图书馆咖啡厅',
    description: '每周英语角活动，邀请外教参与，提高口语能力，交流文化差异，扩展国际视野。',
    coverImage: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    type: '学习交流',
    status: '报名中',
    participants: 15,
    maxParticipants: 30,
    likes: 32,
    comments: 8,
    tags: ['英语', '交流', '外教']
  },
  {
    id: 3,
    title: '篮球友谊赛',
    club: '篮球协会',
    date: '2025-04-25',
    time: '15:00-17:00',
    location: '北区体育馆',
    description: '与邻近高校进行友谊赛，增进校际交流。欢迎各位篮球爱好者前来观赛，为我校加油！',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    type: '体育运动',
    status: '已结束',
    participants: 40,
    maxParticipants: 40,
    likes: 67,
    comments: 23,
    tags: ['篮球', '友谊赛', '校际交流']
  },
  {
    id: 4,
    title: '校园歌手大赛',
    club: '音乐协会',
    date: '2025-05-10',
    time: '18:30-21:30',
    location: '大学生活动中心',
    description: '一年一度的校园歌手大赛开始报名啦！欢迎各位音乐爱好者展示才华，争夺校园歌王称号！',
    coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    type: '文化艺术',
    status: '报名中',
    participants: 32,
    maxParticipants: 50,
    likes: 89,
    comments: 28,
    tags: ['音乐', '比赛', '才艺']
  },
  {
    id: 5,
    title: '机器人技术讲座',
    club: '机器人协会',
    date: '2025-05-15',
    time: '14:30-16:30',
    location: '工学院报告厅',
    description: '邀请知名机器人领域专家分享最新技术发展和应用，带你了解人工智能与机器人的未来。',
    coverImage: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    type: '科技创新',
    status: '报名中',
    participants: 45,
    maxParticipants: 100,
    likes: 56,
    comments: 14,
    tags: ['人工智能', '机器人', '讲座']
  },
  {
    id: 6,
    title: '校园环保行动日',
    club: '环保志愿者协会',
    date: '2025-05-20',
    time: '09:00-12:00',
    location: '校园各区域',
    description: '一起参与校园环境保护，清理垃圾，种植树木，宣传环保理念，共建美丽绿色校园。',
    coverImage: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    type: '公益活动',
    status: '报名中',
    participants: 55,
    maxParticipants: 100,
    likes: 78,
    comments: 19,
    tags: ['环保', '志愿者', '公益']
  }
];

// 模拟招新数据
const recruitments = [
  {
    id: 1,
    title: '舞蹈团招新',
    club: '校园舞蹈团',
    date: '2025-04-10',
    time: '18:30-21:00',
    location: '学生活动中心',
    requirements: ['有舞蹈基础或热爱舞蹈', '能够参加每周训练', '有团队合作精神'],
    interviewSlots: [
      { date: '2025-04-10', time: '18:30-19:30' },
      { date: '2025-04-10', time: '19:30-20:30' },
      { date: '2025-04-11', time: '18:30-19:30' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    applications: 35,
    maxApplications: 50,
    acceptanceRate: 70,
    status: '报名中',
    tags: ['舞蹈', '招新', '艺术团']
  },
  {
    id: 2,
    title: '学生会干部招募',
    club: '校学生会',
    date: '2025-04-18',
    time: '14:00-17:00',
    location: '行政楼报告厅',
    requirements: ['有责任心和团队精神', '能够平衡学习与工作', '有相关经验优先'],
    interviewSlots: [
      { date: '2025-04-18', time: '14:00-15:00' },
      { date: '2025-04-18', time: '15:00-16:00' },
      { date: '2025-04-18', time: '16:00-17:00' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    applications: 42,
    maxApplications: 60,
    acceptanceRate: 40,
    status: '报名中',
    tags: ['学生会', '干部', '招募']
  },
  {
    id: 3,
    title: '摄影协会新成员招募',
    club: '摄影爱好者协会',
    date: '2025-04-22',
    time: '16:00-18:00',
    location: '艺术学院101室',
    requirements: ['对摄影有热情', '有自己的相机设备优先', '愿意参与社团活动'],
    interviewSlots: [
      { date: '2025-04-22', time: '16:00-17:00' },
      { date: '2025-04-23', time: '16:00-17:00' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    applications: 28,
    maxApplications: 40,
    acceptanceRate: 75,
    status: '报名中',
    tags: ['摄影', '招新', '艺术']
  },
  {
    id: 4,
    title: '辩论队新队员选拔',
    club: '校辩论队',
    date: '2025-05-05',
    time: '19:00-21:00',
    location: '人文学院报告厅',
    requirements: ['具备良好的语言表达能力', '思维敏捷，逻辑清晰', '对时事政治有一定了解'],
    interviewSlots: [
      { date: '2025-05-05', time: '19:00-20:00' },
      { date: '2025-05-06', time: '19:00-20:00' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1534187886935-1e1faddaf8a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    applications: 20,
    maxApplications: 30,
    acceptanceRate: 50,
    status: '报名中',
    tags: ['辩论', '选拔', '演讲']
  },
  {
    id: 5,
    title: '志愿者服务队招募',
    club: '青年志愿者协会',
    date: '2025-05-10',
    time: '14:00-16:00',
    location: '学生服务中心',
    requirements: ['有奉献精神', '时间充裕', '责任心强'],
    interviewSlots: [
      { date: '2025-05-10', time: '14:00-15:00' },
      { date: '2025-05-10', time: '15:00-16:00' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    applications: 60,
    maxApplications: 100,
    acceptanceRate: 90,
    status: '报名中',
    tags: ['志愿者', '公益', '服务']
  }
];

// 模拟日历事件数据
const calendarEvents = [
  {
    id: 1,
    title: '摄影社春季外拍',
    date: '2025-04-15',
    type: 'activity',
    club: '摄影爱好者协会',
    location: '校园湖畔'
  },
  {
    id: 2,
    title: '英语角交流会',
    date: '2025-04-20',
    type: 'activity',
    club: '外语协会',
    location: '图书馆咖啡厅'
  },
  {
    id: 3,
    title: '舞蹈团招新面试',
    date: '2025-04-10',
    type: 'recruitment',
    club: '校园舞蹈团',
    location: '学生活动中心'
  },
  {
    id: 4,
    title: '学生会干部招募',
    date: '2025-04-18',
    type: 'recruitment',
    club: '校学生会',
    location: '行政楼报告厅'
  },
  {
    id: 5,
    title: '摄影协会招新',
    date: '2025-04-22',
    type: 'recruitment',
    club: '摄影爱好者协会',
    location: '艺术学院101室'
  },
  {
    id: 6,
    title: '篮球友谊赛',
    date: '2025-04-25',
    type: 'activity',
    club: '篮球协会',
    location: '北区体育馆'
  },
  {
    id: 7,
    title: '辩论队选拔',
    date: '2025-05-05',
    type: 'recruitment',
    club: '校辩论队',
    location: '人文学院报告厅'
  },
  {
    id: 8,
    title: '校园歌手大赛',
    date: '2025-05-10',
    type: 'activity',
    club: '音乐协会',
    location: '大学生活动中心'
  },
  {
    id: 9,
    title: '志愿者招募',
    date: '2025-05-10',
    type: 'recruitment',
    club: '青年志愿者协会',
    location: '学生服务中心'
  },
  {
    id: 10,
    title: '机器人技术讲座',
    date: '2025-05-15',
    type: 'activity',
    club: '机器人协会',
    location: '工学院报告厅'
  },
  {
    id: 11,
    title: '校园环保行动',
    date: '2025-05-20',
    type: 'activity',
    club: '环保志愿者协会',
    location: '校园各区域'
  }
];

// 模拟动态数据
const dynamicPosts = [
  {
    id: 1,
    username: '摄影社',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhotoClub',
    content: '春季摄影大赛圆满结束！感谢所有参赛者提交的精彩作品，以下是获奖名单和部分优秀作品展示。',
    images: [
      'https://images.unsplash.com/photo-1455218873509-8097305ee378?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '昨天 16:30',
    likes: 156,
    comments: 42,
    tags: ['摄影大赛', '获奖作品', '春季活动'],
    isLiked: false
  },
  {
    id: 2,
    username: '话剧社',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DramaClub',
    content: '话剧《青春》排练中！5月1日晚将在大学生活动中心演出，欢迎大家前来观看。提前购票可享受优惠哦！',
    images: [
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '3天前',
    likes: 89,
    comments: 31,
    tags: ['话剧演出', '校园文化', '青春'],
    isLiked: false
  },
  {
    id: 3,
    username: '街舞社',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanceClub',
    content: '📢 招新啦！街舞社2025春季招新开始了，无基础也可以报名，只要你热爱舞蹈，我们欢迎你的加入！',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '5天前',
    likes: 120,
    comments: 45,
    tags: ['招新进行中', '街舞', '零基础可学'],
    isLiked: false,
    link: 'https://www.example.com/join'
  },
  {
    id: 4,
    username: '羽毛球协会',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BadmintonClub',
    content: '恭喜我校羽毛球队在全国大学生羽毛球锦标赛中获得团体亚军！感谢所有队员的辛勤付出和教练的悉心指导。',
    images: [
      'https://images.unsplash.com/photo-1595435742656-5dcc986cf7be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '一周前',
    likes: 230,
    comments: 56,
    tags: ['比赛结果', '羽毛球', '全国亚军'],
    isLiked: false
  },
  {
    id: 5,
    username: '计算机协会',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ComputerClub',
    content: '【技术分享】上周末的编程马拉松活动非常成功！参与者们在24小时内开发出了多个令人惊艳的项目。以下是部分优秀作品展示，欢迎大家投票！',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '1周前',
    likes: 98,
    comments: 36,
    tags: ['编程马拉松', '技术开发', '创新项目'],
    isLiked: false
  },
  {
    id: 6,
    username: '吉他协会',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuitarClub',
    content: '【招募】吉他小白速成班开始报名啦！每周六下午，专业老师一对一指导，四周让你能够弹唱简单歌曲！名额有限，速来报名！',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '10天前',
    likes: 75,
    comments: 28,
    tags: ['吉他教学', '音乐', '速成班'],
    isLiked: false
  },
  {
    id: 7,
    username: '读书会',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BookClub',
    content: '本月读书推荐：《心灵的七种武器》。这本书教会我们如何面对生活中的各种挑战，提高心理韧性。本周五晚上7点，我们将在图书馆三楼举行读书分享会，欢迎各位书友参加！',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '2周前',
    likes: 63,
    comments: 24,
    tags: ['读书分享', '心理成长', '图书推荐'],
    isLiked: false
  },
  {
    id: 8,
    username: '美食社',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FoodClub',
    content: '上周末的烘焙课程圆满结束！大家都做出了美味的蛋糕和饼干，成果展示在下面的照片中。下次课程将教授如何制作法式马卡龙，感兴趣的同学请提前报名！',
    images: [
      'https://images.unsplash.com/photo-1505935428862-770b6f24f629?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1519654793545-adb537bd6ee4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    time: '2周前',
    likes: 112,
    comments: 40,
    tags: ['烘焙', '美食', '课程'],
    isLiked: false
  }
];

/**
 * 社团活动页面组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 深色模式状态
 * @param {function} props.toggleDarkMode - 切换深色模式的函数
 * @returns {JSX.Element} 社团活动页面组件
 */
const ClubPage = ({ darkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('dynamics');
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMode, setCalendarMode] = useState('club'); // 'club' or 'personal'
  const [likedPosts, setLikedPosts] = useState({});
  const [followedClubs, setFollowedClubs] = useState({});
  const [showAnimation, setShowAnimation] = useState(false);
  const [registeredActivities, setRegisteredActivities] = useState([1]); // 默认注册了第一个活动
  const [achievements, setAchievements] = useState({
    explorer: true,       // 探索者：访问社团页面
    joiner: true,         // 加入者：报名参加活动
    socializer: false,    // 社交达人：点赞/评论 5 次
    collector: false,     // 收藏家：收藏 3 个资源
    enthusiast: false     // 热心人：报名参加 3 个活动
  });
  
  // 改为使用useState管理的状态
  const [personalEvents, setPersonalEvents] = useState([
    {
      id: 101,
      title: '摄影社春季外拍',
      date: '2025-04-15',
      type: 'registered',
      club: '摄影爱好者协会',
      location: '校园湖畔'
    }
  ]);
  
  const navigate = useNavigate();
  
  // 模拟加载数据
  useEffect(() => {
    setLoading(true);
    // 模拟网络请求延迟
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  // 显示成就解锁动画
  useEffect(() => {
    // 模拟解锁成就
    const timer = setTimeout(() => {
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // 从localStorage加载个人日历数据
  useEffect(() => {
    const savedEvents = localStorage.getItem('personalEvents');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setPersonalEvents(parsedEvents);
      } catch (error) {
        console.error('加载个人日历数据失败:', error);
      }
    }
  }, []);

  // 保存个人日历数据到localStorage
  useEffect(() => {
    localStorage.setItem('personalEvents', JSON.stringify(personalEvents));
  }, [personalEvents]);

  /**
   * 处理标签页变化
   * @param {string} key - 标签页的key
   */
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  /**
   * 处理搜索
   * @param {string} value - 搜索文本
   */
  const handleSearch = (value) => {
    setSearchText(value);
  };

  /**
   * 处理类型筛选变化
   * @param {string} type - 选中的类型
   */
  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  /**
   * 处理状态筛选变化
   * @param {string} status - 选中的状态
   */
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  /**
   * 处理日期选择
   * @param {object} date - 选中的日期
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    message.info(`已选择日期: ${date.format('YYYY-MM-DD')}`);
  };

  /**
   * 处理日历模式切换
   * @param {boolean} checked - 是否切换到个人日历
   */
  const handleCalendarModeChange = (checked) => {
    setCalendarMode(checked ? 'personal' : 'club');
    message.success(checked ? '已切换到个人日历' : '已切换到社团日历', 1);
  };

  /**
   * 处理添加提醒
   */
  const handleAddReminder = () => {
    message.success('已添加活动提醒', 1.5);
  };

  /**
   * 处理订阅日历
   */
  const handleSubscribe = () => {
    message.success('已订阅活动日历', 1.5);
  };

  /**
   * 处理点赞
   * @param {number} id - 动态id
   */
  const handleLike = (id) => {
    setLikedPosts(prev => {
      const newLiked = { ...prev };
      newLiked[id] = !newLiked[id];
      return newLiked;
    });
    
    // 计算点赞总数
    const totalLikes = Object.values(likedPosts).filter(liked => liked).length;
    
    // 如果达到5次点赞，解锁社交达人成就
    if (totalLikes >= 4 && !achievements.socializer) {
      setAchievements(prev => ({...prev, socializer: true}));
      setTimeout(() => {
        message.success('🎉 解锁成就：社交达人！', 2);
      }, 300);
    } else {
      message.success(likedPosts[id] ? '已取消点赞' : '点赞成功', 1);
    }
  };

  /**
   * 处理评论
   * @param {number} id - 动态id
   */
  const handleComment = (id) => {
    message.info('评论功能开发中', 1);
  };

  /**
   * 处理分享
   * @param {number} id - 动态id
   */
  const handleShare = (id) => {
    message.success('分享成功', 1.5);
  };

  /**
   * 处理图片预览
   * @param {array} images - 图片数组
   * @param {number} index - 预览索引
   */
  const handleImagePreview = (images, index) => {
    // 图片预览逻辑
    message.info('图片预览功能开发中', 1);
  };

  /**
   * 处理关注社团
   * @param {string} clubName - 社团名称
   */
  const handleFollow = (clubName) => {
    setFollowedClubs(prev => {
      const newFollowed = { ...prev };
      newFollowed[clubName] = !newFollowed[clubName];
      return newFollowed;
    });
    
    message.success(followedClubs[clubName] ? `已取消关注${clubName}` : `已关注${clubName}`, 1.5);
  };

  /**
   * 处理活动报名
   * @param {object} activity - 活动对象
   */
  const handleJoinActivity = (activity) => {
    if (registeredActivities.includes(activity.id)) {
      message.info(`您已报名${activity.title}`, 1.5);
      return;
    }
    
    setRegisteredActivities(prev => [...prev, activity.id]);
    
    // 添加到个人日历
    const newEvent = {
      id: 100 + activity.id,
      title: activity.title,
      date: activity.date,
      type: 'registered',
      club: activity.club,
      location: activity.location
    };
    
    // 将新活动添加到个人日历
    const eventExists = personalEvents.some(event => event.id === newEvent.id);
    if (!eventExists) {
      // 使用useState更新personalEvents数组
      setPersonalEvents(prev => [...prev, newEvent]);
      
      // 自动切换到个人日历，展示新添加的活动
      setCalendarMode('personal');
      
      // 选中活动日期
      const activityDate = moment(activity.date);
      setSelectedDate(activityDate);
      
      message.success(`已将 ${activity.title} 添加到个人日历`, 1.5);
    }
    
    // 检查是否解锁热心人成就
    if (registeredActivities.length >= 2 && !achievements.enthusiast) {
      setAchievements(prev => ({...prev, enthusiast: true}));
      setTimeout(() => {
        message.success('🎉 解锁成就：热心人！', 2);
      }, 300);
    } else {
      message.success(`已成功报名${activity.title}`, 1.5);
    }
  };

  // 在组件内部添加分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  // 在组件内部添加分页相关的处理函数
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // 回到顶部
    const contentElement = document.querySelector('.tab-content');
    if (contentElement) {
      contentElement.scrollTop = 0;
    }
  };

  // 获取当前页的数据
  const getPaginatedData = (dataSource) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return dataSource.slice(startIndex, endIndex);
  };

  /**
   * 处理动态卡片点击，跳转到详情页
   * @param {number} postId - 动态ID 
   */
  const handleDynamicCardClick = (postId) => {
    if (postId) {
      console.log('跳转到动态详情页:', postId);
      navigate(`/post/${postId}`);
    }
  };

  /**
   * 渲染动态内容
   * @returns {JSX.Element} 动态内容组件
   */
  const renderDynamics = () => {
    const paginatedPosts = getPaginatedData(dynamicPosts);
    
    return (
      <>
        <div className="dynamic-feed">
          {paginatedPosts.map(post => (
            <DynamicCard
              key={post.id}
              post={{
                ...post,
                isLiked: !!likedPosts[post.id]
              }}
              onLike={() => handleLike(post.id)}
              onComment={() => handleComment(post.id)}
              onShare={() => handleShare(post.id)}
              onImagePreview={handleImagePreview}
              onFollow={() => handleFollow(post.username)}
              isFollowed={!!followedClubs[post.username]}
              onClick={handleDynamicCardClick}
            />
          ))}
        </div>
        <div className="pagination-container">
          <Pagination 
            current={currentPage}
            pageSize={pageSize}
            total={dynamicPosts.length}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </>
    );
  };

  /**
   * 渲染活动内容
   * @returns {JSX.Element} 活动内容组件
   */
  const renderActivities = () => {
    const paginatedActivities = getPaginatedData(activities);
    
    return (
      <>
        <div className="activity-list">
          {paginatedActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={{
                ...activity,
                isRegistered: registeredActivities.includes(activity.id)
              }}
              onLike={() => handleLike(activity.id)}
              onFavorite={() => {}}
              onShare={() => handleShare(activity.id)}
              onJoin={() => handleJoinActivity(activity)}
              onViewDetail={() => {}}
              isLiked={!!likedPosts[activity.id]}
              isFavorite={false}
            />
          ))}
        </div>
        <div className="pagination-container">
          <Pagination 
            current={currentPage}
            pageSize={pageSize}
            total={activities.length}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </>
    );
  };

  /**
   * 渲染招新内容
   * @returns {JSX.Element} 招新内容组件
   */
  const renderRecruitments = () => {
    const paginatedRecruitments = getPaginatedData(recruitments);
    
    return (
      <>
        <div className="recruitment-list">
          {paginatedRecruitments.map(recruitment => (
            <RecruitmentCard
              key={recruitment.id}
              recruitment={recruitment}
              onScheduleInterview={() => message.success(`已预约${recruitment.club}面试`, 1.5)}
              onViewDetail={() => {}}
            />
          ))}
        </div>
        <div className="pagination-container">
          <Pagination 
            current={currentPage}
            pageSize={pageSize}
            total={recruitments.length}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </>
    );
  };

  /**
   * 自定义日历单元格渲染
   */
  const dateCellRender = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const events = calendarMode === 'club' 
      ? calendarEvents.filter(event => event.date === dateStr)
      : personalEvents.filter(event => event.date === dateStr);
    
    if (events.length === 0) return null;
    
    // 为有活动的日期添加标记点
    let className = 'date-has-event';
    
    // 如果是个人日历且有已注册的活动，显示为已注册的样式
    if (calendarMode === 'personal' && events[0].type === 'registered') {
      className = 'date-has-registered-event';
    }
    
    return (
      <div className={className}></div>
    );
  };

  /**
   * 渲染即将到来的活动
   */
  const renderUpcomingEvents = () => {
    // 如果有选中的日期，显示选中日期的活动
    if (selectedDate) {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const events = calendarMode === 'club' 
        ? calendarEvents.filter(event => event.date === dateStr)
        : personalEvents.filter(event => event.date === dateStr);
      
      return (
        <div className="upcoming-events">
          <h4>{dateStr} 的活动</h4>
          {events.length > 0 ? (
            <ul>
              {events.map((event, index) => (
                <li key={index} className={event.type === 'registered' ? 'registered' : ''}>
                  {event.title}
                  <div className="event-time">{event.date} · {event.location}</div>
                  {calendarMode === 'personal' && event.type === 'registered' && (
                    <Button 
                      type="link" 
                      size="small" 
                      danger
                      onClick={() => handleCancelRegistration(event)}
                      style={{ padding: '0', height: 'auto' }}
                    >
                      取消报名
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当天没有活动" />
          )}
        </div>
      );
    }
    
    // 没有选中日期，显示即将到来的活动
    const events = calendarMode === 'club' 
      ? calendarEvents.filter(event => new Date(event.date) >= new Date())
      : personalEvents.filter(event => new Date(event.date) >= new Date());
    
    // 按日期排序
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return (
      <div className="upcoming-events">
        <h4>即将到来的活动</h4>
        {events.length > 0 ? (
          <ul>
            {events.slice(0, 3).map((event, index) => (
              <li key={index} className={event.type === 'registered' ? 'registered' : ''}>
                {event.title}
                <div className="event-time">{event.date} · {event.location}</div>
                {calendarMode === 'personal' && event.type === 'registered' && (
                  <Button 
                    type="link" 
                    size="small" 
                    danger
                    onClick={() => handleCancelRegistration(event)}
                    style={{ padding: '0', height: 'auto' }}
                  >
                    取消报名
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无即将到来的活动" />
        )}
      </div>
    );
  };

  /**
   * 渲染日历操作按钮
   */
  const renderCalendarActions = () => {
    return (
      <Space size="small" style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <Button 
          type="primary" 
          ghost
          size="small"
          icon={<CalendarOutlined />}
          onClick={handleSubscribe}
        >
          订阅日历
        </Button>
        <Button
          type="default"
          size="small"
          icon={<NotificationOutlined />}
          onClick={handleAddReminder}
        >
          添加提醒
        </Button>
      </Space>
    );
  };

  /**
   * 渲染成就系统
   */
  const renderAchievements = () => {
    return (
      <Card 
        size="small" 
        title="我的成就" 
        className="achievements-card"
        style={{ marginTop: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(achievements).map(([key, unlocked]) => {
            const achievementInfo = {
              explorer: { name: '探索者', icon: '🧭', desc: '访问社团页面' },
              joiner: { name: '加入者', icon: '🚪', desc: '报名参加活动' },
              socializer: { name: '社交达人', icon: '🌟', desc: '点赞/评论 5 次' },
              collector: { name: '收藏家', icon: '📚', desc: '收藏 3 个资源' },
              enthusiast: { name: '热心人', icon: '🔥', desc: '报名参加 3 个活动' }
            };
            
            const { name, icon, desc } = achievementInfo[key];
            
            return (
              <div 
                key={key} 
                className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`}
                style={{ 
                  opacity: unlocked ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: unlocked ? 'rgba(82, 196, 26, 0.1)' : 'transparent'
                }}
              >
                <div style={{ marginRight: 8, fontSize: 20 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{desc}</div>
                </div>
              </div>
            );
          })}
        </Space>
      </Card>
    );
  };

  /**
   * 渲染成就解锁动画
   */
  const renderAchievementAnimation = () => {
    if (!showAnimation) return null;
    
    return (
      <div className="achievement-animation" style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        animation: 'fadeIn 0.3s, fadeOut 0.3s 2.7s'
      }}>
        <div style={{ fontSize: 24, marginRight: 12 }}>🏆</div>
        <div>
          <div style={{ fontWeight: 'bold' }}>成就解锁！</div>
          <div>探索者：访问社团页面</div>
        </div>
      </div>
    );
  };

  /**
   * 处理取消报名
   * @param {object} event - 日历事件对象
   */
  const handleCancelRegistration = (event) => {
    // 从个人日历中移除活动
    setPersonalEvents(prev => prev.filter(e => e.id !== event.id));
    
    // 从已报名活动列表中移除
    const activityId = event.id - 100; // 还原为原来的活动ID
    setRegisteredActivities(prev => prev.filter(id => id !== activityId));
    
    message.success(`已取消报名: ${event.title}`, 1.5);
  };

  return (
    <Layout className="app-layout">
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      
      <Layout className="site-layout">
        <Header />
        <Content className="club-content">
          <Row gutter={[16, 16]}>
            {/* 日历区域 */}
            <Col xs={24} md={8} className="calendar-column">
              <div className="calendar-switch">
                <span>{calendarMode === 'club' ? '社团活动日历' : '个人日历'}</span>
                <Switch 
                  checkedChildren="个人" 
                  unCheckedChildren="社团" 
                  onChange={handleCalendarModeChange}
                  checked={calendarMode === 'personal'}
                />
              </div>
              <Card className="calendar-card">
                <Calendar 
                  fullscreen={false} 
                  dateCellRender={dateCellRender}
                  onSelect={handleDateSelect}
                  className="activity-calendar"
                  headerRender={({ value, type, onChange, onTypeChange }) => {
                    const current = value.clone();
                    const month = current.month();
                    const year = current.year();
                    
                    return (
                      <div className="calendar-header">
                        <Button 
                          type="text" 
                          onClick={() => {
                            const newValue = current.clone().subtract(1, 'month');
                            onChange(newValue);
                          }}
                        >
                          ←
                        </Button>
                        <span className="calendar-header-text">
                          {`${year}年${month + 1}月`}
                        </span>
                        <Button 
                          type="text" 
                          onClick={() => {
                            const newValue = current.clone().add(1, 'month');
                            onChange(newValue);
                          }}
                        >
                          →
                        </Button>
                      </div>
                    );
                  }}
                />
                
                {renderUpcomingEvents()}
                {renderCalendarActions()}
              </Card>
              
              {renderAchievements()}
            </Col>
            
            {/* 内容区域 */}
            <Col xs={24} md={16}>
              <Card className="content-card">
                <Tabs 
                  activeKey={activeTab} 
                  onChange={handleTabChange}
                  className="club-tabs"
                >
                  <TabPane 
                    tab={<span><FireOutlined /> 动态</span>} 
                    key="dynamics" 
                  />
                  <TabPane 
                    tab={<span><TeamOutlined /> 活动</span>} 
                    key="activities" 
                  />
                  <TabPane 
                    tab={<span><UserOutlined /> 招新</span>} 
                    key="recruitments" 
                  />
                </Tabs>
                
                <div className="tab-content">
                  {loading ? (
                    <div className="loading-container">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <>
                      {activeTab === 'dynamics' && renderDynamics()}
                      {activeTab === 'activities' && renderActivities()}
                      {activeTab === 'recruitments' && renderRecruitments()}
                    </>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
      
      {/* 成就解锁动画 */}
      {renderAchievementAnimation()}
    </Layout>
  );
};

export default ClubPage; 