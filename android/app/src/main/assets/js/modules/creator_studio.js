// Pluxy Creator Studio & Reels Monetization Module
// "Reels Banane Walo Ke Liye Paise, Rewards & Instant UPI Cashout"

class CreatorStudioModule {
  constructor() {
    this.currentUser = null;
  }

  init() {
    // Check if view-creator-studio exists in DOM and render if active
    const screen = document.getElementById("view-creator-studio");
    if (screen) {
      this.renderCreatorStudioScreen();
    }
  }

  getUserAndWallet() {
    const user = (window.omniStore && typeof window.omniStore.getCurrentUser === "function" && window.omniStore.getCurrentUser()) || {
      id: "user_ankit",
      username: "ankit_chaudhary",
      displayName: "Ankit Chaudhary",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
    };

    let wallet = null;
    try {
      if (window.omniStore && typeof window.omniStore.getCreatorWallet === "function") {
        wallet = window.omniStore.getCreatorWallet(user.id);
      }
    } catch(e) {
      console.warn("Could not fetch creator wallet:", e);
    }

    if (!wallet) {
      wallet = {
        userId: user.id,
        balance: 48500,
        totalViews: 980000,
        rpmRate: 85,
        lifetimeEarnings: 83300,
        virtualGiftsCount: 310,
        transactions: [
          { id: "tx_1", type: "reels_views", amount: 2850, title: "Reels View Monetization (35k views)", date: "Today", status: "credited" },
          { id: "tx_2", type: "fan_gift", amount: 500, title: "👑 Crown Gift from Fan", date: "Yesterday", status: "credited" }
        ]
      };
    }

    return { user, wallet };
  }

