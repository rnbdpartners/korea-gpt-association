-- 통합 교육 관리 시스템 데이터베이스 스키마

-- 강사 상세 정보 테이블
CREATE TABLE instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    specialty JSON, -- ["ChatGPT", "AI 자동화", "프롬프트 엔지니어링"]
    experience_years INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    hourly_rate INT,
    bio TEXT,
    certifications JSON,
    available_days JSON, -- ["월", "화", "수", "목", "금"]
    preferred_locations JSON, -- ["서울", "부산", "온라인"]
    status ENUM('active', 'inactive', 'vacation') DEFAULT 'active',
    color VARCHAR(7), -- 캘린더 표시 색상
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_specialty (specialty(100))
);

-- 커리큘럼 템플릿 테이블
CREATE TABLE curriculum_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category ENUM('basic', 'intermediate', 'advanced', 'custom') NOT NULL,
    duration_hours INT NOT NULL,
    target_audience TEXT,
    objectives JSON, -- 학습 목표 리스트
    modules JSON, -- 모듈별 상세 내용
    prerequisites TEXT,
    materials JSON, -- 필요 자료 리스트
    max_participants INT DEFAULT 30,
    min_participants INT DEFAULT 5,
    base_price INT,
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(10) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- 강의 세션 테이블 (실제 수업)
CREATE TABLE class_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    curriculum_template_id INT,
    instructor_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location_type ENUM('offline', 'online', 'hybrid') NOT NULL,
    location_detail VARCHAR(500), -- 주소 또는 온라인 링크
    current_participants INT DEFAULT 0,
    max_participants INT DEFAULT 30,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    color VARCHAR(7), -- 캘린더 표시 색상
    notes TEXT,
    materials_url VARCHAR(500),
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (curriculum_template_id) REFERENCES curriculum_templates(id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    INDEX idx_datetime (start_datetime, end_datetime),
    INDEX idx_instructor (instructor_id),
    INDEX idx_status (status)
);

-- 수강생 등록 테이블
CREATE TABLE class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_session_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(20),
    company_name VARCHAR(200),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_amount INT,
    certificate_issued BOOLEAN DEFAULT FALSE,
    feedback_score INT,
    feedback_comment TEXT,
    FOREIGN KEY (class_session_id) REFERENCES class_sessions(id),
    INDEX idx_session (class_session_id),
    INDEX idx_student (student_email),
    INDEX idx_attendance (attendance_status)
);

-- 강사 일정 차단 테이블 (휴가, 개인일정 등)
CREATE TABLE instructor_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    reason VARCHAR(200),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- 'weekly', 'monthly'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    INDEX idx_instructor_date (instructor_id, start_datetime, end_datetime)
);

-- 강의실/장소 관리 테이블
CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('classroom', 'seminar_room', 'auditorium', 'online') NOT NULL,
    capacity INT NOT NULL,
    address TEXT,
    facilities JSON, -- ["프로젝터", "화이트보드", "주차장"]
    hourly_rate INT,
    contact_info VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    color VARCHAR(7), -- 캘린더 표시 색상
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_capacity (capacity)
);

-- 강의실 예약 테이블
CREATE TABLE venue_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    class_session_id INT,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    purpose VARCHAR(200),
    status ENUM('confirmed', 'tentative', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id),
    FOREIGN KEY (class_session_id) REFERENCES class_sessions(id),
    INDEX idx_venue_date (venue_id, start_datetime, end_datetime)
);

-- 커리큘럼 모듈 상세 테이블
CREATE TABLE curriculum_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curriculum_template_id INT NOT NULL,
    module_order INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    duration_minutes INT NOT NULL,
    content TEXT,
    activities JSON, -- 실습, 토론 등
    resources JSON, -- 필요 자료
    learning_outcomes JSON,
    FOREIGN KEY (curriculum_template_id) REFERENCES curriculum_templates(id),
    INDEX idx_template_order (curriculum_template_id, module_order)
);

-- 태그 시스템 (검색 및 필터링용)
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'skill', 'industry', 'level'
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 강사-태그 연결
CREATE TABLE instructor_tags (
    instructor_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (instructor_id, tag_id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 커리큘럼-태그 연결
CREATE TABLE curriculum_tags (
    curriculum_template_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (curriculum_template_id, tag_id),
    FOREIGN KEY (curriculum_template_id) REFERENCES curriculum_templates(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 알림 설정 테이블
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('class_reminder', 'enrollment', 'cancellation', 'update') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    content TEXT,
    related_session_id INT,
    send_datetime DATETIME NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (related_session_id) REFERENCES class_sessions(id),
    INDEX idx_send_status (send_datetime, is_sent)
);

-- 뷰: 주간 강의 일정
CREATE VIEW weekly_schedule AS
SELECT 
    cs.id,
    cs.title,
    cs.start_datetime,
    cs.end_datetime,
    cs.location_type,
    cs.location_detail,
    cs.current_participants,
    cs.max_participants,
    cs.status,
    cs.color,
    i.name as instructor_name,
    i.email as instructor_email,
    ct.name as curriculum_name,
    ct.category as curriculum_category,
    v.name as venue_name
FROM class_sessions cs
JOIN instructors i ON cs.instructor_id = i.id
LEFT JOIN curriculum_templates ct ON cs.curriculum_template_id = ct.id
LEFT JOIN venue_bookings vb ON vb.class_session_id = cs.id
LEFT JOIN venues v ON vb.venue_id = v.id
WHERE cs.start_datetime >= CURDATE()
  AND cs.start_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY cs.start_datetime;

-- 뷰: 강사별 월간 통계
CREATE VIEW instructor_monthly_stats AS
SELECT 
    i.id,
    i.name,
    YEAR(cs.start_datetime) as year,
    MONTH(cs.start_datetime) as month,
    COUNT(DISTINCT cs.id) as total_classes,
    SUM(CASE WHEN cs.status = 'completed' THEN 1 ELSE 0 END) as completed_classes,
    SUM(ce.attendance_status = 'attended') as total_students,
    AVG(ce.feedback_score) as avg_rating,
    SUM(TIMESTAMPDIFF(HOUR, cs.start_datetime, cs.end_datetime)) as total_hours
FROM instructors i
LEFT JOIN class_sessions cs ON i.id = cs.instructor_id
LEFT JOIN class_enrollments ce ON cs.id = ce.class_session_id
GROUP BY i.id, YEAR(cs.start_datetime), MONTH(cs.start_datetime);