# 🚀 Pluxy Social Super-App — Hostinger Deployment Guide
> **Complete Guide for Deploying Pluxy on Hostinger Without a Custom Domain (Direct IP / Preview URL)**

---

## 📌 Important Notice: No Domain Needed Right Now!
Pluxy's architecture is **100% domain-agnostic**. You do **not** need to buy or configure a domain right now. 
- You can access and run Pluxy immediately using your **Hostinger VPS IP address** (e.g. `http://195.35.x.x`) or Hostinger Preview URL.
- When you purchase a domain later, connecting it takes **just 1 command** without modifying any application code.

---

## 🌟 Option A: Hostinger VPS Deployment (Recommended)
Hostinger VPS (KVM Linux / Ubuntu 20.04, 22.04, or 24.04) gives you dedicated resources, root access, and a static public IP. This allows FastAPI, WebSockets, WebRTC signaling, and the static web frontend to run natively with maximum speed.

### Step 1: Connect to your Hostinger VPS via SSH
Open PowerShell or Terminal on your computer and run:
```bash
ssh root@<YOUR_HOSTINGER_VPS_IP>
```
*(Enter your VPS root password when prompted)*

---

### Step 2: Run the One-Click Deployment Command
Execute this single command on your VPS terminal:
```bash
curl -sSL https://raw.githubusercontent.com/ankit261194/pluxy-app/main/hostinger/setup_vps.sh | sudo bash
```

**What this script automatically does for you:**
1. Installs Python 3, pip, venv, Git, Nginx, and UFW firewall.
2. Clones the latest Pluxy code from GitHub into `/var/www/pluxy`.
3. Creates a Python virtual environment and installs all dependencies (`fastapi`, `uvicorn`, `websockets`, `httpx`, `pydantic`, `requests`).
4. Configures systemd background daemon (`pluxy.service`) with auto-restart.
5. Configures Nginx reverse proxy with full WebSocket and WebRTC upgrade headers.
6. Opens HTTP (80) and HTTPS (443) ports in firewall.
7. Prints your live URL!

---

### Step 3: Access Your App Immediately
Once the script finishes (usually takes 60 seconds), open your web browser and go to:
- **Web App**: `http://<YOUR_HOSTINGER_VPS_IP>`
- **API Health Check**: `http://<YOUR_HOSTINGER_VPS_IP>/api/health`
- **Interactive API Docs**: `http://<YOUR_HOSTINGER_VPS_IP>/api/docs`

---

### Useful VPS Management Commands
- **Check Backend Service Status:**
  ```bash
  systemctl status pluxy
  ```
- **Restart Pluxy Backend:**
  ```bash
  systemctl restart pluxy
  ```
- **View Real-Time Backend Logs:**
  ```bash
  journalctl -u pluxy -f
  ```
- **Pull Latest Code Updates from GitHub:**
  ```bash
  cd /var/www/pluxy && git pull origin main && systemctl restart pluxy
  ```

---

### Adding a Custom Domain Later (Whenever you purchase one)
When you register a domain (e.g. `pluxy.com`):
1. In your domain registrar (Hostinger / GoDaddy / Namecheap), create an **A Record**:
   - **Type**: `A`
   - **Host / Name**: `@`
   - **Points to / Value**: `<YOUR_HOSTINGER_VPS_IP>`
2. On your VPS, run Certbot to automatically enable free HTTPS SSL:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
*That's it! SSL is automatically installed and auto-renewed.*

---

## 🌐 Option B: Hostinger Shared / Cloud Hosting (hPanel)
If you have Hostinger Shared Web Hosting (which uses LiteSpeed and cPanel/hPanel):

1. Log into your **Hostinger hPanel**.
2. Go to **Websites** -> **File Manager** -> Open `public_html/`.
3. Upload all files from the `hostinger/hostinger_shared_upload.zip` package:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `.htaccess`
   - `css/`
   - `js/`
   - `assets/`
4. In Hostinger Shared Hosting, LiteSpeed serves the static web app and PWA at lightning speeds.
5. For the live backend API and WebSockets:
   - The web app automatically communicates with the live backend cloud instance (`https://pluxy-app.onrender.com`), ensuring 100% genuine database persistence, WebSockets, and WebRTC calling without needing root server access!

---

## 📱 Android App (Pluxy.apk)
The generated Android APK (`Pluxy.apk`) is fully native:
- Supports Camera and Microphone hardware for real video calling and snap capture.
- Uses Android WebView with custom WebChromeClient file pickers.
- Auto-detects online/offline connectivity.
- Contains deep linking for `https://pluxy.app` and `pluxy://`.
- Works on Android 7.0+ (API 24 to 34+).
