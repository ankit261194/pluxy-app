"""
Sync Router: Authenticated Multi-Device State Sync.
Replaces insecure query-parameter role checks with token-authenticated sessions.
"""

import json
from typing import Optional
from fastapi import APIRouter, Depends
from backend.database import get_db
from backend.security import get_optional_user

router = APIRouter(prefix="/api/sync", tags=["sync"])

@router.get("")
async def sync_state(v: int = 0, current_user: Optional[dict] = Depends(get_optional_user)):
    user_id = current_user["id"] if current_user else None
    is_admin = current_user and current_user.get("role") in ["admin", "super_admin"]

    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch app config
        cursor.execute("SELECT key, value FROM app_config")
        config_rows = dict(cursor.fetchall())

        app_config = {
            "appName": config_rows.get("appName", "Pluxy"),
            "tagline": config_rows.get("tagline", "All-in-One Super Social Media & Lifetime AI"),
            "founderName": config_rows.get("founderName", "Ankit Chaudhary"),
            "founderPhone": config_rows.get("founderPhone", "8533955333"),
            "founderEmail": config_rows.get("founderEmail", "ankit@pluxy.app"),
            "themeAccent": config_rows.get("themeAccent", "#38BDF8")
        }
        feature_flags = json.loads(config_rows.get("featureFlags", "{}"))
        version = int(config_rows.get("version", "1"))

        # Fetch custom services
        cursor.execute("SELECT id, name, tagline, icon, category, description, target_position, active, badge FROM custom_services WHERE active = 1")
        services = [
            {
                "id": s["id"],
                "name": s["name"],
                "tagline": s["tagline"],
                "icon": s["icon"],
                "category": s["category"],
                "description": s["description"],
                "targetPosition": s["target_position"],
                "active": bool(s["active"]),
                "badge": s["badge"]
            } for s in cursor.fetchall()
        ]

        # Fetch sponsored ads
        cursor.execute("SELECT id, brand, logo, headline, description, media_url, cta_text, link_url, placement, active, impressions, clicks FROM sponsored_ads WHERE active = 1")
        ads = [
            {
                "id": a["id"],
                "brand": a["brand"],
                "logo": a["logo"],
                "headline": a["headline"],
                "description": a["description"],
                "mediaUrl": a["media_url"],
                "ctaText": a["cta_text"],
                "linkUrl": a["link_url"],
                "placement": a["placement"],
                "active": bool(a["active"]),
                "impressions": a["impressions"],
                "clicks": a["clicks"]
            } for a in cursor.fetchall()
        ]

        # Fetch announcements
        cursor.execute("SELECT id, title, message, badge FROM announcements WHERE active = 1 ORDER BY created_at DESC LIMIT 5")
        announcements = [dict(an) for an in cursor.fetchall()]

        # User alerts (only for authenticated user)
        user_alert = None
        user_override = {}
        if user_id:
            cursor.execute("SELECT id, title, message, badge, created_at FROM user_alerts WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 1", (user_id,))
            alert_row = cursor.fetchone()
            if alert_row:
                user_alert = dict(alert_row)
                cursor.execute("UPDATE user_alerts SET is_read = 1 WHERE id = ?", (user_alert["id"],))

            cursor.execute("SELECT bonus_cash, custom_status, is_blocked FROM user_overrides WHERE user_id = ?", (user_id,))
            override_row = cursor.fetchone()
            if override_row:
                user_override = dict(override_row)

    return {
        "changed": True,
        "version": version,
        "appConfig": app_config,
        "featureFlags": feature_flags,
        "customServices": services,
        "sponsoredAds": ads,
        "announcements": announcements,
        "userOverride": user_override,
        "userAlert": user_alert
    }
