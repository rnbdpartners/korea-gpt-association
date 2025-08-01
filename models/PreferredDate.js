const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PreferredDate = sequelize.define('PreferredDate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    educationRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'education_request_id',
      references: {
        model: 'education_requests',
        key: 'id'
      }
    },
    preferredDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'preferred_date'
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3]]
      }
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_selected'
    }
  }, {
    tableName: 'preferred_dates',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['preferred_date'] },
      { fields: ['education_request_id', 'priority'], unique: true }
    ]
  });

  PreferredDate.associate = (models) => {
    PreferredDate.belongsTo(models.EducationRequest, {
      foreignKey: 'education_request_id',
      as: 'educationRequest'
    });
  };

  return PreferredDate;
};