// Flip Board - Application Entry Point
// Connects 3D PlayCanvas board, Game loop state machine, Procedural audio, and UI

import { Board3D } from './board3d.js';
import { GameController } from './game.js';
import { UIManager } from './ui.js';
import { soundEngine } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('playcanvas-canvas');

  // Resume Web Audio on first user interaction
  const resumeAudio = () => {
    soundEngine.ensureContext();
    window.removeEventListener('pointerdown', resumeAudio);
    window.removeEventListener('keydown', resumeAudio);
  };
  window.addEventListener('pointerdown', resumeAudio, { once: true });
  window.addEventListener('keydown', resumeAudio, { once: true });

  // 1. Initialize 3D PlayCanvas Board
  const board = new Board3D(canvas);

  // 2. Initialize Game Controller
  const game = new GameController(board);

  // 3. Initialize UI Manager
  const ui = new UIManager(game);

  // Start with default Category 0 preview and pre-game carousel
  ui.openCarousel();
  game.initRound(0);

  // Log Snapchat Web Lens environment status
  if (typeof window !== 'undefined' && window.snap) {
    console.log('✨ Snapchat Web Lens API detected:', window.snap);
  } else {
    console.log('🎮 Running in Standalone / Dev Mode with persistent storage & Web Lens simulator.');
  }
});
