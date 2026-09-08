"""
Authentication Router: Register, Login, Logout, Me.
Secure scrypt password hashing & session management.
"""

import time
import secrets
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status, Request
from backend.database import get_db
from backend.security import hash_password, verify_password, create_session, delete_session, get_current_user, check_rate_limit, extract_token_from_header

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    display_name: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=2)
    password: str = Field(..., min_length=1)

@router.post("/register")
async def register(req: RegisterRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"reg_{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many registration attempts. Please wait a minute.")

    clean_username = req.username.strip().lower()
    clean_display = req.display_name.strip()

    # Check unique username
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE LOWER(username) = ?", (clean_username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username is already taken. Please choose another.")

        now = int(time.time() * 1000)
        user_id = f"user_{clean_username}_{secrets.token_hex(4)}"
        pwd_hash, salt = hash_password(req.password)
        avatar = req.avatar_url or f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"

        # All user registrations start strictly as standard role 'user'
        role = "user"

        cursor.execute("""
            INSERT INTO users (id, username, display_name, email, phone, password_hash, salt, role, avatar_url, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, clean_username, clean_display, req.email, req.phone, pwd_hash, salt, role, avatar, req.bio or "", now, now))

        # Initialize creator wallet
        cursor.execute("""
            INSERT OR IGNORE INTO creator_wallets (user_id, balance, total_views, rpm_rate, lifetime_earnings, updated_at)
            VALUES (?, 0.0, 0, 75.0, 0.0, ?)
        """, (user_id, now))

    token = create_session(user_id, request.headers.get("User-Agent"), client_ip)
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "username": clean_username,
            "displayName": clean_display,
            "email": req.email,
            "phone": req.phone,
            "role": role,
            "avatar": avatar,
            "bio": req.bio or "",
            "verified": False,
            "streakCount": 0,
            "followersCount": 0,
            "followingCount": 0
        }
    }

@router.post("/login")
async def login(req: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"login_{client_ip}", max_requests=15, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many login attempts. Please wait a minute.")

    ident = req.identifier.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, display_name, email, phone, password_hash, salt, role, avatar_url, bio, verified, streak_count, followers_count, following_count
            FROM users
            WHERE LOWER(username) = ? OR LOWER(email) = ? OR phone = ?
        """, (ident, ident, ident))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid username or password.")

        user_data = dict(row)
        if not verify_password(req.password, user_data["password_hash"], user_data["salt"]):
            raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_session(user_data["id"], request.headers.get("User-Agent"), client_ip)

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_data["id"],
            "username": user_data["username"],
            "displayName": user_data["display_name"],
            "email": user_data["email"],
            "phone": user_data["phone"],
            "role": user_data["role"],
            "avatar": user_data["avatar_url"],
            "bio": user_data["bio"],
            "verified": bool(user_data["verified"]),
            "streakCount": user_data["streak_count"],
            "followersCount": user_data["followers_count"],
            "followingCount": user_data["following_count"]
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user["id"],
            "username": current_user["username"],
            "displayName": current_user["display_name"],
            "email": current_user["email"],
            "phone": current_user["phone"],
            "role": current_user["role"],
            "avatar": current_user["avatar_url"],
            "bio": current_user["bio"],
            "verified": bool(current_user["verified"]),
            "streakCount": current_user["streak_count"],
            "followersCount": current_user["followers_count"],
            "followingCount": current_user["following_count"],
            "postsCount": current_user["posts_count"]
        }
    }

@router.post("/logout")
async def logout(request: Request):
    auth_hdr = request.headers.get("Authorization")
    token = extract_token_from_header(auth_hdr)
    if token:
        delete_session(token)
    return {"success": True, "message": "Logged out successfully."}
