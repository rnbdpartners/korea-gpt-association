const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InstructorAvailability = sequelize.define('InstructorAvailability', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    availableDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'available_date'
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
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
    },
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    tableName: 'instructor_availability',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['available_date'] },
      { fields: ['instructor_id', 'available_date'] },
      { fields: ['instructor_id', 'available_date', 'start_time'], unique: true }
    ]
  });

  InstructorAvailability.associate = (models) => {
    InstructorAvailability.belongsTo(models.Instructor, {
      foreignKey: 'instructor_id',
      as: 'instructor'
    });
  };

  return InstructorAvailability;
};