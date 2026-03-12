import google.generativeai as genai
import json
from typing import Dict, Any, Optional

# Define the response schema
RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "score": {
            "type": "number",
            "description": "Match score between 0 and 100"
        },
        "analysis": {
            "type": "object",
            "properties": {
                "critical_gaps_and_irrelevance": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "List of critical gaps and irrelevant content with section citations"
                }
            },
            "required": ["critical_gaps_and_irrelevance"]
        },
        "suggested_edits": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Section and context where the edit should be made"
                    },
                    "original": {
                        "type": "string",
                        "description": "The exact original text to be replaced"
                    },
                    "suggested": {
                        "type": "string",
                        "description": "The complete replacement text"
                    }
                },
                "required": ["location", "original", "suggested"]
            }
        }
    },
    "required": ["score", "analysis", "suggested_edits"]
}


# Allowed Gemini model IDs (user-selectable)
ALLOWED_MODELS = {
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemini-3-flash-preview",
}
DEFAULT_MODEL = "gemini-3-flash-preview"


def analyze_resume_with_gemini(jd: str, resume_text: str, api_key: str, model_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze resume against job description using Google Gemini API.
    
    Args:
        jd: Job description text
        resume_text: Extracted resume text
        api_key: Gemini API key
        model_name: Optional Gemini model ID; must be in ALLOWED_MODELS. Defaults to DEFAULT_MODEL.
    
    Returns:
        Dictionary containing score, analysis, and suggested edits
    
    Raises:
        Exception: If API call fails or response is invalid
    """
    model_id = (model_name or DEFAULT_MODEL).strip() if model_name else DEFAULT_MODEL
    if model_id not in ALLOWED_MODELS:
        model_id = DEFAULT_MODEL

    # Configure Gemini
    genai.configure(api_key=api_key)
    
    # Create the model with structured JSON output using response_schema
    model = genai.GenerativeModel(
        model_name=model_id,
        generation_config={
            "temperature": 0.3,
            "response_mime_type": "application/json",
            "response_schema": RESPONSE_SCHEMA,
        }
    )
    
    # Construct the system prompt (simplified since schema enforces structure)
    system_prompt = """You are an elite Technical Recruiter, ATS (Applicant Tracking System) Expert, and Senior Hiring Manager. Your objective is to analyze a candidate's resume against a specific Job Description (JD) and provide actionable, hyper-specific feedback.

Strict Rules of Engagement:
1. IMMUTABLE FACTS (CRITICAL): NEVER suggest edits to factual data. Do not change dates of employment, graduation years, university names, or company names under any circumstances. Focus entirely on optimizing the impact, phrasing, and keyword alignment of bullet points and summaries. Do not modify any dates to justify experience or education.
2. Gap-to-Edit Linkage: For every actionable gap identified in the `critical_gaps_and_irrelevance` array, you MUST provide a corresponding rewrite in `suggested_edits`. Show the user exactly how to reframe their existing experience to mitigate that specific gap.
3. Impact Over Duties: Transform weak "responsibilities" into quantifiable achievements using the formula: "Accomplished [X] as measured by [Y], by doing [Z]". Use placeholders like "[Insert % metric here]" if numbers are missing.
4. Exact Quotation: In `suggested_edits`, the `original` field MUST be an exact, word-for-word copy from the resume. Do not paraphrase. The `suggested` field must be the fully polished replacement.
5. Ruthless Relevance: Call out fluff or outdated experiences that do not serve the JD.

Scoring Logic (0-100) & Weightage Hierarchy:
Calculate the match score using this strict descending order of importance:
- 1st Priority (Highest Weight): Required Experience Level (e.g., total years or specific domain experience matching the JD).
- 2nd Priority: Explicit "Must-Have" or "Required" qualifications highlighted in the JD.
- 3rd Priority: Specific technologies, tools, and hard skills mentioned.
- 4th Priority: "Preferred" or "Nice-to-have" qualifications.
- 5th Priority (Lowest Weight): General purpose skills (e.g., "team player", "communication").

Based on this hierarchy:
- 90-100: Exceptional alignment across top priorities.
- 75-89: Meets experience and most must-haves, but needs keyword/metric injection (3rd/4th priorities).
- 50-74: Missing core technologies or falls slightly short on must-haves; needs significant reframing.
- <50: Fundamental mismatch in Experience (1st Priority) or Must-Haves (2nd Priority).

Tone: Professional, direct, constructive, and hyper-focused on factual alignment with the JD."""
    
    # Construct the user prompt
    user_prompt = f"""Target Job Description:
---
{jd}
---

Candidate Resume:
---
{resume_text}
---

Execute the analysis and output the required JSON structure."""
    
    try:
        # Generate response - schema enforces JSON structure automatically
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = model.generate_content(full_prompt)
        
        # With response_schema and response_mime_type="application/json",
        # the response.text should contain valid JSON
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present (shouldn't happen with schema, but just in case)
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON
        result = json.loads(response_text)
        
        # Validate structure
        if not isinstance(result, dict):
            raise ValueError("Response is not a valid JSON object")
        
        if "score" not in result or "analysis" not in result or "suggested_edits" not in result:
            raise ValueError("Response missing required fields: score, analysis, or suggested_edits")
        
        if "critical_gaps_and_irrelevance" not in result["analysis"]:
            raise ValueError("Analysis missing required field: critical_gaps_and_irrelevance")
        
        return result
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response from Gemini: {str(e)}")
    except Exception as e:
        # Re-raise with context
        error_msg = str(e)
        if "API key" in error_msg or "401" in error_msg or "Unauthorized" in error_msg:
            raise Exception("401 Unauthorized: Invalid API key")
        elif "429" in error_msg or "rate limit" in error_msg.lower():
            raise Exception("429 Rate limit exceeded")
        else:
            raise Exception(f"Gemini API error: {error_msg}")

