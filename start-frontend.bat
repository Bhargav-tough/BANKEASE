@echo off
echo ============================================================
echo   BankEase - Starting Frontend (React + Vite)
echo ============================================================
echo.
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
npm run dev
pause

