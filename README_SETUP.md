# 한국GPT협회 웹사이트 설치 및 실행 가이드

## 사전 요구사항

1. Node.js (v14 이상)
2. MySQL (v5.7 이상)
3. Git

## 설치 방법

### 1. 프로젝트 클론
```bash
git clone https://github.com/rnbdpartners/korea-gpt-association.git
cd korea-gpt-association
```

### 2. 의존성 설치

#### 프론트엔드
```bash
npm install
```

#### 백엔드
```bash
cd server
npm install
cd ..
```

### 3. 데이터베이스 설정

#### MySQL 데이터베이스 생성
```sql
CREATE DATABASE korea_gpt_association CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 스키마 적용
```bash
mysql -u root -p korea_gpt_association < database/schema.sql
```

### 4. 환경 변수 설정

`server/.env` 파일이 이미 생성되어 있습니다. 필요시 수정하세요:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=korea_gpt_association
DB_USER=root
DB_PASSWORD=your_password_here

# Admin Configuration
ADMIN_EMAIL=admin@koreagpt.org
ADMIN_INITIAL_PASSWORD=admin123!@#
```

## 실행 방법

### 1. 백엔드 서버 실행
```bash
cd server
npm start
```
서버는 http://localhost:3001 에서 실행됩니다.

### 2. 프론트엔드 실행
새 터미널에서:
```bash
npm start
```
프론트엔드는 http://localhost:3000 에서 실행됩니다.

## 주요 기능

### 1. 기업문의 시스템
- 회원가입 및 로그인
- 교육 프로그램 신청
- 희망 날짜 선택
- 서류 업로드

### 2. 관리자 시스템
- 교육 신청 관리
- 일정 확정
- 강사 배정
- 통계 대시보드

### 3. API 엔드포인트

#### 인증
- POST `/api/auth/register` - 회원가입
- POST `/api/auth/login` - 로그인
- POST `/api/auth/admin/login` - 관리자 로그인

#### 기업 문의
- GET `/api/enterprise/programs` - 교육 프로그램 목록
- POST `/api/enterprise/request` - 교육 신청
- POST `/api/enterprise/request/:id/dates` - 희망 날짜 제출
- GET `/api/enterprise/requests` - 내 신청 목록

#### 관리자
- GET `/api/admin/dashboard` - 대시보드 통계
- GET `/api/admin/requests` - 전체 신청 목록
- PUT `/api/admin/requests/:id/status` - 상태 변경
- POST `/api/admin/requests/:id/confirm-schedule` - 일정 확정

## 테스트 계정

### 관리자
- 이메일: admin@koreagpt.org
- 비밀번호: admin123!@#

### 기업 회원 (데모)
- 이메일: enterprise@demo.com
- 비밀번호: demo123

## 문제 해결

### 데이터베이스 연결 오류
1. MySQL 서비스가 실행 중인지 확인
2. `.env` 파일의 데이터베이스 정보 확인
3. 데이터베이스 사용자 권한 확인

### CORS 오류
프론트엔드와 백엔드가 다른 포트에서 실행되는 경우, `server/.env`의 `CORS_ORIGIN` 설정 확인

### 파일 업로드 오류
`server/uploads` 디렉토리가 존재하고 쓰기 권한이 있는지 확인

## 개발 환경 팁

### 개발 모드로 백엔드 실행
```bash
cd server
npm run dev
```

### 데이터베이스 마이그레이션
```bash
cd server
npm run migrate
```

### 시드 데이터 추가
```bash
cd server
npm run seed
```