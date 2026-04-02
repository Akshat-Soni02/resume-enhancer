"""
Job link sharing spaces: SQLite persistence and API helpers.
Users are identified by X-User-Id (client-generated UUID); max 5 spaces per user.
"""

from __future__ import annotations

import os
import re
import sqlite3
import secrets
import string
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Generator, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field, field_validator

MAX_SPACES_PER_USER = 5
JOIN_CODE_LENGTH = 8
JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0,O,1,I

_db_path = os.environ.get("JOB_SPACES_DB_PATH", os.path.join(os.path.dirname(__file__), "job_spaces.db"))


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_join_code() -> str:
    return "".join(secrets.choice(JOIN_CODE_ALPHABET) for _ in range(JOIN_CODE_LENGTH))


def _new_id() -> str:
    return str(uuid.uuid4())


@contextmanager
def get_conn() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(_db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    os.makedirs(os.path.dirname(os.path.abspath(_db_path)), exist_ok=True)
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS spaces (
              id TEXT PRIMARY KEY,
              join_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
              name TEXT NOT NULL DEFAULT '',
              created_by TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS space_members (
              user_id TEXT NOT NULL,
              space_id TEXT NOT NULL,
              joined_at TEXT NOT NULL,
              PRIMARY KEY (user_id, space_id),
              FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS job_links (
              id TEXT PRIMARY KEY,
              space_id TEXT NOT NULL,
              user_id TEXT NOT NULL,
              url TEXT NOT NULL,
              title TEXT,
              note TEXT,
              created_at TEXT NOT NULL,
              FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_members_space ON space_members(space_id);
            CREATE INDEX IF NOT EXISTS idx_links_space ON job_links(space_id);
            """
        )
        conn.execute("PRAGMA foreign_keys = ON")


def count_user_spaces(conn: sqlite3.Connection, user_id: str) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS c FROM space_members WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    return int(row["c"]) if row else 0


def user_is_member(conn: sqlite3.Connection, user_id: str, space_id: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM space_members WHERE user_id = ? AND space_id = ?",
        (user_id, space_id),
    ).fetchone()
    return row is not None


router = APIRouter(prefix="/job-spaces", tags=["job-spaces"])


def require_user_id(x_user_id: Optional[str]) -> str:
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(status_code=401, detail="X-User-Id header is required.")
    uid = x_user_id.strip()
    if len(uid) > 128:
        raise HTTPException(status_code=400, detail="X-User-Id is too long.")
    return uid


class CreateSpaceBody(BaseModel):
    name: str = Field(default="", max_length=120)


class JoinSpaceBody(BaseModel):
    code: str = Field(..., min_length=1, max_length=32)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        return v.strip().upper()


class AddLinkBody(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048)
    title: str = Field(default="", max_length=200)
    note: str = Field(default="", max_length=500)

    @field_validator("url")
    @classmethod
    def must_be_http_url(cls, v: str) -> str:
        s = v.strip()
        if not re.match(r"^https?://", s, re.IGNORECASE):
            raise ValueError("URL must start with http:// or https://")
        return s


def _space_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "join_code": row["join_code"],
        "name": row["name"] or "",
        "created_by": row["created_by"],
        "created_at": row["created_at"],
    }


@router.post("/spaces")
def create_space(
    body: CreateSpaceBody,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    user_id = require_user_id(x_user_id)
    with get_conn() as conn:
        if count_user_spaces(conn, user_id) >= MAX_SPACES_PER_USER:
            raise HTTPException(
                status_code=400,
                detail=f"You can only be in {MAX_SPACES_PER_USER} spaces at a time. Leave one to create or join another.",
            )
        space_id = _new_id()
        joined_at = _utc_now_iso()
        for _ in range(20):
            code = _new_join_code()
            try:
                conn.execute(
                    "INSERT INTO spaces (id, join_code, name, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
                    (space_id, code, (body.name or "").strip(), user_id, joined_at),
                )
                conn.execute(
                    "INSERT INTO space_members (user_id, space_id, joined_at) VALUES (?, ?, ?)",
                    (user_id, space_id, joined_at),
                )
                row = conn.execute("SELECT * FROM spaces WHERE id = ?", (space_id,)).fetchone()
                return _space_row_to_dict(row)
            except sqlite3.IntegrityError:
                continue
        raise HTTPException(status_code=500, detail="Could not allocate a unique join code.")


@router.post("/spaces/join")
def join_space(
    body: JoinSpaceBody,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    user_id = require_user_id(x_user_id)
    code = body.code
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM spaces WHERE join_code = ? COLLATE NOCASE",
            (code,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No space found for that code.")
        space_id = row["id"]
        if user_is_member(conn, user_id, space_id):
            return {"space": _space_row_to_dict(row), "already_member": True}
        if count_user_spaces(conn, user_id) >= MAX_SPACES_PER_USER:
            raise HTTPException(
                status_code=400,
                detail=f"You can only be in {MAX_SPACES_PER_USER} spaces at a time. Leave one first.",
            )
        conn.execute(
            "INSERT INTO space_members (user_id, space_id, joined_at) VALUES (?, ?, ?)",
            (user_id, space_id, _utc_now_iso()),
        )
        return {"space": _space_row_to_dict(row), "already_member": False}


@router.post("/spaces/{space_id}/leave")
def leave_space(
    space_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    user_id = require_user_id(x_user_id)
    with get_conn() as conn:
        cur = conn.execute(
            "DELETE FROM space_members WHERE user_id = ? AND space_id = ?",
            (user_id, space_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="You are not a member of this space.")
    return {"ok": True}


@router.get("/spaces")
def list_my_spaces(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    user_id = require_user_id(x_user_id)
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT s.*,
              (SELECT COUNT(*) FROM job_links jl WHERE jl.space_id = s.id) AS link_count
            FROM spaces s
            INNER JOIN space_members m ON m.space_id = s.id AND m.user_id = ?
            ORDER BY m.joined_at DESC
            """,
            (user_id,),
        ).fetchall()
    out = []
    for r in rows:
        d = _space_row_to_dict(r)
        d["link_count"] = int(r["link_count"])
        out.append(d)
    return {"spaces": out, "max_spaces": MAX_SPACES_PER_USER, "count": len(out)}


@router.get("/spaces/{space_id}")
def get_space(
    space_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    user_id = require_user_id(x_user_id)
    with get_conn() as conn:
        if not user_is_member(conn, user_id, space_id):
            raise HTTPException(status_code=403, detail="You are not a member of this space.")
        srow = conn.execute("SELECT * FROM spaces WHERE id = ?", (space_id,)).fetchone()
        if not srow:
            raise HTTPException(status_code=404, detail="Space not found.")
        member_rows = conn.execute(
            "SELECT user_id, joined_at FROM space_members WHERE space_id = ? ORDER BY joined_at ASC",
            (space_id,),
        ).fetchall()
        link_rows = conn.execute(
            """
            SELECT id, space_id, user_id, url, title, note, created_at
            FROM job_links WHERE space_id = ? ORDER BY created_at DESC
            """,
            (space_id,),
        ).fetchall()
    links = [
        {
            "id": lr["id"],
            "space_id": lr["space_id"],
            "user_id": lr["user_id"],
            "url": lr["url"],
            "title": lr["title"] or "",
            "note": lr["note"] or "",
            "created_at": lr["created_at"],
        }
        for lr in link_rows
    ]
    members = [{"user_id": mr["user_id"], "joined_at": mr["joined_at"]} for mr in member_rows]
    return {
        "space": _space_row_to_dict(srow),
        "members": members,
        "links": links,
    }


@router.post("/spaces/{space_id}/links")
def add_job_link(
    space_id: str,
    body: AddLinkBody,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    user_id = require_user_id(x_user_id)
    link_id = _new_id()
    created_at = _utc_now_iso()
    with get_conn() as conn:
        if not user_is_member(conn, user_id, space_id):
            raise HTTPException(status_code=403, detail="You are not a member of this space.")
        conn.execute(
            """
            INSERT INTO job_links (id, space_id, user_id, url, title, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                link_id,
                space_id,
                user_id,
                body.url,
                (body.title or "").strip() or None,
                (body.note or "").strip() or None,
                created_at,
            ),
        )
    return {
        "link": {
            "id": link_id,
            "space_id": space_id,
            "user_id": user_id,
            "url": body.url,
            "title": (body.title or "").strip(),
            "note": (body.note or "").strip(),
            "created_at": created_at,
        }
    }
