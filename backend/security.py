"""
Pluxy Authentication, Password Hashing & RBAC Security Engine.
Uses OWASP-recommended scrypt and constant-time comparisons.
"""

import hashlib
import hmac
import secrets
import time
from typing import Optional, Dict, Any, List
from fastapi import Header, HTTPException, status, Depends
from backend.database import get_db

SESSION_EXPIRY_DAYS = 30
SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_DAYS * 86400

def hash_password(password: str) -> tuple[str, str]:
    """Hashes password with scrypt and a fresh 32-byte cryptographically secure salt."""
    salt = secrets.token_bytes(32)
    # scrypt with N=16384, r=8, p=1 (OWASP recommended parameters)
    pwd_hash = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=16384, r=8, p=1)
    return pwd_hash.hex(), salt.hex()

def verify_password(password: str, hash_hex: str, salt_hex: str) -> bool:
    """Verifies password using scrypt and constant-time HMAC digest comparison."""
    try:
        salt = bytes.fromhex(salt_hex)
        expected_hash = bytes.fromhex(hash_hex)
        computed_hash = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=16384, r=8, p=1)
        return hmac.compare_digest(computed_hash, expected_hash)
    except Exception:
        return False

def create_session(user_id: str, user_agent: Optional[str] = None, ip_address: Optional[str] = None) -> str:
    """Generates a secure session token and persists it in SQLite."""
    token = secrets.token_urlsafe(36)
    now = int(time.time())
    expires_at = now + SESSION_EXPIRY_SECONDS

    with get_db() as conn:
        conn.execute("""
            INSERT INTO sessions (token, user_id, user_agent, ip_address, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (token, user_id, user_agent, ip_address, expires_at, now))

    return token

def get_user_by_session(token: str) -> Optional[Dict[str, Any]]:
    """Retrieves authenticated user profile from session token."""
    if not token:
        return None

    now = int(time.time())
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.username, u.display_name, u.email, u.phone, u.role,
                   u.avatar_url, u.bio, u.streak_count, u.followers_count, u.following_count,
                   u.posts_count, u.verified, u.created_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > ?
        """, (token, now))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None

def delete_session(token: str):
    """Logs out by invalidating session token in DB."""
    if token:
        with get_db() as conn:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))

def extract_token_from_header(authorization: Optional[str]) -> Optional[str]:
    """Parses 'Bearer <token>' or raw token from Authorization header."""
    if not authorization:
        return None
    parts = authorization.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return authorization.strip()

# ================= FastAPI Security Dependencies =================

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency requiring an active, valid authenticated user session."""
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = get_user_by_session(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user

async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Dependency that returns current user if authenticated, or None."""
    token = extract_token_from_header(authorization)
    if not token:
        return None
    return get_user_by_session(token)

def require_role(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) dependency factory."""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role", "user")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: action requires one of roles {allowed_roles}. Current role: {user_role}."
            )
        return current_user
    return role_checker

# In-memory Token Bucket / Rate Limiter for Brute Force Protection
_RATE_LIMITS: Dict[str, List[float]] = {}

def check_rate_limit(key: str, max_requests: int = 15, window_seconds: int = 60) -> bool:
    """Sliding-window rate limiter per client key/IP."""
    now = time.time()
    if key not in _RATE_LIMITS:
        _RATE_LIMITS[key] = []
    
    # Filter timestamps within window
    _RATE_LIMITS[key] = [t for t in _RATE_LIMITS[key] if now - t < window_seconds]
    if len(_RATE_LIMITS[key]) >= max_requests:
        return False
    
    _RATE_LIMITS[key].append(now)
    return True
