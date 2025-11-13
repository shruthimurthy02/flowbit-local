# PowerShell setup script for Windows

Write-Host "🚀 Setting up Flowbit Analytics Dashboard..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please update .env with your configuration" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Start PostgreSQL
Write-Host "🐘 Starting PostgreSQL..." -ForegroundColor Cyan
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
Set-Location apps/api
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
Set-Location ../..

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
npm run db:seed

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with your API keys (GROQ_API_KEY, etc.)"
Write-Host "2. Start the API: cd apps/api && npm run dev"
Write-Host "3. Start Vanna: cd services/vanna && uvicorn main:app --reload --port 8000"
Write-Host "4. Start Frontend: cd apps/web && npm run dev"
Write-Host ""
Write-Host "Or use Turborepo: npm run dev" -ForegroundColor Yellow


