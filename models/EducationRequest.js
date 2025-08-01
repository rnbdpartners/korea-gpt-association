const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EducationRequest = sequelize.define('EducationRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requestNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'request_number'
    },
    enterpriseMemberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'enterprise_member_id',
      references: {
        model: 'enterprise_members',
        key: 'id'
      }
    },
    programId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'program_id',
      references: {
        model: 'education_programs',
        key: 'id'
      }
    },
    participantsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'participants_count',
      validate: {
        min: 1
      }
    },
    educationType: {
      type: DataTypes.ENUM('offline', 'online', 'hybrid'),
      allowNull: false,
      field: 'education_type'
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    specialRequest: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'special_request'
    },
    estimatedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'estimated_amount'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'quote_sent',
        'date_selecting',
        'confirmed',
        'document_pending',
        'completed',
        'cancelled'
      ),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'education_requests',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['request_number'] },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ],
    hooks: {
      beforeCreate: async (request) => {
        // 자동으로 신청번호 생성
        const year = new Date().getFullYear();
        const count = await EducationRequest.count({
          where: sequelize.where(
            sequelize.fn('YEAR', sequelize.col('created_at')),
            year
          )
        });
        request.requestNumber = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  });

  EducationRequest.associate = (models) => {
    EducationRequest.belongsTo(models.EnterpriseMember, {
      foreignKey: 'enterprise_member_id',
      as: 'enterpriseMember'
    });
    EducationRequest.belongsTo(models.EducationProgram, {
      foreignKey: 'program_id',
      as: 'program'
    });
    EducationRequest.hasMany(models.PreferredDate, {
      foreignKey: 'education_request_id',
      as: 'preferredDates'
    });
    EducationRequest.hasOne(models.ConfirmedSchedule, {
      foreignKey: 'education_request_id',
      as: 'confirmedSchedule'
    });
    EducationRequest.hasMany(models.SubmittedDocument, {
      foreignKey: 'education_request_id',
      as: 'documents'
    });
  };

  return EducationRequest;
};