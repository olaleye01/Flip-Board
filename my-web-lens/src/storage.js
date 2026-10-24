// Storage and Progression System for Flip Board
// Adheres strictly to the schema and unlock milestones in docs/Mental-Model.md

const STORAGE_KEY = 'flipboard_snap_data_v1';

const DEFAULT_DATA = {
  highScore: 0,
  cumulativeScore: 0,
  totalGamesWon: 0,
  fastestClearTimeLeft: 0.0,
  bestFlipCount: 999,
  categoriesCleared: [false, false, false, false, false],
  equippedSkin: 0,
  bitmojiAvatar: 'default',
};

// Category Metadata & Unlock criteria
export const CATEGORIES = [
  {
    id: 0,
    name: 'Animals',
    theme: 'Safari / Jungle',
    description: 'High-contrast friendly safari creatures & bamboo totem board.',
    locked: false,
    unlockDesc: 'Unlocked at Start',
    accentColor: '#10b981',
    lightColor: '#34d399',
    boardBg: '#1e3a1f',
  },
  {
    id: 1,
    name: 'Food',
    theme: 'Bento / Retro Diner',
    description: 'Crisp diner & bento treats in a lacquer dining box.',
    locked: false,
    unlockDesc: 'Unlocked at Start',
    accentColor: '#f59e0b',
    lightColor: '#fbbf24',
    boardBg: '#3b2314',
  },
  {
    id: 2,
    name: 'Sport',
    theme: 'Stadium Court',
    description: 'Dynamic athletic gear on mini turf with floodlights.',
    locked: false,
    unlockDesc: 'Unlocked at Start',
    accentColor: '#3b82f6',
    lightColor: '#60a5fa',
    boardBg: '#13283f',
  },
  {
    id: 3,
    name: 'Technology',
    theme: 'Cyber Motherboard',
    description: 'Sleek futuristic hardware on glowing circuit PCB.',
    locked: true,
    unlockDesc: 'Clear any board in under 35s (>25.0s left)',
    accentColor: '#06b6d4',
    lightColor: '#22d3ee',
    boardBg: '#0b1c28',
  },
  {
    id: 4,
    name: 'Colors',
    theme: 'Art Gallery (Master Tier)',
    description: 'Hypnotic two-tone gradients requiring visual-spatial memory.',
    locked: true,
    unlockDesc: 'Reach 20,000+ Cumulative Score',
    accentColor: '#ec4899',
    lightColor: '#f472b6',
    boardBg: '#2a122e',
  },
];

