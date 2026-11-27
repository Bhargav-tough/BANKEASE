@echo off
echo ============================================================
echo   BankEase - Starting Backend (Spring Boot)
echo ============================================================
echo.
echo Make sure MySQL is running and credentials are set in:
echo   backend\src\main\resources\application.properties
echo.
cd /d "%~dp0backend"
mvn spring-boot:run
pause

