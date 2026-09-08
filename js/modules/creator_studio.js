// Pluxy Creator Studio & Reels Monetization Module
// Connected to Genuine Backend API: /api/creator/*

class CreatorStudioModule {
  constructor() {
    this.currentUser = null;
    this.cachedWallet = null;
  }

  async init() {
    const screen = document.getElementById("view-creator-studio");
    if (screen) {
      await this.renderCreatorStudioScreen();
    }
  }

  async fetchWalletData() {
    const user = (window.authModule && window.authModule.currentUser) || 
                 (window.omniStore && typeof window.omniStore.getCurrentUser === "function" && window.omniStore.getCurrentUser()) || {
      id: "guest",
      username: "guest",
      displayName: "Guest User",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
    };

    let wallet = {
      userId: user.id,
      balance: 0,
      totalViews: 0,
      rpmRate: 85,
      lifetimeEarnings: 0,
      virtualGiftsCount: 0,
      transactions: []
    };

    if (window.apiClient && window.apiClient.getToken()) {
      try {
        const res = await window.apiClient.get('/creator/wallet');
        const w = (res && res.wallet) ? res.wallet : res;
        if (w && w.balance !== undefined) {
          wallet = {
            userId: w.userId || w.user_id || user.id,
            balance: Number(w.balance || 0),
            totalViews: Number(w.totalViews || w.total_views || 0),
            rpmRate: Number(w.rpmRate || w.rpm_rate || 85),
            lifetimeEarnings: Number(w.lifetimeEarnings || w.lifetime_earnings || 0),
            virtualGiftsCount: Number(w.virtualGiftsCount || w.virtual_gifts_count || 0),
            transactions: (w.transactions || []).map(t => ({
              id: t.id,
              type: t.type,
              amount: Number(t.amount || 0),
              title: t.description || t.title || "Transaction",
              date: t.created_at ? new Date(t.created_at).toLocaleDateString() : (t.date || "Recent"),
              refId: t.refId || t.ref_id || t.id,
              status: t.status || "completed"
            }))
          };
          this.cachedWallet = wallet;
        }
      } catch (err) {
        console.warn("Could not fetch creator wallet from backend API:", err);
      }
    } else if (this.cachedWallet) {
      wallet = this.cachedWallet;
    }

    return { user, wallet };
  }

