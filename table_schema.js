const { Document, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, BorderStyle, Packer } = require('docx');
const fs = require('fs');

// 创建文档
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        text: "校园社交平台数据库表结构",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
    ],
  }],
});

// 用户表
addTableSchema(
  "用户表(users)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["username", "用户名", "VARCHAR(50)", "", "否", "唯一"],
    ["password", "密码", "CHAR(60)", "", "否", "使用bcrypt存储"],
    ["email", "电子邮箱", "VARCHAR(100)", "", "否", "唯一"],
    ["phone", "手机号码", "VARCHAR(20)", "", "是", ""],
    ["real_name", "真实姓名", "VARCHAR(50)", "", "是", ""],
    ["nickname", "昵称", "VARCHAR(50)", "", "是", ""],
    ["avatar_url", "头像URL", "VARCHAR(255)", "", "是", ""],
    ["bio", "个人简介", "TEXT", "", "是", ""],
    ["gender", "性别", "ENUM('male', 'female', 'other', 'undisclosed')", "", "是", "默认undisclosed"],
    ["birth_date", "出生日期", "DATE", "", "是", ""],
    ["school_id", "学校ID", "BIGINT UNSIGNED", "外键", "是", "关联schools表"],
    ["faculty_id", "学院ID", "BIGINT UNSIGNED", "外键", "是", "关联faculties表"],
    ["student_id", "学号", "VARCHAR(50)", "", "是", ""],
    ["enrollment_year", "入学年份", "YEAR", "", "是", ""],
    ["user_status", "用户状态", "ENUM('active', 'inactive', 'banned')", "", "是", "默认active"],
    ["last_login", "最后登录时间", "DATETIME", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 用户关系表
addTableSchema(
  "用户关系表(user_relations)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["relation_id", "关系ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["related_user_id", "相关用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["relation_type", "关系类型", "ENUM('follow', 'friend', 'block')", "", "否", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 学校表
addTableSchema(
  "学校表(schools)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["school_id", "学校ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["school_name", "学校名称", "VARCHAR(100)", "", "否", ""],
    ["school_code", "学校代码", "VARCHAR(50)", "", "是", "唯一"],
    ["province", "省份", "VARCHAR(50)", "", "是", ""],
    ["city", "城市", "VARCHAR(50)", "", "是", ""],
    ["address", "地址", "TEXT", "", "是", ""],
    ["school_type", "学校类型", "ENUM('comprehensive', 'science', 'liberal', 'art', 'sports', 'medical', 'other')", "", "是", ""],
    ["founding_year", "建校年份", "YEAR", "", "是", ""],
    ["logo_url", "Logo URL", "VARCHAR(255)", "", "是", ""],
    ["website", "网站", "VARCHAR(255)", "", "是", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 学院表
addTableSchema(
  "学院表(faculties)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["faculty_id", "学院ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["school_id", "学校ID", "BIGINT UNSIGNED", "外键", "否", "关联schools表"],
    ["faculty_name", "学院名称", "VARCHAR(100)", "", "否", ""],
    ["faculty_code", "学院代码", "VARCHAR(50)", "", "是", ""],
    ["director", "负责人", "VARCHAR(50)", "", "是", ""],
    ["faculty_type", "学院类型", "VARCHAR(50)", "", "是", ""],
    ["founding_year", "成立年份", "YEAR", "", "是", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["logo_url", "Logo URL", "VARCHAR(255)", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 动态表
addTableSchema(
  "动态表(posts)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["post_id", "动态ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["content", "内容", "TEXT", "", "是", ""],
    ["post_type", "动态类型", "ENUM('text', 'image', 'video', 'link', 'mixed')", "", "否", ""],
    ["visibility", "可见性", "ENUM('public', 'school', 'private')", "", "是", "默认public"],
    ["location", "位置", "VARCHAR(100)", "", "是", ""],
    ["like_count", "点赞数", "INT UNSIGNED", "", "是", "默认0"],
    ["comment_count", "评论数", "INT UNSIGNED", "", "是", "默认0"],
    ["share_count", "分享数", "INT UNSIGNED", "", "是", "默认0"],
    ["status", "状态", "ENUM('active', 'hidden', 'deleted')", "", "是", "默认active"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 商品表
addTableSchema(
  "商品表(products)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["product_id", "商品ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["title", "标题", "VARCHAR(100)", "", "否", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["price", "价格", "DECIMAL(10,2)", "", "否", ""],
    ["original_price", "原价", "DECIMAL(10,2)", "", "是", ""],
    ["category", "类别", "VARCHAR(50)", "", "否", ""],
    ["condition_type", "商品状况", "ENUM('new', 'like_new', 'good', 'fair', 'poor')", "", "否", ""],
    ["location", "位置", "VARCHAR(100)", "", "是", ""],
    ["is_negotiable", "是否可议价", "BOOLEAN", "", "是", "默认FALSE"],
    ["is_sold", "是否已售出", "BOOLEAN", "", "是", "默认FALSE"],
    ["view_count", "浏览次数", "INT UNSIGNED", "", "是", "默认0"],
    ["status", "状态", "ENUM('active', 'reserved', 'sold', 'expired', 'deleted')", "", "是", "默认active"],
    ["expired_at", "过期时间", "DATETIME", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 评论表
addTableSchema(
  "评论表(comments)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["comment_id", "评论ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["content_type", "内容类型", "ENUM('post', 'product', 'mission', 'activity')", "", "否", ""],
    ["content_id", "内容ID", "BIGINT UNSIGNED", "", "否", ""],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["parent_id", "父评论ID", "BIGINT UNSIGNED", "外键", "是", "关联自身，用于回复"],
    ["content", "内容", "TEXT", "", "否", ""],
    ["like_count", "点赞数", "INT UNSIGNED", "", "是", "默认0"],
    ["status", "状态", "ENUM('active', 'hidden', 'deleted')", "", "是", "默认active"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 活动表
addTableSchema(
  "活动表(activities)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["activity_id", "活动ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["title", "标题", "VARCHAR(100)", "", "否", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["organizer_type", "组织者类型", "ENUM('school', 'faculty', 'club', 'user')", "", "否", ""],
    ["organizer_id", "组织者ID", "BIGINT UNSIGNED", "", "否", ""],
    ["location", "位置", "VARCHAR(100)", "", "是", ""],
    ["start_time", "开始时间", "DATETIME", "", "否", ""],
    ["end_time", "结束时间", "DATETIME", "", "否", ""],
    ["max_participants", "最大参与人数", "INT UNSIGNED", "", "是", ""],
    ["current_participants", "当前参与人数", "INT UNSIGNED", "", "是", "默认0"],
    ["registration_deadline", "报名截止时间", "DATETIME", "", "是", ""],
    ["category", "类别", "VARCHAR(50)", "", "是", ""],
    ["poster_url", "海报URL", "VARCHAR(255)", "", "是", ""],
    ["status", "状态", "ENUM('upcoming', 'ongoing', 'ended', 'canceled')", "", "是", "默认upcoming"],
    ["visibility", "可见性", "ENUM('public', 'school', 'invite_only')", "", "是", "默认public"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 账户表
addTableSchema(
  "账户表(accounts)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["account_id", "账户ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["balance", "余额", "DECIMAL(10,2)", "", "否", "默认0.00"],
    ["frozen_amount", "冻结金额", "DECIMAL(10,2)", "", "否", "默认0.00"],
    ["total_income", "总收入", "DECIMAL(10,2)", "", "否", "默认0.00"],
    ["total_expense", "总支出", "DECIMAL(10,2)", "", "否", "默认0.00"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 交易表
addTableSchema(
  "交易表(transactions)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["transaction_id", "交易ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["transaction_type", "交易类型", "ENUM('deposit', 'withdraw', 'payment', 'refund', 'reward', 'mission', 'system')", "", "否", ""],
    ["amount", "金额", "DECIMAL(10,2)", "", "否", ""],
    ["status", "状态", "ENUM('pending', 'completed', 'failed', 'canceled')", "", "是", "默认pending"],
    ["reference_id", "参考ID", "VARCHAR(100)", "", "是", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 公告表
addTableSchema(
  "公告表(announcements)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["announcement_id", "公告ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["club_id", "社团ID", "BIGINT UNSIGNED", "外键", "是", "关联clubs表"],
    ["school_id", "学校ID", "BIGINT UNSIGNED", "外键", "是", "关联schools表"],
    ["publisher_id", "发布者ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["title", "标题", "VARCHAR(100)", "", "否", ""],
    ["content", "内容", "TEXT", "", "否", ""],
    ["visibility", "可见性", "ENUM('public', 'club', 'school')", "", "是", "默认public"],
    ["status", "状态", "ENUM('active', 'archived', 'deleted')", "", "是", "默认active"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 公告媒体表
addTableSchema(
  "公告媒体表(announcement_media)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["media_id", "媒体ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["announcement_id", "公告ID", "BIGINT UNSIGNED", "外键", "否", "关联announcements表"],
    ["media_type", "媒体类型", "ENUM('image', 'video', 'document')", "", "否", ""],
    ["media_url", "媒体URL", "VARCHAR(255)", "", "否", ""],
    ["display_order", "显示顺序", "TINYINT UNSIGNED", "", "是", "默认0"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 验证请求表
addTableSchema(
  "验证请求表(verification_requests)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["request_id", "请求ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["school_id", "学校ID", "BIGINT UNSIGNED", "外键", "否", "关联schools表"],
    ["status", "状态", "ENUM('pending', 'approved', 'rejected', 'needs_more_info')", "", "是", "默认pending"],
    ["rejection_reason", "拒绝原因", "TEXT", "", "是", ""],
    ["needs_additional_docs", "需要额外文档", "BOOLEAN", "", "是", "默认FALSE"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 验证文档表
addTableSchema(
  "验证文档表(verification_documents)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["document_id", "文档ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["request_id", "请求ID", "BIGINT UNSIGNED", "外键", "否", "关联verification_requests表"],
    ["document_type", "文档类型", "ENUM('student_card', 'school_letter', 'id_card', 'other')", "", "否", ""],
    ["document_url", "文档URL", "VARCHAR(255)", "", "否", ""],
    ["is_verified", "已验证", "BOOLEAN", "", "是", "默认FALSE"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 系统指标表
addTableSchema(
  "系统指标表(system_metrics)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["metric_id", "指标ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["metric_name", "指标名称", "VARCHAR(100)", "", "否", ""],
    ["metric_value", "指标值", "VARCHAR(255)", "", "否", ""],
    ["metric_unit", "指标单位", "VARCHAR(50)", "", "是", ""],
    ["collected_at", "收集时间", "DATETIME", "", "否", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 系统日志表
addTableSchema(
  "系统日志表(system_logs)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["log_id", "日志ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["log_level", "日志级别", "ENUM('info', 'warning', 'error', 'critical')", "", "否", ""],
    ["source", "来源", "VARCHAR(100)", "", "否", ""],
    ["message", "消息", "TEXT", "", "否", ""],
    ["stack_trace", "堆栈跟踪", "TEXT", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 角色表
addTableSchema(
  "角色表(roles)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["role_id", "角色ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["role_name", "角色名称", "VARCHAR(50)", "", "否", "唯一"],
    ["description", "描述", "TEXT", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 权限表
addTableSchema(
  "权限表(permissions)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["permission_id", "权限ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["permission_name", "权限名称", "VARCHAR(100)", "", "否", "唯一"],
    ["resource", "资源", "VARCHAR(50)", "", "否", ""],
    ["action", "操作", "ENUM('read', 'create', 'update', 'delete', 'manage')", "", "否", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 用户角色关联表
addTableSchema(
  "用户角色关联表(user_roles)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["user_role_id", "用户角色ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["user_id", "用户ID", "BIGINT UNSIGNED", "外键", "否", "关联users表"],
    ["role_id", "角色ID", "BIGINT UNSIGNED", "外键", "否", "关联roles表"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 角色权限关联表
addTableSchema(
  "角色权限关联表(role_permissions)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["role_permission_id", "角色权限ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["role_id", "角色ID", "BIGINT UNSIGNED", "外键", "否", "关联roles表"],
    ["permission_id", "权限ID", "BIGINT UNSIGNED", "外键", "否", "关联permissions表"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 配置类别表
addTableSchema(
  "配置类别表(config_categories)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["category_id", "类别ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["category_name", "类别名称", "VARCHAR(100)", "", "否", "唯一"],
    ["description", "描述", "TEXT", "", "是", ""],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 系统配置表
addTableSchema(
  "系统配置表(system_configs)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["config_id", "配置ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["category_id", "类别ID", "BIGINT UNSIGNED", "外键", "否", "关联config_categories表"],
    ["config_key", "配置键", "VARCHAR(100)", "", "否", "唯一"],
    ["config_value", "配置值", "VARCHAR(255)", "", "否", ""],
    ["description", "描述", "TEXT", "", "是", ""],
    ["config_type", "配置类型", "ENUM('string', 'number', 'boolean', 'json')", "", "是", "默认string"],
    ["created_at", "创建时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
    ["updated_at", "更新时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP ON UPDATE"],
  ]
);

// 配置变更日志表
addTableSchema(
  "配置变更日志表(config_change_logs)",
  [
    ["字段名", "字段描述", "数据类型", "标识", "是否为空", "备注"],
    ["log_id", "日志ID", "BIGINT UNSIGNED", "主键", "否", "自增"],
    ["config_id", "配置ID", "BIGINT UNSIGNED", "外键", "否", "关联system_configs表"],
    ["admin_id", "管理员ID", "BIGINT UNSIGNED", "", "否", ""],
    ["old_value", "旧值", "VARCHAR(255)", "", "是", ""],
    ["new_value", "新值", "VARCHAR(255)", "", "否", ""],
    ["change_reason", "变更原因", "TEXT", "", "是", ""],
    ["changed_at", "变更时间", "TIMESTAMP", "", "是", "默认CURRENT_TIMESTAMP"],
  ]
);

// 将文档保存为Word文件
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("数据库表结构.docx", buffer);
  console.log("数据库表结构文档已生成，文件名为: 数据库表结构.docx");
});

// 添加表格函数
function addTableSchema(tableName, rows) {
  // 创建表格数据
  const tableRows = rows.map((row) => {
    return new TableRow({
      children: row.map((cell, i) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell || "",
                  bold: i === 0 || rows.indexOf(row) === 0,
                  font: "Times New Roman",
                  size: 20,
                }),
              ],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
          },
        });
      }),
    });
  });

  // 添加表格标题和表格
  doc.addSection({
    children: [
      new Paragraph({
        text: tableName,
        heading: HeadingLevel.HEADING_2,
      }),
      new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: "%",
        },
      }),
      new Paragraph(""), // 添加一个空行
    ],
  });
} 