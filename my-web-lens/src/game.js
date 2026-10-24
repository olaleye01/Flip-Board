// Core Game Loop & State Machine for Flip Board
// Adheres strictly to the gameplay mechanics, scoring formulas, and turn loops in docs/Mental-Model.md

import { storage } from './storage.js';
import { soundEngine } from './audio.js';
import { CATEGORY_POOLS } from './textures.js';

export class GameController {
  constructor(board3d) {
    this.board = board3d;

    this.categoryId = 0;
    this.equippedSkin = 0;

    this.state = 'ready'; // 'ready', 'playing', 'won', 'gameover'
    this.timeLeft = 60.0;
    this.totalFlips = 0;
    this.matchesFound = 0;
    this.currentStreak = 0;
    this.streakBonus = 0;

    this.boardItems = []; // 16 items (8 pairs)
    this.firstPickIndex = null;
    this.isLocked = false;
    this.timerId = null;
    this.lastTimestamp = null;
    this.isUrgent = false;

    // UI event hooks
    this.onTimerUpdate = null;
    this.onFlipsUpdate = null;
    this.onStreakUpdate = null;
    this.onBitmojiMood = null;
    this.onGameWon = null;
    this.onGameOver = null;

    // Setup board tap listener
    if (this.board) {
      this.board.onTileTapped = (index) => this.handleTileClick(index);
    }
  }

  // Initialize a new round with the specified category
  initRound(categoryId = 0, skinId = null) {
    this.stopTimer();
    soundEngine.stopUrgencyClock();

    this.categoryId = categoryId;
    if (skinId !== null) {
      this.equippedSkin = skinId;
    } else {
      this.equippedSkin = storage.get().equippedSkin || 0;
    }

    this.state = 'ready';
    this.timeLeft = 60.0;
    this.totalFlips = 0;
    this.matchesFound = 0;
    this.currentStreak = 0;
    this.streakBonus = 0;
    this.firstPickIndex = null;
    this.isLocked = false;
    this.isUrgent = false;

    soundEngine.resetStreak();

    // Generate 8 pairs randomly selected from 12 items in active category pool
    this.boardItems = this.generateBoardItems(categoryId);

    // Build 3D board
    this.board.setupCategory(this.categoryId, this.equippedSkin, this.boardItems);

    // Notify UI
    if (this.onTimerUpdate) this.onTimerUpdate(this.timeLeft, false);
    if (this.onFlipsUpdate) this.onFlipsUpdate(this.totalFlips);
    if (this.onStreakUpdate) this.onStreakUpdate(0, 0);
    if (this.onBitmojiMood) this.onBitmojiMood('idle');
  }

  // Randomly select 8 unique items out of 12, duplicate them to 16, and shuffle
  generateBoardItems(categoryId) {
    const pool = [...CATEGORY_POOLS[categoryId]];
    // Shuffle pool to pick 8
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected8 = pool.slice(0, 8);

    // Create 16 tiles (2 of each)
    const pairs = [];
    selected8.forEach(item => {
      pairs.push({ ...item });
      pairs.push({ ...item });
    });

    // Fisher-Yates shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    return pairs;
  }

  // Handle tile interaction (touch / click)
  handleTileClick(tileIndex) {
    if (this.state === 'won' || this.state === 'gameover' || this.isLocked) {
      return;
    }

    const tile = this.board.tiles[tileIndex];
    if (!tile || tile.isMatched || tile.state !== 'faceDown') {
      return;
    }

    // Countdown triggers on player's FIRST tile tap!
    if (this.state === 'ready') {
      this.startCountdown();
    }

    // Play category flip sound
    soundEngine.playFlip(this.categoryId);

    // Flip 3D tile up
    this.board.flipUp(tileIndex);
    this.totalFlips++;
    if (this.onFlipsUpdate) this.onFlipsUpdate(this.totalFlips);

    // First pick of the turn
    if (this.firstPickIndex === null) {
      this.firstPickIndex = tileIndex;
      return;
    }

    // Second pick of the turn
    const firstIdx = this.firstPickIndex;
    const secondIdx = tileIndex;
    this.firstPickIndex = null;
    this.isLocked = true; // Lock taps during evaluation

    const itemA = this.boardItems[firstIdx];
    const itemB = this.boardItems[secondIdx];

    const isMatch = itemA.id === itemB.id;

    if (isMatch) {
      // MATCH!
      this.matchesFound++;
      this.currentStreak++;
      // Streak bonus: +250 pts for each consecutive match made without an error
      if (this.currentStreak >= 2) {
        this.streakBonus += 250 * (this.currentStreak - 1);
      }

      // Update sound engine pitch for streak
      soundEngine.setStreak(this.currentStreak);
      soundEngine.playMatch(this.categoryId);

      // Lock tiles in 3D & spawn particle bursts
      this.board.lockMatch(firstIdx, secondIdx);

      // Bitmoji reacts with cheering on streaks
      if (this.onBitmojiMood) {
        this.onBitmojiMood(this.currentStreak >= 2 ? 'streak' : 'happy');
      }

      if (this.onStreakUpdate) {
        this.onStreakUpdate(this.currentStreak, this.streakBonus);
      }

      this.isLocked = false;

      // Check win condition (all 8 pairs matched)
      if (this.matchesFound === 8) {
        this.handleWin();
      }
    } else {
      // MISMATCH!
      // Reset streak
      this.currentStreak = 0;
      soundEngine.resetStreak();
      soundEngine.playMiss(this.categoryId);

      if (this.onStreakUpdate) {
        this.onStreakUpdate(0, this.streakBonus);
      }

      // 3D tile mismatch shake
      this.board.shakeMismatch(firstIdx, secondIdx);

      // Bitmoji shows brief disappointed/worry mood if in urgency or normal
      if (this.onBitmojiMood) {
        this.onBitmojiMood(this.isUrgent ? 'panic' : 'neutral');
      }

      // 0.65s delay per spec: "Both tiles shake briefly and flip back face-down after a 0.65-second delay"
      setTimeout(() => {
        this.board.flipDown(firstIdx);
        this.board.flipDown(secondIdx);
        this.isLocked = false;
      }, 650);
    }
  }

