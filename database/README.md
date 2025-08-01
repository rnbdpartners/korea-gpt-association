# 한국GPT협회 기업문의 데이터베이스 설계

## 개요
이 문서는 한국GPT협회 웹사이트의 기업문의 페이지를 위한 데이터베이스 구조를 설명합니다.

## 데이터베이스 구조

### 주요 테이블

1. **enterprise_members** - 기업 회원 정보
   - 담당자 정보 (이름, 직책, 이메일, 연락처)
   - 기업 정보 (기업명, 사업자등록번호, 업종, 직원수)
   - 계정 정보 (비밀번호, 활성화 상태)

2. **education_programs** - 교육 프로그램 정보
   - 프로그램 코드, 이름, 설명
   - 가격, 기간, 난이도

3. **education_requests** - 교육 신청 정보
   - 신청번호, 회원ID, 프로그램ID
   - 참가인원, 교육형태, 특별요청사항
   - 예상금액, 진행상태

4. **preferred_dates** - 희망 교육 날짜
   - 교육신청ID, 희망날짜, 우선순위(1-3)

5. **confirmed_schedules** - 확정된 교육 일정
   - 교육신청ID, 확정날짜, 시간
   - 장소, 온라인링크, 강사명

6. **submitted_documents** - 제출 서류
   - 교육신청ID, 서류종류, 파일정보
   - 세금계산서 이메일, 비고

## 설치 및 사용법

### 1. 데이터베이스 생성
```sql
CREATE DATABASE korea_gpt_association CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 스키마 실행
```bash
mysql -u root -p korea_gpt_association < database/schema.sql
```

### 3. Node.js 환경 설정
```bash
npm install sequelize mysql2
```

### 4. 환경변수 설정
`.env` 파일 생성:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=korea_gpt_association
NODE_ENV=development
```

### 5. 마이그레이션 실행
```bash
npx sequelize-cli db:migrate
```

## 모델 사용 예시

```javascript
const { EnterpriseMember, EducationRequest } = require('./models');

// 기업회원 생성
const member = await EnterpriseMember.create({
  email: 'contact@company.com',
  password: 'hashed_password',
  managerName: '홍길동',
  position: '교육담당자',
  phone: '02-1234-5678',
  companyName: '테스트기업',
  businessNumber: '123-45-67890',
  industry: 'it',
  employeeCount: '51-200'
});

// 교육 신청 조회
const requests = await EducationRequest.findAll({
  where: { status: 'pending' },
  include: [
    { model: EnterpriseMember, as: 'enterpriseMember' },
    { model: EducationProgram, as: 'program' }
  ]
});
```

## 상태 플로우

### 교육 신청 프로세스
1. **pending** - 초기 신청
2. **quote_sent** - 견적서 발송
3. **date_selecting** - 날짜 선택 중
4. **confirmed** - 일정 확정
5. **document_pending** - 서류 대기
6. **completed** - 완료
7. **cancelled** - 취소

## 보안 고려사항
- 비밀번호는 bcrypt 등으로 해시화
- SQL Injection 방지를 위해 Prepared Statement 사용
- 파일 업로드 시 확장자 및 크기 검증
- 세션 관리 및 인증 토큰 구현 필요