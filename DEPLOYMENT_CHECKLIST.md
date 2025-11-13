# Flowbit Deployment Checklist

## ✅ Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in code
- [ ] Environment variables documented
- [ ] Build scripts tested locally
- [ ] All dependencies in package.json/requirements.txt

### Local Verification
- [ ] Backend API runs locally (`npm run dev` in `apps/api`)
- [ ] Vanna service runs locally (`uvicorn app:app --reload --port 8000`)
- [ ] Frontend runs locally (`npm run dev` in `apps/web`)
- [ ] All API endpoints return data
- [ ] Database seeded with test data
- [ ] Chat interface works end-to-end

## 🗄️ Database Setup

### Render PostgreSQL
- [ ] PostgreSQL instance created
- [ ] Database name: `flowbit_db`
- [ ] Connection string copied
- [ ] Database credentials secured

### Alternative: Supabase
- [ ] Supabase project created
- [ ] Connection string copied
- [ ] Database credentials secured

## 🚀 Render Deployment

### Backend API (`flowbit-api`)
- [ ] Web service created
- [ ] Repository connected
- [ ] Root directory: `apps/api`
- [ ] Build command: `npm install && npx prisma generate && npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `VANNA_API_BASE_URL`
  - [ ] `PORT=3001`
  - [ ] `NODE_ENV=production`
  - [ ] `ALLOWED_ORIGINS`
- [ ] Service deployed
- [ ] Health check: `https://flowbit-api.onrender.com/health`
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Database seeded (optional)

### Vanna Service (`flowbit-vanna`)
- [ ] Web service created
- [ ] Repository connected
- [ ] Root directory: `services/vanna`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `GROQ_API_KEY` (optional)
  - [ ] `PORT=8000`
- [ ] Service deployed
- [ ] Health check: `https://flowbit-vanna.onrender.com/status`

## 🌐 Vercel Deployment

### Frontend (`flowbit`)
- [ ] Project imported from GitHub
- [ ] Framework: Next.js
- [ ] Root directory: `apps/web`
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_API_BASE_URL`
  - [ ] `NEXT_PUBLIC_API_URL`
- [ ] Project deployed
- [ ] Custom domain configured (optional)

## 🔍 Post-Deployment Verification

### Backend API
- [ ] `GET /health` → `{"status":"ok"}`
- [ ] `GET /stats` → Returns statistics
- [ ] `GET /invoices` → Returns invoice list
- [ ] `GET /vendors/top10` → Returns top vendors
- [ ] `GET /category-spend` → Returns category breakdown
- [ ] `GET /cash-outflow` → Returns cash flow forecast
- [ ] `POST /chat-with-data` → Returns SQL + results

### Vanna Service
- [ ] `GET /` → `{"status":"ok"}`
- [ ] `GET /status` → `{"status":"ok"}`
- [ ] `POST /query` → Executes SQL and returns results

### Frontend
- [ ] Homepage loads
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] Invoice table shows data
- [ ] Chat interface works
- [ ] API calls succeed (check Network tab)
- [ ] No console errors
- [ ] No CORS errors

### Integration
- [ ] Frontend → Backend API communication works
- [ ] Backend → Vanna service communication works
- [ ] Vanna → Database queries work
- [ ] CORS configured correctly
- [ ] All HTTPS connections secure

## 🔒 Security

- [ ] Strong database passwords used
- [ ] HTTPS enabled everywhere
- [ ] CORS configured (specific origins, not *)
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] API keys stored securely
- [ ] Database backups enabled

## 📊 Monitoring

- [ ] Vercel Analytics enabled (Frontend)
- [ ] Render Metrics monitored (Backend/Vanna)
- [ ] Error tracking configured (optional)
- [ ] Database monitoring enabled

## 📝 Documentation

- [ ] README.md updated with deployment URLs
- [ ] DEPLOYMENT_GUIDE.md complete
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide included

## 🎥 Demo Preparation

- [ ] Dashboard walkthrough prepared
- [ ] Chart demonstrations ready
- [ ] Chat interface demo ready
- [ ] API endpoint demonstrations
- [ ] Deployment process documented

## ✅ Final Verification

### Functional Tests
- [ ] All API endpoints return data
- [ ] Frontend displays correct information
- [ ] Charts render with real data
- [ ] Search and filtering work
- [ ] Chat interface generates SQL
- [ ] Chat interface displays results

### Performance Tests
- [ ] Page load times acceptable
- [ ] API response times reasonable
- [ ] Database queries optimized

### Security Tests
- [ ] No exposed secrets
- [ ] CORS properly configured
- [ ] HTTPS everywhere
- [ ] Input validation working

## 🎉 Deployment Complete!

Once all items are checked:
- ✅ All services deployed
- ✅ All endpoints verified
- ✅ Frontend working
- ✅ Documentation complete

**Your Flowbit application is live in production!** 🚀

