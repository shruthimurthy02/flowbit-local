# Production Environment Variables Template

Copy these environment variables to your deployment platforms.

## 🌐 Frontend (Vercel)

### Environment Variables
```
NEXT_PUBLIC_API_BASE_URL=https://flowbit-api.onrender.com
NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
```

### How to Set
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable
5. Select **Production** environment
6. Save and redeploy

## 🔧 Backend API (Render)

### Environment Variables
```
DATABASE_URL=postgresql://user:password@host:5432/flowbit_db?sslmode=require
VANNA_API_BASE_URL=https://flowbit-vanna.onrender.com
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://flowbit.vercel.app
```

### How to Set
1. Go to Render Dashboard
2. Select `flowbit-api` service
3. Go to **Environment** tab
4. Add each variable
5. Save and redeploy

### Notes
- Replace `DATABASE_URL` with your actual PostgreSQL connection string
- Replace `ALLOWED_ORIGINS` with your actual Vercel domain
- Include `?sslmode=require` for secure connections

## 🤖 Vanna AI Service (Render)

### Environment Variables
```
DATABASE_URL=postgresql+psycopg://user:password@host:5432/flowbit_db?sslmode=require
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
VANNA_MAX_ROWS=200
```

### How to Set
1. Go to Render Dashboard
2. Select `flowbit-vanna` service
3. Go to **Environment** tab
4. Add each variable
5. Save and redeploy

### Notes
- Use `postgresql+psycopg://` prefix for Python psycopg driver
- `GROQ_API_KEY` is optional (for LLM integration)
- Replace `DATABASE_URL` with your actual PostgreSQL connection string

## 🔐 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use strong passwords** for database
3. **Enable SSL** for all database connections
4. **Rotate API keys** regularly
5. **Use environment-specific** variables
6. **Restrict CORS** to specific origins
7. **Enable HTTPS** everywhere

## 📝 Local Development

For local development, use these values:

### `apps/api/.env`
```
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/flowbit_db?schema=public"
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `services/vanna/.env`
```
DATABASE_URL=postgresql+psycopg://postgres:admin123@localhost:5432/flowbit_db
PORT=8000
```

## ✅ Verification

After setting environment variables:

1. **Backend**: Check `https://flowbit-api.onrender.com/health`
2. **Vanna**: Check `https://flowbit-vanna.onrender.com/status`
3. **Frontend**: Check `https://flowbit.vercel.app`

All should return successful responses.

