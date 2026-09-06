// Instagram Reels / Shorts Video Module - Pluxy Super-App
// Full Reels Studio: Live Camera Viewfinder, Trending Audio Synthesizer, Real-Time Video Filters, and Publishing

class ReelsModule {
  constructor() {
    this.container = document.getElementById("reels-feed-container");
    this.currentIndex = 0;
    this.isPlaying = true;
    this.isMuted = false;
    this.progressTimer = null;

    // Reels Studio State
    this.cameraStream = null;
    this.facingMode = "user";
    this.currentFilter = "none";
    this.selectedAudio = null;
    this.previewAudioPlaying = false;
    this.audioContext = null;
    this.synthOscillators = [];
    this.isRecording = false;
    this.recordTimer = null;
    this.recordSeconds = 0;
    this.maxRecordSeconds = 15;
    this.recordedMediaUrl = null;
    this.activeSourceTab = "camera";

    // 10+ Curated Viral Trending Songs with Real Melodic Frequencies
    this.trendingAudioList = [
      {
        id: "lover_diljit",
        title: "Lover",
        artist: "Diljit Dosanjh",
        genre: "Punjabi Pop 🔥",
        duration: "0:30",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80",
        notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00], // C5, D5, E5, G5...
        tempo: 130
      },
      {
        id: "tauba_aujla",
        title: "Tauba Tauba",
        artist: "Karan Aujla",
        genre: "Desi Hip Hop ⚡",
        duration: "0:25",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
        notes: [440.00, 440.00, 493.88, 523.25, 587.33, 523.25, 493.88, 440.00],
        tempo: 140
      },
      {
        id: "kesariya_arijit",
        title: "Kesariya (Brahmastra)",
        artist: "Arijit Singh",
        genre: "Romantic Soul 🧡",
        duration: "0:32",
        cover: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=120&auto=format&fit=crop&q=80",
        notes: [392.00, 440.00, 493.88, 587.33, 523.25, 493.88, 440.00, 392.00],
        tempo: 100
      },
      {
        id: "maan_king",
        title: "Maan Meri Jaan",
        artist: "King",
        genre: "Chill Indie 🌙",
        duration: "0:28",
        cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=120&auto=format&fit=crop&q=80",
        notes: [329.63, 392.00, 440.00, 493.88, 440.00, 392.00, 349.23, 329.63],
        tempo: 110
      },
      {
        id: "calm_down_rema",
        title: "Calm Down",
        artist: "Rema & Selena",
        genre: "Afro Pop 🌴",
        duration: "0:30",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&auto=format&fit=crop&q=80",
        notes: [587.33, 523.25, 440.00, 392.00, 440.00, 523.25, 587.33, 659.25],
        tempo: 125
      },
      {
        id: "starboy_weeknd",
        title: "Starboy",
        artist: "The Weeknd",
        genre: "Synthwave 🕶️",
        duration: "0:27",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&auto=format&fit=crop&q=80",
        notes: [261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 261.63],
        tempo: 186
      },
      {
        id: "apna_bana_le",
        title: "Apna Bana Le",
        artist: "Arijit Singh",
        genre: "Bollywood Melody ✨",
        duration: "0:35",
        cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&auto=format&fit=crop&q=80",
        notes: [349.23, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00],
        tempo: 95
      },
      {
        id: "brown_munde",
        title: "Brown Munde",
        artist: "AP Dhillon & Gurinder",
        genre: "Urban Punjabi 👑",
        duration: "0:26",
        cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=120&auto=format&fit=crop&q=80",
        notes: [220.00, 261.63, 293.66, 329.63, 293.66, 261.63, 220.00, 196.00],
        tempo: 135
      },
      {
        id: "levitating_dua",
        title: "Levitating",
        artist: "Dua Lipa",
        genre: "Retro Disco 🪩",
        duration: "0:29",
        cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&auto=format&fit=crop&q=80",
        notes: [493.88, 587.33, 659.25, 739.99, 659.25, 587.33, 493.88, 440.00],
        tempo: 124
      },
      {
        id: "illuminati_dabzee",
        title: "Illuminati (Aavesham)",
        artist: "Sushin Shyam & Dabzee",
        genre: "Banger Club 💥",
        duration: "0:31",
        cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&auto=format&fit=crop&q=80",
        notes: [392.00, 415.30, 466.16, 523.25, 466.16, 415.30, 392.00, 349.23],
        tempo: 132
      }
    ];

