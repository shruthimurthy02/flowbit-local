# Vanna Service

FastAPI service for generating SQL from natural language questions using Groq.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the service:
```bash
uvicorn main:app --reload --port 8000
```

## API

### POST /generate-sql

Generate and execute SQL from a natural language question.

**Request:**
```json
{
  "question": "What are the top 5 vendors by total spend?"
}
```

**Response:**
```json
{
  "sql": "SELECT ...",
  "notes": "Brief explanation",
  "results": [...]
}
```


