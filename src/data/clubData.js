/**
 * 社团活动页面模拟数据
 */

// 活动数据
export const activities = [
  {
    id: 1,
    title: '摄影技巧分享会',
    club: '摄影协会',
    date: '2024-03-20',
    time: '14:00-16:00',
    location: '教学楼A101',
    description: '分享摄影基础知识和进阶技巧,包括构图、光线运用、后期处理等内容。适合摄影初学者和进阶者参加。',
    coverImage: 'https://example.com/photo.jpg',
    type: 'workshop',
    status: '报名中',
    participants: 15,
    maxParticipants: 30,
    likes: 45,
    comments: 12,
    tags: ['摄影', '技巧分享', '工作坊']
  },
  {
    id: 2,
    title: '街舞表演赛',
    club: '街舞社',
    date: '2024-03-25',
    time: '19:00-21:00',
    location: '学生活动中心',
    description: '一年一度的街舞表演赛,展示各支队伍的精彩表演。',
    coverImage: 'https://example.com/dance.jpg',
    type: 'competition',
    status: '报名中',
    participants: 45,
    maxParticipants: 100,
    likes: 89,
    comments: 23,
    tags: ['街舞', '表演', '比赛']
  },
  {
    id: 3,
    title: '创业经验分享会',
    club: '创业协会',
    date: '2024-03-28',
    time: '15:00-17:00',
    location: '图书馆报告厅',
    description: '邀请成功创业者分享创业经验和心得。',
    coverImage: 'https://example.com/startup.jpg',
    type: 'lecture',
    status: '报名中',
    participants: 78,
    maxParticipants: 150,
    likes: 156,
    comments: 34,
    tags: ['创业', '经验分享', '讲座']
  }
];

// 招新数据
export const recruitments = [
  {
    id: 1,
    title: '摄影协会招新',
    club: '摄影协会',
    date: '2024-03-25',
    time: '15:00-17:00',
    location: '教学楼B205',
    requirements: [
      '热爱摄影,有基础设备',
      '能参与协会活动',
      '有团队协作精神',
      '有摄影作品优先'
    ],
    interviewSlots: [
      { date: '2024-03-25', time: '15:00-15:30', available: true },
      { date: '2024-03-25', time: '15:30-16:00', available: true },
      { date: '2024-03-25', time: '16:00-16:30', available: false }
    ],
    applications: 8,
    maxApplications: 20,
    acceptanceRate: 75,
    tags: ['招新', '面试']
  },
  {
    id: 2,
    title: '街舞社招新',
    club: '街舞社',
    date: '2024-03-26',
    time: '14:00-16:00',
    location: '学生活动中心',
    requirements: [
      '热爱街舞',
      '有基础舞蹈功底',
      '能参与排练和表演',
      '有表演经验优先'
    ],
    interviewSlots: [
      { date: '2024-03-26', time: '14:00-14:30', available: true },
      { date: '2024-03-26', time: '14:30-15:00', available: true }
    ],
    applications: 12,
    maxApplications: 25,
    acceptanceRate: 80,
    tags: ['招新', '面试']
  }
];

// 资源数据
export const resources = [
  {
    id: 1,
    title: '摄影基础教程',
    uploader: '摄影协会',
    uploadTime: '2024-03-15',
    description: '摄影基础知识讲解,包括相机使用、构图技巧等内容。',
    coverImage: 'https://example.com/tutorial.jpg',
    downloads: 45,
    totalDownloads: 100,
    fileSize: '2.5MB',
    previewUrl: 'https://example.com/preview.jpg',
    tags: ['教程', '摄影']
  },
  {
    id: 2,
    title: '街舞基础动作教学',
    uploader: '街舞社',
    uploadTime: '2024-03-16',
    description: '街舞基础动作教学视频,适合初学者。',
    coverImage: 'https://example.com/dance-tutorial.jpg',
    downloads: 78,
    totalDownloads: 150,
    fileSize: '1.8MB',
    previewUrl: 'https://example.com/dance-preview.jpg',
    tags: ['教程', '街舞']
  }
];

// 论坛帖子数据
export const forumPosts = [
  {
    id: 1,
    title: '分享我的摄影作品',
    author: '李四',
    authorAvatar: 'https://example.com/avatar1.jpg',
    content: '这是我最近拍摄的一组照片,希望大家喜欢。',
    images: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
      'https://example.com/photo3.jpg'
    ],
    publishTime: '2024-03-18',
    views: 120,
    likes: 15,
    replies: 8,
    isTop: true,
    isHot: true,
    isAnonymous: false,
    tags: ['作品分享', '摄影']
  },
  {
    id: 2,
    title: '街舞表演视频分享',
    author: '王五',
    authorAvatar: 'https://example.com/avatar2.jpg',
    content: '上周街舞社的表演视频,欢迎大家观看。',
    images: [
      'https://example.com/dance1.jpg',
      'https://example.com/dance2.jpg'
    ],
    publishTime: '2024-03-19',
    views: 89,
    likes: 12,
    replies: 5,
    isTop: false,
    isHot: true,
    isAnonymous: false,
    tags: ['视频', '街舞']
  }
];

// 日历事件数据
export const calendarEvents = [
  {
    id: 1,
    title: '摄影技巧分享会',
    date: '2024-03-20',
    type: 'activity',
    club: '摄影协会',
    location: '教学楼A101'
  },
  {
    id: 2,
    title: '街舞表演赛',
    date: '2024-03-25',
    type: 'activity',
    club: '街舞社',
    location: '学生活动中心'
  },
  {
    id: 3,
    title: '创业经验分享会',
    date: '2024-03-28',
    type: 'activity',
    club: '创业协会',
    location: '图书馆报告厅'
  },
  {
    id: 4,
    title: '摄影协会招新面试',
    date: '2024-03-25',
    type: 'recruitment',
    club: '摄影协会',
    location: '教学楼B205'
  }
];

// 动态信息数据
export const dynamicPosts = [
  {
    id: 1,
    username: '王五',
    avatar: 'https://example.com/avatar3.jpg',
    content: '今天参加了摄影协会的活动,收获很多！',
    images: ['https://example.com/activity.jpg'],
    time: '2小时前',
    likes: 12,
    comments: 3,
    isLiked: false,
    tags: ['活动回顾']
  },
  {
    id: 2,
    username: '李四',
    avatar: 'https://example.com/avatar4.jpg',
    content: '街舞社的表演太精彩了！',
    images: ['https://example.com/dance-performance.jpg'],
    time: '4小时前',
    likes: 23,
    comments: 7,
    isLiked: true,
    tags: ['表演']
  }
]; 