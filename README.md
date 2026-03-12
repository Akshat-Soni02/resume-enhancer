# Resume Optimizer

A full-stack web application that compares a user's resume against a job description using Google Gemini API, providing granular, actionable feedback.

## Features

- **Secure API Key Management**: Store Gemini API key in browser LocalStorage (never sent to backend storage)
- **Auto-Trigger Processing**: Automatically processes when both job description and resume are provided
- **Drag & Drop Upload**: Easy file upload for PDF and DOCX resumes
- **Comprehensive Analysis**: 
  - Match score (0-100)
  - Critical gaps and irrelevance detection
  - Actionable suggested edits
- **Modern UI**: Clean, minimalist design with smooth animations

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: FastAPI (Python)
- **LLM**: Google Gemini API
- **File Processing**: PyMuPDF (PDF), python-docx (DOCX)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Set API Key**: Click the settings icon in the top-right corner and enter your Google Gemini API key. This is stored locally in your browser.

2. **Enter Job Description**: Paste the job description in the text area.

3. **Upload Resume**: Drag and drop or click to upload your resume (PDF or DOCX, max 10MB).

4. **Automatic Processing**: Once both the job description and resume are provided, processing will start automatically.

5. **Review Results**: View your match score, gaps, and suggested edits in an easy-to-read format.

## API Endpoints

### POST `/process`

Process a resume against a job description.

**Headers:**
- `X-API-Key`: Your Gemini API key

**Form Data:**
- `jd`: Job description (string)
- `resume`: Resume file (PDF or DOCX)

**Response:**
```json
{
  "score": 85,
  "analysis": {
    "critical_gaps_and_irrelevance": [...]
  },
  "suggested_edits": [...]
}
```

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized**: Invalid API key - clears stored key and prompts for update
- **429 Rate Limit**: Too many requests - shows retry message
- **413 Payload Too Large**: File exceeds 10MB limit
- **400 Bad Request**: Invalid file type or missing inputs

## Security Notes

- API keys are stored only in browser LocalStorage
- API keys are never stored in the backend database
- CORS is configured to allow only frontend origins
- File size limits are enforced on both frontend and backend

## Project Structure

```
resume-enhancer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── text_extraction.py   # PDF/DOCX text extraction
│   ├── gemini_client.py     # Gemini API integration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── components/      # React components
│   │   └── utils/           # API utilities
│   └── package.json         # Node dependencies
└── README.md
```

## Development

### Backend Development

The backend uses FastAPI with automatic API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Development

The frontend uses Vite for fast development with hot module replacement.

## License

MIT

