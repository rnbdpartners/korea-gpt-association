# 한국GPT협회 백엔드 서버

Node.js + Express + MySQL을 사용한 REST API 서버

## 설치 및 실행

### 1. 의존성 설치
```bash
cd server
npm install
```

### 2. 환경 변수 설정
`.env.example`을 복사하여 `.env` 파일을 생성하고 적절한 값으로 수정하세요.

```bash
cp .env.example .env
```

### 3. 데이터베이스 설정
MySQL 데이터베이스를 생성하고 연결 정보를 `.env`에 설정하세요.

```sql
CREATE DATABASE korea_gpt_association CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 데이터베이스 마이그레이션
```bash
npm run migrate
```

### 5. 초기 데이터 입력
```bash
npm run seed
```

### 6. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## API 엔드포인트

### 인증 (/api/auth)
- `POST /register` - 기업 회원가입
- `POST /login` - 기업 로그인
- `POST /admin/login` - 관리자 로그인

### 기업 (/api/enterprise)
- `GET /programs` - 교육 프로그램 목록
- `POST /request` - 교육 신청
- `POST /request/:id/dates` - 희망 날짜 제출
- `GET /requests` - 내 신청 목록
- `GET /requests/:id` - 신청 상세보기
- `POST /requests/:id/accept` - 일정 수락

### 관리자 (/api/admin)
- `GET /dashboard` - 대시보드 통계
- `GET /requests` - 교육 신청 목록
- `GET /requests/:id` - 신청 상세보기
- `PUT /requests/:id/status` - 신청 상태 변경
- `POST /requests/:id/confirm-schedule` - 일정 확정
- `GET /members` - 기업 회원 목록
- `PUT /members/:id/toggle-status` - 회원 상태 토글

### 강사 (/api/instructors)
- `GET /` - 강사 목록
- `POST /` - 강사 생성
- `PUT /:id` - 강사 정보 수정
- `GET /availability/:year/:month` - 강사 가용성 조회
- `POST /:id/availability` - 강사 가용성 설정
- `POST /:id/blackout` - 블랙아웃 날짜 설정
- `POST /assign` - 강사 배정
- `GET /:id/history` - 강사 강의 이력

### 파일 업로드 (/api/upload)
- `POST /business-license/:requestId` - 사업자등록증 업로드
- `POST /instructor-signature/:instructorId` - 강사 서명 업로드
- `POST /instructor-profile/:instructorId` - 강사 프로필 이미지 업로드

## 인증

JWT 토큰을 사용하며, 헤더에 다음과 같이 포함해야 합니다:
```
Authorization: Bearer <token>
```

## 파일 구조

```
server/
├── middleware/        # 미들웨어
├── models/           # 데이터베이스 모델
├── routes/           # API 라우터
├── uploads/          # 업로드된 파일
├── utils/            # 유틸리티 함수
├── .env.example      # 환경 변수 예시
├── package.json      # 패키지 설정
└── server.js         # 메인 서버 파일
```

## 보안

- CORS 설정
- Rate limiting
- Helmet을 통한 보안 헤더
- 파일 업로드 제한 및 검증
- JWT 토큰 인증

## 배포

프로덕션 환경에서는 다음을 고려하세요:

1. PM2를 사용한 프로세스 관리
2. HTTPS 설정
3. 데이터베이스 최적화
4. 로그 관리
5. 모니터링 설정