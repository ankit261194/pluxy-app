// Snapchat AR Face Filters & Lens Studio Module - 32+ Viral Lenses & Ultra-Realistic Studio
class CameraModule {
  constructor() {
    this.videoElement = null;
    this.canvasElement = null;
    this.ctx = null;
    this.stream = null;
    this.facingMode = "user"; // 'user' (selfie) | 'environment' (back)
    this.activeLens = "dog";
    this.activeCategory = "all";
    this.activeColorFilter = "normal";
    this.flashEnabled = true;
    this.timerSeconds = 0;
    this.capturedDataUrl = null;
    this.uploadedImage = null;
    this.sampleModelImg = null;
    this.animFrameId = null;
    this.frameCounter = 0;
    this.isCountingDown = false;
    this.isCameraLive = false;

    // 32+ Exciting, High-Quality Snapchat AR Lenses with Categories
    this.lenses = [
      // 1. Animals
      { id: "dog", name: "Puppy Dog", icon: "🐶", category: "animals", desc: "Floppy ears, cute nose & licking tongue" },
      { id: "cat", name: "Kawaii Cat", icon: "🐱", category: "animals", desc: "Anime cat ears, blush & whiskers" },
      { id: "bunny", name: "Cute Bunny", icon: "🐰", category: "animals", desc: "Fluffy ears, pink nose & carrots" },
      { id: "panda", name: "Baby Panda", icon: "🐼", category: "animals", desc: "Round ears & bamboo snack" },
      { id: "lion", name: "Golden Lion", icon: "🦁", category: "animals", desc: "Majestic lion mane & whiskers" },

      // 2. Glamour & Beauty
      { id: "crown", name: "Gold Crown", icon: "👑", category: "glam", desc: "Sparkling royal crown & jewels" },
      { id: "hearts", name: "Love Blush", icon: "💖", category: "glam", desc: "Heart freckles & floating 3D hearts" },
      { id: "golden_hour", name: "Golden Hour", icon: "✨", category: "glam", desc: "Warm 24K sunset beauty glow" },
      { id: "sakura", name: "Sakura Petals", icon: "🌸", category: "glam", desc: "Falling anime cherry blossoms" },
      { id: "butterfly", name: "Butterfly Crown", icon: "🦋", category: "glam", desc: "Fluttering blue & gold butterflies" },
      { id: "ice_frost", name: "Diamond Ice", icon: "💎", category: "glam", desc: "Glittering icicles & frost aura" },
      { id: "fairy", name: "Fairy Magic", icon: "🧚", category: "glam", desc: "Glowing stardust & pastel halo" },
      { id: "angel", name: "Angel Halo", icon: "😇", category: "glam", desc: "Celestial halo & feathery wings" },

      // 3. Cyber & Sci-Fi
      { id: "glasses", name: "Cyber Shades", icon: "🕶️", category: "cyber", desc: "Neon cyberpunk glowing visor" },
      { id: "alien", name: "Matrix Glow", icon: "👽", category: "cyber", desc: "Cyber matrix code & green gaze" },
      { id: "devil", name: "Cyber Devil", icon: "😈", category: "cyber", desc: "Glowing ruby horns & flame aura" },
      { id: "fire", name: "Blazing Fire", icon: "🔥", category: "cyber", desc: "Animated licking flame horns" },
      { id: "rainbow", name: "Rainbow Flares", icon: "🌈", category: "cyber", desc: "Chromatic beam & cheek sparkles" },
      { id: "lightning", name: "Thunder Bolt", icon: "⚡", category: "cyber", desc: "Neon electric sparks & eye bolt" },
      { id: "kitsune", name: "Neon Kitsune", icon: "🦊", category: "cyber", desc: "Japanese fox mask with glow" },
      { id: "galaxy", name: "Cosmic Galaxy", icon: "🌌", category: "cyber", desc: "Nebula starfield & star freckles" },
      { id: "glitch", name: "Cyber Glitch", icon: "👾", category: "cyber", desc: "RGB chromatic split & data HUD" },
      { id: "steampunk", name: "Steampunk", icon: "⚙️", category: "cyber", desc: "Brass goggles with turning cogs" },

      // 4. Fun & Memes
      { id: "thug_life", name: "Thug Life", icon: "🚬", category: "fun", desc: "8-bit shades, gold chain & cigar" },
      { id: "vhs", name: "Retro VHS 1998", icon: "📼", category: "fun", desc: "Camcorder scanlines & noise" },
      { id: "bubblegum", name: "Bubblegum Pop", icon: "🫧", category: "fun", desc: "Expanding pink bubblegum bubble" },
      { id: "money", name: "Cash Rain", icon: "💸", category: "fun", desc: "Dollar sunglasses & falling cash" },
      { id: "mustache", name: "Gentleman", icon: "🎩", category: "fun", desc: "Curly mustache, monocle & top hat" },
      { id: "party", name: "Party Time", icon: "🎉", category: "fun", desc: "Confetti burst, party hat & horn" },
      { id: "vampire", name: "Vampire Count", icon: "🧛", category: "fun", desc: "Red glowing eyes & vampire fangs" },
      { id: "disco", name: "Disco Fever", icon: "🪩", category: "fun", desc: "Mirrorball & colorful dance lights" },
      { id: "superstar", name: "Superstar", icon: "⭐", category: "fun", desc: "Starburst glasses & Hollywood glow" }
    ];

    // Preload realistic model image for instant beautiful preview when camera is off
    this.preloadSampleModel();
  }

