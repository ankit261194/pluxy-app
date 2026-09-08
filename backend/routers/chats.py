"""
Chat Router: Conversations, Message History, and WebSocket Broadcasts.
"""

import time
import secrets
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user
from backend.websocket_manager import ws_manager

router = APIRouter(prefix="/api/chats", tags=["chats"])

class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    message_type: Optional[str] = "text"
    media_url: Optional[str] = None
    duration: Optional[str] = None

class CreateChatRequest(BaseModel):
    target_user_id: str
    is_group: Optional[bool] = False
    group_name: Optional[str] = None

@router.get("")
async def list_user_chats(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    chats_list = []
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.id, c.is_group, c.name, c.avatar_url, c.created_at
            FROM chats c
            JOIN chat_members cm ON c.id = cm.chat_id
            WHERE cm.user_id = ?
        """, (uid,))
        chats = cursor.fetchall()

        for c in chats:
            chat_id = c["id"]
            # Get other participant if direct chat
            chat_name = c["name"]
            chat_avatar = c["avatar_url"]
            other_uid = None

            if not c["is_group"]:
                cursor.execute("""
                    SELECT u.id, u.display_name, u.avatar_url
                    FROM chat_members cm
                    JOIN users u ON cm.user_id = u.id
                    WHERE cm.chat_id = ? AND cm.user_id != ?
                    LIMIT 1
                """, (chat_id, uid))
                other = cursor.fetchone()
                if other:
                    other_uid = other["id"]
                    chat_name = other["display_name"]
                    chat_avatar = other["avatar_url"]

            # Last message
            cursor.execute("""
                SELECT content, created_at, status, sender_id
                FROM messages
                WHERE chat_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            """, (chat_id,))
            last_msg = cursor.fetchone()
            last_text = last_msg["content"] if last_msg else "Start a conversation"
            last_time = "Recently" if last_msg else ""

            is_online = ws_manager.is_user_online(other_uid) if other_uid else False

            chats_list.append({
                "id": chat_id,
                "name": chat_name or "Chat",
                "avatar": chat_avatar or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
                "isOnline": is_online,
                "isGroup": bool(c["is_group"]),
                "lastMessage": last_text,
                "lastTime": last_time,
                "streak": 5,
                "unreadCount": 0
            })

    return {"success": True, "chats": chats_list}

@router.get("/{chat_id}/messages")
async def get_chat_messages(chat_id: str, limit: int = 50, current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        # Verify membership
        cursor.execute("SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?", (chat_id, uid))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="Not a participant of this chat")

        cursor.execute("""
            SELECT m.id, m.sender_id, m.message_type, m.content, m.media_url, m.duration, m.status, m.created_at,
                   u.username, u.display_name, u.avatar_url
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = ?
            ORDER BY m.created_at ASC
            LIMIT ?
        """, (chat_id, limit))
        messages = [
            {
                "id": m["id"],
                "sender": "me" if m["sender_id"] == uid else m["display_name"],
                "senderId": m["sender_id"],
                "text": m["content"],
                "mediaUrl": m["media_url"],
                "isAudio": m["message_type"] == "audio",
                "audioDuration": m["duration"],
                "status": m["status"],
                "time": "Just now"
            } for m in cursor.fetchall()
        ]

    return {"success": True, "messages": messages}

@router.post("/{chat_id}/messages")
async def send_chat_message(chat_id: str, req: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    now = int(time.time() * 1000)
    msg_id = f"m_{now}_{secrets.token_hex(4)}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?", (chat_id, uid))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="Not a participant of this chat")

        cursor.execute("""
            INSERT INTO messages (id, chat_id, sender_id, message_type, content, media_url, duration, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', ?)
        """, (msg_id, chat_id, uid, req.message_type, req.content.strip(), req.media_url, req.duration, now))

        # Get all members to notify via WebSocket
        cursor.execute("SELECT user_id FROM chat_members WHERE chat_id = ? AND user_id != ?", (chat_id, uid))
        recipients = [r[0] for r in cursor.fetchall()]

    # Push live event to active WebSocket recipients
    event_payload = {
        "type": "new_message",
        "chatId": chat_id,
        "message": {
            "id": msg_id,
            "senderId": uid,
            "sender": current_user["display_name"],
            "text": req.content.strip(),
            "mediaUrl": req.media_url,
            "isAudio": req.message_type == "audio",
            "audioDuration": req.duration,
            "status": "delivered",
            "time": "Just now"
        }
    }
    for rec_id in recipients:
        await ws_manager.send_to_user(rec_id, event_payload)

    return {"success": True, "message": event_payload["message"]}
