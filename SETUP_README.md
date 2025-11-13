# Setup Script - Automated Project Setup

This script automates the setup of the Flowbit Analytics Dashboard project.

## What it does

1. **Environment Setup**: Creates `.env` file if it doesn't exist
2. **TypeScript Config**: Ensures `apps/web/tsconfig.json` has the correct path aliases (`@/* => ./src/*`)
3. **Dependencies**: Installs all npm dependencies (root and workspaces)
4. **Docker**: Starts PostgreSQL and Adminer containers
5. **Prisma**: Generates Prisma client and runs migrations
6. **Database Seed**: Creates/updates seed script and populates the database
7. **Python Setup**: Sets up virtual environment for Vanna service
8. **Component Check**: Verifies shadcn/ui components exist

## Usage

### On Unix/Mac/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

### On Windows (Git Bash or WSL):
```bash
bash setup.sh
```

### On Windows (PowerShell):
You may need to run the commands manually or use WSL/Git Bash.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Docker** and **Docker Compose** (for PostgreSQL)
- **Python 3** (optional, for Vanna service)

## After Setup

Once the script completes, you'll need to start the services manually in separate terminals:

### 1. Start Backend API
```bash
cd apps/api
npm run dev
```

### 2. Start Frontend
```bash
cd apps/web
npm run dev
```

### 3. Start Vanna Service (optional)
```bash
cd services/vanna
# On Unix/Mac:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate
uvicorn app:app --reload --port 8000
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Adminer** (DB UI): http://localhost:8080
- **Vanna Service**: http://localhost:8000

## Troubleshooting

### Database Connection Issues
- Ensure Docker is running
- Check that PostgreSQL container is up: `docker ps`
- Verify `.env` has correct `DATABASE_URL`

### Prisma Issues
- Run `npx prisma generate` manually
- Check `prisma/schema.prisma` is valid
- Try `npx prisma db push` if migrations fail

### Seed Script Issues
- Verify `data/Analytics_Test_Data.json` exists
- Check seed script at `prisma/seed.ts`
- Run manually: `npx ts-node prisma/seed.ts`

### Python/Vanna Issues
- Ensure Python 3 is installed
- Check virtual environment: `ls services/vanna/.venv`
- Install manually: `pip install -r services/vanna/requirements.txt`

## Environment Variables

The script creates a `.env` file with these defaults:

```env
DATABASE_URL="postgresql://flowbit_user:flowbit_pass@localhost:5432/flowbit_db?schema=public"
API_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE=/api
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
GROQ_API_KEY=
NODE_ENV=development
```

## Manual Setup (if script fails)

If the automated script fails, you can run these steps manually:

1. **Install dependencies**: `npm install`
2. **Start Docker**: `docker compose up -d`
3. **Generate Prisma client**: `npx prisma generate`
4. **Run migrations**: `npx prisma migrate dev`
5. **Seed database**: `npx ts-node prisma/seed.ts`
6. **Setup Python venv**: `python3 -m venv services/vanna/.venv && source services/vanna/.venv/bin/activate && pip install -r services/vanna/requirements.txt`

## Notes

- The script preserves existing `prisma/seed.ts` if it's compatible
- Docker containers are started in detached mode (`-d`)
- PostgreSQL waits up to 20 seconds to be ready
- The script is idempotent - safe to run multiple times

