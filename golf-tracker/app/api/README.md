# Golf Tracker API

Minimal FastAPI starter for the Golf Tracker app.

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Endpoints

- `GET /` returns a basic status message.
- `GET /health` returns a simple health check response.
