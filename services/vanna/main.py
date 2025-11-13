import os
import json
import re
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Vanna SQL Generation Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
API_KEY = os.getenv("VANNA_API_KEY")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")


class SQLRequest(BaseModel):
    question: str


class SQLResponse(BaseModel):
    sql: str
    notes: str
    results: list


def validate_sql(sql: str) -> bool:
    """Ensure SQL is read-only (SELECT only)"""
    sql_upper = sql.strip().upper()
    # Remove comments
    sql_upper = re.sub(r"--.*", "", sql_upper)
    sql_upper = re.sub(r"/\*.*?\*/", "", sql_upper, flags=re.DOTALL)
    
    # Check for dangerous keywords
    dangerous_keywords = [
        "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
        "TRUNCATE", "GRANT", "REVOKE", "EXEC", "EXECUTE", "CALL"
    ]
    
    for keyword in dangerous_keywords:
        if keyword in sql_upper:
            return False
    
    # Must start with SELECT
    if not sql_upper.startswith("SELECT"):
        return False
    
    return True


def extract_sql_from_response(text: str) -> Optional[str]:
    """Extract SQL from LLM response, handling JSON and markdown formats"""
    # Try to parse as JSON first
    try:
        data = json.loads(text)
        if isinstance(data, dict) and "sql" in data:
            return data["sql"]
        if isinstance(data, str):
            text = data
    except:
        pass
    
    # Try to extract from markdown code blocks
    sql_match = re.search(r"```(?:sql)?\s*(SELECT.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
    if sql_match:
        return sql_match.group(1).strip()
    
    # Try to find SQL statement directly
    sql_match = re.search(r"(SELECT.*?)(?:;|$)", text, re.DOTALL | re.IGNORECASE)
    if sql_match:
        return sql_match.group(1).strip()
    
    return None


async def generate_sql_with_groq(question: str) -> tuple[str, str]:
    """Generate SQL using Groq API"""
    
    # Schema information for context
    schema_info = """
    Database Schema:
    - vendors: id, vendorId, name, email, phone, address
    - customers: id, customerId, name, email, phone, address
    - invoices: id, invoiceId, invoiceNumber, vendorId, customerId, issueDate, dueDate, status, subtotal, tax, total, notes
    - line_items: id, invoiceId, description, category, quantity, unitPrice, amount
    - payments: id, invoiceId, amount, paymentDate, method, reference
    
    Relationships:
    - invoices.vendorId -> vendors.id
    - invoices.customerId -> customers.id
    - line_items.invoiceId -> invoices.id
    - payments.invoiceId -> invoices.id
    """
    
    prompt = f"""You are a SQL expert. Generate a PostgreSQL SELECT query to answer the following question.

{schema_info}

Question: {question}

Requirements:
1. Generate ONLY a SELECT query (read-only)
2. Use proper JOINs to connect related tables
3. Return the result in JSON format: {{"sql": "SELECT ...", "notes": "Brief explanation"}}
4. Keep the SQL query clean and well-formatted
5. Use appropriate WHERE clauses, GROUP BY, ORDER BY as needed
6. Limit results to 200 rows if needed

Response:"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "mixtral-8x7b-32768",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a SQL expert. Always return valid JSON with 'sql' and 'notes' fields."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 2000,
                },
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Groq API error: {response.text}"
                )
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Try to parse as JSON
            try:
                parsed = json.loads(content)
                sql = parsed.get("sql", "")
                notes = parsed.get("notes", "Generated SQL query")
            except:
                # Extract SQL from text
                sql = extract_sql_from_response(content)
                notes = "Generated SQL query"
                if not sql:
                    raise ValueError("Could not extract SQL from response")
            
            return sql, notes
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Groq API timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling Groq API: {str(e)}")


def execute_sql_readonly(sql: str, max_rows: int = 200) -> list:
    """Execute SQL query in read-only mode with safety checks"""
    
    if not validate_sql(sql):
        raise HTTPException(status_code=400, detail="Invalid SQL: Only SELECT queries are allowed")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Add LIMIT if not present and query might return many rows
        if "LIMIT" not in sql.upper():
            sql = f"{sql.rstrip(';')} LIMIT {max_rows}"
        
        cursor.execute(sql)
        results = cursor.fetchall()
        
        # Convert to list of dicts
        rows = [dict(row) for row in results]
        
        cursor.close()
        conn.close()
        
        return rows
        
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing query: {str(e)}")


@app.post("/generate-sql", response_model=SQLResponse)
async def generate_sql(
    request: SQLRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    """Generate SQL from natural language question and execute it"""
    
    # Optional API key check
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not request.question:
        raise HTTPException(status_code=400, detail="question is required")
    
    try:
        # Generate SQL
        sql, notes = await generate_sql_with_groq(request.question)
        
        # Execute SQL
        results = execute_sql_readonly(sql)
        
        return SQLResponse(
            sql=sql,
            notes=notes,
            results=results
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


