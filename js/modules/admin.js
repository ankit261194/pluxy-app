// Pluxy Admin Module: Dynamic Services, Live App Customization & RBAC Control Center
class AdminModule {
  constructor() {
    this.modal = document.getElementById("admin-portal-modal");
    this.pinModal = document.getElementById("admin-pin-modal");
    this.activeTab = "branding"; // 'branding' | 'services' | 'users' | 'content' | 'security'
    this.isUnlocked = false;
    this.enteredPin = "";
  }

  init() {
    this.renderDynamicServicesInApp();
    this.applyAppBranding();
    this.updateAdminHeaderBadge();
  }

  updateAdminHeaderBadge() {
    const adminBtn = document.getElementById("header-admin-btn");
    if (!adminBtn) return;
    adminBtn.style.display = "inline-flex";
  }

  applyAppBranding() {
    const config = window.omniStore ? window.omniStore.getAppConfig() : null;
    if (!config) return;

    // Update document title
    document.title = `${config.appName} - ${config.tagline}`;

    // Update header brand title if on feed
    const headerTitle = document.getElementById("header-app-title");
    if (headerTitle && (!window.app || window.app.currentTab === "feed")) {
      const logo = '<img src="assets/pluxy-icon.png" class="pluxy-header-logo" alt="Pluxy" />';
      headerTitle.innerHTML = `${logo} ${config.appName} <span class="header-tag">Feed</span>`;
    }

    // Update founder details across UI
    const devNames = document.querySelectorAll(".dev-name-title");
    devNames.forEach(el => el.innerText = config.founderName);

    const devPhones = document.querySelectorAll(".dev-phone-row strong");
    devPhones.forEach(el => el.innerText = `+91 ${config.founderPhone}`);
  }

  openAdminPortal() {
    if (window.authModule && window.authModule.currentUser && window.authModule.currentUser.role === 'admin') {
      this.isUnlocked = true;
      this.showPortal();
      return;
    }

    if (!this.isUnlocked) {
      this.openPinPrompt();
    } else {
      this.showPortal();
    }
  }

  openPinPrompt() {
    this.enteredPin = "";
    const pinInput = document.getElementById("admin-pin-text-input");
    if (pinInput) pinInput.value = "";
    const pinDisplay = document.getElementById("pin-display-dots");
    if (pinDisplay) pinDisplay.innerText = "Enter Admin Security Code";
    const errorText = document.getElementById("pin-error-msg");
    if (errorText) errorText.innerText = "";
    if (this.pinModal) this.pinModal.classList.add("active");
  }

  closePinPrompt() {
    if (this.pinModal) this.pinModal.classList.remove("active");
    this.enteredPin = "";
  }

  handlePinInput(digit) {
    if (this.enteredPin.length < 25) {
      this.enteredPin += digit;
      this.updatePinDots();
      if (window.app && typeof window.app.playSound === "function") window.app.playSound('pop');
    }
  }

  handlePinBackspace() {
    if (this.enteredPin.length > 0) {
      this.enteredPin = this.enteredPin.slice(0, -1);
      this.updatePinDots();
      if (window.app && typeof window.app.playSound === "function") window.app.playSound('pop');
    }
  }

  updatePinDots() {
    const pinDisplay = document.getElementById("pin-display-dots");
    const pinInput = document.getElementById("admin-pin-text-input");
    if (pinInput) pinInput.value = this.enteredPin;
    if (pinDisplay) {
      if (this.enteredPin.length === 0) {
        pinDisplay.innerText = "Enter Admin Security Code";
      } else {
        pinDisplay.innerText = "●".repeat(this.enteredPin.length);
      }
    }
  }

  async submitPin() {
    const pinInput = document.getElementById("admin-pin-text-input");
    const code = (pinInput && pinInput.value ? pinInput.value : this.enteredPin).trim();
    const errorMsg = document.getElementById("pin-error-msg");
    
    if (!code) {
      if (errorMsg) errorMsg.innerText = "Please enter the Admin Security Code.";
      return;
    }

    let verified = false;

    // Check with genuine backend API first
    if (window.apiClient) {
      try {
        const res = await window.apiClient.post('/admin/verify-pin', { pin: code });
        if (res && res.verified) {
          verified = true;
        }
      } catch (err) {
        // Backend returned non-200 (invalid code)
      }
    }

    // Fallback check if offline
    if (!verified && window.authModule && typeof window.authModule.verifyAdminPin === "function") {
      verified = window.authModule.verifyAdminPin(code);
    }

    if (verified) {
      this.isUnlocked = true;
      this.closePinPrompt();
      
      if (window.omniStore && typeof window.omniStore.logAuditEvent === "function") {
        window.omniStore.logAuditEvent("ADMIN_UNLOCK", "Admin Control Center unlocked securely");
      }
      window.app.showToast("👑 Admin Access Granted!");
      if (window.app && typeof window.app.playSound === "function") window.app.playSound('ding');
      this.showPortal();
    } else {
      if (errorMsg) errorMsg.innerText = "Incorrect Admin Security Code. Access denied.";
      if (window.omniStore && typeof window.omniStore.logAuditEvent === "function") {
        window.omniStore.logAuditEvent("SECURITY_WARNING", "Failed Admin access attempt.");
      }
      if (window.app && typeof window.app.playSound === "function") window.app.playSound('pop');
      this.enteredPin = "";
      this.updatePinDots();
    }
  }

  showPortal() {
    if (this.modal) {
      this.renderAdminPortal();
      this.modal.classList.add("active");
    }
  }

  closeAdminPortal() {
    if (this.modal) this.modal.classList.remove("active");
  }

  lockAdminSession() {
    this.isUnlocked = false;
    this.closeAdminPortal();
    window.omniStore.logAuditEvent("ADMIN_LOCKED", "Admin session locked");
    window.app.showToast("🔒 Admin Session Locked");
    window.app.playSound('pop');
  }

  switchAdminTab(tab) {
    this.activeTab = tab;
    this.renderAdminPortal();
    window.app.playSound('pop');
  }

