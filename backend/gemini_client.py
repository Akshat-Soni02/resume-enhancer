import google.generativeai as genai
import json
from typing import Dict, Any

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
                "strengths": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "List of strengths with section citations"
                },
                "critical_gaps_and_irrelevance": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "List of critical gaps and irrelevant content with section citations"
                }
            },
            "required": ["strengths", "critical_gaps_and_irrelevance"]
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


def analyze_resume_with_gemini(jd: str, resume_text: str, api_key: str) -> Dict[str, Any]:
    """
    Analyze resume against job description using Google Gemini API.
    
    Args:
        jd: Job description text
        resume_text: Extracted resume text
        api_key: Gemini API key
    
    Returns:
        Dictionary containing score, analysis, and suggested edits
    
    Raises:
        Exception: If API call fails or response is invalid
    """
    # Configure Gemini
    genai.configure(api_key=api_key)
    
    # Create the model with structured JSON output using response_schema
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config={
            "temperature": 0.3,
            "response_mime_type": "application/json",
            "response_schema": RESPONSE_SCHEMA,
        }
    )
    
    # Construct the system prompt (simplified since schema enforces structure)
    system_prompt = """You are a world-class Technical Recruiter and Resume Optimizer. Your task is to analyze a candidate's Resume against a Job Description (JD). You must provide a cold, factual, and section-specific breakdown of how the resume performs.

Logic Rules:
1. Strict Context: For every point in critical_gaps_and_irrelevance, you must cite a specific section of the resume and a specific requirement from the JD.
2. Irrelevance Check: If the user has included a large section that does not serve the JD (e.g., a long list of soft skills when the JD asks for hard engineering skills), flag it as "Irrelevant/Low Value" and suggest removal.
3. No Generic Advice: Do not say "Make it more concise." Instead, say "Section [Summary] is 5 lines long; the JD values brevity. Reduce to 2 lines focusing on [Specific Skill]."
4. Actionable Edits: In suggested_edits, if you are modifying a line, provide the entire new line so the user can copy-paste it directly.
5. Score Calculation: Base the score on alignment with JD requirements, presence of required skills, and relevance of experience.
"""
    
    # Construct the user prompt
    user_prompt = f"""Job Description:
{jd}

Resume:
{resume_text}

Analyze the resume against the job description and provide your assessment."""
    
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
        
        if "strengths" not in result["analysis"] or "critical_gaps_and_irrelevance" not in result["analysis"]:
            raise ValueError("Analysis missing required fields: strengths or critical_gaps_and_irrelevance")
        
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

