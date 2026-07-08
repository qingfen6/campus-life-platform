const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Faculty = sequelize.define('Faculty', {
    faculty_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    school_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    faculty_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    faculty_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    director: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    faculty_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    founding_year: {
      type: DataTypes.INTEGER, // Assuming YEAR is stored as INTEGER
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
    // createdAt and updatedAt are handled by Sequelize by default
  }, {
    tableName: 'faculties',
    timestamps: true,
    // underscored: true, // If your table uses snake_case for createdAt/updatedAt
  });

  // Faculty.associate = (models) => {
  //   Faculty.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
  //   Faculty.hasMany(models.User, { foreignKey: 'faculty_id', as: 'users' });
  // };

  return Faculty;
}; 