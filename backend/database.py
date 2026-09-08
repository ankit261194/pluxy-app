"""
Pluxy Database Engine: SQLite with WAL mode, foreign keys, and relational schema.
"""

import sqlite3
import os
import json
import time
from contextlib import contextmanager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_DB_PATH = os.path.join(DATA_DIR, "pluxy.db")
DB_PATH = os.environ.get("DATABASE_PATH", DEFAULT_DB_PATH)

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=20.0, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Create all relational tables and initial seed data if not present."""
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL COLLATE NOCASE,
            display_name TEXT NOT NULL,
            email TEXT COLLATE NOCASE,
            phone TEXT,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            avatar_url TEXT,
            bio TEXT,
            streak_count INTEGER DEFAULT 0,
            followers_count INTEGER DEFAULT 0,
            following_count INTEGER DEFAULT 0,
            posts_count INTEGER DEFAULT 0,
            verified INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)

        # 2. Sessions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_agent TEXT,
            ip_address TEXT,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);")

        # 2b. Password Resets table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            reset_code TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            used INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_resets_user_id ON password_resets(user_id);")

        # 3. Posts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            caption TEXT,
            media_url TEXT,
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);")

        # 4. Post Likes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS post_likes (
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            PRIMARY KEY (post_id, user_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 5. Comments table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);")

        # 6. Follows table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS follows (
            follower_id TEXT NOT NULL,
            following_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            PRIMARY KEY (follower_id, following_id),
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 7. Stories table (24h server-side expiration)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            media_url TEXT NOT NULL,
            caption TEXT,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);")

        # 8. Story Views
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS story_views (
            story_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            viewed_at INTEGER NOT NULL,
            PRIMARY KEY (story_id, user_id),
            FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 9. Reels table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reels (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            video_url TEXT NOT NULL,
            caption TEXT,
            audio_track TEXT,
            views_count INTEGER DEFAULT 0,
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);")

        # 10. Reel Likes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reel_likes (
            reel_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            PRIMARY KEY (reel_id, user_id),
            FOREIGN KEY (reel_id) REFERENCES reels(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 11. Snaps table (Disappearing content)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS snaps (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL,
            recipient_id TEXT,
            media_url TEXT NOT NULL,
            caption TEXT,
            filter_id TEXT,
            is_opened INTEGER DEFAULT 0,
            opened_at INTEGER,
            expires_at INTEGER,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_snaps_recipient ON snaps(recipient_id);")

        # 12. Chats table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            is_group INTEGER DEFAULT 0,
            name TEXT,
            avatar_url TEXT,
            created_at INTEGER NOT NULL
        );
        """)

        # 13. Chat Members
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_members (
            chat_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            last_read_message_id TEXT,
            joined_at INTEGER NOT NULL,
            PRIMARY KEY (chat_id, user_id),
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 14. Messages table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_id TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            message_type TEXT DEFAULT 'text',
            content TEXT,
            media_url TEXT,
            duration TEXT,
            status TEXT DEFAULT 'sent',
            created_at INTEGER NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, created_at ASC);")

        # 15. Calls table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS calls (
            id TEXT PRIMARY KEY,
            caller_id TEXT NOT NULL,
            callee_id TEXT NOT NULL,
            call_type TEXT DEFAULT 'video',
            status TEXT DEFAULT 'ended',
            duration INTEGER DEFAULT 0,
            started_at INTEGER NOT NULL,
            ended_at INTEGER,
            FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (callee_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 16. Creator Wallets
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS creator_wallets (
            user_id TEXT PRIMARY KEY,
            balance REAL DEFAULT 0.0,
            total_views INTEGER DEFAULT 0,
            rpm_rate REAL DEFAULT 75.0,
            lifetime_earnings REAL DEFAULT 0.0,
            virtual_gifts_count INTEGER DEFAULT 0,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 17. Wallet Transactions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            ref_id TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id, created_at DESC);")

        # 18. Payout Requests
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS payout_requests (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            amount REAL NOT NULL,
            upi_id TEXT,
            bank_details TEXT,
            status TEXT DEFAULT 'pending',
            failure_reason TEXT,
            idempotency_key TEXT UNIQUE,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 19. Sponsored Ads
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sponsored_ads (
            id TEXT PRIMARY KEY,
            brand TEXT NOT NULL,
            logo TEXT,
            headline TEXT NOT NULL,
            description TEXT,
            media_url TEXT,
            cta_text TEXT DEFAULT 'Learn More',
            link_url TEXT,
            placement TEXT DEFAULT 'both',
            active INTEGER DEFAULT 1,
            impressions INTEGER DEFAULT 0,
            clicks INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        );
        """)

        # 20. Announcements
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            badge TEXT,
            active INTEGER DEFAULT 1,
            created_at INTEGER NOT NULL
        );
        """)

        # 21. App Config (key/value)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );
        """)

        # 22. Admin Audit Logs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id TEXT PRIMARY KEY,
            admin_id TEXT NOT NULL,
            action TEXT NOT NULL,
            target_type TEXT,
            target_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);")

        # 23. AI Usage
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_usage (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            prompt_tokens INTEGER DEFAULT 0,
            completion_tokens INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 24. User Overrides & Badges
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_overrides (
            user_id TEXT PRIMARY KEY,
            bonus_cash REAL DEFAULT 0.0,
            custom_status TEXT,
            is_blocked INTEGER DEFAULT 0,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 25. User Alerts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_alerts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            badge TEXT,
            is_read INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 26. Custom Services
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS custom_services (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tagline TEXT,
            icon TEXT,
            category TEXT,
            description TEXT,
            target_position TEXT DEFAULT 'both',
            active INTEGER DEFAULT 1,
            badge TEXT
        );
        """)

        # Seed default app config if empty
        cursor.execute("SELECT COUNT(*) FROM app_config")
        if cursor.fetchone()[0] == 0:
            now = int(time.time() * 1000)
            defaults = {
                "appName": "Pluxy",
                "tagline": "All-in-One Super Social Media & Lifetime AI",
                "founderName": "Ankit Chaudhary",
                "founderPhone": "8533955333",
                "founderEmail": "ankit@pluxy.app",
                "themeAccent": "#38BDF8",
                "featureFlags": json.dumps({
                    "feed": True,
                    "reels": True,
                    "camera": True,
                    "chats": True,
                    "calling": True,
                    "ai": True,
                    "explore": True,
                    "snapmap": True
                }),
                "version": "1"
            }
            for k, v in defaults.items():
                cursor.execute("INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES (?, ?, ?)", (k, v, now))

        # Seed default services if empty
        cursor.execute("SELECT COUNT(*) FROM custom_services")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO custom_services (id, name, tagline, icon, category, description, target_position, active, badge)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "srv_beats", "Pluxy Beats", "Live Music & Lo-Fi Beats", "🎵", "music",
                "Non-stop curated Lo-Fi, Chillhop, Punjabi & Bollywood beats while you chat and browse",
                "both", 1, "HOT"
            ))

        # Seed sponsored ads if empty
        cursor.execute("SELECT COUNT(*) FROM sponsored_ads")
        if cursor.fetchone()[0] == 0:
            now = int(time.time() * 1000)
            cursor.execute("""
            INSERT INTO sponsored_ads (id, brand, logo, headline, description, media_url, cta_text, link_url, placement, active, impressions, clicks, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "ad_boat_rockerz", "boAt Lifestyle",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
                "boAt Rockerz 550 - 50mm Dynamic Bass",
                "Experience 20 Hours of pure non-stop studio playback with Beast Mode low latency! 🎧⚡",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                "Shop Now (₹1,499) 🛍️", "https://www.boat-lifestyle.com",
                "both", 1, 1420, 182, now
            ))

        print("[Database] Pluxy relational schema initialized successfully!")
