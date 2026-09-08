// Pluxy Authentication Module: Real Backend Sessions, Scrypt Hashing & Forgot Password
class AuthModule {
  constructor() {
    this.modal = document.getElementById("auth-modal");
    this.currentView = "login"; // 'login' | 'register' | 'forgot' | 'reset'
    this.currentUser = null;
    this.isLoading = false;
    this.pendingResetIdentifier = "";
    this.pendingResetCode = "";
  }

  async init() {
    this.modal = document.getElementById("auth-modal");
    this.setupEventListeners();

    // Check for existing session token
    const token = window.apiClient ? window.apiClient.getToken() : "";
    if (token) {
      try {
        const res = await window.apiClient.get("/api/auth/me");
        if (res && res.success && res.user) {
          this.currentUser = res.user;
          this.onAuthSuccess(res.user, false);
          return;
        }
      } catch (err) {
        console.log("[Auth] Existing session expired or invalid, prompting login.");
        if (window.apiClient) window.apiClient.clearToken();
      }
    }

    // Unauthenticated: ensure login view is active and modal is displayed
    this.currentUser = null;
    this.updateUserBadgeInUI();
    this.openAuth("login");
  }

  setupEventListeners() {
    if (!this.modal) this.modal = document.getElementById("auth-modal");
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        // Only allow clicking backdrop to close IF user is authenticated
        if (e.target === this.modal && this.currentUser) {
          this.closeAuth();
        }
      });
    }
  }

  isAdmin() {
    if (!this.currentUser) return false;
    return this.currentUser.role === "admin" || this.currentUser.role === "super_admin";
  }

  openAuth(view = "login") {
    this.currentView = view;
    if (!this.modal) this.modal = document.getElementById("auth-modal");
    if (this.modal) {
      this.renderAuthView();
      this.modal.classList.remove("auth-hidden");
    }
  }

  closeAuth() {
    if (!this.modal) this.modal = document.getElementById("auth-modal");
    if (this.modal && this.currentUser) {
      this.modal.classList.add("auth-hidden");
    } else if (!this.currentUser) {
      if (window.app) window.app.showToast("Please log in or register an account to continue! 🔒");
    }
  }

  switchView(view) {
    this.currentView = view;
    this.renderAuthView();
    if (window.app) window.app.playSound('pop');
  }

  onSessionExpired() {
    this.currentUser = null;
    this.updateUserBadgeInUI();
    if (window.app) window.app.showToast("Your session has expired. Please sign in again. 🔒");
    this.openAuth("login");
  }

  async handleLogin(event) {
    event.preventDefault();
    if (this.isLoading) return;

    const identInput = document.getElementById("login-identifier");
    const pwdInput = document.getElementById("login-password");
    const submitBtn = event.target.querySelector("button[type='submit']");

    const identifier = identInput ? identInput.value.trim() : "";
    const password = pwdInput ? pwdInput.value : "";

    if (!identifier || !password) {
      if (window.app) window.app.showToast("Please enter your username and password! ⚠️");
      return;
    }

    this.isLoading = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph-bold ph-spinner spin"></i> Signing In...';
    }

    try {
      const res = await window.apiClient.post("/api/auth/login", {
        identifier: identifier,
        password: password
      });

      if (res && res.success && res.token) {
        window.apiClient.setToken(res.token);
        this.currentUser = res.user;
        this.onAuthSuccess(res.user, true);
      } else {
        throw new Error(res.detail || res.message || "Invalid credentials");
      }
    } catch (err) {
      if (window.app) {
        window.app.showToast(`Login failed: ${err.message || "Invalid credentials"} ❌`);
        window.app.playSound('pop');
      }
    } finally {
      this.isLoading = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-bold ph-sign-in"></i> Log In';
      }
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    if (this.isLoading) return;

    const fullNameInput = document.getElementById("reg-fullname");
    const usernameInput = document.getElementById("reg-username");
    const phoneInput = document.getElementById("reg-phone");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");
    const confirmPasswordInput = document.getElementById("reg-confirm-password");
    const submitBtn = event.target.querySelector("button[type='submit']");

    const fullName = fullNameInput ? fullNameInput.value.trim() : "";
    const username = usernameInput ? usernameInput.value.trim().toLowerCase() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

    if (!fullName || !username || !password) {
      if (window.app) window.app.showToast("Please fill in all required fields! ⚠️");
      return;
    }

    if (password.length < 6) {
      if (window.app) window.app.showToast("Password must be at least 6 characters long! ⚠️");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      if (window.app) window.app.showToast("Passwords do not match! Please verify. ⚠️");
      return;
    }

    this.isLoading = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph-bold ph-spinner spin"></i> Creating Account...';
    }

    try {
      const res = await window.apiClient.post("/api/auth/register", {
        username: username,
        display_name: fullName,
        password: password,
        phone: phone || null,
        email: email || null,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
        bio: "Hey there! I am using Pluxy ✨"
      });

      if (res && res.success && res.token) {
        window.apiClient.setToken(res.token);
        this.currentUser = res.user;
        this.onAuthSuccess(res.user, true);
      } else {
        throw new Error(res.detail || res.message || "Registration failed");
      }
    } catch (err) {
      if (window.app) {
        window.app.showToast(`Registration failed: ${err.message || "Please try again"} ❌`);
        window.app.playSound('pop');
      }
    } finally {
      this.isLoading = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-bold ph-user-plus"></i> Create Account & Join';
      }
    }
  }

  async handleForgotPassword(event) {
    event.preventDefault();
    if (this.isLoading) return;

    const identInput = document.getElementById("forgot-identifier");
    const submitBtn = event.target.querySelector("button[type='submit']");
    const identifier = identInput ? identInput.value.trim() : "";

    if (!identifier) {
      if (window.app) window.app.showToast("Please enter your username, email, or phone! ⚠️");
      return;
    }

    this.isLoading = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph-bold ph-spinner spin"></i> Sending Code...';
    }

    try {
      const res = await window.apiClient.post("/api/auth/forgot-password", {
        identifier: identifier
      });

      if (res && res.success) {
        this.pendingResetIdentifier = identifier;
        this.pendingResetCode = res.reset_code || "";
        if (window.app) {
          window.app.showToast(`Verification code generated: ${this.pendingResetCode || "Check details"} 🔑`);
          window.app.playSound('ding');
        }
        this.switchView('reset');
      } else {
        throw new Error(res.detail || "Account not found");
      }
    } catch (err) {
      if (window.app) {
        window.app.showToast(`Forgot password error: ${err.message || "Account not found"} ❌`);
        window.app.playSound('pop');
      }
    } finally {
      this.isLoading = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-bold ph-paper-plane-right"></i> Send Reset Code';
      }
    }
  }

  async handleResetPassword(event) {
    event.preventDefault();
    if (this.isLoading) return;

    const identInput = document.getElementById("reset-identifier");
    const codeInput = document.getElementById("reset-code");
    const newPwdInput = document.getElementById("reset-new-password");
    const confirmPwdInput = document.getElementById("reset-confirm-password");
    const submitBtn = event.target.querySelector("button[type='submit']");

    const identifier = identInput ? identInput.value.trim() : this.pendingResetIdentifier;
    const code = codeInput ? codeInput.value.trim() : "";
    const newPassword = newPwdInput ? newPwdInput.value : "";
    const confirmPassword = confirmPwdInput ? confirmPwdInput.value : "";

    if (!identifier || !code || !newPassword) {
      if (window.app) window.app.showToast("Please fill in all fields! ⚠️");
      return;
    }

    if (newPassword.length < 6) {
      if (window.app) window.app.showToast("New password must be at least 6 characters long! ⚠️");
      return;
    }

    if (newPassword !== confirmPassword) {
      if (window.app) window.app.showToast("Passwords do not match! Please check. ⚠️");
      return;
    }

    this.isLoading = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph-bold ph-spinner spin"></i> Resetting Password...';
    }

    try {
      const res = await window.apiClient.post("/api/auth/reset-password", {
        identifier: identifier,
        reset_code: code,
        new_password: newPassword
      });

      if (res && res.success) {
        if (window.app) {
          window.app.showToast("Password updated successfully! Please sign in. 🎉");
          window.app.playSound('ding');
        }
        this.pendingResetIdentifier = "";
        this.pendingResetCode = "";
        this.switchView('login');
      } else {
        throw new Error(res.detail || "Reset failed");
      }
    } catch (err) {
      if (window.app) {
        window.app.showToast(`Reset failed: ${err.message || "Invalid code"} ❌`);
        window.app.playSound('pop');
      }
    } finally {
      this.isLoading = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph-bold ph-check-circle"></i> Update Password & Sign In';
      }
    }
  }

  async logout() {
    try {
      await window.apiClient.post("/api/auth/logout");
    } catch (e) {}

    if (window.apiClient) window.apiClient.clearToken();
    this.currentUser = null;

    if (window.omniStore) {
      window.omniStore.data.currentUser = null;
      window.omniStore.save();
    }

    this.updateUserBadgeInUI();
    if (window.app) {
      window.app.showToast("You have been signed out. 👋");
      window.app.playSound('pop');
    }
    this.openAuth("login");
  }

  onAuthSuccess(user, notify = true) {
    if (window.omniStore) {
      window.omniStore.data.currentUser = user;
      window.omniStore.save();
    }

    this.closeAuth();
    this.updateUserBadgeInUI();

    if (window.feedModule && typeof window.feedModule.renderPosts === "function") {
      window.feedModule.renderPosts();
    }
    if (window.profileModule && typeof window.profileModule.renderProfile === "function") {
      window.profileModule.renderProfile();
    }
    if (window.storiesModule && typeof window.storiesModule.renderTray === "function") {
      window.storiesModule.renderTray();
    }

    if (notify && window.app) {
      window.app.showToast(`Welcome to Pluxy, ${user.displayName}! 🎉`);
      window.app.playSound('ding');
    }
  }

  updateUserBadgeInUI() {
    const badge = document.getElementById("header-user-avatar");
    if (badge && this.currentUser) {
      badge.src = this.currentUser.avatar || "assets/pluxy-icon.png";
    }
  }

  togglePasswordVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (el) {
      el.type = el.type === "password" ? "text" : "password";
    }
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
            <input type="text" id="login-identifier" class="auth-input" placeholder="Enter username, phone or email" required />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="margin-bottom: 0;"><i class="ph-bold ph-lock-key"></i> Password</label>
              <a href="javascript:void(0)" class="auth-link-forgot" onclick="window.authModule.switchView('forgot')">Forgot Password?</a>
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
            <label><i class="ph-bold ph-identification-card"></i> Your Full Name</label>
            <input type="text" id="reg-fullname" class="auth-input" placeholder="Enter your full name" required />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label><i class="ph-bold ph-at"></i> Username</label>
              <input type="text" id="reg-username" class="auth-input" placeholder="e.g. ankit_99" required />
            </div>
            <div class="form-group">
              <label><i class="ph-bold ph-phone"></i> Mobile Phone</label>
              <input type="tel" id="reg-phone" class="auth-input" placeholder="Mobile Number" />
            </div>
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-envelope"></i> Email Address</label>
            <input type="email" id="reg-email" class="auth-input" placeholder="name@example.com" />
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-lock-key"></i> Create Password (min 6 chars)</label>
            <div class="input-password-wrap">
              <input type="password" id="reg-password" class="auth-input" placeholder="Create a strong password" minlength="6" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('reg-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-lock-key-open"></i> Confirm Password</label>
            <div class="input-password-wrap">
              <input type="password" id="reg-confirm-password" class="auth-input" placeholder="Re-enter password" minlength="6" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('reg-confirm-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-user-plus"></i> Create Account & Join
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
          <h2 class="auth-title">Forgot Password</h2>
          <p class="auth-subtitle">Recover access to your Pluxy account</p>
        </div>

        <form class="auth-form" onsubmit="window.authModule.handleForgotPassword(event)">
          <div class="form-group">
            <label><i class="ph-bold ph-user-circle"></i> Username, Phone or Email</label>
            <input type="text" id="forgot-identifier" class="auth-input" placeholder="Enter your registered detail" value="${this.pendingResetIdentifier || ''}" required />
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-paper-plane-right"></i> Send Reset Code
          </button>

          <div class="auth-footer-text">
            Remembered your password? <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('login')">Back to Sign In</a>
          </div>
        </form>
      `;
    } else if (this.currentView === "reset") {
      container.innerHTML = `
        <div class="auth-header-box">
          <img src="assets/pluxy-icon.png" class="auth-brand-logo" alt="Pluxy" />
          <h2 class="auth-title">Reset Password</h2>
          <p class="auth-subtitle">Enter your verification code and new password</p>
        </div>

        ${this.pendingResetCode ? `
          <div class="auth-code-pill">
            <span>Your Verification Code:</span>
            <strong class="auth-code-value">${this.pendingResetCode}</strong>
          </div>
        ` : ''}

        <form class="auth-form" onsubmit="window.authModule.handleResetPassword(event)">
          <div class="form-group">
            <label><i class="ph-bold ph-user"></i> Account (Username, Email or Phone)</label>
            <input type="text" id="reset-identifier" class="auth-input" value="${this.pendingResetIdentifier || ''}" required />
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-shield-check"></i> 6-Digit Verification Code</label>
            <input type="text" id="reset-code" class="auth-input" placeholder="Enter 6-digit code" value="${this.pendingResetCode || ''}" required />
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-lock-key"></i> New Password (min 6 chars)</label>
            <div class="input-password-wrap">
              <input type="password" id="reset-new-password" class="auth-input" placeholder="Enter new password" minlength="6" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('reset-new-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label><i class="ph-bold ph-lock-key-open"></i> Confirm New Password</label>
            <div class="input-password-wrap">
              <input type="password" id="reset-confirm-password" class="auth-input" placeholder="Confirm new password" minlength="6" required />
              <button type="button" class="btn-toggle-pw" onclick="window.authModule.togglePasswordVisibility('reset-confirm-password')">
                <i class="ph-bold ph-eye"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-auth-primary">
            <i class="ph-bold ph-check-circle"></i> Update Password & Sign In
          </button>

          <div class="auth-footer-text">
            <a href="javascript:void(0)" class="auth-link-bold" onclick="window.authModule.switchView('login')">Cancel & Sign In</a>
          </div>
        </form>
      `;
    }
  }
}

window.authModule = new AuthModule();
