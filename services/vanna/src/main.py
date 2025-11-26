import os
import json
import re
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg import connect, Error
from psycopg.rows import dict_row

import httpx
from dotenv import load_dotenv

# ---------------------------------------------------------
# Load .env FIRST
# ---------------------------------------------------------
load_dotenv()

app = FastAPI(title="Vanna SQL Generation Service")

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # For production, restrict origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Environment Variables
# ---------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
API_KEY = os.getenv("VANNA_API_KEY")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------
class ChatRequest(BaseModel):
    query: str
    question: Optional[str] = None

class ChatResponse(BaseModel):
    sql: str
    rows: list
    notes: Optional[str] = None

# ---------------------------------------------------------
# Validate SQL is safe (read-only)
# ---------------------------------------------------------
def validate_sql(sql: str) -> bool:
    sql_upper = sql.strip().upper()

    # Remove comments
    sql_upper = re.sub(r"--.*", "", sql_upper)
    sql_upper = re.sub(r"/\*.*?\*/", "", sql_upper, flags=re.DOTALL)

    dangerous_keywords = [
        "INSERT", "UPDATE", "DELETE", "DROP", "CREATE",
        "ALTER", "TRUNCATE", "GRANT", "REVOKE", "EXEC",
        "EXECUTE", "CALL"
    ]

    for word in dangerous_keywords:
        if word in sql_upper:
            return False

    return sql_upper.startswith("SELECT")

# ---------------------------------------------------------
# Extract SQL from LLM response
# ---------------------------------------------------------
def extract_sql_from_response(text: str) -> Optional[str]:
    # Try JSON
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict) and "sql" in parsed:
            return parsed["sql"]
    except:
        pass

    # Look inside ```sql blocks
    match = re.search(r"```(?:sql)?\s*(SELECT.*?)```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    # Fallback: any SELECT
    match = re.search(r"(SELECT.*?)(;|$)", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    return None

# ---------------------------------------------------------
# Generate SQL via Groq API
# ---------------------------------------------------------
async def generate_sql_with_groq(question: str) -> tuple[str, str]:
    schema_info = """
    Database Schema:
    - vendors(id, name, email, phone, address, category)
    - customers(id, name, email, phone, address)
    - invoices(id, invoiceNumber, vendorId, customerId, issueDate, dueDate, status, subtotal, tax, totalAmount, notes, categoryId)
    - line_items(id, invoiceId, description, category, quantity, unitPrice, amount, tax)
    - payments(id, invoiceId, amount, paymentDate, method, reference)
    - categories(id, name)
    """

    prompt = f"""
You are a SQL expert. Generate a PostgreSQL SELECT query.

{schema_info}

Question: {question}

Rules:
1. Output JSON ONLY: {{"sql": "SELECT ...", "notes": "explanation"}}
2. Query must be READ-ONLY (SELECT only)
3. Use correct JOINs
4. Use GROUP BY / ORDER BY when needed
5. Limit result to 200 rows
"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "mixtral-8x7b-32768",
                    "messages": [
                        {"role": "system", "content": "Always return JSON with 'sql' and 'notes'."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 2000,
                },
            )

            if res.status_code != 200:
                raise HTTPException(500, f"Groq API Error: {res.text}")

            content = res.json()["choices"][0]["message"]["content"]

            # Try JSON
            try:
                parsed = json.loads(content)
                sql = parsed.get("sql")
                notes = parsed.get("notes", "Generated SQL")
            except:
                sql = extract_sql_from_response(content)
                notes = "Generated SQL"

            if not sql:
                raise ValueError("Groq response did not contain valid SQL.")

            return sql, notes

    except Exception as e:
        raise HTTPException(500, f"Groq SQL generation failed: {e}")

# ---------------------------------------------------------
# Execute SQL in database (read-only)
# ---------------------------------------------------------
def execute_sql_readonly(sql: str, max_rows: int = 200) -> list:
    if not validate_sql(sql):
        raise HTTPException(400, "Invalid SQL: Only SELECT queries allowed.")

    try:
        conn = connect(DATABASE_URL)
        cursor = conn.cursor(row_factory=dict_row)

        # Force LIMIT
        if "LIMIT" not in sql.upper():
            sql = f"{sql.rstrip(';')} LIMIT {max_rows}"

        cursor.execute(sql)
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return [dict(r) for r in rows]

    except Error as e:
        raise HTTPException(500, f"Database Error: {e}")
    except Exception as e:
        raise HTTPException(500, f"Query execution error: {e}")

# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------
@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(401, "Invalid API key")

    question = request.question or request.query

    sql, notes = await generate_sql_with_groq(question)
    rows = execute_sql_readonly(sql)

    return ChatResponse(sql=sql, rows=rows, notes=notes)


@app.post("/query")
async def query_alias(request: ChatRequest, x_api_key: Optional[str] = Header(None)):
    return await chat(request, x_api_key)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/status")
async def status():
    return {"status": "ok", "message": "Vanna is running"}


# ---------------------------------------------------------
# Local Dev Entrypoint
# ---------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)