  preloadSampleModel() {
    this.sampleModelImg = new Image();
    this.sampleModelImg.crossOrigin = "anonymous";
    this.sampleModelImg.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80";
  }

  init() {
    this.videoElement = document.getElementById("camera-video-feed");
    this.canvasElement = document.getElementById("camera-ar-canvas");
    if (this.canvasElement) {
      this.ctx = this.canvasElement.getContext("2d", { willReadFrequently: true });
      this.canvasElement.width = 720;
      this.canvasElement.height = 1280;
    }
    this.renderLensCarousel();
    this.setupControls();
  }

  async startCamera() {
    if (!this.canvasElement) {
      this.init();
    }

    const statusBadge = document.getElementById("camera-lens-indicator");
    if (statusBadge) statusBadge.innerText = "⏳ Connecting to Camera...";

    try {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
      }

      // Try best constraints first, then fallback
      const attempts = [
        { video: { facingMode: this.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: { facingMode: this.facingMode }, audio: false },
        { video: true, audio: false }
      ];

      let streamObtained = null;
      for (const constraint of attempts) {
        try {
          streamObtained = await navigator.mediaDevices.getUserMedia(constraint);
          if (streamObtained) break;
        } catch (e) {
          // try next
        }
      }

      if (streamObtained) {
        this.stream = streamObtained;
        if (this.videoElement) {
          this.videoElement.srcObject = this.stream;
          await this.videoElement.play().catch(e => console.warn("Video play error:", e));
        }
        this.isCameraLive = true;
        this.uploadedImage = null;
        if (statusBadge) statusBadge.innerText = `✨ Real Camera Live (${this.facingMode === "user" ? "Selfie" : "Rear"})`;
        window.app.showToast("📷 Live Camera Connected!");
      } else {
        throw new Error("No video stream");
      }
    } catch (err) {
      console.warn("Real camera access denied/unavailable. Using HD Model Preview:", err);
      this.isCameraLive = false;
      if (statusBadge) statusBadge.innerText = "✨ HD Studio Mode (Tap Flip to retry camera)";
    }

    this.startARLoop();
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.isCameraLive = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  async flipCamera() {
    this.facingMode = this.facingMode === "user" ? "environment" : "user";
    window.app.playSound('pop');
    window.app.showToast(`Switching to ${this.facingMode === "user" ? "Selfie (Front)" : "Rear (World)"} Camera 🔄`);
    await this.startCamera();
  }

  toggleFlash() {
    this.flashEnabled = !this.flashEnabled;
    const btn = document.getElementById("btn-camera-flash");
    if (btn) {
      btn.style.color = this.flashEnabled ? "#FBBF24" : "#94A3B8";
    }
    window.app.playSound('pop');
    window.app.showToast(`Flash ${this.flashEnabled ? "Enabled ⚡" : "Disabled"}`);
  }

  toggleTimer() {
    this.timerSeconds = this.timerSeconds === 0 ? 3 : 0;
    const badge = document.getElementById("camera-timer-badge");
    if (badge) badge.innerText = this.timerSeconds === 0 ? "Off" : "3s";
    window.app.playSound('pop');
    window.app.showToast(`Timer set to ${this.timerSeconds === 0 ? "Instant (Off)" : "3s Countdown ⏱️"}`);
  }

  setColorFilter(preset) {
    this.activeColorFilter = preset;
    document.querySelectorAll(".camera-preset-chip").forEach(btn => btn.classList.remove("active"));
    const activeChip = Array.from(document.querySelectorAll(".camera-preset-chip")).find(el => el.innerText.toLowerCase().includes(preset));
    if (activeChip) activeChip.classList.add("active");
    window.app.playSound('pop');
  }

  handlePhotoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        this.uploadedImage = img;
        this.isCameraLive = false;
        this.startARLoop();
        window.app.showToast("Your uploaded photo is active in AR Lens Studio! 📸✨");
        window.app.playSound('ding');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  filterLensesByCategory(category) {
    this.activeCategory = category;
    this.renderLensCarousel();
    window.app.playSound('pop');
  }

  renderLensCarousel() {
    const container = document.getElementById("camera-filters-carousel");
    if (!container) return;

    const filtered = this.activeCategory === "all" 
      ? this.lenses 
      : this.lenses.filter(l => l.category === this.activeCategory);

    container.innerHTML = filtered.map(lens => `
      <div class="camera-lens-item ${this.activeLens === lens.id ? 'selected' : ''}" 
           onclick="window.cameraModule.selectLens('${lens.id}')"
           title="${lens.name}: ${lens.desc}">
        <div class="camera-lens-circle">${lens.icon}</div>
        <span class="camera-lens-name">${lens.name}</span>
      </div>
    `).join("");
  }

  selectLens(lensId) {
    this.activeLens = lensId;
    this.renderLensCarousel();
    const lensObj = this.lenses.find(l => l.id === lensId);
    const indicator = document.getElementById("camera-lens-indicator");
    if (indicator && lensObj) {
      indicator.innerText = `${lensObj.icon} ${lensObj.name} Active`;
    }
    window.app.playSound('pop');
  }

  startARLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const draw = () => {
      this.frameCounter++;
      this.renderARFrame();
      this.animFrameId = requestAnimationFrame(draw);
    };
    this.animFrameId = requestAnimationFrame(draw);
  }

