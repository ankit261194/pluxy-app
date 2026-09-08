"""
Reels Router: Create, Read, Like, and View Counts.
"""

import time
import secrets
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/reels", tags=["reels"])

class CreateReelRequest(BaseModel):
    video_url: str = Field(..., min_length=5)
    caption: str = Field(..., max_length=1000)
    audio_track: Optional[str] = None

@router.get("")
async def list_reels(limit: int = 20, offset: int = 0, current_user: Optional[dict] = Depends(get_optional_user)):
    current_uid = current_user["id"] if current_user else None
    reels = []
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.id, r.user_id, r.video_url, r.caption, r.audio_track, r.views_count, r.likes_count, r.comments_count, r.created_at,
                   u.username, u.display_name, u.avatar_url, u.verified
            FROM reels r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        rows = cursor.fetchall()
        for r in rows:
            reel_id = r["id"]
            is_liked = False
            if current_uid:
                cursor.execute("SELECT 1 FROM reel_likes WHERE reel_id = ? AND user_id = ?", (reel_id, current_uid))
                is_liked = bool(cursor.fetchone())

            reels.append({
                "id": reel_id,
                "author": {
                    "id": r["user_id"],
                    "username": r["username"],
                    "displayName": r["display_name"],
                    "avatar": r["avatar_url"],
                    "verified": bool(r["verified"])
                },
                "videoUrl": r["video_url"],
                "caption": r["caption"],
                "audioTrack": r["audio_track"] or "Original Audio",
                "views": r["views_count"],
                "likes": r["likes_count"],
                "isLiked": is_liked,
                "commentsCount": r["comments_count"]
            })

    return {"success": True, "reels": reels}

@router.post("")
async def create_reel(req: CreateReelRequest, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    reel_id = f"reel_{int(time.time())}_{secrets.token_hex(4)}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reels (id, user_id, video_url, caption, audio_track, views_count, likes_count, comments_count, created_at)
            VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?)
        """, (reel_id, current_user["id"], req.video_url, req.caption, req.audio_track or "Original Audio", now))

    return {
        "success": True,
        "reel": {
            "id": reel_id,
            "author": {
                "id": current_user["id"],
                "username": current_user["username"],
                "displayName": current_user["display_name"],
                "avatar": current_user["avatar_url"]
            },
            "videoUrl": req.video_url,
            "caption": req.caption,
            "audioTrack": req.audio_track or "Original Audio",
            "views": 1,
            "likes": 0,
            "isLiked": False,
            "commentsCount": 0
        }
    }

@router.post("/{reel_id}/like")
async def toggle_reel_like(reel_id: str, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    uid = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM reel_likes WHERE reel_id = ? AND user_id = ?", (reel_id, uid))
        exists = cursor.fetchone()
        if exists:
            cursor.execute("DELETE FROM reel_likes WHERE reel_id = ? AND user_id = ?", (reel_id, uid))
            cursor.execute("UPDATE reels SET likes_count = MAX(0, likes_count - 1) WHERE id = ?", (reel_id,))
            is_liked = False
        else:
            cursor.execute("INSERT INTO reel_likes (reel_id, user_id, created_at) VALUES (?, ?, ?)", (reel_id, uid, now))
            cursor.execute("UPDATE reels SET likes_count = likes_count + 1 WHERE id = ?", (reel_id,))
            is_liked = True

        cursor.execute("SELECT likes_count FROM reels WHERE id = ?", (reel_id,))
        likes = cursor.fetchone()[0]

    return {"success": True, "isLiked": is_liked, "likes": likes}

@router.post("/{reel_id}/view")
async def record_reel_view(reel_id: str):
    with get_db() as conn:
        conn.execute("UPDATE reels SET views_count = views_count + 1 WHERE id = ?", (reel_id,))
    return {"success": True}
