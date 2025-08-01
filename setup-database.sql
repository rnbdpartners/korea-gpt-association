-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS korea_gpt_association CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 사용
USE korea_gpt_association;

-- 테스트용 기업 회원 데이터 추가
INSERT INTO enterprise_members (email, password, manager_name, position, phone, company_name, business_number, industry, employee_count) 
VALUES 
('enterprise@demo.com', '$2a$10$YourHashedPasswordHere', '김담당', '과장', '010-1234-5678', '데모기업', '123-45-67890', 'IT', '10-50')
ON DUPLICATE KEY UPDATE email = email;

-- 비밀번호는 서버에서 bcrypt로 해시해야 하므로, 서버의 seed 스크립트를 사용하세요