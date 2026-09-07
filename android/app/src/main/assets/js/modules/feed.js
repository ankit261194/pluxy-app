// Instagram + Facebook Media Feed Module
class FeedModule {
  constructor() {
    this.container = document.getElementById("feed-posts-container");
  }

  init() {
    this.renderPosts();
    this.setupPostCreator();
  }

  renderPosts() {
    const posts = window.omniStore.getPosts();
    if (!this.container) return;

    const ads = (window.omniStore.getSponsoredAds ? window.omniStore.getSponsoredAds() : [])
      .filter(a => a.active && (a.placement === 'feed' || a.placement === 'all'));

    let html = '';
    let adIndex = 0;

    posts.forEach((post, index) => {
      html += `
        <article class="post-card" data-post-id="${post.id}">
          <!-- Header -->
          <div class="post-header">
            <div class="post-author" onclick="window.app.viewProfile('${post.author.id}')">
              <div class="avatar-ring-sm">
                <img src="${post.author.avatar}" alt="${post.author.displayName}" class="author-avatar" />
              </div>
              <div>
                <div class="author-name">${post.author.displayName} <span class="verified-badge">✓</span></div>
                <div class="post-time">@${post.author.username} • ${post.timestamp}</div>
              </div>
            </div>
            <button class="icon-btn-ghost"><i class="ph ph-dots-three-vertical"></i></button>
          </div>

          <!-- Media with double tap like -->
          <div class="post-media-container" ondblclick="window.feedModule.handleDoubleTap('${post.id}', this)">
            <img src="${post.image}" alt="Post Media" class="post-media" loading="lazy" />
            <div class="heart-burst"><i class="ph-fill ph-heart"></i></div>
          </div>

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
            <strong>${post.likes.toLocaleString()} likes</strong>
          </div>

          <!-- Caption -->
          <div class="post-caption-box">
            <span class="caption-user">${post.author.username}</span>
            <span class="caption-text">${this.formatCaption(post.caption)}</span>
          </div>

          <!-- View Comments trigger -->
          <div class="post-comments-summary" onclick="window.feedModule.openComments('${post.id}')">
            View all ${post.comments.length} comments
          </div>
        </article>
      `;

      // Interleave active sponsored ad after every 2 posts
      if ((index + 1) % 2 === 0 && ads.length > 0) {
        const ad = ads[adIndex % ads.length];
        adIndex++;
        if (window.omniStore.recordAdImpression) {
          window.omniStore.recordAdImpression(ad.id);
        }
        html += `
          <article class="post-card sponsored-ad-card" data-ad-id="${ad.id}">
            <!-- Sponsored Ad Header -->
            <div class="post-header">
              <div class="post-author" onclick="window.feedModule.handleAdClick('${ad.id}', '${ad.linkUrl}')">
                <div class="avatar-ring-sm sponsored-ring">
                  <img src="${ad.logo}" alt="${ad.brand}" class="author-avatar" />
                </div>
                <div>
                  <div class="author-name">
                    ${ad.brand} <span class="sponsored-badge">Sponsored ⚡</span>
                  </div>
                  <div class="post-time">Promoted Partner • Tap to view offer</div>
                </div>
              </div>
              <button class="icon-btn-ghost" title="Ad Info" onclick="window.app.showToast('Official Sponsored Partner on Pluxy 🚀')">
                <i class="ph-bold ph-info"></i>
              </button>
            </div>

            <!-- Ad Media Banner -->
            <div class="post-media-container" onclick="window.feedModule.handleAdClick('${ad.id}', '${ad.linkUrl}')">
              <img src="${ad.mediaUrl}" alt="${ad.headline}" class="post-media" loading="lazy" />
              <div class="sponsored-media-overlay">
                <span class="sponsored-tag-pill">Sponsored Partner</span>
              </div>
            </div>

            <!-- Ad CTA Bar -->
            <div class="sponsored-cta-bar" onclick="window.feedModule.handleAdClick('${ad.id}', '${ad.linkUrl}')">
              <div class="sponsored-cta-info">
                <strong>${ad.headline}</strong>
                <span>${ad.description}</span>
              </div>
              <button class="btn-ad-cta">
                ${ad.ctaText} <i class="ph-bold ph-arrow-up-right"></i>
              </button>
            </div>
          </article>
        `;
      }
    });

    this.container.innerHTML = html;
  }

