"""
Snaps Router: Disappearing Ephemeral Media.
Controlled exclusively server-side.
"""

import time
import secrets
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user

router = APIRouter(prefix="/api/snaps", tags=["snaps"])

class SendSnapRequest(BaseModel):
    media_url: str = Field(..., min_length=5)
    recipient_id: Optional[str] = None
    caption: Optional[str] = None
    filter_id: Optional[str] = None

@router.get("")
async def list_snaps(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    now = int(time.time() * 1000)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.sender_id, s.recipient_id, s.media_url, s.caption, s.filter_id,
                   s.is_opened, s.opened_at, s.created_at,
                   u.username, u.display_name, u.avatar_url
            FROM snaps s
            JOIN users u ON s.sender_id = u.id
            WHERE (s.recipient_id = ? OR s.recipient_id IS NULL OR s.sender_id = ?)
              AND (s.expires_at IS NULL OR s.expires_at > ?)
            ORDER BY s.created_at DESC
            LIMIT 30
        """, (uid, uid, now))
        snaps = [
            {
                "id": r["id"],
                "sender": r["display_name"],
                "senderUsername": r["username"],
                "senderAvatar": r["avatar_url"],
                "isOpened": bool(r["is_opened"]),
                "caption": r["caption"] or "",
                "filter": r["filter_id"] or "none",
                "mediaUrl": r["media_url"],
                "time": "Recent",
                "streak": 5
            } for r in cursor.fetchall()
        ]

    return {"success": True, "snaps": snaps}

@router.post("")
async def send_snap(req: SendSnapRequest, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    snap_id = f"snap_{int(time.time())}_{secrets.token_hex(4)}"
    expires_at = now + (24 * 3600 * 1000) # 24 hours expiry if unopened

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO snaps (id, sender_id, recipient_id, media_url, caption, filter_id, is_opened, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        """, (snap_id, current_user["id"], req.recipient_id, req.media_url, req.caption, req.filter_id, expires_at, now))

    return {"success": True, "snapId": snap_id}

@router.post("/{snap_id}/open")
async def open_snap(snap_id: str, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    # Once opened, expires in 10 seconds (true disappearing)
    expiry = now + 10000

    with get_db() as conn:
        conn.execute("""
            UPDATE snaps
            SET is_opened = 1, opened_at = ?, expires_at = ?
            WHERE id = ?
        """, (now, expiry, snap_id))

    return {"success": True, "message": "Snap opened and scheduled for deletion."}
