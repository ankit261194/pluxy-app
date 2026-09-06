// OmniSphere Main Application Controller
class OmniApp {
  constructor() {
    this.currentTab = "feed";
    this.audioCtx = null;
    this.activePostId = null;
  }

  init() {
    // Initialize Web Audio Context on first interaction
    document.addEventListener("click", () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
    }, { once: true });

    // Initialize Modules safely
    const modulesToInit = [
      { name: "feed", mod: window.feedModule },
      { name: "stories", mod: window.storiesModule },
      { name: "snaps", mod: window.snapsModule },
      { name: "chat", mod: window.chatModule },
      { name: "camera", mod: window.cameraModule },
      { name: "ai", mod: window.aiModule },
      { name: "profile", mod: window.profileModule },
      { name: "calling", mod: window.callingModule },
      { name: "reels", mod: window.reelsModule },
      { name: "explore", mod: window.exploreModule },
      { name: "snapMap", mod: window.snapMapModule },
      { name: "aiVision", mod: window.aiVisionModule },
      { name: "auth", mod: window.authModule },
      { name: "creatorStudio", mod: window.creatorStudioModule },
      { name: "admin", mod: window.adminModule }
    ];

    modulesToInit.forEach(({ name, mod }) => {
      if (mod && typeof mod.init === "function") {
        try {
          mod.init();
        } catch (err) {
          console.error(`[Pluxy] Error initializing module '${name}':`, err);
        }
      }
    });

    this.setupNavigation();
    this.setupGlobalModals();
    this.startClock();
    this.setupFrameToggle();
    this.setupServiceWorker();

