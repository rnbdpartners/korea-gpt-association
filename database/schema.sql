-- 한국GPT협회 기업문의 데이터베이스 스키마
-- Database: korea_gpt_association

-- 기업 회원 테이블
CREATE TABLE enterprise_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    business_number VARCHAR(20) NOT NULL,
    industry VARCHAR(50),
    employee_count VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_company_name (company_name),
    INDEX idx_business_number (business_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 교육 프로그램 테이블
CREATE TABLE education_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    program_name VARCHAR(200) NOT NULL,
    description TEXT,
    price_per_person DECIMAL(10, 2),
    duration VARCHAR(50),
    program_level ENUM('basic', 'intermediate', 'advanced', 'custom') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 교육 신청 테이블
CREATE TABLE education_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    enterprise_member_id INT NOT NULL,
    program_id INT NOT NULL,
    participants_count INT NOT NULL,
    education_type ENUM('offline', 'online', 'hybrid') NOT NULL,
    duration VARCHAR(50),
    special_request TEXT,
    estimated_amount DECIMAL(12, 2),
    status ENUM('pending', 'quote_sent', 'date_selecting', 'confirmed', 'document_pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_member_id) REFERENCES enterprise_members(id),
    FOREIGN KEY (program_id) REFERENCES education_programs(id),
    INDEX idx_request_number (request_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 희망 교육 날짜 테이블
CREATE TABLE preferred_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    education_request_id INT NOT NULL,
    preferred_date DATE NOT NULL,
    priority INT NOT NULL CHECK (priority IN (1, 2, 3)),
    is_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request_priority (education_request_id, priority),
    INDEX idx_preferred_date (preferred_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 확정된 교육 일정 테이블
CREATE TABLE confirmed_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    education_request_id INT UNIQUE NOT NULL,
    confirmed_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(500),
    online_link VARCHAR(500),
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id),
    INDEX idx_confirmed_date (confirmed_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 제출 서류 테이블
CREATE TABLE submitted_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    education_request_id INT NOT NULL,
    document_type ENUM('business_license', 'tax_invoice', 'contract', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    tax_email VARCHAR(255),
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id) ON DELETE CASCADE,
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 교육 일정 변경 요청 테이블
CREATE TABLE schedule_change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    education_request_id INT NOT NULL,
    original_date DATE NOT NULL,
    reason TEXT,
    new_preferred_date1 DATE,
    new_preferred_date2 DATE,
    new_preferred_date3 DATE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_response TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 견적서 테이블
CREATE TABLE quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    education_request_id INT NOT NULL,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    base_amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    valid_until DATE,
    notes TEXT,
    status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id),
    INDEX idx_quotation_number (quotation_number),
    INDEX idx_status (status),
    INDEX idx_valid_until (valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 활동 로그 테이블 (감사 추적용)
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enterprise_member_id INT,
    education_request_id INT,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_member_id) REFERENCES enterprise_members(id),
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id),
    INDEX idx_enterprise_member_id (enterprise_member_id),
    INDEX idx_education_request_id (education_request_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 초기 교육 프로그램 데이터 삽입
INSERT INTO education_programs (program_code, program_name, description, price_per_person, duration, program_level) VALUES
('BASIC-001', 'ChatGPT 기초 과정', 'AI 기초 이해와 ChatGPT 활용법', 200000, '1일 (8시간)', 'basic'),
('INTER-001', '업무 자동화 과정', '실무 적용 가능한 자동화 스킬', 350000, '2일 (16시간)', 'intermediate'),
('ADV-001', 'AI 전문가 과정', '고급 AI 활용 및 전략 수립', 500000, '3일 (24시간)', 'advanced'),
('CUSTOM-001', '맞춤형 교육', '기업 니즈에 맞춘 커스텀 교육', NULL, '협의', 'custom');

-- 뷰 생성: 교육 신청 현황 요약
CREATE VIEW education_request_summary AS
SELECT 
    er.id,
    er.request_number,
    em.company_name,
    em.manager_name,
    ep.program_name,
    er.participants_count,
    er.education_type,
    er.status,
    cs.confirmed_date,
    er.created_at
FROM education_requests er
JOIN enterprise_members em ON er.enterprise_member_id = em.id
JOIN education_programs ep ON er.program_id = ep.id
LEFT JOIN confirmed_schedules cs ON er.id = cs.education_request_id
ORDER BY er.created_at DESC;

-- 강사 정보 테이블
CREATE TABLE instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    car_model VARCHAR(100),
    car_number VARCHAR(50),
    signature_image_path VARCHAR(500),
    profile_image_path VARCHAR(500),
    specialty VARCHAR(200),
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 강사 가능 일정 테이블 (강사가 강의 가능한 날짜/시간)
CREATE TABLE instructor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    UNIQUE KEY unique_instructor_date_time (instructor_id, available_date, start_time),
    INDEX idx_available_date (available_date),
    INDEX idx_instructor_date (instructor_id, available_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 강사 배정 테이블 (확정된 교육에 강사 배정)
CREATE TABLE instructor_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    confirmed_schedule_id INT NOT NULL,
    instructor_id INT NOT NULL,
    assignment_type ENUM('main', 'assistant') DEFAULT 'main',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    notes TEXT,
    FOREIGN KEY (confirmed_schedule_id) REFERENCES confirmed_schedules(id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    FOREIGN KEY (assigned_by) REFERENCES enterprise_members(id),
    UNIQUE KEY unique_schedule_instructor (confirmed_schedule_id, instructor_id),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_assignment_type (assignment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 강사 강의 이력 테이블
CREATE TABLE instructor_lecture_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    education_request_id INT NOT NULL,
    lecture_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    actual_participants INT,
    satisfaction_score DECIMAL(3, 2),
    feedback TEXT,
    payment_amount DECIMAL(10, 2),
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    FOREIGN KEY (education_request_id) REFERENCES education_requests(id),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_lecture_date (lecture_date),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 강사 전문 분야 테이블
CREATE TABLE instructor_specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    program_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'expert') DEFAULT 'intermediate',
    years_experience INT,
    certification VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    FOREIGN KEY (program_id) REFERENCES education_programs(id),
    UNIQUE KEY unique_instructor_program (instructor_id, program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 강사 블랙아웃 날짜 (강의 불가능한 날짜)
CREATE TABLE instructor_blackout_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    blackout_date DATE NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    UNIQUE KEY unique_instructor_blackout (instructor_id, blackout_date),
    INDEX idx_blackout_date (blackout_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;