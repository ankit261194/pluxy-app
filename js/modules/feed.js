// Instagram + Facebook Media Feed Module (Connected to Genuine Backend API)
class FeedModule {
  constructor() {
    this.container = document.getElementById("feed-posts-container");
    this.posts = [];
  }

  async init() {
    await this.renderPosts();
    this.setupPostCreator();
  }

  async renderPosts() {
    if (!this.container) return;

    // Fetch live posts from genuine backend
    if (window.apiClient) {
      try {
        const res = await window.apiClient.get("/posts?limit=30");
        if (res && res.success && Array.isArray(res.posts)) {
          this.posts = res.posts;
        }
      } catch (err) {
        console.warn("Could not fetch posts from backend, trying local store:", err);
      }
    }

    if (!this.posts.length && window.omniStore && typeof window.omniStore.getPosts === "function") {
      this.posts = window.omniStore.getPosts();
    }

    const ads = (window.omniStore && window.omniStore.getSponsoredAds ? window.omniStore.getSponsoredAds() : [])
      .filter(a => a.active && (a.placement === 'feed' || a.placement === 'all'));

    let html = '';
    let adIndex = 0;

    if (!this.posts.length) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #8E8E93;">
          <i class="ph-bold ph-newspaper" style="font-size: 40px; margin-bottom: 12px; display: block;"></i>
          <h3>No Posts in Feed Yet</h3>
          <p style="font-size: 13px; margin-top: 6px;">Be the first to share a post or photo with the community!</p>
          <button class="btn-admin-primary" style="margin-top: 14px; display: inline-flex;" onclick="document.getElementById('create-post-modal').classList.add('active')">
            <i class="ph-bold ph-plus-circle"></i> Create Post
          </button>
        </div>
      `;
      return;
    }

    this.posts.forEach((post, index) => {
      const author = post.author || {
        id: post.userId || "user",
        displayName: "User",
        username: "user",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        verified: false
      };

      const safeAuthorName = window.apiClient ? window.apiClient.escapeHtml(author.displayName) : author.displayName;
      const safeUsername = window.apiClient ? window.apiClient.escapeHtml(author.username) : author.username;
      const safeAvatar = window.apiClient ? window.apiClient.safeUrl(author.avatar) : author.avatar;
      const safeMedia = window.apiClient ? window.apiClient.safeUrl(post.image || post.media_url) : (post.image || post.media_url);

      html += `
        <article class="post-card" data-post-id="${post.id}">
          <!-- Header -->
          <div class="post-header">
            <div class="post-author" onclick="window.app.viewProfile('${author.id}')">
              <div class="avatar-ring-sm">
                <img src="${safeAvatar}" alt="${safeAuthorName}" class="author-avatar" />
              </div>
              <div>
                <div class="author-name">${safeAuthorName} ${author.verified ? '<span class="verified-badge">✓</span>' : ''}</div>
                <div class="post-time">@${safeUsername} • ${post.timestamp || "Recent"}</div>
              </div>
            </div>
            <button class="icon-btn-ghost"><i class="ph ph-dots-three-vertical"></i></button>
          </div>

          <!-- Media with double tap like -->
          ${safeMedia ? `
            <div class="post-media-container" ondblclick="window.feedModule.handleDoubleTap('${post.id}', this)">
              <img src="${safeMedia}" alt="Post Media" class="post-media" loading="lazy" />
              <div class="heart-burst"><i class="ph-fill ph-heart"></i></div>
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="post-actions">
            <div class="action-group">
              <div class="fb-reaction-wrapper">
                <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" onclick="window.feedModule.toggleLike('${post.id}')">
                  <span class="reaction-active-display">${post.reaction || '<i class="ph-fill ph-heart heart-icon"></i>'}</span>
                </button>
                <div class="fb-reactions-bar">
                  <span onclick="window.feedModule.setReaction('${post.id}', '👍')">👍</span>
                  <span onclick="window.feedModule.setReaction('${post.id}', '❤️')">❤️</span>
                  <span onclick="window.feedModule.setReaction('${post.id}', '😂')">😂</span>
                  <span onclick="window.feedModule.setReaction('${post.id}', '😮')">😮</span>
                  <span onclick="window.feedModule.setReaction('${post.id}', '😢')">😢</span>
                  <span onclick="window.feedModule.setReaction('${post.id}', '😡')">😡</span>
                </div>
              </div>
              <button class="action-btn" onclick="window.feedModule.openComments('${post.id}')">
                <i class="ph-bold ph-chat-circle"></i>
              </button>
              <button class="action-btn" onclick="window.feedModule.sharePost('${post.id}')">
                <i class="ph-bold ph-paper-plane-tilt"></i>
              </button>
            </div>
            <button class="action-btn bookmark-btn" onclick="this.classList.toggle('saved'); window.app.showToast('Post saved to collection! 🔖')">
              <i class="ph-bold ph-bookmark-simple"></i>
            </button>
          </div>

          <!-- Likes counter -->
          <div class="post-likes-count">
            <strong id="post-likes-${post.id}">${(post.likes || 0).toLocaleString()} likes</strong>
          </div>

          <!-- Caption -->
          <div class="post-caption-box">
            <span class="caption-username">${safeUsername}</span>
            <span class="caption-text">${this.formatCaption(post.caption)}</span>
          </div>

          <!-- Comments preview -->
          ${(post.comments && post.comments.length > 0) ? `
            <div class="post-comments-preview" onclick="window.feedModule.openComments('${post.id}')">
              View all ${(post.comments_count || post.comments.length)} comments
            </div>
            <div class="preview-comment">
              <strong>${window.apiClient ? window.apiClient.escapeHtml(post.comments[post.comments.length - 1].user) : post.comments[post.comments.length - 1].user}</strong> 
              ${window.apiClient ? window.apiClient.escapeHtml(post.comments[post.comments.length - 1].text) : post.comments[post.comments.length - 1].text}
            </div>
          ` : ''}
        </article>
      `;

      // Insert sponsored ad every 3 posts
      if ((index + 1) % 3 === 0 && ads.length > 0) {
        const ad = ads[adIndex % ads.length];
        adIndex++;
        html += this.renderSponsoredAdCard(ad);
      }
    });

