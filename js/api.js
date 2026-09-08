// Pluxy Central Production API Client & Security Utilities
class PluxyApiClient {
  constructor() {
    this.tokenKey = "pluxy_auth_token";
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // On local machine use origin; on Hostinger, web, or mobile, connect to production cloud backend
    this.baseUrl = isLocalhost ? window.location.origin : "https://pluxy-app.onrender.com";
  }

  getWsUrl() {
    const token = this.getToken();
    const wsBase = this.baseUrl.replace(/^http/, "ws");
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
  }

  getToken() {
    return localStorage.getItem(this.tokenKey) || "";
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const opts = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const resp = await fetch(url, opts);
      const text = await resp.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { text };
      }

      if (resp.status === 401) {
        // Token invalid or expired
        if (endpoint !== "/api/auth/login" && endpoint !== "/api/auth/register") {
          this.clearToken();
          if (window.authModule && typeof window.authModule.onSessionExpired === "function") {
            window.authModule.onSessionExpired();
          }
        }
      }

      if (!resp.ok) {
        const errorMsg = data.detail || data.error || `HTTP ${resp.status}: ${resp.statusText}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.warn(`[PluxyAPI] Request to ${endpoint} failed:`, err);
      throw err;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // XSS Protection & HTML Escaping Utility
  escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Safe URL validator (blocks javascript: and vbscript:)
  safeUrl(url, fallback = "assets/pluxy-icon.png") {
    if (!url || typeof url !== "string") return fallback;
    const clean = url.trim().toLowerCase();
    if (clean.startsWith("javascript:") || clean.startsWith("vbscript:") || clean.startsWith("data:text/html")) {
      return fallback;
    }
    return url.trim();
  }
}

window.apiClient = new PluxyApiClient();
