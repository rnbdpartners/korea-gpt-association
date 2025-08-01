const bcrypt = require('bcryptjs');
const { 
  EducationProgram, 
  Instructor, 
  EnterpriseMember 
} = require('../models');

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Seed education programs
    const programs = [
      {
        programCode: 'BASIC-001',
        programName: 'ChatGPT 기초 과정',
        description: 'AI 기초 이해와 ChatGPT 활용법',
        pricePerPerson: 200000,
        duration: '1일 (8시간)',
        programLevel: 'basic'
      },
      {
        programCode: 'INTER-001',
        programName: '업무 자동화 과정',
        description: '실무 적용 가능한 자동화 스킬',
        pricePerPerson: 350000,
        duration: '2일 (16시간)',
        programLevel: 'intermediate'
      },
      {
        programCode: 'ADV-001',
        programName: 'AI 전문가 과정',
        description: '고급 AI 활용 및 전략 수립',
        pricePerPerson: 500000,
        duration: '3일 (24시간)',
        programLevel: 'advanced'
      },
      {
        programCode: 'CUSTOM-001',
        programName: '맞춤형 교육',
        description: '기업 니즈에 맞춘 커스텀 교육',
        pricePerPerson: null,
        duration: '협의',
        programLevel: 'custom'
      }
    ];

    for (const program of programs) {
      await EducationProgram.findOrCreate({
        where: { programCode: program.programCode },
        defaults: program
      });
    }

    // Seed instructors
    const instructors = [
      {
        name: '김철수',
        birthDate: '1985-03-15',
        phone: '010-1234-5678',
        email: 'kimcs@example.com',
        carModel: 'SM5',
        carNumber: '12가3456',
        specialty: 'ChatGPT 기초 및 중급',
        bio: '10년 경력의 AI 교육 전문가',
        hourlyRate: 150000
      },
      {
        name: '이영희',
        birthDate: '1990-07-22',
        phone: '010-2345-6789',
        email: 'leeyh@example.com',
        carModel: 'K5',
        carNumber: '34나5678',
        specialty: '업무 자동화 전문',
        bio: '기업 업무 자동화 컨설팅 전문가',
        hourlyRate: 180000
      },
      {
        name: '박민수',
        birthDate: '1988-11-30',
        phone: '010-3456-7890',
        email: 'parkms@example.com',
        carModel: '소나타',
        carNumber: '56다7890',
        specialty: 'AI 전략 및 고급 과정',
        bio: 'AI 전략 기획 및 고급 활용법 전문',
        hourlyRate: 200000
      }
    ];

    for (const instructor of instructors) {
      await Instructor.findOrCreate({
        where: { email: instructor.email },
        defaults: instructor
      });
    }

    // Seed test enterprise member
    const hashedPassword = await bcrypt.hash('test123!', 10);
    await EnterpriseMember.findOrCreate({
      where: { email: 'test@company.com' },
      defaults: {
        email: 'test@company.com',
        password: hashedPassword,
        managerName: '홍길동',
        position: '교육담당자',
        phone: '02-1234-5678',
        companyName: '테스트기업',
        businessNumber: '123-45-67890',
        industry: 'it',
        employeeCount: '51-200'
      }
    });

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();