// WhatsApp Style Messaging & AI Smart Replies Module
class ChatModule {
  constructor() {
    this.listContainer = document.getElementById("chats-list-container");
    this.chatDetailModal = document.getElementById("chat-detail-modal");
    this.activeChatId = null;
    this.activeFilter = "all";
    this.isRecording = false;
    this.recordTimer = null;
    this.recordSeconds = 0;
  }

  init() {
    this.renderChatList();
    this.setupChatControls();
  }

  renderChatList() {
    let chats = window.omniStore.getChats();
    if (this.activeFilter === "unread") {
      chats = chats.filter(c => c.unreadCount > 0);
    } else if (this.activeFilter === "groups") {
      chats = chats.filter(c => c.isGroup);
    }

    if (!this.listContainer) return;

    this.listContainer.innerHTML = `
      <!-- WhatsApp Filter Tabs & Incoming Call Demo -->
      <div class="chat-filter-pills">
        <button class="pill-btn ${this.activeFilter === 'all' ? 'active' : ''}" onclick="window.chatModule.setFilter('all')">All</button>
        <button class="pill-btn ${this.activeFilter === 'unread' ? 'active' : ''}" onclick="window.chatModule.setFilter('unread')">Unread</button>
        <button class="pill-btn ${this.activeFilter === 'groups' ? 'active' : ''}" onclick="window.chatModule.setFilter('groups')">Groups</button>
        <button class="pill-btn highlight-call" onclick="window.callingModule.triggerIncomingCall('Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200')">📞 Receive Call</button>
      </div>

      <!-- Chats List -->
      <div class="chat-items-stream">
        ${chats.map(chat => `
          <div class="chat-item-row" onclick="window.chatModule.openChat('${chat.id}')">
            <div class="chat-avatar-wrapper">
              <img src="${chat.avatar}" alt="${chat.name}" class="chat-avatar-img" />
              ${chat.isOnline ? '<span class="online-indicator-dot"></span>' : ''}
            </div>

            <div class="chat-meta-content">
              <div class="chat-meta-top">
                <span class="chat-name-title">
                  ${chat.name}
                  ${chat.streak > 0 ? `<span class="streak-mini-badge">🔥${chat.streak}</span>` : ''}
                </span>
                <span class="chat-meta-time ${chat.unreadCount > 0 ? 'highlight' : ''}">${chat.lastTime}</span>
              </div>

              <div class="chat-meta-bottom">
                <span class="chat-snippet-text">
                  <span class="ticks-icon">✓✓</span>
                  ${chat.lastMessage}
                </span>
                ${chat.unreadCount > 0 ? `<span class="unread-count-bubble">${chat.unreadCount}</span>` : ''}
              </div>
            </div>

            <!-- Quick Direct Call Buttons -->
            <div class="chat-row-actions">
              <button class="chat-quick-call-btn" onclick="event.stopPropagation(); window.callingModule.startCall('${chat.name}', '${chat.avatar}', false)" title="Voice Call">
                <i class="ph-fill ph-phone"></i>
              </button>
              <button class="chat-quick-call-btn" onclick="event.stopPropagation(); window.callingModule.startCall('${chat.name}', '${chat.avatar}', true)" title="Video Call">
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

  openChat(chatId) {
    this.activeChatId = chatId;
    const chat = window.omniStore.getChats().find(c => c.id === chatId);
    if (!chat) return;

    // Reset unread count
    chat.unreadCount = 0;
    window.omniStore.save();
    this.renderChatList();

    // Setup Header
    document.getElementById("chat-view-name").innerText = chat.name;
    document.getElementById("chat-view-avatar").src = chat.avatar;
    document.getElementById("chat-view-status").innerText = chat.isOnline ? "Online" : "Last seen recently";

    this.renderMessages(chat);
    this.chatDetailModal.classList.add("active");
    window.app.playSound('pop');

    // Trigger AI Smart Replies
    this.updateSmartReplies(chat);
  }

  renderMessages(chat) {
    const stream = document.getElementById("chat-messages-stream");
    if (!stream) return;

    stream.innerHTML = chat.messages.map(msg => {
      const isMe = msg.sender === "me";
      return `
        <div class="chat-bubble-wrap ${isMe ? 'outgoing' : 'incoming'}">
          <div class="chat-bubble">
            ${!isMe && chat.isGroup ? `<div class="group-sender-tag">${msg.sender}</div>` : ''}
            
            ${msg.isAudio ? `
              <div class="audio-note-player" onclick="window.chatModule.playAudioVoiceNote(this)">
                <button class="audio-play-btn"><i class="ph-fill ph-play"></i></button>
                <div class="audio-waveform-bars">
                  <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
                <span class="audio-duration-tag">${msg.audioDuration || '0:10'}</span>
              </div>
            ` : `
              <p class="bubble-text">${msg.text}</p>
            `}

            <div class="bubble-info-meta">
              <span class="bubble-time">${msg.time}</span>
              ${isMe ? '<span class="ticks-read">✓✓</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    stream.scrollTop = stream.scrollHeight;
  }

  async updateSmartReplies(chat) {
    const container = document.getElementById("chat-smart-replies-bar");
    if (!container) return;

    const lastMsg = chat.messages[chat.messages.length - 1];
    const context = lastMsg ? (lastMsg.text || "voice note") : "hello";

    container.innerHTML = '<span class="ai-chips-loading"><i class="ph-bold ph-sparkle spin"></i> Gemini thinking replies...</span>';

    try {
      const replies = await window.geminiService.generateSmartReplies(context);
      container.innerHTML = `
        <div class="smart-reply-label"><i class="ph-fill ph-sparkle"></i> Gemini Smart Replies:</div>
        <div class="smart-reply-chips-row">
          ${replies.map(r => `
            <button class="reply-chip" onclick="window.chatModule.sendQuickReply('${r.replace(/'/g, "\\'")}')">${r}</button>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = '';
    }
  }

  sendQuickReply(text) {
    this.sendMessage(text);
  }

  sendMessage(text) {
    if (!this.activeChatId || !text.trim()) return;

    const res = window.omniStore.addMessage(this.activeChatId, text.trim());
    if (res) {
      this.renderMessages(res.chat);
      window.app.playSound('sent');
      this.updateSmartReplies(res.chat);

      // Trigger automatic realistic reply after 2 seconds
      setTimeout(() => {
        this.simulateIncomingReply(res.chat);
      }, 2500);
    }
  }

  simulateIncomingReply(chat) {
    if (this.activeChatId !== chat.id) return;

    const replies = [
      "That's awesome! Loved testing this feature 🔥",
      "Haha perfect! This super-app is so fast 🚀",
      "Awesome, talk to you in a bit! 👍",
      "Let's share this in the community group too!"
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const incoming = {
      id: "m_" + Date.now(),
      sender: "them",
      text: randomReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "delivered"
    };

    chat.messages.push(incoming);
    chat.lastMessage = randomReply;
    chat.lastTime = incoming.time;
    window.omniStore.save();

    this.renderMessages(chat);
    window.app.playSound('receive');
    this.updateSmartReplies(chat);
  }

  playAudioVoiceNote(elem) {
    const icon = elem.querySelector(".audio-play-btn i");
    const bars = elem.querySelectorAll(".audio-waveform-bars span");

    if (elem.classList.contains("playing")) {
      elem.classList.remove("playing");
      icon.className = "ph-fill ph-play";
      bars.forEach(b => b.classList.remove("animating"));
    } else {
      elem.classList.add("playing");
      icon.className = "ph-fill ph-pause";
      bars.forEach(b => b.classList.add("animating"));
      window.app.playSound('ding');

      setTimeout(() => {
        elem.classList.remove("playing");
        icon.className = "ph-fill ph-play";
        bars.forEach(b => b.classList.remove("animating"));
      }, 4000);
    }
  }

  setupChatControls() {
    const backBtn = document.getElementById("btn-back-chat");
    if (backBtn) {
      backBtn.onclick = () => {
        this.chatDetailModal.classList.remove("active");
        this.activeChatId = null;
        this.renderChatList();
      };
    }

    const input = document.getElementById("chat-text-input");
    const sendBtn = document.getElementById("btn-chat-send");
    const micBtn = document.getElementById("btn-chat-mic");

    if (sendBtn && input) {
      sendBtn.onclick = () => {
        const txt = input.value;
        if (txt.trim()) {
          this.sendMessage(txt);
          input.value = "";
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendBtn.click();
        }
      });
    }

    if (micBtn) {
      micBtn.onclick = () => {
        if (!this.isRecording) {
          // Start voice recording simulation
          this.isRecording = true;
          micBtn.classList.add("recording");
          window.app.showToast("🎙️ Recording voice note... Tap again to send!");
          window.app.playSound('ding');
        } else {
          // Stop & send
          this.isRecording = false;
          micBtn.classList.remove("recording");
          if (this.activeChatId) {
            const res = window.omniStore.addMessage(this.activeChatId, "", true, "0:08");
            if (res) {
              this.renderMessages(res.chat);
              window.app.playSound('sent');
              window.app.showToast("Voice note sent! 🎵");
            }
          }
        }
      };
    }

    // Call buttons
    const callBtn = document.getElementById("btn-chat-call");
    const videoBtn = document.getElementById("btn-chat-video");
    if (callBtn) {
      callBtn.onclick = () => {
        const chat = window.omniStore.getChats().find(c => c.id === this.activeChatId);
        if (chat && window.callingModule) {
          window.callingModule.startCall(chat.name, chat.avatar, false);
        }
      };
    }
    if (videoBtn) {
      videoBtn.onclick = () => {
        const chat = window.omniStore.getChats().find(c => c.id === this.activeChatId);
        if (chat && window.callingModule) {
          window.callingModule.startCall(chat.name, chat.avatar, true);
        }
      };
    }
  }
}

window.chatModule = new ChatModule();