  // 1. Open Floating Fullscreen / Centered Modal
  openCreatorStudio() {
    const { user, wallet } = this.getUserAndWallet();

    const modalHtml = `
      <div class="service-modal-overlay" id="creator-studio-modal" style="display: flex; z-index: 99999;">
        <div class="service-modal-box creator-studio-box">
          <!-- Modal Header -->
          <div class="creator-studio-header">
            <div class="creator-header-left">
              <div class="creator-avatar-ring">
                <img src="${user.avatar}" class="creator-avatar-img" alt="${user.displayName}" />
                <span class="creator-verified-badge">✓</span>
              </div>
              <div>
                <h2>Pluxy Creator Studio 💰</h2>
                <p class="creator-handle-tag">@${user.username} • ${user.displayName} (Monetized Creator)</p>
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
              <div class="creator-metric-sub">Instant withdrawal to UPI / Bank ⚡</div>
            </div>
            <div class="creator-metric-card">
              <div class="creator-metric-label">Monetized Reels Views</div>
              <div class="creator-metric-val">${(wallet.totalViews || 0).toLocaleString()}</div>
              <div class="creator-metric-sub">RPM Rate: ₹${wallet.rpmRate || 85} / 1k views</div>
            </div>
            <div class="creator-metric-card">
              <div class="creator-metric-label">Lifetime Total Earnings</div>
              <div class="creator-metric-val" style="color: #4ADE80;">₹${(wallet.lifetimeEarnings || 0).toLocaleString()}</div>
              <div class="creator-metric-sub">All-time views + fan tips</div>
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
                <span class="instant-transfer-badge">⚡ 24x7 Instant UPI</span>
              </div>
              <p class="section-hint">Withdraw your reel earnings directly to Google Pay, PhonePe, Paytm, or BHIM UPI.</p>
              
              <form onsubmit="window.creatorStudioModule.handleWithdrawalSubmit(event)" class="withdrawal-form">
                <div class="form-group-admin">
                  <label>Withdrawal Amount (₹ INR)</label>
                  <div class="input-with-symbol">
                    <span class="currency-symbol">₹</span>
                    <input type="number" id="withdraw-amount" class="admin-input" 
                           placeholder="Enter amount (min ₹100)" 
                           min="100" 
                           max="${wallet.balance || 50000}" 
                           value="${Math.min(wallet.balance || 5000, 5000)}" 
                           required />
                  </div>
                  <div class="quick-amount-chips">
                    <span class="amount-chip" onclick="document.getElementById('withdraw-amount').value = 500">₹500</span>
                    <span class="amount-chip" onclick="document.getElementById('withdraw-amount').value = 1000">₹1,000</span>
                    <span class="amount-chip" onclick="document.getElementById('withdraw-amount').value = 5000">₹5,000</span>
                    <span class="amount-chip max-chip" onclick="document.getElementById('withdraw-amount').value = ${wallet.balance || 0}">Max (₹${(wallet.balance || 0).toLocaleString()})</span>
                  </div>
                </div>

                <div class="form-group-admin">
                  <label>Your UPI ID / VPA</label>
                  <input type="text" id="withdraw-upi-id" class="admin-input" 
                         placeholder="e.g. 8533955333@upi, mobile@paytm" 
                         value="${user.username === 'ankit_chaudhary' ? '8533955333@upi' : user.username + '@okaxis'}" 
                         required />
                  <span class="field-helper">Verified Founder & Creator: ${user.displayName} (📞 8533955333)</span>
                </div>

                <button type="submit" class="btn-instant-withdraw">
                  <i class="ph-bold ph-lightning"></i> Transfer Money to UPI Instantly 💸
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
                  <div class="tx-history-item ${tx.type}">
                    <div class="tx-icon">
                      ${tx.type === 'withdrawal' ? '💸' : (tx.type === 'fan_gift' ? '🎁' : '💰')}
                    </div>
                    <div class="tx-info">
                      <strong>${tx.title}</strong>
                      <span class="tx-date">${tx.date} ${tx.refId ? '• Ref: ' + tx.refId : ''}</span>
                    </div>
                    <div class="tx-amount ${tx.type === 'withdrawal' ? 'debit' : 'credit'}">
                      ${tx.type === 'withdrawal' ? '-' : '+'}₹${(tx.amount || 0).toLocaleString()}
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
    window.app.playSound('ding');
  }

  closeCreatorStudio() {
    const modal = document.getElementById("creator-studio-modal");
    if (modal) modal.remove();
  }

  // 2. Render Full Screen View / Tab for Creator Studio
  renderCreatorStudioScreen() {
    const screen = document.getElementById("view-creator-studio");
    if (!screen) return;

    const { user, wallet } = this.getUserAndWallet();

    screen.innerHTML = `
      <div class="creator-studio-screen-content" style="padding: 16px; max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
        <!-- Header -->
        <div class="creator-studio-header">
          <div class="creator-header-left">
            <div class="creator-avatar-ring">
              <img src="${user.avatar}" class="creator-avatar-img" alt="${user.displayName}" />
              <span class="creator-verified-badge">✓</span>
            </div>
            <div>
              <h2>Pluxy Creator Studio 💰</h2>
              <p class="creator-handle-tag">@${user.username} • ${user.displayName} (Monetized Creator)</p>
            </div>
          </div>
          <button class="btn-creator-create-reel" onclick="window.reelsModule.openCreateReelModal()" title="Create New Reel in Studio">
            <i class="ph-bold ph-plus-circle"></i> Create Reel
          </button>
        </div>

        <!-- Metrics Cards -->
        <div class="creator-metrics-banner">
          <div class="creator-metric-card primary-gradient">
            <div class="creator-metric-label">Available Wallet Balance</div>
            <div class="creator-balance-large">₹${(wallet.balance || 0).toLocaleString()}</div>
            <div class="creator-metric-sub">Instant withdrawal to UPI / Bank ⚡</div>
          </div>
          <div class="creator-metric-card">
            <div class="creator-metric-label">Monetized Reels Views</div>
            <div class="creator-metric-val">${(wallet.totalViews || 0).toLocaleString()}</div>
            <div class="creator-metric-sub">RPM Rate: ₹${wallet.rpmRate || 85} / 1k views</div>
          </div>
          <div class="creator-metric-card">
            <div class="creator-metric-label">Lifetime Total Earnings</div>
            <div class="creator-metric-val" style="color: #4ADE80;">₹${(wallet.lifetimeEarnings || 0).toLocaleString()}</div>
            <div class="creator-metric-sub">All-time views + fan tips</div>
          </div>
          <div class="creator-metric-card">
            <div class="creator-metric-label">Virtual Fan Gifts Received</div>
            <div class="creator-metric-val" style="color: #FBBF24;">🎁 ${wallet.virtualGiftsCount || 0}</div>
            <div class="creator-metric-sub">💎 Rocket, Crown & Flames</div>
          </div>
        </div>

        <!-- Withdrawal & History -->
        <div class="creator-studio-content-grid">
          <div class="creator-withdraw-section">
            <div class="section-title-row">
              <h3><i class="ph-bold ph-bank"></i> Instant UPI Cash Out</h3>
              <span class="instant-transfer-badge">⚡ 24x7 Instant UPI</span>
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
                         max="${wallet.balance || 50000}" 
                         value="${Math.min(wallet.balance || 5000, 5000)}" 
                         required />
                </div>
                <div class="quick-amount-chips">
                  <span class="amount-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=500;">₹500</span>
                  <span class="amount-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=1000;">₹1,000</span>
                  <span class="amount-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=5000;">₹5,000</span>
                  <span class="amount-chip max-chip" onclick="const f=document.getElementById('withdraw-amount-tab'); if(f) f.value=${wallet.balance || 0};">Max (₹${(wallet.balance || 0).toLocaleString()})</span>
                </div>
              </div>

              <div class="form-group-admin">
                <label>Your UPI ID / VPA</label>
                <input type="text" id="withdraw-upi-id-tab" class="admin-input" 
                       placeholder="e.g. 8533955333@upi, mobile@paytm" 
                       value="${user.username === 'ankit_chaudhary' ? '8533955333@upi' : user.username + '@okaxis'}" 
                       required />
                <span class="field-helper">Verified Founder & Creator: ${user.displayName} (📞 8533955333)</span>
              </div>

              <button type="submit" class="btn-instant-withdraw">
                <i class="ph-bold ph-lightning"></i> Transfer Money to UPI Instantly 💸
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
                <div class="tx-history-item ${tx.type}">
                  <div class="tx-icon">
                    ${tx.type === 'withdrawal' ? '💸' : (tx.type === 'fan_gift' ? '🎁' : '💰')}
                  </div>
                  <div class="tx-info">
                    <strong>${tx.title}</strong>
                    <span class="tx-date">${tx.date} ${tx.refId ? '• Ref: ' + tx.refId : ''}</span>
                  </div>
                  <div class="tx-amount ${tx.type === 'withdrawal' ? 'debit' : 'credit'}">
                    ${tx.type === 'withdrawal' ? '-' : '+'}₹${(tx.amount || 0).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleWithdrawalSubmit(e) {
    e.preventDefault();
    const amountInput = document.getElementById("withdraw-amount") || document.getElementById("withdraw-amount-tab");
    const upiInput = document.getElementById("withdraw-upi-id") || document.getElementById("withdraw-upi-id-tab");

    const amount = parseFloat(amountInput ? amountInput.value : 0);
    const upiId = (upiInput ? upiInput.value : "").trim();
    const { user } = this.getUserAndWallet();

    if (isNaN(amount) || amount <= 0) {
      window.app.showToast("Please enter a valid withdrawal amount!");
      return;
    }

    if (!upiId) {
      window.app.showToast("Please enter your UPI ID!");
      return;
    }

    let res = null;
    if (window.omniStore && typeof window.omniStore.requestCreatorWithdrawal === "function") {
      res = window.omniStore.requestCreatorWithdrawal(user.id, amount, upiId);
    } else {
      res = {
        success: true,
        transaction: {
          refId: "PLX" + Math.floor(100000000 + Math.random() * 900000000),
          amount: amount,
          date: "Just now"
        },
        newBalance: 24500 - amount
      };
    }

    if (!res.success) {
      window.app.showToast(res.message || "Withdrawal request could not be processed!");
      window.app.playSound('pop');
      return;
    }

    // Sync with server if online
    if (window.syncEngine) {
      window.syncEngine.pushAdminUpdate("creator_reward", {
        userId: user.id,
        amount: -amount,
        note: `UPI Withdrawal to ${upiId} (Ref: ${res.transaction.refId})`
      });
    }

    // Show receipt
    this.showWithdrawalReceipt(amount, upiId, res.transaction.refId, res.newBalance);
  }

  showWithdrawalReceipt(amount, upiId, refId, newBalance) {
    const { user } = this.getUserAndWallet();
    const receiptHtml = `
      <div class="service-modal-overlay" id="withdrawal-receipt-modal" style="z-index: 100005; display: flex;">
        <div class="service-modal-box receipt-box">
          <div class="receipt-success-badge">
            <i class="ph-bold ph-check"></i>
          </div>
          <h3 class="receipt-title">Withdrawal Successful! 💸</h3>
          <p class="receipt-sub">Money has been transferred instantly to your UPI account.</p>

          <div class="receipt-amount-display">₹${amount.toLocaleString()}</div>

          <div class="receipt-details-card">
            <div class="receipt-detail-row">
              <span>Status</span>
              <strong style="color: #4ADE80;">✓ Instant Success (Completed)</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Destination UPI</span>
              <strong>${upiId}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Beneficiary</span>
              <strong>${user.displayName}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Transaction Ref ID</span>
              <strong>${refId}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Timestamp</span>
              <strong>${new Date().toLocaleString()}</strong>
            </div>
            <div class="receipt-detail-row">
              <span>Updated Creator Wallet</span>
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
    window.app.playSound('sent');
  }
}

window.creatorStudioModule = new CreatorStudioModule();
