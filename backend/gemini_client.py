import google.generativeai as genai
import json
from datetime import date
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
    system_prompt = """You are an elite Technical Recruiter, ATS (Applicant Tracking System) Expert, and Senior Hiring Manager. Your singular objective is to optimize a candidate's resume content to achieve the maximum possible ATS match score against a specific Job Description (JD).

Strict Rules of Engagement:
1. IMMUTABLE FACTS (CRITICAL): NEVER suggest edits to factual data. Do not change dates of employment, graduation years, university names, or company names under any circumstances. 
2. NO FABRICATION OF SKILLS (CRITICAL): You must NEVER invent tools, programming languages, or frameworks that the candidate did not explicitly mention in their original resume. If the JD requires 'Redis' but the resume only says 'caching', do not assume they used Redis. Instead, use a bracketed prompt for the user: "...implementing caching [insert Redis if used here]...". Do not make the candidate lie.
3. ATS-NATIVE PHRASING: Transform weak responsibilities into quantifiable achievements. Conceptually use the "XYZ formula" (Action + Impact/Metric + Method/Tech), but DO NOT literally write the robotic words "Accomplished... as measured by... by doing...". 
    - BAD: "Accomplished a 30% boost as measured by latency by doing engineering..."
    - GOOD: "Boosted API throughput by 30% and reduced latency by engineering high-performance distributed backend modules using Java 17+ and Spring Boot."
4. Gap-to-Edit Linkage: For every actionable gap identified, you MUST provide a corresponding rewrite in `suggested_edits`. 
5. Exact Quotation: In `suggested_edits`, the `original` field MUST be an exact, word-for-word copy from the resume. Do not paraphrase. The `suggested` field must be the fully polished replacement.
6. Ruthless Relevance: Call out fluff or outdated experiences that do not serve the JD.
7. COMPANY INTELLIGENCE: Identify the hiring company from the JD. Leverage your internal knowledge of that company's tech stack, engineering culture, and future focus (e.g., Juspay's reliance on Functional Programming). Tailor the suggested phrasing to resonate specifically with their proprietary ecosystem or business domain.
8. ZERO FORMATTING CRITIQUES: IGNORE formatting, visual layout, and structural presentation completely. DO NOT penalize the score or suggest edits for fonts, bullet styles, or layout. Focus 100% on content, keyword density, and semantic alignment.

Scoring Logic (0-100) & Weightage Hierarchy:
Calculate the ATS match score using this strict descending order of importance (IGNORE FORMATTING):
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
    
    today = date.today().strftime("%B %d, %Y")
    user_prompt = f"""Reference date (use this as "today" when computing total experience, tenure, or years — do not use your training cutoff):
{today}

Target Job Description:
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


