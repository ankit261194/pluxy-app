"""
Pluxy Real-Time WebSocket Manager: Chat, Presence, and WebRTC Audio/Video Signaling.
"""

import json
import asyncio
from typing import Dict, Set, Any
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        # Map user_id -> Set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map chat_id -> Set of user_ids subscribed
        self.chat_rooms: Dict[str, Set[str]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        # Broadcast presence
        await self.broadcast_presence(user_id, is_online=True)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                asyncio.create_task(self.broadcast_presence(user_id, is_online=False))

    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    async def send_to_user(self, target_user_id: str, message: Dict[str, Any]):
        """Sends payload directly to all active devices of target user."""
        if target_user_id in self.active_connections:
            dead_sockets = set()
            payload = json.dumps(message)
            for ws in self.active_connections[target_user_id]:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead_sockets.add(ws)
            for dead in dead_sockets:
                self.active_connections[target_user_id].discard(dead)

    async def broadcast_presence(self, user_id: str, is_online: bool):
        """Notifies all connected users of a user's presence change."""
        msg = {
            "type": "presence_update",
            "payload": {
                "userId": user_id,
                "isOnline": is_online
            }
        }
        await self.broadcast_all(msg)

    async def broadcast_all(self, message: Dict[str, Any]):
        """Broadcasts a payload to all connected clients across the entire app."""
        payload = json.dumps(message)
        for user_id, sockets in list(self.active_connections.items()):
            dead_sockets = set()
            for ws in sockets:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead_sockets.add(ws)
            for dead in dead_sockets:
                sockets.discard(dead)

    async def handle_signaling(self, sender_id: str, data: Dict[str, Any]):
        """
        WebRTC Signaling Dispatcher:
        Types:
          - call_request (caller sends to callee with callType: voice/video)
          - call_ringing (callee acknowledges receiving ringing)
          - call_accept (callee accepts call)
          - call_reject (callee rejects call / busy)
          - call_end (either party hangs up)
          - sdp_offer (caller transmits local SDP)
          - sdp_answer (callee transmits remote SDP)
          - ice_candidate (exchanges ICE network candidates)
        """
        action = data.get("action")
        target_user_id = data.get("targetUserId")
        payload = data.get("payload", {})

        if not target_user_id:
            return

        envelope = {
            "type": "webrtc_signal",
            "action": action,
            "senderId": sender_id,
            "payload": payload
        }
        await self.send_to_user(target_user_id, envelope)

ws_manager = WebSocketManager()
