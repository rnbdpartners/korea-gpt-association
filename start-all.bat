@echo off
echo ========================================
echo 한국GPT협회 전체 시스템 시작
echo ========================================
echo.

echo [백엔드 서버 시작]
start "Backend Server" cmd /k "cd server && start-server.bat"

echo.
echo 백엔드 서버가 시작되기를 기다리는 중... (10초)
timeout /t 10 /nobreak > nul

echo.
echo [프론트엔드 서버 시작]
start "Frontend Server" cmd /k "start-frontend.bat"

echo.
echo ========================================
echo 모든 서버가 시작되었습니다!
echo.
echo 백엔드: http://localhost:3001
echo 프론트엔드: http://localhost:3000
echo.
echo 두 개의 새 창이 열렸습니다.
echo 종료하려면 각 창에서 Ctrl+C를 누르세요.
echo ========================================
echo.
pause