  renderARFrame() {
    if (!this.canvasElement || !this.ctx) return;
    const canvas = this.canvasElement;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();

    // 1. Draw Background: Real Camera Video > Uploaded Photo > HD Sample Model > Procedural Studio
    if (this.isCameraLive && this.videoElement && this.videoElement.videoWidth > 0 && !this.uploadedImage) {
      if (this.facingMode === "user") {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.videoElement, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(this.videoElement, 0, 0, w, h);
      }
    } else if (this.uploadedImage) {
      ctx.drawImage(this.uploadedImage, 0, 0, w, h);
    } else if (this.sampleModelImg && this.sampleModelImg.complete && this.sampleModelImg.naturalWidth > 0) {
      // High-resolution realistic portrait photo model
      ctx.drawImage(this.sampleModelImg, 0, 0, w, h);
    } else {
      this.drawRealisticStudioPortrait(ctx, w, h);
    }

    // 2. Apply Color Grading Filter
    this.applyColorGrading(ctx, w, h);

    // 3. Render Active AR Lens (all 32 lenses supported)
    const t = this.frameCounter * 0.05;
    const bounce = Math.sin(t) * 8;
    const faceX = w / 2;
    const faceY = h * 0.40;

    switch (this.activeLens) {
      case "dog": this.drawDogFilter(ctx, faceX, faceY, bounce, t); break;
      case "cat": this.drawCatFilter(ctx, faceX, faceY, bounce, t); break;
      case "bunny": this.drawBunnyFilter(ctx, faceX, faceY, bounce, t); break;
      case "panda": this.drawPandaFilter(ctx, faceX, faceY, bounce, t); break;
      case "lion": this.drawLionFilter(ctx, faceX, faceY, bounce, t); break;

      case "crown": this.drawCrownFilter(ctx, faceX, faceY, bounce, t); break;
      case "hearts": this.drawHeartsFilter(ctx, faceX, faceY, bounce, t); break;
      case "golden_hour": this.drawGoldenHourFilter(ctx, faceX, faceY, bounce, t); break;
      case "sakura": this.drawSakuraFilter(ctx, faceX, faceY, bounce, t); break;
      case "butterfly": this.drawButterflyFilter(ctx, faceX, faceY, bounce, t); break;
      case "ice_frost": this.drawIceFrostFilter(ctx, faceX, faceY, bounce, t); break;
      case "fairy": this.drawFairyFilter(ctx, faceX, faceY, bounce, t); break;
      case "angel": this.drawAngelFilter(ctx, faceX, faceY, bounce, t); break;

      case "glasses": this.drawGlassesFilter(ctx, faceX, faceY, bounce, t); break;
      case "alien": this.drawAlienFilter(ctx, faceX, faceY, bounce, t); break;
      case "devil": this.drawDevilFilter(ctx, faceX, faceY, bounce, t); break;
      case "fire": this.drawFireFilter(ctx, faceX, faceY, bounce, t); break;
      case "rainbow": this.drawRainbowFilter(ctx, faceX, faceY, bounce, t); break;
      case "lightning": this.drawLightningFilter(ctx, faceX, faceY, bounce, t); break;
      case "kitsune": this.drawKitsuneFilter(ctx, faceX, faceY, bounce, t); break;
      case "galaxy": this.drawGalaxyFilter(ctx, faceX, faceY, bounce, t); break;
      case "glitch": this.drawGlitchFilter(ctx, faceX, faceY, bounce, t, w, h); break;
      case "steampunk": this.drawSteampunkFilter(ctx, faceX, faceY, bounce, t); break;

      case "thug_life": this.drawThugLifeFilter(ctx, faceX, faceY, bounce, t); break;
      case "vhs": this.drawVhsFilter(ctx, faceX, faceY, bounce, t, w, h); break;
      case "bubblegum": this.drawBubblegumFilter(ctx, faceX, faceY, bounce, t); break;
      case "money": this.drawMoneyFilter(ctx, faceX, faceY, bounce, t, w, h); break;
      case "mustache": this.drawMustacheFilter(ctx, faceX, faceY, bounce, t); break;
      case "party": this.drawPartyFilter(ctx, faceX, faceY, bounce, t, w, h); break;
      case "vampire": this.drawVampireFilter(ctx, faceX, faceY, bounce, t); break;
      case "disco": this.drawDiscoFilter(ctx, faceX, faceY, bounce, t, w, h); break;
      case "superstar": this.drawSuperstarFilter(ctx, faceX, faceY, bounce, t); break;
      default:
        this.drawDogFilter(ctx, faceX, faceY, bounce, t);
    }

    ctx.restore();
  }

