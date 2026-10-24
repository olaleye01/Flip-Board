// Procedural Texture Generator for Flip Board
// Generates high-res 256x256 textures for all 48 item icons, 12 master tier color gradients, 4 tile back skins, and board frames

import {
  Texture,
  FILTER_LINEAR_MIPMAP_LINEAR,
  FILTER_LINEAR,
  ADDRESS_CLAMP_TO_EDGE,
  PIXELFORMAT_RGBA8,
} from 'playcanvas';

// Category 0: Animals (12 items)
export const ANIMAL_ITEMS = [
  { id: 0, name: 'Lion', color: '#f59e0b', subColor: '#b45309', icon: '🦁', desc: 'Big circular spiky mane' },
  { id: 1, name: 'Giant Panda', color: '#f3f4f6', subColor: '#111827', icon: '🐼', desc: 'Black & white eye patches' },
  { id: 2, name: 'Octopus', color: '#c026d3', subColor: '#9333ea', icon: '🐙', desc: 'Vibrant purple & tentacles' },
  { id: 3, name: 'Red Fox', color: '#ea580c', subColor: '#fdba74', icon: '🦊', desc: 'Pointed ears & white cheeks' },
  { id: 4, name: 'Toucan', color: '#0f172a', subColor: '#e11d48', icon: '🦜', desc: 'Rainbow curved beak profile' },
  { id: 5, name: 'Tree Frog', color: '#22c55e', subColor: '#ef4444', icon: '🐸', desc: 'Neon green with red eyes' },
  { id: 6, name: 'Elephant', color: '#64748b', subColor: '#94a3b8', icon: '🐘', desc: 'Slate grey with curved trunk' },
  { id: 7, name: 'Flamingo', color: '#ec4899', subColor: '#f43f5e', icon: '🦩', desc: 'Hot pink slender S-neck' },
  { id: 8, name: 'Owl', color: '#78350f', subColor: '#fbbf24', icon: '🦉', desc: 'Warm brown & glowing eyes' },
  { id: 9, name: 'Chameleon', color: '#0d9488', subColor: '#14b8a6', icon: '🦎', desc: 'Teal with spiral tail' },
  { id: 10, name: 'Koala', color: '#9ca3af', subColor: '#374151', icon: '🐨', desc: 'Fluffy ears & black nose' },
  { id: 11, name: 'Bumblebee', color: '#eab308', subColor: '#000000', icon: '🐝', desc: 'Yellow & black stripes' },
];

// Category 1: Food (12 items)
export const FOOD_ITEMS = [
  { id: 0, name: 'Cheeseburger', color: '#d97706', subColor: '#16a34a', icon: '🍔', desc: 'Layered burger & melted cheese' },
  { id: 1, name: 'Salmon Nigiri', color: '#f97316', subColor: '#ffffff', icon: '🍣', desc: 'Orange fish over rice block' },
  { id: 2, name: 'Frosted Donut', color: '#f472b6', subColor: '#fbbf24', icon: '🍩', desc: 'Pink frosting & sprinkles' },
  { id: 3, name: 'Taco', color: '#eab308', subColor: '#dc2626', icon: '🌮', desc: 'Golden crunchy folded shell' },
  { id: 4, name: 'Pizza Slice', color: '#ef4444', subColor: '#f59e0b', icon: '🍕', desc: 'Pepperoni triangle slice' },
  { id: 5, name: 'Ramen Bowl', color: '#dc2626', subColor: '#fef08a', icon: '🍜', desc: 'Red bowl & chopsticks' },
  { id: 6, name: 'Avocado Half', color: '#65a30d', subColor: '#78350f', icon: '🥑', desc: 'Green body with brown pit' },
  { id: 7, name: 'French Fries', color: '#ef4444', subColor: '#fbbf24', icon: '🍟', desc: 'Golden sticks in red sleeve' },
  { id: 8, name: 'Watermelon Wedge', color: '#e11d48', subColor: '#15803d', icon: '🍉', desc: 'Crimson slice & seeds' },
  { id: 9, name: 'Ice Cream Cone', color: '#38bdf8', subColor: '#fde047', icon: '🍦', desc: 'Pastel swirl waffle cone' },
  { id: 10, name: 'Croissant', color: '#d97706', subColor: '#fef3c7', icon: '🥐', desc: 'Warm flaky golden crescent' },
  { id: 11, name: 'Sunny-Side Egg', color: '#f8fafc', subColor: '#f59e0b', icon: '🍳', desc: 'White base with vibrant yolk' },
];

