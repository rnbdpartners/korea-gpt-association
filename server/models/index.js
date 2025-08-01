const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models from the parent directory
const models = {
  EnterpriseMember: require('../../models/EnterpriseMember')(sequelize),
  EducationProgram: require('../../models/EducationProgram')(sequelize),
  EducationRequest: require('../../models/EducationRequest')(sequelize),
  PreferredDate: require('../../models/PreferredDate')(sequelize),
  ConfirmedSchedule: require('../../models/ConfirmedSchedule')(sequelize),
  SubmittedDocument: require('../../models/SubmittedDocument')(sequelize),
  Instructor: require('../../models/Instructor')(sequelize),
  InstructorAvailability: require('../../models/InstructorAvailability')(sequelize),
  InstructorAssignment: require('../../models/InstructorAssignment')(sequelize),
  InstructorLectureHistory: require('../../models/InstructorLectureHistory')(sequelize),
  InstructorSpecialty: require('../../models/InstructorSpecialty')(sequelize),
  InstructorBlackoutDate: require('../../models/InstructorBlackoutDate')(sequelize)
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};