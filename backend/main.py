from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

from text_extraction import extract_text_from_file
from gemini_client import (
    analyze_resume_with_gemini,
    analyze_source_with_gemini,
    parse_jd_with_gemini,
    optimize_resume_for_resumeai,
)
import json

app = FastAPI(title="Resume Optimizer API")

# CORS configuration - must be added before routes
# Allow specific origins for production and development (localhost + 127.0.0.1 for both ports)
allowed_origins = [
    "https://resume-enhancer-pearl.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://resume.arilo.in"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key", "X-Gemini-Model", "Authorization", "Accept"],
    expose_headers=["*"],
    max_age=600,
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
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_gemini_model: Optional[str] = Header(None, alias="X-Gemini-Model"),
):
    """
    Process resume against job description using Gemini API.
    
    Args:
        jd: Job description text
        resume: Resume file (PDF or DOCX)
        x_api_key: Gemini API key from header
        x_gemini_model: Optional Gemini model ID from header
    
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
        result = analyze_resume_with_gemini(jd, resume_text, x_api_key, x_gemini_model)
        
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


@app.post("/process-source")
async def process_source(
    jd: str = Form(...),
    source: str = Form(...),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_gemini_model: Optional[str] = Header(None, alias="X-Gemini-Model"),
):
    """
    Assisted-edit flow: analyze pasted resume source (LaTeX, Doc text, etc.) against JD.
    Returns score, analysis, and suggested_edits with exact substrings for find-and-replace.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required in X-API-Key header")
    if not source or len(source.strip()) < 50:
        raise HTTPException(status_code=400, detail="Source text is required and must be at least 50 characters.")
    try:
        result = analyze_source_with_gemini(jd.strip(), source, x_api_key, x_gemini_model)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        error_message = str(e)
        if "401" in error_message or "Unauthorized" in error_message:
            raise HTTPException(status_code=401, detail="Invalid API key. Please check your Gemini API key.")
        elif "429" in error_message or "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail=f"An error occurred: {error_message}")


@app.post("/resumeai/parse-jd")
async def resumeai_parse_jd(
    jd_url: str = Form(""),
    jd_text: str = Form(""),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_gemini_model: Optional[str] = Header(None, alias="X-Gemini-Model"),
):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required in X-API-Key header")
    if not jd_url and not jd_text:
        raise HTTPException(status_code=400, detail="Either jd_url or jd_text is required.")
    try:
        return parse_jd_with_gemini(jd_url.strip(), jd_text.strip(), x_api_key, x_gemini_model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        error_message = str(e)
        if "401" in error_message or "Unauthorized" in error_message:
            raise HTTPException(status_code=401, detail="Invalid API key. Please check your Gemini API key.")
        elif "429" in error_message or "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail=f"An error occurred: {error_message}")


@app.post("/resumeai/optimize")
async def resumeai_optimize(
    resume_text: str = Form(...),
    jd_summary: str = Form(...),
    latex_template: str = Form(...),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_gemini_model: Optional[str] = Header(None, alias="X-Gemini-Model"),
):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required in X-API-Key header")
    if not resume_text or len(resume_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="resume_text is required.")
    try:
        jd_summary_obj = json.loads(jd_summary)
    except Exception:
        raise HTTPException(status_code=400, detail="jd_summary must be valid JSON.")
    try:
        return optimize_resume_for_resumeai(
            resume_text=resume_text,
            jd_summary=jd_summary_obj,
            latex_template=latex_template,
            api_key=x_api_key,
            model_name=x_gemini_model,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        error_message = str(e)
        if "401" in error_message or "Unauthorized" in error_message:
            raise HTTPException(status_code=401, detail="Invalid API key. Please check your Gemini API key.")
        elif "429" in error_message or "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        raise HTTPException(status_code=500, detail=f"An error occurred: {error_message}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