// Category 2: Sport (12 items)
export const SPORT_ITEMS = [
  { id: 0, name: 'Basketball', color: '#ea580c', subColor: '#000000', icon: '🏀', desc: 'Orange sphere with black ribs' },
  { id: 1, name: 'Boxing Gloves', color: '#dc2626', subColor: '#ffffff', icon: '🥊', desc: 'Glossy red padded gloves' },
  { id: 2, name: 'F1 Helmet', color: '#2563eb', subColor: '#fbbf24', icon: '🏎️', desc: 'Blue helmet with gold visor' },
  { id: 3, name: 'Skateboard', color: '#22c55e', subColor: '#a855f7', icon: '🛹', desc: 'Neon green deck & trucks' },
  { id: 4, name: 'Tennis Racket', color: '#84cc16', subColor: '#ffffff', icon: '🎾', desc: 'Neon yellow strings & grip' },
  { id: 5, name: 'Kettlebell', color: '#1f2937', subColor: '#9ca3af', icon: '🏋️', desc: 'Cast iron ball with handle' },
  { id: 6, name: 'Soccer Cleat', color: '#e2e8f0', subColor: '#eab308', icon: '⚽', desc: 'White & volt yellow studs' },
  { id: 7, name: 'Trophy Cup', color: '#eab308', subColor: '#fbbf24', icon: '🏆', desc: 'Gilded twin-handled chalice' },
  { id: 8, name: 'American Football', color: '#78350f', subColor: '#ffffff', icon: '🏈', desc: 'Leather oval with white laces' },
  { id: 9, name: 'Shuttlecock', color: '#f8fafc', subColor: '#ef4444', icon: '🏸', desc: 'Feathered conical skirt' },
  { id: 10, name: 'Bowling Pin', color: '#f8fafc', subColor: '#9333ea', icon: '🎳', desc: 'Red-striped bottleneck pin' },
  { id: 11, name: 'Stopwatch', color: '#94a3b8', subColor: '#ef4444', icon: '⏱️', desc: 'Chrome timer & red lanyard' },
];

// Category 3: Technology (12 items)
export const TECH_ITEMS = [
  { id: 0, name: 'VR Headset', color: '#f8fafc', subColor: '#06b6d4', icon: '🥽', desc: 'Matte white & cyan visor' },
  { id: 1, name: 'Game Controller', color: '#8b5cf6', subColor: '#06b6d4', icon: '🎮', desc: 'Ergonomic dual-stick pad' },
  { id: 2, name: 'Quadcopter Drone', color: '#475569', subColor: '#f97316', icon: '🛸', desc: 'X-frame propeller craft' },
  { id: 3, name: 'Retro Floppy Disk', color: '#2563eb', subColor: '#94a3b8', icon: '💾', desc: 'Square 3.5" disk & shutter' },
  { id: 4, name: 'Smartwatch', color: '#f43f5e', subColor: '#22d3ee', icon: '⌚', desc: 'Curved OLED screen & strap' },
  { id: 5, name: 'Over-Ear Headphones', color: '#111827', subColor: '#ef4444', icon: '🎧', desc: 'Padded earcups & headband' },
  { id: 6, name: 'Robot Head', color: '#94a3b8', subColor: '#14b8a6', icon: '🤖', desc: 'Chrome bot with LED eyes' },
  { id: 7, name: 'Microchip CPU', color: '#047857', subColor: '#fbbf24', icon: '🖲️', desc: 'Silicon core with gold pins' },
  { id: 8, name: 'Rocket Thruster', color: '#e2e8f0', subColor: '#ea580c', icon: '🚀', desc: 'Sleek fuselage & flame blast' },
  { id: 9, name: 'Handheld Console', color: '#eab308', subColor: '#1e293b', icon: '🕹️', desc: 'Classic pocket game machine' },
  { id: 10, name: 'Studio Microphone', color: '#94a3b8', subColor: '#d97706', icon: '🎙️', desc: 'Vintage condenser mic' },
  { id: 11, name: 'Battery Cell', color: '#22c55e', subColor: '#000000', icon: '🔋', desc: 'Acid green power indicator' },
];

