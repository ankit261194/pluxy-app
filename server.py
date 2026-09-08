"""
Pluxy Social Super-App: Production-Ready Async ASGI Server.
Powered by FastAPI, Uvicorn, SQLite (WAL mode), WebSockets, and WebRTC Signaling.
"""

import os
import sys
import json
import secrets
from typing import Optional
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.database import init_db
from backend.security import get_user_by_session
from backend.websocket_manager import ws_manager
from backend.routers import auth, posts, reels, stories, snaps, chats, creator, ai, admin, sync

# Ensure UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", 8080))

# Initialize Database Schema
init_db()

# Create FastAPI App
app = FastAPI(
    title="Pluxy Super-App API",
    description="Production-Ready Social Platform uniting WhatsApp, Instagram & Snapchat with Lifetime AI",
    version="2.0.0"
)

# Configurable CORS Origins
configured_origins = os.environ.get("ALLOWED_ORIGINS", "").split(",")
allowed_origins = [
    "https://appassets.androidplatform.net",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "https://pluxy.app"
]
for o in configured_origins:
    o_clean = o.strip()
    if o_clean and o_clean not in allowed_origins:
        allowed_origins.append(o_clean)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Mount REST API Routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(reels.router)
app.include_router(stories.router)
app.include_router(snaps.router)
app.include_router(chats.router)
app.include_router(creator.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(sync.router)

# Real-Time WebSocket Endpoint (Chat, Presence, WebRTC Audio/Video Signaling)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    # Authenticate token from query param or header
    user = get_user_by_session(token) if token else None
    user_id = user["id"] if user else f"guest_{secrets.token_hex(4)}"

    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except Exception:
                continue

            event_type = data.get("type")
            if event_type == "webrtc_signal":
                await ws_manager.handle_signaling(user_id, data)
            elif event_type == "typing":
                target = data.get("targetUserId")
                if target:
                    await ws_manager.send_to_user(target, {
                        "type": "typing",
                        "userId": user_id,
                        "chatId": data.get("chatId")
                    })
            elif event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
    except Exception:
        ws_manager.disconnect(user_id, websocket)

# Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Pluxy Super-App Production Server", "version": "2.0.0"}

# Static Files (Frontend UI assets)
app.mount("/", StaticFiles(directory=DIRECTORY, html=True), name="static")

if __name__ == "__main__":
    print("=" * 65)
    print("🚀 PLUXY PRODUCTION FASTAPI SERVER IS STARTING...")
    print(f"Local URL:       http://localhost:{PORT}")
    print(f"API Docs:        http://localhost:{PORT}/docs")
    print(f"WebSocket:       ws://localhost:{PORT}/ws")
    print("=" * 65)
    sys.stdout.flush()

    uvicorn.run(app, host="0.0.0.0", port=PORT, access_log=False)
