// 데이터베이스 초기화 스크립트
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  let connection;
  
  try {
    // MySQL 연결 (데이터베이스 없이)
    console.log('MySQL 연결 중...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    // 데이터베이스 생성
    console.log('데이터베이스 생성 중...');
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'korea_gpt_association'} 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    
    // 데이터베이스 선택
    await connection.execute(`USE ${process.env.DB_NAME || 'korea_gpt_association'}`);
    
    // 테스트 데이터 생성
    console.log('테스트 계정 생성 중...');
    
    // enterprise@demo.com의 비밀번호 해시
    const demoPassword = await bcrypt.hash('demo123', 10);
    console.log('demo123의 해시:', demoPassword);
    
    console.log('\n=== 데이터베이스 초기화 완료 ===');
    console.log('다음 명령어로 스키마를 적용하세요:');
    console.log(`mysql -u ${process.env.DB_USER || 'root'} -p ${process.env.DB_NAME || 'korea_gpt_association'} < ../database/schema.sql`);
    console.log('\n그 다음 서버를 시작하세요:');
    console.log('npm start');
    
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();