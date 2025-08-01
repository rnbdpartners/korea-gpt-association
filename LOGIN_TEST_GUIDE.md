# 로그인 테스트 가이드

## 문제 해결 완료

백엔드와 프론트엔드 연동 문제를 해결했습니다.

## 빠른 테스트 방법

### 1. 테스트 서버 실행 (데이터베이스 없이)
```bash
cd server
node test-server.js
```

### 2. 프론트엔드 실행
새 터미널에서:
```bash
npm start
```

### 3. 테스트 페이지 열기
브라우저에서 http://localhost:3000/test-login.html 접속

### 4. 테스트 계정

#### 일반 회원
- 이메일: enterprise@demo.com
- 비밀번호: demo123

#### 관리자
- 이메일: admin@koreagpt.org
- 비밀번호: admin123!@#

## 전체 서버 실행 방법 (데이터베이스 필요)

### 1. MySQL 설정
```sql
mysql -u root -p
CREATE DATABASE korea_gpt_association CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE korea_gpt_association;
source database/schema.sql;
```

### 2. 환경변수 설정
`server/.env` 파일에서 DB_PASSWORD 설정

### 3. 마이그레이션 및 시드 데이터
```bash
cd server
npm run migrate
npm run seed
```

### 4. 서버 실행
```bash
cd server
npm start
```

### 5. 프론트엔드 실행
```bash
cd ..
npm start
```

## 주요 수정사항

1. **CORS 설정**: 모든 origin 허용 (개발용)
2. **인증 처리**: JWT 토큰 기반 인증
3. **API 통신**: fetch API 사용
4. **에러 처리**: 상세한 에러 메시지 표시

## 디버깅 팁

1. 브라우저 개발자 도구에서 Network 탭 확인
2. Console에서 에러 메시지 확인
3. localStorage에서 authToken 확인
4. 서버 콘솔에서 로그 확인

## API 엔드포인트

- GET `/api/health` - 서버 상태 확인
- POST `/api/auth/login` - 일반 로그인
- POST `/api/auth/admin/login` - 관리자 로그인
- POST `/api/auth/register` - 회원가입
- GET `/api/enterprise/programs` - 프로그램 목록

## 트러블슈팅

### CORS 오류
- 프론트엔드가 http://localhost:3000에서 실행 중인지 확인
- 서버가 http://localhost:3001에서 실행 중인지 확인

### 로그인 실패
- 서버 콘솔에서 에러 확인
- 네트워크 탭에서 응답 확인
- 비밀번호가 올바른지 확인

### 토큰 오류
- localStorage에 authToken이 저장되었는지 확인
- 토큰 만료 시간 확인