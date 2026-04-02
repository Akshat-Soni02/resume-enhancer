"""
Initialize Firebase Admin SDK. Safe to import multiple times.
Uses FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string) or GOOGLE_APPLICATION_CREDENTIALS (file path).
"""
import json
import logging
import os

import firebase_admin
from firebase_admin import credentials

_logger = logging.getLogger(__name__)
_initialized = False


def is_firebase_configured() -> bool:
    return bool(os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))


def init_firebase() -> None:
    global _initialized
    if _initialized:
        return
    if firebase_admin._apps:
        _initialized = True
        return

    # Env values sometimes get wrapped in quotes via .env; normalize them.
    def _norm(v: str | None) -> str:
        if not v:
            return ""
        return v.strip().strip('"').strip("'")

    json_str = _norm(os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON"))
    cred_path = _norm(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

    if json_str:
        try:
            info = json.loads(json_str)
        except json.JSONDecodeError as e:
            # Common misconfig: people paste a *file path* into FIREBASE_SERVICE_ACCOUNT_JSON.
            _logger.error(
                "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. Error: %s. If you want to use a file path, set GOOGLE_APPLICATION_CREDENTIALS instead.",
                e,
            )
            # If GOOGLE_APPLICATION_CREDENTIALS is also set, fall back to it.
            if cred_path and os.path.isfile(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                return
        else:
            cred = credentials.Certificate(info)
    elif cred_path and os.path.isfile(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        _logger.warning(
            "Firebase not initialized: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS"
        )
        return

    project_id = _norm(os.getenv("FIREBASE_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT"))
    if project_id:
        firebase_admin.initialize_app(cred, {"projectId": project_id})
    else:
        firebase_admin.initialize_app(cred)
    _initialized = True
    _logger.info("Firebase Admin initialized")


def require_firebase_ready() -> None:
    if not firebase_admin._apps:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=503,
            detail="Firebase is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.",
        )
