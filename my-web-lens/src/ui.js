// HUD, Pre-Game Carousel, Post-Game Flex Card, and Leaderboard UI Manager
// Strictly implements Section 7 of docs/Mental-Model.md with ultra-rich aesthetics

import { storage, CATEGORIES, TILE_SKINS } from './storage.js';

export class UIManager {
  constructor(gameController) {
    this.game = gameController;

    // DOM element references
    this.hudElement = document.getElementById('in-game-hud');
    this.timerDisplay = document.getElementById('timer-display');
    this.flipsDisplay = document.getElementById('flips-display');
    this.streakBadge = document.getElementById('streak-badge');
    this.restartBtn = document.getElementById('restart-btn');
    this.bitmojiContainer = document.getElementById('spectator-bitmoji');

    // Pre-game carousel
    this.carouselModal = document.getElementById('pregame-carousel-modal');
    this.carouselCard = document.getElementById('carousel-card');
    this.catNameElem = document.getElementById('cat-name');
    this.catThemeElem = document.getElementById('cat-theme');
    this.catDescElem = document.getElementById('cat-desc');
    this.catStatusBadge = document.getElementById('cat-status-badge');
    this.catProgressContainer = document.getElementById('cat-progress-container');
    this.catProgressBar = document.getElementById('cat-progress-bar');
    this.catProgressText = document.getElementById('cat-progress-text');
    this.prevCatBtn = document.getElementById('prev-cat-btn');
    this.nextCatBtn = document.getElementById('next-cat-btn');
    this.playCatBtn = document.getElementById('play-cat-btn');
    this.skinsDrawerBtn = document.getElementById('open-skins-btn');

    // Tile Back Skins Drawer Modal
    this.skinsModal = document.getElementById('skins-modal');
    this.skinsGrid = document.getElementById('skins-grid');
    this.closeSkinsBtn = document.getElementById('close-skins-btn');

    // Post-game Flex Card Modal
    this.flexModal = document.getElementById('flex-card-modal');
    this.flexCard = document.getElementById('flex-card');
    this.flexTitle = document.getElementById('flex-title');
    this.flexBitmoji = document.getElementById('flex-bitmoji');
    this.flexScoreVal = document.getElementById('flex-score-val');
    this.flexTimeVal = document.getElementById('flex-time-val');
    this.flexFlipsVal = document.getElementById('flex-flips-val');
    this.flexStreakVal = document.getElementById('flex-streak-val');
    this.flexUnlocksArea = document.getElementById('flex-unlocks-area');
    this.flexPlayAgainBtn = document.getElementById('flex-play-again-btn');
    this.flexShareBtn = document.getElementById('flex-share-btn');
    this.openLeaderboardBtn = document.getElementById('open-leaderboard-btn');

    // Leaderboard Drawer
    this.leaderboardModal = document.getElementById('leaderboard-modal');
    this.closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    this.tabFriends = document.getElementById('tab-friends');
    this.tabGlobal = document.getElementById('tab-global');
    this.leaderboardList = document.getElementById('leaderboard-list');

    // Current state
    this.carouselIndex = 0;
    this.activeLeaderboardTab = 'friends';
    this.currentBitmojiMood = 'idle';

    this.initEvents();
    this.hookGame();
  }

