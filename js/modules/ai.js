// Gemini 1.5 / 2.0 Flash Lifetime AI Assistant Tab
class AIModule {
  constructor() {
    this.messagesContainer = document.getElementById("ai-messages-container");
    this.input = document.getElementById("ai-chat-input");
    this.sendBtn = document.getElementById("btn-ai-send");
  }

  init() {
    this.renderInitialGreeting();
    this.setupControls();
  }

  renderInitialGreeting() {
    if (!this.messagesContainer) return;
    const history = window.geminiService.conversationHistory;

    this.messagesContainer.innerHTML = history.map(msg => `
      <div class="ai-msg-bubble-wrap ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}">
        <div class="ai-avatar-badge">
          ${msg.role === 'user' ? '<img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"/>' : '<div class="gemini-sparkle-avatar">✨</div>'}
        </div>
        <div class="ai-msg-content">
          <div class="ai-sender-name">${msg.role === 'user' ? 'You' : 'Omni AI (Gemini Flash)'}</div>
          <div class="ai-bubble-card">${this.formatAiText(msg.parts[0].text)}</div>
        </div>
      </div>
    `).join('');
  }

  formatAiText(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br/>');
  }

  async sendPrompt(text) {
    if (!text.trim()) return;

    // Append user message immediately
    const userWrap = document.createElement("div");
    userWrap.className = "ai-msg-bubble-wrap user-msg";
    userWrap.innerHTML = `
      <div class="ai-avatar-badge">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"/>
      </div>
      <div class="ai-msg-content">
        <div class="ai-sender-name">You</div>
        <div class="ai-bubble-card">${this.formatAiText(text)}</div>
      </div>
    `;
    this.messagesContainer.appendChild(userWrap);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    window.app.playSound('sent');

    // Thinking indicator
    const thinkingWrap = document.createElement("div");
    thinkingWrap.className = "ai-msg-bubble-wrap bot-msg thinking-bubble";
    thinkingWrap.innerHTML = `
      <div class="ai-avatar-badge"><div class="gemini-sparkle-avatar">✨</div></div>
      <div class="ai-msg-content">
        <div class="ai-sender-name">Omni AI</div>
        <div class="ai-bubble-card"><span class="ai-typing-dots"><span></span><span></span><span></span></span></div>
      </div>
    `;
    this.messagesContainer.appendChild(thinkingWrap);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    // Send to Gemini Service
    try {
      const result = await window.geminiService.sendChatMessage(text);
      thinkingWrap.remove();

      const botWrap = document.createElement("div");
      botWrap.className = "ai-msg-bubble-wrap bot-msg";
      botWrap.innerHTML = `
        <div class="ai-avatar-badge"><div class="gemini-sparkle-avatar">✨</div></div>
        <div class="ai-msg-content">
          <div class="ai-sender-name">Omni AI ${result.isLive ? '<span class="live-api-tag">Live API</span>' : '<span class="smart-mode-tag">Smart Mode</span>'}</div>
          <div class="ai-bubble-card">${this.formatAiText(result.text)}</div>
        </div>
      `;
      this.messagesContainer.appendChild(botWrap);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      window.app.playSound('receive');
    } catch (e) {
      thinkingWrap.remove();
      console.error(e);
    }
  }

  setupControls() {
    if (this.sendBtn && this.input) {
      this.sendBtn.onclick = () => {
        const val = this.input.value;
        if (val.trim()) {
          this.sendPrompt(val);
          this.input.value = "";
        }
      };

      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendBtn.click();
        }
      });
    }

    // Preset Prompt Chips
    document.querySelectorAll(".ai-prompt-chip").forEach(chip => {
      chip.onclick = () => {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt) this.sendPrompt(prompt);
      };
    });
  }
}

window.aiModule = new AIModule();
