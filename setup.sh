#!/usr/bin/env bash

set -euo pipefail

# ---------- 1) Safety check: must be run from repo root ----------

if [ ! -f package.json ]; then
  echo "ERROR: run this from the repository root (where package.json lives)."
  exit 1
fi

echo "=== 0) Print quick status ==="
echo "Working dir: $(pwd)"
echo "Node version: $(node --version || echo 'node not installed')"
echo "Docker: $(docker --version || echo 'docker not available')"
echo ""

# ---------- 2) Ensure .env exists (copy from env.example) ----------

if [ -f .env ]; then
  echo ".env already exists — leaving as-is"
else
  if [ -f env.example ]; then
    echo "Creating .env from env.example"
    cp env.example .env
  elif [ -f .env.example ]; then
    echo "Creating .env from .env.example"
    cp .env.example .env
  else
    echo "No env.example found. Creating minimal .env"
    cat > .env <<'EOF'
# Database
DATABASE_URL="postgresql://flowbit_user:flowbit_pass@localhost:5432/flowbit_db?schema=public"

# API
API_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE=/api

# Vanna Service
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
VANNA_MAX_ROWS=200

# Groq LLM (optional)
GROQ_API_KEY=

# Environment
NODE_ENV=development
EOF
  fi
fi

# ---------- 3) Ensure apps/web tsconfig has path alias @/* -> ./src/* ----------

WEB_TSCONFIG="apps/web/tsconfig.json"
if [ -f "$WEB_TSCONFIG" ]; then
  echo "Checking $WEB_TSCONFIG for import alias @/* => ./src/*"
  
  # Use node to update tsconfig.json properly
  node - <<'NODE_SCRIPT'
const fs = require('fs');
const path = 'apps/web/tsconfig.json';

if (!fs.existsSync(path)) {
  process.exit(0);
}

let json = JSON.parse(fs.readFileSync(path, 'utf8'));
json.compilerOptions = json.compilerOptions || {};
json.compilerOptions.baseUrl = json.compilerOptions.baseUrl || ".";
json.compilerOptions.paths = json.compilerOptions.paths || {};

// Check if @/* is already configured correctly
const hasCorrectAlias = json.compilerOptions.paths["@/*"] && 
  json.compilerOptions.paths["@/*"].some((p) => p.includes("src"));

if (!hasCorrectAlias) {
  json.compilerOptions.paths["@/*"] = ["./src/*"];
  fs.writeFileSync(path, JSON.stringify(json, null, 2));
  console.log("✓ Updated tsconfig.json with @/* => ./src/* path alias");
} else {
  console.log("✓ tsconfig.json already has correct @/* path alias");
}
NODE_SCRIPT
else
  echo "No $WEB_TSCONFIG found — skipping tsconfig patch."
fi

# ---------- 4) Install root deps (workspaces-aware) ----------

echo ""
echo "Installing dependencies (root & workspaces). This may take a couple minutes..."

if command -v pnpm >/dev/null 2>&1; then
  echo "Using pnpm..."
  pnpm install
elif command -v npm >/dev/null 2>&1; then
  echo "Using npm..."
  npm install
else
  echo "No pnpm or npm available. Install Node + npm and re-run."
  exit 1
fi

# ---------- 5) Start Docker DB (postgres + adminer) ----------

if [ -f docker-compose.yml ] || [ -f docker-compose.yaml ]; then
  echo ""
  echo "Starting docker compose services (postgres + adminer) ..."
  docker compose up -d || docker-compose up -d
  
  echo "Sleeping 5s to let postgres start..."
  sleep 5
  
  # Verify postgres is up
  echo "Checking if postgres is ready..."
  for i in {1..10}; do
    if docker compose exec -T postgres pg_isready -U flowbit_user >/dev/null 2>&1 || \
       docker-compose exec -T postgres pg_isready -U flowbit_user >/dev/null 2>&1 || \
       docker compose exec -T flowbit_postgres pg_isready -U flowbit_user >/dev/null 2>&1; then
      echo "✓ Postgres is ready"
      break
    fi
    echo "  Waiting for postgres... ($i/10)"
    sleep 2
  done
else
  echo "No docker-compose.yml found — ensure your PostgreSQL is running and DATABASE_URL points to it."
