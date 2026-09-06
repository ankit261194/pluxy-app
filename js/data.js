// Pluxy Central Seed Data & LocalStorage Store
const INITIAL_STATE = {
  currentUser: {
    id: "user_ankit",
    username: "ankit_chaudhary",
    displayName: "Ankit Chaudhary",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    role: "Founder & Lead Developer",
    phone: "8533955333",
    whatsapp: "+918533955333",
    email: "ankit@pluxy.app",
    bio: "Founder & Lead Developer of Pluxy 🚀 | All-in-One Super Social Media & Lifetime Gemini AI | 📞 8533955333",
    streakCount: 52,
    followers: 24500,
    following: 120,
    postsCount: 18,
    verified: true
  },
  
  stories: [
    {
      id: "story_1",
      userId: "user_priya",
      username: "priya_sharma",
      userDisplayName: "Priya Sharma",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      hasUnseen: true,
      items: [
        {
          id: "item_1_1",
          mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
          caption: "Morning hike in the mountains! 🏔️✨ The view is breathtaking!",
          timestamp: "2h ago",
          duration: 5000
        },
        {
          id: "item_1_2",
          mediaUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
          caption: "Finally stopped for some fresh mountain tea ☕",
          timestamp: "1h ago",
          duration: 5000
        }
      ]
    },
    {
      id: "story_2",
      userId: "user_sameer",
      username: "sameer_k",
      userDisplayName: "Sameer Khan",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      hasUnseen: true,
      items: [
        {
          id: "item_2_1",
          mediaUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
          caption: "Late night coding session with Gemini AI 💻🔥",
          timestamp: "3h ago",
          duration: 5000
        }
      ]
    },
    {
      id: "story_3",
      userId: "user_ananya",
      username: "ananya_roy",
      userDisplayName: "Ananya Roy",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      hasUnseen: true,
      items: [
        {
          id: "item_3_1",
          mediaUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
          caption: "Sunday artisan coffee vibes ☕🎨",
          timestamp: "4h ago",
          duration: 5000
        }
      ]
    },
    {
      id: "story_4",
      userId: "user_zara",
      username: "zara_patel",
      userDisplayName: "Zara Patel",
      userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      hasUnseen: false,
      items: [
        {
          id: "item_4_1",
          mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
          caption: "Golden hour at the beach 🌅🌊",
          timestamp: "8h ago",
          duration: 5000
        }
      ]
    }
  ],

  snaps: [
    {
      id: "snap_1",
      senderId: "user_priya",
      senderName: "Priya Sharma",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      mediaUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      caption: "Secret sneak peek! Don't tell anyone 🤫🔥",
      duration: 5,
      isOpened: false,
      timestamp: "5m ago"
    },
    {
      id: "snap_2",
      senderId: "user_sameer",
      senderName: "Sameer Khan",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      caption: "New AI model benchmark just dropped 🚀",
      duration: 6,
      isOpened: false,
      timestamp: "24m ago"
    },
    {
      id: "snap_3",
      senderId: "user_ananya",
      senderName: "Ananya Roy",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      mediaUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80",
      caption: "Aesthetic sunset snap 🌇",
      duration: 5,
      isOpened: true,
      timestamp: "2h ago"
    }
  ],

  posts: [
    {
      id: "post_ankit_launch",
      author: {
        id: "user_ankit",
        username: "ankit_chaudhary",
        displayName: "Ankit Chaudhary",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
      },
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80",
      caption: "Proud to launch Pluxy! 🚀 The all-in-one Super Social App uniting WhatsApp (Chat, Voice & Video Calling), Instagram (Feed, Reels & Stories), Facebook (Reactions & Profile), and Snapchat (AR Face Lenses & Disappearing Snaps) with Lifetime Google Gemini AI! 🤖✨\n\nBuilt with love by Ankit Chaudhary. Connect with me directly: 📞 +91 8533955333\n#Pluxy #SuperApp #TechFounder #AnkitChaudhary #GeminiAI",
      likes: 1840,
      isLiked: true,
      comments: [
        { id: "c_ankit_1", user: "priya_sharma", text: "The Snapchat AR filters and WhatsApp calling are insane Ankit! 🔥", time: "10m ago" },
        { id: "c_ankit_2", user: "sameer_k", text: "Truly revolutionary! All 4 apps in one single app 👏", time: "5m ago" }
      ],
      timestamp: "Just now"
    },
    {
      id: "post_1",
      author: {
        id: "user_priya",
        username: "priya_sharma",
        displayName: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
      },
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80",
      caption: "Road trip through the valleys! Finding peace in the middle of nowhere. Sometimes getting lost is the only way to find yourself 🌲✨\n#Wanderlust #TravelDiaries #MountainLife",
      likes: 428,
      isLiked: false,
      comments: [
        { id: "c1", user: "sameer_k", text: "Stunning shot Priya! Where is this?", time: "1h ago" },
        { id: "c2", user: "ankit_chaudhary", text: "The lighting is incredible 🏔️🔥", time: "30m ago" }
      ],
      timestamp: "2h ago"
    },
    {
      id: "post_2",
      author: {
        id: "user_sameer",
        username: "sameer_k",
        displayName: "Sameer Khan",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
      },
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&auto=format&fit=crop&q=80",
      caption: "Upgraded my development desk! Dual 4K displays, mechanical keyboard, and Gemini 2.0 Flash running our new Pluxy super app. Ready to ship! 🚀💻\n#CodeLife #SetupWars #DeveloperVibes #TechStack",
      likes: 312,
      isLiked: true,
      comments: [
        { id: "c3", user: "ananya_roy", text: "Clean cable management 👏", time: "2h ago" }
      ],
      timestamp: "4h ago"
    },
    {
      id: "post_3",
      author: {
        id: "user_ananya",
        username: "ananya_roy",
        displayName: "Ananya Roy",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
      },
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&auto=format&fit=crop&q=80",
      caption: "Weekend pottery and art session. Getting your hands dirty with clay is the best therapy for screen fatigue 🏺🎨\n#ArtTherapy #WeekendMood #PotteryWorkshop",
      likes: 589,
      isLiked: false,
      comments: [
        { id: "c4", user: "zara_patel", text: "I need to join you next time!!", time: "3h ago" }
      ],
      timestamp: "6h ago"
    }
  ],

  chats: [
    {
      id: "chat_priya",
      userId: "user_priya",
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      isOnline: true,
      streak: 14,
      unreadCount: 2,
      lastMessage: "Are you ready for the Pluxy launch today? 🚀",
      lastTime: "12:42 PM",
      messages: [
        { id: "m1", sender: "them", text: "Hey Ankit! Did you check out the Pluxy app build?", time: "12:38 PM", status: "read" },
        { id: "m2", sender: "me", text: "Yes! The WhatsApp + Insta + Snapchat blend is insane 🔥", time: "12:40 PM", status: "read" },
        { id: "m3", sender: "them", text: "And the Gemini AI lifetime integration + AR camera are so smooth!", time: "12:41 PM", status: "read" },
        { id: "m4", sender: "them", text: "Are you ready for the Pluxy launch today? 🚀", time: "12:42 PM", status: "delivered" }
      ]
    },
    {
      id: "chat_sameer",
      name: "Sameer Khan",
      userId: "user_sameer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      isOnline: false,
      streak: 9,
      unreadCount: 0,
      lastMessage: "Check out the new Gemini 2.0 Flash benchmarks!",
      lastTime: "11:15 AM",
      messages: [
        { id: "m20", sender: "them", text: "Bro, check out the new Gemini 2.0 Flash benchmarks!", time: "11:15 AM", status: "read" }
      ]
    },
    {
      id: "chat_ananya",
      name: "Ananya Roy",
      userId: "user_ananya",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isOnline: true,
      streak: 21,
      unreadCount: 1,
      lastMessage: "🎵 Voice note (0:14)",
      lastTime: "10:30 AM",
      messages: [
        { id: "m30", sender: "them", isAudio: true, audioDuration: "0:14", time: "10:30 AM", status: "delivered" }
      ]
    },
    {
      id: "chat_group_tech",
      name: "🚀 Omni Dev Community",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
      isOnline: true,
      isGroup: true,
      membersCount: 128,
      streak: 0,
      unreadCount: 5,
      lastMessage: "Zara: Let's test the disappearing snap feature!",
      lastTime: "9:15 AM",
      messages: [
        { id: "m40", sender: "Zara Patel", text: "Hey team, when are we launching the new build?", time: "9:10 AM", status: "read" },
        { id: "m41", sender: "Zara Patel", text: "Let's test the disappearing snap feature!", time: "9:15 AM", status: "delivered" }
      ]
    }
  ]
};

