from fastapi import FastAPI
from pydantic import BaseModel
import psycopg
import os

# ✅ Initialize FastAPI app
app = FastAPI()

# ✅ Health check routes
@app.get("/")
def root():
    return {"status": "ok", "message": "Vanna service running"}

@app.get("/status")
def status():
    return {"status": "ok", "message": "Vanna service running"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "Vanna service running"}

# ✅ Define model for user query
class QueryRequest(BaseModel):
    query: str

# ✅ Query endpoint
@app.post("/query")
def run_query(req: QueryRequest):
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:admin123@localhost:5432/flowbit_db")
    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute(req.query)
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description]
                results = [dict(zip(columns, row)) for row in rows]
                # Include a generic 'answer' alongside raw rows for compatibility
                return {"status": "success", "answer": "Query executed successfully", "rows": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

