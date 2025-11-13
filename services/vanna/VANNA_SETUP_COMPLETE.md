# Vanna AI Service - Setup Complete ✅

## Status

- ✅ `app.py` created with FastAPI service
- ✅ Virtual environment exists (`.venv`)
- ✅ Dependencies installed:
  - fastapi
  - uvicorn
  - psycopg[binary]
  - pydantic
- ✅ Service running on http://127.0.0.1:8000

## Endpoints

### Health Check
- **GET** `/health`
- **Response:** `{"status": "ok", "message": "Vanna service running"}`

### Chat Endpoint
- **POST** `/chat`
- **Body:** `{"question": "your question"}`
- **Response:** `{"sql": "...", "results": [...]}`

## Running the Service

```powershell
cd C:\Users\shrut\flowbit-local\services\vanna
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

## Testing

### Health Check
```powershell
curl http://127.0.0.1:8000/health
```

### Chat Endpoint
```powershell
curl -X POST http://127.0.0.1:8000/chat `
  -H "Content-Type: application/json" `
  -d '{"question": "test"}'
```

### Swagger UI
Visit: http://127.0.0.1:8000/docs

## Configuration

The service uses the following environment variable:
- `DATABASE_URL` (defaults to `postgresql://postgres:admin123@localhost:5432/flowbit_db`)

## Notes

⚠️ **SQL Query Note:** The current SQL query in `/chat` endpoint references:
- `vendor_name` column
- `amount` column

Based on the Prisma schema, you may need to adjust the SQL to:
- Join with `Vendor` table for vendor name
- Use `totalAmount` instead of `amount`

The service is running and ready to use! 🚀