  async openCreatorStudio() {
    if (window.authModule && !window.authModule.currentUser && (!window.apiClient || !window.apiClient.getToken())) {
      window.app.showToast("Please log in to access your Creator Studio & Wallet!");
      if (typeof window.authModule.openAuth === "function") {
        window.authModule.openAuth('login');
      }
      return;
    }

    const { user, wallet } = await this.fetchWalletData();

    const modalHtml = `
      <div class="service-modal-overlay" id="creator-studio-modal" style="display: flex; z-index: 99999;">
        <div class="service-modal-box creator-studio-box">
          <!-- Modal Header -->
          <div class="creator-studio-header">
            <div class="creator-header-left">
              <div class="creator-avatar-ring">
                <img src="${window.apiClient ? window.apiClient.safeUrl(user.avatar) : user.avatar}" class="creator-avatar-img" alt="${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}" />
                <span class="creator-verified-badge">✓</span>
              </div>
              <div>
                <h2>Pluxy Creator Studio 💰</h2>
                <p class="creator-handle-tag">@${window.apiClient ? window.apiClient.escapeHtml(user.username) : user.username} • ${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}</p>
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-creator-create-reel" onclick="window.creatorStudioModule.closeCreatorStudio(); window.reelsModule.openCreateReelModal();" title="Create New Reel in Studio">
                <i class="ph-bold ph-plus-circle"></i> Create Reel
              </button>
              <button class="close-creator-studio" onclick="window.creatorStudioModule.closeCreatorStudio()">
                <i class="ph-bold ph-x"></i>
              </button>
            </div>
          </div>

          <!-- Creator Fund Metrics Banner -->
          <div class="creator-metrics-banner">
            <div class="creator-metric-card primary-gradient">
              <div class="creator-metric-label">Available Wallet Balance</div>
              <div class="creator-balance-large" id="studio-wallet-balance">₹${(wallet.balance || 0).toLocaleString()}</div>
              <div class="creator-metric-sub">Verified real-time UPI withdrawal ⚡</div>
            </div>
            <div class="creator-metric-card">
              <div class="creator-metric-label">Monetized Reels Views</div>
              <div class="creator-metric-val">${(wallet.totalViews || 0).toLocaleString()}</div>
              <div class="creator-metric-sub">RPM Rate: ₹${wallet.rpmRate || 85} / 1k views</div>
            </div>
            <div class="creator-metric-card">
              <div class="creator-metric-label">Lifetime Total Earnings</div>
              <div class="creator-metric-val" style="color: #4ADE80;">₹${(wallet.lifetimeEarnings || 0).toLocaleString()}</div>
              <div class="creator-metric-sub">Views + fan gifts</div>
            </div>
            <div class="creator-metric-card">
              <div class="creator-metric-label">Virtual Fan Gifts Received</div>
              <div class="creator-metric-val" style="color: #FBBF24;">🎁 ${wallet.virtualGiftsCount || 0}</div>
              <div class="creator-metric-sub">💎 Rocket, Crown & Flames</div>
            </div>
          </div>

          <!-- Two Column Layout: Withdraw & Transactions -->
          <div class="creator-studio-content-grid">
            <!-- Left: Instant Cash Withdrawal -->
            <div class="creator-withdraw-section">
              <div class="section-title-row">
                <h3><i class="ph-bold ph-bank"></i> Instant UPI / Bank Cash Out</h3>
                <span class="instant-transfer-badge">⚡ Real-Time Payout</span>
              </div>
              <p class="section-hint">Withdraw your genuine creator earnings directly to Google Pay, PhonePe, Paytm, or BHIM UPI.</p>
              
              <form onsubmit="window.creatorStudioModule.handleWithdrawalSubmit(event)" class="withdrawal-form">
                <div class="form-group-admin">
                  <label>Withdrawal Amount (₹ INR)</label>
                  <div class="input-with-symbol">
                    <span class="currency-symbol">₹</span>
                    <input type="number" id="withdraw-amount" class="admin-input" 
                           placeholder="Enter amount (min ₹100)" 
                           min="100" 
                           max="${Math.max(100, wallet.balance || 0)}" 
                           value="${wallet.balance > 0 ? Math.min(wallet.balance, 500) : ''}" 
                           required />
                  </div>
                  <div class="quick-amount-chips">
                    <span class="amount-chip" onclick="document.getElementById('withdraw-amount').value = 100">₹100</span>
                    <span class="amount-chip" onclick="document.getElementById('withdraw-amount').value = 500">₹500</span>
                    <span class="amount-chip" onclick="document.getElementById('withdraw-amount').value = 1000">₹1,000</span>
                    <span class="amount-chip max-chip" onclick="document.getElementById('withdraw-amount').value = ${wallet.balance || 0}">Max (₹${(wallet.balance || 0).toLocaleString()})</span>
                  </div>
                </div>

                <div class="form-group-admin">
                  <label>Your UPI ID / VPA</label>
                  <input type="text" id="withdraw-upi-id" class="admin-input" 
                         placeholder="e.g. yourname@upi, mobile@paytm" 
                         value="" 
                         required />
                  <span class="field-helper">Creator: ${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}</span>
                </div>

                <button type="submit" class="btn-instant-withdraw" id="btn-withdraw-submit">
                  <i class="ph-bold ph-lightning"></i> Transfer Money to UPI 💸
                </button>
              </form>
            </div>

            <!-- Right: Earnings & Tipping Transactions History -->
            <div class="creator-history-section">
              <div class="section-title-row">
                <h3><i class="ph-bold ph-clock-counter-clockwise"></i> Earnings & Rewards History</h3>
                <span class="history-count">${(wallet.transactions || []).length} items</span>
              </div>

              <div class="transactions-list-scroll">
                ${(wallet.transactions || []).length === 0 ? '<div class="empty-history">No transactions yet. Publish reels to start earning!</div>' : ''}
                ${(wallet.transactions || []).map(tx => `
                  <div class="tx-history-item ${window.apiClient ? window.apiClient.escapeHtml(tx.type) : tx.type}">
                    <div class="tx-icon">
                      ${tx.type === 'withdrawal' || tx.type === 'payout' ? '💸' : (tx.type === 'fan_gift' ? '🎁' : '💰')}
                    </div>
                    <div class="tx-info">
                      <strong>${window.apiClient ? window.apiClient.escapeHtml(tx.title) : tx.title}</strong>
                      <span class="tx-date">${window.apiClient ? window.apiClient.escapeHtml(tx.date) : tx.date} ${tx.refId ? '• Ref: ' + window.apiClient.escapeHtml(tx.refId) : ''}</span>
                    </div>
                    <div class="tx-amount ${tx.type === 'withdrawal' || tx.type === 'payout' ? 'debit' : 'credit'}">
                      ${tx.type === 'withdrawal' || tx.type === 'payout' ? '-' : '+'}₹${(tx.amount || 0).toLocaleString()}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById("creator-studio-modal");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    if (window.app && typeof window.app.playSound === "function") window.app.playSound('ding');
  }

  closeCreatorStudio() {
    const modal = document.getElementById("creator-studio-modal");
    if (modal) modal.remove();
  }

