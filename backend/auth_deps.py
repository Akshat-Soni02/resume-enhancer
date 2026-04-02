from typing import Annotated, Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from firebase_init import init_firebase, require_firebase_ready

security = HTTPBearer(auto_error=False)


async def firebase_user_optional(
    credentials_http: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
) -> Optional[dict]:
    """Returns decoded token dict or None if no Bearer token."""
    init_firebase()
    if not credentials_http:
        return None
    require_firebase_ready()
    token = credentials_http.credentials
    try:
        return auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")


async def firebase_user_required(
    credentials_http: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
) -> dict:
    init_firebase()
    require_firebase_ready()
    if not credentials_http:
        raise HTTPException(status_code=401, detail="Authorization Bearer token required.")
    try:
        return auth.verify_id_token(credentials_http.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
