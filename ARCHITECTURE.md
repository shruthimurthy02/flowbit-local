# Flowbit Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                    (https://flowbit.vercel.app)              │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                        │
│                  Next.js 14 + TailwindCSS                   │
│                  Chart.js + shadcn/ui                       │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API (HTTPS)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Render)                       │
│              Express.js + Prisma + TypeScript                │
│                                                              │
│  Endpoints:                                                 │
│  - GET  /stats                                              │
│  - GET  /invoices                                           │
│  - GET  /vendors/top10                                      │
│  - GET  /category-spend                                     │
│  - GET  /cash-outflow                                       │
│  - GET  /invoice-trends                                     │
│  - POST /chat-with-data                                     │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
             │ Proxy                        │ Prisma ORM
             ▼                               ▼
┌─────────────────────────┐    ┌──────────────────────────────┐
│   Vanna AI Service      │    │    PostgreSQL Database       │
│      (Render)           │    │      (Render/Supabase)       │
│   FastAPI + Python      │    │                              │
│                         │    │  Tables:                     │
│  Endpoints:             │    │  - Vendor                    │
│  - GET  /status         │    │  - Customer                   │
│  - POST /query          │    │  - Invoice                   │
│                         │    │  - LineItem                  │
│  Executes SQL queries   │    │  - Payment                   │
│  Returns results        │    │                              │
└─────────────────────────┘    └──────────────────────────────┘
```

## 🔄 Data Flow

### Dashboard Data Flow
```
User → Frontend → Backend API → PostgreSQL → Results → Frontend → Charts
```

### Chat with Data Flow
```
User Question → Frontend → Backend API → Vanna Service → PostgreSQL → SQL Results → Backend → Frontend → Display
```

## 📦 Component Details

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + shadcn/ui components
- **Charts**: Chart.js + react-chartjs-2
- **Data Fetching**: SWR for real-time updates
- **Deployment**: Vercel

### Backend API (Express)
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma for database access
- **Routes**: Modular route handlers
- **CORS**: Configured for Vercel domain
- **Deployment**: Render

### Vanna AI Service (FastAPI)
- **Framework**: FastAPI (Python)
- **Database**: Direct PostgreSQL connection via psycopg
- **Function**: Executes SQL queries from natural language
- **Deployment**: Render

### Database (PostgreSQL)
- **Provider**: Render PostgreSQL or Supabase
- **Schema**: Managed via Prisma migrations
- **Data**: Seeded from `Analytics_Test_Data.json`

## 🔐 Security

- **HTTPS**: All services use HTTPS
- **CORS**: Configured for specific origins
- **Environment Variables**: Secrets stored securely
- **Database**: SSL connections required
- **API Keys**: Stored in environment variables

## 📊 API Endpoints

### Backend API
- `GET /health` - Health check
- `GET /stats` - Overview statistics
- `GET /invoice-trends` - Monthly trends
- `GET /vendors/top10` - Top vendors
- `GET /category-spend` - Category breakdown
- `GET /cash-outflow` - Cash flow forecast
- `GET /invoices` - Paginated invoice list
- `POST /chat-with-data` - Chat proxy to Vanna

### Vanna Service
- `GET /` - Root health check
- `GET /status` - Status endpoint
- `POST /query` - Execute SQL query

## 🚀 Deployment Architecture

### Production URLs
- **Frontend**: `https://flowbit.vercel.app`
- **Backend**: `https://flowbit-api.onrender.com`
- **Vanna**: `https://flowbit-vanna.onrender.com`
- **Database**: Render PostgreSQL or Supabase

### Environment Variables

**Frontend (Vercel)**
```env
NEXT_PUBLIC_API_BASE_URL=https://flowbit-api.onrender.com
NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
```

**Backend (Render)**
```env
DATABASE_URL=postgresql://user:password@host:5432/flowbit_db?sslmode=require
VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://flowbit.vercel.app
```

**Vanna (Render)**
```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/flowbit_db?sslmode=require
GROQ_API_KEY=your_groq_api_key
PORT=8000
```

## 🔄 Request/Response Flow

### Example: Dashboard Stats Request
1. User opens dashboard
2. Frontend calls `GET /stats`
3. Backend queries PostgreSQL via Prisma
4. Backend returns JSON: `{totalSpend, totalInvoicesProcessed, ...}`
5. Frontend displays in stat cards

### Example: Chat Query
1. User asks: "Show top 5 vendors by spend"
2. Frontend sends `POST /chat-with-data` with `{question: "..."}`
3. Backend proxies to Vanna: `POST /query` with `{query: "..."}`
4. Vanna executes SQL against PostgreSQL
5. Vanna returns `{status: "success", rows: [...]}`
6. Backend formats and returns to frontend
7. Frontend displays SQL + results table

## 📈 Scalability

- **Frontend**: Vercel CDN for global distribution
- **Backend**: Render auto-scaling
- **Vanna**: Render auto-scaling
- **Database**: Render PostgreSQL with connection pooling

## 🔍 Monitoring

- **Vercel Analytics**: Frontend performance
- **Render Metrics**: Backend/Vanna performance
- **Database Monitoring**: Query performance
- **Error Tracking**: Optional (Sentry, etc.)

## 🎯 Future Enhancements

- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] WebSocket for real-time updates
- [ ] Advanced AI query generation
- [ ] Multi-tenant support
- [ ] Export functionality (PDF, CSV)

