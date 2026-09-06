// Instagram + Snapchat 24-Hour Stories Module
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
  }

  init() {
    this.renderTray();
    this.setupViewerControls();
  }

  renderTray() {
    const stories = window.omniStore.getStories();
    const currentUser = window.omniStore.getCurrentUser();
    if (!this.tray) return;

    this.tray.innerHTML = `
      <!-- My Story Add Button -->
      <div class="story-avatar-item my-story" onclick="window.storiesModule.promptAddStory()">
        <div class="avatar-ring-add">
          <img src="${currentUser.avatar}" alt="My Story" />
          <span class="story-add-badge">+</span>
        </div>
        <span class="story-user-label">Your Story</span>
      </div>

      <!-- Friends Stories -->
      ${stories.map((s, idx) => `
        <div class="story-avatar-item" onclick="window.storiesModule.openStory(${idx})">
          <div class="avatar-ring-gradient ${s.hasUnseen ? 'unseen' : 'seen'}">
            <img src="${s.userAvatar}" alt="${s.userDisplayName}" />
          </div>
          <span class="story-user-label">${s.userDisplayName.split(' ')[0]}</span>
        </div>
      `).join("")}
    `;
  }

  openStory(storyIndex) {
    this.currentStoryIndex = storyIndex;
    this.currentItemIndex = 0;
    const stories = window.omniStore.getStories();
    const story = stories[this.currentStoryIndex];
    if (!story) return;

    story.hasUnseen = false;
    window.omniStore.save();
    this.renderTray();

    this.viewer.classList.add("active");
    this.renderCurrentStoryItem();
    window.app.playSound('pop');
  }

  renderCurrentStoryItem() {
    const stories = window.omniStore.getStories();
    const story = stories[this.currentStoryIndex];
    if (!story) {
      this.closeStory();
      return;
    }

    const item = story.items[this.currentItemIndex];
    if (!item) {
      // Next user story or close
      if (this.currentStoryIndex < stories.length - 1) {
        this.currentStoryIndex++;
        this.currentItemIndex = 0;
        this.renderCurrentStoryItem();
      } else {
        this.closeStory();
      }
      return;
    }

    // Header info
    document.getElementById("story-author-avatar").src = story.userAvatar;
    document.getElementById("story-author-name").innerText = story.userDisplayName;
    document.getElementById("story-timestamp").innerText = item.timestamp;

    // Segmented progress bars
    const progressContainer = document.getElementById("story-progress-segments");
    progressContainer.innerHTML = story.items.map((_, i) => `
      <div class="story-segment">
        <div class="segment-fill" id="segment-fill-${i}" style="width: ${i < this.currentItemIndex ? '100%' : '0%'}"></div>
      </div>
    `).join("");

    // Image & Caption
    const imgElem = document.getElementById("story-media-image");
    imgElem.src = item.mediaUrl;
    document.getElementById("story-caption-text").innerText = item.caption || "";

    // Start progress timer (5 seconds)
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
    const stories = window.omniStore.getStories();
    const story = stories[this.currentStoryIndex];
    if (!story) return;

    if (this.currentItemIndex < story.items.length - 1) {
      this.currentItemIndex++;
      this.renderCurrentStoryItem();
    } else {
      if (this.currentStoryIndex < stories.length - 1) {
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
        const prevStory = window.omniStore.getStories()[this.currentStoryIndex];
        this.currentItemIndex = prevStory.items.length - 1;
        this.renderCurrentStoryItem();
      } else {
        this.renderCurrentStoryItem();
      }
    }
  }

  closeStory() {
    clearInterval(this.progressInterval);
    this.viewer.classList.remove("active");
  }

  setupViewerControls() {
    const closeBtn = document.getElementById("btn-close-story");
    if (closeBtn) closeBtn.onclick = () => this.closeStory();

    const mediaArea = document.getElementById("story-touch-area");
    if (mediaArea) {
      // Tap navigation: Left 30% = prev, Right 70% = next
      mediaArea.addEventListener("click", (e) => {
        const rect = mediaArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width * 0.3) {
          this.prevItem();
        } else {
          this.nextItem();
        }
      });

      // Press and hold to pause
      mediaArea.addEventListener("mousedown", () => { this.isPaused = true; });
      mediaArea.addEventListener("mouseup", () => { this.isPaused = false; });
      mediaArea.addEventListener("touchstart", () => { this.isPaused = true; }, { passive: true });
      mediaArea.addEventListener("touchend", () => { this.isPaused = false; });
    }
  }

  promptAddStory() {
    window.app.switchTab("snaps");
    window.app.showToast("Take a photo with the Camera to add to Your Story! ??");
  }
}

window.storiesModule = new StoriesModule();