// State Store with LocalStorage Persistence
class Store {
  constructor() {
    const saved = localStorage.getItem("pluxy_store_v2");
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        // Guarantee Founder & Developer details are always up to date
        this.data.currentUser = INITIAL_STATE.currentUser;
        if (!this.data.reels) this.data.reels = INITIAL_STATE.reels;
        if (!this.data.mapFriends) this.data.mapFriends = INITIAL_STATE.mapFriends;
        if (!this.data.groups) this.data.groups = INITIAL_STATE.groups;
        if (!this.data.creatorWallets) this.data.creatorWallets = JSON.parse(JSON.stringify(INITIAL_STATE.creatorWallets || {}));
        if (!this.data.ads) this.data.ads = JSON.parse(JSON.stringify(INITIAL_STATE.ads || []));
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(INITIAL_STATE));
      }
    } else {
      this.data = JSON.parse(JSON.stringify(INITIAL_STATE));
      this.save();
    }
  }

  save() {
    localStorage.setItem("pluxy_store_v2", JSON.stringify(this.data));
  }

  getPosts() { return this.data.posts; }
  getStories() { return this.data.stories; }
  getSnaps() { return this.data.snaps; }
  getChats() { return this.data.chats; }
  getCurrentUser() { return this.data.currentUser; }

  toggleLikePost(postId) {
    const post = this.data.posts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      this.save();
      return post;
    }
    return null;
  }

  addComment(postId, text) {
    const post = this.data.posts.find(p => p.id === postId);
    if (post && text.trim()) {
      const comment = {
        id: "c_" + Date.now(),
        user: this.data.currentUser.username,
        text: text.trim(),
        time: "Just now"
      };
      post.comments.push(comment);
      this.save();
      return comment;
    }
    return null;
  }

  addPost(caption, imageUrl) {
    const newPost = {
      id: "post_" + Date.now(),
      author: {
        id: this.data.currentUser.id,
        username: this.data.currentUser.username,
        displayName: this.data.currentUser.displayName,
        avatar: this.data.currentUser.avatar
      },
      image: imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80",
      caption: caption,
      likes: 0,
      isLiked: false,
      comments: [],
      timestamp: "Just now"
    };
    this.data.posts.unshift(newPost);
    this.data.currentUser.postsCount += 1;
    this.save();
    return newPost;
  }

  markSnapOpened(snapId) {
    const snap = this.data.snaps.find(s => s.id === snapId);
    if (snap) {
      snap.isOpened = true;
      this.save();
      return snap;
    }
    return null;
  }

  addSnap(mediaUrl, caption, duration = 5) {
    const newSnap = {
      id: "snap_" + Date.now(),
      senderId: this.data.currentUser.id,
      senderName: this.data.currentUser.displayName,
      senderAvatar: this.data.currentUser.avatar,
      mediaUrl: mediaUrl,
      caption: caption,
      duration: duration,
      isOpened: false,
      timestamp: "Just now"
    };
    this.data.snaps.unshift(newSnap);
    this.save();
    return newSnap;
  }

  addMessage(chatId, text, isAudio = false, audioDuration = "0:05") {
    const chat = this.data.chats.find(c => c.id === chatId);
    if (chat) {
      const msg = {
        id: "m_" + Date.now(),
        sender: "me",
        text: text,
        isAudio: isAudio,
        audioDuration: audioDuration,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "sent"
      };
      chat.messages.push(msg);
      chat.lastMessage = isAudio ? `🎵 Voice note (${audioDuration})` : text;
      chat.lastTime = msg.time;
      this.save();
      return { chat, message: msg };
    }
    return null;
  }
}

