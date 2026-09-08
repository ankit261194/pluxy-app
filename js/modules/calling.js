// Pluxy Voice & Video Calling: True WebRTC Architecture with WebSocket Signaling
class CallingModule {
  constructor() {
    this.modal = null;
    this.incomingModal = null;
    this.callTimer = null;
    this.seconds = 0;
    this.isMuted = false;
    this.isVideo = true;
    this.ringInterval = null;
    this.localStream = null;
    this.peerConnection = null;
    this.activeTargetUserId = null;
    this.activeContact = { name: "Contact", avatar: "assets/pluxy-icon.png" };
    this.iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ];
  }

  init() {
    this.modal = document.getElementById("calling-screen-modal");
    this.incomingModal = document.getElementById("incoming-call-modal");
    this.setupControls();
  }

  // Called when a WebRTC signal is received over WebSocket
  async handleSignalingMessage(data) {
    const action = data.action;
    const senderId = data.senderId;
    const payload = data.payload || {};

    if (action === "call_request") {
      // Incoming call received
      this.activeTargetUserId = senderId;
      this.activeContact = {
        name: payload.callerName || "Pluxy User",
        avatar: payload.callerAvatar || "assets/pluxy-icon.png"
      };
      this.isVideo = payload.callType === "video";
      this.showIncomingCallDialog(this.activeContact.name, this.activeContact.avatar);
    } else if (action === "call_accept") {
      // Callee accepted, create SDP offer
      document.getElementById("calling-status-text").innerText = "Connecting WebRTC...";
      await this.createOffer();
    } else if (action === "call_reject") {
      this.stopRingtone();
      if (window.app) window.app.showToast("Call was declined / user busy. 📵");
      this.endCall(false);
    } else if (action === "sdp_offer") {
      await this.handleOffer(payload.sdp);
    } else if (action === "sdp_answer") {
      await this.handleAnswer(payload.sdp);
    } else if (action === "ice_candidate") {
      if (this.peerConnection && payload.candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {}
      }
    } else if (action === "call_end") {
      this.endCall(false);
    }
  }

  createPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    // Send local ICE candidates to peer
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.activeTargetUserId) {
        this.sendSignal("ice_candidate", { candidate: event.candidate });
      }
    };

    // Attach remote stream tracks when received
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Received remote stream track:", event.track.kind);
      this.stopRingtone();
      document.getElementById("calling-status-text").innerText = "Connected 🟢";
      this.startTimer();

      const remoteVid = document.getElementById("calling-remote-video");
      if (remoteVid && event.streams[0]) {
        remoteVid.srcObject = event.streams[0];
        remoteVid.play().catch(e => console.warn(e));
      }
    };

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
  }

  async startCall(targetUserId, contactName, contactAvatar, isVideo = true) {
    if (!this.modal) return;
    this.activeTargetUserId = targetUserId || "user_peer";
    this.activeContact = { name: contactName, avatar: contactAvatar };
    this.isVideo = isVideo;
    this.seconds = 0;
    this.isMuted = false;

    document.getElementById("calling-contact-name").innerText = contactName;
    document.getElementById("calling-contact-avatar").src = contactAvatar;
    document.getElementById("calling-status-text").innerText = isVideo ? "Pluxy Video Calling..." : "Pluxy Voice Calling...";
    document.getElementById("calling-timer").innerText = "Ringing...";

    const videoContainer = document.getElementById("call-video-streams-container");
    const voiceContainer = document.getElementById("call-voice-avatar-container");
    if (isVideo) {
      videoContainer.style.display = "block";
      voiceContainer.style.display = "none";
      await this.initLocalMedia(true);
    } else {
      videoContainer.style.display = "none";
      voiceContainer.style.display = "flex";
      await this.initLocalMedia(false);
    }

    this.modal.classList.add("active");
    this.playRingtone();

    // Send call request signal to target peer via WebSocket
    const user = window.authModule ? window.authModule.currentUser : null;
    this.sendSignal("call_request", {
      callerName: user ? user.displayName : "Pluxy User",
      callerAvatar: user ? user.avatar : "assets/pluxy-icon.png",
      callType: isVideo ? "video" : "voice"
    });
  }

  showIncomingCallDialog(contactName, contactAvatar) {
    if (!this.incomingModal) return;
    document.getElementById("incoming-caller-name").innerText = contactName;
    document.getElementById("incoming-caller-avatar").src = contactAvatar;
    this.incomingModal.classList.add("active");
    this.playRingtone();
  }

  async acceptIncomingCall() {
    this.stopRingtone();
    if (this.incomingModal) this.incomingModal.classList.remove("active");

    await this.initLocalMedia(this.isVideo);
    this.createPeerConnection();

    this.modal.classList.add("active");
    document.getElementById("calling-contact-name").innerText = this.activeContact.name;
    document.getElementById("calling-contact-avatar").src = this.activeContact.avatar;
    document.getElementById("calling-status-text").innerText = "Connecting...";

    this.sendSignal("call_accept", {});
  }

  declineIncomingCall() {
    this.stopRingtone();
    if (this.incomingModal) this.incomingModal.classList.remove("active");
    this.sendSignal("call_reject", {});
    if (window.app) window.app.showToast("Call declined ❌");
  }

  async initLocalMedia(video = true) {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => t.stop());
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { facingMode: "user" } : false,
        audio: true
      });

      const localVid = document.getElementById("calling-local-video-feed");
      if (localVid) {
        localVid.srcObject = this.localStream;
        localVid.play().catch(e => console.warn(e));
      }
    } catch (err) {
      console.warn("[WebRTC] Could not capture media devices:", err);
      if (window.app) window.app.showToast("Camera/Mic access denied or unavailable. ⚠️");
    }
  }

  async createOffer() {
    this.createPeerConnection();
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.sendSignal("sdp_offer", { sdp: offer });
  }

  async handleOffer(offer) {
    this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.sendSignal("sdp_answer", { sdp: answer });
  }

  async handleAnswer(answer) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  sendSignal(action, payload) {
    if (window.chatModule && typeof window.chatModule.sendSocketPayload === "function") {
      window.chatModule.sendSocketPayload({
        type: "webrtc_signal",
        action: action,
        targetUserId: this.activeTargetUserId,
        payload: payload
      });
    }
  }

  playRingtone() {
    this.stopRingtone();
    if (!window.app || !window.app.audioCtx) return;
    const ctx = window.app.audioCtx;

    const playTone = () => {
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        gain.gain.value = 0.08;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      } catch (e) {}
    };

    playTone();
    this.ringInterval = setInterval(playTone, 3000);
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

  endCall(notifyRemote = true) {
    this.stopRingtone();
    clearInterval(this.callTimer);

    if (notifyRemote && this.activeTargetUserId) {
      this.sendSignal("call_end", {});
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    const dur = this.seconds > 0 ? `${this.seconds}s` : "Ended";
    if (window.app) window.app.showToast(`Call ended (${dur}) 📞`);

    if (this.modal) this.modal.classList.remove("active");
    if (this.incomingModal) this.incomingModal.classList.remove("active");
  }

  setupControls() {
    const endBtn = document.getElementById("btn-end-call");
    if (endBtn) endBtn.onclick = () => this.endCall(true);

    const acceptBtn = document.getElementById("btn-accept-call");
    if (acceptBtn) acceptBtn.onclick = () => this.acceptIncomingCall();

    const declineBtn = document.getElementById("btn-decline-call");
    if (declineBtn) declineBtn.onclick = () => this.declineIncomingCall();

    const muteBtn = document.getElementById("btn-mute-audio");
    if (muteBtn) {
      muteBtn.onclick = () => {
        this.isMuted = !this.isMuted;
        if (this.localStream) {
          this.localStream.getAudioTracks().forEach(t => t.enabled = !this.isMuted);
        }
        muteBtn.classList.toggle("active", this.isMuted);
        if (window.app) window.app.showToast(this.isMuted ? "Muted 🔇" : "Unmuted 🎙️");
      };
    }
  }
}

window.callingModule = new CallingModule();
