from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from firebase_admin import firestore
from google.cloud.firestore import SERVER_TIMESTAMP

from models.schemas import (
    ResumeExportCreate,
    ResumeExportOut,
    ResumeMetadataCreate,
    ResumeMetadataOut,
    ResumeMetadataUpdate,
    TemplateOut,
    UserProfile,
)


def _dt(value: Any) -> Optional[datetime]:
    if value is None:
        return None
    if hasattr(value, "timestamp"):
        return datetime.fromtimestamp(value.timestamp(), tz=timezone.utc)
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return None


class FirestoreRepo:
    def __init__(self) -> None:
        self.db = firestore.client()

    def upsert_user_from_token(self, uid: str, email: Optional[str], name: Optional[str], picture: Optional[str]) -> UserProfile:
        ref = self.db.collection("users").document(uid)
        snap = ref.get()
        now = SERVER_TIMESTAMP
        payload: dict[str, Any] = {
            "email": email or "",
            "display_name": name or "",
            "photo_url": picture or "",
            "updated_at": now,
        }
        if not snap.exists:
            payload["created_at"] = now
        ref.set(payload, merge=True)
        return self.get_user(uid)

    def get_user(self, uid: str) -> UserProfile:
        snap = self.db.collection("users").document(uid).get()
        if not snap.exists:
            return UserProfile(uid=uid)
        d = snap.to_dict() or {}
        return UserProfile(
            uid=uid,
            email=d.get("email"),
            display_name=d.get("display_name"),
            photo_url=d.get("photo_url"),
            created_at=_dt(d.get("created_at")),
            updated_at=_dt(d.get("updated_at")),
        )

    def list_templates(self, active_only: bool = True) -> list[TemplateOut]:
        q = self.db.collection("templates")
        docs = q.stream()
        out: list[TemplateOut] = []
        for doc in docs:
            d = doc.to_dict() or {}
            if active_only and not d.get("is_active", True):
                continue
            out.append(
                TemplateOut(
                    id=doc.id,
                    name=d.get("name", ""),
                    description=d.get("description", ""),
                    latex_body=d.get("latex_body", ""),
                    is_active=bool(d.get("is_active", True)),
                    version=int(d.get("version", 1)),
                    created_at=_dt(d.get("created_at")),
                    updated_at=_dt(d.get("updated_at")),
                )
            )
        out.sort(key=lambda t: t.name.lower())
        return out

    def create_resume(self, uid: str, body: ResumeMetadataCreate) -> ResumeMetadataOut:
        rid = str(uuid4())
        ref = self.db.collection("users").document(uid).collection("resumes").document(rid)
        ref.set(
            {
                "title": body.title,
                "template_id": body.template_id,
                "source_resume_text": body.source_resume_text,
                "jd_summary_snapshot": body.jd_summary_snapshot,
                "created_at": SERVER_TIMESTAMP,
                "updated_at": SERVER_TIMESTAMP,
            }
        )
        return self.get_resume(uid, rid)

    def update_resume(self, uid: str, resume_id: str, body: ResumeMetadataUpdate) -> ResumeMetadataOut:
        ref = self.db.collection("users").document(uid).collection("resumes").document(resume_id)
        snap = ref.get()
        if not snap.exists:
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Resume not found.")
        patch: dict[str, Any] = {"updated_at": SERVER_TIMESTAMP}
        if body.title is not None:
            patch["title"] = body.title
        if body.template_id is not None:
            patch["template_id"] = body.template_id
        if body.source_resume_text is not None:
            patch["source_resume_text"] = body.source_resume_text
        if body.jd_summary_snapshot is not None:
            patch["jd_summary_snapshot"] = body.jd_summary_snapshot
        ref.set(patch, merge=True)
        return self.get_resume(uid, resume_id)

    def get_resume(self, uid: str, resume_id: str) -> ResumeMetadataOut:
        ref = self.db.collection("users").document(uid).collection("resumes").document(resume_id)
        snap = ref.get()
        if not snap.exists:
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Resume not found.")
        d = snap.to_dict() or {}
        return ResumeMetadataOut(
            id=snap.id,
            title=d.get("title", ""),
            template_id=d.get("template_id", ""),
            source_resume_text=d.get("source_resume_text", ""),
            jd_summary_snapshot=d.get("jd_summary_snapshot") or {},
            created_at=_dt(d.get("created_at")),
            updated_at=_dt(d.get("updated_at")),
        )

    def list_resumes(self, uid: str) -> list[ResumeMetadataOut]:
        col = self.db.collection("users").document(uid).collection("resumes")
        out: list[ResumeMetadataOut] = []
        for doc in col.stream():
            d = doc.to_dict() or {}
            out.append(
                ResumeMetadataOut(
                    id=doc.id,
                    title=d.get("title", ""),
                    template_id=d.get("template_id", ""),
                    source_resume_text=d.get("source_resume_text", ""),
                    jd_summary_snapshot=d.get("jd_summary_snapshot") or {},
                    created_at=_dt(d.get("created_at")),
                    updated_at=_dt(d.get("updated_at")),
                )
            )
        out.sort(key=lambda r: (r.updated_at or r.created_at or datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
        return out

    def create_export(self, uid: str, body: ResumeExportCreate) -> ResumeExportOut:
        eid = str(uuid4())
        ref = self.db.collection("users").document(uid).collection("resume_exports").document(eid)
        ref.set(
            {
                "job_title": body.job_title,
                "company": body.company or "",
                "jd_summary_snapshot": body.jd_summary_snapshot,
                "optimized_latex": body.optimized_latex,
                "created_at": SERVER_TIMESTAMP,
            }
        )
        return self.get_export(uid, eid)

    def get_export(self, uid: str, export_id: str) -> ResumeExportOut:
        ref = self.db.collection("users").document(uid).collection("resume_exports").document(export_id)
        snap = ref.get()
        if not snap.exists:
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Export not found.")
        d = snap.to_dict() or {}
        return ResumeExportOut(
            id=snap.id,
            job_title=d.get("job_title", ""),
            company=d.get("company") or None,
            jd_summary_snapshot=d.get("jd_summary_snapshot"),
            optimized_latex=d.get("optimized_latex", ""),
            created_at=_dt(d.get("created_at")),
        )

    def list_exports(self, uid: str) -> list[ResumeExportOut]:
        col = self.db.collection("users").document(uid).collection("resume_exports")
        out: list[ResumeExportOut] = []
        for doc in col.stream():
            d = doc.to_dict() or {}
            out.append(
                ResumeExportOut(
                    id=doc.id,
                    job_title=d.get("job_title", ""),
                    company=d.get("company") or None,
                    jd_summary_snapshot=d.get("jd_summary_snapshot"),
                    optimized_latex=d.get("optimized_latex", ""),
                    created_at=_dt(d.get("created_at")),
                )
            )
        out.sort(key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
        return out