window.omniStore = new Store();
// Extra Social & Multimedia Seed Data (Reels, Groups, Snap Map)
INITIAL_STATE.reels = [
  {
    id: "reel_0",
    author: {
      username: "ankit_chaudhary",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
    },
    videoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    caption: "Shipping the brand new Pluxy Super-App! 🚀 All 4 apps (WhatsApp, Instagram, Facebook, Snapchat) in one with Lifetime Gemini AI! 📞 8533955333 #Pluxy #SuperApp #TechInnovation",
    audioTrack: "⚡ Diljit Dosanjh - Lover (Remix) 🎵",
    likes: 45200,
    isLiked: true,
    commentsCount: 1240
  },
  {
    id: "reel_1",
    author: {
      username: "priya_sharma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
    },
    videoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    caption: "Drone shot over the clouds! Nothing beats this morning serenity ☁️✨ #Cinematic #Himalayas",
    audioTrack: "Original Audio - Priya Sharma 🎵",
    likes: 14200,
    isLiked: false,
    commentsCount: 382
  },
  {
    id: "reel_2",
    author: {
      username: "sameer_k",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
    },
    videoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    caption: "Full setup tour with RGB ambient glow and mechanical sound check ⌨️⚡ #SetupWars #DeskInspo",
    audioTrack: "Lo-Fi Beats to Code - Chillhop 🎧",
    likes: 8930,
    isLiked: true,
    commentsCount: 215
  },
  {
    id: "reel_3",
    author: {
      username: "ananya_roy",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
    },
    videoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    caption: "Sunset waves in slow motion 🌊 Slowing down time at the golden hour #OceanVibes #Mindfulness",
    audioTrack: "Golden Hour - JVKE (Acoustic) ✨",
    likes: 24100,
    isLiked: false,
    commentsCount: 840
  }
];

