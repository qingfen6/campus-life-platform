const fs = require('fs');
const officegen = require('officegen');
const docx = officegen('docx');

// 设置文档属性
docx.on('finalize', function(written) {
  console.log('文档已生成，共 ' + written + ' 字节。');
});

docx.on('error', function(err) {
  console.log('生成文档时出错: ' + err);
});

// 添加标题
let pObj = docx.createP();
pObj.addText('校园社交平台数据库表结构', { bold: true, font_face: 'Times New Roman', font_size: 16 });
pObj.addLineBreak();
pObj.addLineBreak();

// 创建用户表结构
createTableSchema(
  '用户表(users)',
  [
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['username', '用户名', 'VARCHAR(50)', '', '否', '唯一'],
    ['password', '密码', 'CHAR(60)', '', '否', '使用bcrypt存储'],
    ['email', '电子邮箱', 'VARCHAR(100)', '', '否', '唯一'],
    ['phone', '手机号码', 'VARCHAR(20)', '', '是', ''],
    ['real_name', '真实姓名', 'VARCHAR(50)', '', '是', ''],
    ['nickname', '昵称', 'VARCHAR(50)', '', '是', ''],
    ['avatar_url', '头像URL', 'VARCHAR(255)', '', '是', ''],
    ['bio', '个人简介', 'TEXT', '', '是', ''],
    ['gender', '性别', "ENUM('male', 'female', 'other', 'undisclosed')", '', '是', '默认undisclosed'],
    ['birth_date', '出生日期', 'DATE', '', '是', ''],
    ['school_id', '学校ID', 'BIGINT UNSIGNED', '外键', '是', '关联schools表'],
    ['faculty_id', '学院ID', 'BIGINT UNSIGNED', '外键', '是', '关联faculties表'],
    ['student_id', '学号', 'VARCHAR(50)', '', '是', ''],
    ['enrollment_year', '入学年份', 'YEAR', '', '是', ''],
    ['user_status', '用户状态', "ENUM('active', 'inactive', 'banned')", '', '是', '默认active'],
    ['last_login', '最后登录时间', 'DATETIME', '', '是', ''],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 用户关系表
createTableSchema(
  '用户关系表(user_relations)',
  [
    ['relation_id', '关系ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['related_user_id', '相关用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['relation_type', '关系类型', "ENUM('follow', 'friend', 'block')", '', '否', ''],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
  ]
);

// 学校表
createTableSchema(
  '学校表(schools)',
  [
    ['school_id', '学校ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['school_name', '学校名称', 'VARCHAR(100)', '', '否', ''],
    ['school_code', '学校代码', 'VARCHAR(50)', '', '是', '唯一'],
    ['province', '省份', 'VARCHAR(50)', '', '是', ''],
    ['city', '城市', 'VARCHAR(50)', '', '是', ''],
    ['address', '地址', 'TEXT', '', '是', ''],
    ['school_type', '学校类型', "ENUM('comprehensive', 'science', 'liberal', 'art', 'sports', 'medical', 'other')", '', '是', ''],
    ['founding_year', '建校年份', 'YEAR', '', '是', ''],
    ['logo_url', 'Logo URL', 'VARCHAR(255)', '', '是', ''],
    ['website', '网站', 'VARCHAR(255)', '', '是', ''],
    ['description', '描述', 'TEXT', '', '是', ''],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 学院表
createTableSchema(
  '学院表(faculties)',
  [
    ['faculty_id', '学院ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['school_id', '学校ID', 'BIGINT UNSIGNED', '外键', '否', '关联schools表'],
    ['faculty_name', '学院名称', 'VARCHAR(100)', '', '否', ''],
    ['faculty_code', '学院代码', 'VARCHAR(50)', '', '是', ''],
    ['director', '负责人', 'VARCHAR(50)', '', '是', ''],
    ['faculty_type', '学院类型', 'VARCHAR(50)', '', '是', ''],
    ['founding_year', '成立年份', 'YEAR', '', '是', ''],
    ['description', '描述', 'TEXT', '', '是', ''],
    ['logo_url', 'Logo URL', 'VARCHAR(255)', '', '是', ''],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 动态表
createTableSchema(
  '动态表(posts)',
  [
    ['post_id', '动态ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['content', '内容', 'TEXT', '', '是', ''],
    ['post_type', '动态类型', "ENUM('text', 'image', 'video', 'link', 'mixed')", '', '否', ''],
    ['visibility', '可见性', "ENUM('public', 'school', 'private')", '', '是', '默认public'],
    ['location', '位置', 'VARCHAR(100)', '', '是', ''],
    ['like_count', '点赞数', 'INT UNSIGNED', '', '是', '默认0'],
    ['comment_count', '评论数', 'INT UNSIGNED', '', '是', '默认0'],
    ['share_count', '分享数', 'INT UNSIGNED', '', '是', '默认0'],
    ['status', '状态', "ENUM('active', 'hidden', 'deleted')", '', '是', '默认active'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 动态媒体表
createTableSchema(
  '动态媒体表(post_media)',
  [
    ['media_id', '媒体ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['post_id', '动态ID', 'BIGINT UNSIGNED', '外键', '否', '关联posts表'],
    ['media_type', '媒体类型', "ENUM('image', 'video', 'audio', 'document')", '', '否', ''],
    ['media_url', '媒体URL', 'VARCHAR(255)', '', '否', ''],
    ['thumbnail_url', '缩略图URL', 'VARCHAR(255)', '', '是', ''],
    ['display_order', '显示顺序', 'TINYINT UNSIGNED', '', '是', '默认0'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
  ]
);

// 商品表
createTableSchema(
  '商品表(products)',
  [
    ['product_id', '商品ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['title', '标题', 'VARCHAR(100)', '', '否', ''],
    ['description', '描述', 'TEXT', '', '是', ''],
    ['price', '价格', 'DECIMAL(10,2)', '', '否', ''],
    ['original_price', '原价', 'DECIMAL(10,2)', '', '是', ''],
    ['category', '类别', 'VARCHAR(50)', '', '否', ''],
    ['condition_type', '商品状况', "ENUM('new', 'like_new', 'good', 'fair', 'poor')", '', '否', ''],
    ['location', '位置', 'VARCHAR(100)', '', '是', ''],
    ['is_negotiable', '是否可议价', 'BOOLEAN', '', '是', '默认FALSE'],
    ['is_sold', '是否已售出', 'BOOLEAN', '', '是', '默认FALSE'],
    ['view_count', '浏览次数', 'INT UNSIGNED', '', '是', '默认0'],
    ['status', '状态', "ENUM('active', 'reserved', 'sold', 'expired', 'deleted')", '', '是', '默认active'],
    ['expired_at', '过期时间', 'DATETIME', '', '是', ''],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 评论表
createTableSchema(
  '评论表(comments)',
  [
    ['comment_id', '评论ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['content_type', '内容类型', "ENUM('post', 'product', 'mission', 'activity')", '', '否', ''],
    ['content_id', '内容ID', 'BIGINT UNSIGNED', '', '否', ''],
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['parent_id', '父评论ID', 'BIGINT UNSIGNED', '外键', '是', '关联自身，用于回复'],
    ['content', '内容', 'TEXT', '', '否', ''],
    ['like_count', '点赞数', 'INT UNSIGNED', '', '是', '默认0'],
    ['status', '状态', "ENUM('active', 'hidden', 'deleted')", '', '是', '默认active'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 点赞表
createTableSchema(
  '点赞表(likes)',
  [
    ['like_id', '点赞ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['content_type', '内容类型', "ENUM('post', 'comment', 'product', 'mission', 'activity')", '', '否', ''],
    ['content_id', '内容ID', 'BIGINT UNSIGNED', '', '否', ''],
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
  ]
);

// 活动表
createTableSchema(
  '活动表(activities)',
  [
    ['activity_id', '活动ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['title', '标题', 'VARCHAR(100)', '', '否', ''],
    ['description', '描述', 'TEXT', '', '是', ''],
    ['organizer_type', '组织者类型', "ENUM('school', 'faculty', 'club', 'user')", '', '否', ''],
    ['organizer_id', '组织者ID', 'BIGINT UNSIGNED', '', '否', ''],
    ['location', '位置', 'VARCHAR(100)', '', '是', ''],
    ['start_time', '开始时间', 'DATETIME', '', '否', ''],
    ['end_time', '结束时间', 'DATETIME', '', '否', ''],
    ['max_participants', '最大参与人数', 'INT UNSIGNED', '', '是', ''],
    ['current_participants', '当前参与人数', 'INT UNSIGNED', '', '是', '默认0'],
    ['registration_deadline', '报名截止时间', 'DATETIME', '', '是', ''],
    ['category', '类别', 'VARCHAR(50)', '', '是', ''],
    ['poster_url', '海报URL', 'VARCHAR(255)', '', '是', ''],
    ['status', '状态', "ENUM('upcoming', 'ongoing', 'ended', 'canceled')", '', '是', '默认upcoming'],
    ['visibility', '可见性', "ENUM('public', 'school', 'invite_only')", '', '是', '默认public'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 社团表
createTableSchema(
  '社团表(clubs)',
  [
    ['club_id', '社团ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['school_id', '学校ID', 'BIGINT UNSIGNED', '外键', '否', '关联schools表'],
    ['club_name', '社团名称', 'VARCHAR(100)', '', '否', ''],
    ['club_type', '社团类型', 'VARCHAR(50)', '', '是', ''],
    ['description', '描述', 'TEXT', '', '是', ''],
    ['founding_date', '成立日期', 'DATE', '', '是', ''],
    ['logo_url', 'Logo URL', 'VARCHAR(255)', '', '是', ''],
    ['member_count', '成员数量', 'INT UNSIGNED', '', '是', '默认0'],
    ['status', '状态', "ENUM('active', 'inactive', 'disbanded')", '', '是', '默认active'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
    ['updated_at', '更新时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP ON UPDATE'],
  ]
);

// 消息表
createTableSchema(
  '消息表(messages)',
  [
    ['message_id', '消息ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['sender_id', '发送者ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['receiver_id', '接收者ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['content', '内容', 'TEXT', '', '是', ''],
    ['has_read', '是否已读', 'BOOLEAN', '', '是', '默认FALSE'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
  ]
);

// 通知表
createTableSchema(
  '通知表(notifications)',
  [
    ['notification_id', '通知ID', 'BIGINT UNSIGNED', '主键', '否', '自增'],
    ['user_id', '用户ID', 'BIGINT UNSIGNED', '外键', '否', '关联users表'],
    ['sender_id', '发送者ID', 'BIGINT UNSIGNED', '外键', '是', '关联users表'],
    ['notification_type', '通知类型', "ENUM('like', 'comment', 'share', 'follow', 'tag', 'mission', 'reward', 'message', 'system')", '', '否', ''],
    ['content', '内容', 'TEXT', '', '是', ''],
    ['content_type', '内容类型', "ENUM('post', 'product', 'mission', 'activity', 'user', 'system')", '', '否', ''],
    ['content_id', '内容ID', 'BIGINT UNSIGNED', '', '是', ''],
    ['has_read', '是否已读', 'BOOLEAN', '', '是', '默认FALSE'],
    ['created_at', '创建时间', 'TIMESTAMP', '', '是', '默认CURRENT_TIMESTAMP'],
  ]
);

// 创建表格的函数
function createTableSchema(tableName, fields) {
  // 添加表名作为小标题
  let titlePObj = docx.createP();
  titlePObj.addText(tableName, { bold: true, font_face: 'Times New Roman', font_size: 14 });
  titlePObj.addLineBreak();
  
  // 创建表格
  let table = docx.createTable(fields.length + 1, 6);
  
  // 设置表头
  table.cells[0].forEach((cell, i) => {
    const headers = ['字段名', '字段描述', '数据类型', '标识', '是否为空', '备注'];
    cell.addText(headers[i], { bold: true, font_face: 'Times New Roman' });
  });
  
  // 填充数据
  fields.forEach((field, rowIndex) => {
    field.forEach((value, colIndex) => {
      table.cells[rowIndex + 1][colIndex].addText(value || '', { font_face: 'Times New Roman' });
    });
  });
  
  // 添加空行
  docx.createP().addLineBreak();
}

// 保存文档
const outputPath = './数据库表结构.docx';
const outputStream = fs.createWriteStream(outputPath);

// 监听事件
outputStream.on('close', function() {
  console.log('数据库表结构文档已生成，文件名为: 数据库表结构.docx');
});

// 生成文档
docx.generate(outputStream); 