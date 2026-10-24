// PlayCanvas 3D Scene Engine for Flip Board
// Adheres strictly to PlayCanvas conventions:
// - Direct Engine API with named imports
// - ESM class/modules
// - 4x4 Grid of 3D tiles with physical flip lift, mismatch shake, and match pop bounce
// - Dynamic category board frames, lighting, and 3D particle bursts
// - Precise raycasting for touch & mouse input

import {
  Application,
  Color,
  Entity,
  StandardMaterial,
  Vec2,
  Vec3,
  Ray,
  Mouse,
  TouchDevice,
  ElementInput,
  TONEMAP_ACES2,
  FILLMODE_NONE,
  RESOLUTION_AUTO,
  CULLFACE_NONE,
} from 'playcanvas';

import {
  createPlayCanvasTexture,
  renderIconTileCanvas,
  renderColorTileCanvas,
  renderTileBackCanvas,
  renderBoardFrameTexture,
  CATEGORY_POOLS,
} from './textures.js';

import { storage, CATEGORIES } from './storage.js';

export class Board3D {
  constructor(canvasElement, onTileTapped) {
    this.canvas = canvasElement;
    this.onTileTapped = onTileTapped;

    this.app = null;
    this.camera = null;
    this.dirLight = null;
    this.boardRoot = null;
    this.boardFrame = null;
    this.cornerAccents = [];
    this.tiles = []; // 16 tile controllers

    this.particles = [];
    this.isUrgent = false;
    this.vibrateIntensity = 0;

    this.currentCategory = 0;
    this.equippedSkin = 0;

    this.init();
  }

  init() {
    // 1. Initialize PlayCanvas Application with input devices
    this.app = new Application(this.canvas, {
      mouse: new Mouse(this.canvas),
      touch: new TouchDevice(this.canvas),
      elementInput: new ElementInput(this.canvas),
    });

    this.app.setCanvasFillMode(FILLMODE_NONE);
    this.app.setCanvasResolution(RESOLUTION_AUTO);

    this.app.start();

    // Configure graphics device pixel ratio
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.app.graphicsDevice.maxPixelRatio = dpr;
    this.app.resizeCanvas();

    // 2. Scene Rendering & Tonemapping
    this.app.scene.toneMapping = TONEMAP_ACES2;
    this.app.scene.exposure = 1.15;

    // 3. Setup Camera
    const cameraEntity = new Entity('MainCamera');
    cameraEntity.addComponent('camera', {
      clearColor: new Color(0.06, 0.08, 0.12),
      fov: 52,
      nearClip: 0.1,
      farClip: 100,
    });
    // Position camera for 9:16 portrait view
    cameraEntity.setPosition(0, 6.8, 4.4);
    cameraEntity.setEulerAngles(-57, 0, 0);
    this.app.root.addChild(cameraEntity);
    this.camera = cameraEntity;

    // 4. Key Directional Light
    const lightEntity = new Entity('KeyLight');
    lightEntity.addComponent('light', {
      type: 'directional',
      color: new Color(1.0, 0.98, 0.95),
      intensity: 1.4,
      castShadows: true,
      shadowDistance: 16,
      shadowResolution: 1024,
      shadowBias: 0.05,
      normalOffsetBias: 0.05,
    });
    lightEntity.setEulerAngles(55, 35, 0);
    this.app.root.addChild(lightEntity);
    this.dirLight = lightEntity;

    // Board Root container
    this.boardRoot = new Entity('BoardRoot');
    this.app.root.addChild(this.boardRoot);

    // Setup input listeners for raycasting
    this.setupInput();

    // Update loop
    this.app.on('update', (dt) => this.update(dt));

    // Window resize handler
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  onResize() {
    if (!this.app) return;
    const container = this.canvas.parentElement || document.body;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.app.resizeCanvas(width, height);

    // Dynamically adjust camera height & distance for 9:16 portrait viewport
    const aspect = width / height;

    if (aspect < 0.6) {
      // Narrow mobile portrait - center board in ergonomic thumb zone
      this.camera.setPosition(0, 6.8, 3.8);
      this.camera.setEulerAngles(-59, 0, 0);
    } else {
      // Desktop / tablet preview
      this.camera.setPosition(0, 6.2, 3.5);
      this.camera.setEulerAngles(-58, 0, 0);
    }
  }

  setupInput() {
    const handlePointer = (screenX, screenY) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = screenX - rect.left;
      const y = screenY - rect.top;

      const from = new Vec3();
      const to = new Vec3();
      const cam = this.camera.camera;

      // Unproject ray from screen coordinates
      cam.screenToWorld(x, y, 0.1, from);
      cam.screenToWorld(x, y, 50.0, to);

      const dir = new Vec3().sub2(to, from).normalize();
      const ray = new Ray(from, dir);

      let closestTile = null;
      let minDistance = Infinity;

      // 1. First try mesh AABB raycast intersection
      for (let i = 0; i < this.tiles.length; i++) {
        const tile = this.tiles[i];
        if (!tile || !tile.bodyEntity || !tile.bodyEntity.render) continue;

        const aabb = tile.bodyEntity.render.meshInstances[0]?.aabb;
        if (!aabb) continue;

        const hitPoint = new Vec3();
        if (aabb.intersectsRay(ray, hitPoint)) {
          const dist = from.distance(hitPoint);
          if (dist < minDistance) {
            minDistance = dist;
            closestTile = tile;
          }
        }
      }

      // 2. Fallback: Mathematical plane intersection at y = 0
      if (!closestTile && dir.y !== 0) {
        const t = -from.y / dir.y;
        if (t > 0) {
          const hitX = from.x + t * dir.x;
          const hitZ = from.z + t * dir.z;

          for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            if (!tile) continue;
            const halfW = 0.52; // Half tile width + small padding
            if (
              hitX >= tile.basePos.x - halfW &&
              hitX <= tile.basePos.x + halfW &&
              hitZ >= tile.basePos.z - halfW &&
              hitZ <= tile.basePos.z + halfW
            ) {
              closestTile = tile;
              break;
            }
          }
        }
      }

      if (closestTile && this.onTileTapped) {
        this.onTileTapped(closestTile.index);
      }
    };

