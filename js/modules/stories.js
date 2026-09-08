// Instagram + Snapchat 24-Hour Stories Module (Connected to Genuine Backend API)
class StoriesModule {
  constructor() {
    this.tray = document.getElementById("stories-tray");
    this.viewer = document.getElementById("story-viewer-modal");
    this.currentStoryIndex = 0;
    this.currentItemIndex = 0;
    this.storyTimer = null;
    this.isPaused = false;
    this.progressInterval = null;
    this.currentProgress = 0;
    this.stories = [];
  }

  async init() {
    await this.renderTray();
    this.setupViewerControls();
  }

  async renderTray() {
    if (!this.tray) return;

    if (window.apiClient) {
      try {
        const res = await window.apiClient.get("/stories");
        if (res && res.success && Array.isArray(res.stories)) {
          this.stories = res.stories;
        }
      } catch (err) {
        console.warn("Could not fetch stories from backend:", err);
      }
    }

    if (!this.stories.length && window.omniStore && typeof window.omniStore.getStories === "function") {
      this.stories = window.omniStore.getStories();
    }

    const currentUser = (window.authModule && window.authModule.currentUser) || 
                        (window.omniStore && window.omniStore.getCurrentUser ? window.omniStore.getCurrentUser() : null);

    const myAvatar = (currentUser && currentUser.avatar) ? currentUser.avatar : "assets/pluxy-icon.png";

    this.tray.innerHTML = `
      <!-- My Story Add Button -->
      <div class="story-avatar-item my-story" onclick="window.storiesModule.promptAddStory()">
        <div class="avatar-ring-add">
          <img src="${window.apiClient ? window.apiClient.safeUrl(myAvatar) : myAvatar}" alt="My Story" />
          <span class="story-add-badge">+</span>
        </div>
        <span class="story-user-label">Your Story</span>
      </div>

      <!-- Friends Stories -->
      ${this.stories.map((s, idx) => `
        <div class="story-avatar-item" onclick="window.storiesModule.openStory(${idx})">
          <div class="avatar-ring-gradient ${s.hasUnseen ? 'unseen' : 'seen'}">
            <img src="${window.apiClient ? window.apiClient.safeUrl(s.userAvatar) : s.userAvatar}" alt="${window.apiClient ? window.apiClient.escapeHtml(s.userDisplayName) : s.userDisplayName}" />
          </div>
          <span class="story-user-label">${window.apiClient ? window.apiClient.escapeHtml((s.userDisplayName || s.username || "User").split(' ')[0]) : (s.userDisplayName || "User")}</span>
        </div>
      `).join("")}
    `;
  }

  openStory(storyIndex) {
    this.currentStoryIndex = storyIndex;
    this.currentItemIndex = 0;
    const story = this.stories[this.currentStoryIndex];
    if (!story) return;

    story.hasUnseen = false;
    this.viewer.classList.add("active");
    this.renderCurrentStoryItem();
    if (window.app) window.app.playSound('pop');
  }

  renderCurrentStoryItem() {
    const story = this.stories[this.currentStoryIndex];
    if (!story || !story.items || !story.items.length) {
      this.closeStory();
      return;
    }

    const item = story.items[this.currentItemIndex];
    if (!item) {
      if (this.currentStoryIndex < this.stories.length - 1) {
        this.currentStoryIndex++;
        this.currentItemIndex = 0;
        this.renderCurrentStoryItem();
      } else {
        this.closeStory();
      }
      return;
    }

    // Header info
    const avatarEl = document.getElementById("story-author-avatar");
    const nameEl = document.getElementById("story-author-name");
    const timeEl = document.getElementById("story-timestamp");
    if (avatarEl) avatarEl.src = window.apiClient ? window.apiClient.safeUrl(story.userAvatar) : story.userAvatar;
    if (nameEl) nameEl.innerText = story.userDisplayName || story.username;
    if (timeEl) timeEl.innerText = item.timestamp || "Recent";

    // Segmented progress bars
    const progressContainer = document.getElementById("story-progress-segments");
    if (progressContainer) {
      progressContainer.innerHTML = story.items.map((_, i) => `
        <div class="story-segment">
          <div class="segment-fill" id="segment-fill-${i}" style="width: ${i < this.currentItemIndex ? '100%' : '0%'}"></div>
        </div>
      `).join("");
    }

    // Image & Caption
    const imgElem = document.getElementById("story-media-image");
    if (imgElem) imgElem.src = window.apiClient ? window.apiClient.safeUrl(item.mediaUrl) : item.mediaUrl;
    const captionElem = document.getElementById("story-caption-text");
    if (captionElem) captionElem.innerText = item.caption || "";

    // Start progress timer
    this.startProgress(item.duration || 5000);
  }

  startProgress(durationMs) {
    clearInterval(this.progressInterval);
    this.currentProgress = 0;
    const stepMs = 50;
    const increment = (stepMs / durationMs) * 100;

    this.progressInterval = setInterval(() => {
      if (this.isPaused) return;

      this.currentProgress += increment;
      const fill = document.getElementById(`segment-fill-${this.currentItemIndex}`);
      if (fill) fill.style.width = `${Math.min(this.currentProgress, 100)}%`;

      if (this.currentProgress >= 100) {
        clearInterval(this.progressInterval);
        this.nextItem();
      }
    }, stepMs);
  }

  nextItem() {
    clearInterval(this.progressInterval);
    const story = this.stories[this.currentStoryIndex];
    if (!story) return;

    if (this.currentItemIndex < story.items.length - 1) {
      this.currentItemIndex++;
      this.renderCurrentStoryItem();
    } else {
      if (this.currentStoryIndex < this.stories.length - 1) {
        this.currentStoryIndex++;
        this.currentItemIndex = 0;
        this.renderCurrentStoryItem();
      } else {
        this.closeStory();
      }
    }
  }

  prevItem() {
    clearInterval(this.progressInterval);
    if (this.currentItemIndex > 0) {
      this.currentItemIndex--;
      this.renderCurrentStoryItem();
    } else {
      if (this.currentStoryIndex > 0) {
        this.currentStoryIndex--;
        const prevStory = this.stories[this.currentStoryIndex];
        this.currentItemIndex = prevStory ? Math.max(0, prevStory.items.length - 1) : 0;
        this.renderCurrentStoryItem();
      } else {
        this.currentItemIndex = 0;
        this.renderCurrentStoryItem();
      }
    }
  }

  closeStory() {
    clearInterval(this.progressInterval);
    if (this.viewer) this.viewer.classList.remove("active");
  }

  setupViewerControls() {
    const closeBtn = document.getElementById("btn-close-story");
    if (closeBtn) closeBtn.onclick = () => this.closeStory();

    const mediaArea = document.getElementById("story-touch-area");
    if (mediaArea) {
      mediaArea.addEventListener("click", (e) => {
        const rect = mediaArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width * 0.3) {
          this.prevItem();
        } else {
          this.nextItem();
        }
      });

      mediaArea.addEventListener("mousedown", () => { this.isPaused = true; });
      mediaArea.addEventListener("mouseup", () => { this.isPaused = false; });
      mediaArea.addEventListener("touchstart", () => { this.isPaused = true; }, { passive: true });
      mediaArea.addEventListener("touchend", () => { this.isPaused = false; });
    }
  }

  promptAddStory() {
    if (window.app) {
      window.app.switchTab("snaps");
      window.app.showToast("Take a photo with the Camera to add to Your Story! 📸");
    }
  }
}

window.storiesModule = new StoriesModule();
