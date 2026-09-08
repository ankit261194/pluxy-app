// Pluxy WhatsApp-Style Messaging: Real WebSocket & REST Persistence Architecture
class ChatModule {
  constructor() {
    this.listContainer = document.getElementById("chats-list-container");
    this.chatDetailModal = document.getElementById("chat-detail-modal");
    this.activeChatId = null;
    this.activeFilter = "all";
    this.socket = null;
    this.reconnectTimer = null;
    this.cachedChats = [];
  }

  init() {
    this.loadChats();
    this.initWebSocket();
    this.setupChatControls();
  }

  initWebSocket() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const token = window.apiClient ? window.apiClient.getToken() : "";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:8080";
    const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("[ChatWS] Real-time WebSocket connection established 🟢");
      };

      this.socket.onmessage = (event) => {
        try {
          const data = json_or_null(event.data);
          if (!data) return;

          if (data.type === "new_message") {
            this.handleIncomingMessage(data.chatId, data.message);
          } else if (data.type === "webrtc_signal") {
            if (window.callingModule && typeof window.callingModule.handleSignalingMessage === "function") {
              window.callingModule.handleSignalingMessage(data);
            }
          } else if (data.type === "presence_update") {
            this.handlePresenceUpdate(data.payload.userId, data.payload.isOnline);
          }
        } catch (e) {
          console.warn("[ChatWS] Error parsing message:", e);
        }
      };

      this.socket.onclose = () => {
        console.log("[ChatWS] WebSocket closed. Reconnecting in 3s...");
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.initWebSocket(), 3000);
      };

      this.socket.onerror = (err) => {
        console.warn("[ChatWS] WebSocket error:", err);
      };
    } catch (e) {
      console.warn("[ChatWS] Could not start WebSocket:", e);
    }
  }

  sendSocketPayload(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  async loadChats() {
    try {
      const res = await window.apiClient.get("/api/chats");
      if (res && res.success) {
        this.cachedChats = res.chats || [];
        this.renderChatList();
      }
    } catch (e) {
      // Fallback to local store if server unreachable
      if (window.omniStore) {
        this.cachedChats = window.omniStore.getChats() || [];
        this.renderChatList();
      }
    }
  }

  renderChatList() {
    let chats = this.cachedChats;
    if (this.activeFilter === "unread") {
      chats = chats.filter(c => c.unreadCount > 0);
    } else if (this.activeFilter === "groups") {
      chats = chats.filter(c => c.isGroup);
    }

    if (!this.listContainer) return;

    this.listContainer.innerHTML = `
      <!-- WhatsApp Filter Tabs -->
      <div class="chat-filter-pills">
        <button class="pill-btn ${this.activeFilter === 'all' ? 'active' : ''}" onclick="window.chatModule.setFilter('all')">All</button>
        <button class="pill-btn ${this.activeFilter === 'unread' ? 'active' : ''}" onclick="window.chatModule.setFilter('unread')">Unread</button>
        <button class="pill-btn ${this.activeFilter === 'groups' ? 'active' : ''}" onclick="window.chatModule.setFilter('groups')">Groups</button>
      </div>

      <!-- Chats List -->
      <div class="chat-items-stream">
        ${chats.map(chat => `
          <div class="chat-item-row" onclick="window.chatModule.openChat('${window.apiClient.escapeHtml(chat.id)}')">
            <div class="chat-avatar-wrapper">
              <img src="${window.apiClient.safeUrl(chat.avatar)}" alt="${window.apiClient.escapeHtml(chat.name)}" class="chat-avatar-img" />
              ${chat.isOnline ? '<span class="online-indicator-dot"></span>' : ''}
            </div>

            <div class="chat-meta-content">
              <div class="chat-meta-top">
                <span class="chat-name-title">
                  ${window.apiClient.escapeHtml(chat.name)}
                  ${chat.streak > 0 ? `<span class="streak-mini-badge">🔥${chat.streak}</span>` : ''}
                </span>
                <span class="chat-meta-time ${chat.unreadCount > 0 ? 'highlight' : ''}">${window.apiClient.escapeHtml(chat.lastTime || '')}</span>
              </div>

              <div class="chat-meta-bottom">
                <span class="chat-snippet-text">
                  <span class="ticks-icon">✓✓</span>
                  ${window.apiClient.escapeHtml(chat.lastMessage || '')}
                </span>
                ${chat.unreadCount > 0 ? `<span class="unread-count-bubble">${chat.unreadCount}</span>` : ''}
              </div>
            </div>

            <!-- Quick Direct Call Buttons -->
            <div class="chat-row-actions">
              <button class="chat-quick-call-btn" onclick="event.stopPropagation(); window.callingModule.startCall('${chat.id}', '${window.apiClient.escapeHtml(chat.name)}', '${window.apiClient.safeUrl(chat.avatar)}', false)" title="Voice Call">
                <i class="ph-fill ph-phone"></i>
              </button>
              <button class="chat-quick-call-btn" onclick="event.stopPropagation(); window.callingModule.startCall('${chat.id}', '${window.apiClient.escapeHtml(chat.name)}', '${window.apiClient.safeUrl(chat.avatar)}', true)" title="Video Call">
                <i class="ph-fill ph-video-camera"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.renderChatList();
  }

  async openChat(chatId) {
    this.activeChatId = chatId;
    const chat = this.cachedChats.find(c => c.id === chatId) || {
      id: chatId,
      name: "Chat Conversation",
      avatar: "assets/pluxy-icon.png",
      isOnline: false
    };

    chat.unreadCount = 0;
    this.renderChatList();

    // Setup Header
    const nameEl = document.getElementById("chat-view-name");
    const avatarEl = document.getElementById("chat-view-avatar");
    const statusEl = document.getElementById("chat-view-status");

    if (nameEl) nameEl.innerText = chat.name;
    if (avatarEl) avatarEl.src = chat.avatar;
    if (statusEl) statusEl.innerText = chat.isOnline ? "Online" : "Active on Pluxy";

    this.chatDetailModal.classList.add("active");
    if (window.app) window.app.playSound('pop');

    // Load persistent messages from backend
    try {
      const res = await window.apiClient.get(`/api/chats/${chatId}/messages`);
      if (res && res.success) {
        this.renderMessages(res.messages || []);
      }
    } catch (e) {
      // Fallback
      const storeChat = window.omniStore ? window.omniStore.getChats().find(c => c.id === chatId) : null;
      this.renderMessages((storeChat && storeChat.messages) || []);
    }
  }

  renderMessages(messages) {
    const stream = document.getElementById("chat-messages-stream");
    if (!stream) return;

    stream.innerHTML = messages.map(msg => {
      const isMe = msg.sender === "me";
      return `
        <div class="chat-bubble-wrap ${isMe ? 'outgoing' : 'incoming'}">
          <div class="chat-bubble">
            ${!isMe && msg.sender ? `<div class="group-sender-tag">${window.apiClient.escapeHtml(msg.sender)}</div>` : ''}
            
            <p class="bubble-text">${window.apiClient.escapeHtml(msg.text || '')}</p>

            <div class="bubble-info-meta">
              <span class="bubble-time">${window.apiClient.escapeHtml(msg.time || '')}</span>
              ${isMe ? '<span class="ticks-read">✓✓</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    stream.scrollTop = stream.scrollHeight;
  }

  async sendMessage(text) {
    if (!this.activeChatId || !text.trim()) return;

    const content = text.trim();
    const input = document.getElementById("chat-input-field");
    if (input) input.value = "";

    try {
      const res = await window.apiClient.post(`/api/chats/${this.activeChatId}/messages`, {
        content: content,
        message_type: "text"
      });

      if (res && res.success && res.message) {
        this.appendMessageToStream(res.message);
        if (window.app) window.app.playSound('sent');
      }
    } catch (err) {
      console.warn("[Chat] Send message failed, saving to local state:", err);
      // Optimistic local append
      this.appendMessageToStream({
        sender: "me",
        text: content,
        time: "Just now"
      });
    }
  }

  appendMessageToStream(msg) {
    const stream = document.getElementById("chat-messages-stream");
    if (!stream) return;

    const isMe = msg.sender === "me" || msg.senderId === (window.authModule.currentUser ? window.authModule.currentUser.id : null);
    const div = document.createElement("div");
    div.className = `chat-bubble-wrap ${isMe ? 'outgoing' : 'incoming'}`;
    div.innerHTML = `
      <div class="chat-bubble">
        <p class="bubble-text">${window.apiClient.escapeHtml(msg.text || msg.content || '')}</p>
        <div class="bubble-info-meta">
          <span class="bubble-time">${window.apiClient.escapeHtml(msg.time || 'Just now')}</span>
          ${isMe ? '<span class="ticks-read">✓✓</span>' : ''}
        </div>
      </div>
    `;
    stream.appendChild(div);
    stream.scrollTop = stream.scrollHeight;
  }

  handleIncomingMessage(chatId, message) {
    if (this.activeChatId === chatId) {
      this.appendMessageToStream(message);
      if (window.app) window.app.playSound('pop');
    } else {
      const c = this.cachedChats.find(x => x.id === chatId);
      if (c) {
        c.unreadCount = (c.unreadCount || 0) + 1;
        c.lastMessage = message.text;
        this.renderChatList();
      }
      if (window.app) {
        window.app.showToast(`💬 New message: ${window.apiClient.escapeHtml(message.text || '')}`);
        window.app.playSound('ding');
      }
    }
  }

  handlePresenceUpdate(userId, isOnline) {
    const c = this.cachedChats.find(x => x.id === userId || x.otherUserId === userId);
    if (c) {
      c.isOnline = isOnline;
      this.renderChatList();
    }
  }

  setupChatControls() {
    const sendBtn = document.getElementById("btn-chat-send-msg");
    const input = document.getElementById("chat-input-field");
    if (sendBtn && input) {
      sendBtn.onclick = () => this.sendMessage(input.value);
      input.onkeydown = (e) => {
        if (e.key === "Enter") this.sendMessage(input.value);
      };
    }

    const closeBtn = document.getElementById("btn-close-chat-detail");
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.chatDetailModal.classList.remove("active");
        this.activeChatId = null;
      };
    }
  }
}

function json_or_null(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

window.chatModule = new ChatModule();