  renderAdminPortal() {
    const container = document.getElementById("admin-portal-content");
    if (!container) return;

    const config = window.omniStore.getAppConfig();
    const users = window.authModule.getUsers();
    const posts = window.omniStore.getPosts();
    const reels = window.omniStore.getReels();
    const customServices = window.omniStore.getCustomServices();
    const sponsoredAds = window.omniStore.getSponsoredAds ? window.omniStore.getSponsoredAds() : [];
    const auditLogs = config.auditLogs || [];

    container.innerHTML = `
      <div class="admin-portal-shell">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
          <div class="admin-brand-header">
            <img src="assets/pluxy-icon.png" class="admin-logo-sm" alt="Pluxy" />
            <div>
              <div class="admin-brand-name">${config.appName} Admin</div>
              <div class="admin-brand-sub">Master Control Center</div>
            </div>
          </div>

          <div class="admin-user-pill">
            <img src="${window.authModule.currentUser ? window.authModule.currentUser.avatar : ''}" alt="Admin" />
            <div>
              <strong>${config.founderName}</strong>
              <span class="role-badge">Founder & Admin</span>
            </div>
          </div>

          <nav class="admin-nav-menu">
            <button class="admin-nav-item ${this.activeTab === 'branding' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('branding')">
              <i class="ph-bold ph-sliders"></i>
              <span>App Identity & Branding</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'services' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('services')">
              <i class="ph-bold ph-plus-circle"></i>
              <span>Services & Dynamic Features</span>
              <span class="admin-badge-count">${customServices.length}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'ads' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('ads')">
              <i class="ph-bold ph-megaphone"></i>
              <span>Sponsored Ads ("Ads Lagana")</span>
              <span class="admin-badge-count">${sponsoredAds.length}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'creator_fund' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('creator_fund')">
              <i class="ph-bold ph-currency-inr"></i>
              <span>Reels Creator Rewards & Fund</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'users' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('users')">
              <i class="ph-bold ph-users-three"></i>
              <span>User Management</span>
              <span class="admin-badge-count">${users.length}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'content' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('content')">
              <i class="ph-bold ph-newspaper"></i>
              <span>Content & Broadcast</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'security' ? 'active' : ''}" onclick="window.adminModule.switchAdminTab('security')">
              <i class="ph-bold ph-shield-check"></i>
              <span>Security & Audit Logs</span>
            </button>
          </nav>

          <div class="admin-sidebar-footer">
            <button class="btn-admin-lock" onclick="window.adminModule.lockAdminSession()">
              <i class="ph-bold ph-lock-key"></i> Lock Session
            </button>
            <button class="btn-admin-exit" onclick="window.adminModule.closeAdminPortal()">
              <i class="ph-bold ph-x"></i> Close Portal
            </button>
          </div>
        </aside>

        <!-- Main Body Panel -->
        <main class="admin-main-panel">
          <div class="admin-panel-topbar">
            <div class="topbar-title-wrap">
              <h2 class="admin-tab-title">${this.getTabTitle()}</h2>
              <p class="admin-tab-desc">${this.getTabDescription()}</p>
            </div>
            <div class="topbar-actions">
              <span class="live-status-pill"><span class="pulse-dot"></span> System Live & Secure</span>
              <button class="icon-btn-close-portal" onclick="window.adminModule.closeAdminPortal()">
                <i class="ph-bold ph-x"></i>
              </button>
            </div>
          </div>

          <div class="admin-tab-content-body">
            ${this.renderActiveTabContent(config, users, posts, reels, customServices, auditLogs, sponsoredAds)}
          </div>
        </main>
      </div>
    `;
  }

  getTabTitle() {
    switch (this.activeTab) {
      case 'branding': return 'App Identity & Founder Branding';
      case 'services': return 'Dynamic Services & Feature Manager';
      case 'ads': return 'Sponsored Ads Manager ("Ads Lagana")';
      case 'creator_fund': return 'Reels Creator Fund & Cash Rewards ("Reels Ke Paise")';
      case 'users': return 'User Accounts & Roles';
      case 'content': return 'Content Moderation & Announcement Broadcast';
      case 'security': return 'Security Controls & Audit Trail';
      default: return 'Admin Panel';
    }
  }

  getTabDescription() {
    switch (this.activeTab) {
      case 'branding': return 'Customize app name, tagline, founder details, phone number, and theme live.';
      case 'services': return 'Add brand new micro-services and manage existing features in real-time.';
      case 'ads': return 'Create and run sponsored advertising campaigns that display natively across user Feeds and Reels.';
      case 'creator_fund': return 'Manage Reels monetized views, RPM payouts, and reward bonus cash directly to creators.';
      case 'users': return 'Promote users to Admin, demote, reset passwords, or customize individual apps.';
      case 'content': return 'Broadcast official announcements to all users and moderate posts/reels.';
      case 'security': return 'Manage Admin Master Code, session security, and review tamper-proof audit logs.';
      default: return '';
    }
  }

