"""
Pluxy Gemini AI Service: Authenticated backend proxy.
Client NEVER holds API keys. Upstream errors return genuine diagnostics.
NO FAKE / SIMULATED RESPONSES.
"""

import os
import httpx
import time
from typing import Dict, Any, List, Optional
from backend.database import get_db

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

async def call_gemini(
    prompt: str,
    system_instruction: str = "",
    history: Optional[List[Dict[str, Any]]] = None,
    user_id: Optional[str] = None,
    endpoint_name: str = "chat"
) -> Dict[str, Any]:
    """
    Executes authenticated request to Google Gemini API via official endpoint.
    If unconfigured or API fails, returns clear, non-simulated error response.
    """
    api_key = os.environ.get("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        return {
            "success": False,
            "error": "AI service is currently unavailable. The server administrator has not configured the GEMINI_API_KEY.",
            "isLive": False
        }

    # Format payload
    contents = []
    if history:
        for item in history:
            role = "user" if item.get("role") == "user" else "model"
            text = item.get("text", "")
            if text:
                contents.append({"role": role, "parts": [{"text": text}]})

    contents.append({"role": "user", "parts": [{"text": prompt}]})

    body: Dict[str, Any] = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

    if system_instruction:
        body["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json=body)

        if resp.status_code != 200:
            return {
                "success": False,
                "error": f"Gemini API returned status {resp.status_code}: {resp.text[:200]}",
                "isLive": False
            }

        data = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return {
                "success": False,
                "error": "Gemini API produced an empty response or safety filter triggered.",
                "isLive": False
            }

        reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        # Record AI usage in database
        if user_id:
            try:
                with get_db() as conn:
                    conn.execute("""
                        INSERT INTO ai_usage (id, user_id, endpoint, prompt_tokens, completion_tokens, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (f"ai_{int(time.time()*1000)}", user_id, endpoint_name, len(prompt.split()), len(reply_text.split()), int(time.time()*1000)))
            except Exception:
                pass

        return {
            "success": True,
            "reply": reply_text,
            "isLive": True
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to connect to Gemini API: {str(e)}",
            "isLive": False
        }

async def call_gemini_vision(
    image_b64: str,
    mime_type: str = "image/jpeg",
    prompt: str = "Analyze this photo for aesthetic quality, composition, lighting, color palette, and suggest improvements. Provide a score out of 10.",
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes multimodal image analysis via Gemini 2.5 Flash Vision.
    Extracts inlineData from base64 and queries the model.
    """
    api_key = os.environ.get("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        return {
            "success": False,
            "error": "AI Vision is temporarily unavailable. The server administrator has not configured the GEMINI_API_KEY in the environment.",
            "isLive": False
        }

    # Clean base64 prefix if present
    clean_b64 = image_b64
    if "," in clean_b64:
        header, clean_b64 = clean_b64.split(",", 1)
        if "image/png" in header:
            mime_type = "image/png"
        elif "image/webp" in header:
            mime_type = "image/webp"
        elif "image/gif" in header:
            mime_type = "image/gif"

    parts = [
        {
            "inlineData": {
                "mimeType": mime_type,
                "data": clean_b64
            }
        },
        {
            "text": prompt + "\n\nFormat your response as structured JSON with keys: score (float 1-10), title (string), summary (string), lighting (string), composition (string), tips (list of strings)."
        }
    ]

    body: Dict[str, Any] = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 800
        }
    }

    model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=body)

        if resp.status_code != 200:
            return {
                "success": False,
                "error": f"Gemini Vision returned status {resp.status_code}: {resp.text[:200]}",
                "isLive": False
            }

        data = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return {
                "success": False,
                "error": "Gemini Vision returned no candidate results.",
                "isLive": False
            }

        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        # Log AI usage
        if user_id:
            try:
                with get_db() as conn:
                    conn.execute("""
                        INSERT INTO ai_usage (id, user_id, endpoint, prompt_tokens, completion_tokens, created_at)
                        VALUES (?, ?, 'vision', 100, len(raw_text.split()), ?)
                    """, (f"ai_{int(time.time()*1000)}", user_id, int(time.time()*1000)))
            except Exception:
                pass

        return {
            "success": True,
            "analysis": raw_text,
            "isLive": True
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Vision analysis request failed: {str(e)}",
            "isLive": False
        }

