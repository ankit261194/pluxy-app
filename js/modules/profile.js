// User Profile & Lifetime AI Settings Module
class ProfileModule {
  constructor() {
    this.container = document.getElementById("profile-content-container");
    this.activeTab = "grid";
  }

  init() {
    this.renderProfile();
    this.setupSettingsModal();
  }

  renderProfile() {
    const user = window.omniStore.getCurrentUser();
    const posts = window.omniStore.getPosts();
    const config = window.omniStore.getAppConfig();
    const isAdmin = window.authModule ? window.authModule.isAdmin() : (user.role === 'admin');
    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Cover & Avatar Banner -->
      <div class="profile-banner-wrap">
        <div class="profile-cover-img"></div>
        <div class="profile-avatar-row">
          <div class="profile-avatar-large">
            <img src="${user.avatar}" alt="${user.displayName}" />
            <span class="online-dot-lg"></span>
          </div>
          <div class="profile-quick-actions">
            <button class="btn-profile-action admin-action-btn" onclick="window.adminModule.openAdminPortal()" title="Open Admin Control Center">
              <i class="ph-bold ph-shield-check"></i> ${isAdmin ? 'Admin Portal' : 'Admin Login'}
            </button>
            <button class="btn-profile-action" onclick="window.profileModule.openSettings()" title="Settings">
              <i class="ph-bold ph-gear"></i> Settings
            </button>
            <button class="btn-profile-action auth-action" onclick="window.authModule.openAuth('login')" title="Switch / Login Account">
              <i class="ph-bold ph-user-switch"></i> Switch
            </button>
            <button class="btn-profile-action logout-action" onclick="window.authModule.logout()" title="Logout / Switch User">
              <i class="ph-bold ph-sign-out"></i> Logout
            </button>
          </div>
        </div>

        <!-- Name & Bio -->
        <div class="profile-bio-box">
          <h2 class="profile-display-name">${user.displayName} ${user.verified ? '<span class="verified-icon" title="Verified Creator">✓</span>' : ''}</h2>
          <div class="profile-handle">@${user.username}</div>
          <p class="profile-bio-text">${user.bio}</p>
          <div class="profile-badges-row">
            <span class="badge-pill streak-pill">🔥 ${user.streakCount || 0} Days Streak</span>
            <span class="badge-pill ai-pill">🤖 Gemini Flash Enabled</span>
            ${user.verified ? '<span class="badge-pill" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8; font-weight: 800;">✓ Verified</span>' : ''}
            ${user.customStatus ? `<span class="badge-pill omni-pill">${user.customStatus}</span>` : ''}
            ${isAdmin ? '<span class="badge-pill admin-pill">👑 Admin / Founder</span>' : '<span class="badge-pill member-pill">👤 Member</span>'}
          </div>
        </div>

        <!-- Admin Master Card (Always Accessible with Master PIN 910010025123343) -->
        <div class="admin-master-card" onclick="window.adminModule.openAdminPortal()" style="cursor: pointer;">
          <div class="admin-master-content">
            <div class="admin-master-left">
              <div class="admin-shield-icon">🛡️</div>
              <div>
                <strong>${isAdmin ? '👑 Admin Control Center (Active)' : '🔒 Admin Control Center (Enter PIN)'}</strong>
                <span>${isAdmin ? 'App settings, dynamic services, user management & audit trail' : 'Enter Master PIN (910010025123343) to customize and manage Pluxy'}</span>
              </div>
            </div>
            <button class="btn-admin-launch-pill"><i class="ph-bold ph-arrow-right"></i> ${isAdmin ? 'Open' : 'Unlock'}</button>
          </div>
        </div>

        <!-- Developer & Founder Showcase Card -->
        <div class="developer-founder-card">
          <div class="dev-card-top">
            <div class="dev-badge-title">
              <i class="ph-fill ph-crown"></i> ${config.appName} Founder & Lead Developer
            </div>
            <span class="official-pill">Official Creator</span>
          </div>
          <div class="dev-details-body">
            <div class="dev-name-title">${config.founderName}</div>
            <div class="dev-phone-row">
              <i class="ph-bold ph-phone-call"></i> Contact: <strong>+91 ${config.founderPhone}</strong>
            </div>
            <p class="dev-card-desc">
              ${config.tagline} uniting WhatsApp (Chat, Voice & Video Calls), Instagram (Feed, Reels & Stories), Facebook (Reactions & Profile), and Snapchat (Lenses, AR Filters & Snaps) with Lifetime Google Gemini AI.
            </p>
            <div class="dev-contact-actions">
              <a href="https://wa.me/91${config.founderPhone}?text=Hello%20Ankit%2C%20I%20am%20using%20${config.appName}!" target="_blank" class="btn-dev-action whatsapp">
                <i class="ph-fill ph-whatsapp-logo"></i> WhatsApp ${config.founderName.split(' ')[0]}
              </a>
              <a href="tel:${config.founderPhone}" class="btn-dev-action call">
                <i class="ph-fill ph-phone"></i> Call ${config.founderPhone}
              </a>
            </div>
          </div>
        </div>

        <!-- Social Metrics (Insta + Facebook) -->
        <div class="profile-stats-card">
          <div class="stat-cell">
            <strong>${user.postsCount}</strong>
            <span>Posts</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-cell">
            <strong>${user.followers.toLocaleString()}</strong>
            <span>Followers</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-cell">
            <strong>${user.following}</strong>
            <span>Following</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-cell">
            <strong class="fire-text">🔥 ${user.streakCount}</strong>
            <span>Streaks</span>
          </div>
        </div>

        <!-- Sub Tabs -->
        <div class="profile-subtabs">
          <button class="subtab-btn ${this.activeTab === 'grid' ? 'active' : ''}" onclick="window.profileModule.setTab('grid')">
            <i class="ph-bold ph-grid-four"></i> Grid
          </button>
          <button class="subtab-btn ${this.activeTab === 'streaks' ? 'active' : ''}" onclick="window.profileModule.setTab('streaks')">
            <i class="ph-bold ph-fire"></i> Streaks
          </button>
          <button class="subtab-btn ${this.activeTab === 'about' ? 'active' : ''}" onclick="window.profileModule.setTab('about')">
            <i class="ph-bold ph-user-circle"></i> About
          </button>
        </div>

        <!-- Grid Content -->
        <div class="profile-subtab-content">
          ${this.renderSubTabContent(posts, user)}
        </div>
      </div>
    `;
  }

  renderSubTabContent(posts, user) {
    if (this.activeTab === 'grid') {
      return `
        <div class="profile-media-grid">
          ${posts.map(p => `
            <div class="grid-item" onclick="window.feedModule.openComments('${p.id}')">
              <img src="${p.image}" alt="Post" loading="lazy" />
              <div class="grid-hover-overlay">
                <span><i class="ph-fill ph-heart"></i> ${p.likes}</span>
                <span><i class="ph-fill ph-chat-circle"></i> ${p.comments.length}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'streaks') {
      return `
        <div class="streaks-dashboard-card">
          <div class="streak-trophy-header">
            <div class="big-flame">🔥</div>
            <h3>Super Streaks Status</h3>
            <p>Active streaks across all your friends</p>
          </div>
          <div class="streak-friend-list">
            <div class="streak-friend-row">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
              <div class="streak-friend-info">
                <strong>Priya Sharma</strong>
                <span>Last snap 19m ago</span>
              </div>
              <div class="streak-score-pill">🔥 14 Days</div>
            </div>
            <div class="streak-friend-row">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
              <div class="streak-friend-info">
                <strong>Ananya Roy</strong>
                <span>Last snap 3h ago</span>
              </div>
              <div class="streak-score-pill">🔥 21 Days</div>
            </div>
            <div class="streak-friend-row">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
              <div class="streak-friend-info">
                <strong>Sameer Khan</strong>
                <span>Last snap 5h ago</span>
              </div>
              <div class="streak-score-pill">🔥 9 Days</div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="about-facebook-card">
          <h4>About Ankit Chaudhary</h4>
          <div class="info-row"><i class="ph-bold ph-crown" style="color: #FFD700;"></i> <span>Founder & Lead Developer of Pluxy 🚀</span></div>
          <div class="info-row"><i class="ph-bold ph-phone" style="color: #25D366;"></i> <span>Contact No: +91 8533955333 (8533955333)</span></div>
          <div class="info-row"><i class="ph-bold ph-whatsapp-logo" style="color: #25D366;"></i> <span>Direct WhatsApp: +91 8533955333</span></div>
          <div class="info-row"><i class="ph-bold ph-briefcase"></i> <span>Full-stack Architect & AI Engineer</span></div>
          <div class="info-row"><i class="ph-bold ph-sparkle" style="color: #8A2BE2;"></i> <span>Lifetime AI Co-pilot: Gemini 1.5 / 2.0 Flash</span></div>
          <div class="info-row"><i class="ph-bold ph-map-pin"></i> <span>Lives in India</span></div>
        </div>
      `;
    }
  }

  setTab(tab) {
    this.activeTab = tab;
    this.renderProfile();
  }

  openSettings() {
    const modal = document.getElementById("settings-modal");
    const keyInput = document.getElementById("settings-gemini-key");
    const modelSelect = document.getElementById("settings-gemini-model");
    const statusText = document.getElementById("settings-ai-status");

    if (keyInput) keyInput.value = window.geminiService.getApiKey();
    if (modelSelect) modelSelect.value = window.geminiService.selectedModel;

    if (statusText) {
      if (window.geminiService.hasApiKey()) {
        statusText.innerHTML = '<span class="status-badge connected">🟢 Live Gemini API Connected (Lifetime)</span>';
      } else {
        statusText.innerHTML = '<span class="status-badge smart">🟡 Smart Intelligent Mode (Add API key for live calls)</span>';
      }
    }

    modal.classList.add("active");
  }

  setupSettingsModal() {
    const closeBtn = document.getElementById("btn-close-settings");
    if (closeBtn) {
      closeBtn.onclick = () => {
        document.getElementById("settings-modal").classList.remove("active");
      };
    }

    const saveBtn = document.getElementById("btn-save-settings");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const key = document.getElementById("settings-gemini-key").value;
        const model = document.getElementById("settings-gemini-model").value;

        window.geminiService.setApiKey(key);
        window.geminiService.setModel(model);

        document.getElementById("settings-modal").classList.remove("active");
        window.app.showToast("Settings & Lifetime AI Key saved! 🚀");
        window.app.playSound('ding');
        this.renderProfile();
      };
    }
  }
}

window.profileModule = new ProfileModule();