  renderActiveTabContent(config, users, posts, reels, customServices, auditLogs) {
    if (this.activeTab === 'branding') {
      return `
        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-paint-brush"></i> App Identity & Founder Details</h3>
          <form class="admin-form-grid" onsubmit="window.adminModule.saveBranding(event)">
            <div class="form-group-admin">
              <label>App Name</label>
              <input type="text" id="cfg-app-name" class="admin-input" value="${config.appName}" required />
            </div>
            <div class="form-group-admin">
              <label>App Tagline</label>
              <input type="text" id="cfg-tagline" class="admin-input" value="${config.tagline}" required />
            </div>
            <div class="form-group-admin">
              <label>Founder & Lead Developer Name</label>
              <input type="text" id="cfg-founder-name" class="admin-input" value="${config.founderName}" required />
            </div>
            <div class="form-group-admin">
              <label>Founder Contact Number</label>
              <input type="tel" id="cfg-founder-phone" class="admin-input" value="${config.founderPhone}" required />
            </div>
            <div class="form-group-admin">
              <label>Official Support Email</label>
              <input type="email" id="cfg-founder-email" class="admin-input" value="${config.founderEmail}" required />
            </div>
            <div class="form-group-admin">
              <label>Primary Theme Accent Color</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="cfg-theme-color" class="admin-color-picker" value="${config.themeAccent || '#38BDF8'}" />
                <span class="color-hex-tag">${config.themeAccent || '#38BDF8'}</span>
              </div>
            </div>
            
            <div class="form-group-admin full-width">
              <button type="submit" class="btn-admin-primary">
                <i class="ph-bold ph-floppy-disk"></i> Save & Apply Changes Live 🚀
              </button>
            </div>
          </form>
        </div>

        <div class="admin-stats-row">
          <div class="admin-stat-box">
            <div class="stat-num">${users.length}</div>
            <div class="stat-lbl">Registered Users</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">${posts.length}</div>
            <div class="stat-lbl">Feed Posts</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">${reels.length}</div>
            <div class="stat-lbl">Published Reels</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">${customServices.length}</div>
            <div class="stat-lbl">Custom Services</div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'services') {
      const flags = config.featureFlags || {};
      return `
        <!-- Built-in Feature Toggles -->
        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-toggle-left"></i> System Feature Flags (Enable / Disable)</h3>
          <div class="feature-toggles-grid">
            <div class="toggle-card">
              <div class="toggle-info">
                <strong>📸 Instagram + Facebook Feed</strong>
                <span>Stories, posts, comments & reactions</span>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" ${flags.feed !== false ? 'checked' : ''} onchange="window.adminModule.toggleFeature('feed', this.checked)" />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="toggle-card">
              <div class="toggle-info">
                <strong>🎬 Instagram Reels & Shorts</strong>
                <span>Vertical video player & Reels studio</span>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" ${flags.reels !== false ? 'checked' : ''} onchange="window.adminModule.toggleFeature('reels', this.checked)" />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="toggle-card">
              <div class="toggle-info">
                <strong>📸 Snapchat AR Camera</strong>
                <span>Face filters, Puppy dog, Crown & cyber lenses</span>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" ${flags.camera !== false ? 'checked' : ''} onchange="window.adminModule.toggleFeature('camera', this.checked)" />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="toggle-card">
              <div class="toggle-info">
                <strong>💬 WhatsApp Chats & Calling</strong>
                <span>One-on-one chats, voice notes & calls</span>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" ${flags.chats !== false ? 'checked' : ''} onchange="window.adminModule.toggleFeature('chats', this.checked)" />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="toggle-card">
              <div class="toggle-info">
                <strong>🤖 Lifetime Google Gemini AI</strong>
                <span>AI Chat Assistant & multimodal vision analyzer</span>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" ${flags.ai !== false ? 'checked' : ''} onchange="window.adminModule.toggleFeature('ai', this.checked)" />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="toggle-card">
              <div class="toggle-info">
                <strong>🗺️ Snapchat Snap Map</strong>
                <span>Live interactive friend discovery map</span>
              </div>
              <label class="switch-toggle">
                <input type="checkbox" ${flags.snapmap !== false ? 'checked' : ''} onchange="window.adminModule.toggleFeature('snapmap', this.checked)" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Dynamic Service Builder -->
        <div class="admin-card">
          <div class="admin-card-header-between">
            <h3><i class="ph-bold ph-plus-circle"></i> Dynamic Services ("Nayi Service Jodna")</h3>
            <button class="btn-admin-add" onclick="window.adminModule.openAddServiceModal()">
              <i class="ph-bold ph-plus"></i> + Add New Service to Pluxy
            </button>
          </div>
          <p class="admin-hint-text">Add custom tools, music streams, payment portals, or mini apps that dynamically register in the user interface!</p>

          <div class="custom-services-list">
            ${customServices.length === 0 ? '<div class="empty-state-text">No custom services added yet. Click "+ Add New Service to Pluxy" above!</div>' : ''}
            ${customServices.map(srv => `
              <div class="custom-service-row">
                <div class="srv-icon-badge">${srv.icon}</div>
                <div class="srv-info">
                  <div class="srv-title-line">
                    <strong>${srv.name}</strong>
                    <span class="srv-badge">${srv.badge || 'CUSTOM'}</span>
                    <span class="srv-pos-tag">${srv.targetPosition || 'both'}</span>
                  </div>
                  <p class="srv-desc">${srv.description}</p>
                </div>
                <div class="srv-actions">
                  <label class="switch-toggle">
                    <input type="checkbox" ${srv.active ? 'checked' : ''} onchange="window.adminModule.toggleService('${srv.id}')" />
                    <span class="slider round"></span>
                  </label>
                  <button class="btn-delete-icon" onclick="window.adminModule.deleteService('${srv.id}')" title="Delete Service">
                    <i class="ph-bold ph-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'ads') {
      const ads = window.omniStore.getSponsoredAds ? window.omniStore.getSponsoredAds() : [];
      const totalImpressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

      return `
        <!-- Ads Performance Metrics Banner -->
        <div class="admin-stats-row">
          <div class="admin-stat-box">
            <div class="stat-num">${ads.length}</div>
            <div class="stat-lbl">Active Campaigns</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">${totalImpressions.toLocaleString()}</div>
            <div class="stat-lbl">Total Ad Views</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">${totalClicks.toLocaleString()}</div>
            <div class="stat-lbl">Total Clicks</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">${avgCtr}%</div>
            <div class="stat-lbl">Average CTR</div>
          </div>
        </div>

        <!-- Sponsored Ads Campaigns Manager -->
        <div class="admin-card">
          <div class="admin-card-header-between">
            <div>
              <h3><i class="ph-bold ph-megaphone"></i> Sponsored Ads Manager ("Ads Lagana")</h3>
              <p class="admin-hint-text">Create sponsored advertising campaigns that seamlessly integrate into the Feed and Reels of every Pluxy user!</p>
            </div>
            <button class="btn-admin-add" onclick="window.adminModule.openCreateAdModal()">
              <i class="ph-bold ph-plus"></i> + Create Sponsored Ad
            </button>
          </div>

          <div class="sponsored-ads-admin-list">
            ${ads.length === 0 ? '<div class="empty-state-text">No sponsored ads yet. Click "+ Create Sponsored Ad" above to launch an ad campaign!</div>' : ''}
            ${ads.map(ad => `
              <div class="admin-ad-card-row">
                <img src="${ad.mediaUrl}" class="admin-ad-thumb" alt="${ad.brand}" />
                <div class="admin-ad-details">
                  <div class="ad-title-bar">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${ad.logo}" class="ad-brand-mini-logo" alt="logo" />
                      <strong>${ad.brand}</strong>
                      <span class="ad-placement-tag">${ad.placement.toUpperCase()}</span>
                    </div>
                    <span class="ad-cta-badge">${ad.ctaText}</span>
                  </div>
                  <h4 class="ad-headline-text">${ad.headline}</h4>
                  <p class="ad-desc-text">${ad.description}</p>
                  <div class="ad-meta-metrics">
                    <span>👁️ ${(ad.impressions || 0).toLocaleString()} views</span>
                    <span>👆 ${(ad.clicks || 0).toLocaleString()} clicks</span>
                    <span>🔗 <a href="${ad.linkUrl}" target="_blank">${ad.linkUrl}</a></span>
                  </div>
                </div>
                <div class="admin-ad-controls">
                  <label class="switch-toggle" title="Pause / Activate Ad">
                    <input type="checkbox" ${ad.active ? 'checked' : ''} onchange="window.adminModule.toggleAd('${ad.id}')" />
                    <span class="slider round"></span>
                  </label>
                  <button class="btn-delete-icon" onclick="window.adminModule.deleteAd('${ad.id}')" title="Delete Ad">
                    <i class="ph-bold ph-trash"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'creator_fund') {
      const users = window.authModule.getUsers();

      return `
        <!-- Creator Fund Header Metrics -->
        <div class="admin-stats-row">
          <div class="admin-stat-box">
            <div class="stat-num">₹75</div>
            <div class="stat-lbl">RPM Rate (per 1k Views)</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">₹62,750</div>
            <div class="stat-lbl">Total Cash Disbursed</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">1,225,000</div>
            <div class="stat-lbl">Monetized Reels Views</div>
          </div>
          <div class="admin-stat-box">
            <div class="stat-num">452</div>
            <div class="stat-lbl">Virtual Fan Gifts Sent</div>
          </div>
        </div>

        <!-- Reward Creator Direct Cash Card -->
        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-gift"></i> Send Instant Cash Reward to Creator ("Reels Banane Walo Ke Liye Paise")</h3>
          <p class="admin-hint-text">Founder Ankit Chaudhary can directly send bonus cash and monetary rewards to any creator's wallet!</p>
          <form onsubmit="window.adminModule.handleRewardCreatorSubmit(event)" class="admin-form-grid">
            <div class="form-group-admin">
              <label>Select Creator</label>
              <select id="reward-user-id" class="admin-input" required>
                ${users.map(u => `<option value="${u.id}">${u.displayName} (@${u.username})</option>`).join('')}
              </select>
            </div>
            <div class="form-group-admin">
              <label>Reward Cash Amount (₹ INR)</label>
              <input type="number" id="reward-amount" class="admin-input" placeholder="e.g. 2000, 5000, 10000" min="100" step="50" value="2000" required />
            </div>
            <div class="form-group-admin full-width">
              <label>Reward Note / Reason</label>
              <input type="text" id="reward-note" class="admin-input" placeholder="e.g. Viral Trending Reel Bonus & Super Creator Award 🚀" value="Viral Trending Reel Bonus & Super Creator Award 🚀" required />
            </div>
            <div class="form-group-admin full-width">
              <button type="submit" class="btn-admin-primary">
                <i class="ph-bold ph-paper-plane-tilt"></i> Send ₹ Cash Reward to Creator's Wallet 💸
              </button>
            </div>
          </form>
        </div>

        <!-- Registered Creators Directory & Wallets -->
        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-wallet"></i> Creator Wallets & Earnings Directory</h3>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Monetized Views</th>
                  <th>Wallet Balance</th>
                  <th>Lifetime Earnings</th>
                  <th>Fan Gifts</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => {
                  const wallet = window.omniStore.getCreatorWallet(u.id);
                  return `
                    <tr>
                      <td>
                        <div class="table-user-cell">
                          <img src="${u.avatar}" class="table-user-avatar" alt="${u.displayName}" />
                          <div>
                            <strong>${u.displayName} ${u.verified ? '✓' : ''}</strong>
                            <span class="table-handle">@${u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td>${(wallet.totalViews || 0).toLocaleString()} views</td>
                      <td><strong style="color: #4ADE80; font-size: 14px;">₹${(wallet.balance || 0).toLocaleString()}</strong></td>
                      <td>₹${(wallet.lifetimeEarnings || 0).toLocaleString()}</td>
                      <td>🎁 ${wallet.virtualGiftsCount || 0}</td>
                      <td>
                        <button class="btn-table-sm" onclick="document.getElementById('reward-user-id').value = '${u.id}'; window.app.showToast('Selected ${u.displayName} for cash reward!'); window.app.playSound('ding');">
                          + Reward ₹
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'users') {
      return `
        <div class="admin-card">
          <div class="admin-card-header-between">
            <div>
              <h3><i class="ph-bold ph-users"></i> Registered Users Directory (${users.length})</h3>
              <p class="admin-hint-text">Edit any user's profile, followers, grant Blue Tick (✓), or send targeted personal alerts live!</p>
            </div>
            <span class="admin-hint-tag">Role-Based Access Control (RBAC)</span>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th>Stats & Badges</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <img src="${u.avatar}" class="table-user-avatar" alt="${u.displayName}" />
                        <div>
                          <strong>${u.displayName} ${u.verified ? '<span class="verified-icon" title="Verified Blue Tick">✓</span>' : ''}</strong>
                          <span class="table-handle">@${u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="table-contact-cell">
                        <span>📞 ${u.phone || 'N/A'}</span>
                        <span>✉️ ${u.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="table-stats-cell">
                        <span>👥 ${(u.followers || 0).toLocaleString()} followers</span>
                        <span class="user-custom-tag">${u.roleTitle || (u.verified ? 'Verified Creator' : 'Member')}</span>
                      </div>
                    </td>
                    <td>
                      <span class="role-pill ${u.role === 'admin' ? 'admin' : 'user'}">
                        ${u.role === 'admin' ? '👑 Admin' : '👤 Regular User'}
                      </span>
                    </td>
                    <td>
                      <div class="table-action-btns">
                        <button class="btn-table-sm customize" onclick="window.adminModule.openCustomizeUserModal('${u.id}')" title="Edit Profile, Followers, Blue Tick & Send Personal Notice">
                          <i class="ph-bold ph-pencil-simple"></i> Edit App
                        </button>
                        ${u.role === 'admin' ? `
                          ${u.username !== 'ankit_chaudhary' ? `
                            <button class="btn-table-sm demote" onclick="window.adminModule.setUserRole('${u.id}', 'user')" title="Demote to Regular User">Demote</button>
                          ` : '<span class="founder-lock-tag">Founder</span>'}
                        ` : `
                          <button class="btn-table-sm promote" onclick="window.adminModule.setUserRole('${u.id}', 'admin')" title="Promote to Admin">Promote</button>
                        `}
                        <button class="btn-table-sm" onclick="window.adminModule.resetUserPassword('${u.id}')" title="Reset Password">Reset Pass</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'content') {
      return `
        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-megaphone"></i> Broadcast Official Announcement</h3>
          <p class="admin-hint-text">Publish an official verified post from Founder Ankit Chaudhary directly to every user's Feed!</p>
          <form onsubmit="window.adminModule.broadcastAnnouncement(event)" class="admin-broadcast-form">
            <textarea id="broadcast-message" class="admin-textarea" rows="3" placeholder="Enter announcement message for all Pluxy users..." required></textarea>
            <div style="display: flex; gap: 12px; align-items: center; margin-top: 10px;">
              <input type="text" id="broadcast-image-url" class="admin-input" placeholder="Optional Image URL (or leave default)" />
              <button type="submit" class="btn-admin-primary" style="white-space: nowrap;">
                <i class="ph-bold ph-paper-plane-tilt"></i> Broadcast to All Users 📢
              </button>
            </div>
          </form>
        </div>

        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-newspaper"></i> Live Posts Moderation (${posts.length} Posts)</h3>
          <div class="admin-content-grid">
            ${posts.slice(0, 6).map(p => `
              <div class="admin-post-card">
                <img src="${p.image}" class="admin-post-thumb" alt="Post" />
                <div class="admin-post-meta">
                  <div class="post-meta-top">
                    <strong>@${p.author.username}</strong>
                    <span>${p.likes} likes</span>
                  </div>
                  <p class="post-caption-snippet">${p.caption}</p>
                  <button class="btn-delete-sm" onclick="window.adminModule.deletePost('${p.id}')">
                    <i class="ph-bold ph-trash"></i> Delete Post
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'security') {
      return `
        <div class="admin-card">
          <h3 class="admin-card-header"><i class="ph-bold ph-lock-key"></i> Admin Master Code / PIN Security</h3>
          <p class="admin-hint-text">Master Secret Code is securely configured. You can update it anytime below.</p>
          <form onsubmit="window.adminModule.changeAdminPin(event)" class="pin-change-form">
            <div class="form-row-2">
              <div class="form-group-admin">
                <label>Current Master PIN / Code</label>
                <input type="password" id="pin-current" class="admin-input" placeholder="Enter current master code" required />
              </div>
              <div class="form-group-admin">
                <label>New Master Code / PIN</label>
                <input type="password" id="pin-new" class="admin-input" placeholder="Enter new secret code (min 4 chars)" required />
              </div>
            </div>
            <button type="submit" class="btn-admin-primary" style="margin-top: 10px;">
              <i class="ph-bold ph-check"></i> Update Master Code
            </button>
          </form>
        </div>

        <div class="admin-card">
          <div class="admin-card-header-between">
            <h3><i class="ph-bold ph-shield-check"></i> Security Audit Trail (Tamper-Proof Log)</h3>
            <span class="audit-counter">${auditLogs.length} Events Recorded</span>
          </div>

          <div class="audit-logs-stream">
            ${auditLogs.map(log => `
              <div class="audit-log-row">
                <span class="audit-time">${log.timestamp}</span>
                <span class="audit-action-tag ${log.action}">${log.action}</span>
                <span class="audit-actor">${log.actor}</span>
                <span class="audit-details">${log.details}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return '';
  }

  saveBranding(e) {
    e.preventDefault();
    const appName = document.getElementById("cfg-app-name").value.trim();
    const tagline = document.getElementById("cfg-tagline").value.trim();
    const founderName = document.getElementById("cfg-founder-name").value.trim();
    const founderPhone = document.getElementById("cfg-founder-phone").value.trim();
    const founderEmail = document.getElementById("cfg-founder-email").value.trim();
    const themeAccent = document.getElementById("cfg-theme-color").value;

    const updatedConfig = {
      appName,
      tagline,
      founderName,
      founderPhone,
      founderEmail,
      themeAccent
    };

    window.omniStore.updateAppConfig(updatedConfig);
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("branding", updatedConfig);
    }

    this.applyAppBranding();
    window.app.showToast("App identity & creator details updated live! ✨");
    window.app.playSound('ding');
    this.renderAdminPortal();
  }

  toggleFeature(featureKey, state) {
    window.omniStore.toggleFeatureFlag(featureKey, state);
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("feature_flags", { [featureKey]: state });
    }
    window.app.showToast(`Feature '${featureKey}' is now ${state ? 'ENABLED' : 'DISABLED'}`);
    window.app.playSound('pop');
  }

  openAddServiceModal() {
    const modalHtml = `
      <div class="service-modal-overlay" id="add-service-submodal">
        <div class="service-modal-box">
          <div class="service-modal-header">
            <h3><i class="ph-bold ph-plus-circle"></i> Add New Dynamic Service</h3>
            <button class="icon-btn-ghost" onclick="document.getElementById('add-service-submodal').remove()"><i class="ph-bold ph-x"></i></button>
          </div>
          <form onsubmit="window.adminModule.handleAddServiceSubmit(event)" class="service-create-form">
            <div class="form-group-admin">
              <label>Service Name (Title)</label>
              <input type="text" id="new-srv-name" class="admin-input" placeholder="e.g. Pluxy Music, Pluxy UPI, Live TV" required />
            </div>
            <div class="form-row-2">
              <div class="form-group-admin">
                <label>Service Icon / Emoji</label>
                <input type="text" id="new-srv-icon" class="admin-input" placeholder="e.g. 🎵 or 💳 or 🎮" value="⚡" required />
              </div>
              <div class="form-group-admin">
                <label>Category</label>
                <select id="new-srv-cat" class="admin-input">
                  <option value="music">Music & Audio</option>
                  <option value="payments">Payments & UPI</option>
                  <option value="games">Gaming</option>
                  <option value="shopping">Marketplace</option>
                  <option value="tools">Smart Tool</option>
                </select>
              </div>
            </div>
            <div class="form-group-admin">
              <label>Short Tagline / Subtitle</label>
              <input type="text" id="new-srv-tagline" class="admin-input" placeholder="e.g. Stream trending lo-fi tracks" required />
            </div>
            <div class="form-group-admin">
              <label>Detailed Description</label>
              <textarea id="new-srv-desc" class="admin-textarea" rows="2" placeholder="Explain what this new service offers to Pluxy users..."></textarea>
            </div>
            <div class="form-group-admin">
              <label>Placement in App</label>
              <select id="new-srv-placement" class="admin-input">
                <option value="both">Top Shortcut & Bottom Navigation (Recommended)</option>
                <option value="shortcut">Top Shortcuts Bar Only</option>
                <option value="bottom">Bottom Navigation Bar Only</option>
              </select>
            </div>
            <div class="service-modal-actions">
              <button type="button" class="btn-admin-cancel" onclick="document.getElementById('add-service-submodal').remove()">Cancel</button>
              <button type="submit" class="btn-admin-primary">🚀 Launch Service to Pluxy</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById("add-service-submodal");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  handleAddServiceSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("new-srv-name").value.trim();
    const icon = document.getElementById("new-srv-icon").value.trim() || "⚡";
    const category = document.getElementById("new-srv-cat").value;
    const tagline = document.getElementById("new-srv-tagline").value.trim();
    const description = document.getElementById("new-srv-desc").value.trim();
    const targetPosition = document.getElementById("new-srv-placement").value;

    const newSrv = window.omniStore.addCustomService({
      name,
      icon,
      category,
      tagline,
      description,
      targetPosition,
      badge: "NEW"
    });

    const submodal = document.getElementById("add-service-submodal");
    if (submodal) submodal.remove();

    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("services", window.omniStore.getCustomServices());
    }

    this.renderDynamicServicesInApp();
    this.renderAdminPortal();

    window.app.showToast(`🎉 New Service "${name}" deployed successfully!`);
    window.app.playSound('sent');
  }

  toggleService(serviceId) {
    const srv = window.omniStore.toggleServiceStatus(serviceId);
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("services", window.omniStore.getCustomServices());
    }
    this.renderDynamicServicesInApp();
    this.renderAdminPortal();
    if (srv) {
      window.app.showToast(`${srv.name} is now ${srv.active ? 'ACTIVE' : 'DISABLED'}`);
      window.app.playSound('pop');
    }
  }

  deleteService(serviceId) {
    if (confirm("Are you sure you want to delete this custom service?")) {
      window.omniStore.deleteCustomService(serviceId);
      if (window.syncEngine) {
        window.syncEngine.pushAdminUpdate("services", window.omniStore.getCustomServices());
      }
      this.renderDynamicServicesInApp();
      this.renderAdminPortal();
      window.app.showToast("Service deleted 🗑️");
      window.app.playSound('pop');
    }
  }

  renderDynamicServicesInApp() {
    const services = window.omniStore.getCustomServices().filter(s => s.active);

    // 1. Render in Sub Navigation Shortcuts
    const shortcutsContainer = document.querySelector(".sub-nav-shortcuts");
    if (shortcutsContainer) {
      // Remove previously injected dynamic shortcut pills
      if (typeof shortcutsContainer.querySelectorAll === "function") {
        shortcutsContainer.querySelectorAll(".dynamic-srv-pill").forEach(el => el.remove());
      }

      services.forEach(s => {
        if (s.targetPosition === "shortcut" || s.targetPosition === "both") {
          const pill = document.createElement("button");
          pill.className = "shortcut-pill dynamic-srv-pill";
          pill.setAttribute("data-tab", s.id);
          pill.innerHTML = `${s.icon} ${s.name}`;
          pill.onclick = () => window.app.switchTab(s.id);
          if (typeof shortcutsContainer.appendChild === "function") {
            shortcutsContainer.appendChild(pill);
          }
        }
      });
    }

    // 2. Render dynamic screens in .app-screen-container
    const screensContainer = document.querySelector(".app-screen-container");
    if (screensContainer) {
      // Remove previously injected dynamic screens
      if (typeof screensContainer.querySelectorAll === "function") {
        screensContainer.querySelectorAll(".dynamic-service-screen").forEach(el => el.remove());
      }

      services.forEach(s => {
        const section = document.createElement("section");
        section.id = `view-${s.id}`;
        section.className = "app-screen-view dynamic-service-screen";
        section.innerHTML = `
          <div class="dynamic-service-view-card">
            <div class="srv-hero-banner">
              <div class="srv-hero-icon">${s.icon}</div>
              <h2>${s.name}</h2>
              <p class="srv-hero-tagline">${s.tagline}</p>
              <span class="srv-official-badge">Verified Pluxy Service</span>
            </div>

            <div class="srv-body-content">
              <div class="srv-desc-box">
                <h4>About this Service:</h4>
                <p>${s.description}</p>
              </div>

              ${this.getServiceInteractiveWidget(s)}
            </div>
          </div>
        `;
        if (typeof screensContainer.appendChild === "function") {
          screensContainer.appendChild(section);
        }
      });
    }
  }

  getServiceInteractiveWidget(service) {
    if (service.category === "music") {
      return `
        <div class="service-interactive-widget music-widget">
          <div class="widget-player-header">
            <div class="widget-music-art">🎵</div>
            <div>
              <strong>Pluxy Lo-Fi FM</strong>
              <span>Streaming 24/7 Studio Vibes</span>
            </div>
            <button class="btn-widget-play" onclick="window.app.playSound('ding'); window.app.showToast('Playing Pluxy Beats 🎧');">
              <i class="ph-fill ph-play"></i> Play
            </button>
          </div>
          <div class="widget-tracks-list">
            <div class="track-row" onclick="window.app.showToast('Now Playing: Diljit - Lover (Lofi Edit) ✨')">
              <span>01. Diljit Dosanjh - Lover (Lofi Edit)</span>
              <span class="track-dur">2:45</span>
            </div>
            <div class="track-row" onclick="window.app.showToast('Now Playing: Chill Coding Nights - Synthwave 💻')">
              <span>02. Chill Coding Nights - Synthwave</span>
              <span class="track-dur">3:12</span>
            </div>
            <div class="track-row" onclick="window.app.showToast('Now Playing: Golden Hour Acoustic Guitar 🎸')">
              <span>03. Golden Hour Acoustic Guitar</span>
              <span class="track-dur">3:30</span>
            </div>
          </div>
        </div>
      `;
    }

    if (service.category === "payments") {
      return `
        <div class="service-interactive-widget pay-widget">
          <h4>Pluxy Instant UPI & Peer Pay</h4>
          <p>Send and request money instantly with 0% fee.</p>
          <div class="pay-input-box">
            <input type="text" class="admin-input" placeholder="Enter UPI ID or Phone No (e.g. 8533955333@upi)" />
            <input type="number" class="admin-input" placeholder="Amount (₹)" style="max-width: 120px;" />
            <button class="btn-admin-primary" onclick="window.app.showToast('UPI Payment Simulator: Transfer Successful! 💸')">Send ₹</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="service-interactive-widget general-widget">
        <div class="general-widget-icon">${service.icon}</div>
        <h4>${service.name} Portal Active</h4>
        <p>This custom service is connected to Pluxy's lifetime engine.</p>
        <button class="btn-admin-primary" onclick="window.app.showToast('${service.name} triggered! ⚡')">
          Launch ${service.name} Action
        </button>
      </div>
    `;
  }

  openCustomizeUserModal(userId) {
    const users = window.authModule.getUsers();
    const u = users.find(user => user.id === userId || user.username === userId);
    if (!u) {
      window.app.showToast("User not found! ⚠️");
      return;
    }

    const modalHtml = `
      <div class="service-modal-overlay" id="customize-user-modal">
        <div class="service-modal-box user-customizer-box">
          <div class="service-modal-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${u.avatar}" class="customizer-avatar-sm" alt="${u.displayName}" />
              <div>
                <h3>Customize User's App: ${u.displayName}</h3>
                <span class="customizer-handle">@${u.username} • ID: ${u.id}</span>
              </div>
            </div>
            <button class="icon-btn-ghost" onclick="document.getElementById('customize-user-modal').remove()"><i class="ph-bold ph-x"></i></button>
          </div>

          <form onsubmit="window.adminModule.saveUserCustomization(event, '${u.id}')" class="service-create-form">
            <!-- Badges & Verification Row -->
            <div class="customizer-highlight-card">
              <div class="customizer-card-top">
                <div>
                  <strong><i class="ph-fill ph-check-circle" style="color: #38BDF8;"></i> Pluxy Verified Badge (Blue Tick ✓)</strong>
                  <p>Display verified blue checkmark on user's profile and posts across all devices</p>
                </div>
                <label class="switch-toggle">
                  <input type="checkbox" id="edit-user-verified" ${u.verified ? 'checked' : ''} />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group-admin">
                <label>Display Name</label>
                <input type="text" id="edit-user-name" class="admin-input" value="${u.displayName || ''}" required />
              </div>
              <div class="form-group-admin">
                <label>Follower Count</label>
                <input type="number" id="edit-user-followers" class="admin-input" value="${u.followers || 0}" required />
              </div>
            </div>

            <div class="form-group-admin">
              <label>Custom Title / Rank Badge</label>
              <input type="text" id="edit-user-status" class="admin-input" value="${u.roleTitle || (u.verified ? 'Verified Creator' : 'Standard Member')}" placeholder="e.g. Verified Creator, Pluxy VIP, Top Star" />
            </div>

            <div class="form-group-admin">
              <label>User Bio Description</label>
              <textarea id="edit-user-bio" class="admin-textarea" rows="2" placeholder="Custom bio for this user...">${u.bio || ''}</textarea>
            </div>

            <!-- Targeted Direct Personal Alert -->
            <div class="customizer-alert-box">
              <label><i class="ph-bold ph-megaphone"></i> Send Direct Targeted Pop-Up Notice to ${u.displayName.split(' ')[0]}</label>
              <textarea id="edit-user-alert-msg" class="admin-textarea" rows="2" placeholder="e.g. Congratulations! You've been granted the official Pluxy Verified Creator badge by Founder Ankit Chaudhary 🎉"></textarea>
              <span class="customizer-note">⚡ This pop-up will appear directly on this user's phone in real-time!</span>
            </div>

            <div class="service-modal-actions">
              <button type="button" class="btn-admin-cancel" onclick="document.getElementById('customize-user-modal').remove()">Cancel</button>
              <button type="submit" class="btn-admin-primary">
                <i class="ph-bold ph-paper-plane-tilt"></i> Save & Sync to User's App Live 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById("customize-user-modal");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  saveUserCustomization(e, userId) {
    e.preventDefault();
    const users = window.authModule.getUsers();
    const u = users.find(user => user.id === userId || user.username === userId);
    if (!u) return;

    const isVerified = document.getElementById("edit-user-verified").checked;
    const displayName = document.getElementById("edit-user-name").value.trim();
    const followers = parseInt(document.getElementById("edit-user-followers").value, 10) || 0;
    const customStatus = document.getElementById("edit-user-status").value.trim();
    const bio = document.getElementById("edit-user-bio").value.trim();
    const alertMsg = document.getElementById("edit-user-alert-msg").value.trim();

    // 1. Update local user record
    u.verified = isVerified;
    u.displayName = displayName;
    u.followers = followers;
    u.roleTitle = customStatus;
    u.bio = bio;
    window.authModule.saveUsers(users);

    // If target is currently active user on this screen, update session
    if (window.authModule.currentUser && (window.authModule.currentUser.id === u.id || window.authModule.currentUser.username === u.username)) {
      window.authModule.currentUser = { ...window.authModule.currentUser, ...u };
      window.authModule.setActiveUser(window.authModule.currentUser);
    }

    // 2. Push Override to Sync Server
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("user_override", {
        userId: u.id,
        isVerified,
        displayName,
        followers,
        customStatus,
        bio
      });

      // 3. Send targeted alert if message typed
      if (alertMsg) {
        window.syncEngine.pushAdminUpdate("user_alert", {
          userId: u.id,
          title: "Official Notice from Founder Ankit Chaudhary",
          message: alertMsg,
          badge: isVerified ? "Verified Creator ✓" : customStatus,
          timestamp: Date.now()
        });
      }
    }

    window.omniStore.logAuditEvent("USER_CUSTOMIZED", `Admin customized app for @${u.username}: Verified=${isVerified}, Followers=${followers}`);

    const modal = document.getElementById("customize-user-modal");
    if (modal) modal.remove();

    this.renderAdminPortal();
    window.app.showToast(`🎉 Customizations & Alert synced live to @${u.username}'s app!`);
    window.app.playSound('sent');
  }

  setUserRole(userId, newRole) {
    const users = window.authModule.getUsers();
    const u = users.find(user => user.id === userId);
    if (!u) return;
    if (u.username === "ankit_chaudhary" && newRole !== "admin") {
      window.app.showToast("Founder Ankit Chaudhary cannot be demoted! 👑");
      return;
    }
    u.role = newRole;
    window.authModule.saveUsers(users);
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("user_override", {
        userId: u.id,
        role: newRole,
        roleTitle: newRole === 'admin' ? 'Administrator' : 'Standard Member'
      });
    }
    window.omniStore.logAuditEvent("ROLE_CHANGED", `User @${u.username} role changed to ${newRole}`);
    window.app.showToast(`@${u.username} is now a ${newRole === 'admin' ? '👑 Admin' : '👤 Regular User'}!`);
    window.app.playSound('ding');
    this.renderAdminPortal();
  }

  resetUserPassword(userId) {
    const users = window.authModule.getUsers();
    const u = users.find(user => user.id === userId);
    if (!u) return;
    u.password = "password123";
    window.authModule.saveUsers(users);
    window.omniStore.logAuditEvent("PASSWORD_RESET", `Admin reset password for @${u.username} to 'password123'`);
    window.app.showToast(`Password for @${u.username} reset to 'password123' 🔑`);
    window.app.playSound('ding');
  }

  broadcastAnnouncement(e) {
    e.preventDefault();
    const msg = document.getElementById("broadcast-message").value.trim();
    const imgUrl = document.getElementById("broadcast-image-url").value.trim() || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800";
    if (!msg) return;

    const newPost = {
      id: "post_announcement_" + Date.now(),
      author: {
        username: "ankit_chaudhary",
        displayName: "Ankit Chaudhary (Founder & Admin) 📢",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
      },
      time: "Just now",
      image: imgUrl,
      caption: `🚨 [OFFICIAL ANNOUNCEMENT FROM FOUNDER ANKIT CHAUDHARY] 🚨\n\n${msg}`,
      likes: 1042,
      isLiked: true,
      comments: [
        { user: "priya_sharma", text: "Thank you for the update Ankit sir! Pluxy is amazing! 🔥" }
      ]
    };

    window.omniStore.data.posts.unshift(newPost);
    window.omniStore.save();
    window.omniStore.logAuditEvent("ANNOUNCEMENT_BROADCAST", `Admin broadcasted announcement to all users: "${msg.slice(0, 40)}..."`);

    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("broadcast", newPost);
    }

    if (window.feedModule) window.feedModule.renderPosts();
    window.app.showToast("📢 Announcement broadcasted to all users' feeds!");
    window.app.playSound('sent');
    this.closeAdminPortal();
    window.app.switchTab('feed');
  }

  deletePost(postId) {
    if (confirm("Delete this post from the global feed?")) {
      window.omniStore.data.posts = window.omniStore.data.posts.filter(p => p.id !== postId);
      window.omniStore.save();
      window.omniStore.logAuditEvent("POST_DELETED", `Admin deleted post ID: ${postId}`);
      if (window.feedModule) window.feedModule.renderPosts();
      this.renderAdminPortal();
      window.app.showToast("Post removed from feed 🗑️");
      window.app.playSound('pop');
    }
  }

  openCreateAdModal() {
    const modalHtml = `
      <div class="service-modal-overlay" id="create-ad-modal">
        <div class="service-modal-box" style="max-width: 520px;">
          <div class="service-modal-header">
            <h3><i class="ph-bold ph-megaphone"></i> Launch Sponsored Ad Campaign</h3>
            <button class="icon-btn-ghost" onclick="document.getElementById('create-ad-modal').remove()"><i class="ph-bold ph-x"></i></button>
          </div>
          <form onsubmit="window.adminModule.handleCreateAdSubmit(event)" class="service-create-form">
            <div class="form-row-2">
              <div class="form-group-admin">
                <label>Brand / Sponsor Name</label>
                <input type="text" id="new-ad-brand" class="admin-input" placeholder="e.g. boAt, Nike, Zomato, Puma" required />
              </div>
              <div class="form-group-admin">
                <label>Placement</label>
                <select id="new-ad-placement" class="admin-input">
                  <option value="all">Everywhere (Feed & Reels) ⭐</option>
                  <option value="feed">Feed Only</option>
                  <option value="reels">Reels Only</option>
                </select>
              </div>
            </div>
            <div class="form-group-admin">
              <label>Ad Headline</label>
              <input type="text" id="new-ad-headline" class="admin-input" placeholder="e.g. Flat 60% Off on Premium Wireless Earbuds! 🎧" required />
            </div>
            <div class="form-group-admin">
              <label>Description / Offer Details</label>
              <textarea id="new-ad-desc" class="admin-textarea" rows="2" placeholder="Describe the product or special offer..." required></textarea>
            </div>
            <div class="form-group-admin">
              <label>Ad Banner / Video Media URL</label>
              <input type="text" id="new-ad-media" class="admin-input" placeholder="Image URL (Unsplash or custom)" value="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" required />
            </div>
            <div class="form-row-2">
              <div class="form-group-admin">
                <label>CTA Button Text</label>
                <input type="text" id="new-ad-cta" class="admin-input" placeholder="e.g. Shop Now 🛍️" value="Shop Now 🛍️" required />
              </div>
              <div class="form-group-admin">
                <label>Destination Web Link</label>
                <input type="url" id="new-ad-link" class="admin-input" placeholder="https://..." value="https://pluxy.app" required />
              </div>
            </div>
            <div class="service-modal-actions">
              <button type="button" class="btn-admin-cancel" onclick="document.getElementById('create-ad-modal').remove()">Cancel</button>
              <button type="submit" class="btn-admin-primary">🚀 Launch Ad Campaign</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById("create-ad-modal");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  handleCreateAdSubmit(e) {
    e.preventDefault();
    const brand = document.getElementById("new-ad-brand").value.trim();
    const placement = document.getElementById("new-ad-placement").value;
    const headline = document.getElementById("new-ad-headline").value.trim();
    const description = document.getElementById("new-ad-desc").value.trim();
    const mediaUrl = document.getElementById("new-ad-media").value.trim();
    const ctaText = document.getElementById("new-ad-cta").value.trim() || "Shop Now 🛍️";
    const linkUrl = document.getElementById("new-ad-link").value.trim() || "https://pluxy.app";

    const newAd = window.omniStore.addSponsoredAd({
      brand,
      headline,
      description,
      mediaUrl,
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
      ctaText,
      linkUrl,
      placement,
      active: true
    });

    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("ads", newAd);
    }

    const modal = document.getElementById("create-ad-modal");
    if (modal) modal.remove();

    if (window.feedModule) window.feedModule.renderPosts();
    if (window.reelsModule) window.reelsModule.renderReels();

    this.renderAdminPortal();
    window.app.showToast("🚀 Sponsored ad launched live across all Pluxy users!");
    window.app.playSound('sent');
  }

  toggleAd(adId) {
    const updated = window.omniStore.toggleSponsoredAd(adId);
    if (window.syncEngine && updated) {
      window.syncEngine.pushAdminUpdate("ads", updated);
    }
    if (window.feedModule) window.feedModule.renderPosts();
    if (window.reelsModule) window.reelsModule.renderReels();
    this.renderAdminPortal();
    window.app.showToast(`Ad campaign is now ${updated?.active ? 'ACTIVE & LIVE 🟢' : 'PAUSED ⏸️'}`);
    window.app.playSound('pop');
  }

  deleteAd(adId) {
    if (confirm("Are you sure you want to delete this sponsored ad campaign?")) {
      window.omniStore.deleteSponsoredAd(adId);
      if (window.syncEngine) {
        window.syncEngine.pushAdminUpdate("ads", { deletedId: adId });
      }
      if (window.feedModule) window.feedModule.renderPosts();
      if (window.reelsModule) window.reelsModule.renderReels();
      this.renderAdminPortal();
      window.app.showToast("Sponsored ad campaign deleted 🗑️");
      window.app.playSound('pop');
    }
  }

  handleRewardCreatorSubmit(e) {
    e.preventDefault();
    const userId = document.getElementById("reward-user-id").value;
    const amount = parseFloat(document.getElementById("reward-amount").value);
    const note = document.getElementById("reward-note").value.trim() || "Founder Cash Reward & Creator Fund Bonus 💸";

    if (!userId || isNaN(amount) || amount <= 0) {
      window.app.showToast("Please enter a valid cash amount!");
      return;
    }

    window.omniStore.adminRewardCreator(userId, amount, note);
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("creator_reward", { userId, amount, note });
    }

    const targetUser = window.authModule.getUsers().find(u => u.id === userId);
    const userName = targetUser ? targetUser.displayName : "Creator";

    this.renderAdminPortal();
    window.app.showToast(`🎉 ₹${amount.toLocaleString()} cash credited to ${userName}'s wallet! 💸`);
    window.app.playSound('ding');
  }

  changeAdminPin(e) {
    e.preventDefault();
    const cur = document.getElementById("pin-current").value.trim();
    const nxt = document.getElementById("pin-new").value.trim();

    if (!window.authModule.verifyAdminPin(cur)) {
      window.app.showToast("Current Master Code is incorrect! ❌");
      window.app.playSound('pop');
      return;
    }

    if (nxt.length < 4) {
      window.app.showToast("New Master Code must be at least 4 characters/digits! 🔢");
      return;
    }

    window.omniStore.updateAppConfig({ adminPin: nxt });
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("admin_pin", { adminPin: nxt });
    }
    window.omniStore.logAuditEvent("PIN_CHANGED", "Admin Master Code / PIN was updated successfully");
    window.app.showToast("Master Admin Code updated successfully! 🔒");
    window.app.playSound('ding');
    this.renderAdminPortal();
  }
}

window.adminModule = new AdminModule();
