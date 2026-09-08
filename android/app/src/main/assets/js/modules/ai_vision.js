// Gemini Multimodal AI Vision & Photo Aesthetic Analyzer
class AIVisionModule {
  constructor() {
    this.container = document.getElementById("ai-vision-container");
    this.selectedImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";
    this.analysisResult = null;
  }

  init() {
    this.renderScanner();
  }

  renderScanner() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="vision-scanner-card">
        <div class="vision-header">
          <div class="vision-title"><i class="ph-fill ph-sparkle" style="color: #8A2BE2;"></i> Gemini Vision Aesthetic Scanner</div>
          <span class="badge-subtle">Multimodal AI</span>
        </div>

        <p class="vision-desc">Select or upload any photo. Gemini will analyze the lighting, color composition, aesthetic vibe, and generate viral captions!</p>

        <div class="vision-preview-box">
          <img src="${this.selectedImage}" id="vision-preview-img" alt="Scan Image" />
          <div class="vision-scan-line"></div>
        </div>

        <!-- Sample Image Presets -->
        <div class="vision-preset-row">
          <span style="font-size: 11px; color: var(--text-muted);">Try Sample:</span>
          <button class="preset-thumb-btn" onclick="window.aiVisionModule.pickImage('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800')">🏔️ Mountain</button>
          <button class="preset-thumb-btn" onclick="window.aiVisionModule.pickImage('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800')">💻 Tech</button>
          <button class="preset-thumb-btn" onclick="window.aiVisionModule.pickImage('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800')">🏺 Pottery</button>
          <button class="preset-thumb-btn" onclick="window.aiVisionModule.pickImage('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800')">🌅 Sunset</button>
        </div>

        <button class="btn-scan-action" id="btn-run-vision-scan" onclick="window.aiVisionModule.runScan()">
          <i class="ph-bold ph-scan"></i> Analyze Photo with Gemini Vision ✨
        </button>

        <!-- Result Box -->
        <div class="vision-result-card" id="vision-result-box" style="display: none;"></div>
      </div>
    `;
  }

  pickImage(url) {
    this.selectedImage = url;
    document.getElementById("vision-preview-img").src = url;
    document.getElementById("vision-result-box").style.display = "none";
    window.app.playSound('pop');
  }

  async runScan() {
    const btn = document.getElementById("btn-run-vision-scan");
    const resultBox = document.getElementById("vision-result-box");
    const scanLine = document.querySelector(".vision-scan-line");

    if (!this.selectedImage) {
      if (window.app) window.app.showToast("Please select a photo to analyze!");
      return;
    }

    btn.innerHTML = '<i class="ph ph-spinner spin"></i> Analyzing with Gemini Vision...';
    btn.disabled = true;
    if (scanLine) scanLine.classList.add("active");
    if (window.app) window.app.playSound('ding');

    try {
      if (!window.apiClient || !window.apiClient.getToken()) {
        throw new Error("Please log in to use Gemini AI Vision analysis.");
      }

      const res = await window.apiClient.post("/api/ai/vision", {
        image: this.selectedImage,
        prompt: "Analyze this photo for aesthetic quality, composition, lighting, color harmony, and give a score from 1 to 10."
      });

      if (scanLine) scanLine.classList.remove("active");
      btn.innerHTML = '<i class="ph-bold ph-scan"></i> Analyze Photo with Gemini Vision ✨';
      btn.disabled = false;

      if (res && res.success && res.analysis) {
        let score = "8.8";
        let title = "Aesthetic Quality Analysis 🌟";
        let summary = res.analysis;

        // Try parsing JSON structure if Gemini returned JSON
        try {
          const match = res.analysis.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.score) score = Number(parsed.score).toFixed(1);
            if (parsed.title) title = parsed.title;
            if (parsed.summary) summary = parsed.summary;
          }
        } catch (ignored) {}

        resultBox.style.display = "block";
        resultBox.innerHTML = `
          <div class="score-badge-row">
            <div class="score-circle">
              <strong>${window.apiClient ? window.apiClient.escapeHtml(score) : score}</strong>
              <span>/ 10</span>
            </div>
            <div>
              <div class="score-title">${window.apiClient ? window.apiClient.escapeHtml(title) : title}</div>
              <div class="score-sub">${window.apiClient ? window.apiClient.escapeHtml(summary.slice(0, 140)) : summary.slice(0, 140)}...</div>
            </div>
          </div>

          <div class="vibe-tags-row">
            <span class="vibe-tag">#GeminiVision</span>
            <span class="vibe-tag">#AestheticReview</span>
            <span class="vibe-tag">#PluxyAI</span>
          </div>

          <div class="ai-generated-caption-box">
            <span class="caption-label"><i class="ph-bold ph-sparkle"></i> Gemini Analysis Summary:</span>
            <p id="vision-suggested-text">${window.apiClient ? window.apiClient.escapeHtml(summary) : summary}</p>
            <button class="btn-use-caption" onclick="window.aiVisionModule.postThisDirectly()">Publish This Directly to Feed 🚀</button>
          </div>
        `;
        if (window.app) window.app.playSound('ding');
      } else {
        throw new Error((res && res.detail) || "Analysis failed.");
      }
    } catch (err) {
      if (scanLine) scanLine.classList.remove("active");
      btn.innerHTML = '<i class="ph-bold ph-scan"></i> Analyze Photo with Gemini Vision ✨';
      btn.disabled = false;
      const errMsg = err.message || "AI Vision is temporarily unavailable. Check backend GEMINI_API_KEY.";
      if (window.app) {
        window.app.showToast(errMsg);
        window.app.playSound('pop');
      }
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; color: #EF4444; font-size: 13px;">
          <strong><i class="ph-bold ph-warning"></i> AI Vision Unavailable:</strong><br/>
          ${window.apiClient ? window.apiClient.escapeHtml(errMsg) : errMsg}
        </div>
      `;
    }
  }

  async postThisDirectly() {
    const textEl = document.getElementById("vision-suggested-text");
    const text = textEl ? textEl.innerText.slice(0, 300) : "Captured with Pluxy ✨";
    
    try {
      if (window.apiClient && window.apiClient.getToken()) {
        const res = await window.apiClient.post("/api/posts", {
          content: text,
          media_url: this.selectedImage,
          media_type: "image"
        });

        if (res && res.success) {
          if (window.feedModule) await window.feedModule.renderPosts();
          if (window.app) {
            window.app.switchTab("feed");
            window.app.showToast("Post created and published directly with Gemini AI! 🎉");
            window.app.playSound('sent');
          }
          return;
        }
      }
      throw new Error("Failed to publish post.");
    } catch (err) {
      if (window.app) window.app.showToast(`Could not publish post: ${err.message || "Error"}`);
    }
  }
}

window.aiVisionModule = new AIVisionModule();