const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const models = {
  EnterpriseMember: require('./EnterpriseMember')(sequelize),
  EducationProgram: require('./EducationProgram')(sequelize),
  EducationRequest: require('./EducationRequest')(sequelize),
  PreferredDate: require('./PreferredDate')(sequelize),
  ConfirmedSchedule: require('./ConfirmedSchedule')(sequelize),
  SubmittedDocument: require('./SubmittedDocument')(sequelize),
  Instructor: require('./Instructor')(sequelize),
  InstructorAvailability: require('./InstructorAvailability')(sequelize),
  InstructorAssignment: require('./InstructorAssignment')(sequelize),
  InstructorLectureHistory: require('./InstructorLectureHistory')(sequelize),
  InstructorSpecialty: require('./InstructorSpecialty')(sequelize),
  InstructorBlackoutDate: require('./InstructorBlackoutDate')(sequelize)
};

// 관계 설정
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};