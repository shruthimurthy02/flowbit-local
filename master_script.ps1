set -e

# 0) Ensure we're at repo root
cd C:\Projects\flowbit-intern-assignment
Write-Host "Working directory: $(Get-Location)"

# -------------------------
# STEP 1: Ensure Node 20 LTS (if on Windows, use winget)
# -------------------------
Write-Host "STEP 1: Ensure Node 20 LTS"
try {
  $nodev = & node -v 2>$null
  Write-Host "Current node: $nodev"
} catch {
  Write-Host "node not found or error reading node version"
}

# If Node version starts with v22, prompt to replace it
if ($nodev -and $nodev.StartsWith("v22")) {
  Write-Host "Detected Node v22 — installing Node 20 LTS via winget (admin privileges may be required)..."
  winget uninstall --id OpenJS.NodeJS -e || winget uninstall --name "Node.js" -e
  winget install --id OpenJS.NodeJS.LTS -e
  Write-Host "Installed Node LTS. Please restart this terminal and re-run this script from the top."
  exit 0
} else {
  Write-Host "Node version ok (not v22) or not installed - continuing."
}

# -------------------------
# STEP 2: Fix prisma seed path (make it repo-relative)
# -------------------------
Write-Host "STEP 2: Fix prisma/seed.ts to use repository-relative data path (if needed)"