  handleAdClick(adId, linkUrl) {
    if (window.omniStore.recordAdClick) {
      window.omniStore.recordAdClick(adId);
    }
    window.app.showToast("Opening sponsored partner link... 🚀");
    window.app.playSound('ding');
    window.open(linkUrl, "_blank");
  }

  formatCaption(text) {
    if (!text) return "";
    return text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>').replace(/\n/g, '<br/>');
  }

  toggleLike(postId) {
    const post = window.omniStore.toggleLikePost(postId);
    if (post) {
      if (!post.isLiked) delete post.reaction;
      this.renderPosts();
      window.app.playSound('like');
    }
  }

  setReaction(postId, emoji) {
    const post = window.omniStore.data.posts.find(p => p.id === postId);
    if (post) {
      post.reaction = emoji;
      post.isLiked = true;
      window.omniStore.save();
      this.renderPosts();
      window.app.showToast(`Reacted with ${emoji} to post!`);
      window.app.playSound('like');
    }
  }

  handleDoubleTap(postId, container) {
    const post = window.omniStore.data.posts.find(p => p.id === postId);
    if (post && !post.isLiked) {
      window.omniStore.toggleLikePost(postId);
      this.renderPosts();
    }
    const heart = container.querySelector(".heart-burst");
    if (heart) {
      heart.classList.remove("active");
      void heart.offsetWidth; // trigger reflow
      heart.classList.add("active");
      window.app.playSound('like');
    }
  }

  openComments(postId) {
    const post = window.omniStore.data.posts.find(p => p.id === postId);
    if (!post) return;
    window.app.activePostId = postId;

    const modal = document.getElementById("comments-modal");
    const list = document.getElementById("comments-list");
    list.innerHTML = post.comments.map(c => `
      <div class="comment-item">
        <div class="comment-bubble">
          <strong class="comment-author">@${c.user}</strong>
          <p class="comment-text">${c.text}</p>
        </div>
        <span class="comment-time">${c.time}</span>
      </div>
    `).join("") || '<p class="empty-hint">No comments yet. Be the first to comment!</p>';

    modal.classList.add("active");
  }

  sharePost(postId) {
    window.app.showToast("Post link copied to clipboard! 🔗 Share anywhere");
    window.app.playSound('pop');
  }

  setupPostCreator() {
    const aiBtn = document.getElementById("btn-ai-generate-caption");
    const captionInput = document.getElementById("post-create-caption");
    const topicInput = document.getElementById("post-create-topic");

    if (aiBtn) {
      aiBtn.addEventListener("click", async () => {
        const topic = topicInput.value.trim() || "Inspiring social media post about tech and living the best life";
        aiBtn.innerHTML = '<i class="ph ph-spinner spin"></i> AI Writing...';
        aiBtn.disabled = true;

        try {
          const generatedCaption = await window.geminiService.generatePostCaption(topic);
          captionInput.value = generatedCaption;
          window.app.showToast("✨ AI Caption generated successfully!");
          window.app.playSound('ding');
        } catch (e) {
          console.error(e);
        } finally {
          aiBtn.innerHTML = '<i class="ph-bold ph-sparkle"></i> ✨ AI Generate Caption & Hashtags';
          aiBtn.disabled = false;
        }
      });
    }

    const submitBtn = document.getElementById("btn-submit-post");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const caption = captionInput.value.trim();
        const imgUrl = document.getElementById("post-create-image").value.trim();
        if (!caption && !imgUrl) {
          window.app.showToast("Please write a caption or provide an image! 📸");
          return;
        }

        window.omniStore.addPost(caption, imgUrl);
        document.getElementById("create-post-modal").classList.remove("active");
        captionInput.value = "";
        topicInput.value = "";
        this.renderPosts();
        window.app.showToast("Post shared to Feed successfully! 🎉");
        window.app.playSound('ding');
      });
    }
  }
}

window.feedModule = new FeedModule();