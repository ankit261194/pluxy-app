// Pluxy Authentication Module (Login, Register, Forgot Password, Logout)
class AuthModule {
  constructor() {
    this.modal = document.getElementById("auth-modal");
    this.currentView = "login"; // 'login' | 'register' | 'forgot'
    this.generatedOtp = null;
    this.otpTarget = "";
    
    // Seed initial users if not present
    this.initUsersDatabase();
    
    // Check active session
    this.currentUser = this.getActiveUser();
  }

  init() {
    this.setupEventListeners();
    this.updateUserBadgeInUI();

    // If no active session, show auth modal
    if (!this.currentUser) {
      this.openAuth("login");
    }
  }

  setupEventListeners() {
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal && this.currentUser) {
          this.closeAuth();
        }
      });
    }
  }

  initUsersDatabase() {
    const defaultUsers = [
      {
        id: "user_ankit",
        username: "ankit_chaudhary",
        displayName: "Ankit Chaudhary",
        phone: "8533955333",
        email: "ankit@pluxy.app",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        role: "admin",
        roleTitle: "Founder & Lead Developer",
        bio: "Founder & Lead Developer of Pluxy 🚀 | All-in-One Super Social Media & Lifetime Gemini AI | 📞 8533955333",
        streakCount: 52,
        followers: 24500,
        following: 120,
        postsCount: 18,
        verified: true
      },
      {
        id: "user_priya",
        username: "priya_sharma",
        displayName: "Priya Sharma",
        phone: "9876543210",
        email: "priya@gmail.com",
        password: "user123",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        role: "user",
        roleTitle: "Standard Member",
        bio: "Explorer, travel photographer 📸 & everyday Pluxy user ✨",
        streakCount: 14,
        followers: 3420,
        following: 450,
        postsCount: 12,
        verified: false
      }
    ];

    let users = this.getUsers();
    if (!users || users.length === 0) {
      localStorage.setItem("pluxy_users_db", JSON.stringify(defaultUsers));
      users = defaultUsers;
    } else {
      let updated = false;
      const ankit = users.find(u => u.username === "ankit_chaudhary" || u.phone === "8533955333");
      if (ankit) {
        ankit.role = "admin";
        updated = true;
      } else {
        users.unshift(defaultUsers[0]);
        updated = true;
      }
      if (!users.some(u => u.username === "priya_sharma")) {
        users.push(defaultUsers[1]);
        updated = true;
      }
      if (updated) {
        localStorage.setItem("pluxy_users_db", JSON.stringify(users));
      }
    }

    // Default logged in user to Ankit Chaudhary if first time
    if (!localStorage.getItem("pluxy_active_session")) {
      localStorage.setItem("pluxy_active_session", JSON.stringify(defaultUsers[0]));
      this.currentUser = defaultUsers[0];
    }
  }

  isAdmin() {
    if (window.adminModule && window.adminModule.isUnlocked) return true;
    if (!this.currentUser) return false;
    return this.currentUser.role === "admin" || this.currentUser.username === "ankit_chaudhary" || this.currentUser.phone === "8533955333";
  }

  verifyAdminPin(pin) {
    const config = window.omniStore ? window.omniStore.getAppConfig() : null;
    const masterPin = (config && config.adminPin) ? config.adminPin : "910010025123343";
    return String(pin).trim() === String(masterPin).trim();
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem("pluxy_users_db")) || [];
    } catch (e) {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem("pluxy_users_db", JSON.stringify(users));
  }

  getActiveUser() {
    try {
      const u = localStorage.getItem("pluxy_active_session");
      if (u) return JSON.parse(u);
    } catch (e) {}
    const users = this.getUsers();
    return (users && users.length > 0) ? users[0] : null;
  }

  setActiveUser(user) {
    if (!user) {
      const users = this.getUsers();
      user = users.find(u => u.role === "user" || u.username === "priya_sharma") || users[0];
    }
    this.currentUser = user;
    localStorage.setItem("pluxy_active_session", JSON.stringify(user));
    // Sync with Store
    if (window.omniStore) {
      window.omniStore.data.currentUser = user;
      window.omniStore.save();
    }
    this.updateUserBadgeInUI();
    if (window.profileModule && typeof window.profileModule.renderProfile === "function") {
      window.profileModule.renderProfile();
    }
    if (window.feedModule && typeof window.feedModule.renderPosts === "function") {
      window.feedModule.renderPosts();
    }
    if (window.storiesModule && typeof window.storiesModule.renderStories === "function") {
      window.storiesModule.renderStories();
    }
    if (window.adminModule && typeof window.adminModule.updateAdminHeaderBadge === "function") {
      window.adminModule.updateAdminHeaderBadge();
    }
  }

  openAuth(view = "login") {
    this.currentView = view;
    if (this.modal) {
      this.renderAuthView();
      this.modal.classList.add("active");
    }
  }

  closeAuth() {
    if (this.modal && this.currentUser) {
      this.modal.classList.remove("active");
    } else if (!this.currentUser) {
      window.app.showToast("Please log in or create an account to access Pluxy!");
    }
  }

  switchView(view) {
    this.currentView = view;
    this.renderAuthView();
    window.app.playSound('pop');
  }

  renderAuthView() {
    const container = document.getElementById("auth-modal-content");
    if (!container) return;

    if (this.currentView === "login") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Welcome to Pluxy</h2>
          <p class="auth-subtitle">All-in-One Super Social Media & Lifetime AI</p>
        </div>

        <form class="auth-form" onsubmit="window.authModule.handleLogin(event)">
          <div class="form-group">
            <label><i class="ph-bold ph-user"></i> Username, Phone or Email</label>
            <input type="text" id="login-identifier" class="auth-input" placeholder="e.g. ankit_chaudhary or 8533955333" required value="ankit_chaudhary" />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label><i class="ph-bold ph-lock-key"></i> Password</label>
              <a href="javascript:void(0)" class="auth-link-sm" onclick="window.authModule.switchView('forgot')">Forgot Password?</a>
            </div>
            <div class="input-password-wrap">
              <input type="password" id="login-password" class="auth-input" placeholder="Enter your password" required value="password123" />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('login-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-sign-in"></i> Log In to Pluxy
          </button>

          <div class="auth-divider"><span>OR 1-TAP QUICK LOGIN</span></div>

          <div class="auth-quick-roles-wrap">
            <button type="button" class="btn-quick-role admin" onclick="window.authModule.loginAsAdmin()" title="Log in as Founder & Admin Ankit Chaudhary">
              <span class="role-icon">👑</span>
              <div class="role-meta">
                <strong>Admin / Founder Access</strong>
                <span>Ankit Chaudhary (8533955333)</span>
              </div>
              <span class="role-badge">Full Access</span>
            </button>
            <button type="button" class="btn-quick-role user" onclick="window.authModule.loginAsRegularUser()" title="Log in as Standard Public User">
              <span class="role-icon">👤</span>
              <div class="role-meta">
                <strong>Regular User Account</strong>
                <span>Priya Sharma (9876543210)</span>
              </div>
              <span class="role-badge green">Standard</span>
            </button>
          </div>

          <div class="auth-footer-text">
            Don't have an account? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('register')">Sign Up Free</a>
          </div>
        </form>
      `;
    } else if (this.currentView === "register") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Join Pluxy Today</h2>
          <p class="auth-subtitle">Create your all-in-one social account with Lifetime AI</p>
        </div>

        <form class="auth-form" onsubmit="window.authModule.handleRegister(event)">
          <div class="form-group">
            <label><i class="ph-bold ph-identification-card"></i> Full Name</label>
            <input type="text" id="reg-fullname" class="auth-input" placeholder="e.g. Aryan Sharma" required />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label><i class="ph-bold ph-at"></i> Username</label>
              <input type="text" id="reg-username" class="auth-input" placeholder="aryan_s" required />
            </div>
            <div class="form-group">
              <label><i class="ph-bold ph-phone"></i> Phone No</label>
              <input type="tel" id="reg-phone" class="auth-input" placeholder="9876543210" required />
            </div>
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-envelope"></i> Email Address</label>
            <input type="email" id="reg-email" class="auth-input" placeholder="aryan@example.com" required />
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-lock-key"></i> Create Password</label>
            <div class="input-password-wrap">
              <input type="password" id="reg-password" class="auth-input" placeholder="At least 6 characters" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('reg-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-user-circle"></i> Choose Profile Avatar</label>
            <div class="auth-avatar-selector" id="auth-avatar-options">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" class="avatar-opt selected" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-user-plus"></i> Create Pluxy Account 🚀
          </button>

          <div class="auth-footer-text">
            Already have an account? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('login')">Log In</a>
          </div>
        </form>
      `;
    } else if (this.currentView === "forgot") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Reset Your Password</h2>
          <p class="auth-subtitle">Verify with OTP to regain instant access</p>
        </div>

        <form class="auth-form" id="forgot-password-form" onsubmit="window.authModule.handlePasswordReset(event)">
          <div class="form-group" id="forgot-step-1">
            <label><i class="ph-bold ph-phone"></i> Registered Phone No or Email</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="forgot-target" class="auth-input" placeholder="e.g. 8533955333" required value="${this.otpTarget || '8533955333'}" />
              <button type="button" class="btn-send-otp" onclick="window.authModule.sendOtp()">
                Send OTP
              </button>
            </div>
          </div>

          <div class="form-group" id="forgot-step-2">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label><i class="ph-bold ph-shield-check"></i> 4-Digit Verification OTP</label>
              <span id="otp-hint-badge" class="otp-hint-badge hidden">Auto-Fill: 4829</span>
            </div>
            <input type="text" id="forgot-otp" class="auth-input otp-code-box" maxlength="6" placeholder="Enter 4-digit OTP" required />
          </div>

          <div class="form-group" id="forgot-step-3">
            <label><i class="ph-bold ph-lock-key"></i> New Password</label>
            <div class="input-password-wrap">
              <input type="password" id="forgot-new-pass" class="auth-input" placeholder="Create new strong password" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('forgot-new-pass')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-check-circle"></i> Save New Password & Login ✨
          </button>

          <div class="auth-footer-text">
            Remembered your password? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('login')">Back to Log In</a>
          </div>
        </form>
      `;
    }
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  }

  selectAvatar(imgEl) {
    document.querySelectorAll(".avatar-opt").forEach(el => el.classList.remove("selected"));
    imgEl.classList.add("selected");
  }

  handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById("login-identifier").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const users = this.getUsers();
    const found = users.find(u => 
      (u.username.toLowerCase() === identifier || 
       u.phone === identifier || 
       u.email.toLowerCase() === identifier) && 
      u.password === password
    );

    if (found) {
      this.setActiveUser(found);
      if (this.modal) this.modal.classList.remove("active");
      window.app.showToast(`Welcome back, ${found.displayName}! 👋🚀`);
      window.app.playSound('ding');
    } else {
      window.app.showToast("Invalid credentials! Try: ankit_chaudhary / password123 ⚠️");
      window.app.playSound('pop');
    }
  }

  loginAsAdmin() {
    const users = this.getUsers();
    const adminUser = users.find(u => u.role === "admin" || u.username === "ankit_chaudhary") || users[0];
    this.setActiveUser(adminUser);
    if (this.modal) this.modal.classList.remove("active");
    window.app.showToast("👑 Logged in as Admin (Ankit Chaudhary) - Master Access! 🚀");
    window.app.playSound('ding');
  }

  loginAsRegularUser() {
    const users = this.getUsers();
    const regUser = users.find(u => u.role === "user" || u.username === "priya_sharma") || users[1];
    this.setActiveUser(regUser);
    if (this.modal) this.modal.classList.remove("active");
    window.app.showToast("👤 Logged in as Regular User (Priya Sharma) - Standard Access! ✨");
    window.app.playSound('ding');
  }

  loginAsFounder() {
    this.loginAsAdmin();
  }

  handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById("reg-fullname").value.trim();
    const username = document.getElementById("reg-username").value.trim().toLowerCase().replace(/\s+/g, '_');
    const phone = document.getElementById("reg-phone").value.trim();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    
    const selectedAvatarEl = document.querySelector(".avatar-opt.selected");
    const avatar = selectedAvatarEl ? selectedAvatarEl.src : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

    const users = this.getUsers();
    if (users.some(u => u.username === username)) {
      window.app.showToast("Username already taken! Please pick another.");
      return;
    }

    const newUser = {
      id: "user_" + Date.now(),
      username: username,
      displayName: fullName,
      phone: phone,
      email: email,
      password: password,
      avatar: avatar,
      role: "user",
      roleTitle: "Standard Member",
      bio: `Hello! I am ${fullName} on Pluxy 🚀 | Connected to Lifetime Gemini AI`,
      streakCount: 1,
      followers: 120,
      following: 45,
      postsCount: 1,
      verified: false
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setActiveUser(newUser);

    if (this.modal) this.modal.classList.remove("active");
    window.app.showToast(`Account created! Welcome to Pluxy, ${fullName}! 🎉`);
    window.app.playSound('sent');
  }

  sendOtp() {
    const target = document.getElementById("forgot-target").value.trim();
    if (!target) {
      window.app.showToast("Please enter your Phone number or Email!");
      return;
    }
    this.otpTarget = target;
    this.generatedOtp = "4829";

    const badge = document.getElementById("otp-hint-badge");
    if (badge) {
      badge.classList.remove("hidden");
      badge.onclick = () => {
        document.getElementById("forgot-otp").value = "4829";
        window.app.showToast("OTP Auto-filled! ⚡");
      };
    }

    window.app.showToast(`Pluxy SMS: Your OTP is ${this.generatedOtp} 📲`);
    window.app.playSound('ding');
  }

  handlePasswordReset(e) {
    e.preventDefault();
    const otp = document.getElementById("forgot-otp").value.trim();
    const newPass = document.getElementById("forgot-new-pass").value;
    const target = (this.otpTarget || document.getElementById("forgot-target").value).trim().toLowerCase();

    if (otp !== "4829" && otp !== this.generatedOtp) {
      window.app.showToast("Invalid OTP code! Tap the auto-fill hint.");
      return;
    }

    const users = this.getUsers();
    let user = users.find(u => u.phone === target || u.email.toLowerCase() === target || u.username.toLowerCase() === target);
    if (!user) {
      // If user not found, reset for default user
      user = users[0];
    }

    user.password = newPass;
    this.saveUsers(users);
    this.setActiveUser(user);

    if (this.modal) this.modal.classList.remove("active");
    window.app.showToast("Password reset successfully! You are now logged in. ✨");
    window.app.playSound('ding');
  }

  logout() {
    if (window.adminModule) {
      window.adminModule.isUnlocked = false;
    }
    const users = this.getUsers();
    const regUser = users.find(u => u.role === "user" || u.username === "priya_sharma") || users[1] || users[0];
    this.setActiveUser(regUser);
    window.app.showToast("Logged out of Admin! Switched to Regular User (Priya) 👋");
    window.app.playSound('pop');
    this.openAuth("login");
  }

  updateUserBadgeInUI() {
    const user = this.currentUser;
    if (!user) return;

    // Update avatar in post create strip
    const postAvatar = document.querySelector(".create-post-avatar");
    if (postAvatar) postAvatar.src = user.avatar;

    const postPlaceholder = document.querySelector(".create-post-placeholder");
    if (postPlaceholder) postPlaceholder.innerText = `What's on your mind, ${user.displayName.split(' ')[0]}?`;

    // Update top header profile avatar
    const headerAvatar = document.getElementById("header-profile-avatar");
    if (headerAvatar) headerAvatar.src = user.avatar;

    // Admin Button in Header: ALWAYS VISIBLE!
    // Protected by Master PIN 910010025123343
    const adminBtn = document.getElementById("header-admin-btn");
    if (adminBtn) {
      adminBtn.style.display = "inline-flex";
    }

    // Sync with ProfileModule if available
    if (window.profileModule && typeof window.profileModule.renderProfile === "function") {
      window.profileModule.renderProfile();
    }
  }
}

window.authModule = new AuthModule();