const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostMedia = sequelize.define('PostMedia', {
    media_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    post_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    media_type: {
      type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
      allowNull: false
    },
    media_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    display_order: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 0
    }
    // created_at is handled by Sequelize by default (timestamps: true, but we might only want createdAt)
  }, {
    tableName: 'post_media',
    timestamps: true, // Enables createdAt and updatedAt
    updatedAt: false, // We might not need updatedAt for media if they are immutable once created
    underscored: true,
    indexes: [
      { fields: ['post_id'] }
    ]
  });

  PostMedia.associate = (models) => {
    // A media item belongs to a post
    if (models.Post) {
      PostMedia.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post'
      });
    }
  };

  return PostMedia;
}; 