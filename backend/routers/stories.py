"""
Stories Router: Create, List (non-expired 24h), and View stories.
"""

import time
import secrets
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/stories", tags=["stories"])

class CreateStoryRequest(BaseModel):
    media_url: str = Field(..., min_length=5)
    caption: Optional[str] = None

@router.get("")
async def list_stories(current_user: Optional[dict] = Depends(get_optional_user)):
    now = int(time.time() * 1000)
    current_uid = current_user["id"] if current_user else None

    # Group stories by user
    grouped: dict = {}
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.user_id, s.media_url, s.caption, s.expires_at, s.created_at,
                   u.username, u.display_name, u.avatar_url
            FROM stories s
            JOIN users u ON s.user_id = u.id
            WHERE s.expires_at > ?
            ORDER BY s.created_at ASC
        """, (now,))
        for r in cursor.fetchall():
            uid = r["user_id"]
            if uid not in grouped:
                grouped[uid] = {
                    "id": f"story_group_{uid}",
                    "userId": uid,
                    "username": r["username"],
                    "userDisplayName": r["display_name"],
                    "userAvatar": r["avatar_url"],
                    "hasUnseen": True,
                    "items": []
                }
            grouped[uid]["items"].append({
                "id": r["id"],
                "mediaUrl": r["media_url"],
                "caption": r["caption"] or "",
                "timestamp": "Recent",
                "duration": 5000
            })

    return {"success": True, "stories": list(grouped.values())}

@router.post("")
async def create_story(req: CreateStoryRequest, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    expires_at = now + (24 * 3600 * 1000) # 24 hours expiration
    story_id = f"story_{int(time.time())}_{secrets.token_hex(4)}"

    with get_db() as conn:
        conn.execute("""
            INSERT INTO stories (id, user_id, media_url, caption, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (story_id, current_user["id"], req.media_url, req.caption or "", expires_at, now))

    return {"success": True, "storyId": story_id}