    // 4K Trending Video/Photo Templates
    this.templatesList = [
      {
        id: "tpl_cyber",
        title: "Cyber City Night",
        tag: "Tech Aesthetic",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "tpl_sunset",
        title: "Golden Hour Waves",
        tag: "Nature & Chill",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "tpl_drive",
        title: "Midnight Highway Drive",
        tag: "Cinematic Mood",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "tpl_concert",
        title: "Neon Concert Glow",
        tag: "Party & Beats",
        url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "tpl_anime",
        title: "Tokyo Cherry Blossom",
        tag: "Pastel Dream",
        url: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "tpl_vibe",
        title: "Urban Streetstyle",
        tag: "Outfit of the Day",
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
      }
    ];

    this.selectedAudio = this.trendingAudioList[0];
  }

  init() {
    this.renderReels();
    this.setupTouchAndWheelNavigation();
    this.setupCreateReelModal();
  }

  renderReels() {
    const reels = window.omniStore.getReels();
    if (!this.container || !reels.length) return;

    if (this.currentIndex >= reels.length) this.currentIndex = 0;
    if (this.currentIndex < 0) this.currentIndex = reels.length - 1;

    const currentReel = reels[this.currentIndex];

    this.container.innerHTML = `
      <!-- Top Reels Header Controls -->
      <div class="reels-top-header">
        <span class="reels-brand-title">Reels</span>
        <div class="reels-top-actions">
          <button class="btn-creator-fund-top" onclick="window.creatorStudioModule ? window.creatorStudioModule.openCreatorStudio() : window.app.showToast('Opening Creator Fund...')" title="Reels Creator Fund & Monetization">
            <i class="ph-bold ph-wallet"></i> Creator Fund ₹
          </button>
          <button class="btn-create-reel-top" onclick="window.reelsModule.openCreateReelModal()" title="Open Reels Creator Studio">
            <i class="ph-bold ph-plus-circle"></i> Create Reel
          </button>
          <button class="reels-sound-btn ${this.isMuted ? 'muted' : ''}" onclick="window.reelsModule.toggleSound()">
            <i class="ph-bold ${this.isMuted ? 'ph-speaker-simple-slash' : 'ph-speaker-simple-high'}"></i>
          </button>
        </div>
      </div>

      <!-- Main Active Reel Container -->
      <div class="reel-slide active" data-reel-id="${currentReel.id}">
        <!-- Reel Background Visual / Media -->
        <div class="reel-media-wrapper" 
             onclick="window.reelsModule.togglePlayPause(event)"
             ondblclick="window.reelsModule.handleDoubleTap('${currentReel.id}', this, event)">
          <img src="${currentReel.videoUrl}" alt="Reel Video" class="reel-media-img" />
          <div class="reel-gradient-overlay"></div>
          
          <!-- Play / Pause Center Flash Indicator -->
          <div class="reel-play-indicator" id="reel-play-indicator">
            <i class="ph-fill ph-play"></i>
          </div>

          <!-- Double Tap Heart Burst -->
          <div class="heart-burst"><i class="ph-fill ph-heart"></i></div>

          <!-- Bottom Live Playback Progress Bar -->
          <div class="reel-progress-track">
            <div class="reel-progress-fill" id="reel-progress-bar"></div>
          </div>
        </div>

        <!-- Creator & Caption Overlay -->
        <div class="reel-content-overlay">
          <div class="reel-author-row">
            <img src="${currentReel.author.avatar}" alt="${currentReel.author.username}" class="reel-avatar" />
            <span class="reel-username">@${currentReel.author.username}</span>
            <button class="btn-reel-follow" onclick="this.innerText = this.innerText === 'Follow' ? 'Following' : 'Follow'; window.app.playSound('ding');">
              Follow
            </button>
          </div>

          <p class="reel-caption">${currentReel.caption}</p>

          <!-- Audio Track Ticker -->
          <div class="reel-audio-ticker">
            <i class="ph-bold ph-music-notes"></i>
            <span class="ticker-text">${currentReel.audioTrack}</span>
          </div>
        </div>

        <!-- Right Side Action Bar -->
        <div class="reel-actions-column">
          <button class="reel-action-btn ${currentReel.isLiked ? 'liked' : ''}" onclick="window.reelsModule.toggleLike('${currentReel.id}')">
            <i class="ph-fill ph-heart"></i>
            <span>${currentReel.likes.toLocaleString()}</span>
          </button>
          <button class="reel-action-btn" onclick="window.reelsModule.openReelComments('${currentReel.id}')">
            <i class="ph-bold ph-chat-circle"></i>
            <span>${currentReel.commentsCount || 0}</span>
          </button>
          <button class="reel-action-btn gift-action-btn" onclick="window.reelsModule.openGiftModal('${currentReel.id}')" title="Send Fan Gift / Tip Cash to Creator 🎁">
            <i class="ph-bold ph-gift" style="color: #FBBF24;"></i>
            <span style="color: #FBBF24; font-weight: 700;">Gift ₹</span>
          </button>
          <button class="reel-action-btn" onclick="window.reelsModule.shareReel('${currentReel.id}')">
            <i class="ph-bold ph-paper-plane-tilt"></i>
            <span>Share</span>
          </button>
          <button class="reel-action-btn" onclick="this.classList.toggle('saved'); window.app.showToast('Reel saved to collection! 🔖'); window.app.playSound('ding');">
            <i class="ph-bold ph-bookmark-simple"></i>
            <span>Save</span>
          </button>
          <div class="spinning-vinyl-disc ${this.isPlaying ? 'spinning' : ''}">
            <div class="vinyl-center-dot"></div>
          </div>
        </div>

        <!-- Vertical Navigation Arrows (Up / Down) -->
        <div class="reels-nav-arrows">
          <button class="reel-nav-btn up" onclick="window.reelsModule.prevReel()" title="Previous Reel">
            <i class="ph-bold ph-caret-up"></i>
          </button>
          <div class="reel-counter-pill">${this.currentIndex + 1} / ${reels.length}</div>
          <button class="reel-nav-btn down" onclick="window.reelsModule.nextReel()" title="Next Reel">
            <i class="ph-bold ph-caret-down"></i>
          </button>
        </div>
      </div>
    `;

    this.startPlaybackProgress();
    this.playReelRhythm();
  }

  startPlaybackProgress() {
    if (this.progressTimer) clearInterval(this.progressTimer);
    const progressBar = document.getElementById("reel-progress-bar");
    if (!progressBar) return;

    let progress = 0;
    progressBar.style.width = "0%";

    this.progressTimer = setInterval(() => {
      if (this.isPlaying) {
        progress += 0.8;
        if (progress >= 100) {
          progress = 0;
          this.nextReel();
        } else {
          progressBar.style.width = `${progress}%`;
        }
      }
    }, 100);
  }

  stopPlayback() {
    if (this.progressTimer) clearInterval(this.progressTimer);
  }

  togglePlayPause(e) {
    if (e) e.stopPropagation();
    this.isPlaying = !this.isPlaying;
    const indicator = document.getElementById("reel-play-indicator");
    const vinyl = document.querySelector(".spinning-vinyl-disc");

    if (indicator) {
      indicator.innerHTML = this.isPlaying ? '<i class="ph-fill ph-play"></i>' : '<i class="ph-fill ph-pause"></i>';
      indicator.classList.add("flash");
      setTimeout(() => indicator.classList.remove("flash"), 400);
    }
    if (vinyl) {
      if (this.isPlaying) vinyl.classList.add("spinning");
      else vinyl.classList.remove("spinning");
    }
    window.app.playSound('pop');
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    const btn = document.querySelector(".reels-sound-btn");
    if (btn) {
      btn.className = `reels-sound-btn ${this.isMuted ? 'muted' : ''}`;
      btn.innerHTML = `<i class="ph-bold ${this.isMuted ? 'ph-speaker-simple-slash' : 'ph-speaker-simple-high'}"></i>`;
    }
    window.app.showToast(this.isMuted ? "Sound muted 🔇" : "Sound unmuted 🔊");
    window.app.playSound('ding');
  }

  toggleLike(reelId) {
    const reel = window.omniStore.getReels().find(r => r.id === reelId);
    if (!reel) return;

    reel.isLiked = !reel.isLiked;
    reel.likes += reel.isLiked ? 1 : -1;

    const btn = document.querySelector(`.reel-action-btn[onclick*="${reelId}"]`);
    if (btn) {
      btn.classList.toggle("liked", reel.isLiked);
      const span = btn.querySelector("span");
      if (span) span.innerText = reel.likes.toLocaleString();
    }
    window.app.playSound('like');
  }

  handleDoubleTap(reelId, wrapper, event) {
    this.toggleLike(reelId);
    const burst = wrapper.querySelector(".heart-burst");
    if (burst) {
      burst.classList.add("animate");
      setTimeout(() => burst.classList.remove("animate"), 800);
    }
  }

  playReelRhythm() {
    if (this.isMuted || !this.isPlaying) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioContext) this.audioContext = new AudioContext();
      if (this.audioContext.state === "suspended") this.audioContext.resume();

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, this.audioContext.currentTime);
      gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.3);
    } catch(e) {}
  }

  nextReel() {
    const reels = window.omniStore.getReels();
    this.currentIndex = (this.currentIndex + 1) % reels.length;
    this.renderReels();
    window.app.playSound('pop');
  }

  prevReel() {
    const reels = window.omniStore.getReels();
    this.currentIndex = (this.currentIndex - 1 + reels.length) % reels.length;
    this.renderReels();
    window.app.playSound('pop');
  }

  openReelComments(reelId) {
    if (window.feedModule && typeof window.feedModule.openComments === "function") {
      window.feedModule.openComments("post_ankit_launch");
    } else {
      window.app.showToast("Comments open for Reel #trending 💬");
    }
  }

  shareReel(reelId) {
    const reel = window.omniStore.getReels().find(r => r.id === reelId);
    const author = reel ? reel.author.username : "Pluxy Creator";
    window.app.showToast(`Reel by @${author} shared to your Story & WhatsApp! 🚀`);
    window.app.playSound('sent');
  }

  setupTouchAndWheelNavigation() {
    if (!this.container) return;
    let startY = 0;

    this.container.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    this.container.addEventListener("touchend", (e) => {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      if (diff > 50) {
        this.nextReel();
      } else if (diff < -50) {
        this.prevReel();
      }
    }, { passive: true });

    let wheelThrottle = false;
    this.container.addEventListener("wheel", (e) => {
      if (wheelThrottle) return;
      wheelThrottle = true;
      if (e.deltaY > 30) {
        this.nextReel();
      } else if (e.deltaY < -30) {
        this.prevReel();
      }
      setTimeout(() => { wheelThrottle = false; }, 400);
    }, { passive: true });
  }

  // ==========================================
  // REELS CREATOR STUDIO ("Create Reel" Feature)
  // ==========================================

  openCreateReelModal() {
    const modal = document.getElementById("create-reel-modal");
    if (!modal) return;
    modal.classList.add("active");

    // Initialize Viewfinder & Audio list
    this.renderAudioLibrary();
    this.renderTemplatesCarousel();
    this.switchSourceTab("camera");
    this.startStudioCamera();

    // Default active sound label
    this.updateActiveSoundPill();

    window.app.playSound('pop');
  }

  closeCreateReelModal() {
    const modal = document.getElementById("create-reel-modal");
    if (modal) modal.classList.remove("active");

    this.stopStudioCamera();
    this.stopAudioPreview();
    if (this.isRecording) {
      this.stopRecording();
    }
  }

  setupCreateReelModal() {
    const closeBtn = document.getElementById("btn-close-create-reel");
    if (closeBtn) {
      closeBtn.onclick = () => this.closeCreateReelModal();
    }

    const publishBtn = document.getElementById("btn-publish-reel");
    if (publishBtn) {
      publishBtn.onclick = () => this.publishReel();
    }

    // AI Viral Caption button
    const aiBtn = document.getElementById("btn-reel-ai-caption");
    if (aiBtn) {
      aiBtn.onclick = async () => {
        aiBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Writing...';
        const topicInput = document.getElementById("reel-topic-input");
        const topic = (topicInput && topicInput.value.trim()) || "viral trending reels vibe";
        const captionInput = document.getElementById("reel-caption-input");

        try {
          if (window.geminiService && typeof window.geminiService.generatePostCaption === "function") {
            const generated = await window.geminiService.generatePostCaption(topic, "viral short reel");
            if (captionInput) captionInput.value = generated;
          } else {
            if (captionInput) captionInput.value = `Unstoppable energy & late night vibes 🔥✨ #trending #pluxy #reels #viral #creator`;
          }
        } catch(e) {
          if (captionInput) captionInput.value = `Chasing dreams, one reel at a time 🌟🚀 #viral #reels #foryou`;
        }

        aiBtn.innerHTML = '<i class="ph-bold ph-sparkle"></i> ✨ AI Caption';
        window.app.playSound('ding');
      };
    }
  }

  // Camera Management in Reels Studio
  async startStudioCamera() {
    const video = document.getElementById("reel-camera-preview");
    const templateImg = document.getElementById("reel-template-preview");
    if (templateImg) templateImg.classList.add("hidden");
    if (video) video.classList.remove("hidden");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.useProceduralViewfinder();
      return;
    }

    try {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(t => t.stop());
      }

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: false
      });

      if (video) {
        video.srcObject = this.cameraStream;
        await video.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Reel Studio Camera access denied/unavailable, fallback to procedural viewfinder:", err);
      this.useProceduralViewfinder();
    }
  }

  stopStudioCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
    const video = document.getElementById("reel-camera-preview");
    if (video) {
      video.srcObject = null;
    }
  }

  flipReelCamera() {
    this.facingMode = this.facingMode === "user" ? "environment" : "user";
    this.startStudioCamera();
    window.app.showToast(this.facingMode === "user" ? "Front Selfie Camera 🤳" : "Rear Main Camera 📷");
    window.app.playSound('ding');
  }

  useProceduralViewfinder() {
    const video = document.getElementById("reel-camera-preview");
    const templateImg = document.getElementById("reel-template-preview");
    if (video) video.classList.add("hidden");
    if (templateImg) {
      templateImg.classList.remove("hidden");
      templateImg.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
    }
    this.recordedMediaUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
  }

  // Source Tabs: Camera / Templates / Upload
  switchSourceTab(tab) {
    this.activeSourceTab = tab;
    document.querySelectorAll(".reel-source-tab").forEach(t => t.classList.remove("active"));
    const activeBtn = document.getElementById(`tab-reel-${tab}`);
    if (activeBtn) activeBtn.classList.add("active");

    const tplSection = document.getElementById("studio-templates-section");
    const video = document.getElementById("reel-camera-preview");
    const templateImg = document.getElementById("reel-template-preview");

    if (tab === "camera") {
      if (tplSection) tplSection.classList.add("hidden");
      this.startStudioCamera();
    } else if (tab === "templates") {
      if (tplSection) tplSection.classList.remove("hidden");
      this.stopStudioCamera();
      if (video) video.classList.add("hidden");
      if (templateImg) {
        templateImg.classList.remove("hidden");
        templateImg.src = this.templatesList[0].url;
        this.recordedMediaUrl = this.templatesList[0].url;
      }
    }
    window.app.playSound('pop');
  }

  renderTemplatesCarousel() {
    const container = document.getElementById("reels-templates-carousel");
    if (!container) return;

    container.innerHTML = this.templatesList.map((tpl, i) => `
      <div class="reel-template-card ${i === 0 ? 'selected' : ''}" onclick="window.reelsModule.selectTemplate('${tpl.id}', this)">
        <img src="${tpl.url}" alt="${tpl.title}" class="template-thumb" />
        <div class="template-info">
          <span class="template-title">${tpl.title}</span>
          <span class="template-tag">${tpl.tag}</span>
        </div>
      </div>
    `).join("");
  }

  selectTemplate(tplId, el) {
    const tpl = this.templatesList.find(t => t.id === tplId);
    if (!tpl) return;

    document.querySelectorAll(".reel-template-card").forEach(c => c.classList.remove("selected"));
    if (el) el.classList.add("selected");

    const templateImg = document.getElementById("reel-template-preview");
    if (templateImg) {
      templateImg.src = tpl.url;
      templateImg.classList.remove("hidden");
    }
    const video = document.getElementById("reel-camera-preview");
    if (video) video.classList.add("hidden");

    this.recordedMediaUrl = tpl.url;
    window.app.showToast(`Template selected: ${tpl.title} ✨`);
    window.app.playSound('ding');
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.recordedMediaUrl = dataUrl;

      const templateImg = document.getElementById("reel-template-preview");
      const video = document.getElementById("reel-camera-preview");
      if (video) video.classList.add("hidden");
      if (templateImg) {
        templateImg.src = dataUrl;
        templateImg.classList.remove("hidden");
      }

      window.app.showToast("Media uploaded to Reels Studio! 🎥✨");
      window.app.playSound('sent');
    };
    reader.readAsDataURL(file);
  }

  // ==========================================
  // VIDEO FILTERS & EFFECTS ("Filter aa rahe")
  // ==========================================

  setReelFilter(filterKey, label) {
    this.currentFilter = filterKey;
    const overlay = document.getElementById("reel-filter-overlay");
    const video = document.getElementById("reel-camera-preview");
    const templateImg = document.getElementById("reel-template-preview");
    const labelSpan = document.getElementById("studio-active-filter-label");

    if (labelSpan) labelSpan.innerText = label;

    // Reset styles
    const elements = [video, templateImg].filter(Boolean);
    elements.forEach(el => {
      el.style.filter = "none";
    });
    if (overlay) {
      overlay.className = "reel-filter-overlay";
      overlay.style.background = "none";
    }

    // Apply specific visual filter styling
    switch (filterKey) {
      case "golden":
        elements.forEach(el => el.style.filter = "sepia(0.35) saturate(1.8) contrast(1.15) brightness(1.05)");
        if (overlay) overlay.style.background = "linear-gradient(180deg, rgba(255, 180, 0, 0.15), rgba(255, 100, 0, 0.2))";
        break;
      case "cyber":
        elements.forEach(el => el.style.filter = "saturate(2.2) contrast(1.3) hue-rotate(290deg)");
        if (overlay) overlay.style.background = "linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(255, 0, 127, 0.25))";
        break;
      case "vhs":
        elements.forEach(el => el.style.filter = "contrast(1.2) saturate(1.4) brightness(1.1)");
        if (overlay) overlay.className = "reel-filter-overlay vhs-scanlines";
        break;
      case "noir":
        elements.forEach(el => el.style.filter = "grayscale(1) contrast(1.6) brightness(0.95)");
        break;
      case "anime":
        elements.forEach(el => el.style.filter = "saturate(1.7) brightness(1.15) contrast(1.1)");
        if (overlay) overlay.style.background = "linear-gradient(180deg, rgba(255, 182, 193, 0.2), rgba(255, 240, 245, 0.1))";
        break;
      case "glitch":
        elements.forEach(el => el.style.filter = "contrast(1.4) hue-rotate(90deg) saturate(2.0)");
        break;
      case "diamond":
        elements.forEach(el => el.style.filter = "brightness(1.2) contrast(1.25) saturate(1.3)");
        if (overlay) overlay.style.background = "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(138,43,226,0.15) 100%)";
        break;
      default:
        // natural
        break;
    }

    // Update chips UI
    document.querySelectorAll(".reel-filter-chip").forEach(chip => chip.classList.remove("active"));
    const activeChip = Array.from(document.querySelectorAll(".reel-filter-chip")).find(c => c.getAttribute("onclick") && c.getAttribute("onclick").includes(`'${filterKey}'`));
    if (activeChip) activeChip.classList.add("active");

    window.app.playSound('pop');
  }

  // ==========================================
  // TRENDING AUDIO & WEBAUDIO PREVIEWS ("Song aa rahe")
  // ==========================================

  renderAudioLibrary() {
    const container = document.getElementById("reels-audio-carousel");
    if (!container) return;

    container.innerHTML = this.trendingAudioList.map(song => {
      const isSelected = this.selectedAudio && this.selectedAudio.id === song.id;
      const isCurrentlyPlaying = this.previewAudioPlaying && isSelected;

      return `
        <div class="reel-audio-card ${isSelected ? 'selected' : ''}" id="song-card-${song.id}">
          <div class="audio-cover-wrap">
            <img src="${song.cover}" alt="${song.title}" class="audio-cover-img" />
            <button class="audio-play-toggle-btn ${isCurrentlyPlaying ? 'playing' : ''}" 
                    onclick="window.reelsModule.toggleAudioPreview('${song.id}', event)" 
                    title="${isCurrentlyPlaying ? 'Pause' : 'Play Song Preview'}">
              <i class="ph-fill ${isCurrentlyPlaying ? 'ph-pause' : 'ph-play'}"></i>
            </button>
          </div>
          <div class="audio-card-meta" onclick="window.reelsModule.selectAudio('${song.id}')">
            <span class="audio-song-title">${song.title}</span>
            <span class="audio-artist-name">${song.artist}</span>
            <span class="audio-genre-pill">${song.genre}</span>
          </div>
          <button class="audio-use-btn ${isSelected ? 'active' : ''}" onclick="window.reelsModule.selectAudio('${song.id}')">
            ${isSelected ? '✓ Selected' : 'Use Sound'}
          </button>
        </div>
      `;
    }).join("");
  }

  selectAudio(songId) {
    const song = this.trendingAudioList.find(s => s.id === songId);
    if (!song) return;

    this.selectedAudio = song;
    this.updateActiveSoundPill();
    this.renderAudioLibrary();

    window.app.showToast(`Audio selected: "${song.title}" by ${song.artist} 🎵`);
    window.app.playSound('ding');
  }

  updateActiveSoundPill() {
    const soundNameSpan = document.getElementById("studio-sound-name");
    if (soundNameSpan && this.selectedAudio) {
      soundNameSpan.innerText = `${this.selectedAudio.artist} - ${this.selectedAudio.title} 🎵`;
    }
  }

  toggleAudioPreview(songId, event) {
    if (event) event.stopPropagation();

    if (this.previewAudioPlaying && this.selectedAudio && this.selectedAudio.id === songId) {
      this.stopAudioPreview();
      return;
    }

    const song = this.trendingAudioList.find(s => s.id === songId);
    if (!song) return;

    this.selectedAudio = song;
    this.updateActiveSoundPill();
    this.startAudioPreview(song);
  }

  startAudioPreview(song) {
    this.stopAudioPreview();

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === "suspended") this.audioContext.resume();

      this.previewAudioPlaying = true;

      // Create melodic rhythm synthesizer using Web Audio API
      const tempo = song.tempo || 128;
      const noteDuration = 60 / tempo / 2; // eighth note
      const notes = song.notes || [440, 523, 659, 783];

      let noteIndex = 0;
      const playStep = () => {
        if (!this.previewAudioPlaying || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const sub = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        const freq = notes[noteIndex % notes.length];
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        sub.type = "sine";
        sub.frequency.setValueAtTime(freq / 2, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + noteDuration * 0.9);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        sub.start();
        osc.stop(this.audioContext.currentTime + noteDuration);
        sub.stop(this.audioContext.currentTime + noteDuration);

        noteIndex++;
        this.synthTimer = setTimeout(playStep, noteDuration * 1000);
      };

      playStep();

      // Show live audio waveform animation in HUD
      const waveBox = document.getElementById("reel-audio-wave-box");
      if (waveBox) waveBox.classList.remove("hidden");

      this.renderAudioLibrary();
      window.app.showToast(`Playing preview: ${song.title} 🎶`);
    } catch (e) {
      console.warn("Audio preview error:", e);
    }
  }

  stopAudioPreview() {
    this.previewAudioPlaying = false;
    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch(e) {}
      this.audioContext = null;
    }
    const waveBox = document.getElementById("reel-audio-wave-box");
    if (waveBox) waveBox.classList.add("hidden");

    this.renderAudioLibrary();
  }

  // ==========================================
  // REEL RECORDING (15-second counter & capture)
  // ==========================================

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    this.isRecording = true;
    this.recordSeconds = 0;

    const recordCore = document.getElementById("reel-record-btn-core");
    const progressFill = document.getElementById("reel-record-progress-bar");
    const timeBadge = document.getElementById("reel-record-time-badge");

    if (recordCore) recordCore.classList.add("recording");

    // Start background music preview while recording
    if (this.selectedAudio && !this.previewAudioPlaying) {
      this.startAudioPreview(this.selectedAudio);
    }

    if (progressFill) progressFill.style.width = "0%";

    window.app.playSound('shutter');
    window.app.showToast("Recording Reel started! 🎥⚡ (Max 15s)");

    this.recordTimer = setInterval(() => {
      this.recordSeconds += 0.1;
      const pct = (this.recordSeconds / this.maxRecordSeconds) * 100;

      if (progressFill) progressFill.style.width = `${Math.min(pct, 100)}%`;

      if (timeBadge) {
        const secs = Math.floor(this.recordSeconds);
        timeBadge.innerText = `00:${secs < 10 ? '0' + secs : secs} / 00:15`;
      }

      if (this.recordSeconds >= this.maxRecordSeconds) {
        this.stopRecording();
      }
    }, 100);
  }

  stopRecording() {
    this.isRecording = false;
    if (this.recordTimer) {
      clearInterval(this.recordTimer);
      this.recordTimer = null;
    }

    const recordCore = document.getElementById("reel-record-btn-core");
    if (recordCore) recordCore.classList.remove("recording");

    this.stopAudioPreview();
    this.captureCurrentViewfinderFrame();

    window.app.playSound('ding');
    window.app.showToast("15s Reel recorded! Ready to publish 🎬✨");
  }

  captureCurrentViewfinderFrame() {
    const video = document.getElementById("reel-camera-preview");
    if (video && video.videoWidth > 0 && !video.classList.contains("hidden")) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (this.facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.recordedMediaUrl = canvas.toDataURL("image/jpeg", 0.9);
        return;
      } catch(e) {
        console.warn("Canvas capture error:", e);
      }
    }

    // Fallback template image
    if (!this.recordedMediaUrl) {
      this.recordedMediaUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
    }
  }

  appendHashtag(tag) {
    const captionInput = document.getElementById("reel-caption-input");
    if (!captionInput) return;
    const current = captionInput.value.trim();
    if (!current.includes(tag)) {
      captionInput.value = current ? `${current} ${tag}` : tag;
    }
    window.app.playSound('pop');
  }

  // ==========================================
  // PUBLISH REEL & INTEGRATE TO STORE
  // ==========================================

  publishReel() {
    const captionInput = document.getElementById("reel-caption-input");
    const caption = (captionInput && captionInput.value.trim()) || "New viral reel on Pluxy! 🚀 #trending #pluxy";
    const audioTrack = this.selectedAudio 
      ? `${this.selectedAudio.artist} - ${this.selectedAudio.title}` 
      : "Diljit Dosanjh - Lover 🎵";

    // Ensure we have media
    if (!this.recordedMediaUrl) {
      this.captureCurrentViewfinderFrame();
    }
    const finalMedia = this.recordedMediaUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";

    // Save to omniStore
    if (window.omniStore && typeof window.omniStore.addReel === "function") {
      window.omniStore.addReel(finalMedia, caption, audioTrack);
    }

    // Broadcast through syncEngine if available
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("new_reel", {
        mediaUrl: finalMedia,
        caption: caption,
        audioTrack: audioTrack
      });
    }

    // Close studio modal cleanly
    this.closeCreateReelModal();

    // Switch to Reels tab immediately and play new reel
    if (window.app && typeof window.app.switchTab === "function") {
      window.app.switchTab("reels");
    }

    this.currentIndex = 0;
    this.isPlaying = true;
    this.renderReels();

    window.app.showToast("🎉 Your Reel has been published to Pluxy Reels! 🚀🎬");
    window.app.playSound('sent');

    // Reset fields for next creation
    if (captionInput) captionInput.value = "";
    const topicInput = document.getElementById("reel-topic-input");
    if (topicInput) topicInput.value = "";
    this.recordedMediaUrl = null;
  }

  // ==========================================
  // GIFT & TIP SYSTEM (Creator Monetization)
  // ==========================================

  openGiftModal(reelId) {
    const reels = window.omniStore.getReels();
    const reel = reels.find(r => r.id === reelId) || reels[this.currentIndex];
    const creatorName = reel ? reel.author.username : "Creator";

    const modalHtml = `
      <div class="service-modal-overlay" id="reel-gift-modal">
        <div class="service-modal-box reel-gift-box">
          <div class="service-modal-header">
            <div>
              <h3><i class="ph-bold ph-gift" style="color: #FBBF24;"></i> Send Tip to @${creatorName}</h3>
              <p class="admin-hint-text">Support your favorite reel creator! Cash deposits instantly into their Creator Wallet 💸</p>
            </div>
            <button class="icon-btn-ghost" onclick="document.getElementById('reel-gift-modal').remove()"><i class="ph-bold ph-x"></i></button>
          </div>

          <div class="gift-options-grid">
            <div class="gift-option-card selected" onclick="window.reelsModule.selectGift(20, '💎 Diamond', this)">
              <div class="gift-emoji">💎</div>
              <div class="gift-title">Diamond</div>
              <div class="gift-price">₹20</div>
            </div>
            <div class="gift-option-card" onclick="window.reelsModule.selectGift(50, '🚀 Rocket', this)">
              <div class="gift-emoji">🚀</div>
              <div class="gift-title">Rocket</div>
              <div class="gift-price">₹50</div>
            </div>
            <div class="gift-option-card" onclick="window.reelsModule.selectGift(100, '👑 Crown', this)">
              <div class="gift-emoji">👑</div>
              <div class="gift-title">Crown</div>
              <div class="gift-price">₹100</div>
            </div>
            <div class="gift-option-card" onclick="window.reelsModule.selectGift(500, '🔥 Mega Flame', this)">
              <div class="gift-emoji">🔥</div>
              <div class="gift-title">Mega Flame</div>
              <div class="gift-price">₹500</div>
            </div>
          </div>

          <div class="gift-action-footer">
            <div class="gift-selected-summary">
              Selected: <strong id="gift-chosen-label">💎 Diamond (₹20)</strong>
            </div>
            <button class="btn-send-gift-primary" id="btn-confirm-send-gift" onclick="window.reelsModule.confirmSendGift('${reel ? reel.id : ''}')">
              <i class="ph-bold ph-paper-plane-tilt"></i> Send Gift & Pay ₹20 ⚡
            </button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById("reel-gift-modal");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    this.selectedGift = { amount: 20, name: '💎 Diamond' };
  }

  selectGift(amount, name, el) {
    document.querySelectorAll(".gift-option-card").forEach(c => c.classList.remove("selected"));
    if (el) el.classList.add("selected");
    this.selectedGift = { amount, name };
    const label = document.getElementById("gift-chosen-label");
    if (label) label.innerText = `${name} (₹${amount})`;
    const btn = document.getElementById("btn-confirm-send-gift");
    if (btn) btn.innerHTML = `<i class="ph-bold ph-paper-plane-tilt"></i> Send Gift & Pay ₹${amount} ⚡`;
    window.app.playSound('pop');
  }

  confirmSendGift(reelId) {
    if (!this.selectedGift) this.selectedGift = { amount: 20, name: '💎 Diamond' };
    const currentUser = window.omniStore.getCurrentUser();
    const senderName = currentUser ? currentUser.displayName : "Fan";
    
    const res = window.omniStore.sendReelGift(reelId, this.selectedGift.name, this.selectedGift.amount, senderName);

    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("creator_reward", {
        userId: res && res.targetUsername === 'ankit_chaudhary' ? 'user_ankit' : 'user_priya',
        amount: this.selectedGift.amount,
        note: `Fan Gift ${this.selectedGift.name} from ${senderName}`
      });
    }

    const modal = document.getElementById("reel-gift-modal");
    if (modal) modal.remove();

    const targetUser = res ? res.targetUsername : "Creator";
    window.app.showToast(`🎉 Sent ${this.selectedGift.name} (₹${this.selectedGift.amount}) to @${targetUser}! Deposited to Creator Wallet 💸`);
    window.app.playSound('sent');
  }
}

window.reelsModule = new ReelsModule();