$seedPath = ".\prisma\seed.ts"
if (Test-Path $seedPath) {
  $seedText = Get-Content $seedPath -Raw
  if ($seedText -match "C:\\\\Users\\\\shruth\\\\OneDrive") {
    Write-Host "Found absolute OneDrive path in seed.ts — replacing with robust relative search"
    $newSeed = @"
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // find the JSON data relative to repo root
  const candidates = [
    path.join(process.cwd(), "data", "Analytics_Test_Data.json"),
    path.join(__dirname, "..", "data", "Analytics_Test_Data.json"),
    path.join(__dirname, "..", "..", "data", "Analytics_Test_Data.json"),
    path.resolve(process.cwd(), "Analytics_Test_Data.json")
  ];

  let filePath: string | undefined;
  for (const p of candidates) {
    if (fs.existsSync(p)) { filePath = p; break; }
  }

  if (!filePath) {
    console.error("❌ Data file Analytics_Test_Data.json not found. Please place it in ./data/Analytics_Test_Data.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const invoices = JSON.parse(raw);
  console.log("Seeding from:", filePath);

  // Minimal example: adapt to your schema shape
  // Clear tables
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  const vendorMap = new Map<string, number>();
  const customerMap = new Map<string, number>();

  for (const inv of invoices) {
    const vname = inv.vendor?.name?.trim() || "Unknown Vendor";
    let vid = vendorMap.get(vname);
    if (!vid) {
      const v = await prisma.vendor.create({ data: { name: vname, category: inv.vendor?.category ?? null } });
      vid = v.id;
      vendorMap.set(vname, vid);
    }
    const cname = inv.customer?.name?.trim() || null;
    let cid = null;
    if (cname) {
      cid = customerMap.get(cname);
      if (!cid) {
        const c = await prisma.customer.create({ data: { name: cname } });
        cid = c.id;
        customerMap.set(cname, cid);
      }
    }
    const created = await prisma.invoice.create({
      data: {
        invoiceNumber: inv.invoice_number ?? `INV-${Math.random().toString(36).slice(2,8)}`,
        vendorId: vid,
        customerId: cid,
        date: inv.date ? new Date(inv.date) : new Date(),
        dueDate: inv.due_date ? new Date(inv.due_date) : null,
        totalAmount: Number(inv.total_amount ?? inv.amount ?? 0),
        status: inv.status ?? "unknown",
        lineItems: {
          create: (inv.line_items ?? []).map((li: any) => ({
            description: li.description ?? li.name ?? null,
            quantity: li.quantity ? Number(li.quantity) : (li.qty ? Number(li.qty) : 1),
            unitPrice: li.unit_price ? Number(li.unit_price) : (li.price ? Number(li.price) : 0),
            tax: li.tax ? Number(li.tax) : 0
          }))
        },
        payments: {
          create: (inv.payments ?? []).map((p: any) => ({
            amount: Number(p.amount ?? 0),
            paidAt: p.paid_at ? new Date(p.paid_at) : new Date(),
            method: p.method ?? null
          }))
        }
      }
    });
    console.log("Inserted", created.invoiceNumber);
  }

  console.log("Seeding completed.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
"@

    $newSeed | Out-File -FilePath $seedPath -Encoding utf8 -Force
    Write-Host "Rewrote prisma/seed.ts to use relative paths."
  } else {
    Write-Host "prisma/seed.ts does not contain the OneDrive absolute path — no edit needed."
  }
} else {
  Write-Host "WARNING: prisma/seed.ts not found at $seedPath — please check repo."
}

# -------------------------
# STEP 3: Ensure services/vanna has src package and __init__.py
# -------------------------
Write-Host "STEP 3: Ensure services/vanna/src/__init__.py exists and inspect entrypoint"

$vannaSrc = ".\services\vanna\src"
if (!(Test-Path $vannaSrc)) {
  Write-Host "ERROR: services/vanna/src not found. Abort. Please ensure vanna code is present."
  exit 1
}

$initPath = Join-Path $vannaSrc "__init__.py"
if (!(Test-Path $initPath)) {
  New-Item -Path $initPath -ItemType File -Force | Out-Null
  Write-Host "Created $initPath"
} else {
  Write-Host "__init__.py exists"
}

# If render.yaml uses 'app:app' style, ensure there's a file app.py or top-level app variable
$renderYaml = "services/vanna/render.yaml"
if (Test-Path $renderYaml) {
  $ry = Get-Content $renderYaml -Raw
  if ($ry -match "startCommand:") {
    Write-Host "services/vanna/render.yaml found"
  }
}

# -------------------------
# STEP 4: Start local Postgres (Docker)
# -------------------------
Write-Host "STEP 4: Start local Postgres using Docker (creates container 'flowbit-db')"
try {
  docker ps -a --filter "name=flowbit-db" --format "{{.Names}}" | Out-String | ForEach-Object {$_} | Out-Null
  $exists = (docker ps -a --filter "name=flowbit-db" --format "{{.Names}}").Trim()
} catch {
  Write-Host "Docker not found or not running. Please install/start Docker Desktop and re-run this script."
  exit 1
}

if (-not $exists) {
  docker run --name flowbit-db -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -e POSTGRES_DB=flowbit -p 5432:5432 -d postgres
  Start-Sleep -Seconds 3
  Write-Host "Started Postgres container 'flowbit-db' on port 5432"
} else {
  Write-Host "Container 'flowbit-db' already exists."
}

# -------------------------
# STEP 5: Create .env (local) with DATABASE_URL if not present
# -------------------------
$envPath = ".env"
if (!(Test-Path $envPath)) {
  $dbUrl = "postgresql://admin:admin@localhost:5432/flowbit"
  @"
DATABASE_URL=$dbUrl
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath $envPath -Encoding utf8 -Force
  Write-Host "Created .env with local DATABASE_URL (postgres docker). Edit if you have a hosted DB."
} else {
  Write-Host ".env already exists — not overwriting."
}

# -------------------------
# STEP 6: Install node deps (root) and generate prisma client
# -------------------------
Write-Host "STEP 6: Install node dependencies and generate Prisma client"

# Run npm install in repo root (monorepo). This may take a while.
npm install

# Generate Prisma client
npx prisma generate

# -------------------------
# STEP 7: Run Prisma migrate & seed (safe: db push then seed)
# -------------------------
Write-Host "STEP 7: Apply Prisma schema (db push) and seed DB"
npx prisma db push
npx ts-node prisma/seed.ts

# -------------------------
# STEP 8: Start Vanna (Python) and API & Web (separate terminals recommended)
# -------------------------
Write-Host "STEP 8: Start services"
Write-Host "  A) Start Vanna (uvicorn) in this terminal in background (port 8000)"
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m","uvicorn","src.main:app","--host","0.0.0.0","--port","8000" -WorkingDirectory ".\services\vanna"

Start-Sleep -Seconds 2

# B) Start backend API (run in background)
if (Test-Path ".\apps\api\package.json") {
  Write-Host "Starting backend API (apps/api) in background on port 3001"
  Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command","cd .\apps\api; npm run dev" -WorkingDirectory ".\apps\api"
} else {
  Write-Host "WARNING: apps/api/package.json not found. If your backend is at a different path, start it manually."
}

Start-Sleep -Seconds 2

# C) Start frontend (apps/web)
if (Test-Path ".\apps\web\package.json") {
  Write-Host "Starting frontend (apps/web) in background on port 3000"
  Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command","cd .\apps\web; npm run dev" -WorkingDirectory ".\apps\web"
} else {
  Write-Host "WARNING: apps/web/package.json not found. Start frontend manually if necessary."
}

# -------------------------
# STEP 9: Quick verification: ping endpoints
# -------------------------
Start-Sleep -Seconds 4
Write-Host "Verifying common endpoints (this will print HTTP status or error):"
try {
  $s = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
  Write-Host "/health ->" $s.StatusCode
} catch {
  Write-Host "Could not reach backend /health at http://localhost:3001/health"
}
try {
  $s2 = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8000/status" -TimeoutSec 5 -ErrorAction Stop
  Write-Host "vanna /status ->" $s2.StatusCode
} catch {
  Write-Host "Could not reach vanna /status at http://localhost:8000/status"
}
try {
  $s3 = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
  Write-Host "frontend ->" $s3.StatusCode
} catch {
  Write-Host "Could not reach frontend at http://localhost:3000"
}

Write-Host "SCRIPT COMPLETE. If any step failed, inspect the printed errors and re-run the failing step manually."
Write-Host "Next recommended actions (if all services up): open http://localhost:3000 (frontend), http://localhost:3001/health (backend), http://localhost:8000/docs (vanna)."
