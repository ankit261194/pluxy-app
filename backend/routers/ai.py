"""
Gemini AI Proxy Router: Authenticated Server-Side AI Execution.
No simulated answers. Uses real backend GEMINI_API_KEY.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.security import get_current_user
from backend.ai_service import call_gemini

router = APIRouter(prefix="/api/ai", tags=["ai"])

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[Dict[str, Any]]] = None

class AICaptionRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500)
    tone: Optional[str] = "viral"

@router.post("/chat")
async def chat_with_gemini(req: AIChatRequest, current_user: dict = Depends(get_current_user)):
    system_prompt = (
        "You are Pluxy AI, an intelligent, helpful, stylish, and charismatic social media co-pilot "
        "inside Pluxy — an all-in-one super social app uniting WhatsApp, Instagram, and Snapchat. "
        "Be engaging, concise, friendly, and use expressive emojis. Support English, Hindi, and Hinglish."
    )
    res = await call_gemini(
        prompt=req.message,
        system_instruction=system_prompt,
        history=req.history,
        user_id=current_user["id"],
        endpoint_name="chat"
    )
    if not res["success"]:
        raise HTTPException(status_code=503, detail=res["error"])

    return {"success": True, "reply": res["reply"], "isLive": True}

@router.post("/caption")
async def generate_caption(req: AICaptionRequest, current_user: dict = Depends(get_current_user)):
    prompt = (
        f"Write a viral, captivating social media caption with 6-8 trending hashtags "
        f"for an Instagram/Reels post about: '{req.topic}'. Tone: {req.tone}."
    )
    res = await call_gemini(
        prompt=prompt,
        user_id=current_user["id"],
        endpoint_name="caption"
    )
    if not res["success"]:
        raise HTTPException(status_code=503, detail=res["error"])

    return {"success": True, "caption": res["reply"], "isLive": True}