// Cosmetic Tile Backs (Center Emblem Skins)
export const TILE_SKINS = [
  {
    id: 0,
    name: 'Classic Snap Emblem',
    description: 'The iconic Snapchat ghost on vivid canary yellow.',
    unlockedByDefault: true,
    unlockDesc: 'Default starting tile back',
    rarity: 'Common',
    badge: '👻 Snap Classic',
  },
  {
    id: 1,
    name: 'Neon Cyber Crest',
    description: 'Luminous cyan & magenta angular cybernetic sigil.',
    unlockedByDefault: false,
    unlockDesc: 'Unlocked after 5 total wins',
    rarity: 'Rare',
    badge: '⚡ Neon Cyber',
  },
  {
    id: 2,
    name: '24K Gold Foil Emblem',
    description: 'Polished royal gilded crown for master efficiency.',
    unlockedByDefault: false,
    unlockDesc: 'Clear any board in 20 flips or fewer',
    rarity: 'Epic',
    badge: '👑 24K Gold',
  },
  {
    id: 3,
    name: 'Bitmoji Stamp',
    description: 'Your personalized Bitmoji stamped on every single tile.',
    unlockedByDefault: false,
    unlockDesc: 'Win at least once in all 5 categories',
    rarity: 'Legendary',
    badge: '🌟 Bitmoji Stamp',
  },
];

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    // If Snapchat Web Lens SDK storage is available
    if (typeof window !== 'undefined' && window.snap?.storage) {
      try {
        const snapData = window.snap.storage.get(STORAGE_KEY);
        if (snapData) return { ...DEFAULT_DATA, ...JSON.parse(snapData) };
      } catch (e) {
        console.warn('Snapchat storage get error:', e);
      }
    }

    // LocalStorage fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) return { ...DEFAULT_DATA, ...JSON.parse(local) };
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }

    return { ...DEFAULT_DATA };
  }

  save() {
    const serialized = JSON.stringify(this.data);
    if (typeof window !== 'undefined' && window.snap?.storage) {
      try {
        window.snap.storage.set(STORAGE_KEY, serialized);
      } catch (e) {
        console.warn('Snapchat storage set error:', e);
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }

  get() {
    return this.data;
  }

  isCategoryUnlocked(categoryId) {
    if (categoryId <= 2) return true;
    if (categoryId === 3) {
      // Technology: Clear in under 35s (>25.0s left)
      return this.data.fastestClearTimeLeft > 25.0;
    }
    if (categoryId === 4) {
      // Colors: Reach 20,000+ Cumulative Score
      return this.data.cumulativeScore >= 20000;
    }
    return false;
  }

  getCategoryProgress(categoryId) {
    if (categoryId <= 2) return { unlocked: true, ratio: 1.0, text: 'Unlocked' };
    if (categoryId === 3) {
      const bestTime = this.data.fastestClearTimeLeft;
      const target = 25.0;
      const unlocked = bestTime > target;
      const ratio = Math.min(1.0, bestTime / target);
      return {
        unlocked,
        ratio,
        current: bestTime > 0 ? `${bestTime.toFixed(1)}s left` : 'No wins yet',
        target: '> 25.0s left (clear in < 35s)',
        text: unlocked ? 'Unlocked!' : `${bestTime.toFixed(1)}s / 25.0s left`,
      };
    }
    if (categoryId === 4) {
      const score = this.data.cumulativeScore;
      const target = 20000;
      const unlocked = score >= target;
      const ratio = Math.min(1.0, score / target);
      return {
        unlocked,
        ratio,
        current: `${score.toLocaleString()} pts`,
        target: '20,000 pts',
        text: unlocked ? 'Unlocked!' : `${score.toLocaleString()} / 20,000 pts`,
      };
    }
    return { unlocked: false, ratio: 0, text: 'Locked' };
  }

  isSkinUnlocked(skinId) {
    if (skinId === 0) return true;
    if (skinId === 1) {
      // Neon Cyber Crest: 5 total wins
      return this.data.totalGamesWon >= 5;
    }
    if (skinId === 2) {
      // 24K Gold Foil: <= 20 flips
      return this.data.bestFlipCount <= 20;
    }
    if (skinId === 3) {
      // Bitmoji Stamp: Won in all 5 categories
      return this.data.categoriesCleared.length === 5 && this.data.categoriesCleared.every(Boolean);
    }
    return false;
  }

  getSkinProgress(skinId) {
    if (skinId === 0) return { unlocked: true, ratio: 1.0, text: 'Default' };
    if (skinId === 1) {
      const wins = this.data.totalGamesWon;
      const target = 5;
      const unlocked = wins >= target;
      return {
        unlocked,
        ratio: Math.min(1.0, wins / target),
        text: unlocked ? 'Unlocked!' : `${wins} / ${target} wins`,
      };
    }
    if (skinId === 2) {
      const best = this.data.bestFlipCount;
      const unlocked = best <= 20;
      const ratio = best === 999 ? 0 : Math.min(1.0, (40 - Math.min(40, best)) / 20);
      return {
        unlocked,
        ratio,
        text: unlocked ? 'Unlocked!' : best === 999 ? 'Best: -- / 20 flips' : `Best: ${best} / 20 flips`,
      };
    }
    if (skinId === 3) {
      const clearedCount = this.data.categoriesCleared.filter(Boolean).length;
      const unlocked = clearedCount === 5;
      return {
        unlocked,
        ratio: clearedCount / 5,
        text: unlocked ? 'Unlocked!' : `${clearedCount} / 5 categories cleared`,
      };
    }
    return { unlocked: false, ratio: 0, text: 'Locked' };
  }

  setEquippedSkin(skinId) {
    if (this.isSkinUnlocked(skinId)) {
      this.data.equippedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  // Record a finished win and return any new unlocks!
  recordWin({ score, timeLeft, flips, categoryId }) {
    const priorTechUnlocked = this.isCategoryUnlocked(3);
    const priorColorsUnlocked = this.isCategoryUnlocked(4);
    const priorSkin1 = this.isSkinUnlocked(1);
    const priorSkin2 = this.isSkinUnlocked(2);
    const priorSkin3 = this.isSkinUnlocked(3);

    // Update career stats
    this.data.totalGamesWon += 1;
    this.data.cumulativeScore += score;
    if (score > this.data.highScore) {
      this.data.highScore = score;
    }
    if (timeLeft > this.data.fastestClearTimeLeft) {
      this.data.fastestClearTimeLeft = parseFloat(timeLeft.toFixed(1));
    }
    if (flips < this.data.bestFlipCount) {
      this.data.bestFlipCount = flips;
    }
    if (categoryId >= 0 && categoryId < 5) {
      this.data.categoriesCleared[categoryId] = true;
    }

    this.save();

    // Check newly unlocked items
    const newUnlocks = [];
    if (!priorTechUnlocked && this.isCategoryUnlocked(3)) {
      newUnlocks.push({ type: 'category', id: 3, name: 'Technology Category', icon: '💻' });
    }
    if (!priorColorsUnlocked && this.isCategoryUnlocked(4)) {
      newUnlocks.push({ type: 'category', id: 4, name: 'Colors (Master Tier)', icon: '🎨' });
    }
    if (!priorSkin1 && this.isSkinUnlocked(1)) {
      newUnlocks.push({ type: 'skin', id: 1, name: 'Neon Cyber Crest', icon: '⚡' });
    }
    if (!priorSkin2 && this.isSkinUnlocked(2)) {
      newUnlocks.push({ type: 'skin', id: 2, name: '24K Gold Foil Emblem', icon: '👑' });
    }
    if (!priorSkin3 && this.isSkinUnlocked(3)) {
      newUnlocks.push({ type: 'skin', id: 3, name: 'Bitmoji Stamp Skin', icon: '🌟' });
    }

    // Submit to Snapchat Leaderboard if available
    this.submitLeaderboardScore(score);

    return {
      newHighScore: score === this.data.highScore,
      newUnlocks,
      stats: { ...this.data },
    };
  }

  submitLeaderboardScore(score) {
    if (typeof window !== 'undefined' && window.snap?.leaderboard) {
      try {
        window.snap.leaderboard.submitScore({
          leaderboardId: 'flip_board_friends',
          score: Math.round(score),
        });
      } catch (e) {
        console.warn('Snapchat leaderboard submit error:', e);
      }
    }
  }

  // Get realistic friends and global leaderboards
  getLeaderboardData(playerScore = 0) {
    const userScore = Math.max(this.data.highScore, playerScore);

    const friendsList = [
      { name: 'Kai (You)', score: userScore, isPlayer: true, avatar: '😎', badge: '1st' },
      { name: 'Sarah B.', score: 5820, isPlayer: false, avatar: '👩‍🦰', badge: '2nd' },
      { name: 'Leo Martinez', score: 5310, isPlayer: false, avatar: '🧢', badge: '3rd' },
      { name: 'Amina K.', score: 4890, isPlayer: false, avatar: '🧕', badge: '4th' },
      { name: 'Tobi Daniels', score: 4210, isPlayer: false, avatar: '🎧', badge: '5th' },
      { name: 'Chloe Chen', score: 3870, isPlayer: false, avatar: '🎀', badge: '6th' },
    ].sort((a, b) => b.score - a.score);

    const globalList = [
      { name: 'SnapMaster_99', score: 7120, isPlayer: false, avatar: '⚡', badge: '#1 Global' },
      { name: 'VortexSpeed', score: 6890, isPlayer: false, avatar: '🚀', badge: '#2 Global' },
      { name: 'AuraGamer', score: 6540, isPlayer: false, avatar: '👾', badge: '#3 Global' },
      { name: 'Kai (You)', score: userScore, isPlayer: true, avatar: '😎', badge: '#42 Global' },
      { name: 'PixelSamurai', score: 6180, isPlayer: false, avatar: '🗡️', badge: '#43 Global' },
      { name: 'ZenMemory', score: 5940, isPlayer: false, avatar: '🧘', badge: '#44 Global' },
    ].sort((a, b) => b.score - a.score);

    return { friends: friendsList, global: globalList };
  }
}

export const storage = new StorageManager();