  async renderCreatorStudioScreen() {
    const screen = document.getElementById("view-creator-studio");
    if (!screen) return;

    const { user, wallet } = await this.fetchWalletData();

    screen.innerHTML = `
      <div class="creator-studio-screen-content" style="padding: 16px; max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
        <div class="creator-studio-header">
          <div class="creator-header-left">
            <div class="creator-avatar-ring">
              <img src="${window.apiClient ? window.apiClient.safeUrl(user.avatar) : user.avatar}" class="creator-avatar-img" alt="${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}" />
              <span class="creator-verified-badge">✓</span>
            </div>
            <div>
              <h2>Pluxy Creator Studio 💰</h2>
              <p class="creator-handle-tag">@${window.apiClient ? window.apiClient.escapeHtml(user.username) : user.username} • ${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}</p>
            </div>
          </div>
          <button class="btn-creator-create-reel" onclick="window.reelsModule.openCreateReelModal()" title="Create New Reel in Studio">
            <i class="ph-bold ph-plus-circle"></i> Create Reel
          </button>
        </div>

        <div class="creator-metrics-banner">
          <div class="creator-metric-card primary-gradient">
            <div class="creator-metric-label">Available Wallet Balance</div>
            <div class="creator-balance-large">₹${(wallet.balance || 0).toLocaleString()}</div>
            <div class="creator-metric-sub">Verified real-time UPI withdrawal ⚡</div>
          </div>
          <div class="creator-metric-card">
            <div class="creator-metric-label">Monetized Reels Views</div>
            <div class="creator-metric-val">${(wallet.totalViews || 0).toLocaleString()}</div>
            <div class="creator-metric-sub">RPM Rate: ₹${wallet.rpmRate || 85} / 1k views</div>
          </div>
          <div class="creator-metric-card">
            <div class="creator-metric-label">Lifetime Total Earnings</div>
            <div class="creator-metric-val" style="color: #4ADE80;">₹${(wallet.lifetimeEarnings || 0).toLocaleString()}</div>
            <div class="creator-metric-sub">Views + fan gifts</div>
          </div>
          <div class="creator-metric-card">
            <div class="creator-metric-label">Virtual Fan Gifts Received</div>
            <div class="creator-metric-val" style="color: #FBBF24;">🎁 ${wallet.virtualGiftsCount || 0}</div>
            <div class="creator-metric-sub">💎 Rocket, Crown & Flames</div>
          </div>
        </div>

        <div class="creator-studio-content-grid">
          <div class="creator-withdraw-section">
            <div class="section-title-row">
              <h3><i class="ph-bold ph-bank"></i> Instant UPI Cash Out</h3>
              <span class="instant-transfer-badge">⚡ Real-Time Payout</span>
            </div>
            <p class="section-hint">Withdraw your reel earnings directly to Google Pay, PhonePe, Paytm, or BHIM UPI.</p>
            
            <form onsubmit="window.creatorStudioModule.handleWithdrawalSubmit(event)" class="withdrawal-form">
              <div class="form-group-admin">
                <label>Withdrawal Amount (₹ INR)</label>
                <div class="input-with-symbol">
                  <span class="currency-symbol">₹</span>
                  <input type="number" id="withdraw-amount-tab" class="admin-input" 
                         placeholder="Enter amount (min ₹100)" 
                         min="100" 
                         max="${Math.max(100, wallet.balance || 0)}" 
                         value="${wallet.balance > 0 ? Math.min(wallet.balance, 500) : ''}" 
                         required />
                </div>
                <div class="quick-amount-chips">
                  <span class="amount-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=100;">₹100</span>
                  <span class="amount-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=500;">₹500</span>
                  <span class="amount-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=1000;">₹1,000</span>
                  <span class="amount-chip max-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=${wallet.balance || 0};">Max (₹${(wallet.balance || 0).toLocaleString()})</span>
                </div>
              </div>

              <div class="form-group-admin">
                <label>Your UPI ID / VPA</label>
                <input type="text" id="withdraw-upi-id-tab" class="admin-input" 
                       placeholder="e.g. yourname@upi, mobile@paytm" 
                       value="" 
                       required />
                <span class="field-helper">Creator: ${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}</span>
              </div>

              <button type="submit" class="btn-instant-withdraw" id="btn-withdraw-submit-tab">
                <i class="ph-bold ph-lightning"></i> Transfer Money to UPI 💸
              </button>
            </form>
          </div>

          <div class="creator-history-section">
            <div class="section-title-row">
              <h3><i class="ph-bold ph-clock-counter-clockwise"></i> Earnings & Rewards History</h3>
              <span class="history-count">${(wallet.transactions || []).length} items</span>
            </div>

            <div class="transactions-list-scroll">
              ${(wallet.transactions || []).length === 0 ? '<div class="empty-history">No transactions yet. Publish reels to start earning!</div>' : ''}
              ${(wallet.transactions || []).map(tx => `
                <div class="tx-history-item ${window.apiClient ? window.apiClient.escapeHtml(tx.type) : tx.type}">
                  <div class="tx-icon">
                    ${tx.type === 'withdrawal' || tx.type === 'payout' ? '💸' : (tx.type === 'fan_gift' ? '🎁' : '💰')}
                  </div>
                  <div class="tx-info">
                    <strong>${window.apiClient ? window.apiClient.escapeHtml(tx.title) : tx.title}</strong>
                    <span class="tx-date">${window.apiClient ? window.apiClient.escapeHtml(tx.date) : tx.date} ${tx.refId ? '• Ref: ' + window.apiClient.escapeHtml(tx.refId) : ''}</span>
                  </div>
                  <div class="tx-amount ${tx.type === 'withdrawal' || tx.type === 'payout' ? 'debit' : 'credit'}">
                    ${tx.type === 'withdrawal' || tx.type === 'payout' ? '-' : '+'}₹${(tx.amount || 0).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async handleWithdrawalSubmit(e) {
    e.preventDefault();
    const amountInput = document.getElementById("withdraw-amount") || document.getElementById("withdraw-amount-tab");
    const upiInput = document.getElementById("withdraw-upi-id") || document.getElementById("withdraw-upi-id-tab");
    const submitBtn = document.getElementById("btn-withdraw-submit") || document.getElementById("btn-withdraw-submit-tab");

    const amount = parseFloat(amountInput ? amountInput.value : 0);
    const upiId = (upiInput ? upiInput.value : "").trim();

    if (isNaN(amount) || amount <= 0) {
      window.app.showToast("Please enter a valid withdrawal amount!");
      return;
    }

    if (!upiId) {
      window.app.showToast("Please enter your UPI ID!");
      return;
    }

    if (amount < 100) {
      window.app.showToast("Minimum withdrawal amount is ₹100!");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="ph-bold ph-spinner"></i> Processing Payout...`;
    }

    try {
      if (window.apiClient && window.apiClient.getToken()) {
        const res = await window.apiClient.post('/creator/withdraw', {
          amount: amount,
          upi_id: upiId
        });

        if (res && res.status === "completed") {
          window.app.showToast("Withdrawal successful! ₹" + amount.toLocaleString() + " transferred to " + upiId);
          this.showWithdrawalReceipt(amount, upiId, res.reference_id || res.payout_id, res.new_balance);
          return;
        } else {
          window.app.showToast((res && res.detail) || "Withdrawal failed! Please check your balance.");
        }
      } else {
        window.app.showToast("Please log in to make withdrawals!");
      }
    } catch (err) {
      const errMsg = (err && err.message) || "Withdrawal error. Insufficient balance or service unavailable.";
      window.app.showToast(errMsg);
      if (window.app && typeof window.app.playSound === "function") window.app.playSound('pop');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="ph-bold ph-lightning"></i> Transfer Money to UPI 💸`;
      }
    }
  }

  showWithdrawalReceipt(amount, upiId, refId, newBalance) {
    const user = (window.authModule && window.authModule.currentUser) || { displayName: "Creator" };
    const receiptHtml = `
      <div class="service-modal-overlay" id="withdrawal-receipt-modal" style="z-index: 100005; display: flex;">
        <div class="service-modal-box receipt-box">
          <div class="receipt-success-badge">
            <i class="ph-bold ph-check"></i>
          </div>
          <h3 class="receipt-title">Withdrawal Successful! 💸</h3>
          <p class="receipt-sub">Payout processed and logged to your official Pluxy ledger.</p>

          <div class="receipt-amount-display">₹${amount.toLocaleString()}</div>

          <div class="receipt-details-card">
            <div class="receipt-detail-row">
              <span>Status</span>
              <strong style="color: #4ADE80;">✓ Completed (Instant Payout)</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Destination UPI</span>
              <strong>${window.apiClient ? window.apiClient.escapeHtml(upiId) : upiId}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Beneficiary</span>
              <strong>${window.apiClient ? window.apiClient.escapeHtml(user.displayName) : user.displayName}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Transaction Ref ID</span>
              <strong>${window.apiClient ? window.apiClient.escapeHtml(refId || "N/A")}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Timestamp</span>
              <strong>${new Date().toLocaleString()}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Updated Wallet Balance</span>
              <strong style="color: #60A5FA;">₹${(newBalance || 0).toLocaleString()}</strong>
            </div>
          </div>

          <button class="btn-admin-primary" style="width: 100%; margin-top: 16px;" onclick="document.getElementById('withdrawal-receipt-modal').remove(); window.creatorStudioModule.openCreatorStudio();">
            <i class="ph-bold ph-check-circle"></i> Done & View Updated Wallet
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", receiptHtml);
    if (window.app && typeof window.app.playSound === "function") window.app.playSound('sent');
  }
}

window.creatorStudioModule = new CreatorStudioModule();
