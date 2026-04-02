from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TemplateOut(BaseModel):
    id: str
    name: str
    description: str = ""
    latex_body: str
    is_active: bool = True
    version: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ResumeMetadataCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    template_id: str = Field(..., min_length=1)
    source_resume_text: str = ""
    jd_summary_snapshot: Dict[str, Any] = Field(default_factory=dict)


class ResumeMetadataUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    template_id: Optional[str] = None
    source_resume_text: Optional[str] = None
    jd_summary_snapshot: Optional[Dict[str, Any]] = None


class ResumeMetadataOut(BaseModel):
    id: str
    title: str
    template_id: str
    source_resume_text: str = ""
    jd_summary_snapshot: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ResumeExportCreate(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=300)
    company: Optional[str] = Field(None, max_length=300)
    jd_summary_snapshot: Optional[Dict[str, Any]] = None
    optimized_latex: str = Field(..., min_length=1)


class ResumeExportOut(BaseModel):
    id: str
    job_title: str
    company: Optional[str] = None
    jd_summary_snapshot: Optional[Dict[str, Any]] = None
    optimized_latex: str
    created_at: Optional[datetime] = None