  // Start 60.0s strict countdown
  startCountdown() {
    this.state = 'playing';
    this.lastTimestamp = performance.now();

    this.timerId = requestAnimationFrame((ts) => this.tickTimer(ts));
  }

  tickTimer(now) {
    if (this.state !== 'playing') return;

    const dt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.timeLeft = Math.max(0, this.timeLeft - dt);

    // Urgency state (Final 10 seconds: 00:10 to 00:00)
    if (this.timeLeft <= 10.0 && !this.isUrgent) {
      this.isUrgent = true;
      this.board.setUrgencyState(true);

      // Start ticking clock sound and frame vibration
      soundEngine.startUrgencyClock(() => {
        if (this.state === 'playing') {
          this.board.pulseUrgencyVibration();
        }
      });

      if (this.onBitmojiMood) {
        this.onBitmojiMood('panic');
      }
    }

    if (this.onTimerUpdate) {
      this.onTimerUpdate(this.timeLeft, this.isUrgent);
    }

    // Time's up -> LOSS condition
    if (this.timeLeft <= 0.001) {
      this.handleLoss();
      return;
    }

    this.timerId = requestAnimationFrame((ts) => this.tickTimer(ts));
  }

  stopTimer() {
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
  }

  // Calculate final score according to docs/Mental-Model.md Section 4
  calculateScore() {
    // Time Left Bonus: Calculated to 0.1s precision (e.g. 32.4s left = 3,240 pts)
    const roundedSecondsLeft = Math.round(this.timeLeft * 10) / 10;
    const timeBonus = Math.round(roundedSecondsLeft * 100);

    // Flip Efficiency Bonus: max(0, 4000 - (Total Flips * 100))
    const efficiencyBonus = Math.max(0, 4000 - this.totalFlips * 100);

    // Final Score
    const finalScore = timeBonus + efficiencyBonus + this.streakBonus;

    return {
      timeBonus,
      efficiencyBonus,
      streakBonus: this.streakBonus,
      totalScore: finalScore,
      secondsLeft: roundedSecondsLeft,
      flips: this.totalFlips,
    };
  }

  // Handle Win Condition
  handleWin() {
    this.stopTimer();
    soundEngine.stopUrgencyClock();
    this.state = 'won';

    soundEngine.playWin(this.categoryId);

    const scoreData = this.calculateScore();

    // Record win in persistent storage and check milestone unlocks
    const winResults = storage.recordWin({
      score: scoreData.totalScore,
      timeLeft: scoreData.secondsLeft,
      flips: scoreData.flips,
      categoryId: this.categoryId,
    });

    if (this.onBitmojiMood) {
      this.onBitmojiMood('victory');
    }

    if (this.onGameWon) {
      this.onGameWon({
        ...scoreData,
        newHighScore: winResults.newHighScore,
        newUnlocks: winResults.newUnlocks,
        stats: winResults.stats,
        categoryId: this.categoryId,
      });
    }
  }

  // Handle Loss Condition (Time's Up)
  handleLoss() {
    this.stopTimer();
    soundEngine.stopUrgencyClock();
    this.state = 'gameover';

    if (this.onBitmojiMood) {
      this.onBitmojiMood('defeat');
    }

    if (this.onGameOver) {
      this.onGameOver({
        flips: this.totalFlips,
        matchesFound: this.matchesFound,
        categoryId: this.categoryId,
      });
    }
  }

  // Instant retry
  retry() {
    this.initRound(this.categoryId, this.equippedSkin);
  }
}