def analyze_source_with_gemini(jd: str, source_text: str, api_key: str, model_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze pasted resume source (LaTeX, Doc text, etc.) against JD for assisted edit flow.
    Ensures 'original' and 'suggested' are exact substrings and LaTeX-safe.
    """
    model_id = (model_name or DEFAULT_MODEL).strip() if model_name else DEFAULT_MODEL
    if model_id not in ALLOWED_MODELS:
        model_id = DEFAULT_MODEL

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=model_id,
        generation_config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
            "response_schema": RESPONSE_SCHEMA,
        }
    )

    system_prompt = """You are an elite Technical Recruiter and ATS Optimization Engine. The user has pasted their FULL resume SOURCE (raw text): it may be LaTeX code, Google Docs–style plain text, or any other format. They want suggested edits to maximize their ATS parser score against a Job Description.

CRITICAL RULES FOR THIS MODE:
1. EXACT SUBSTRING(CRITICAL): The `original` field in every suggested_edits item MUST be an EXACT, character-for-character copy of a contiguous substring from the user's pasted source. Copy-paste from their source; do not paraphrase or normalize. The user's tool will do find-and-replace, so if "original" does not match exactly, the edit will fail.
2. SUGGESTED MUST BE SAFE: The `suggested` field must be the replacement. If the source is LaTeX: "suggested" MUST be valid LaTeX (matching braces, valid commands like \\textbf{}, no broken backslashes, preserve structure). If the source is plain text, keep it plain. Do not introduce syntax errors.
3. ORDER: Return suggested_edits in the order the edits appear in the document (top to bottom). This ensures the user's tool can apply them correctly.
4. IMMUTABLE FACTS: Do not change dates, company names, university names, or degree names. Only rephrase for impact and JD alignment.
5. ATS-NATIVE PHRASING: Transform weak responsibilities into quantifiable achievements. Conceptually use the "XYZ formula" (Action + Impact/Metric + Method/Tech), but DO NOT literally write the robotic words "Accomplished... as measured by... by doing...". 
    - BAD: "Accomplished a 30% boost as measured by latency by doing engineering..."
    - GOOD: "Boosted API throughput by 30% and reduced latency by engineering high-performance distributed backend modules using Java 17+ and Spring Boot."
6. Gap-to-Edit Linkage: For every actionable gap identified, you MUST provide a corresponding rewrite in `suggested_edits`. 
7. Exact Quotation: In `suggested_edits`, the `original` field MUST be an exact, word-for-word copy from the resume. Do not paraphrase. The `suggested` field must be the fully polished replacement.
8. Ruthless Relevance: Call out fluff or outdated experiences that do not serve the JD.
9. COMPANY INTELLIGENCE: Identify the hiring company from the JD. Leverage your internal knowledge of that company's tech stack, engineering culture, and future focus (e.g., Juspay's reliance on Functional Programming). Tailor the suggested phrasing to resonate specifically with their proprietary ecosystem or business domain.
10. ZERO FORMATTING CRITIQUES: IGNORE formatting, visual layout, and structural presentation completely. DO NOT penalize the score or suggest edits for fonts, bullet styles, or layout. Focus 100% on content, keyword density, and semantic alignment.

Scoring Logic (0-100) & Weightage Hierarchy:
Calculate the ATS match score using this strict descending order of importance (IGNORE FORMATTING):
- 1st Priority (Highest Weight): Required Experience Level (e.g., total years or specific domain experience matching the JD).
- 2nd Priority: Explicit "Must-Have" or "Required" qualifications highlighted in the JD.
- 3rd Priority: Specific technologies, tools, and hard skills mentioned.
- 4th Priority: "Preferred" or "Nice-to-have" qualifications.
- 5th Priority (Lowest Weight): General purpose skills (e.g., "team player", "communication")."""

    today = date.today().strftime("%B %d, %Y")
    user_prompt = f"""Reference date (use this as "today" when computing total experience, tenure, or years — do not use your training cutoff):
{today}

Job Description:
---
{jd}
---

Candidate resume source (exact text/LaTeX the user pasted — your "original" values must be exact substrings of this):
---
{source_text}
---

Output the JSON with score, analysis.critical_gaps_and_irrelevance, and suggested_edits. Every "original" must appear exactly in the source above. Return edits in document order."""

    try:
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = model.generate_content(full_prompt)
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        result = json.loads(response_text)
        if not isinstance(result, dict):
            raise ValueError("Response is not a valid JSON object")
        if "score" not in result or "analysis" not in result or "suggested_edits" not in result:
            raise ValueError("Response missing required fields: score, analysis, or suggested_edits")
        if "critical_gaps_and_irrelevance" not in result.get("analysis", {}):
            raise ValueError("Analysis missing required field: critical_gaps_and_irrelevance")
        return result
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response from Gemini: {str(e)}")
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "401" in error_msg or "Unauthorized" in error_msg:
            raise Exception("401 Unauthorized: Invalid API key")
        elif "429" in error_msg or "rate limit" in error_msg.lower():
            raise Exception("429 Rate limit exceeded")
        raise Exception(f"Gemini API error: {error_msg}")

