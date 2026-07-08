const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SchoolAdminAccount = sequelize.define('SchoolAdminAccount', {
    admin_account_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    school_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.CHAR(60),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'School Admin',
    },
    permissions: {
      type: DataTypes.TEXT,
      allowNull: true,
      // Consider DataTypes.JSONB for PostgreSQL or storing JSON strings
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'locked'),
      allowNull: true,
      defaultValue: 'active',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'school_admin_accounts', // 明确指定表名
    timestamps: false, // 手动管理时间戳
    underscored: true, // 使用蛇形命名
  });

  // 定义关联 (如果 School 模型存在且需要在这里定义关联)
  // SchoolAdminAccount.belongsTo(sequelize.models.School, { foreignKey: 'school_id' });
  // sequelize.models.School.hasMany(SchoolAdminAccount, { foreignKey: 'school_id', as: 'adminAccounts' });

  return SchoolAdminAccount;
}; 