INITIAL_STATE.mapFriends = [
  { id: "mf_1", name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", location: "Bandra West, Mumbai", status: "Chilling at cafe ☕", time: "12m ago", coords: { x: 42, y: 38 } },
  { id: "mf_2", name: "Sameer Khan", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", location: "Hiranandani, Powai", status: "Coding late night 💻", time: "25m ago", coords: { x: 68, y: 55 } },
  { id: "mf_3", name: "Ananya Roy", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", location: "Juhu Beach, Mumbai", status: "Watching sunset 🌅", time: "40m ago", coords: { x: 30, y: 72 } }
];

INITIAL_STATE.groups = [
  { id: "grp_1", name: "🚀 Omni Tech Innovators", members: 1420, icon: "💻", description: "All things Full-stack, Flutter, AI agents & system architecture" },
  { id: "grp_2", name: "📸 Visual Storytellers & Reels", members: 890, icon: "🎬", description: "Cinematography, color grading, and viral content tips" },
  { id: "grp_3", name: "⚡ Gemini AI Builders Club", members: 3200, icon: "🤖", description: "Building apps with Gemini 1.5 & 2.0 Flash APIs lifetime" }
];

Store.prototype.getReels = function() { return this.data.reels || INITIAL_STATE.reels; };
Store.prototype.getMapFriends = function() { return this.data.mapFriends || INITIAL_STATE.mapFriends; };
Store.prototype.getGroups = function() { return this.data.groups || INITIAL_STATE.groups; };

Store.prototype.toggleLikeReel = function(reelId) {
  const reels = this.data.reels || INITIAL_STATE.reels;
  const reel = reels.find(r => r.id === reelId);
  if (reel) {
    reel.isLiked = !reel.isLiked;
    reel.likes += reel.isLiked ? 1 : -1;
    this.save();
    return reel;
  }
  return null;
};

Store.prototype.addReel = function(videoUrl, caption, audioTrack) {
  const user = this.getCurrentUser();
  const newReel = {
    id: "reel_" + Date.now(),
    author: {
      username: user.username,
      avatar: user.avatar
    },
    videoUrl: videoUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    caption: caption || "New Reel on Pluxy! 🚀 #Viral #Pluxy",
    audioTrack: audioTrack || "Original Audio - " + user.displayName + " 🎵",
    likes: 1,
    isLiked: true,
    commentsCount: 0
  };
  if (!this.data.reels) this.data.reels = [...INITIAL_STATE.reels];
  this.data.reels.unshift(newReel);
  this.save();
  return newReel;
};

// ================= APP CONFIG & DYNAMIC SERVICES =================
INITIAL_STATE.appConfig = {
  appName: "Pluxy",
  tagline: "All-in-One Super Social Media & Lifetime AI",
  founderName: "Ankit Chaudhary",
  founderPhone: "8533955333",
  founderEmail: "ankit@pluxy.app",
  adminPin: "910010025123343",
  themeAccent: "#38BDF8",
  featureFlags: {
    feed: true,
    reels: true,
    camera: true,
    chats: true,
    calling: true,
    ai: true,
    explore: true,
    snapmap: true
  },
  customServices: [
    {
      id: "srv_beats",
      name: "Pluxy Beats",
      tagline: "Live Music & Lo-Fi Beats",
      icon: "🎵",
      category: "music",
      description: "Non-stop curated Lo-Fi, Chillhop, Punjabi & Bollywood beats while you chat and browse",
      targetPosition: "both",
      active: true,
      badge: "HOT"
    }
  ],
  auditLogs: [
    {
      id: "log_init",
      timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
      actor: "Ankit Chaudhary (Admin)",
      action: "SYSTEM_INITIALIZE",
      details: "Pluxy Super-App initialized with Dual-Role RBAC & Master PIN Security"
    }
  ]
};

// Seed Sponsored Ads for Monetization
INITIAL_STATE.sponsoredAds = [
  {
    id: "ad_boat_rockerz",
    brand: "boAt Lifestyle",
    logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
    headline: "boAt Rockerz 550 - 50mm Dynamic Bass",
    description: "Experience 20 Hours of pure non-stop studio playback with Beast Mode low latency! 🎧⚡",
    mediaUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    ctaText: "Shop Now (₹1,499) 🛍️",
    linkUrl: "https://www.boat-lifestyle.com",
    placement: "both", // 'feed' | 'reels' | 'both'
    active: true,
    impressions: 1420,
    clicks: 182
  },
  {
    id: "ad_pluxy_ai",
    brand: "Pluxy Pro AI",
    logo: "assets/pluxy-icon.png",
    headline: "Unlock Lifetime Gemini 2.0 Flash Pro",
    description: "Zero monthly subscription fee! Get infinite multimodal vision & AI reasoning built by Founder Ankit Chaudhary 🚀",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    ctaText: "Activate Free ✨",
    linkUrl: "https://aistudio.google.com/app/apikey",
    placement: "both",
    active: true,
    impressions: 3890,
    clicks: 425
  }
];

// Seed Creator Wallets & Monetization
INITIAL_STATE.creatorWallets = {
  "user_ankit": {
    userId: "user_ankit",
    balance: 48500,
    totalViews: 980000,
    rpmRate: 85, // ₹85 per 1,000 views
    lifetimeEarnings: 83300,
    virtualGiftsCount: 310,
    transactions: [
      { id: "tx_1", type: "reels_views", amount: 2850, title: "Reels View Monetization (35k views)", date: "Today, 11:30 AM", status: "credited" },
      { id: "tx_2", type: "fan_gift", amount: 500, title: "👑 Crown Gift from @priya_sharma", date: "Yesterday", status: "credited" },
      { id: "tx_3", type: "withdrawal", amount: 10000, title: "Withdrawal to UPI (8533955333@upi)", date: "2 days ago", status: "completed" }
    ]
  },
  "user_priya": {
    userId: "user_priya",
    balance: 14250,
    totalViews: 245000,
    rpmRate: 75,
    lifetimeEarnings: 18375,
    virtualGiftsCount: 142,
    transactions: [
      { id: "tx_p1", type: "reels_views", amount: 1050, title: "Reels View Monetization (14k views)", date: "Today, 09:15 AM", status: "credited" },
      { id: "tx_p2", type: "fan_gift", amount: 100, title: "💎 Diamond Gift from @sameer_k", date: "Yesterday", status: "credited" },
      { id: "tx_p3", type: "founder_reward", amount: 5000, title: "💰 Viral Reel Reward from Founder Ankit Chaudhary", date: "3 days ago", status: "credited" }
    ]
  }
};

Store.prototype.getAppConfig = function() {
  if (!this.data.appConfig) {
    this.data.appConfig = JSON.parse(JSON.stringify(INITIAL_STATE.appConfig));
    this.save();
  }
  return this.data.appConfig;
};

Store.prototype.updateAppConfig = function(patch) {
  const cfg = this.getAppConfig();
  this.data.appConfig = { ...cfg, ...patch };
  this.save();
  this.logAuditEvent("CONFIG_UPDATE", `Updated fields: ${Object.keys(patch).join(', ')}`);
  return this.data.appConfig;
};

Store.prototype.getCustomServices = function() {
  const cfg = this.getAppConfig();
  return cfg.customServices || [];
};

Store.prototype.addCustomService = function(serviceData) {
  const cfg = this.getAppConfig();
  if (!cfg.customServices) cfg.customServices = [];
  const newService = {
    id: "srv_" + Date.now(),
    name: serviceData.name || "New Service",
    tagline: serviceData.tagline || "Custom Service",
    icon: serviceData.icon || "⚡",
    category: serviceData.category || "tool",
    description: serviceData.description || "Custom service added by Admin",
    contentUrl: serviceData.contentUrl || "",
    targetPosition: serviceData.targetPosition || "both",
    active: true,
    badge: serviceData.badge || "NEW",
    createdAt: new Date().toLocaleDateString()
  };
  cfg.customServices.push(newService);
  this.save();
  this.logAuditEvent("SERVICE_ADDED", `Admin added new service: ${newService.name} (${newService.icon})`);
  return newService;
};

Store.prototype.deleteCustomService = function(serviceId) {
  const cfg = this.getAppConfig();
  if (!cfg.customServices) return false;
  const idx = cfg.customServices.findIndex(s => s.id === serviceId);
  if (idx !== -1) {
    const name = cfg.customServices[idx].name;
    cfg.customServices.splice(idx, 1);
    this.save();
    this.logAuditEvent("SERVICE_DELETED", `Admin deleted service: ${name}`);
    return true;
  }
  return false;
};

Store.prototype.toggleServiceStatus = function(serviceId) {
  const cfg = this.getAppConfig();
  if (!cfg.customServices) return null;
  const service = cfg.customServices.find(s => s.id === serviceId);
  if (service) {
    service.active = !service.active;
    this.save();
    this.logAuditEvent("SERVICE_TOGGLED", `${service.name} set to ${service.active ? 'ACTIVE' : 'INACTIVE'}`);
    return service;
  }
  return null;
};

Store.prototype.toggleFeatureFlag = function(featureKey, state) {
  const cfg = this.getAppConfig();
  if (!cfg.featureFlags) cfg.featureFlags = {};
  cfg.featureFlags[featureKey] = state !== undefined ? state : !cfg.featureFlags[featureKey];
  this.save();
  this.logAuditEvent("FEATURE_TOGGLED", `Feature '${featureKey}' set to ${cfg.featureFlags[featureKey] ? 'ENABLED' : 'DISABLED'}`);
  return cfg.featureFlags[featureKey];
};

Store.prototype.logAuditEvent = function(action, details, actor) {
  const cfg = this.getAppConfig();
  if (!cfg.auditLogs) cfg.auditLogs = [];
  const current = this.getCurrentUser();
  const entry = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random()*1000),
    timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
    actor: actor || (current ? `${current.displayName} (${current.role || 'user'})` : "System"),
    action: action,
    details: details
  };
  cfg.auditLogs.unshift(entry);
  if (cfg.auditLogs.length > 60) cfg.auditLogs.pop();
  this.save();
  return entry;
};

// ================= SPONSORED ADS & MONETIZATION =================
Store.prototype.getSponsoredAds = function() {
  if (!this.data.sponsoredAds) {
    this.data.sponsoredAds = JSON.parse(JSON.stringify(INITIAL_STATE.sponsoredAds));
    this.save();
  }
  return this.data.sponsoredAds;
};

Store.prototype.addSponsoredAd = function(adData) {
  const ads = this.getSponsoredAds();
  const newAd = {
    id: "ad_" + Date.now(),
    brand: adData.brand || "Featured Brand",
    logo: adData.logo || "assets/pluxy-icon.png",
    headline: adData.headline || "Sponsored Offer",
    description: adData.description || "",
    mediaUrl: adData.mediaUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    ctaText: adData.ctaText || "Learn More ↗",
    linkUrl: adData.linkUrl || "https://pluxy.app",
    placement: adData.placement || "both",
    active: true,
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toLocaleDateString()
  };
  ads.unshift(newAd);
  this.save();
  this.logAuditEvent("AD_CREATED", `Admin created sponsored ad: "${newAd.brand} - ${newAd.headline}"`);
  return newAd;
};

Store.prototype.toggleSponsoredAd = function(adId) {
  const ads = this.getSponsoredAds();
  const ad = ads.find(a => a.id === adId);
  if (ad) {
    ad.active = !ad.active;
    this.save();
    this.logAuditEvent("AD_TOGGLED", `Ad "${ad.brand}" set to ${ad.active ? 'ACTIVE' : 'PAUSED'}`);
    return ad;
  }
  return null;
};

Store.prototype.deleteSponsoredAd = function(adId) {
  const ads = this.getSponsoredAds();
  const idx = ads.findIndex(a => a.id === adId);
  if (idx !== -1) {
    const brand = ads[idx].brand;
    ads.splice(idx, 1);
    this.save();
    this.logAuditEvent("AD_DELETED", `Admin deleted ad: "${brand}"`);
    return true;
  }
  return false;
};

Store.prototype.recordAdImpression = function(adId) {
  const ads = this.getSponsoredAds();
  const ad = ads.find(a => a.id === adId);
  if (ad) {
    ad.impressions = (ad.impressions || 0) + 1;
    this.save();
  }
};

Store.prototype.recordAdClick = function(adId) {
  const ads = this.getSponsoredAds();
  const ad = ads.find(a => a.id === adId);
  if (ad) {
    ad.clicks = (ad.clicks || 0) + 1;
    this.save();
    return ad;
  }
  return null;
};

// ================= CREATOR REWARDS & MONETIZATION =================
Store.prototype.getCreatorWallet = function(userId) {
  if (!this.data.creatorWallets || typeof this.data.creatorWallets !== "object") {
    this.data.creatorWallets = (INITIAL_STATE && INITIAL_STATE.creatorWallets) 
      ? JSON.parse(JSON.stringify(INITIAL_STATE.creatorWallets)) 
      : {};
  }
  const uId = userId || (this.getCurrentUser() ? this.getCurrentUser().id : "user_ankit");
  if (!this.data.creatorWallets[uId]) {
    this.data.creatorWallets[uId] = {
      userId: uId,
      balance: uId === "user_ankit" ? 48500 : 14250,
      totalViews: uId === "user_ankit" ? 980000 : 245000,
      rpmRate: 85,
      lifetimeEarnings: uId === "user_ankit" ? 83300 : 18375,
      virtualGiftsCount: uId === "user_ankit" ? 310 : 142,
      transactions: [
        { id: "tx_1", type: "reels_views", amount: 2850, title: "Reels View Monetization (35k views)", date: "Today, 11:30 AM", status: "credited" },
        { id: "tx_2", type: "fan_gift", amount: 500, title: "👑 Crown Gift from @priya_sharma", date: "Yesterday", status: "credited" },
        { id: "tx_3", type: "withdrawal", amount: 10000, title: "Withdrawal to UPI (8533955333@upi)", date: "2 days ago", status: "completed" }
      ]
    };
    this.save();
  }
  return this.data.creatorWallets[uId];
};

Store.prototype.sendReelGift = function(reelId, giftType, amount, senderName) {
  const reels = this.getReels();
  const reel = (reels && reels.find(r => r.id === reelId)) || (reels && reels[0]) || { author: { username: "ankit_chaudhary" } };
  const targetUsername = reel ? reel.author.username : "ankit_chaudhary";

  if (!this.data.creatorWallets || typeof this.data.creatorWallets !== "object") {
    this.data.creatorWallets = {};
  }
  
  const targetId = targetUsername === "ankit_chaudhary" ? "user_ankit" : (targetUsername === "priya_sharma" ? "user_priya" : "user_" + targetUsername);
  const wallet = this.getCreatorWallet(targetId);

  wallet.balance = (wallet.balance || 0) + amount;
  wallet.lifetimeEarnings = (wallet.lifetimeEarnings || 0) + amount;
  wallet.virtualGiftsCount = (wallet.virtualGiftsCount || 0) + 1;
  if (!wallet.transactions) wallet.transactions = [];
  wallet.transactions.unshift({
    id: "tx_gift_" + Date.now(),
    type: "fan_gift",
    amount: amount,
    title: `${giftType} Gift from ${senderName || 'Fan'}`,
    date: "Just now",
    status: "credited"
  });

  this.save();
  if (typeof this.logAuditEvent === "function") {
    this.logAuditEvent("GIFT_SENT", `Fan sent ${giftType} (₹${amount}) to creator @${targetUsername}`);
  }
  return { wallet, amount, giftType, targetUsername };
};

Store.prototype.requestCreatorWithdrawal = function(userId, amount, upiId) {
  const wallet = this.getCreatorWallet(userId);
  if (wallet.balance < amount) {
    return { success: false, message: "Insufficient balance in Creator Wallet!" };
  }
  wallet.balance -= amount;
  const tx = {
    id: "tx_w_" + Date.now(),
    type: "withdrawal",
    amount: amount,
    title: `UPI Withdrawal to ${upiId}`,
    date: "Just now",
    status: "completed",
    refId: "PLX" + Math.floor(100000000 + Math.random() * 900000000)
  };
  wallet.transactions.unshift(tx);
  this.save();
  this.logAuditEvent("CREATOR_WITHDRAWAL", `Creator withdrew ₹${amount} to UPI: ${upiId} (Ref: ${tx.refId})`);
  return { success: true, transaction: tx, newBalance: wallet.balance };
};

Store.prototype.adminRewardCreator = function(userId, amount, note) {
  const wallet = this.getCreatorWallet(userId);
  wallet.balance += amount;
  wallet.lifetimeEarnings += amount;
  const tx = {
    id: "tx_adm_" + Date.now(),
    type: "founder_reward",
    amount: amount,
    title: `💰 Founder Bonus from Ankit Chaudhary (${note || 'Top Performance'})`,
    date: "Just now",
    status: "credited"
  };
  wallet.transactions.unshift(tx);
  this.save();
  this.logAuditEvent("FOUNDER_REWARD", `Admin rewarded ₹${amount} to user ${userId}: ${note}`);
  return { success: true, wallet, transaction: tx };
};