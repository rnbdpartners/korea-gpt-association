const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Instructor = sequelize.define('Instructor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    instructorCode: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'instructor_code'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'birth_date'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^[0-9-]+$/
      }
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    carModel: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'car_model'
    },
    carNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'car_number'
    },
    signatureImagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'signature_image_path'
    },
    profileImagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'profile_image_path'
    },
    specialty: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'hourly_rate'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'instructors',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['email'] },
      { fields: ['is_active'] }
    ],
    hooks: {
      beforeCreate: async (instructor) => {
        // 자동으로 강사 코드 생성
        const count = await Instructor.count();
        instructor.instructorCode = `INST-${String(count + 1).padStart(3, '0')}`;
      }
    }
  });

  Instructor.associate = (models) => {
    Instructor.hasMany(models.InstructorAvailability, {
      foreignKey: 'instructor_id',
      as: 'availabilities'
    });
    Instructor.hasMany(models.InstructorAssignment, {
      foreignKey: 'instructor_id',
      as: 'assignments'
    });
    Instructor.hasMany(models.InstructorLectureHistory, {
      foreignKey: 'instructor_id',
      as: 'lectureHistory'
    });
    Instructor.hasMany(models.InstructorSpecialty, {
      foreignKey: 'instructor_id',
      as: 'specialties'
    });
    Instructor.hasMany(models.InstructorBlackoutDate, {
      foreignKey: 'instructor_id',
      as: 'blackoutDates'
    });
  };

  // 인스턴스 메소드
  Instructor.prototype.getAge = function() {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  Instructor.prototype.isAvailableOn = async function(date) {
    const blackout = await sequelize.models.InstructorBlackoutDate.findOne({
      where: {
        instructor_id: this.id,
        blackout_date: date
      }
    });
    
    if (blackout) return false;
    
    const availability = await sequelize.models.InstructorAvailability.findOne({
      where: {
        instructor_id: this.id,
        available_date: date,
        is_available: true
      }
    });
    
    return !!availability;
  };

  return Instructor;
};