// Category 4: Colors — Master Tier (12 Two-Tone Gradients / Geometric Patterns)
export const COLOR_ITEMS = [
  { id: 0, name: 'Sunset Fade', colorA: '#FF512F', colorB: '#DD2476', type: 'diagonal', desc: 'Warm Orange to Deep Pink' },
  { id: 1, name: 'Solar Flare', colorA: '#F7971E', colorB: '#FFD200', type: 'radial', desc: 'Amber to Lemon center glow' },
  { id: 2, name: 'Cyber Mint', colorA: '#00B09B', colorB: '#96C93D', type: 'diagonal', desc: 'Teal to Lime Green' },
  { id: 3, name: 'Ocean Abyss', colorA: '#2193B0', colorB: '#6DD5ED', type: 'wave', desc: 'Deep Sea Blue to Ice Cyan' },
  { id: 4, name: 'Ultraviolet', colorA: '#654EA3', colorB: '#EAAFC8', type: 'diagonal', desc: 'Royal Purple to Soft Lavender' },
  { id: 5, name: 'Neon Magma', colorA: '#FF0844', colorB: '#FFB199', type: 'diamond', desc: 'Crimson to Peach diamond' },
  { id: 6, name: 'Arctic Aurora', colorA: '#00F2FE', colorB: '#4FACFE', type: 'horizontal', desc: 'Electric Aqua to Sky Blue' },
  { id: 7, name: 'Bubblegum Pop', colorA: '#FF758C', colorB: '#FF7EB3', type: 'hard-split', desc: 'Coral Pink to Candy Pink' },
  { id: 8, name: 'Toxic Lime', colorA: '#11998E', colorB: '#38EF7D', type: 'radial', desc: 'Emerald to Neon Green' },
  { id: 9, name: 'Cosmic Berry', colorA: '#8E2DE2', colorB: '#4A00E0', type: 'vertical', desc: 'Vibrant Violet to Deep Indigo' },
  { id: 10, name: 'Golden Hour', colorA: '#F2994A', colorB: '#F2C94C', type: 'hard-split', desc: 'Tangerine to Warm Gold' },
  { id: 11, name: 'Prism Monochrome', colorA: '#2C3E50', colorB: '#BDC3C7', type: 'diagonal', desc: 'Charcoal Slate to Silver' },
];

export const CATEGORY_POOLS = [
  ANIMAL_ITEMS,
  FOOD_ITEMS,
  SPORT_ITEMS,
  TECH_ITEMS,
  COLOR_ITEMS,
];

// Helper to create a canvas texture for PlayCanvas
export function createPlayCanvasTexture(device, canvas) {
  const texture = new Texture(device, {
    width: canvas.width,
    height: canvas.height,
    format: PIXELFORMAT_RGBA8,
    minFilter: FILTER_LINEAR_MIPMAP_LINEAR,
    magFilter: FILTER_LINEAR,
    addressU: ADDRESS_CLAMP_TO_EDGE,
    addressV: ADDRESS_CLAMP_TO_EDGE,
    mipmaps: true,
  });
  texture.setSource(canvas);
  return texture;
}

// Generate an icon card canvas texture
export function renderIconTileCanvas(item, categoryId) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background styling based on category
  const bgGradients = [
    ['#064e3b', '#022c22'], // Jungle Green
    ['#7c2d12', '#431407'], // Bento Amber/Dark Terracotta
    ['#1e3a8a', '#0f172a'], // Stadium Navy
    ['#082f49', '#020617'], // Cyber Cyan/Dark
    ['#18181b', '#09090b'], // Gallery Obsidian
  ];

  const [bg1, bg2] = bgGradients[categoryId] || ['#1e293b', '#0f172a'];
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, bg1);
  bgGrad.addColorStop(1, bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Border highlight
  ctx.lineWidth = 10;
  ctx.strokeStyle = item.color || '#38bdf8';
  ctx.strokeRect(5, 5, size - 10, size - 10);

  // Inner subtle glow circle
  const glow = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, 90);
  glow.addColorStop(0, (item.color || '#38bdf8') + '55');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 90, 0, Math.PI * 2);
  ctx.fill();

  // Central icon badge background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 - 12, 64, 0, Math.PI * 2);
  ctx.fill();

  // Large emoji / visual hook
  ctx.font = '76px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.icon, size / 2, size / 2 - 12);

  // Bottom label banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(10, size - 58, size - 20, 44);

  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(item.name, size / 2, size - 36);

  return canvas;
}

