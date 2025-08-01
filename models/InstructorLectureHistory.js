const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InstructorLectureHistory = sequelize.define('InstructorLectureHistory', {
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
    educationRequestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'education_request_id',
      references: {
        model: 'education_requests',
        key: 'id'
      }
    },
    lectureDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'lecture_date'
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
    actualParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'actual_participants'
    },
    satisfactionScore: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: 'satisfaction_score',
      validate: {
        min: 0,
        max: 5
      }
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'payment_amount'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      defaultValue: 'pending',
      field: 'payment_status'
    }
  }, {
    tableName: 'instructor_lecture_history',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
    indexes: [
      { fields: ['instructor_id'] },
      { fields: ['lecture_date'] },
      { fields: ['payment_status'] }
    ]
  });

  InstructorLectureHistory.associate = (models) => {
    InstructorLectureHistory.belongsTo(models.Instructor, {
      foreignKey: 'instructor_id',
      as: 'instructor'
    });
    InstructorLectureHistory.belongsTo(models.EducationRequest, {
      foreignKey: 'education_request_id',
      as: 'educationRequest'
    });
  };

  // 클래스 메소드
  InstructorLectureHistory.calculateInstructorStats = async function(instructorId, startDate, endDate) {
    const stats = await this.findAll({
      where: {
        instructor_id: instructorId,
        lecture_date: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalLectures'],
        [sequelize.fn('SUM', sequelize.col('actual_participants')), 'totalParticipants'],
        [sequelize.fn('AVG', sequelize.col('satisfaction_score')), 'avgSatisfaction'],
        [sequelize.fn('SUM', sequelize.col('payment_amount')), 'totalEarnings']
      ],
      raw: true
    });

    return stats[0];
  };

  return InstructorLectureHistory;
};