  drawRealisticStudioPortrait(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#1E1B4B");
    bg.addColorStop(0.5, "#0F172A");
    bg.addColorStop(1, "#020617");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w/2, h*0.4, 50, w/2, h*0.4, 400);
    glow.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Realistic silhouette
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.82, 230, 180, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#FBCFE8";
    ctx.fillRect(w/2 - 45, h*0.5, 90, 110);
    ctx.fillStyle = "#FDE2E4";
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.40, 135, 170, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes & Smile
    ctx.fillStyle = "#1E293B";
    ctx.beginPath(); ctx.arc(w/2 - 45, h*0.38, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w/2 + 45, h*0.38, 9, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "#E11D48";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w/2, h*0.44, 25, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  applyColorGrading(ctx, w, h) {
    switch (this.activeColorFilter) {
      case "golden":
        ctx.fillStyle = "rgba(255, 170, 0, 0.18)";
        ctx.fillRect(0, 0, w, h);
        break;
      case "neon":
        ctx.fillStyle = "rgba(138, 43, 226, 0.16)";
        ctx.fillRect(0, 0, w, h);
        break;
      case "noir":
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, w, h);
        break;
      case "glam":
        ctx.fillStyle = "rgba(255, 105, 180, 0.15)";
        ctx.fillRect(0, 0, w, h);
        break;
      case "matrix":
        ctx.fillStyle = "rgba(34, 197, 94, 0.18)";
        ctx.fillRect(0, 0, w, h);
        break;
    }
  }

  // ==========================================
  // 32+ AR LENSES DRAW METHODS
  // ==========================================

