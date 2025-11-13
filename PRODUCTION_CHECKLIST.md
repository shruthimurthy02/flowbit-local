# Flowbit Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in code
- [ ] Environment variables documented
- [ ] Build scripts tested locally

### Database
- [ ] Production database created
- [ ] Connection string obtained
- [ ] Migrations tested
- [ ] Seed script tested
- [ ] Backup strategy in place

### Services
- [ ] Backend API tested locally
- [ ] Vanna service tested locally
- [ ] Frontend tested locally
- [ ] All endpoints verified
- [ ] Error handling implemented

## 🚀 Deployment Steps

### 1. Database Setup
- [ ] PostgreSQL instance created (Render/Neon)
- [ ] Connection string copied
- [ ] Database credentials secured

### 2. Backend API (Render)
- [ ] Web service created
- [ ] Repository connected
- [ ] Root directory set: `apps/api`
- [ ] Build command: `npm install && npm run build`
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

### 3. Vanna Service (Render)
- [ ] Web service created
- [ ] Repository connected
- [ ] Root directory set: `services/vanna`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `GROQ_API_KEY`
  - [ ] `PORT=8000`
- [ ] Service deployed
- [ ] Health check: `https://flowbit-vanna.onrender.com/health`

### 4. Frontend (Vercel)
- [ ] Project imported from GitHub
- [ ] Framework: Next.js
- [ ] Root directory: `apps/web`
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_API_BASE`
  - [ ] `NEXT_PUBLIC_API_URL`
- [ ] Project deployed
- [ ] Custom domain configured (optional)

## 🔍 Post-Deployment Verification

### Backend API
- [ ] Health endpoint: `https://flowbit-api.onrender.com/health`
- [ ] Stats endpoint: `https://flowbit-api.onrender.com/stats`
- [ ] Invoices endpoint: `https://flowbit-api.onrender.com/invoices`
- [ ] Vendors endpoint: `https://flowbit-api.onrender.com/vendors/top10`
- [ ] Category endpoint: `https://flowbit-api.onrender.com/category-spend`
- [ ] Cash outflow endpoint: `https://flowbit-api.onrender.com/cash-outflow`
- [ ] Chat endpoint: `POST https://flowbit-api.onrender.com/chat-with-data`

### Vanna Service
- [ ] Health endpoint: `https://flowbit-vanna.onrender.com/health`
- [ ] Query endpoint: `POST https://flowbit-vanna.onrender.com/query`
- [ ] Swagger UI: `https://flowbit-vanna.onrender.com/docs`

### Frontend
- [ ] Homepage loads: `https://flowbit.vercel.app`
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] Invoice table shows data
- [ ] Chat interface works
- [ ] API calls succeed (check Network tab)
- [ ] No console errors

### Integration
- [ ] Frontend → Backend API communication works
- [ ] Backend → Vanna service communication works
- [ ] Vanna → Database queries work
- [ ] CORS configured correctly
- [ ] All HTTPS connections secure

## 🔒 Security Checklist

- [ ] Strong database passwords used
- [ ] HTTPS enabled everywhere
- [ ] CORS configured (specific origins, not *)
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] API keys stored securely
- [ ] Database backups enabled
- [ ] Rate limiting considered

## 📊 Monitoring Setup

- [ ] Vercel Analytics enabled (Frontend)
- [ ] Render Metrics monitored (Backend/Vanna)
- [ ] Error tracking configured (optional)
- [ ] Database monitoring enabled
- [ ] Uptime monitoring (optional)

## 📝 Documentation

- [ ] README.md updated
- [ ] Deployment guide complete
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
- [ ] No memory leaks

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