// Generate Master Tier Color Swatch
export function renderColorTileCanvas(item) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (item.type === 'diagonal') {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, item.colorA);
    grad.addColorStop(1, item.colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else if (item.type === 'radial') {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size * 0.7);
    grad.addColorStop(0, item.colorB);
    grad.addColorStop(1, item.colorA);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else if (item.type === 'horizontal') {
    const grad = ctx.createLinearGradient(0, size / 2, size, size / 2);
    grad.addColorStop(0, item.colorA);
    grad.addColorStop(1, item.colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else if (item.type === 'vertical') {
    const grad = ctx.createLinearGradient(size / 2, 0, size / 2, size);
    grad.addColorStop(0, item.colorA);
    grad.addColorStop(1, item.colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else if (item.type === 'diamond') {
    // Background colorA
    ctx.fillStyle = item.colorA;
    ctx.fillRect(0, 0, size, size);
    // Concentric diamond colorB
    ctx.fillStyle = item.colorB;
    ctx.beginPath();
    ctx.moveTo(size / 2, 28);
    ctx.lineTo(size - 28, size / 2);
    ctx.lineTo(size / 2, size - 28);
    ctx.lineTo(28, size / 2);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'hard-split') {
    // Diagonal hard split
    ctx.fillStyle = item.colorA;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = item.colorB;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.lineTo(size, 0);
    ctx.closePath();
    ctx.fill();
  } else if (item.type === 'wave') {
    // Vertical wave split
    ctx.fillStyle = item.colorA;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = item.colorB;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.bezierCurveTo(size * 0.75, size * 0.3, size * 0.25, size * 0.7, size / 2, size);
    ctx.lineTo(size, size);
    ctx.lineTo(size, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, item.colorA);
    grad.addColorStop(1, item.colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // Polished glass inner rim highlight
  ctx.lineWidth = 12;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.strokeRect(6, 6, size - 12, size - 12);

  // Title badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(10, size - 56, size - 20, 42);

  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.name, size / 2, size - 35);

  return canvas;
}

// Render Tile Back (Emblem) texture
export function renderTileBackCanvas(skinId, categoryId) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base texture according to category
  const basePalettes = [
    { base: '#2d1b0d', accent: '#854d0e', border: '#b45309' }, // Bamboo / Wood
    { base: '#1c1917', accent: '#b91c1c', border: '#e11d48' }, // Bento lacquer
    { base: '#0f172a', accent: '#1d4ed8', border: '#3b82f6' }, // Stadium turf / court
    { base: '#030712', accent: '#0891b2', border: '#06b6d4' }, // Cyber PCB
    { base: '#18181b', accent: '#db2777', border: '#f43f5e' }, // Frosted glass
  ];

  const palette = basePalettes[categoryId] || basePalettes[0];

  // Base fill
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.7);
  bgGrad.addColorStop(0, palette.base);
  bgGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Outer border with chamfer/metallic rim
  ctx.lineWidth = 14;
  ctx.strokeStyle = palette.border;
  ctx.strokeRect(7, 7, size - 14, size - 14);

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.strokeRect(16, 16, size - 32, size - 32);

  // Decorative corner studs
  ctx.fillStyle = palette.border;
  [
    [22, 22], [size - 22, 22],
    [22, size - 22], [size - 22, size - 22],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Center Emblem Skin
  if (skinId === 0) {
    // 1. Classic Snap Emblem (Iconic Ghost)
    // Snap Yellow circle badge
    const snapGrad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, 60);
    snapGrad.addColorStop(0, '#fffc00');
    snapGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = snapGrad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 60, 0, Math.PI * 2);
    ctx.fill();

    // Snap Ghost outline
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;

    // Ghost body
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 14, 26, Math.PI, 0, false);
    // Arms
    ctx.lineTo(size / 2 + 36, size / 2 + 2);
    ctx.quadraticCurveTo(size / 2 + 32, size / 2 + 16, size / 2 + 22, size / 2 + 14);
    // Skirt wave
    ctx.lineTo(size / 2 + 24, size / 2 + 30);
    ctx.quadraticCurveTo(size / 2 + 12, size / 2 + 24, size / 2, size / 2 + 30);
    ctx.quadraticCurveTo(size / 2 - 12, size / 2 + 24, size / 2 - 24, size / 2 + 30);
    // Left arm
    ctx.lineTo(size / 2 - 22, size / 2 + 14);
    ctx.quadraticCurveTo(size / 2 - 32, size / 2 + 16, size / 2 - 36, size / 2 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (skinId === 1) {
    // 2. Neon Cyber Crest
    // Glowing cyan/magenta diamond crest
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(size / 2, 48);
    ctx.lineTo(size - 48, size / 2);
    ctx.lineTo(size / 2, size - 48);
    ctx.lineTo(48, size / 2);
    ctx.closePath();
    ctx.stroke();

    // Inner magenta geometric star
    ctx.shadowColor = '#ec4899';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size / 2, 70);
    ctx.lineTo(size - 70, size / 2);
    ctx.lineTo(size / 2, size - 70);
    ctx.lineTo(70, size / 2);
    ctx.closePath();
    ctx.stroke();

    // Center lightning core
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.fillText('⚡', size / 2, size / 2);
    ctx.shadowBlur = 0;

  } else if (skinId === 2) {
    // 3. 24K Gold Foil Emblem
    const goldGrad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, 65);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#eab308');
    goldGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 64, 0, Math.PI * 2);
    ctx.fill();

    // Metallic foil ring
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fffbeb';
    ctx.stroke();

    // Crown emblem
    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', size / 2, size / 2 - 2);

  } else if (skinId === 3) {
    // 4. Bitmoji Stamp
    // Circular golden seal
    const sealGrad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, 65);
    sealGrad.addColorStop(0, '#a855f7');
    sealGrad.addColorStop(1, '#6b21a8');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 64, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    // Bitmoji star avatar stamp
    ctx.font = '56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😎', size / 2, size / 2);
  }

  return canvas;
}

