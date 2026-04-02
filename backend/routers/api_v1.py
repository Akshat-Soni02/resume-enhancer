from __future__ import annotations

from typing import Annotated, List

from fastapi import APIRouter, Depends

from auth_deps import firebase_user_required
from firebase_init import init_firebase, require_firebase_ready
from models.schemas import (
    ResumeExportCreate,
    ResumeExportOut,
    ResumeMetadataCreate,
    ResumeMetadataOut,
    ResumeMetadataUpdate,
    TemplateOut,
    UserProfile,
)
from services.firestore_repo import FirestoreRepo

router = APIRouter(prefix="/api/v1", tags=["api-v1"])


def get_firestore_repo() -> FirestoreRepo:
    init_firebase()
    require_firebase_ready()
    return FirestoreRepo()


@router.get("/users/me", response_model=UserProfile)
async def get_me(
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> UserProfile:
    uid = token["uid"]
    return repo.upsert_user_from_token(
        uid,
        token.get("email"),
        token.get("name"),
        token.get("picture"),
    )


@router.get("/templates", response_model=List[TemplateOut])
async def list_templates(
    _: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> List[TemplateOut]:
    return repo.list_templates(active_only=True)


@router.post("/resumes", response_model=ResumeMetadataOut)
async def create_resume(
    body: ResumeMetadataCreate,
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> ResumeMetadataOut:
    return repo.create_resume(token["uid"], body)


@router.put("/resumes/{resume_id}", response_model=ResumeMetadataOut)
async def update_resume(
    resume_id: str,
    body: ResumeMetadataUpdate,
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> ResumeMetadataOut:
    return repo.update_resume(token["uid"], resume_id, body)


@router.get("/resumes", response_model=List[ResumeMetadataOut])
async def list_resumes(
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> List[ResumeMetadataOut]:
    return repo.list_resumes(token["uid"])


@router.get("/resumes/{resume_id}", response_model=ResumeMetadataOut)
async def get_resume(
    resume_id: str,
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> ResumeMetadataOut:
    return repo.get_resume(token["uid"], resume_id)


@router.post("/resume-exports", response_model=ResumeExportOut)
async def create_resume_export(
    body: ResumeExportCreate,
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> ResumeExportOut:
    return repo.create_export(token["uid"], body)


@router.get("/resume-exports", response_model=List[ResumeExportOut])
async def list_resume_exports(
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> List[ResumeExportOut]:
    return repo.list_exports(token["uid"])


@router.get("/resume-exports/{export_id}", response_model=ResumeExportOut)
async def get_resume_export(
    export_id: str,
    token: Annotated[dict, Depends(firebase_user_required)],
    repo: Annotated[FirestoreRepo, Depends(get_firestore_repo)],
) -> ResumeExportOut:
    return repo.get_export(token["uid"], export_id)
