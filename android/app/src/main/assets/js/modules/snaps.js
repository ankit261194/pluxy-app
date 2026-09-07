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

  renderSnaps() {
    const snaps = window.omniStore.getSnaps();
    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Streak Banner -->
      <div class="streak-banner">
        <div class="streak-flame-icon">🔥</div>
        <div class="streak-info">
          <strong>14 Days Streak with Priya Sharma!</strong>
          <span>Send a snap within 5h 20m to keep the flame alive!</span>
        </div>
        <button class="streak-action-btn" onclick="window.app.switchTab('camera')">Snap 📸</button>
      </div>

      <div class="section-title-row">
        <h3>Recent Snaps</h3>
        <span class="badge-subtle">${snaps.filter(s => !s.isOpened).length} Unopened</span>
      </div>

      <!-- Snaps List -->
      <div class="snaps-items-list">
        ${snaps.map(snap => `
          <div class="snap-item-card ${snap.isOpened ? 'opened' : 'unopened'}" onclick="window.snapsModule.openSnap('${snap.id}')">
            <div class="snap-avatar-wrap">
              <img src="${snap.senderAvatar}" alt="${snap.senderName}" />
              <div class="snap-status-icon ${snap.isOpened ? 'opened' : 'unopened'}">
                ${snap.isOpened ? '<i class="ph ph-square"></i>' : '<i class="ph-fill ph-square"></i>'}
              </div>
            </div>
            <div class="snap-details">
              <div class="snap-sender-row">
                <strong class="snap-sender-name">${snap.senderName}</strong>
                <span class="snap-timestamp">${snap.timestamp}</span>
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
    const snap = window.omniStore.getSnaps().find(s => s.id === snapId);
    if (!snap) return;

    if (snap.isOpened) {
      window.app.showToast(`Snap from ${snap.senderName} has already expired & self-destructed! ⏳`);
      window.app.playSound('pop');
      return;
    }

    this.activeSnap = snap;
    this.remainingSeconds = snap.duration || 5;

    document.getElementById("snap-media-image").src = snap.mediaUrl;
    document.getElementById("snap-sender-info").innerText = `Snap from ${snap.senderName}`;
    document.getElementById("snap-caption-text").innerText = snap.caption || '';
    document.getElementById("snap-timer-counter").innerText = this.remainingSeconds;

    this.viewer.classList.add("active");
    window.app.playSound('ding');

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

  burnAndCloseSnap() {
    const viewer = this.viewer;
    viewer.classList.add("burning");
    window.app.playSound('whoosh');

    setTimeout(() => {
      viewer.classList.remove("active");
      viewer.classList.remove("burning");
      if (this.activeSnap) {
        window.omniStore.markSnapOpened(this.activeSnap.id);
        this.renderSnaps();
        window.app.showToast('🔥 Snap burned & deleted permanently!');
        this.activeSnap = null;
      }
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
