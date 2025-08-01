@echo off
echo ========================================
echo 한국GPT협회 백엔드 서버 시작
echo ========================================
echo.

REM 환경변수 확인
if not exist .env (
    echo [오류] .env 파일이 없습니다!
    echo server 폴더에 .env 파일을 생성하고 데이터베이스 정보를 입력하세요.
    echo.
    pause
    exit /b 1
)

echo [1/4] 의존성 패키지 설치 중...
call npm install

echo.
echo [2/4] 데이터베이스 연결 테스트 중...
node -e "require('dotenv').config(); const mysql = require('mysql2'); const conn = mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD}); conn.connect(err => { if(err) { console.error('DB 연결 실패:', err.message); process.exit(1); } else { console.log('DB 연결 성공!'); conn.end(); } });"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [오류] 데이터베이스 연결 실패!
    echo MySQL이 실행 중인지, .env의 DB 정보가 올바른지 확인하세요.
    pause
    exit /b 1
)

echo.
echo [3/4] 마이그레이션 실행 중...
call npm run migrate

echo.
echo [4/4] 서버 시작 중...
echo.
echo ========================================
echo 서버가 http://localhost:3001 에서 실행됩니다.
echo 종료하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

npm start