const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InstructorSpecialty = sequelize.define('InstructorSpecialty', {
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
    programId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'program_id',
      references: {
        model: 'education_programs',
        key: 'id'
      }
    },
    proficiencyLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'expert'),
      defaultValue: 'intermediate',
      field: 'proficiency_level'
    },
    yearsExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'years_experience'
    },
    certification: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'instructor_specialties',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
    indexes: [
      { fields: ['instructor_id', 'program_id'], unique: true }
    ]
  });

  InstructorSpecialty.associate = (models) => {
    InstructorSpecialty.belongsTo(models.Instructor, {
      foreignKey: 'instructor_id',
      as: 'instructor'
    });
    InstructorSpecialty.belongsTo(models.EducationProgram, {
      foreignKey: 'program_id',
      as: 'program'
    });
  };

  return InstructorSpecialty;
};