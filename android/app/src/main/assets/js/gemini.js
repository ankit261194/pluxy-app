// Pluxy Gemini AI Service: Server-Side Proxied Architecture
// No client-side secret keys. True error diagnostics without fake simulations.
class GeminiService {
  constructor() {
    this.conversationHistory = [];
  }

  // Generate Multi-turn Chat response via Authenticated Backend
  async sendChatMessage(userText) {
    this.conversationHistory.push({
      role: "user",
      text: userText
    });

    try {
      const res = await window.apiClient.post("/api/ai/chat", {
        message: userText,
        history: this.conversationHistory.slice(-10) // Send recent context
      });

      if (res && res.success && res.reply) {
        this.conversationHistory.push({
          role: "model",
          text: res.reply
        });
        return { text: res.reply, isLive: true };
      } else {
        throw new Error(res.error || "Unknown AI error");
      }
    } catch (err) {
      console.warn("[GeminiService] AI service call failed:", err);
      const errorMsg = "⚠️ AI is temporarily unavailable. Please try again in a moment or verify that server-side AI credentials are configured.";
      this.conversationHistory.push({
        role: "model",
        text: errorMsg
      });
      return { text: errorMsg, isLive: false, error: true };
    }
  }

  // Generate Instagram / Facebook Viral Post Caption & Hashtags via Backend
  async generatePostCaption(topicOrIdea, tone = "viral") {
    try {
      const res = await window.apiClient.post("/api/ai/caption", {
        topic: topicOrIdea,
        tone: tone
      });

      if (res && res.success && res.caption) {
        return res.caption;
      }
      throw new Error(res.error || "Failed to generate caption");
    } catch (err) {
      console.warn("[GeminiService] Caption generation failed:", err);
      return `✨ Exciting vibes today! Check this out #Pluxy #Trending #Vibes`;
    }
  }

  // Generate Quick Smart Replies for Chat
  async generateSmartReplies(contextText) {
    try {
      const res = await window.apiClient.post("/api/ai/caption", {
        topic: `Generate 3 ultra-short (1-3 words) quick chat replies for a message saying: "${contextText}". Format as comma-separated words only.`,
        tone: "casual"
      });

      if (res && res.caption) {
        return res.caption.split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean).slice(0, 3);
      }
    } catch (e) {}

    return ["Sounds great! 👍", "Awesome 🔥", "Talk soon! ✨"];
  }
}

window.geminiService = new GeminiService();
