@echo off
REM NextHome - Stop Local Development Services
REM Purpose: Stop all local Docker services cleanly
REM Usage: stop-local.bat

echo.
echo Stopping NextHome Local Development Services...
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH.
    pause
    exit /b 1
)

REM Stop services
echo Stopping Docker services...
docker-compose -f docker-compose.local.yml down

REM Confirm
if %errorlevel% equ 0 (
    echo.
    echo Services stopped successfully.
) else (
    echo.
    echo Error stopping services. Check Docker is running.
)

echo.
pause
