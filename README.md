# Resume Enhancer

Integrated resume optimization app with:
- a FastAPI backend (`backend/`)
- a Vite + React frontend (`frontend/`)
- a standalone `resumeai/` app source (now componentized and also integrated into `frontend` UI flow)

The primary app to run is `frontend + backend`.

## Requirements

- Python `3.10+`
- Node.js `18+` (recommended `20+`)
- npm `9+`
- A Google Gemini API key

## Quick Start (Local)

### 1) Run backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`.

### 2) Run frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3) Configure frontend API URL

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

Restart frontend after changing `.env`.

### 4) Use the app

1. Open `http://localhost:5173`
2. Click settings (top-right)
3. Paste Gemini API key
4. Paste JD URL/text
5. Upload resume PDF
6. Parse JD -> Optimize -> Export

## What Runs Where

- **Frontend** (`frontend/`):
  - ResumeAI-style 3-step UI (Input, Optimize, Export)
  - Stores API key/model in browser LocalStorage
  - Sends key to backend in `X-API-Key` header

- **Backend** (`backend/`):
  - Resume extraction and Gemini calls
  - Exposes both legacy and ResumeAI-integrated endpoints

## API Endpoints

### Legacy endpoints

- `POST /process`  
  Form: `jd`, `resume` (PDF/DOCX)

- `POST /process-source`  
  Form: `jd`, `source` (text)

### ResumeAI integration endpoints

- `POST /resumeai/parse-jd`  
  Form: `jd_url` or `jd_text`

- `POST /resumeai/optimize`  
  Form: `resume_text`, `jd_summary` (JSON string), `latex_template`

### Common headers

- `X-API-Key: <gemini_api_key>` (required)
- `X-Gemini-Model: <model_id>` (optional)

## Health Checks

- Root: `GET /`
- Health: `GET /health`
- Swagger: `http://localhost:8000/docs`

## Optional: Run standalone `resumeai/`

`resumeai/` is preserved as a standalone app source:

```bash
cd resumeai
npm install
npm run dev
```

Note: standalone `resumeai` uses a frontend build-time key (`process.env.GEMINI_API_KEY`) by default.  
Integrated production flow is through `frontend + backend`.

## Common Issues

- **401 Invalid API key**
  - Re-open settings, update key
- **429 Rate limit**
  - Retry later or switch model
- **CORS error**
  - Ensure frontend URL is allowed in `backend/main.py`
- **Frontend calls wrong backend**
  - Check `frontend/.env` -> `VITE_API_URL`
- **PDF parse fails**
  - Try a text-based PDF (not scanned image-only PDF)

## Project Structure

```text
resume-enhancer/
├── backend/
│   ├── main.py
│   ├── gemini_client.py
│   ├── text_extraction.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── utils/
│   └── package.json
├── resumeai/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── types.ts
│   └── package.json
└── README.md
```

