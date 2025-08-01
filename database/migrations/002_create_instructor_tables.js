const createInstructorTables = {
  up: async (queryInterface, Sequelize) => {
    // 강사 정보 테이블
    await queryInterface.createTable('instructors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      instructor_code: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      car_model: Sequelize.STRING(100),
      car_number: Sequelize.STRING(50),
      signature_image_path: Sequelize.STRING(500),
      profile_image_path: Sequelize.STRING(500),
      specialty: Sequelize.STRING(200),
      bio: Sequelize.TEXT,
      hourly_rate: Sequelize.DECIMAL(10, 2),
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 강사 가능 일정 테이블
    await queryInterface.createTable('instructor_availability', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'instructors',
          key: 'id'
        }
      },
      available_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      notes: Sequelize.STRING(500),
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 강사 배정 테이블
    await queryInterface.createTable('instructor_assignments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      confirmed_schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'confirmed_schedules',
          key: 'id'
        }
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'instructors',
          key: 'id'
        }
      },
      assignment_type: {
        type: Sequelize.ENUM('main', 'assistant'),
        defaultValue: 'main'
      },
      assigned_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      assigned_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'enterprise_members',
          key: 'id'
        }
      },
      notes: Sequelize.TEXT
    });

    // 강사 강의 이력 테이블
    await queryInterface.createTable('instructor_lecture_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'instructors',
          key: 'id'
        }
      },
      education_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'education_requests',
          key: 'id'
        }
      },
      lecture_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      actual_participants: Sequelize.INTEGER,
      satisfaction_score: Sequelize.DECIMAL(3, 2),
      feedback: Sequelize.TEXT,
      payment_amount: Sequelize.DECIMAL(10, 2),
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 강사 전문 분야 테이블
    await queryInterface.createTable('instructor_specialties', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'instructors',
          key: 'id'
        }
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'education_programs',
          key: 'id'
        }
      },
      proficiency_level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'expert'),
        defaultValue: 'intermediate'
      },
      years_experience: Sequelize.INTEGER,
      certification: Sequelize.STRING(200),
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 강사 블랙아웃 날짜 테이블
    await queryInterface.createTable('instructor_blackout_dates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'instructors',
          key: 'id'
        }
      },
      blackout_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      reason: Sequelize.STRING(200),
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // confirmed_schedules 테이블에서 instructor_name 컬럼 제거
    await queryInterface.removeColumn('confirmed_schedules', 'instructor_name');

    // 인덱스 추가
    await queryInterface.addIndex('instructors', ['name']);
    await queryInterface.addIndex('instructors', ['email']);
    await queryInterface.addIndex('instructors', ['is_active']);
    await queryInterface.addIndex('instructor_availability', ['available_date']);
    await queryInterface.addIndex('instructor_availability', ['instructor_id', 'available_date']);
    await queryInterface.addIndex('instructor_availability', ['instructor_id', 'available_date', 'start_time'], {
      unique: true
    });
    await queryInterface.addIndex('instructor_assignments', ['instructor_id']);
    await queryInterface.addIndex('instructor_assignments', ['assignment_type']);
    await queryInterface.addIndex('instructor_assignments', ['confirmed_schedule_id', 'instructor_id'], {
      unique: true
    });
    await queryInterface.addIndex('instructor_lecture_history', ['instructor_id']);
    await queryInterface.addIndex('instructor_lecture_history', ['lecture_date']);
    await queryInterface.addIndex('instructor_lecture_history', ['payment_status']);
    await queryInterface.addIndex('instructor_specialties', ['instructor_id', 'program_id'], {
      unique: true
    });
    await queryInterface.addIndex('instructor_blackout_dates', ['blackout_date']);
    await queryInterface.addIndex('instructor_blackout_dates', ['instructor_id', 'blackout_date'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // confirmed_schedules 테이블에 instructor_name 컬럼 다시 추가
    await queryInterface.addColumn('confirmed_schedules', 'instructor_name', {
      type: Sequelize.STRING(100)
    });

    // 테이블 삭제
    await queryInterface.dropTable('instructor_blackout_dates');
    await queryInterface.dropTable('instructor_specialties');
    await queryInterface.dropTable('instructor_lecture_history');
    await queryInterface.dropTable('instructor_assignments');
    await queryInterface.dropTable('instructor_availability');
    await queryInterface.dropTable('instructors');
  }
};

module.exports = createInstructorTables;