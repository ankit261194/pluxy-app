import http.server
import socket
import os
import sys
import threading
import time

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = int(os.environ.get("PORT", 8080))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

import json
import urllib.parse

DATA_DIR = os.path.join(DIRECTORY, "data")
STATE_FILE = os.path.join(DATA_DIR, "app_state.json")

# Default Server Shared State
DEFAULT_STATE = {
    "version": 1,
    "appConfig": {
        "appName": "Pluxy",
        "tagline": "All-in-One Super Social Media & Lifetime AI",
        "founderName": "Ankit Chaudhary",
        "founderPhone": "8533955333",
        "founderEmail": "ankit@pluxy.app",
        "adminPin": "910010025123343",
        "themeAccent": "#38BDF8"
    },
    "featureFlags": {
        "feed": True,
        "reels": True,
        "camera": True,
        "chats": True,
        "calling": True,
        "ai": True,
        "explore": True,
        "snapmap": True
    },
    "customServices": [
        {
            "id": "srv_beats",
            "name": "Pluxy Beats",
            "tagline": "Live Music & Lo-Fi Beats",
            "icon": "🎵",
            "category": "music",
            "description": "Non-stop curated Lo-Fi, Chillhop, Punjabi & Bollywood beats while you chat and browse",
            "targetPosition": "both",
            "active": True,
            "badge": "HOT"
        }
    ],
    "sponsoredAds": [
        {
            "id": "ad_boat_rockerz",
            "brand": "boAt Lifestyle",
            "logo": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
            "headline": "boAt Rockerz 550 - 50mm Dynamic Bass",
            "description": "Experience 20 Hours of pure non-stop studio playback with Beast Mode low latency! 🎧⚡",
            "mediaUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            "ctaText": "Shop Now (₹1,499) 🛍️",
            "linkUrl": "https://www.boat-lifestyle.com",
            "placement": "both",
            "active": True,
            "impressions": 1420,
            "clicks": 182
        },
        {
            "id": "ad_pluxy_ai",
            "brand": "Pluxy Pro AI",
            "logo": "assets/pluxy-icon.png",
            "headline": "Unlock Lifetime Gemini 2.0 Flash Pro",
            "description": "Zero monthly recurring fee. Get infinite multimodal image & code understanding built directly by Founder Ankit Chaudhary! 🚀",
            "mediaUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
            "ctaText": "Activate Free ✨",
            "linkUrl": "https://aistudio.google.com/app/apikey",
            "placement": "both",
            "active": True,
            "impressions": 3890,
            "clicks": 425
        }
    ],
    "creatorFund": {
        "rpmRate": 75,
        "minPayout": 100,
        "totalFundDisbursed": 45000
    },
    "userOverrides": {},
    "userAlerts": {},
    "announcements": [],
    "auditLogs": []
}

# Load or Initialize Shared State
if not os.path.exists(DATA_DIR):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
    except Exception:
        pass

SERVER_STATE = dict(DEFAULT_STATE)
if os.path.exists(STATE_FILE):
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            saved = json.load(f)
            SERVER_STATE.update(saved)
    except Exception as e:
        print(f"Notice: Initializing fresh state ({e})")

STATE_LOCK = threading.Lock()

