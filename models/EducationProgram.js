const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EducationProgram = sequelize.define('EducationProgram', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    programCode: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'program_code'
    },
    programName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'program_name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pricePerPerson: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'price_per_person'
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    programLevel: {
      type: DataTypes.ENUM('basic', 'intermediate', 'advanced', 'custom'),
      allowNull: false,
      field: 'program_level'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'education_programs',
    timestamps: true,
    underscored: true
  });

  EducationProgram.associate = (models) => {
    EducationProgram.hasMany(models.EducationRequest, {
      foreignKey: 'program_id',
      as: 'educationRequests'
    });
  };

  return EducationProgram;
};