// Board base frame textures
export function renderBoardFrameTexture(categoryId) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (categoryId === 0) {
    // Animals: Carved wood with totem border
    ctx.fillStyle = '#27180c';
    ctx.fillRect(0, 0, size, size);

    // Wood rings / grain
    ctx.strokeStyle = '#3e2615';
    ctx.lineWidth = 4;
    for (let i = 20; i < size; i += 32) {
      ctx.strokeRect(i, i, size - i * 2, size - i * 2);
    }

    // Leaf green corner vines
    ctx.fillStyle = '#15803d';
    ctx.font = '40px sans-serif';
    ctx.fillText('🌿', 16, 48);
    ctx.fillText('🌿', size - 56, 48);
    ctx.fillText('🌿', 16, size - 16);
    ctx.fillText('🌿', size - 56, size - 16);

  } else if (categoryId === 1) {
    // Food: Lacquered bento box with divider grid
    ctx.fillStyle = '#1c0d02';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, size - 16, size - 16);

    // Grid divider marks
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    const step = size / 4;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 16);
      ctx.lineTo(i * step, size - 16);
      ctx.moveTo(16, i * step);
      ctx.lineTo(size - 16, i * step);
      ctx.stroke();
    }

  } else if (categoryId === 2) {
    // Sport: Mini stadium turf with painted lines
    ctx.fillStyle = '#14532d'; // Turf green
    ctx.fillRect(0, 0, size, size);

    // White pitch boundary
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, size - 48, size - 48);

    // Center circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Center dividing line
    ctx.beginPath();
    ctx.moveTo(24, size / 2);
    ctx.lineTo(size - 24, size / 2);
    ctx.stroke();

  } else if (categoryId === 3) {
    // Technology: Cyber PCB with glowing neon traces
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, size, size);

    // Glowing cyan circuit traces
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    const step = size / 4;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = i * step + step / 2;
        const y = j * step + step / 2;
        ctx.strokeRect(x - 45, y - 45, 90, 90);
      }
    }
    // Traces
    ctx.beginPath();
    ctx.moveTo(40, 40); ctx.lineTo(size / 2, 40); ctx.lineTo(size / 2, size / 2);
    ctx.moveTo(size - 40, size - 40); ctx.lineTo(size / 2, size - 40); ctx.lineTo(size / 2, size / 2);
    ctx.stroke();

  } else {
    // Colors: Floating frosted glass pedestal
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#312e81');
    grad.addColorStop(1, '#4c1d95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Prism reflections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, size - 32, size - 32);
    ctx.beginPath();
    ctx.moveTo(16, 16); ctx.lineTo(size - 16, size - 16);
    ctx.moveTo(size - 16, 16); ctx.lineTo(16, size - 16);
    ctx.stroke();
  }

  return canvas;
}
