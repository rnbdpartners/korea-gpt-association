-- 강사 관련 테이블 추가

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

-- confirmed_schedules 테이블 수정 (instructor_name 컬럼 제거하고 관계로 대체)
ALTER TABLE confirmed_schedules DROP COLUMN instructor_name;

-- 뷰 생성: 강사별 월간 강의 현황
CREATE VIEW instructor_monthly_schedule AS
SELECT 
    i.id AS instructor_id,
    i.name AS instructor_name,
    YEAR(cs.confirmed_date) AS year,
    MONTH(cs.confirmed_date) AS month,
    COUNT(DISTINCT ilh.id) AS total_lectures,
    SUM(ilh.actual_participants) AS total_participants,
    AVG(ilh.satisfaction_score) AS avg_satisfaction,
    SUM(ilh.payment_amount) AS total_payment
FROM instructors i
LEFT JOIN instructor_assignments ia ON i.id = ia.instructor_id
LEFT JOIN confirmed_schedules cs ON ia.confirmed_schedule_id = cs.id
LEFT JOIN instructor_lecture_history ilh ON i.id = ilh.instructor_id 
    AND cs.education_request_id = ilh.education_request_id
WHERE i.is_active = TRUE
GROUP BY i.id, YEAR(cs.confirmed_date), MONTH(cs.confirmed_date);

-- 뷰 생성: 강사 가용성 캘린더
CREATE VIEW instructor_availability_calendar AS
SELECT 
    i.id AS instructor_id,
    i.name AS instructor_name,
    ia.available_date,
    ia.start_time,
    ia.end_time,
    CASE 
        WHEN cs.id IS NOT NULL THEN 'assigned'
        WHEN ibd.id IS NOT NULL THEN 'blackout'
        WHEN ia.is_available = FALSE THEN 'unavailable'
        ELSE 'available'
    END AS status,
    cs.id AS confirmed_schedule_id,
    er.company_name AS assigned_company
FROM instructors i
LEFT JOIN instructor_availability ia ON i.id = ia.instructor_id
LEFT JOIN instructor_blackout_dates ibd ON i.id = ibd.instructor_id 
    AND ia.available_date = ibd.blackout_date
LEFT JOIN instructor_assignments ias ON i.id = ias.instructor_id
LEFT JOIN confirmed_schedules cs ON ias.confirmed_schedule_id = cs.id 
    AND cs.confirmed_date = ia.available_date
LEFT JOIN education_requests er ON cs.education_request_id = er.id
LEFT JOIN enterprise_members em ON er.enterprise_member_id = em.id
WHERE i.is_active = TRUE
ORDER BY ia.available_date, i.name;

-- 초기 강사 데이터 삽입 예시
INSERT INTO instructors (instructor_code, name, birth_date, phone, email, car_model, car_number, specialty) VALUES
('INST-001', '김철수', '1985-03-15', '010-1234-5678', 'kimcs@example.com', 'SM5', '12가3456', 'ChatGPT 기초 및 중급'),
('INST-002', '이영희', '1990-07-22', '010-2345-6789', 'leeyh@example.com', 'K5', '34나5678', '업무 자동화 전문'),
('INST-003', '박민수', '1988-11-30', '010-3456-7890', 'parkms@example.com', '소나타', '56다7890', 'AI 전략 및 고급 과정');