# 한국GPT협회 웹사이트 설정 가이드

## 빠른 시작 (테스트 서버)

테스트 서버는 데이터베이스 없이 메모리에서 실행되므로 빠르게 테스트할 수 있습니다.

### 1. 테스트 서버 실행

```bash
# 백엔드 테스트 서버 실행
cd server
start-test-server.bat
```

### 2. 프론트엔드 실행 (별도 터미널)

```bash
# 프로젝트 루트에서
start-frontend.bat
```

### 3. 웹사이트 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

### 4. 테스트 계정

#### 관리자
- 이메일: admin@koreagpt.org
- 비밀번호: admin123!@#

#### 기업 회원
1. **데모 기업**
   - 이메일: enterprise@demo.com
   - 비밀번호: demo123

2. **삼성전자**
   - 이메일: manager@samsung.com
   - 비밀번호: samsung123

3. **AI 스타트업**
   - 이메일: ceo@startup.kr
   - 비밀번호: startup123

## 전체 시스템 설정 (데이터베이스 포함)

### 1. MySQL 설치 및 설정

1. MySQL 8.0 이상 설치
2. 데이터베이스 생성:
   ```sql
   CREATE DATABASE korea_gpt_association CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 2. 환경 변수 설정

`server/.env` 파일 수정:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=korea_gpt_association

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@koreagpt.org
ADMIN_PASSWORD=admin123!@#

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. 데이터베이스 초기화

```bash
cd server
node init-db.js
```

### 4. 전체 시스템 실행

```bash
# 프로젝트 루트에서
start-all.bat
```

## 로그인 문제 해결

### 증상
- 로그인 버튼 클릭 시 반응이 없음
- 콘솔에 CORS 에러 표시
- "서버 연결 오류" 메시지

### 해결 방법

1. **백엔드 서버 확인**
   - 백엔드 서버가 실행 중인지 확인
   - http://localhost:3001/api/health 접속하여 확인

2. **CORS 설정 확인**
   - 프론트엔드 URL이 CORS 허용 목록에 있는지 확인
   - 개발 환경에서는 모든 origin 허용

3. **API 엔드포인트 확인**
   - `js/api-config.js`의 API_BASE_URL 확인
   - localhost에서는 `http://localhost:3001/api` 사용

4. **브라우저 콘솔 확인**
   - F12로 개발자 도구 열기
   - Console 탭에서 에러 메시지 확인
   - Network 탭에서 API 요청 상태 확인

## 주요 파일 구조

```
korea-gpt-repo/
├── server/
│   ├── server.js           # 메인 서버 (데이터베이스 필요)
│   ├── test-server.js      # 테스트 서버 (데이터베이스 불필요)
│   ├── start-server.bat    # 메인 서버 실행
│   └── start-test-server.bat # 테스트 서버 실행
├── js/
│   ├── api-config.js       # API 설정 및 요청 함수
│   └── auth-handler.js     # 인증 처리 로직
├── login.html              # 로그인 페이지
├── test-login.html         # 로그인 테스트 페이지
├── start-frontend.bat      # 프론트엔드 서버 실행
└── start-all.bat          # 전체 시스템 실행

## 문제 발생 시

1. **서버 로그 확인**: 백엔드 터미널에서 에러 메시지 확인
2. **테스트 페이지 사용**: http://localhost:3000/test-login.html
3. **수동 API 테스트**: Postman이나 curl로 직접 API 호출
4. **캐시 삭제**: 브라우저 캐시 및 로컬 스토리지 삭제