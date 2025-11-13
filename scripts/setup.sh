#!/bin/bash

echo "🚀 Setting up Flowbit Analytics Dashboard..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your configuration"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
cd apps/api
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
cd ../..

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys (GROQ_API_KEY, etc.)"
echo "2. Start the API: cd apps/api && npm run dev"
echo "3. Start Vanna: cd services/vanna && uvicorn main:app --reload --port 8000"
echo "4. Start Frontend: cd apps/web && npm run dev"
echo ""
echo "Or use Turborepo: npm run dev"