  // 1. Puppy Dog
  drawDogFilter(ctx, x, y, bounce, t) {
    ctx.save();
    // Ears
    ctx.fillStyle = "#8D5B4C";
    ctx.beginPath();
    ctx.ellipse(x - 135, y - 120 + bounce, 45, 95, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 135, y - 120 + bounce, 45, 95, 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Inner Ears
    ctx.fillStyle = "#FFAAA6";
    ctx.beginPath();
    ctx.ellipse(x - 135, y - 110 + bounce, 24, 65, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 135, y - 110 + bounce, 24, 65, 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Cute Dog Button Nose
    ctx.fillStyle = "#2D1E18";
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(x - 8, y + 10, 6, 0, Math.PI * 2);
    ctx.fill();

    // Animated Licking Tongue
    const tongueL = 40 + Math.sin(t * 3) * 16;
    ctx.fillStyle = "#FF6B8B";
    ctx.beginPath();
    ctx.ellipse(x, y + 55 + tongueL * 0.4, 22, tongueL * 0.65, 0, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // 2. Gold Crown
  drawCrownFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const cY = y - 145 + bounce;
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(x - 110, cY + 30);
    ctx.lineTo(x - 110, cY - 40);
    ctx.lineTo(x - 55, cY - 10);
    ctx.lineTo(x, cY - 65);
    ctx.lineTo(x + 55, cY - 10);
    ctx.lineTo(x + 110, cY - 40);
    ctx.lineTo(x + 110, cY + 30);
    ctx.closePath();
    ctx.fill();

    // Jewels
    ctx.fillStyle = "#EF4444";
    ctx.beginPath(); ctx.arc(x, cY - 55, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath(); ctx.arc(x - 100, cY - 30, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 100, cY - 30, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // 3. Cyber Shades
  drawGlassesFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const gY = y - 20 + bounce * 0.3;
    ctx.fillStyle = "rgba(11, 15, 25, 0.9)";
    ctx.strokeStyle = "#00F2FE";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#00F2FE";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.roundRect(x - 125, gY - 25, 250, 52, 12);
    ctx.fill();
    ctx.stroke();

    // Laser Scan Line
    const scanX = x - 115 + ((t * 120) % 230);
    ctx.fillStyle = "rgba(255, 0, 127, 0.85)";
    ctx.shadowColor = "#FF007F";
    ctx.fillRect(scanX, gY - 22, 12, 46);
    ctx.restore();
  }

  // 4. Kawaii Cat
  drawCatFilter(ctx, x, y, bounce, t) {
    ctx.save();
    // Cat Ears
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.moveTo(x - 110, y - 110 + bounce);
    ctx.lineTo(x - 150, y - 210 + bounce);
    ctx.lineTo(x - 60, y - 145 + bounce);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 110, y - 110 + bounce);
    ctx.lineTo(x + 150, y - 210 + bounce);
    ctx.lineTo(x + 60, y - 145 + bounce);
    ctx.fill();

    // Pink Inner Ears
    ctx.fillStyle = "#F472B6";
    ctx.beginPath();
    ctx.moveTo(x - 105, y - 120 + bounce);
    ctx.lineTo(x - 138, y - 190 + bounce);
    ctx.lineTo(x - 75, y - 145 + bounce);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 105, y - 120 + bounce);
    ctx.lineTo(x + 138, y - 190 + bounce);
    ctx.lineTo(x + 75, y - 145 + bounce);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 45, y + 15); ctx.lineTo(x - 120, y + 5);
    ctx.moveTo(x - 45, y + 25); ctx.lineTo(x - 120, y + 25);
    ctx.moveTo(x + 45, y + 15); ctx.lineTo(x + 120, y + 5);
    ctx.moveTo(x + 45, y + 25); ctx.lineTo(x + 120, y + 25);
    ctx.stroke();

    // Pink Nose
    ctx.fillStyle = "#F472B6";
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Cute Bunny
  drawBunnyFilter(ctx, x, y, bounce, t) {
    ctx.save();
    // Long Fluffy Bunny Ears
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.ellipse(x - 70, y - 190 + bounce, 28, 90, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 70, y - 190 + bounce, 28, 90, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFB6C1";
    ctx.beginPath();
    ctx.ellipse(x - 70, y - 190 + bounce, 14, 65, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 70, y - 190 + bounce, 14, 65, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Pink Bunny Nose & Floating Carrot
    ctx.fillStyle = "#FF69B4";
    ctx.beginPath(); ctx.ellipse(x, y + 10, 10, 8, 0, 0, Math.PI * 2); ctx.fill();

    ctx.font = "32px sans-serif";
    ctx.fillText("🥕", x + 85, y - 80 + Math.sin(t * 2) * 12);
    ctx.restore();
  }

  // 6. Baby Panda
  drawPandaFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.fillStyle = "#111827";
    ctx.beginPath(); ctx.arc(x - 110, y - 140 + bounce, 45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 110, y - 140 + bounce, 45, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#FFF";
    ctx.beginPath(); ctx.arc(x - 110, y - 140 + bounce, 22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 110, y - 140 + bounce, 22, 0, Math.PI * 2); ctx.fill();

    ctx.font = "34px sans-serif";
    ctx.fillText("🎋", x - 130, y + 25 + bounce);
    ctx.restore();
  }

  // 7. Golden Lion
  drawLionFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
    ctx.beginPath(); ctx.arc(x, y - 40, 180, 0, Math.PI * 2); ctx.fill();

    // Round Lion Ears
    ctx.fillStyle = "#D97706";
    ctx.beginPath(); ctx.arc(x - 115, y - 130 + bounce, 42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 115, y - 130 + bounce, 42, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#FEF3C7";
    ctx.beginPath(); ctx.arc(x - 115, y - 130 + bounce, 20, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 115, y - 130 + bounce, 20, 0, Math.PI * 2); ctx.fill();

    ctx.font = "28px sans-serif";
    ctx.fillText("👑", x - 16, y - 180 + bounce);
    ctx.restore();
  }

  // 8. Love Blush
  drawHeartsFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 105, 180, 0.4)";
    ctx.beginPath(); ctx.ellipse(x - 85, y + 20, 38, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 85, y + 20, 38, 20, 0, 0, Math.PI * 2); ctx.fill();

    const hearts = [
      { dx: -100, dy: y - 100 + Math.sin(t) * 15, s: 28 },
      { dx: 100, dy: y - 110 + Math.cos(t) * 18, s: 32 },
      { dx: -130, dy: y + Math.sin(t + 1) * 12, s: 22 },
      { dx: 130, dy: y - 15 + Math.cos(t + 2) * 14, s: 24 },
      { dx: 0, dy: y - 175 + Math.sin(t * 1.5) * 15, s: 36 }
    ];
    hearts.forEach(h => {
      ctx.font = `${h.s}px sans-serif`;
      ctx.fillText("💖", x + h.dx, h.dy);
    });
    ctx.restore();
  }

  // 9. Golden Hour
  drawGoldenHourFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const g = ctx.createRadialGradient(x + 120, y - 120, 20, x, y, 320);
    g.addColorStop(0, "rgba(255, 220, 100, 0.45)");
    g.addColorStop(0.6, "rgba(255, 140, 0, 0.2)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(x - 360, y - 360, 720, 720);

    ctx.font = "30px sans-serif";
    ctx.fillText("✨", x - 95, y - 75 + bounce);
    ctx.fillText("✨", x + 95, y - 85 - bounce);
    ctx.restore();
  }

  // 10. Sakura Petals
  drawSakuraFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "26px sans-serif";
    for (let i = 0; i < 8; i++) {
      const px = x - 180 + ((i * 55 + t * 45) % 360);
      const py = y - 180 + ((i * 70 + t * 65) % 380);
      ctx.fillText("🌸", px, py);
    }
    ctx.restore();
  }

  // 11. Butterfly Crown
  drawButterflyFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const bY = y - 165 + bounce;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI / 2.5) + t * 0.8;
      const bx = x + Math.cos(angle) * 110;
      const by = bY + Math.sin(angle * 1.5) * 35;
      ctx.font = "28px sans-serif";
      ctx.fillText("🦋", bx, by);
    }
    ctx.restore();
  }

  // 12. Diamond Ice
  drawIceFrostFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "30px sans-serif";
    ctx.fillText("💎", x - 85, y - 130 + bounce);
    ctx.fillText("💎", x + 85, y - 130 + bounce);
    ctx.fillText("❄️", x - 130, y - 30 + Math.sin(t) * 10);
    ctx.fillText("❄️", x + 130, y - 30 + Math.cos(t) * 10);
    ctx.restore();
  }

  // 13. Fairy Magic
  drawFairyFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "34px sans-serif";
    ctx.fillText("🧚", x - 110, y - 150 + bounce);
    ctx.fillText("✨", x + 100, y - 140 - bounce);
    ctx.fillText("🌟", x, y - 180 + bounce * 0.5);
    ctx.restore();
  }

  // 14. Angel Halo & Wings
  drawAngelFilter(ctx, x, y, bounce, t) {
    ctx.save();
    // Glowing Halo
    const hY = y - 170 + bounce;
    ctx.strokeStyle = "#FBBF24";
    ctx.lineWidth = 10;
    ctx.shadowColor = "#FBBF24";
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.ellipse(x, hY, 70, 22, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "50px sans-serif";
    ctx.fillText("🪽", x - 180, y - 60 + bounce * 0.5);
    ctx.fillText("🪽", x + 130, y - 60 + bounce * 0.5);
    ctx.restore();
  }

  // 15. Matrix Glow
  drawAlienFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "16px monospace";
    ctx.fillStyle = "#22C55E";
    ctx.shadowColor = "#22C55E";
    ctx.shadowBlur = 10;
    for (let c = -140; c <= 140; c += 45) {
      const charY = ((t * 110 + c * 2) % 320) + y - 160;
      ctx.fillText(String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)), x + c, charY);
    }
    ctx.font = "40px sans-serif";
    ctx.fillText("👽", x - 20, y - 160 + bounce);
    ctx.restore();
  }

  // 16. Cyber Devil
  drawDevilFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const hY = y - 150 + bounce;
    ctx.fillStyle = "#EF4444";
    ctx.shadowColor = "#EF4444";
    ctx.shadowBlur = 20;

    // Horns
    ctx.beginPath();
    ctx.moveTo(x - 65, hY + 15);
    ctx.quadraticCurveTo(x - 110, hY - 30, x - 130, hY - 75);
    ctx.quadraticCurveTo(x - 90, hY - 45, x - 50, hY - 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 65, hY + 15);
    ctx.quadraticCurveTo(x + 110, hY - 30, x + 130, hY - 75);
    ctx.quadraticCurveTo(x + 90, hY - 45, x + 50, hY - 5);
    ctx.fill();

    ctx.font = "34px sans-serif";
    ctx.fillText("🔥", x - 16, y - 170 + bounce);
    ctx.restore();
  }

  // 17. Blazing Fire
  drawFireFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "44px sans-serif";
    ctx.fillText("🔥", x - 90, y - 155 + Math.sin(t * 3) * 12);
    ctx.fillText("🔥", x + 50, y - 155 + Math.cos(t * 3) * 12);
    ctx.fillText("⚡", x - 15, y - 190 + bounce);
    ctx.restore();
  }

  // 18. Rainbow Flares
  drawRainbowFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "38px sans-serif";
    ctx.fillText("🌈", x - 40, y - 160 + bounce);
    ctx.fillText("✨", x - 90, y - 50);
    ctx.fillText("✨", x + 70, y - 50);
    ctx.restore();
  }

  // 19. Thunder Spark
  drawLightningFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "46px sans-serif";
    ctx.fillText("⚡", x - 55, y - 35 + bounce * 0.4);
    ctx.font = "28px sans-serif";
    ctx.fillText("💥", x + 55, y - 25);
    ctx.restore();
  }

  // 20. Neon Kitsune Fox
  drawKitsuneFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "46px sans-serif";
    ctx.fillText("🦊", x - 25, y - 160 + bounce);
    ctx.strokeStyle = "#FF007F";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#FF007F";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(x - 50, y + 20); ctx.lineTo(x - 110, y + 10);
    ctx.moveTo(x + 50, y + 20); ctx.lineTo(x + 110, y + 10);
    ctx.stroke();
    ctx.restore();
  }

  // 21. Cosmic Galaxy
  drawGalaxyFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "32px sans-serif";
    ctx.fillText("🪐", x - 120, y - 130 + bounce);
    ctx.fillText("⭐", x + 100, y - 120 - bounce);
    ctx.fillText("🌌", x - 20, y - 180 + bounce * 0.6);
    ctx.restore();
  }

  // 22. Cyber Glitch
  drawGlitchFilter(ctx, x, y, bounce, t, w, h) {
    ctx.save();
    ctx.font = "36px sans-serif";
    ctx.fillText("👾", x - 18, y - 160 + bounce);
    ctx.fillStyle = "rgba(0, 242, 254, 0.15)";
    ctx.fillRect(0, ((t * 80) % h), w, 8);
    ctx.fillStyle = "rgba(255, 0, 127, 0.15)";
    ctx.fillRect(0, ((t * 120 + 200) % h), w, 12);
    ctx.restore();
  }

  // 23. Steampunk Gears
  drawSteampunkFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "40px sans-serif";
    ctx.fillText("⚙️", x - 100, y - 80 + bounce);
    ctx.fillText("⚙️", x + 70, y - 80 - bounce);
    ctx.fillText("🥽", x - 25, y - 25 + bounce * 0.3);
    ctx.restore();
  }

  // 24. Thug Life
  drawThugLifeFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const sY = y - 30 + Math.min(bounce, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(x - 105, sY, 95, 32);
    ctx.fillRect(x + 10, sY, 95, 32);
    ctx.fillRect(x - 15, sY + 8, 30, 12);

    // Pixel Highlights
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x - 95, sY + 4, 12, 12);
    ctx.fillRect(x + 20, sY + 4, 12, 12);

    // Gold Chain & Cigar
    ctx.font = "32px sans-serif";
    ctx.fillText("🚬", x + 25, y + 55);
    ctx.fillText("⛓️", x - 22, y + 95);
    ctx.restore();
  }

  // 25. Retro VHS 1998
  drawVhsFilter(ctx, x, y, bounce, t, w, h) {
    ctx.save();
    ctx.fillStyle = "#00FF00";
    ctx.font = "18px monospace";
    ctx.fillText("PLAY ▶ 00:19:98", 24, 60);
    ctx.fillText("SP REC ●", w - 120, 60);

    // Scanlines
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let l = 0; l < h; l += 4) {
      ctx.fillRect(0, l, w, 1.5);
    }
    ctx.restore();
  }

  // 26. Bubblegum Pop
  drawBubblegumFilter(ctx, x, y, bounce, t) {
    ctx.save();
    const bSize = 35 + ((t * 15) % 45);
    ctx.fillStyle = "rgba(255, 105, 180, 0.85)";
    ctx.shadowColor = "#FF69B4";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y + 42, bSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(x - bSize * 0.35, y + 42 - bSize * 0.35, bSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 27. Cash Rain
  drawMoneyFilter(ctx, x, y, bounce, t, w, h) {
    ctx.save();
    ctx.font = "38px sans-serif";
    ctx.fillText("🤑", x - 20, y - 150 + bounce);
    ctx.font = "30px sans-serif";
    for (let i = 0; i < 6; i++) {
      const mx = ((i * 120 + t * 50) % w);
      const my = ((i * 90 + t * 80) % h);
      ctx.fillText("💸", mx, my);
    }
    ctx.restore();
  }

  // 28. Gentleman
  drawMustacheFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "48px sans-serif";
    ctx.fillText("🎩", x - 28, y - 160 + bounce);
    ctx.fillText("🥸", x - 25, y + 35);
    ctx.restore();
  }

  // 29. Party Time
  drawPartyFilter(ctx, x, y, bounce, t, w, h) {
    ctx.save();
    ctx.font = "46px sans-serif";
    ctx.fillText("🥳", x - 25, y - 160 + bounce);
    ctx.font = "32px sans-serif";
    ctx.fillText("🎉", x - 120, y - 80);
    ctx.fillText("🎊", x + 90, y - 80);
    ctx.restore();
  }

  // 30. Vampire Count
  drawVampireFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "44px sans-serif";
    ctx.fillText("🧛", x - 24, y - 160 + bounce);
    ctx.fillText("🦇", x - 110, y - 90 + Math.sin(t * 2) * 15);
    ctx.fillText("🦇", x + 85, y - 90 - Math.cos(t * 2) * 15);
    ctx.restore();
  }

  // 31. Disco Fever
  drawDiscoFilter(ctx, x, y, bounce, t, w, h) {
    ctx.save();
    ctx.font = "50px sans-serif";
    ctx.fillText("🪩", x - 25, y - 170 + bounce);
    ctx.fillStyle = `hsl(${(t * 80) % 360}, 90%, 60%)`;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 32. Superstar
  drawSuperstarFilter(ctx, x, y, bounce, t) {
    ctx.save();
    ctx.font = "46px sans-serif";
    ctx.fillText("⭐", x - 85, y - 150 + bounce);
    ctx.fillText("⭐", x + 55, y - 150 - bounce);
    ctx.font = "34px sans-serif";
    ctx.fillText("🕶️", x - 20, y - 25);
    ctx.restore();
  }

  // ==========================================
  // CAPTURE & SNAP EDITOR
  // ==========================================

  takeSnap() {
    if (this.timerSeconds > 0) {
      this.startCountdownAndSnap();
    } else {
      this.executeCapture();
    }
  }

  startCountdownAndSnap() {
    this.isCountingDown = true;
    const overlay = document.getElementById("camera-countdown-overlay");
    const numEl = document.getElementById("camera-countdown-num");
    let count = this.timerSeconds;

    if (overlay && numEl) {
      overlay.classList.remove("hidden");
      numEl.innerText = count;
      window.app.playSound('pop');

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          numEl.innerText = count;
          window.app.playSound('pop');
        } else {
          clearInterval(interval);
          overlay.classList.add("hidden");
          this.isCountingDown = false;
          this.executeCapture();
        }
      }, 1000);
    } else {
      this.executeCapture();
    }
  }

  executeCapture() {
    if (this.flashEnabled) {
      const flashEl = document.getElementById("camera-flash-overlay");
      if (flashEl) {
        flashEl.classList.add("active");
        setTimeout(() => flashEl.classList.remove("active"), 220);
      }
    }

    window.app.playSound('shutter');

    try {
      if (this.canvasElement) {
        this.capturedDataUrl = this.canvasElement.toDataURL("image/jpeg", 0.95);
      } else {
        throw new Error("Canvas missing");
      }
    } catch (err) {
      console.warn("Canvas capture error:", err);
    }

    const editor = document.getElementById("snap-editor-modal");
    const previewImg = document.getElementById("snap-editor-preview-img");
    if (editor && previewImg) {
      previewImg.src = this.capturedDataUrl;
      editor.classList.add("active");
    }

    const watermark = document.getElementById("snap-editor-watermark");
    const lensObj = this.lenses.find(l => l.id === this.activeLens);
    if (watermark && lensObj) {
      watermark.innerText = `Pluxy • ${lensObj.name} Lens`;
    }

    window.app.showToast("📸 Photo captured with AR Filter! Save or share below.");
  }

  downloadPhoto() {
    if (!this.capturedDataUrl) return;
    const a = document.createElement("a");
    a.href = this.capturedDataUrl;
    a.download = `Pluxy_Snap_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.app.showToast("💾 Photo saved directly to your phone / PC! 🎉");
    window.app.playSound('ding');
  }

  setupControls() {
    const shutterBtn = document.getElementById("btn-camera-shutter");
    if (shutterBtn) shutterBtn.onclick = () => this.takeSnap();

    const flashBtn = document.getElementById("btn-camera-flash");
    if (flashBtn) flashBtn.onclick = () => this.toggleFlash();

    const flipBtn = document.getElementById("btn-camera-flip");
    if (flipBtn) flipBtn.onclick = () => this.flipCamera();

    const timerBtn = document.getElementById("btn-camera-timer");
    if (timerBtn) timerBtn.onclick = () => this.toggleTimer();

    const uploadBtn = document.getElementById("btn-camera-upload");
    const fileInput = document.getElementById("camera-file-input");
    if (uploadBtn && fileInput) {
      uploadBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => this.handlePhotoUpload(e);
    }

    const closeEditor = document.getElementById("btn-close-snap-editor");
    if (closeEditor) {
      closeEditor.onclick = () => {
        document.getElementById("snap-editor-modal").classList.remove("active");
      };
    }

    const downloadBtn = document.getElementById("btn-download-snap");
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadPhoto();
    }

    const sendSnapBtn = document.getElementById("btn-send-created-snap");
    if (sendSnapBtn) {
      sendSnapBtn.onclick = async () => {
        const caption = document.getElementById("snap-editor-caption").value;
        const duration = parseInt(document.getElementById("snap-editor-timer").value, 10) || 5;

        // Dispatch to real backend API
        if (window.apiClient && window.apiClient.getToken()) {
          try {
            await window.apiClient.post("/snaps", {
              media_url: this.capturedDataUrl,
              caption: caption,
              duration: duration
            });
          } catch (err) {
            console.warn("Could not sync snap to server:", err);
          }
        }

        if (window.omniStore && typeof window.omniStore.addSnap === "function") {
          window.omniStore.addSnap(this.capturedDataUrl, caption, duration);
        }
        document.getElementById("snap-editor-modal").classList.remove("active");
        document.getElementById("snap-editor-caption").value = "";

        if (window.snapsModule && typeof window.snapsModule.renderSnaps === "function") {
          await window.snapsModule.renderSnaps();
        }
        if (window.app) {
          window.app.showToast("🔥 Snapchat AR Snap sent! Streak increased! 🚀");
          window.app.playSound('ding');
          window.app.switchTab("snaps");
        }
      };
    }

    const addToStoryBtn = document.getElementById("btn-add-to-story");
    if (addToStoryBtn) {
      addToStoryBtn.onclick = async () => {
        const caption = document.getElementById("snap-editor-caption").value;

        // Dispatch to real backend API
        if (window.apiClient && window.apiClient.getToken()) {
          try {
            await window.apiClient.post("/stories", {
              media_url: this.capturedDataUrl,
              caption: caption || `Captured with ${this.activeLens} filter ✨`
            });
          } catch (err) {
            console.warn("Could not sync story to server:", err);
          }
        }

        document.getElementById("snap-editor-modal").classList.remove("active");
        if (window.storiesModule && typeof window.storiesModule.renderTray === "function") {
          await window.storiesModule.renderTray();
        }
        if (window.app) {
          window.app.showToast("AR Snap added to 24h Story! 📸✨");
          window.app.playSound('ding');
          window.app.switchTab("feed");
        }
      };
    }
  }
}

window.cameraModule = new CameraModule();