    this.container.innerHTML = html;
  }

  renderSponsoredAdCard(ad) {
    const safeBrand = window.apiClient ? window.apiClient.escapeHtml(ad.brand) : ad.brand;
    const safeHeadline = window.apiClient ? window.apiClient.escapeHtml(ad.headline) : ad.headline;
    const safeDesc = window.apiClient ? window.apiClient.escapeHtml(ad.description) : ad.description;
    const safeMedia = window.apiClient ? window.apiClient.safeUrl(ad.mediaUrl) : ad.mediaUrl;
    const safeCta = window.apiClient ? window.apiClient.escapeHtml(ad.ctaText || "Learn More") : ad.ctaText;

    return `
      <article class="post-card sponsored-ad-card" data-ad-id="${ad.id}">
        <div class="post-header">
          <div class="post-author">
            <div class="avatar-ring-sm ad-logo-ring">
              <img src="${window.apiClient ? window.apiClient.safeUrl(ad.logo) : ad.logo}" alt="${safeBrand}" class="author-avatar" />
            </div>
            <div>
              <div class="author-name">${safeBrand} <span class="sponsored-pill">Sponsored • Ad</span></div>
              <div class="post-time">${safeHeadline}</div>
            </div>
          </div>
          <span class="ad-tag-corner">Sponsored</span>
        </div>

        <div class="post-media-container">
          <img src="${safeMedia}" alt="${safeHeadline}" class="post-media" loading="lazy" />
        </div>

        <div class="sponsored-cta-bar">
          <div class="sponsored-cta-info">
            <strong>${safeHeadline}</strong>
            <p>${safeDesc}</p>
          </div>
          <a href="${window.apiClient ? window.apiClient.safeUrl(ad.linkUrl) : ad.linkUrl}" target="_blank" class="btn-ad-cta">
            ${safeCta} <i class="ph-bold ph-arrow-square-out"></i>
          </a>
        </div>
      </article>
    `;
  }

  formatCaption(text) {
    if (!text) return "";
    const escaped = window.apiClient ? window.apiClient.escapeHtml(text) : text;
    return escaped.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>').replace(/\n/g, '<br/>');
  }

  async toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic UI update
    post.isLiked = !post.isLiked;
    post.likes = post.isLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1);
    if (!post.isLiked) delete post.reaction;
    this.updatePostLikeDOM(post);
    if (window.app) window.app.playSound('like');

    // Real backend request
    if (window.apiClient && window.apiClient.getToken()) {
      try {
        const res = await window.apiClient.post(`/posts/${postId}/like`);
        if (res && res.success) {
          post.isLiked = res.isLiked;
          post.likes = res.likesCount;
          this.updatePostLikeDOM(post);
        }
      } catch (err) {
        console.warn("Could not sync like to server:", err);
      }
    }
  }

  updatePostLikeDOM(post) {
    const card = document.querySelector(`.post-card[data-post-id="${post.id}"]`);
    if (!card) return;
    const likeBtn = card.querySelector(".like-btn");
    const countEl = document.getElementById(`post-likes-${post.id}`);
    if (likeBtn) {
      if (post.isLiked) {
        likeBtn.classList.add("liked");
      } else {
        likeBtn.classList.remove("liked");
      }
    }
    if (countEl) {
      countEl.innerText = `${(post.likes || 0).toLocaleString()} likes`;
    }
  }

  async setReaction(postId, emoji) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.reaction = emoji;
      post.isLiked = true;
      this.updatePostLikeDOM(post);
      if (window.app) {
        window.app.showToast(`Reacted with ${emoji}!`);
        window.app.playSound('like');
      }
    }
  }

  handleDoubleTap(postId, container) {
    this.toggleLike(postId);
    const heart = container.querySelector(".heart-burst");
    if (heart) {
      heart.classList.remove("active");
      void heart.offsetWidth;
      heart.classList.add("active");
    }
  }

  sharePost(postId) {
    const shareUrl = `${window.location.origin}/#post-${postId}`;
    if (navigator.share) {
      navigator.share({ title: "Pluxy Post", url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        if (window.app) window.app.showToast("Post link copied to clipboard! 📋");
      });
    }
  }

  async openComments(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    window.app.activePostId = postId;

    const modal = document.getElementById("comments-modal");
    const list = document.getElementById("comments-list");
    if (!modal || !list) return;

    list.innerHTML = `<div style="text-align: center; padding: 20px;"><i class="ph-bold ph-spinner spin"></i> Loading comments...</div>`;
    modal.classList.add("active");

    let comments = post.comments || [];
    if (window.apiClient) {
      try {
        const res = await window.apiClient.get(`/posts/${postId}/comments`);
        if (res && res.success && Array.isArray(res.comments)) {
          comments = res.comments;
          post.comments = comments;
        }
      } catch (e) {
        console.warn("Could not load comments from server:", e);
      }
    }

    if (comments.length === 0) {
      list.innerHTML = `<div class="empty-state-msg" style="padding: 24px; text-align: center; color: #8E8E93;">No comments yet. Be the first to say something! ✨</div>`;
    } else {
      list.innerHTML = comments.map(c => `
        <div class="comment-item">
          <img src="${window.apiClient ? window.apiClient.safeUrl(c.avatar) : c.avatar}" alt="${window.apiClient ? window.apiClient.escapeHtml(c.user) : c.user}" class="comment-avatar" />
          <div class="comment-body">
            <strong>${window.apiClient ? window.apiClient.escapeHtml(c.displayName || c.user) : c.user}</strong>
            <span>${window.apiClient ? window.apiClient.escapeHtml(c.text) : c.text}</span>
            <div class="comment-meta">${window.apiClient ? window.apiClient.escapeHtml(c.time || "Recent") : c.time}</div>
          </div>
        </div>
      `).join("");
    }
  }

  setupPostCreator() {
    const modal = document.getElementById("create-post-modal");
    const captionInput = document.getElementById("post-create-caption");
    const topicInput = document.getElementById("post-topic-input");
    const generateBtn = document.getElementById("btn-generate-ai-caption");
    const submitBtn = document.getElementById("btn-submit-post");

    // AI Caption Generator inside Post Creator
    if (generateBtn && topicInput && captionInput) {
      generateBtn.addEventListener("click", async () => {
        const topic = topicInput.value.trim();
        if (!topic) {
          if (window.app) window.app.showToast("Enter a topic first! ✨");
          return;
        }

        generateBtn.innerHTML = '<i class="ph ph-spinner spin"></i> Generating...';
        generateBtn.disabled = true;

        try {
          if (window.apiClient && window.apiClient.getToken()) {
            const res = await window.apiClient.post("/api/ai/caption", { topic: topic, tone: "viral" });
            if (res && res.success && res.caption) {
              captionInput.value = res.caption;
              if (window.app) {
                window.app.showToast("AI Caption generated! ✨");
                window.app.playSound('ding');
              }
              return;
            }
          }
          throw new Error("AI service unavailable.");
        } catch (err) {
          if (window.app) window.app.showToast(`AI Caption: ${err.message || "Unavailable"} ⚠️`);
        } finally {
          generateBtn.innerHTML = '<i class="ph-bold ph-sparkle"></i> Generate Caption';
          generateBtn.disabled = false;
        }
      });
    }

    // Submit new post to genuine backend
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const caption = captionInput ? captionInput.value.trim() : "";
        const imgUrlInput = document.getElementById("post-create-image");
        const imgUrl = imgUrlInput ? imgUrlInput.value.trim() : "";

        if (!caption && !imgUrl) {
          if (window.app) window.app.showToast("Please write a caption or provide an image! 📸");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-bold ph-spinner spin"></i> Sharing...';

        try {
          if (window.apiClient && window.apiClient.getToken()) {
            const res = await window.apiClient.post("/api/posts", {
              caption: caption,
              media_url: imgUrl || null
            });

            if (res && res.success) {
              if (modal) modal.classList.remove("active");
              if (captionInput) captionInput.value = "";
              if (topicInput) topicInput.value = "";
              if (imgUrlInput) imgUrlInput.value = "";
              await this.renderPosts();
              if (window.app) {
                window.app.showToast("Post shared to Feed successfully! 🎉");
                window.app.playSound('ding');
              }
              return;
            }
          } else {
            if (window.app) window.app.showToast("Please log in to publish posts! 🔒");
          }
        } catch (err) {
          if (window.app) window.app.showToast(`Could not publish post: ${err.message || "Error"}`);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Share Post 🚀';
        }
      });
    }
  }
}

window.feedModule = new FeedModule();
