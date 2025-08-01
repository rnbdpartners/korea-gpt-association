@echo off
echo ========================================
echo 한국GPT협회 테스트 서버 시작
echo ========================================
echo.
echo [테스트 서버는 데이터베이스 없이 실행됩니다]
echo.

echo [1/2] 의존성 패키지 확인 중...
if not exist node_modules (
    echo 패키지를 설치합니다...
    call npm install
) else (
    echo 패키지가 이미 설치되어 있습니다.
)

echo.
echo [2/2] 테스트 서버 시작 중...
echo.
echo ========================================
echo 서버가 http://localhost:3001 에서 실행됩니다.
echo.
echo 테스트 계정:
echo - 관리자: admin@koreagpt.org / admin123!@#
echo - 기업1: enterprise@demo.com / demo123
echo - 기업2: manager@samsung.com / samsung123
echo - 기업3: ceo@startup.kr / startup123
echo.
echo 종료하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

node test-server.js