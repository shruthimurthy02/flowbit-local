# Flowbit - Analytics Dashboard & AI Chat Interface

A production-grade full-stack analytics platform with interactive dashboard and AI-powered chat interface for querying invoice and payment data.

## 🎉 Project Status

- ✅ **Local Development:** Fully functional
- ✅ **Database:** Seeded with real data
- ✅ **Backend API:** All endpoints working
- ✅ **Frontend:** Dashboard + Chat interface ready
- ✅ **Vanna AI:** Service ready
- ✅ **Deployment:** Configuration files ready

## ✨ Features

- **Analytics Dashboard**: Real-time metrics, charts, and invoice management
- **Chat with Data**: Natural language queries powered by Vanna AI
- **Invoice Management**: Search, filter, and view invoice details
- **Vendor Analytics**: Top vendors by spend, category breakdown
- **Cash Flow Forecasting**: Payment forecasts and trends

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (UI components)
- **Chart.js** + **react-chartjs-2** (Data visualization)
- **SWR** (Data fetching)

### Backend
- **Express.js** (REST API)
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Database)

### AI Service
- **FastAPI** (Python)
- **Vanna AI** (SQL generation)
- **Groq/OpenAI** (LLM integration)

## 📁 Project Structure

```
flowbit-intern-assignment/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── services/
│   └── vanna/        # FastAPI AI service
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Database seed script
├── data/
│   └── Analytics_Test_Data.json
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- Python 3.9+
- npm or yarn

### Local Setup

1. **Start Docker services:**
   ```powershell
   docker compose up -d
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   cd apps/api && npm install
   cd ../web && npm install
   ```

3. **Setup database:**
   ```powershell
   cd apps/api
   npx prisma generate
   npx prisma migrate deploy
   npx ts-node prisma/seed.ts
   ```

4. **Start services:**

   **Terminal 1 - Backend:**
   ```powershell
   cd apps/api
   npm run dev
   ```

   **Terminal 2 - Vanna:**
   ```powershell
   cd services/vanna
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app:app --reload --port 8000
   ```

   **Terminal 3 - Frontend:**
   ```powershell
   cd apps/web
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Vanna Service: http://localhost:8000
   - Adminer (Database UI): http://localhost:8080

## 📝 Environment Variables

### `apps/api/.env`
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔌 API Endpoints

### Stats
- `GET /stats` - Get overview statistics
  ```json
  {
    "totalSpend": 21670,
    "totalInvoicesProcessed": 5,
    "documentsUploaded": 5,
    "averageInvoiceValue": 4334
  }
  ```

### Invoice Trends
- `GET /invoice-trends` - Get monthly invoice trends

### Vendors
- `GET /vendors/top10` - Get top 10 vendors by spend

### Categories
- `GET /category-spend` - Get spending by category

### Cash Flow
- `GET /cash-outflow` - Get cash outflow forecast

### Invoices
- `GET /invoices` - Get paginated invoice list
  - Query params: `page`, `per_page`, `q` (search)

### Chat with Data
- `POST /chat-with-data` - Send natural language query
  - Body: `{ "question": "your question" }`

## 🗄️ Database Schema

### Models
- **Vendor**: Vendor information (id, name, category)
- **Customer**: Customer information (id, name, email)
- **Invoice**: Invoice details (id, invoiceNumber, vendorId, customerId, date, totalAmount, status)
- **LineItem**: Invoice line items (id, invoiceId, description, quantity, unitPrice)
- **Payment**: Payment records (id, invoiceId, amount, date)

See `apps/api/prisma/schema.prisma` for full schema definition.

## 🚀 Deployment

### Quick Deployment Guide

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Flowbit production ready"
   git remote add origin https://github.com/<your-username>/flowbit-assignment.git
   git push -u origin main
   ```

2. **Deploy Frontend (Vercel):**
   - Import repository
   - Root Directory: `apps/web`
   - Add environment variables
   - Deploy

3. **Deploy Backend (Render):**
   - Create Web Service
   - Root Directory: `apps/api`
   - Add environment variables
   - Deploy

4. **Deploy Vanna (Render):**
   - Create Web Service
   - Root Directory: `services/vanna`
   - Add environment variables
   - Deploy

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🐛 Troubleshooting

### Prisma EPERM Error

**Problem:** OneDrive file locking prevents Prisma Client generation

**Solution:**
1. Move project outside OneDrive (use `move-project-outside-onedrive.ps1`)
2. Close all IDEs and terminals
3. Regenerate: `npx prisma generate`

### Database Connection Issues

**Solution:**
1. Verify Docker containers: `docker ps`
2. Check DATABASE_URL in `.env`
3. Test connection: `docker exec flowbit_postgres psql -U postgres -c "SELECT 1;"`

### Seed Script Issues

**Solution:**
1. Verify data file: `Test-Path "data\Analytics_Test_Data.json"`
2. Run from `apps/api` directory
3. Check seed script output for path resolution

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment guide
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Complete setup instructions
- [SETUP_SUCCESS.md](./SETUP_SUCCESS.md) - Setup status

## 🎯 Production URLs

After deployment:
- **Frontend:** https://flowbit.vercel.app
- **Backend API:** https://flowbit-api.onrender.com
- **Vanna Service:** https://flowbit-vanna.onrender.com

## 📊 Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
│   Next.js 14    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Backend API   │
│   (Render)      │
│   Express       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Vanna   │ │PostgreSQL│
│ (Render)│ │ (Render) │
│ FastAPI │ │          │
└─────────┘ └──────────┘
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Express, Prisma, and Vanna AI**
