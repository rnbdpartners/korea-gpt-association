const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConfirmedSchedule = sequelize.define('ConfirmedSchedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    educationRequestId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      field: 'education_request_id',
      references: {
        model: 'education_requests',
        key: 'id'
      }
    },
    confirmedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'confirmed_date'
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'end_time'
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    onlineLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'online_link'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    }
  }, {
    tableName: 'confirmed_schedules',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['confirmed_date'] },
      { fields: ['status'] }
    ]
  });

  ConfirmedSchedule.associate = (models) => {
    ConfirmedSchedule.belongsTo(models.EducationRequest, {
      foreignKey: 'education_request_id',
      as: 'educationRequest'
    });
    ConfirmedSchedule.hasMany(models.InstructorAssignment, {
      foreignKey: 'confirmed_schedule_id',
      as: 'instructorAssignments'
    });
  };

  return ConfirmedSchedule;
};