    // Mouse click
    this.canvas.addEventListener('pointerdown', (e) => {
      handlePointer(e.clientX, e.clientY);
    });
  }

  // Build / Rebuild 3D board for a category
  setupCategory(categoryId, equippedSkin, tileItems) {
    this.currentCategory = categoryId;
    this.equippedSkin = equippedSkin;

    // Set ambient light and background color
    const catConfig = CATEGORIES[categoryId] || CATEGORIES[0];
    this.app.scene.ambientLight = new Color().fromString(catConfig.accentColor).mulScalar(0.22);
    this.camera.camera.clearColor = new Color().fromString(catConfig.boardBg);

    // Clear existing board entities
    while (this.boardRoot.children.length > 0) {
      const child = this.boardRoot.children[0];
      this.boardRoot.removeChild(child);
      child.destroy();
    }
    this.tiles = [];
    this.cornerAccents = [];

    // 1. Create 3D Board Base Frame
    const frameEntity = new Entity('BoardBaseFrame');
    frameEntity.addComponent('render', {
      type: 'box',
      castShadows: false,
      receiveShadows: true,
    });
    frameEntity.setLocalScale(4.8, 0.28, 4.8);
    frameEntity.setLocalPosition(0, -0.2, 0);

    // Material with custom board texture
    const frameMat = new StandardMaterial();
    frameMat.useMetalness = true;
    frameMat.metalness = 0.2;
    frameMat.roughness = 0.5;
    const frameCanvas = renderBoardFrameTexture(categoryId);
    frameMat.diffuseMap = createPlayCanvasTexture(this.app.graphicsDevice, frameCanvas);
    frameMat.update();
    frameEntity.render.material = frameMat;
    this.boardRoot.addChild(frameEntity);
    this.boardFrame = frameEntity;

    // 2. Corner Aesthetic Accents
    this.createCornerAccents(categoryId);

    // 3. Create 4x4 Tiles Grid (16 tiles)
    const spacing = 1.05;
    const startOffset = -1.5 * spacing;

    for (let index = 0; index < 16; index++) {
      const row = Math.floor(index / 4);
      const col = index % 4;

      const x = startOffset + col * spacing;
      const z = startOffset + row * spacing;

      const item = tileItems ? tileItems[index] : null;
      const tileCtrl = this.createTile(index, x, z, item, categoryId, equippedSkin);
      this.tiles.push(tileCtrl);
    }
  }

  createCornerAccents(categoryId) {
    const positions = [
      [-2.3, 0.1, -2.3],
      [2.3, 0.1, -2.3],
      [-2.3, 0.1, 2.3],
      [2.3, 0.1, 2.3],
    ];

    positions.forEach(([x, y, z], i) => {
      const accent = new Entity(`CornerAccent_${i}`);
      accent.addComponent('render', { type: 'cylinder' });
      accent.setLocalScale(0.24, 0.45, 0.24);
      accent.setLocalPosition(x, y, z);

      const mat = new StandardMaterial();
      mat.useMetalness = true;
      if (categoryId === 0) {
        // Bamboo post
        mat.diffuse = new Color(0.35, 0.22, 0.12);
        mat.metalness = 0.1;
      } else if (categoryId === 1) {
        // Lacquer post
        mat.diffuse = new Color(0.8, 0.15, 0.15);
        mat.metalness = 0.3;
      } else if (categoryId === 2) {
        // Stadium floodlight post
        mat.diffuse = new Color(0.9, 0.9, 0.95);
        mat.emissive = new Color(0.4, 0.4, 0.5);
      } else if (categoryId === 3) {
        // Cyber glowing diode
        mat.diffuse = new Color(0.05, 0.1, 0.15);
        mat.emissive = new Color(0.0, 0.8, 0.9);
      } else {
        // Gallery frosted pillar
        mat.diffuse = new Color(0.7, 0.4, 0.8);
        mat.emissive = new Color(0.3, 0.1, 0.4);
      }
      mat.update();
      accent.render.material = mat;

      this.boardRoot.addChild(accent);
      this.cornerAccents.push(accent);
    });
  }

  createTile(index, x, z, item, categoryId, skinId) {
    const tileRoot = new Entity(`Tile_${index}`);
    tileRoot.setPosition(x, 0, z);

    // 1. Body Box (tactile slab)
    const bodyEntity = new Entity(`TileBody_${index}`);
    bodyEntity.addComponent('render', {
      type: 'box',
      castShadows: true,
      receiveShadows: true,
    });
    bodyEntity.setLocalScale(0.92, 0.14, 0.92);
    bodyEntity.setLocalPosition(0, 0, 0);

    const bodyMat = new StandardMaterial();
    bodyMat.useMetalness = true;
    if (categoryId === 0) {
      bodyMat.diffuse = new Color(0.38, 0.24, 0.14);
      bodyMat.roughness = 0.7;
    } else if (categoryId === 1) {
      bodyMat.diffuse = new Color(0.12, 0.12, 0.14);
      bodyMat.roughness = 0.3;
    } else if (categoryId === 2) {
      bodyMat.diffuse = new Color(0.2, 0.22, 0.25);
      bodyMat.roughness = 0.5;
    } else if (categoryId === 3) {
      bodyMat.diffuse = new Color(0.08, 0.09, 0.12);
      bodyMat.metalness = 0.7;
      bodyMat.roughness = 0.2;
    } else {
      bodyMat.diffuse = new Color(0.25, 0.15, 0.3);
      bodyMat.metalness = 0.4;
      bodyMat.roughness = 0.2;
    }
    bodyMat.update();
    bodyEntity.render.material = bodyMat;
    tileRoot.addChild(bodyEntity);

    // 2. Back Face (Emblem side - visible when face down)
    const backEntity = new Entity(`TileBack_${index}`);
    backEntity.addComponent('render', {
      type: 'plane',
      castShadows: false,
      receiveShadows: true,
    });
    backEntity.setLocalScale(0.88, 1, 0.88);
    backEntity.setLocalPosition(0, 0.071, 0);
    backEntity.setLocalEulerAngles(0, 0, 0);

    const backMat = new StandardMaterial();
    backMat.useMetalness = true;
    backMat.metalness = 0.3;
    backMat.roughness = 0.4;
    backMat.cull = CULLFACE_NONE;
    const backCanvas = renderTileBackCanvas(skinId, categoryId);
    backMat.diffuseMap = createPlayCanvasTexture(this.app.graphicsDevice, backCanvas);
    backMat.update();
    backEntity.render.material = backMat;
    tileRoot.addChild(backEntity);

    // 3. Front Face (Item side - visible when face up)
    const frontEntity = new Entity(`TileFront_${index}`);
    frontEntity.addComponent('render', {
      type: 'plane',
      castShadows: false,
      receiveShadows: true,
    });
    frontEntity.setLocalScale(0.88, 1, 0.88);
    frontEntity.setLocalPosition(0, -0.071, 0);
    // Rotating 180° on X means when tileRoot flips 180° on X, the face is perfectly upright (0,0,0) in world space!
    frontEntity.setLocalEulerAngles(180, 0, 0);

    const frontMat = new StandardMaterial();
    frontMat.useMetalness = true;
    frontMat.metalness = 0.1;
    frontMat.roughness = 0.4;
    frontMat.cull = CULLFACE_NONE;
    if (item) {
      const frontCanvas = categoryId === 4
        ? renderColorTileCanvas(item)
        : renderIconTileCanvas(item, categoryId);
      const tex = createPlayCanvasTexture(this.app.graphicsDevice, frontCanvas);
      frontMat.diffuseMap = tex;
      frontMat.emissiveMap = tex;
      frontMat.emissive = new Color(0.25, 0.25, 0.25);
      frontMat.emissiveTint = true;
    }
    frontMat.update();
    frontEntity.render.material = frontMat;
    tileRoot.addChild(frontEntity);

    this.boardRoot.addChild(tileRoot);

    // Controller object for animations
    return {
      index,
      item,
      basePos: new Vec3(x, 0, z),
      rootEntity: tileRoot,
      bodyEntity,
      backEntity,
      frontEntity,
      state: 'faceDown', // 'faceDown', 'flippingUp', 'faceUp', 'flippingDown', 'matched'
      flipProgress: 0, // 0 to 1
      isMatched: false,
      shakeTimer: 0,
      popScale: 1.0,
      targetRotationX: 0,
      currentRotationX: 0,
    };
  }

  // Flip tile face up with physical 3D lift
  flipUp(tileIndex) {
    const tile = this.tiles[tileIndex];
    if (!tile || tile.state !== 'faceDown') return;
    tile.state = 'flippingUp';
    tile.targetRotationX = 180;
  }

  // Flip tile face down
  flipDown(tileIndex) {
    const tile = this.tiles[tileIndex];
    if (!tile || tile.isMatched) return;
    tile.state = 'flippingDown';
    tile.targetRotationX = 0;
  }

  // Lock matched tiles with 3D pop bounce and spawn particle bursts
  lockMatch(tileIndexA, tileIndexB) {
    [tileIndexA, tileIndexB].forEach(idx => {
      const tile = this.tiles[idx];
      if (!tile) return;
      tile.isMatched = true;
      tile.state = 'matched';
      tile.currentRotationX = 180;
      tile.rootEntity.setLocalEulerAngles(180, 0, 0);
      tile.popScale = 1.22; // Pop scale bounce

      // Spawn particle burst at tile position
      this.spawnParticleBurst(tile.basePos, this.currentCategory);
    });
  }

  // Trigger brief mismatch shake
  shakeMismatch(tileIndexA, tileIndexB) {
    [tileIndexA, tileIndexB].forEach(idx => {
      const tile = this.tiles[idx];
      if (!tile) return;
      tile.shakeTimer = 0.35;
    });
  }

  // Trigger urgency vibration pulse (called every tick in final 10s)
  pulseUrgencyVibration() {
    this.vibrateIntensity = 0.045;
  }

  setUrgencyState(active) {
    this.isUrgent = active;
  }

  // Spawn dynamic 3D particle bursts
  spawnParticleBurst(worldPos, categoryId) {
    const count = 24;
    const catConfig = CATEGORIES[categoryId] || CATEGORIES[0];
    const baseColor = new Color().fromString(catConfig.accentColor);

    for (let i = 0; i < count; i++) {
      const p = new Entity(`Particle_${Date.now()}_${i}`);
      p.addComponent('render', { type: 'box' });
      const size = 0.08 + Math.random() * 0.08;
      p.setLocalScale(size, size, size);
      p.setPosition(
        worldPos.x + (Math.random() - 0.5) * 0.5,
        worldPos.y + 0.3,
        worldPos.z + (Math.random() - 0.5) * 0.5
      );

      const mat = new StandardMaterial();
      mat.useMetalness = true;
      mat.diffuse = new Color(
        Math.min(1, baseColor.r + (Math.random() - 0.5) * 0.3),
        Math.min(1, baseColor.g + (Math.random() - 0.5) * 0.3),
        Math.min(1, baseColor.b + (Math.random() - 0.5) * 0.3)
      );
      mat.emissive = mat.diffuse;
      mat.update();
      p.render.material = mat;

      this.app.root.addChild(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.2;
      this.particles.push({
        entity: p,
        vx: Math.cos(angle) * speed,
        vy: 3.0 + Math.random() * 2.5,
        vz: Math.sin(angle) * speed,
        life: 0.85,
        maxLife: 0.85,
        rotSpeed: (Math.random() - 0.5) * 400,
      });
    }
  }

  update(dt) {
    // 1. Update Tile Animations
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      if (!tile) continue;

      // Flip rotation
      if (tile.state === 'flippingUp' || tile.state === 'flippingDown') {
        const speed = 720; // deg per sec
        if (tile.state === 'flippingUp') {
          tile.currentRotationX = Math.min(180, tile.currentRotationX + speed * dt);
          if (tile.currentRotationX >= 180) {
            tile.currentRotationX = 180;
            tile.state = 'faceUp';
          }
        } else if (tile.state === 'flippingDown') {
          tile.currentRotationX = Math.max(0, tile.currentRotationX - speed * dt);
          if (tile.currentRotationX <= 0) {
            tile.currentRotationX = 0;
            tile.state = 'faceDown';
          }
        }

        // Tactile vertical lift arch: peaks at 90 degrees
        const flipProgress = tile.currentRotationX / 180;
        const liftY = Math.sin(flipProgress * Math.PI) * 0.32;
        tile.rootEntity.setPosition(tile.basePos.x, tile.basePos.y + liftY, tile.basePos.z);
        tile.rootEntity.setLocalEulerAngles(tile.currentRotationX, 0, 0);
      }

      // Pop scale decay
      if (tile.popScale > 1.0) {
        tile.popScale = Math.max(1.0, tile.popScale - dt * 1.5);
        tile.rootEntity.setLocalScale(tile.popScale, tile.popScale, tile.popScale);
      }

      // Mismatch shake
      if (tile.shakeTimer > 0) {
        tile.shakeTimer = Math.max(0, tile.shakeTimer - dt);
        const shakeX = Math.sin(tile.shakeTimer * 50) * 0.08 * (tile.shakeTimer / 0.35);
        tile.rootEntity.setPosition(tile.basePos.x + shakeX, tile.basePos.y, tile.basePos.z);
      }
    }

    // 2. Update 3D Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.app.root.removeChild(p.entity);
        p.entity.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      p.vy -= 9.8 * dt; // gravity
      const pos = p.entity.getPosition();
      p.entity.setPosition(pos.x + p.vx * dt, pos.y + p.vy * dt, pos.z + p.vz * dt);
      p.entity.rotate(p.rotSpeed * dt, p.rotSpeed * dt, 0);

      const scale = (p.life / p.maxLife) * 0.12;
      p.entity.setLocalScale(scale, scale, scale);
    }

    // 3. Urgency Board Frame Vibration
    if (this.vibrateIntensity > 0) {
      this.vibrateIntensity = Math.max(0, this.vibrateIntensity - dt * 0.4);
      const vibX = (Math.random() - 0.5) * this.vibrateIntensity;
      const vibZ = (Math.random() - 0.5) * this.vibrateIntensity;
      if (this.boardFrame) {
        this.boardFrame.setLocalPosition(vibX, -0.2, vibZ);
      }
    } else if (this.boardFrame) {
      this.boardFrame.setLocalPosition(0, -0.2, 0);
    }
  }

  destroy() {
    if (this.app) {
      this.app.destroy();
      this.app = null;
    }
  }
}
