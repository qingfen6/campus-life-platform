const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.CHAR(60),
      allowNull: false // In a real app, ensure this is handled securely
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    real_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'undisclosed'),
      defaultValue: 'undisclosed'
    },
    birth_date: {
      type: DataTypes.DATEONLY, // Use DATEONLY for just the date part
      allowNull: true
    },
    school_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true // Or false if it's mandatory for all users
    },
    faculty_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    student_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    enrollment_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      defaultValue: 'active'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
    // createdAt and updatedAt are handled by Sequelize by default if timestamps: true (default)
  }, {
    tableName: 'users', // Explicitly define table name
    timestamps: true, // Sequelize will manage createdAt and updatedAt
    // If your table names are snake_case, and you want models to be camelCase,
    // you might want underscored: true, but here User model fields are already snake_case
    // underscored: true, 
    
    // Define indexes based on 库.md if needed, though some are implicit
    // indexes: [
    //   { fields: ['school_id'] },
    //   { fields: ['faculty_id'] }
    // ]
  });

  // Define associations here if you have other models (e.g., Faculty, School)
  User.associate = (models) => {
    // if (models.School) { // Check if School model is passed
    //   User.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
    // }
    if (models.Faculty) { // Check if Faculty model is passed
      User.belongsTo(models.Faculty, { foreignKey: 'faculty_id', as: 'faculty' });
    }
    // A user can have many posts
    if (models.Post) { // Check if Post model is passed
      User.hasMany(models.Post, {
        foreignKey: 'user_id',
        as: 'posts' // Alias for the association
      });
    }
  };

  return User;
}; 