    console.log("🚀 Pluxy Super-App initialized successfully!");
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
          console.log('✅ Pluxy PWA Service Worker active:', reg.scope);
        }).catch(err => {
          console.warn('Service Worker registration:', err);
        });
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.classList.add("visible");
    });
  }

  triggerPwaInstall() {
    if (window.deferredPwaPrompt) {
      window.deferredPwaPrompt.prompt();
      window.deferredPwaPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          window.app.showToast("Pluxy installed to your Home Screen! 📲🎉");
        }
        window.deferredPwaPrompt = null;
      });
    } else {
      window.location.href = "download.html";
    }
  }

  setupNavigation() {
    // Bottom Nav Items
    const navItems = document.querySelectorAll(".bottom-nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });

    // Sub Navigation Shortcut Pills
    const pills = document.querySelectorAll(".sub-nav-shortcuts .shortcut-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = pill.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    if (!tabName) return;

    // Handle camera lifecycle
    if (tabName === "camera") {
      if (window.cameraModule && typeof window.cameraModule.startCamera === "function") {
        window.cameraModule.startCamera();
      }
    } else if (this.currentTab === "camera" && tabName !== "camera") {
      if (window.cameraModule && typeof window.cameraModule.stopCamera === "function") {
        window.cameraModule.stopCamera();
      }
    }

    // Handle reels lifecycle
    if (tabName === "reels") {
      if (window.reelsModule) {
        if (typeof window.reelsModule.resumePlayback === "function") {
          window.reelsModule.resumePlayback();
        } else if (typeof window.reelsModule.renderReels === "function") {
          window.reelsModule.renderReels();
        }
      }
    } else if (this.currentTab === "reels" && tabName !== "reels") {
      if (window.reelsModule && typeof window.reelsModule.stopPlayback === "function") {
        window.reelsModule.stopPlayback();
      }
    }

    // Handle profile refresh when navigating to profile
    if (tabName === "profile") {
      if (window.profileModule && typeof window.profileModule.renderProfile === "function") {
        window.profileModule.renderProfile();
      }
    }

    // Handle Creator Studio screen
    if (tabName === "creator-studio") {
      if (window.creatorStudioModule && typeof window.creatorStudioModule.renderCreatorStudioScreen === "function") {
        window.creatorStudioModule.renderCreatorStudioScreen();
      }
    }

    this.currentTab = tabName;

    // Update bottom nav active state
    document.querySelectorAll(".bottom-nav-item").forEach(item => {
      if (item.getAttribute("data-tab") === tabName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update shortcut pills active state
    document.querySelectorAll(".sub-nav-shortcuts .shortcut-pill").forEach(pill => {
      if (pill.getAttribute("data-tab") === tabName) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });

    // Update main views
    document.querySelectorAll(".app-screen-view").forEach(view => {
      if (view.id === `view-${tabName}`) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });

    // Scroll screen container back to top
    const screenContainer = document.querySelector(".app-screen-container");
    if (screenContainer) {
      screenContainer.scrollTop = 0;
    }

    // Update Header title / action
    const headerTitle = document.getElementById("header-app-title");
    if (headerTitle) {
      const config = window.omniStore ? window.omniStore.getAppConfig() : null;
      const appName = config ? config.appName : "Pluxy";
      const logo = '<img src="assets/pluxy-icon.png" class="pluxy-header-logo" alt="Pluxy" />';
      if (tabName === "feed") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag">Feed</span>`;
      else if (tabName === "chats") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag green">WhatsApp</span>`;
      else if (tabName === "snaps") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag yellow">Snapchat</span>`;
      else if (tabName === "camera") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag">AR Camera</span>`;
      else if (tabName === "reels") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag red">Reels</span>`;
      else if (tabName === "explore") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag">Explore</span>`;
      else if (tabName === "snapmap") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag yellow">Snap Map</span>`;
      else if (tabName === "ai") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag purple">Gemini AI</span>`;
      else if (tabName === "profile") headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag cyan">Profile</span>`;
      else if (tabName.startsWith("srv_")) {
        const services = window.omniStore ? window.omniStore.getCustomServices() : [];
        const srv = services.find(s => s.id === tabName);
        const srvName = srv ? srv.name : "Service";
        headerTitle.innerHTML = `${logo} ${appName} <span class="header-tag purple">${srvName}</span>`;
      }
    }

    this.playSound('pop');
  }

  viewProfile(userId) {
    this.switchTab("profile");
  }

  setupGlobalModals() {
    // Comments modal
    const closeComments = document.getElementById("btn-close-comments");
    if (closeComments) {
      closeComments.onclick = () => {
        document.getElementById("comments-modal").classList.remove("active");
      };
    }

    const commentSubmit = document.getElementById("btn-submit-comment");
    const commentInput = document.getElementById("comment-input-text");
    if (commentSubmit && commentInput) {
      commentSubmit.onclick = () => {
        const text = commentInput.value.trim();
        if (text && this.activePostId) {
          window.omniStore.addComment(this.activePostId, text);
          window.feedModule.openComments(this.activePostId);
          window.feedModule.renderPosts();
          commentInput.value = "";
          this.playSound('sent');
        }
      };
    }

    // Post Creator Modal
    const createPostTrigger = document.getElementById("btn-trigger-create-post");
    const modal = document.getElementById("create-post-modal");
    const closeCreate = document.getElementById("btn-close-create-post");

    if (createPostTrigger && modal) {
      createPostTrigger.onclick = () => modal.classList.add("active");
    }
    if (closeCreate && modal) {
      closeCreate.onclick = () => modal.classList.remove("active");
    }
  }

  showToast(message) {
    const toast = document.getElementById("app-toast");
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  startClock() {
    const clock = document.getElementById("status-bar-clock");
    const updateTime = () => {
      if (clock) {
        const d = new Date();
        clock.innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    };
    updateTime();
    setInterval(updateTime, 10000);
  }

  setupFrameToggle() {
    const toggleBtn = document.getElementById("btn-toggle-device-frame");
    const wrapper = document.getElementById("device-frame-wrapper");
    if (toggleBtn && wrapper) {
      toggleBtn.onclick = () => {
        if (wrapper.classList.contains("frame-mode")) {
          wrapper.classList.remove("frame-mode");
          toggleBtn.innerHTML = '<i class="ph-bold ph-device-mobile"></i> Phone Frame';
        } else {
          wrapper.classList.add("frame-mode");
          toggleBtn.innerHTML = '<i class="ph-bold ph-arrows-out-simple"></i> Full View';
        }
      };
    }
  }

  // Synthesized Native Sound FX using Web Audio API (Zero latency, no files required)
  playSound(type) {
    try {
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'pop') {
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'like') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'sent') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.09);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'ding') {
        osc.frequency.setValueAtTime(1050, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'shutter') {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'whoosh') {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }
}

window.app = new OmniApp();
window.addEventListener("DOMContentLoaded", () => window.app.init());
