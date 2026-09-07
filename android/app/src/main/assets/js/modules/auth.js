// Pluxy Authentication Module (Login, Register, Forgot Password, Logout)
class AuthModule {
  constructor() {
    this.modal = document.getElementById("auth-modal");
    this.currentView = "login"; // 'login' | 'register' | 'forgot'
    this.generatedOtp = null;
    this.otpTarget = "";
    
    // Seed initial users database if empty
    this.initUsersDatabase();
    
    // Check active session (strictly requires saved session)
    this.currentUser = this.getActiveUser();
  }

  init() {
    this.setupEventListeners();
    this.updateUserBadgeInUI();

    // If no active session, show auth screen immediately
    if (!this.currentUser) {
      this.openAuth("login");
    }
  }

  setupEventListeners() {
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        // Only allow clicking outside to close IF user is authenticated
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
        bio: "Founder & Lead Developer of Pluxy 🚀 | All-in-One Super Social Media & Lifetime Gemini AI",
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
    }
  }

  isAdmin() {
    if (window.adminModule && window.adminModule.isUnlocked) return true;
    if (!this.currentUser) return false;
    return this.currentUser.role === "admin" || this.currentUser.username === "ankit_chaudhary";
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
    try {
      localStorage.setItem("pluxy_users_db", JSON.stringify(users));
    } catch (e) {}
  }

  getActiveUser() {
    try {
      const u = localStorage.getItem("pluxy_active_session");
      if (u) return JSON.parse(u);
    } catch (e) {}
    return null; // Return null so fresh installs show Login/Register!
  }

  setActiveUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem("pluxy_active_session", JSON.stringify(user));
      if (window.omniStore) {
        window.omniStore.data.currentUser = user;
        window.omniStore.save();
      }
    } else {
      localStorage.removeItem("pluxy_active_session");
      if (window.omniStore) {
        window.omniStore.data.currentUser = null;
        window.omniStore.save();
      }
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
    if (!this.modal) this.modal = document.getElementById("auth-modal");
    if (this.modal) {
      this.renderAuthView();
      this.modal.classList.add("active");
    }
  }

  closeAuth() {
    if (this.modal && this.currentUser) {
      this.modal.classList.remove("active");
    } else if (!this.currentUser) {
      window.app.showToast("Please log in or register an account to continue! 🔒");
    }
  }

  switchView(view) {
    this.currentView = view;
    this.renderAuthView();
    if (window.app) window.app.playSound('pop');
  }

  renderAuthView() {
    const container = document.getElementById("auth-modal-content");
    if (!container) return;

    if (this.currentView === "login") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Welcome to Pluxy</h2>
          <p class="auth-subtitle">All-in-One Social Network & Lifetime AI</p>
        </div>

        <div class="auth-tabs-toggle">
          <button type="button" class="auth-tab-btn active" onclick="window.authModule.switchView('login')">Sign In</button>
          <button type="button" class="auth-tab-btn" onclick="window.authModule.switchView('register')">Create Account</button>
        </div>

        <form class="auth-form" onsubmit="window.authModule.handleLogin(event)">
          <div class="form-group">
            <label><i class="ph-bold ph-user"></i> Username, Phone or Email</label>
            <input type="text" id="login-identifier" class="auth-input" placeholder="Enter your username, phone or email" required />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label><i class="ph-bold ph-lock-key"></i> Password</label>
              <a href="javascript:void(0)" class="auth-link-sm" onclick="window.authModule.switchView('forgot')">Forgot?</a>
            </div>
            <div class="input-password-wrap">
              <input type="password" id="login-password" class="auth-input" placeholder="Enter your password" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('login-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-sign-in"></i> Log In
          </button>

          <div class="auth-footer-text">
            New to Pluxy? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('register')">Register here</a>
          </div>
        </form>
      `;
    } else if (this.currentView === "register") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Join the next-generation social super-app</p>
        </div>

        <div class="auth-tabs-toggle">
          <button type="button" class="auth-tab-btn" onclick="window.authModule.switchView('login')">Sign In</button>
          <button type="button" class="auth-tab-btn active" onclick="window.authModule.switchView('register')">Create Account</button>
        </div>

        <form class="auth-form" onsubmit="window.authModule.handleRegister(event)">
          <div class="form-group">
            <label><i class="ph-bold ph-identification-card"></i> Your Name</label>
            <input type="text" id="reg-fullname" class="auth-input" placeholder="Enter your full name" required />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label><i class="ph-bold ph-at"></i> Username</label>
              <input type="text" id="reg-username" class="auth-input" placeholder="e.g. rahul_99" required />
            </div>
            <div class="form-group">
              <label><i class="ph-bold ph-phone"></i> Mobile Phone</label>
              <input type="tel" id="reg-phone" class="auth-input" placeholder="Mobile Number" required />
            </div>
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-envelope"></i> Email Address</label>
            <input type="email" id="reg-email" class="auth-input" placeholder="name@example.com" required />
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
            <label><i class="ph-bold ph-user-circle"></i> Choose or Upload Profile Avatar</label>
            <div class="auth-avatar-selector" id="auth-avatar-options">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" class="avatar-opt selected" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
              <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" class="avatar-opt" onclick="window.authModule.selectAvatar(this)" />
              <label class="avatar-upload-btn" title="Upload from Gallery">
                <i class="ph-bold ph-camera-plus"></i>
                <input type="file" id="reg-avatar-file" accept="image/*" style="display:none" onchange="window.authModule.handleAvatarUpload(event)" />
              </label>
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-user-plus"></i> Register & Enter Pluxy 🚀
          </button>

          <div class="auth-footer-text">
            Already have an account? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('login')">Sign In</a>
          </div>
        </form>
      `;
    } else if (this.currentView === "forgot") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Reset Password</h2>
          <p class="auth-subtitle">Verify with OTP to reset your account password</p>
        </div>

        <form class="auth-form" id="forgot-password-form" onsubmit="window.authModule.handlePasswordReset(event)">
          <div class="form-group" id="forgot-step-1">
            <label><i class="ph-bold ph-phone"></i> Registered Phone or Email</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="forgot-target" class="auth-input" placeholder="Phone or Email" required value="${this.otpTarget || ''}" />
              <button type="button" class="btn-send-otp" onclick="window.authModule.sendOtp()">
                Send OTP
              </button>
            </div>
          </div>

          <div class="form-group" id="forgot-step-2">
            <label><i class="ph-bold ph-shield-check"></i> Verification OTP</label>
            <input type="text" id="forgot-otp" class="auth-input otp-code-box" maxlength="6" placeholder="Enter OTP code" required />
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
            <i class="ph-bold ph-check-circle"></i> Save Password & Sign In
          </button>

          <div class="auth-footer-text">
            Remember your password? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('login')">Back to Sign In</a>
          </div>
        </form>
      `;
    }
  }

  handleAvatarUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const container = document.getElementById("auth-avatar-options");
      if (!container) return;
      document.querySelectorAll(".avatar-opt").forEach(el => el.classList.remove("selected"));
      
      const customImg = document.createElement("img");
      customImg.src = evt.target.result;
      customImg.className = "avatar-opt selected";
      customImg.onclick = () => window.authModule.selectAvatar(customImg);
      container.insertBefore(customImg, container.firstChild);
      window.app.showToast("Profile photo selected! 📸");
    };
    reader.readAsDataURL(file);
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
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
       (u.email && u.email.toLowerCase() === identifier)) && 
      u.password === password
    );

    if (found) {
      this.setActiveUser(found);
      if (this.modal) this.modal.classList.remove("active");
      window.app.showToast(`Welcome back, ${found.displayName}! 👋🚀`);
      if (window.app) window.app.playSound('ding');
      window.app.switchTab("feed");
    } else {
      window.app.showToast("Incorrect username/phone or password! ⚠️");
      if (window.app) window.app.playSound('pop');
    }
  }

  handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById("reg-fullname").value.trim();
    const username = document.getElementById("reg-username").value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const phone = document.getElementById("reg-phone").value.trim();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    
    const selectedAvatarEl = document.querySelector(".avatar-opt.selected");
    const avatar = selectedAvatarEl ? selectedAvatarEl.src : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

    const users = this.getUsers();
    if (users.some(u => u.username === username)) {
      window.app.showToast("Username already taken! Please choose another.");
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
      roleTitle: "Pluxy Member",
      bio: `Hi, I am ${fullName} on Pluxy! 🌟`,
      streakCount: 1,
      followers: 0,
      following: 2,
      postsCount: 0,
      verified: false
    };

    users.push(newUser);
    this.saveUsers(users);

    // Initialize clean creator wallet for new user
    if (window.omniStore) {
      if (!window.omniStore.data.creatorWallets) window.omniStore.data.creatorWallets = {};
      window.omniStore.data.creatorWallets[newUser.id] = {
        userId: newUser.id,
        balance: 0,
        totalViews: 0,
        rpmRate: 85,
        lifetimeEarnings: 0,
        virtualGiftsCount: 0,
        transactions: []
      };
      window.omniStore.save();
    }

    this.setActiveUser(newUser);

    if (this.modal) this.modal.classList.remove("active");
    window.app.showToast(`Welcome to Pluxy, ${fullName}! 🎉 Profile created.`);
    if (window.app) window.app.playSound('sent');
    window.app.switchTab("feed");
  }

  sendOtp() {
    const target = document.getElementById("forgot-target").value.trim();
    if (!target) {
      window.app.showToast("Please enter your Phone number or Email!");
      return;
    }
    this.otpTarget = target;
    this.generatedOtp = "4829";

    const otpInput = document.getElementById("forgot-otp");
    if (otpInput) otpInput.value = "4829";

    window.app.showToast(`Pluxy Verification OTP sent: 4829 📲`);
    if (window.app) window.app.playSound('ding');
  }

  handlePasswordReset(e) {
    e.preventDefault();
    const otp = document.getElementById("forgot-otp").value.trim();
    const newPass = document.getElementById("forgot-new-pass").value;
    const target = (this.otpTarget || document.getElementById("forgot-target").value).trim().toLowerCase();

    if (otp !== "4829" && otp !== this.generatedOtp) {
      window.app.showToast("Invalid OTP code!");
      return;
    }

    const users = this.getUsers();
    let user = users.find(u => u.phone === target || (u.email && u.email.toLowerCase() === target) || u.username.toLowerCase() === target);
    if (!user) {
      window.app.showToast("Account not found with this mobile/email!");
      return;
    }

    user.password = newPass;
    this.saveUsers(users);
    this.setActiveUser(user);

    if (this.modal) this.modal.classList.remove("active");
    window.app.showToast("Password updated successfully! Welcome back. ✨");
    if (window.app) window.app.playSound('ding');
  }

  logout() {
    if (window.adminModule) {
      window.adminModule.isUnlocked = false;
    }
    this.setActiveUser(null);
    window.app.showToast("Logged out successfully! 👋");
    if (window.app) window.app.playSound('pop');
    this.openAuth("login");
  }

  updateUserBadgeInUI() {
    const user = this.currentUser;

    // Update avatar in post create strip
    const postAvatar = document.querySelector(".create-post-avatar");
    if (postAvatar) {
      postAvatar.src = user ? user.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
    }

    const postPlaceholder = document.querySelector(".create-post-placeholder");
    if (postPlaceholder) {
      postPlaceholder.innerText = user ? `What's on your mind, ${user.displayName.split(' ')[0]}?` : "Log in to post...";
    }

    // Update top header profile avatar
    const headerAvatar = document.getElementById("header-profile-avatar");
    if (headerAvatar) {
      headerAvatar.src = user ? user.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
    }

    // Header Admin button: Only show for Admin, or keep accessible via secret PIN
    const adminBtn = document.getElementById("header-admin-btn");
    if (adminBtn) {
      adminBtn.style.display = "inline-flex";
    }

    // Sync with ProfileModule
    if (window.profileModule && typeof window.profileModule.renderProfile === "function") {
      window.profileModule.renderProfile();
    }
  }
}

// Instantiate global auth module
window.authModule = new AuthModule();
