// Snapchat Ephemeral Snaps & Streaks Module
class SnapsModule {
  constructor() {
    this.container = document.getElementById("snaps-list-container");
    this.viewer = document.getElementById("snap-viewer-modal");
    this.activeSnap = null;
    this.snapTimer = null;
    this.remainingSeconds = 0;
  }

  init() {
    this.renderSnaps();
    this.setupViewer();
  }

  async renderSnaps() {
    let snaps = [];
    if (window.apiClient && window.apiClient.getToken()) {
      try {
        const res = await window.apiClient.get("/snaps");
        if (res && res.success && Array.isArray(res.snaps)) {
          snaps = res.snaps.map(s => ({
            id: s.id,
            senderName: s.sender ? s.sender.displayName : (s.senderName || "Friend"),
            senderAvatar: s.sender ? s.sender.avatar : (s.senderAvatar || "assets/pluxy-icon.png"),
            mediaUrl: s.mediaUrl,
            caption: s.caption || "",
            duration: s.duration || 5,
            isOpened: s.isOpened || false,
            timestamp: s.timestamp || "Recent"
          }));
          this.snapsList = snaps;
        }
      } catch (err) {
        console.warn("Could not fetch snaps from backend:", err);
      }
    }

    if (!snaps.length && window.omniStore && typeof window.omniStore.getSnaps === "function") {
      snaps = window.omniStore.getSnaps();
    }
    this.snapsList = snaps;

    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Streak Banner -->
      <div class="streak-banner">
        <div class="streak-flame-icon">🔥</div>
        <div class="streak-info">
          <strong>Snapchat Streaks Active!</strong>
          <span>Send daily snaps to friends to keep your flame streak alive!</span>
        </div>
        <button class="streak-action-btn" onclick="window.app.switchTab('camera')">Snap 📸</button>
      </div>

      <div class="section-title-row">
        <h3>Recent Snaps</h3>
        <span class="badge-subtle">${snaps.filter(s => !s.isOpened).length} Unopened</span>
      </div>

      <!-- Snaps List -->
      <div class="snaps-items-list">
        ${snaps.length === 0 ? '<div style="padding: 30px; text-align: center; color: #8E8E93;">No snaps right now. Tap the camera to send a snap! 📸</div>' : ''}
        ${snaps.map(snap => `
          <div class="snap-item-card ${snap.isOpened ? 'opened' : 'unopened'}" onclick="window.snapsModule.openSnap('${snap.id}')">
            <div class="snap-avatar-wrap">
              <img src="${window.apiClient ? window.apiClient.safeUrl(snap.senderAvatar) : snap.senderAvatar}" alt="${window.apiClient ? window.apiClient.escapeHtml(snap.senderName) : snap.senderName}" />
              <div class="snap-status-icon ${snap.isOpened ? 'opened' : 'unopened'}">
                ${snap.isOpened ? '<i class="ph ph-square"></i>' : '<i class="ph-fill ph-square"></i>'}
              </div>
            </div>
            <div class="snap-details">
              <div class="snap-sender-row">
                <strong class="snap-sender-name">${window.apiClient ? window.apiClient.escapeHtml(snap.senderName) : snap.senderName}</strong>
                <span class="snap-timestamp">${window.apiClient ? window.apiClient.escapeHtml(snap.timestamp) : snap.timestamp}</span>
              </div>
              <div class="snap-status-hint">
                ${snap.isOpened ? 'Opened • Tap camera to reply' : `<strong>New Snap • ${snap.duration}s • Tap to view</strong>`}
              </div>
            </div>
            <button class="snap-reply-btn" onclick="event.stopPropagation(); window.app.switchTab('camera')">
              <i class="ph-bold ph-camera"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  openSnap(snapId) {
    const snaps = this.snapsList || (window.omniStore ? window.omniStore.getSnaps() : []);
    const snap = snaps.find(s => s.id === snapId);
    if (!snap) return;

    if (snap.isOpened) {
      if (window.app) {
        window.app.showToast(`Snap from ${snap.senderName} has already expired & self-destructed! ⏳`);
        window.app.playSound('pop');
      }
      return;
    }

    this.activeSnap = snap;
    this.remainingSeconds = snap.duration || 5;

    const imgEl = document.getElementById("snap-media-image");
    const senderEl = document.getElementById("snap-sender-info");
    const captionEl = document.getElementById("snap-caption-text");
    const counterEl = document.getElementById("snap-timer-counter");

    if (imgEl) imgEl.src = window.apiClient ? window.apiClient.safeUrl(snap.mediaUrl) : snap.mediaUrl;
    if (senderEl) senderEl.innerText = `Snap from ${snap.senderName}`;
    if (captionEl) captionEl.innerText = snap.caption || '';
    if (counterEl) counterEl.innerText = this.remainingSeconds;

    this.viewer.classList.add("active");
    if (window.app) window.app.playSound('ding');

    // Countdown timer
    clearInterval(this.snapTimer);
    this.snapTimer = setInterval(() => {
      this.remainingSeconds--;
      const counter = document.getElementById("snap-timer-counter");
      if (counter) counter.innerText = this.remainingSeconds;

      if (this.remainingSeconds <= 0) {
        clearInterval(this.snapTimer);
        this.burnAndCloseSnap();
      }
    }, 1000);
  }

  async burnAndCloseSnap() {
    const viewer = this.viewer;
    if (viewer) {
      viewer.classList.add("burning");
      if (window.app) window.app.playSound('whoosh');
    }

    const snapToBurn = this.activeSnap;
    this.activeSnap = null;

    if (snapToBurn) {
      snapToBurn.isOpened = true;
      if (window.apiClient && window.apiClient.getToken()) {
        try {
          await window.apiClient.post(`/snaps/${snapToBurn.id}/view`);
        } catch (err) {
          console.warn("Could not mark snap viewed on server:", err);
        }
      }
      if (window.omniStore && typeof window.omniStore.markSnapOpened === "function") {
        window.omniStore.markSnapOpened(snapToBurn.id);
      }
    }

    setTimeout(() => {
      if (viewer) {
        viewer.classList.remove("active");
        viewer.classList.remove("burning");
      }
      this.renderSnaps();
      if (window.app) window.app.showToast('🔥 Snap burned & deleted permanently!');
    }, 700);
  }

  setupViewer() {
    const closeBtn = document.getElementById("btn-close-snap");
    if (closeBtn) {
      closeBtn.onclick = () => {
        clearInterval(this.snapTimer);
        this.burnAndCloseSnap();
      };
    }
  }
}

window.snapsModule = new SnapsModule();
