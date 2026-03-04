@echo off
REM NextHome - Local Development Startup (Batch Version)
REM Purpose: Start all local services with one command
REM Usage: start-local.bat

echo.
echo ===================================
echo NextHome Local Development Startup
echo ===================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

echo Checking for required tools...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 18+.
    pause
    exit /b 1
)

echo Starting Docker services...
docker-compose -f docker-compose.local.yml up -d

echo.
echo Waiting for services to be healthy (10-30 seconds)...
timeout /t 15 /nobreak

REM Try to initialize database
echo.
echo Setting up database...
set PGPASSWORD=nexthome_dev_password

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% equ 0 (
    REM Try to run migrations
    psql -h localhost -U nexthome_dev -d nexthome_db -f migrations.sql
) else (
    echo Note: psql not found. You may need to initialize the database manually.
    echo Run this when PostgreSQL is ready:
    echo   psql -h localhost -U nexthome_dev -d nexthome_db -f migrations.sql
)

REM Set up environment
echo.
echo Setting up environment configuration...
if not exist frontend\.env.local (
    if exist frontend\.env.local.example (
        copy frontend\.env.local.example frontend\.env.local
        echo Created .env.local from template
    )
)

REM Install and start frontend
echo.
echo Installing frontend dependencies...
cd frontend
call npm install

echo.
echo Building frontend...
call npm run build

echo.
echo ===================================
echo Starting development server...
echo ===================================
echo.
echo Services running at:
echo   Frontend:      http://localhost:3002
echo   n8n:           http://localhost:5678
echo   Flowise:       http://localhost:3001
echo   Qdrant:        http://localhost:6333
echo   PostgreSQL:    localhost:5432
echo.
echo Press Ctrl+C to stop the development server
echo.

call npm run dev
