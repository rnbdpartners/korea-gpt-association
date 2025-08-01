const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InstructorBlackoutDate = sequelize.define('InstructorBlackoutDate', {
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
    blackoutDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'blackout_date'
    },
    reason: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'instructor_blackout_dates',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
    indexes: [
      { fields: ['blackout_date'] },
      { fields: ['instructor_id', 'blackout_date'], unique: true }
    ]
  });

  InstructorBlackoutDate.associate = (models) => {
    InstructorBlackoutDate.belongsTo(models.Instructor, {
      foreignKey: 'instructor_id',
      as: 'instructor'
    });
  };

  return InstructorBlackoutDate;
};