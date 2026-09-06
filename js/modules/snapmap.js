// Snapchat Interactive Snap Map Module
class SnapMapModule {
  constructor() {
    this.container = document.getElementById("snapmap-container");
  }

  init() {
    this.renderMap();
  }

  renderMap() {
    const friends = window.omniStore.getMapFriends();
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="snapmap-canvas-wrapper">
        <!-- Radar Grid & Circles -->
        <div class="radar-grid"></div>
        <div class="radar-pulse"></div>

        <!-- Center You Marker -->
        <div class="snapmap-user-marker" style="top: 50%; left: 50%;">
          <div class="marker-pulse-ring"></div>
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Me" class="map-avatar" />
          <span class="marker-label">You (Sharing Location)</span>
        </div>

        <!-- Friends Markers -->
        ${friends.map(f => `
          <div class="snapmap-friend-marker" style="top: ${f.coords.y}%; left: ${f.coords.x}%;" onclick="window.snapMapModule.selectFriend('${f.id}')">
            <div class="friend-avatar-wrap">
              <img src="${f.avatar}" alt="${f.name}" />
              <span class="friend-status-emoji">${f.status.split(' ').pop()}</span>
            </div>
            <span class="marker-friend-name">${f.name.split(' ')[0]}</span>
          </div>
        `).join('')}

        <!-- Top Controls -->
        <div class="snapmap-top-bar">
          <div class="snapmap-badge"><i class="ph-fill ph-map-pin"></i> Live Snap Map</div>
          <button class="snapmap-ghost-btn" onclick="this.classList.toggle('active'); window.app.showToast('Ghost Mode toggled! 👻 (Your location is hidden)');">👻 Ghost Mode</button>
        </div>

        <!-- Bottom Sheet Card for Selected Friend -->
        <div class="snapmap-bottom-tray" id="snapmap-friend-detail">
          <div class="map-card-user">
            <img src="${friends[0].avatar}" id="map-card-avatar" />
            <div>
              <strong id="map-card-name">${friends[0].name}</strong>
              <p id="map-card-loc">${friends[0].location} • ${friends[0].time}</p>
              <div class="map-status-pill" id="map-card-status">${friends[0].status}</div>
            </div>
          </div>
          <button class="btn-snap-user-map" onclick="window.app.switchTab('camera')">Snap 📸</button>
        </div>
      </div>
    `;
  }

  selectFriend(friendId) {
    const friend = window.omniStore.getMapFriends().find(f => f.id === friendId);
    if (!friend) return;

    document.getElementById("map-card-avatar").src = friend.avatar;
    document.getElementById("map-card-name").innerText = friend.name;
    document.getElementById("map-card-loc").innerText = `${friend.location} • ${friend.time}`;
    document.getElementById("map-card-status").innerText = friend.status;

    window.app.playSound('pop');
  }
}

window.snapMapModule = new SnapMapModule();