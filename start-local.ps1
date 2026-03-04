# NextHome - Local Development Startup Script
# Purpose: One-command startup for all local services
# Usage: .\start-local.ps1

Write-Host "🚀 NextHome Local Development Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker found" -ForegroundColor Green

# Start Docker services
Write-Host ""
Write-Host "Starting Docker services..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml up -d

# Wait for services to be healthy
Write-Host ""
Write-Host "Waiting for services to be healthy (this may take 10-30 seconds)..." -ForegroundColor Yellow
$maxAttempts = 60
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts -and -not $healthy) {
    $postgres = docker-compose -f docker-compose.local.yml ps postgres | Select-String "healthy"
    $n8n = docker-compose -f docker-compose.local.yml ps n8n | Select-String "healthy"
    
    if ($postgres -and $n8n) {
        $healthy = $true
        Write-Host "✓ Services are healthy" -ForegroundColor Green
    } else {
        Write-Host "  Waiting... ($attempt/60)" -ForegroundColor Gray
        Start-Sleep -Seconds 1
        $attempt++
    }
}

if (-not $healthy) {
    Write-Host "⚠ Services may not be fully healthy yet, but starting frontend..." -ForegroundColor Yellow
}

# Initialize database if needed
Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow

# Wait for PostgreSQL to be ready
$pgReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $env:PGPASSWORD = "nexthome_dev_password"
        psql -h localhost -U nexthome_dev -d nexthome_db -c "SELECT 1" | Out-Null
        $pgReady = $true
        Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
        break
    } catch {
        Write-Host "  Connecting to PostgreSQL... ($i/30)" -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if ($pgReady) {
    # Check if migrations table exists
    $tableExists = psql -h localhost -U nexthome_dev -d nexthome_db -t -c `
        "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='properties')" `
        -ErrorAction SilentlyContinue
    
    if ($tableExists -match "f") {
        Write-Host "Running database migrations..." -ForegroundColor Yellow
        $env:PGPASSWORD = "nexthome_dev_password"
        psql -h localhost -U nexthome_dev -d nexthome_db -f migrations.sql
        Write-Host "✓ Database initialized" -ForegroundColor Green
    } else {
        Write-Host "✓ Database already initialized" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ PostgreSQL not ready yet, deferring migrations" -ForegroundColor Yellow
}

# Set up environment file
Write-Host ""
Write-Host "Setting up environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\.env.local")) {
    if (Test-Path "frontend\.env.local.example") {
        Copy-Item "frontend\.env.local.example" "frontend\.env.local"
        Write-Host "✓ Created .env.local from template" -ForegroundColor Green
    } else {
        Write-Host "⚠ .env.local.example not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Check Node.js
Write-Host ""
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js found: " -ForegroundColor Green -NoNewline
Write-Host "$(node --version)"

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
Pop-Location

# Build frontend (to check for TypeScript errors)
Write-Host ""
Write-Host "Building frontend (type checking)..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Build completed with warnings/errors (see above)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Build successful" -ForegroundColor Green
}
Pop-Location

# Show service information
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Startup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Services Running:" -ForegroundColor Cyan
Write-Host "   Frontend:      http://localhost:3002" -ForegroundColor White
Write-Host "   n8n:           http://localhost:5678" -ForegroundColor White
Write-Host "   Flowise:       http://localhost:3001" -ForegroundColor White
Write-Host "   Qdrant:        http://localhost:6333" -ForegroundColor White
Write-Host "   PostgreSQL:    localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Starting development server (this runs in the foreground)..." -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start frontend in development mode
Push-Location frontend
npm run dev
Pop-Location
