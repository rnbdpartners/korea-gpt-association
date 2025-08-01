const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InstructorAssignment = sequelize.define('InstructorAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    confirmedScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'confirmed_schedule_id',
      references: {
        model: 'confirmed_schedules',
        key: 'id'
      }
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'instructor_id',
      references: {
        model: 'instructors',
        key: 'id'
      }
    },
    assignmentType: {
      type: DataTypes.ENUM('main', 'assistant'),
      defaultValue: 'main',
      field: 'assignment_type'
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'assigned_at'
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_by',
      references: {
        model: 'enterprise_members',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'instructor_assignments',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['instructor_id'] },
      { fields: ['assignment_type'] },
      { fields: ['confirmed_schedule_id', 'instructor_id'], unique: true }
    ]
  });

  InstructorAssignment.associate = (models) => {
    InstructorAssignment.belongsTo(models.ConfirmedSchedule, {
      foreignKey: 'confirmed_schedule_id',
      as: 'confirmedSchedule'
    });
    InstructorAssignment.belongsTo(models.Instructor, {
      foreignKey: 'instructor_id',
      as: 'instructor'
    });
    InstructorAssignment.belongsTo(models.EnterpriseMember, {
      foreignKey: 'assigned_by',
      as: 'assignedByMember'
    });
  };

  return InstructorAssignment;
};