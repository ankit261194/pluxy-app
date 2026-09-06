// Pluxy Super-App: Real-Time Multi-Device Sync Engine (Ultra-Fast)
class SyncEngine {
  constructor() {
    this.currentVersion = 0;
    this.pollIntervalMs = 2000; // Fast 2-second heartbeat
    this.pollTimer = null;
    this.isSyncing = false;
    this.isOnline = true;
    this.lastSuccessfulSync = Date.now();
    this.seenAnnouncements = new Set();
    this.activeAlert = null;
  }

  init() {
    // Initial sync immediately
    this.pollSync();

    // Start recurring polling
    this.startPolling();

    // Hook window focus and online events for immediate instant sync
    window.addEventListener("focus", () => this.pollSync(true));
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.updateSyncBadge("Live", true);
      this.pollSync(true);
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.updateSyncBadge("Offline", false);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.pollSync(true);
      }
    });

    console.log("[SyncEngine] Ultra-fast multi-device real-time sync engine initialized ⚡");
  }

  startPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      // Only poll if document is visible to save mobile battery
      if (document.visibilityState === "visible") {
        this.pollSync();
      }
    }, this.pollIntervalMs);
  }

  async pollSync(force = false) {
    if (this.isSyncing && !force) return;
    this.isSyncing = true;

    try {
      const activeUser = window.authModule ? window.authModule.currentUser : null;
      const userId = activeUser ? activeUser.id : "";
      const isAdmin = window.authModule ? window.authModule.isAdmin() : false;

      const url = `/api/sync?v=${this.currentVersion}&user_id=${encodeURIComponent(userId)}&is_admin=${isAdmin}&t=${Date.now()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Sync HTTP ${resp.status}`);
      }

      const data = await resp.json();
      this.isOnline = true;
      this.lastSuccessfulSync = Date.now();

      // Case 1: Unchanged (< 1ms delta response)
      if (data.changed === false) {
        this.currentVersion = data.version || this.currentVersion;
        this.updateSyncBadge("Live", true);
        this.isSyncing = false;
        return;
      }

      // Case 2: New version delta received
      console.log(`[SyncEngine] Received delta package v${data.version}`, data);
      this.currentVersion = data.version;
      this.applyDeltaPackage(data, activeUser);
      this.updateSyncBadge("Synced", true);
    } catch (err) {
      if (err.name !== "AbortError") {
        // Network or server unreachable
        this.updateSyncBadge("Offline", false);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  applyDeltaPackage(data, activeUser) {
    let shouldSaveStore = false;

    // 1. Apply App Branding & Config
    if (data.appConfig && window.omniStore) {
      const currentConfig = window.omniStore.getAppConfig();
      window.omniStore.data.appConfig = { ...currentConfig, ...data.appConfig };
      shouldSaveStore = true;

      if (window.adminModule) {
        window.adminModule.applyAppBranding();
      }
    }

    // 2. Apply System Feature Flags
    if (data.featureFlags && window.omniStore) {
      if (!window.omniStore.data.appConfig) window.omniStore.data.appConfig = {};
      window.omniStore.data.appConfig.featureFlags = { ...data.featureFlags };
      shouldSaveStore = true;
    }

    // 3. Apply Dynamic Custom Services (Live registration of micro-services)
    if (Array.isArray(data.customServices) && window.omniStore) {
      window.omniStore.data.appConfig.customServices = data.customServices;
      shouldSaveStore = true;

      if (window.adminModule) {
        window.adminModule.renderDynamicServicesInApp();
      }
    }

    // 4. Apply Announcements from Admin
    if (Array.isArray(data.announcements) && data.announcements.length > 0 && window.omniStore) {
      data.announcements.forEach(announcement => {
        if (!this.seenAnnouncements.has(announcement.id)) {
          this.seenAnnouncements.add(announcement.id);
          const exists = window.omniStore.data.posts.some(p => p.id === announcement.id);
          if (!exists) {
            window.omniStore.data.posts.unshift(announcement);
            shouldSaveStore = true;
            if (window.feedModule) window.feedModule.renderPosts();
            if (window.app && typeof window.app.showToast === "function") {
              window.app.showToast("📢 Official Notice from Founder Ankit Chaudhary!");
            }
          }
        }
      });
    }

    // 5. Apply Targeted Individual User Overrides (Blue tick, followers, bio, status)
    if (data.userOverride && activeUser && (data.userOverride.userId === activeUser.id || data.userOverride.userId === activeUser.username)) {
      this.applyUserOverride(data.userOverride, activeUser);
    }

    // 6. Apply Targeted Personal Alert from Admin (Direct Popup)
    if (data.userAlert && activeUser && (data.userAlert.userId === activeUser.id || data.userAlert.userId === activeUser.username)) {
      this.showTargetedAlert(data.userAlert);
    }

    // 7. Store all user overrides if Admin (for user management inspection)
    if (data.allUserOverrides) {
      this.allUserOverrides = data.allUserOverrides;
    }

    // 8. Apply Sponsored Ads delta
    if (Array.isArray(data.sponsoredAds) && window.omniStore) {
      window.omniStore.data.sponsoredAds = data.sponsoredAds;
      shouldSaveStore = true;
      if (window.feedModule) window.feedModule.renderPosts();
      if (window.reelsModule) window.reelsModule.renderReels();
    }

    // 9. Apply Creator Fund settings delta
    if (data.creatorFund && window.omniStore) {
      if (!window.omniStore.data.creatorFund) window.omniStore.data.creatorFund = {};
      window.omniStore.data.creatorFund = { ...window.omniStore.data.creatorFund, ...data.creatorFund };
      shouldSaveStore = true;
    }

    if (shouldSaveStore) {
      window.omniStore.save();
    }
  }

  applyUserOverride(override, activeUser) {
    console.log("[SyncEngine] Applying individual user override live:", override);
    let updated = false;

    // Update verified status
    if (override.isVerified !== undefined && activeUser.verified !== override.isVerified) {
      activeUser.verified = override.isVerified;
      updated = true;
    }

    // Update follower count
    if (override.followers !== undefined && activeUser.followers !== override.followers) {
      activeUser.followers = Number(override.followers);
      updated = true;
    }

    // Update display name
    if (override.displayName && activeUser.displayName !== override.displayName) {
      activeUser.displayName = override.displayName;
      updated = true;
    }

    // Update bio
    if (override.bio && activeUser.bio !== override.bio) {
      activeUser.bio = override.bio;
      updated = true;
    }

    // Update custom status / role title
    if (override.customStatus) {
      activeUser.customStatus = override.customStatus;
      activeUser.roleTitle = override.customStatus;
      updated = true;
    }

    if (updated) {
      // Save in users db and active session
      if (window.authModule) {
        const users = window.authModule.getUsers();
        const idx = users.findIndex(u => u.id === activeUser.id || u.username === activeUser.username);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...activeUser };
          window.authModule.saveUsers(users);
        }
        window.authModule.setActiveUser(activeUser);
      }

      // Re-render UI components live
      if (window.profileModule) window.profileModule.renderProfile();
      if (window.feedModule) window.feedModule.renderPosts();

      if (window.app) {
        window.app.showToast("✨ Your profile & badges were updated by Admin!");
        window.app.playSound('ding');
      }
    }
  }

  showTargetedAlert(alertData) {
    this.activeAlert = alertData;
    const modal = document.getElementById("targeted-alert-modal");
    const msgEl = document.getElementById("targeted-alert-message");
    const titleEl = document.getElementById("targeted-alert-title");

    if (titleEl) {
      titleEl.innerText = alertData.title || "Official Notice from Founder";
    }
    if (msgEl) {
      msgEl.innerHTML = `
        <div class="targeted-alert-content-inner">
          <p class="alert-message-text">${alertData.message}</p>
          ${alertData.badge ? `<div class="alert-awarded-badge">🏅 Awarded: <strong>${alertData.badge}</strong></div>` : ''}
          <div class="alert-timestamp">Sent: ${new Date(alertData.timestamp || Date.now()).toLocaleTimeString()}</div>
        </div>
      `;
    }

    if (modal) {
      modal.classList.add("active");
      if (window.app) window.app.playSound('ding');
    }
  }

  dismissTargetedAlert() {
    const modal = document.getElementById("targeted-alert-modal");
    if (modal) {
      modal.classList.remove("active");
    }
    this.activeAlert = null;
    if (window.app) window.app.playSound('pop');
  }

  // Admin Push: Optimistic Local Update + Asynchronous Background Push to Server
  async pushAdminUpdate(type, payload) {
    this.updateSyncBadge("Syncing...", true);

    try {
      const resp = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload })
      });

      if (!resp.ok) {
        throw new Error(`Push HTTP ${resp.status}`);
      }

      const res = await resp.json();
      if (res && res.version) {
        this.currentVersion = res.version;
      }
      this.updateSyncBadge("Live", true);
      return res;
    } catch (err) {
      console.warn("[SyncEngine] Push error:", err);
      this.updateSyncBadge("Offline", false);
      return null;
    }
  }

  updateSyncBadge(text, isLive) {
    const tag = document.getElementById("sync-status-tag");
    if (!tag) return;

    const textEl = tag.querySelector(".sync-status-text");
    const dot = tag.querySelector(".pulse-dot-green");

    if (textEl) textEl.innerText = text;
    if (dot) {
      if (isLive) {
        dot.style.background = "#22C55E";
        dot.style.boxShadow = "0 0 8px #22C55E";
      } else {
        dot.style.background = "#EF4444";
        dot.style.boxShadow = "0 0 8px #EF4444";
      }
    }
  }
}

// Instantiate global sync engine
window.syncEngine = new SyncEngine();
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.syncEngine.init());
  } else {
    window.syncEngine.init();
  }
}