fi

# ---------- 6) Prisma: generate + migrate ----------

echo ""
echo "Generating Prisma client..."
npx prisma generate

echo ""
echo "Applying migrations..."
# Try to apply migrations, create if needed
if npx prisma migrate dev --name init 2>/dev/null; then
  echo "✓ Migrations applied"
else
  echo "Migration might already exist, trying deploy..."
  npx prisma migrate deploy || npx prisma db push || true
fi

# ---------- 7) Preserve existing seed script or create compatible one ----------

SEED_PATH="prisma/seed.ts"

# Check if seed.ts exists and looks correct
SKIP_SEED_CREATE=false
if [ -f "$SEED_PATH" ]; then
  if grep -q "lineItems\|line_items" "$SEED_PATH" 2>/dev/null; then
    echo ""
    echo "✓ Existing seed.ts found and appears compatible — preserving it"
    SKIP_SEED_CREATE=true
  else
    echo ""
    echo "Existing seed.ts found but might need updates — backing up and creating new one"
    cp "$SEED_PATH" "${SEED_PATH}.backup" 2>/dev/null || true
  fi
fi

# Create seed script that matches our schema (only if needed)
if [ "$SKIP_SEED_CREATE" = "false" ]; then
  echo ""
  echo "Creating/updating prisma/seed.ts to match current schema..."
  
  cat > "$SEED_PATH" <<'TS_SEED'
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../data/Analytics_Test_Data.json');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Data file not found:', filePath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log('🌱 Starting database seed...');

  // ---------- Vendors ----------
  for (const vendor of data.vendors || []) {
    await prisma.vendor.upsert({
      where: { id: vendor.id },
      update: {},
      create: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email ?? null,
        phone: vendor.phone ?? null,
        address: vendor.address ?? null,
      },
    });
  }
  console.log(`✅ Seeded ${data.vendors?.length || 0} vendors`);

  // ---------- Customers ----------
  for (const customer of data.customers || []) {
    await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? null,
        address: customer.address ?? null,
      },
    });
  }
  console.log(`✅ Seeded ${data.customers?.length || 0} customers`);

  // ---------- Invoices ----------
  for (const invoice of data.invoices || []) {
    // Extract line items and payments (support both camelCase and snake_case)
    const lineItems = invoice.lineItems || invoice.line_items || [];
    const payments = invoice.payments || [];

    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: {},
      create: {
        id: invoice.id,
        vendorId: invoice.vendorId || invoice.vendor_id,
        customerId: invoice.customerId || invoice.customer_id,
        date: new Date(invoice.issueDate || invoice.date || Date.now()),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : invoice.due_date ? new Date(invoice.due_date) : null,
        amount: invoice.total ?? invoice.amount ?? 0,
        status: invoice.status ?? 'pending',
      },
    });

    // Create line items
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const lineItemId = item.id || `${invoice.id}-line-${i}`;
      await prisma.lineItem.upsert({
        where: { id: lineItemId },
        update: {},
        create: {
          id: lineItemId,
          invoiceId: invoice.id,
          description: item.description ?? '',
          quantity: item.quantity ?? 0,
          price: item.unitPrice ?? item.price ?? item.unit_price ?? 0,
        },
      });
    }

    // Create payments (support both single payment and array)
    const paymentList = Array.isArray(payments) ? payments : payments ? [payments] : [];
    for (let i = 0; i < paymentList.length; i++) {
      const payment = paymentList[i];
      const paymentId = payment.id || `${invoice.id}-pay-${i}`;
      await prisma.payment.upsert({
        where: { id: paymentId },
        update: {},
        create: {
          id: paymentId,
          invoiceId: invoice.id,
          amount: payment.amount ?? 0,
          date: payment.paymentDate ? new Date(payment.paymentDate) : payment.date ? new Date(payment.date) : new Date(),
          method: payment.method ?? 'unknown',
        },
      });
    }
  }
  console.log(`✅ Seeded ${data.invoices?.length || 0} invoices`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
TS_SEED

  echo "✓ Wrote $SEED_PATH"
fi

# ---------- 8) Install ts-node so seeding runs reliably ----------

echo ""
echo "Ensuring ts-node is available for seeding..."
if ! npx -y ts-node --version >/dev/null 2>&1; then
  npm install -D ts-node typescript @types/node || true
fi

# ---------- 9) Run the seed script ----------

echo ""
echo "Running prisma seed (this will populate DB using prisma/seed.ts)..."
if npx ts-node prisma/seed.ts; then
  echo "✓ Database seeded successfully"
else
  echo "⚠️  Seed script had errors. Check the output above."
  echo "   You can run it manually later with: npx ts-node prisma/seed.ts"
fi

# ---------- 10) Prepare Vanna service dependencies (Python) ----------

if [ -f services/vanna/requirements.txt ]; then
  echo ""
  echo "Setting up Vanna Python service..."
  
  # Create virtual environment
  if [ ! -d "services/vanna/.venv" ]; then
    if command -v python3 >/dev/null 2>&1; then
      python3 -m venv services/vanna/.venv
    elif command -v python >/dev/null 2>&1; then
      python -m venv services/vanna/.venv
    else
      echo "⚠️  Python not found. Install Python to use Vanna service."
    fi
  fi

  # Install dependencies
  if [ -d "services/vanna/.venv" ]; then
    if [ -f "services/vanna/.venv/bin/activate" ]; then
      # Unix/Mac
      source services/vanna/.venv/bin/activate
      pip install --upgrade pip --quiet
      pip install -r services/vanna/requirements.txt --quiet
      deactivate
      echo "✓ Vanna Python dependencies installed"
    elif [ -f "services/vanna/.venv/Scripts/activate" ]; then
      # Windows
      services/vanna/.venv/Scripts/python -m pip install --upgrade pip --quiet
      services/vanna/.venv/Scripts/pip install -r services/vanna/requirements.txt --quiet
      echo "✓ Vanna Python dependencies installed (Windows)"
    fi
  fi
else
  echo ""
  echo "No services/vanna/requirements.txt detected — skipping Python install."
fi

# ---------- 11) Verify shadcn/ui components exist ----------

if [ -d "apps/web/src/components/ui" ]; then
  echo ""
  echo "✓ shadcn/ui components directory exists"
  
  # Check for key components
  if [ ! -f "apps/web/src/components/ui/button.tsx" ]; then
    echo "⚠️  Warning: button.tsx not found in apps/web/src/components/ui/"
  fi
  if [ ! -f "apps/web/src/components/ui/input.tsx" ]; then
    echo "⚠️  Warning: input.tsx not found in apps/web/src/components/ui/"
  fi
  if [ ! -f "apps/web/src/components/ui/card.tsx" ]; then
    echo "⚠️  Warning: card.tsx not found in apps/web/src/components/ui/"
  fi
else
  echo ""
  echo "⚠️  Warning: apps/web/src/components/ui directory not found"
  echo "   Components should be in apps/web/src/components/ui/"
fi

# ---------- 12) Final summary ----------

echo ""
echo "=== ✅ SETUP COMPLETE ==="
echo ""
echo "Next steps (run these in separate terminals):"
echo ""
echo "1️⃣  Start backend API:"
echo "   cd apps/api"
echo "   npm run dev"
echo ""
echo "2️⃣  Start frontend:"
echo "   cd apps/web"
echo "   npm run dev"
echo ""
echo "3️⃣  Start Vanna service (optional):"
echo "   cd services/vanna"
echo "   # On Unix/Mac:"
echo "   source .venv/bin/activate"
echo "   # On Windows:"
echo "   .venv\\Scripts\\activate"
echo "   uvicorn app:app --reload --port 8000"
echo ""
echo "4️⃣  Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001"
echo "   Adminer:   http://localhost:8080"
echo "   Vanna:     http://localhost:8000"
echo ""
echo "5️⃣  Test endpoints:"
echo "   curl http://localhost:3001/stats"
echo "   curl http://localhost:3001/invoices"
echo "   curl -X POST http://localhost:3001/chat-with-data \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"question\":\"What are the top 5 vendors?\"}'"
echo ""
echo "If you encounter any errors, check:"
echo "  - Docker is running (for PostgreSQL)"
echo "  - .env file has correct DATABASE_URL"
echo "  - All dependencies are installed"
echo ""

