// Gemini 1.5 / 2.0 Flash Lifetime AI Integration Engine
class GeminiService {
  constructor() {
    this.storageKey = "pluxy_gemini_api_key";
    this.selectedModel = localStorage.getItem("pluxy_gemini_model") || "gemini-1.5-flash";
    this.conversationHistory = [
      {
        role: "model",
        parts: [{ text: "Namaste Ankit! Main hu aapka Pluxy Lifetime AI Co-pilot 🤖✨. Pluxy ke creator Ankit Chaudhary (📞 8533955333) ne isme WhatsApp, Instagram, Facebook, aur Snapchat ke sare features integrate kiye hain. Main aapke WhatsApp chats me smart replies de sakta hu, viral captions aur hashtags bana sakta hu, photo analyze kar sakta hu, aur har sawaal ka instant jawaab de sakta hu. Bataiye aaj kya karna chahenge?" }]
      }
    ];
  }

  getApiKey() {
    return localStorage.getItem(this.storageKey) || "";
  }

  setApiKey(key) {
    if (key) {
      localStorage.setItem(this.storageKey, key.trim());
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  hasApiKey() {
    const key = this.getApiKey();
    return key && key.length > 10;
  }

  setModel(modelName) {
    this.selectedModel = modelName;
    localStorage.setItem("pluxy_gemini_model", modelName);
  }

  // Generate Multi-turn Chat response
  async sendChatMessage(userText) {
    this.conversationHistory.push({
      role: "user",
      parts: [{ text: userText }]
    });

    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: this.conversationHistory,
            systemInstruction: {
              parts: [{ text: "You are Pluxy AI, an intelligent, helpful, stylish, and charismatic social media co-pilot inside Pluxy (created by Ankit Chaudhary, contact 8533955333) — an all-in-one super app uniting WhatsApp, Instagram, Facebook, and Snapchat. You understand Hindi, Hinglish, and English naturally. Be concise, friendly, engaging, and use emojis appropriately." }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Koi response nahi mila, kripya dobara try karein.";
        
        this.conversationHistory.push({
          role: "model",
          parts: [{ text: replyText }]
        });
        return { text: replyText, isLive: true };
      } catch (err) {
        console.warn("Live API call failed, falling back to smart local response:", err);
      }
    }

    // Smart Local Fallback Response (Instant & 100% Reliable without API key)
    const simulatedResponse = this._generateSimulatedChatResponse(userText);
    this.conversationHistory.push({
      role: "model",
      parts: [{ text: simulatedResponse }]
    });
    return { text: simulatedResponse, isLive: false };
  }

  // Generate Instagram / Facebook Viral Post Caption & Hashtags
  async generatePostCaption(topicOrIdea, tone = "viral") {
    const prompt = `Write a captivating, creative social media post caption and 6-8 trending hashtags for Instagram/Facebook about: "${topicOrIdea}". Tone: ${tone}. Include expressive emojis and make it engaging.`;
    
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (e) {
        console.warn("Caption generation fallback:", e);
      }
    }

    // High quality intelligent mock generator
    return this._generateSimulatedCaption(topicOrIdea);
  }

  // Generate WhatsApp Smart Replies for active chat
  async generateSmartReplies(chatContext) {
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const prompt = `Based on this incoming chat message: "${chatContext}", provide exactly 3 short, natural, witty WhatsApp quick replies formatted as a JSON array of 3 strings (e.g. ["Haha definitely! 😂", "Sounds great, let's do it", "I'll let you know in an hour"]).`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length >= 2) return parsed.slice(0, 3);
        }
      } catch (e) {
        console.warn("Smart replies live call fallback:", e);
      }
    }

    // Context-based fallback suggestions
    const lower = (chatContext || "").toLowerCase();
    if (lower.includes("hackathon") || lower.includes("tomorrow") || lower.includes("meet")) {
      return ["Haan bilkul, main ready hu! 🚀", "Time aur location confirm karo?", "Bhai thoda busy hu, but I will try! 👍"];
    } else if (lower.includes("snap") || lower.includes("photo") || lower.includes("check")) {
      return ["Bhej jaldi, dekhna hai! 🔥", "Looks incredible yaar! 📸", "Ekdum next level! 💯"];
    } else if (lower.includes("ai") || lower.includes("pluxy") || lower.includes("omnisphere") || lower.includes("model")) {
      return ["Pluxy AI ka feature bahut tagda hai 🤖✨", "Gemini 2.0 Flash is super fast!", "Ankit Chaudhary ne kya mast app banayi hai! 🔥"];
    }
    return ["Bilkul sahi baat hai! 👍", "Haha nice one! 😂", "Chalo abhi Pluxy video call pe baat karte hain 📞"];
  }

  _generateSimulatedChatResponse(query) {
    const q = query.toLowerCase();
    if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("suno")) {
      return "Hello Ankit! 👋 Main hu aapka Pluxy Lifetime AI Co-pilot. Pluxy ke developer Ankit Chaudhary (📞 8533955333) ne mujhe trained kiya hai. Bataiye aaj kya plan hai? Caption likhwana hai, photo analyze karna hai ya koi smart reply chahiye?";
    }
    if (q.includes("developer") || q.includes("creator") || q.includes("founder") || q.includes("ankit") || q.includes("contact")) {
      return "Pluxy ke Founder aur Lead Developer **Ankit Chaudhary** hain! 🚀 Unka contact number **8533955333** (+91 8533955333) hai. Aap unse direct WhatsApp ya Call par connect kar sakte hain!";
    }
    if (q.includes("caption") || q.includes("post") || q.includes("instagram")) {
      return "Sure! Aap Post Creator tab me jakar photo select karein ya topic batayein, main aapko instantly high-engagement viral caption aur hashtags likh kar dunga! 📸✨";
    }
    if (q.includes("snap") || q.includes("snapchat") || q.includes("streak") || q.includes("filter")) {
      return "Snapchat AR camera lenses (Dog, Crown, Glasses, Cat, Hearts, Alien) active hain! Aapka streak 52 days 🔥 par chal raha hai. Disappearing snap dekhte hi 5-second timer ke baad auto-destroy ho jayega!";
    }
    if (q.includes("call") || q.includes("video") || q.includes("whatsapp")) {
      return "Pluxy me WhatsApp HD Voice & Video Calling service fully functional hai! Local front camera stream, remote video, mute mic aur end call ke features chal rahe hain.";
    }
    if (q.includes("key") || q.includes("lifetime") || q.includes("free")) {
      return "Pluxy app official Google Gemini 1.5/2.0 Flash API par chalti hai. Aap Profile > Settings me jakar apni Google AI Studio ki free API key daal sakte hain aur lifetime bina kisi monthly charge ke live model chala sakte hain! 🚀";
    }
    return `Aapka sawaal: "${query}" bahut badiya hai! Main Pluxy me built-in Gemini Flash AI hu (Pluxy by Ankit Chaudhary - 8533955333). Main aapki social media presence ko 10x improve kar sakta hu—from witty replies to viral captions! Kuch aur poochiye! ✨`;
  }

  _generateSimulatedCaption(topic) {
    const captions = [
      `Chasing moments, not things ✨ When the vibes are this good, you just have to pause and soak it all in 🌅\n\n#VibeCheck #LifestyleGoals #Pluxy #AestheticVibes #GoldenMoments #GoodVibesOnly`,
      `Building dreams into reality, one step at a time 🚀⚡ Pluxy is the new era of social connection.\n\n#HustleHard #TechLife #FutureIsNow #Innovation #CreatorEconomy #PluxyVibe #AnkitChaudhary`,
      `Stories fade in 24 hours, but memories last forever 💫 Living in the present and loving every second of it! 📸🔥\n\n#LivingMyBestLife #PluxySnap #AestheticGram #PostOfTheDay #SocialSquad`
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  }
}

window.geminiService = new GeminiService();