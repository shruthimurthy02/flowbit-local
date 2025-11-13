# NEXT STEPS

## Quick Start Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env` in root directory
- [ ] Update `.env` with your Groq API key: `GROQ_API_KEY=your-key-here`
- [ ] Configure `DATABASE_URL` if using a different database
- [ ] Set `VANNA_API_BASE_URL` (default: http://localhost:8000)
- [ ] Set `ALLOWED_ORIGINS` for CORS (include your frontend URL)

### 2. Database Setup
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### 3. Start Services

**Option A: Using Turborepo (Recommended)**
```bash
npm run dev
```

**Option B: Manual Start (3 terminals)**

Terminal 1 - API:
```bash
cd apps/api
npm run dev
```

Terminal 2 - Vanna Service:
```bash
cd services/vanna
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Terminal 3 - Frontend:
```bash
cd apps/web
npm run dev
```

### 4. Verify Services
- [ ] API: http://localhost:3001/health
- [ ] Vanna: http://localhost:8000/health
- [ ] Frontend: http://localhost:3000

### 5. Test Dashboard
- [ ] Navigate to Dashboard tab
- [ ] Verify stats cards display data
- [ ] Check invoice trends chart
- [ ] Verify top vendors chart
- [ ] Check category spend pie chart
- [ ] Test invoices table search and sort

### 6. Test Chat with Data
- [ ] Navigate to Chat with Data tab
- [ ] Ask: "What are the top 5 vendors by total spend?"
- [ ] Verify SQL is generated
- [ ] Check results table displays
- [ ] Test auto-chart generation (if results have date+numeric fields)

## Demo Recording Checklist

Before recording your demo:

1. **Database Seeded**: Ensure all test data is loaded
2. **All Services Running**: API, Vanna, Frontend
3. **Dashboard Features**:
   - Stats overview cards
   - Invoice trends line chart
   - Top vendors bar chart
   - Category spend pie chart
   - Invoices table with search/sort
4. **Chat Features**:
   - Natural language question input
   - SQL generation display
   - Results table
   - Auto-chart for date+numeric data
5. **Error Handling**: Show graceful error messages

## Common Issues

### Database Connection
- Ensure PostgreSQL is running: `docker-compose ps`
- Check `DATABASE_URL` in `.env`
- Verify database exists: `docker-compose exec postgres psql -U postgres -l`

### Vanna Service Not Responding
- Check Groq API key is set
- Verify Python dependencies: `pip install -r requirements.txt`
- Check service logs for errors

### CORS Errors
- Add frontend URL to `ALLOWED_ORIGINS` in API `.env`
- Restart API server after changes

### Prisma Client Not Generated
```bash
cd apps/api
npx prisma generate --schema=./prisma/schema.prisma
```

## Deployment Notes

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy

### Backend (Vercel Serverless)
1. Create `api/` folder in `apps/api` for serverless functions
2. Or deploy as separate Node.js service
3. Set all environment variables

### Vanna Service (Render/Railway/Fly.io)
1. Set root directory to `services/vanna`
2. Configure build: `pip install -r requirements.txt`
3. Configure start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables (DATABASE_URL, GROQ_API_KEY, etc.)

### Database (Production)
- Use managed PostgreSQL (Vercel Postgres, Supabase, Neon, Railway)
- Update `DATABASE_URL` in all services
- Run migrations: `npm run db:migrate`
- Seed production data as needed

## Example Questions for Chat

- "What are the top 5 vendors by total spend?"
- "Show me all invoices from January 2024"
- "What is the total revenue by month?"
- "Which customers have overdue invoices?"
- "What categories have the highest spending?"
- "Show me payments made in February 2024"


