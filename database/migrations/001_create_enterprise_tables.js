const createEnterpriseTables = {
  up: async (queryInterface, Sequelize) => {
    // 기업 회원 테이블
    await queryInterface.createTable('enterprise_members', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      manager_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      position: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      business_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      industry: Sequelize.STRING(50),
      employee_count: Sequelize.STRING(20),
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    // 교육 프로그램 테이블
    await queryInterface.createTable('education_programs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      program_code: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      program_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: Sequelize.TEXT,
      price_per_person: Sequelize.DECIMAL(10, 2),
      duration: Sequelize.STRING(50),
      program_level: {
        type: Sequelize.ENUM('basic', 'intermediate', 'advanced', 'custom'),
        allowNull: false
      },
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

    // 교육 신청 테이블
    await queryInterface.createTable('education_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      request_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      enterprise_member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'enterprise_members',
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
      participants_count: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      education_type: {
        type: Sequelize.ENUM('offline', 'online', 'hybrid'),
        allowNull: false
      },
      duration: Sequelize.STRING(50),
      special_request: Sequelize.TEXT,
      estimated_amount: Sequelize.DECIMAL(12, 2),
      status: {
        type: Sequelize.ENUM('pending', 'quote_sent', 'date_selecting', 'confirmed', 'document_pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
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

    // 희망 교육 날짜 테이블
    await queryInterface.createTable('preferred_dates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      education_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'education_requests',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      preferred_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[1, 2, 3]]
        }
      },
      is_selected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 확정된 교육 일정 테이블
    await queryInterface.createTable('confirmed_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      education_request_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        references: {
          model: 'education_requests',
          key: 'id'
        }
      },
      confirmed_date: {
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
      location: Sequelize.STRING(500),
      online_link: Sequelize.STRING(500),
      instructor_name: Sequelize.STRING(100),
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
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

    // 제출 서류 테이블
    await queryInterface.createTable('submitted_documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      education_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'education_requests',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      document_type: {
        type: Sequelize.ENUM('business_license', 'tax_invoice', 'contract', 'other'),
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      file_size: Sequelize.INTEGER,
      mime_type: Sequelize.STRING(100),
      tax_email: Sequelize.STRING(255),
      notes: Sequelize.TEXT,
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 인덱스 추가
    await queryInterface.addIndex('enterprise_members', ['email']);
    await queryInterface.addIndex('enterprise_members', ['company_name']);
    await queryInterface.addIndex('enterprise_members', ['business_number']);
    await queryInterface.addIndex('education_requests', ['request_number']);
    await queryInterface.addIndex('education_requests', ['status']);
    await queryInterface.addIndex('education_requests', ['created_at']);
    await queryInterface.addIndex('preferred_dates', ['preferred_date']);
    await queryInterface.addIndex('confirmed_schedules', ['confirmed_date']);
    await queryInterface.addIndex('confirmed_schedules', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('submitted_documents');
    await queryInterface.dropTable('confirmed_schedules');
    await queryInterface.dropTable('preferred_dates');
    await queryInterface.dropTable('education_requests');
    await queryInterface.dropTable('education_programs');
    await queryInterface.dropTable('enterprise_members');
  }
};

module.exports = createEnterpriseTables;