def save_state_to_disk():
    try:
        with STATE_LOCK:
            with open(STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(SERVER_STATE, f, indent=2, ensure_ascii=False)
    except Exception as e:
        sys.stderr.write(f"Error persisting state to disk: {e}\n")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # 1. API: Real-Time Multi-Device Sync Endpoint
        if self.path.startswith('/api/sync'):
            parsed = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed.query)
            
            client_v = int(query.get('v', [0])[0]) if query.get('v') else 0
            user_id = query.get('user_id', [''])[0]
            is_admin = query.get('is_admin', ['false'])[0].lower() == 'true'

            # Super-fast check: If version unchanged, return { changed: False } (< 1ms)
            if client_v > 0 and client_v == SERVER_STATE.get("version", 1):
                # Check if there is an unread targeted alert for this specific user
                targeted_alert = SERVER_STATE.get("userAlerts", {}).get(user_id)
                if not targeted_alert:
                    payload = json.dumps({"changed": False, "version": SERVER_STATE["version"]})
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Length', str(len(payload.encode('utf-8'))))
                    self.end_headers()
                    self.wfile.write(payload.encode('utf-8'))
                    return

            # Return delta package
            user_override = SERVER_STATE.get("userOverrides", {}).get(user_id, {})
            user_alert = SERVER_STATE.get("userAlerts", {}).get(user_id, None)

            # Clear one-time alert once fetched
            if user_alert and user_id in SERVER_STATE.get("userAlerts", {}):
                del SERVER_STATE["userAlerts"][user_id]
                threading.Thread(target=save_state_to_disk, daemon=True).start()

            data = {
                "changed": True,
                "version": SERVER_STATE.get("version", 1),
                "appConfig": SERVER_STATE.get("appConfig", {}),
                "featureFlags": SERVER_STATE.get("featureFlags", {}),
                "customServices": SERVER_STATE.get("customServices", []),
                "sponsoredAds": SERVER_STATE.get("sponsoredAds", []),
                "creatorFund": SERVER_STATE.get("creatorFund", {}),
                "announcements": SERVER_STATE.get("announcements", []),
                "userOverride": user_override,
                "userAlert": user_alert
            }

            if is_admin:
                data["allUserOverrides"] = SERVER_STATE.get("userOverrides", {})

            payload = json.dumps(data, ensure_ascii=False)
            body_bytes = payload.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body_bytes)))
            self.end_headers()
            self.wfile.write(body_bytes)
            return

        # Regular static file serving
        return super().do_GET()

    def do_POST(self):
        # 2. API: Admin Master State Update Endpoint
        if self.path == '/api/admin/sync':
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len)
                data = json.loads(post_body.decode('utf-8'))

                action_type = data.get('type')
                payload = data.get('payload', {})

                with STATE_LOCK:
                    SERVER_STATE["version"] = SERVER_STATE.get("version", 1) + 1

                    if action_type == "branding":
                        SERVER_STATE["appConfig"].update(payload)
                    elif action_type == "services":
                        SERVER_STATE["customServices"] = payload
                    elif action_type == "ads":
                        if isinstance(payload, list):
                            SERVER_STATE["sponsoredAds"] = payload
                        elif isinstance(payload, dict):
                            if "deletedId" in payload:
                                SERVER_STATE["sponsoredAds"] = [a for a in SERVER_STATE.get("sponsoredAds", []) if a.get("id") != payload["deletedId"]]
                            elif "id" in payload:
                                ads = SERVER_STATE.get("sponsoredAds", [])
                                existing_idx = next((i for i, a in enumerate(ads) if a.get("id") == payload["id"]), None)
                                if existing_idx is not None:
                                    ads[existing_idx] = payload
                                else:
                                    ads.insert(0, payload)
                                SERVER_STATE["sponsoredAds"] = ads
                    elif action_type == "admin_pin":
                        pin = payload.get("adminPin")
                        if pin:
                            SERVER_STATE["appConfig"]["adminPin"] = str(pin)
                    elif action_type == "creator_settings":
                        if "creatorFund" not in SERVER_STATE:
                            SERVER_STATE["creatorFund"] = {}
                        SERVER_STATE["creatorFund"].update(payload)
                    elif action_type == "creator_reward":
                        target_id = payload.get("userId")
                        amount = payload.get("amount", 0)
                        note = payload.get("note", "Creator Reward from Founder Ankit Chaudhary")
                        if target_id:
                            if "userOverrides" not in SERVER_STATE:
                                SERVER_STATE["userOverrides"] = {}
                            if target_id not in SERVER_STATE["userOverrides"]:
                                SERVER_STATE["userOverrides"][target_id] = {"userId": target_id}
                            curr_bonus = SERVER_STATE["userOverrides"][target_id].get("bonusCash", 0)
                            SERVER_STATE["userOverrides"][target_id]["bonusCash"] = curr_bonus + amount
                            if "userAlerts" not in SERVER_STATE:
                                SERVER_STATE["userAlerts"] = {}
                            SERVER_STATE["userAlerts"][target_id] = {
                                "userId": target_id,
                                "title": "💰 Cash Reward from Founder Ankit Chaudhary!",
                                "message": f"Congratulations! You've received a ₹{amount:,} cash reward for your Reels content! {note}",
                                "badge": f"Cash Reward ₹{amount:,}",
                                "timestamp": int(time.time() * 1000)
                            }
                    elif action_type == "feature_flags":
                        SERVER_STATE["featureFlags"].update(payload)
                    elif action_type == "user_override":
                        target_id = payload.get("userId")
                        if target_id:
                            if "userOverrides" not in SERVER_STATE:
                                SERVER_STATE["userOverrides"] = {}
                            SERVER_STATE["userOverrides"][target_id] = payload
                    elif action_type == "user_alert":
                        target_id = payload.get("userId")
                        if target_id:
                            if "userAlerts" not in SERVER_STATE:
                                SERVER_STATE["userAlerts"] = {}
                            SERVER_STATE["userAlerts"][target_id] = payload
                    elif action_type == "broadcast":
                        if "announcements" not in SERVER_STATE:
                            SERVER_STATE["announcements"] = []
                        SERVER_STATE["announcements"].insert(0, payload)
                        if len(SERVER_STATE["announcements"]) > 20:
                            SERVER_STATE["announcements"].pop()

                # Persist to disk asynchronously
                threading.Thread(target=save_state_to_disk, daemon=True).start()

                resp = json.dumps({"success": True, "version": SERVER_STATE["version"]})
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(resp.encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return

        # Unknown POST
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        # Keep logs clean and silent for high-frequency sync polling
        if "/api/sync" in str(args[0]):
            return
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]}\n")

# Run IPv4 server
def run_v4():
    server_address = ('0.0.0.0', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, CustomHandler)
    httpd.serve_forever()

# Run IPv6 server for localhost ::1
def run_v6():
    try:
        class V6Server(http.server.ThreadingHTTPServer):
            address_family = socket.AF_INET6
        server_address = ('::', PORT)
        httpd = V6Server(server_address, CustomHandler)
        httpd.serve_forever()
    except Exception as e:
        # IPv6 might be disabled on some configs, which is fine
        pass

if __name__ == '__main__':
    lan_ip = get_lan_ip()
    print("=" * 65)
    print("OMNISPHERE SUPER-APP DUAL-STACK SERVER IS READY!")
    print(f"Local URL:       http://localhost:{PORT}")
    print(f"Direct IPv4:     http://127.0.0.1:{PORT}")
    print(f"Mobile (Wi-Fi):  http://{lan_ip}:{PORT}")
    print("=" * 65)
    sys.stdout.flush()

    # Start IPv6 in thread, IPv4 in main
    t_v6 = threading.Thread(target=run_v6, daemon=True)
    t_v6.start()
    run_v4()