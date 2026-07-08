const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    post_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true // Content can be primarily media
    },
    post_type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'link', 'mixed'),
      allowNull: false
    },
    visibility: {
      type: DataTypes.ENUM('public', 'school', 'private'),
      defaultValue: 'public'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    like_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    comment_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    share_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'hidden', 'deleted'),
      defaultValue: 'active'
    }
    // created_at and updated_at are handled by Sequelize by default (timestamps: true)
  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['created_at'] }
    ]
  });

  Post.associate = (models) => {
    // A post belongs to a user
    if (models.User) {
      Post.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user' // Alias for the association
      });
    }
    // A post can have many media items
    if (models.PostMedia) {
      Post.hasMany(models.PostMedia, {
        foreignKey: 'post_id',
        as: 'media' // Alias for the association
      });
    }
  };

  return Post;
}; 