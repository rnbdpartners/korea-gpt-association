const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubmittedDocument = sequelize.define('SubmittedDocument', {
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
    documentType: {
      type: DataTypes.ENUM('business_license', 'tax_invoice', 'contract', 'other'),
      allowNull: false,
      field: 'document_type'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name'
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size'
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'mime_type'
    },
    taxEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'tax_email',
      validate: {
        isEmail: true
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'uploaded_at'
    }
  }, {
    tableName: 'submitted_documents',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['document_type'] },
      { fields: ['uploaded_at'] }
    ]
  });

  SubmittedDocument.associate = (models) => {
    SubmittedDocument.belongsTo(models.EducationRequest, {
      foreignKey: 'education_request_id',
      as: 'educationRequest',
      onDelete: 'CASCADE'
    });
  };

  return SubmittedDocument;
};