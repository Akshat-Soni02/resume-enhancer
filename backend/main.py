from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

from text_extraction import extract_text_from_file
from gemini_client import analyze_resume_with_gemini

app = FastAPI(title="Resume Optimizer API")

# CORS configuration - must be added before routes
# For development, allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@app.get("/")
async def root():
    return {"message": "Resume Optimizer API is running"}

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Backend is healthy"}


@app.post("/process")
async def process_resume(
    jd: str = Form(...),
    resume: UploadFile = File(...),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    """
    Process resume against job description using Gemini API.
    
    Args:
        jd: Job description text
        resume: Resume file (PDF or DOCX)
        x_api_key: Gemini API key from header
    
    Returns:
        JSON response with score, analysis, and suggested edits
    """
    # Validate API key
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required in X-API-Key header")
    
    # Validate file size
    file_content = await resume.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )
    
    # Validate file type
    if resume.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and DOCX files are supported."
        )
    
    try:
        # Extract text from resume
        resume_text = extract_text_from_file(file_content, resume.filename)
        
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the resume file. Please ensure the file is not corrupted."
            )
        
        # Analyze with Gemini
        result = analyze_resume_with_gemini(jd, resume_text, x_api_key)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle Gemini API errors
        error_message = str(e)
        if "401" in error_message or "Unauthorized" in error_message:
            raise HTTPException(status_code=401, detail="Invalid API key. Please check your Gemini API key.")
        elif "429" in error_message or "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        else:
            raise HTTPException(status_code=500, detail=f"An error occurred: {error_message}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

