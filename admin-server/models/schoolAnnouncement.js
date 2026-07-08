const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SchoolAnnouncement = sequelize.define('SchoolAnnouncement', {
    announcement_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    school_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    faculty_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    publisher_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    announcement_type: {
      type: DataTypes.ENUM(
        'general',        // 普通通知
        'academic',       // 教务教学
        'event',          // 活动讲座
        'safety',         // 安全提示
        'recruitment',    // 招聘信息 (学校层面)
        'policy'          // 政策规定
      ),
      allowNull: false,
      defaultValue: 'general',
    },
    visibility: {
      type: DataTypes.ENUM(
        'public',         // 对外公开
        'school_only',    // 仅校内可见
        'faculty_only'    // 仅指定学院可见 (需配合 faculty_id)
      ),
      allowNull: false,
      defaultValue: 'school_only',
    },
    attachment_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    publish_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'published',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  }, {
    tableName: 'school_announcements', // 明确指定表名
    timestamps: false, // 手动管理时间戳
    underscored: true, // 使用蛇形命名
  });

  return SchoolAnnouncement;
}; 