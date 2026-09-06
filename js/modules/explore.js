// Instagram Explore & Discovery Module
class ExploreModule {
  constructor() {
    this.container = document.getElementById("explore-grid-container");
    this.activeTag = "all";
    this.items = [
      { id: "ex_1", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600", tag: "Travel", likes: "12.4K", isReel: false },
      { id: "ex_2", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600", tag: "AI", likes: "48.2K", isReel: true },
      { id: "ex_3", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600", tag: "Tech", likes: "8.9K", isReel: false },
      { id: "ex_4", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600", tag: "Aesthetic", likes: "15.1K", isReel: false },
      { id: "ex_5", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", tag: "Travel", likes: "29.8K", isReel: true },
      { id: "ex_6", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600", tag: "AI", likes: "33.5K", isReel: false }
    ];
  }

  init() {
    this.renderExplore();
  }

  renderExplore() {
    if (!this.container) return;
    const filtered = this.activeTag === "all" ? this.items : this.items.filter(i => i.tag.toLowerCase() === this.activeTag.toLowerCase());

    this.container.innerHTML = `
      <div class="explore-tags-scroll">
        <button class="explore-tag-chip ${this.activeTag === 'all' ? 'active' : ''}" onclick="window.exploreModule.setTag('all')">🔥 Trending</button>
        <button class="explore-tag-chip ${this.activeTag === 'ai' ? 'active' : ''}" onclick="window.exploreModule.setTag('ai')">🤖 AI & Tech</button>
        <button class="explore-tag-chip ${this.activeTag === 'travel' ? 'active' : ''}" onclick="window.exploreModule.setTag('travel')">🏔️ Travel</button>
        <button class="explore-tag-chip ${this.activeTag === 'aesthetic' ? 'active' : ''}" onclick="window.exploreModule.setTag('aesthetic')">🎨 Aesthetic</button>
      </div>

      <div class="explore-masonry-grid">
        ${filtered.map(item => `
          <div class="explore-grid-cell ${item.isReel ? 'featured-tall' : ''}" onclick="window.feedModule.openComments('post_1')">
            <img src="${item.img}" alt="Explore item" loading="lazy" />
            ${item.isReel ? '<span class="explore-reel-indicator"><i class="ph-fill ph-video-camera"></i></span>' : ''}
            <div class="explore-hover-badge">
              <i class="ph-fill ph-heart"></i> ${item.likes}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  setTag(tag) {
    this.activeTag = tag;
    this.renderExplore();
    window.app.playSound('pop');
  }
}

window.exploreModule = new ExploreModule();