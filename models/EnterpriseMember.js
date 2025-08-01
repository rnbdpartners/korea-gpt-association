const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EnterpriseMember = sequelize.define('EnterpriseMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    managerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'manager_name'
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^[0-9-]+$/
      }
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'company_name'
    },
    businessNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'business_number'
    },
    industry: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    employeeCount: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'employee_count'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'enterprise_members',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['company_name'] },
      { fields: ['business_number'] }
    ]
  });

  EnterpriseMember.associate = (models) => {
    EnterpriseMember.hasMany(models.EducationRequest, {
      foreignKey: 'enterprise_member_id',
      as: 'educationRequests'
    });
  };

  return EnterpriseMember;
};