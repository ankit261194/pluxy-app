"""
Posts Router: Create, Read, Like, Comment, and Delete posts.
"""

import time
import secrets
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/posts", tags=["posts"])

class CreatePostRequest(BaseModel):
    caption: str = Field(..., max_length=2000)
    media_url: Optional[str] = None

class AddCommentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

@router.get("")
async def list_posts(limit: int = 30, offset: int = 0, current_user: Optional[dict] = Depends(get_optional_user)):
    current_uid = current_user["id"] if current_user else None
    posts = []
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.id, p.user_id, p.caption, p.media_url, p.likes_count, p.comments_count, p.created_at,
                   u.username, u.display_name, u.avatar_url, u.verified
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        rows = cursor.fetchall()
        for r in rows:
            post_id = r["id"]
            is_liked = False
            if current_uid:
                cursor.execute("SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?", (post_id, current_uid))
                is_liked = bool(cursor.fetchone())

            cursor.execute("""
                SELECT c.id, c.user_id, c.text, c.created_at, u.username, u.display_name, u.avatar_url
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
                LIMIT 5
            """, (post_id,))
            comments = [
                {
                    "id": c["id"],
                    "user": c["username"],
                    "displayName": c["display_name"],
                    "avatar": c["avatar_url"],
                    "text": c["text"],
                    "time": "Just now"
                } for c in cursor.fetchall()
            ]

            posts.append({
                "id": post_id,
                "author": {
                    "id": r["user_id"],
                    "username": r["username"],
                    "displayName": r["display_name"],
                    "avatar": r["avatar_url"],
                    "verified": bool(r["verified"])
                },
                "caption": r["caption"],
                "image": r["media_url"] or "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900",
                "likes": r["likes_count"],
                "isLiked": is_liked,
                "commentsCount": r["comments_count"],
                "comments": comments,
                "timestamp": "Recent"
            })

    return {"success": True, "posts": posts}

@router.post("")
async def create_post(req: CreatePostRequest, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    post_id = f"post_{int(time.time())}_{secrets.token_hex(4)}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO posts (id, user_id, caption, media_url, likes_count, comments_count, created_at)
            VALUES (?, ?, ?, ?, 0, 0, ?)
        """, (post_id, current_user["id"], req.caption, req.media_url, now))
        cursor.execute("UPDATE users SET posts_count = posts_count + 1 WHERE id = ?", (current_user["id"],))

    return {
        "success": True,
        "post": {
            "id": post_id,
            "author": {
                "id": current_user["id"],
                "username": current_user["username"],
                "displayName": current_user["display_name"],
                "avatar": current_user["avatar_url"],
                "verified": bool(current_user["verified"])
            },
            "caption": req.caption,
            "image": req.media_url or "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900",
            "likes": 0,
            "isLiked": False,
            "commentsCount": 0,
            "comments": [],
            "timestamp": "Just now"
        }
    }

@router.post("/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    uid = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?", (post_id, uid))
        exists = cursor.fetchone()
        if exists:
            cursor.execute("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", (post_id, uid))
            cursor.execute("UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?", (post_id,))
            is_liked = False
        else:
            cursor.execute("INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)", (post_id, uid, now))
            cursor.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", (post_id,))
            is_liked = True

        cursor.execute("SELECT likes_count FROM posts WHERE id = ?", (post_id,))
        row = cursor.fetchone()
        likes_count = row[0] if row else 0

    return {"success": True, "isLiked": is_liked, "likes": likes_count}

@router.post("/{post_id}/comments")
async def add_comment(post_id: str, req: AddCommentRequest, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    comment_id = f"c_{int(time.time())}_{secrets.token_hex(4)}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Post not found")

        cursor.execute("""
            INSERT INTO comments (id, post_id, user_id, text, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (comment_id, post_id, current_user["id"], req.text.strip(), now))
        cursor.execute("UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?", (post_id,))

    return {
        "success": True,
        "comment": {
            "id": comment_id,
            "user": current_user["username"],
            "displayName": current_user["display_name"],
            "avatar": current_user["avatar_url"],
            "text": req.text.strip(),
            "time": "Just now"
        }
    }
