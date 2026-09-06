// WhatsApp Voice & Video Calling Service with Real Dual-Video & Ringtone
class CallingModule {
  constructor() {
    this.modal = null;
    this.incomingModal = null;
    this.callTimer = null;
    this.seconds = 0;
    this.isMuted = false;
    this.isVideo = true;
    this.ringInterval = null;
    this.activeContact = { name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" };
    this.localStream = null;
  }

  init() {
    this.modal = document.getElementById("calling-screen-modal");
    this.incomingModal = document.getElementById("incoming-call-modal");
    this.setupControls();
  }

  // Start an Outgoing Call (Voice or Video)
  async startCall(contactName, contactAvatar, isVideo = true) {
    if (!this.modal) return;
    this.activeContact = { name: contactName, avatar: contactAvatar };
    this.isVideo = isVideo;
    this.seconds = 0;
    this.isMuted = false;

    document.getElementById("calling-contact-name").innerText = contactName;
    document.getElementById("calling-contact-avatar").src = contactAvatar;
    document.getElementById("calling-status-text").innerText = isVideo ? "WhatsApp Video Calling..." : "WhatsApp Voice Calling...";
    document.getElementById("calling-timer").innerText = "Ringing...";

    // Configure Video or Voice visual layout
    const videoContainer = document.getElementById("call-video-streams-container");
    const voiceContainer = document.getElementById("call-voice-avatar-container");
    if (isVideo) {
      videoContainer.style.display = "block";
      voiceContainer.style.display = "none";
      await this.initLocalVideo();
    } else {
      videoContainer.style.display = "none";
      voiceContainer.style.display = "flex";
    }

    this.modal.classList.add("active");
    this.playRingtone();

    // Answer call after 2.8 seconds
    setTimeout(() => {
      this.stopRingtone();
      document.getElementById("calling-status-text").innerText = "End-to-End Encrypted";
      this.startTimer();
      window.app.playSound('ding');
      window.app.showToast(`Connected with ${contactName} 🟢 (HD Audio & Video)`);
    }, 2800);
  }

  // Simulate an Incoming Video Call from Priya Sharma
  triggerIncomingCall(contactName = "Priya Sharma", contactAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200") {
    if (!this.incomingModal) return;
    this.activeContact = { name: contactName, avatar: contactAvatar };

    document.getElementById("incoming-caller-name").innerText = contactName;
    document.getElementById("incoming-caller-avatar").src = contactAvatar;

    this.incomingModal.classList.add("active");
    this.playRingtone();
    window.app.playSound('pop');
  }

  acceptIncomingCall() {
    this.stopRingtone();
    if (this.incomingModal) this.incomingModal.classList.remove("active");
    this.startCall(this.activeContact.name, this.activeContact.avatar, true);
  }

  declineIncomingCall() {
    this.stopRingtone();
    if (this.incomingModal) this.incomingModal.classList.remove("active");
    window.app.showToast("Call declined ❌");
    window.app.playSound('pop');
  }

  async initLocalVideo() {
    try {
      const localVid = document.getElementById("calling-local-video-feed");
      if (localVid) {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        localVid.srcObject = this.localStream;
        localVid.play();
      }
    } catch (e) {
      console.warn("Local camera PiP fallback:", e);
    }
  }

  playRingtone() {
    this.stopRingtone();
    if (!window.app.audioCtx) return;
    const ctx = window.app.audioCtx;

    const playTone = () => {
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dual Tone Multi-Frequency 440Hz + 480Hz
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        gain.gain.value = 0.09;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } catch (e) {}
    };

    playTone();
    this.ringInterval = setInterval(playTone, 3200);
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  startTimer() {
    clearInterval(this.callTimer);
    this.seconds = 0;
    this.callTimer = setInterval(() => {
      this.seconds++;
      const mins = String(Math.floor(this.seconds / 60)).padStart(2, '0');
      const secs = String(this.seconds % 60).padStart(2, '0');
      const timerElem = document.getElementById("calling-timer");
      if (timerElem) timerElem.innerText = `${mins}:${secs}`;
    }, 1000);
  }

  endCall() {
    this.stopRingtone();
    clearInterval(this.callTimer);

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    const dur = this.seconds > 0 ? `${this.seconds}s` : "Call missed";
    window.app.showToast(`Call ended (${dur}) 📞`);
    window.app.playSound('pop');

    if (this.modal) this.modal.classList.remove("active");
  }

  setupControls() {
    const endBtn = document.getElementById("btn-end-call");
    if (endBtn) endBtn.onclick = () => this.endCall();

    const muteBtn = document.getElementById("btn-toggle-mute");
    if (muteBtn) {
      muteBtn.onclick = () => {
        this.isMuted = !this.isMuted;
        muteBtn.classList.toggle("active", this.isMuted);
        muteBtn.innerHTML = this.isMuted ? '<i class="ph-fill ph-microphone-slash"></i>' : '<i class="ph-fill ph-microphone"></i>';
        window.app.showToast(this.isMuted ? "Microphone muted 🔇" : "Microphone active 🎙️");
        window.app.playSound('pop');
      };
    }

    const videoBtn = document.getElementById("btn-toggle-video-call");
    if (videoBtn) {
      videoBtn.onclick = () => {
        this.isVideo = !this.isVideo;
        const videoContainer = document.getElementById("call-video-streams-container");
        const voiceContainer = document.getElementById("call-voice-avatar-container");
        if (this.isVideo) {
          videoContainer.style.display = "block";
          voiceContainer.style.display = "none";
          this.initLocalVideo();
        } else {
          videoContainer.style.display = "none";
          voiceContainer.style.display = "flex";
        }
        window.app.showToast(this.isVideo ? "Video enabled 📹" : "Video switched to Audio 📞");
        window.app.playSound('pop');
      };
    }

    // Incoming Call buttons
    const acceptBtn = document.getElementById("btn-accept-incoming-call");
    const declineBtn = document.getElementById("btn-decline-incoming-call");
    if (acceptBtn) acceptBtn.onclick = () => this.acceptIncomingCall();
    if (declineBtn) declineBtn.onclick = () => this.declineIncomingCall();
  }
}

window.callingModule = new CallingModule();