  initEvents() {
    // Carousel navigation
    if (this.prevCatBtn) {
      this.prevCatBtn.addEventListener('click', () => this.navigateCarousel(-1));
    }
    if (this.nextCatBtn) {
      this.nextCatBtn.addEventListener('click', () => this.navigateCarousel(1));
    }
    if (this.playCatBtn) {
      this.playCatBtn.addEventListener('click', () => this.startSelectedCategory());
    }

    // Quick restart button
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.game.retry();
      });
    }

    // Tile Backs Drawer
    if (this.skinsDrawerBtn) {
      this.skinsDrawerBtn.addEventListener('click', () => this.openSkinsDrawer());
    }
    if (this.closeSkinsBtn) {
      this.closeSkinsBtn.addEventListener('click', () => {
        this.skinsModal.classList.add('hidden');
      });
    }

    // Flex Card Actions
    if (this.flexPlayAgainBtn) {
      this.flexPlayAgainBtn.addEventListener('click', () => {
        this.flexModal.classList.add('hidden');
        this.openCarousel();
      });
    }
    if (this.flexShareBtn) {
      this.flexShareBtn.addEventListener('click', () => this.shareFlexCard());
    }
    if (this.openLeaderboardBtn) {
      this.openLeaderboardBtn.addEventListener('click', () => this.openLeaderboard());
    }

    // Leaderboard Drawer
    if (this.closeLeaderboardBtn) {
      this.closeLeaderboardBtn.addEventListener('click', () => {
        this.leaderboardModal.classList.add('hidden');
      });
    }
    if (this.tabFriends) {
      this.tabFriends.addEventListener('click', () => {
        this.activeLeaderboardTab = 'friends';
        this.tabFriends.classList.add('active');
        this.tabGlobal.classList.remove('active');
        this.renderLeaderboard();
      });
    }
    if (this.tabGlobal) {
      this.tabGlobal.addEventListener('click', () => {
        this.activeLeaderboardTab = 'global';
        this.tabGlobal.classList.add('active');
        this.tabFriends.classList.remove('active');
        this.renderLeaderboard();
      });
    }

    // Interactive Bitmoji tap to cycle expressions
    if (this.bitmojiContainer) {
      this.bitmojiContainer.addEventListener('click', () => {
        const moods = ['idle', 'happy', 'streak', 'panic', 'victory'];
        const nextIdx = (moods.indexOf(this.currentBitmojiMood) + 1) % moods.length;
        this.renderBitmoji(moods[nextIdx]);
      });
    }
  }

  hookGame() {
    // 1. Timer update
    this.game.onTimerUpdate = (timeLeft, isUrgent) => {
      const formatted = timeLeft.toFixed(1);
      if (this.timerDisplay) {
        this.timerDisplay.textContent = formatted.padStart(4, '0');
        if (isUrgent) {
          this.timerDisplay.classList.add('urgent-pulse');
        } else {
          this.timerDisplay.classList.remove('urgent-pulse');
        }
      }
    };

    // 2. Flips update
    this.game.onFlipsUpdate = (flips) => {
      if (this.flipsDisplay) {
        this.flipsDisplay.textContent = `Flips: ${flips}`;
      }
    };

    // 3. Streak badge
    this.game.onStreakUpdate = (streak, streakBonus) => {
      if (!this.streakBadge) return;
      if (streak >= 2) {
        this.streakBadge.classList.remove('hidden');
        this.streakBadge.innerHTML = `<span>🔥 STREAK x${streak}</span> <small>(+${streakBonus} pts)</small>`;
        this.streakBadge.classList.add('streak-pop');
        setTimeout(() => this.streakBadge.classList.remove('streak-pop'), 250);
      } else {
        this.streakBadge.classList.add('hidden');
      }
    };

    // 4. Bitmoji mood
    this.game.onBitmojiMood = (mood) => {
      this.renderBitmoji(mood);
    };

    // 5. Game won
    this.game.onGameWon = (summary) => {
      this.showFlexCard(summary, true);
    };

    // 6. Game over (time out)
    this.game.onGameOver = (summary) => {
      this.showFlexCard(summary, false);
    };
  }

  // --- Pre-Game Carousel ---
  openCarousel() {
    this.carouselModal.classList.remove('hidden');
    this.hudElement.classList.add('hidden');
    this.updateCarouselView();
  }

  navigateCarousel(direction) {
    this.carouselIndex = (this.carouselIndex + direction + CATEGORIES.length) % CATEGORIES.length;
    this.updateCarouselView();
    // Live preview 3D board background
    this.game.initRound(this.carouselIndex);
  }

  updateCarouselView() {
    const cat = CATEGORIES[this.carouselIndex];
    const isUnlocked = storage.isCategoryUnlocked(cat.id);
    const progress = storage.getCategoryProgress(cat.id);

    this.catNameElem.textContent = cat.name;
    this.catThemeElem.textContent = cat.theme;
    this.catDescElem.textContent = cat.description;

    if (isUnlocked) {
      this.catStatusBadge.className = 'status-badge unlocked';
      this.catStatusBadge.textContent = 'READY TO PLAY';
      this.catProgressContainer.classList.add('hidden');
      this.playCatBtn.disabled = false;
      this.playCatBtn.textContent = `PLAY ${cat.name.toUpperCase()}`;
      this.playCatBtn.classList.remove('btn-locked');
    } else {
      this.catStatusBadge.className = 'status-badge locked';
      this.catStatusBadge.textContent = 'LOCKED';
      this.catProgressContainer.classList.remove('hidden');
      this.catProgressBar.style.width = `${Math.round(progress.ratio * 100)}%`;
      this.catProgressText.textContent = `${cat.unlockDesc} (${progress.text})`;
      this.playCatBtn.disabled = true;
      this.playCatBtn.textContent = 'MILESTONE LOCKED';
      this.playCatBtn.classList.add('btn-locked');
    }
  }

  startSelectedCategory() {
    if (!storage.isCategoryUnlocked(this.carouselIndex)) return;
    this.carouselModal.classList.add('hidden');
    this.hudElement.classList.remove('hidden');
    this.game.initRound(this.carouselIndex);
  }

  // --- Tile Back Skins Drawer ---
  openSkinsDrawer() {
    this.skinsModal.classList.remove('hidden');
    this.renderSkinsList();
  }

  renderSkinsList() {
    this.skinsGrid.innerHTML = '';
    const currentEquipped = storage.get().equippedSkin;

    TILE_SKINS.forEach(skin => {
      const isUnlocked = storage.isSkinUnlocked(skin.id);
      const isEquipped = currentEquipped === skin.id;
      const progress = storage.getSkinProgress(skin.id);

      const card = document.createElement('div');
      card.className = `skin-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

      card.innerHTML = `
        <div class="skin-badge">${skin.badge}</div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-desc">${skin.description}</div>
        <div class="skin-status">
          ${isEquipped ? '<span class="status-equipped">✓ EQUIPPED</span>' : isUnlocked ? '<button class="btn-equip">EQUIP</button>' : `<span class="status-locked">🔒 ${progress.text}</span>`}
        </div>
      `;

      if (isUnlocked && !isEquipped) {
        card.querySelector('.btn-equip').addEventListener('click', () => {
          storage.setEquippedSkin(skin.id);
          this.game.equippedSkin = skin.id;
          this.renderSkinsList();
          // Update live preview
          this.game.initRound(this.carouselIndex, skin.id);
        });
      }

      this.skinsGrid.appendChild(card);
    });
  }

  // --- Bitmoji Reactive Avatar ---
  renderBitmoji(mood = 'idle') {
    this.currentBitmojiMood = mood;
    const svg = this.createBitmojiSVG(mood);
    if (this.bitmojiContainer) {
      this.bitmojiContainer.innerHTML = svg;
    }
    if (this.flexBitmoji) {
      this.flexBitmoji.innerHTML = this.createBitmojiSVG(mood, 110);
    }
  }

  createBitmojiSVG(mood, size = 64) {
    // Highly expressive, crisp Snapchat Bitmoji SVG avatar
    let mouth = '<path d="M 18 36 Q 32 46 46 36" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>';
    let eyes = `
      <ellipse cx="23" cy="24" rx="4" ry="5" fill="#1e293b"/>
      <ellipse cx="41" cy="24" rx="4" ry="5" fill="#1e293b"/>
      <circle cx="24" cy="22" r="1.5" fill="#fff"/>
      <circle cx="42" cy="22" r="1.5" fill="#fff"/>
    `;
    let accessories = '';

    if (mood === 'streak') {
      // Cool sunglasses with reflection
      eyes = `
        <rect x="14" y="19" width="16" height="11" rx="4" fill="#0f172a"/>
        <rect x="34" y="19" width="16" height="11" rx="4" fill="#0f172a"/>
        <line x1="30" y1="24" x2="34" y2="24" stroke="#0f172a" stroke-width="3"/>
        <line x1="16" y1="22" x2="26" y2="27" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
        <line x1="36" y1="22" x2="46" y2="27" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
      `;
      mouth = '<path d="M 18 34 Q 32 48 46 34" stroke="#000" stroke-width="3.5" fill="#ec4899" stroke-linecap="round"/>';
      accessories = '<circle cx="56" cy="12" r="4" fill="#fbbf24"/><circle cx="8" cy="18" r="3" fill="#f59e0b"/>';
    } else if (mood === 'panic') {
      // Wide alarmed eyes & sweat drops
      eyes = `
        <circle cx="23" cy="24" r="6" fill="#fff" stroke="#000" stroke-width="2"/>
        <circle cx="41" cy="24" r="6" fill="#fff" stroke="#000" stroke-width="2"/>
        <circle cx="23" cy="24" r="2.5" fill="#000"/>
        <circle cx="41" cy="24" r="2.5" fill="#000"/>
      `;
      mouth = '<ellipse cx="32" cy="38" rx="7" ry="5" fill="#000"/>';
      accessories = `
        <!-- Sweat droplet -->
        <path d="M 52 14 C 54 18 55 21 53 23 C 51 25 47 25 46 22 C 45 20 50 16 52 14 Z" fill="#38bdf8"/>
        <path d="M 10 16 C 12 19 12 22 10 24 C 8 26 5 25 5 23 C 5 21 8 18 10 16 Z" fill="#38bdf8"/>
      `;
    } else if (mood === 'victory') {
      // Golden Crown + ecstatic wink
      eyes = `
        <path d="M 17 25 Q 23 20 29 25" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 35 25 Q 41 20 47 25" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      mouth = '<path d="M 18 32 Q 32 50 46 32 Z" fill="#dc2626" stroke="#000" stroke-width="2.5"/>';
      accessories = `
        <!-- Crown -->
        <polygon points="18,12 23,2 32,10 41,2 46,12" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <circle cx="32" cy="10" r="2.5" fill="#ef4444"/>
      `;
    } else if (mood === 'defeat') {
      // Crying tears & sad frown
      eyes = `
        <ellipse cx="23" cy="24" rx="4" ry="4" fill="#1e293b"/>
        <ellipse cx="41" cy="24" rx="4" ry="4" fill="#1e293b"/>
        <!-- Tears -->
        <path d="M 23 28 C 24 33 24 37 22 39 C 20 40 18 38 18 35 C 18 33 22 30 23 28 Z" fill="#60a5fa"/>
        <path d="M 41 28 C 42 33 42 37 40 39 C 38 40 36 38 36 35 C 36 33 40 30 41 28 Z" fill="#60a5fa"/>
      `;
      mouth = '<path d="M 20 40 Q 32 32 44 40" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>';
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Avatar Base Head -->
        <ellipse cx="32" cy="32" rx="26" ry="25" fill="#fcd34d" stroke="#f59e0b" stroke-width="3"/>
        <!-- Hair Cap -->
        <path d="M 8 28 C 8 10 56 10 56 28 C 50 20 40 16 32 16 C 24 16 14 20 8 28 Z" fill="#78350f"/>
        <!-- Blush -->
        <circle cx="14" cy="31" r="4" fill="#f43f5e" opacity="0.4"/>
        <circle cx="50" cy="31" r="4" fill="#f43f5e" opacity="0.4"/>
        ${accessories}
        ${eyes}
        ${mouth}
      </svg>
    `;
  }

  // --- Post-Game Flex Card ---
  showFlexCard(summary, isWin) {
    this.flexModal.classList.remove('hidden');

    if (isWin) {
      this.flexTitle.textContent = 'ROUND CLEARED!';
      this.flexTitle.className = 'flex-title win';
      this.flexScoreVal.textContent = summary.totalScore.toLocaleString();
      this.flexTimeVal.textContent = `+${summary.timeBonus.toLocaleString()} pts (${summary.secondsLeft}s left)`;
      this.flexFlipsVal.textContent = `+${summary.efficiencyBonus.toLocaleString()} pts (${summary.flips} flips)`;
      this.flexStreakVal.textContent = `+${summary.streakBonus.toLocaleString()} pts`;
      this.renderBitmoji('victory');

      // Milestone Unlock Toasts
      this.flexUnlocksArea.innerHTML = '';
      if (summary.newUnlocks && summary.newUnlocks.length > 0) {
        summary.newUnlocks.forEach(unlock => {
          const toast = document.createElement('div');
          toast.className = 'unlock-toast';
          toast.innerHTML = `<span class="toast-icon">${unlock.icon}</span> <div><strong>UNLOCKED:</strong> ${unlock.name}!</div>`;
          this.flexUnlocksArea.appendChild(toast);
        });
      }
    } else {
      this.flexTitle.textContent = "TIME'S UP!";
      this.flexTitle.className = 'flex-title loss';
      this.flexScoreVal.textContent = '0';
      this.flexTimeVal.textContent = '0.0s left';
      this.flexFlipsVal.textContent = `${summary.flips} flips`;
      this.flexStreakVal.textContent = '0 pts';
      this.renderBitmoji('defeat');
      this.flexUnlocksArea.innerHTML = '<div class="loss-tip">Keep your eyes sharp! The clock starts on your first tap.</div>';
    }
  }

  shareFlexCard() {
    const score = this.flexScoreVal.textContent;
    const shareText = `🧩 I scored ${score} pts in Flip Board on Snapchat! Can you beat my time?`;

    if (navigator.share) {
      navigator.share({
        title: 'Flip Board - Snapchat Web Lens',
        text: shareText,
        url: window.location.href,
      }).catch(err => console.log('Share canceled:', err));
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert('Score copied to clipboard! Share it with your friends on Snapchat.');
    }
  }

  // --- Snapchat Leaderboard Drawer ---
  openLeaderboard() {
    this.leaderboardModal.classList.remove('hidden');
    this.renderLeaderboard();
  }

  renderLeaderboard() {
    const data = storage.getLeaderboardData();
    const list = this.activeLeaderboardTab === 'friends' ? data.friends : data.global;

    this.leaderboardList.innerHTML = '';
    list.forEach((entry, idx) => {
      const row = document.createElement('div');
      row.className = `leaderboard-row ${entry.isPlayer ? 'player-row' : ''}`;
      row.innerHTML = `
        <div class="lb-rank">${idx + 1}</div>
        <div class="lb-avatar">${entry.avatar}</div>
        <div class="lb-name">${entry.name}</div>
        <div class="lb-badge">${entry.badge}</div>
        <div class="lb-score">${entry.score.toLocaleString()}</div>
      `;
      this.leaderboardList.appendChild(row);
    });
  }
}
