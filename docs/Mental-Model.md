# Project Brief: Flip Board

## 1. Executive Summary
* **Title:** Flip Board
* **Platform:** Snapchat Web Lens (Built in PlayCanvas)
* **Orientation & Input:** 9:16 Vertical Portrait; Single-Thumb Touch Control
* **Core Concept:** A fast-paced, 3D memory-matching game played on a 4x4 grid. Players race against a 60.0-second clock to match 8 pairs of tiles across five distinct thematic categories. Scores are calculated from remaining time, flip efficiency, and combo streaks. The game leverages the Snapchat Web Lens API ecosystem (Bitmoji, Leaderboard, and Persistent Storage) to drive social competition and long-term progression via milestone unlocks.

---

## 2. Core Gameplay Mechanics (Classic Rules)
* **The Grid:** A 4x4 layout of 16 tiles containing **8 matching pairs** randomly selected from a pool of 12 items within the active category (yielding 495 unique board combinations per category).
* **The Countdown:** A strict 60.0-second timer. The clock triggers on the player’s **first tile tap**, allowing them to inspect the 3D board theme before the round begins.
* **The Turn Loop:**
  * Players tap two tiles per turn.
  * **Match:** Both tiles lock face-up with a 3D pop animation and a category-specific particle burst. Consecutive matches increase the **Streak Multiplier**.
  * **Mismatch:** Both tiles shake briefly and flip back face-down after a **0.65-second delay**.
* **Urgency State (Final 10 Seconds):** At `00:10`, the 3D board frame subtly vibrates to the beat of a ticking clock that accelerates from `1.0x` to `1.5x` speed as time runs out.
* **Win/Loss Conditions:**
  * **Win:** Matching all 8 pairs before `00:00` stops the clock, calculates the final score, updates persistent milestones, and submits the score to the Snapchat Leaderboard.
  * **Loss:** Reaching `00:00` triggers a "Time's Up" state with zero points awarded and an instant retry button.

---

## 3. Snapchat Web Lens API Integrations
* **Bitmoji API (HUD & Social Presence):**
  * **Live Spectator HUD:** The player’s 2D/3D Bitmoji sits in the top bar next to the timer, reacting dynamically to gameplay (cheering on match streaks, sweating when the clock drops under 10 seconds, celebrating on victory, or looking defeated on timeout).
  * **Leaderboard Avatars:** Displays friend Bitmojis alongside their high scores on the post-game leaderboard.
* **Persistent Storage API (Progression & Unlocks):**
  * Persists a lightweight JSON schema per user to track career stats and unlock categories and cosmetic tile skins.
* **Leaderboard API (Competitive Loop):**
  * Automatically submits winning scores at the end of a round.
  * Defaults to the **Friends Leaderboard** post-game to fuel social competition, with a secondary toggle for Global rankings.

### Storage API Data Schema
```json
{
  "highScore": 0,
  "cumulativeScore": 0,
  "totalGamesWon": 0,
  "fastestClearTimeLeft": 0.0,
  "bestFlipCount": 999,
  "categoriesCleared": [false, false, false, false, false],
  "equippedSkin": 0
}
```

---

## 4. Scoring Formula & Leaderboard Architecture
To prevent ties on Snapchat friend leaderboards and reward careful memory over random button-mashing, the scoring system combines tenth-of-a-second speed with flip efficiency:

$$\text{Final Score} = (\text{Seconds Left} \times 100) + \max(0, 4000 - (\text{Total Flips} \times 100)) + \text{Streak Bonus}$$

* **Time Left Bonus:** Calculated to 0.1s precision (e.g., $32.4\text{s remaining} = 3,240\text{ pts}$).
* **Flip Efficiency Bonus:** Minimum possible flips is 16 (8 turns), awarding $2,400\text{ pts}$. A strong 24-flip (12-turn) game awards $1,600\text{ pts}$. Spamming 40+ flips reduces the efficiency bonus to $0\text{ pts}$.
* **Streak Bonus:** $+250\text{ pts}$ for each consecutive match made without an error.

---

## 5. Progression System & Milestone Unlocks

### A. Category Unlock Tiers
Players start with 3 core categories unlocked and unlock the final 2 through skill and persistence:

| Category | Availability | Unlock Milestone | Gameplay Feel |
| :--- | :--- | :--- | :--- |
| **1. Animals** | Unlocked at Start | Default | High-contrast, friendly icons. |
| **2. Food** | Unlocked at Start | Default | Bright, recognizable silhouettes. |
| **3. Sport** | Unlocked at Start | Default | Distinct equipment and gear shapes. |
| **4. Technology** | **Locked** | Clear any board in **under 35 seconds** (>25.0s left) | Sleeker, tighter hardware silhouettes. |
| **5. Colors** | **Locked (Master Tier)** | Reach **20,000+ Cumulative Score** | **Hard Mode:** Two-tone gradients that force visual-spatial memory over verbal naming. |

### B. Cosmetic Tile Backs (Center Emblem Skins)
While the 3D board frame and tile material match the active category, players can customize the **center emblem on the face-down side of the tiles** by hitting career milestones:
1. **Classic Snap Emblem:** Default starting tile back.
2. **Neon Cyber Crest:** Unlocked after **5 total wins**.
3. **24K Gold Foil Emblem:** Unlocked by clearing any board in **20 flips or fewer** (10 turns).
4. **Bitmoji Stamp:** Unlocked after winning at least once in all 5 categories (stamps the user's Bitmoji emblem on the back of every tile).

---

## 6. Category-Specific 3D Boards & Sound Design
Each category acts as a cohesive audiovisual environment in PlayCanvas. Audio relies on short one-shot SFX (`0.2s–0.5s`) with dynamic pitch-shifting (`+0.1` pitch per consecutive match on a streak, resetting to `1.0` on a miss).

| Category | 3D Board & Tile Aesthetic | Match VFX & Lighting | Category Sound Bank (SFX) |
| :--- | :--- | :--- | :--- |
| **Animals** *(Jungle)* | Carved wooden totem frame with corner vines; bamboo-textured tiles with rounded corners. | Green leaf burst & golden fireflies; warm canopy sunlight. | **Flip:** Hollow bamboo clack.<br>**Match:** Upbeat Marimba chord.<br>**Miss:** Low wooden frog croak.<br>**Win:** Tropical bird call & drum flourish. |
| **Food** *(Bento / Diner)* | Lacquered Bento box (or retro diner tray) with slot dividers; glossy ceramic tiles. | Cartoon steam puffs & confetti sprinkles; warm kitchen glow. | **Flip:** Crisp ceramic clink.<br>**Match:** Diner Bell (*Ding!*) + sizzle.<br>**Miss:** Hollow pot lid rattle.<br>**Win:** Kitchen timer ring & soda pop fizz. |
| **Sport** *(Stadium)* | Mini stadium turf/court with painted lines & 4 corner floodlights; basketball-leather tiles. | Stadium flashbulbs & chalk dust burst; crisp white arena light. | **Flip:** Basketball dribble thump.<br>**Match:** Clean net swish + crowd swell.<br>**Miss:** Short referee whistle chirp.<br>**Win:** Buzzer-beater horn & applause. |
| **Technology** *(Cyber PCB)* | Matte-black circuit board with glowing traces between slots; brushed aluminum chamfered tiles. | Digital pixel sparks & circuit pulse; cyberpunk neon lighting. | **Flip:** Mechanical key switch click.<br>**Match:** 8-bit synth power-up arpeggio.<br>**Miss:** Low synth buzz.<br>**Win:** Sci-fi power-core charge & chime. |
| **Colors** *(Art Gallery)* | Floating frosted-glass pedestal over shifting pastel backdrop; glossy acrylic glass tiles. | Liquid paint splatter & prism refraction; studio softbox light. | **Flip:** Soft water-drop / glass tap.<br>**Match:** Crystal glass harp shimmer.<br>**Miss:** Muted brush sweep.<br>**Win:** Lush blooming ambient chord. |

---

## 7. Screen Layout & UX Flow (9:16 Vertical)

1. **Pre-Game Carousel (Overlay on 3D Board):**
   * Swipe left/right to preview the 5 categories (with live 3D board swaps in the background).
   * Locked categories display their milestone requirement progress bar.
   * Bottom drawer button to swap unlocked Tile Back Emblems.
2. **In-Game HUD:**
   * **Top Zone (20%):** Player Bitmoji on the left, bold `60.0` timer in the center, `Flips: 0` counter on the right.
   * **Center Zone (65%):** The 4x4 3D PlayCanvas board positioned in the ergonomic thumb zone.
   * **Bottom Zone (15%):** Active Streak multiplier badge and a quick **"Restart"** button for speedrunners chasing a Personal Best.
3. **Post-Game "Flex Card" & Leaderboard:**
   * Designed like a clean trading card or arcade receipt for easy Snapchat Story/Chat sharing.
   * Displays Final Score breakdown (Time + Efficiency + Streak), Bitmoji victory pose, and any newly unlocked Category or Tile Emblem toasts.
   * Opens the **Snapchat Friends Leaderboard** drawer so players can immediately view and share their rank.

---

## 8. Category Item Pools (12 Items Per Category)
Each category features 12 distinct items designed for high silhouette contrast and color separation. Each round randomly selects 8 of the 12 items to populate the 4x4 grid.

### 8.1 Animals (Safari / Jungle Theme)
| # | Item | Dominant Color | Silhouette / Visual Hook |
| :--- | :--- | :--- | :--- |
| 1 | **Lion** | Golden Yellow / Orange | Big circular spiky mane |
| 2 | **Giant Panda** | Black & White | Round head with high-contrast black eye patches |
| 3 | **Octopus** | Vibrant Purple / Magenta | Bulbous head with curling tentacles at the base |
| 4 | **Red Fox** | Bright Orange & White | Sharp triangular face and pointed ears |
| 5 | **Toucan** | Black & Rainbow Beak | Oversized, colorful curved beak profile |
| 6 | **Tree Frog** | Neon Green & Red Eyes | Wide flat head with big popping red eyes |
| 7 | **Elephant** | Cool Slate Grey | Wide floppy ears and central curved trunk |
| 8 | **Flamingo** | Hot Pink | Slender S-curved neck and black-tipped beak |
| 9 | **Owl** | Warm Brown & Amber | Large glowing yellow circular eyes and ear tufts |
| 10 | **Chameleon** | Teal / Turquoise | Curled spiral tail and conical eyes |
| 11 | **Koala** | Silver Grey | Big fluffy round ears and prominent black oval nose |
| 12 | **Bumblebee** | Yellow & Black Stripes | Translucent wings and bold horizontal stripes |

### 8.2 Food (Retro Diner / Bento Theme)
| # | Item | Dominant Color | Silhouette / Visual Hook |
| :--- | :--- | :--- | :--- |
| 1 | **Cheeseburger** | Golden Brown & Green | Stacked horizontal layers with melted cheese corners |
| 2 | **Salmon Nigiri / Sushi** | Bright Orange & White | Rectangular rice block topped with striped orange fish |
| 3 | **Frosted Donut** | Pink & Rainbow Sprinkles | Classic ring shape with a hole in the center |
| 4 | **Taco** | Yellow Shell & Red/Green | Half-moon curved shell packed with toppings |
| 5 | **Pepperoni Pizza Slice** | Red, Yellow & Tan | Sharp triangle with circular pepperoni spots |
| 6 | **Ramen Bowl** | Red Bowl & White/Yellow | Bowl silhouette with chopsticks sticking out at an angle |
| 7 | **Avocado Half** | Two-Tone Green & Brown | Pear-shaped green body with a glossy round central pit |
| 8 | **French Fries** | Red Carton & Gold | Vertical golden sticks fanning out of a red sleeve |
| 9 | **Watermelon Wedge** | Crimson Red & Green Rind | Crescent/triangle slice with black teardrop seeds |
| 10 | **Soft-Serve Ice Cream** | Pastel Blue / White Swirl | Tall vertical swirl sitting in a waffle cone |
| 11 | **Croissant** | Warm Buttery Gold | Distinct crescent-horn shape with layered segments |
| 12 | **Sunny-Side Egg** | Glossy White & Bright Yellow | Organic wavy white base with a vibrant orange-yellow yolk |

### 8.3 Sport (Stadium / Court Theme)
| # | Item | Dominant Color | Silhouette / Visual Hook |
| :--- | :--- | :--- | :--- |
| 1 | **Basketball** | Bright Orange | Round sphere with heavy black curved rib lines |
| 2 | **Boxing Gloves** | Glossy Crimson Red | Crossed pair of padded gloves with white cuffs |
| 3 | **F1 Helmet** | Electric Blue & Gold Visor | Aerodynamic helmet profile with a reflective tinted visor |
| 4 | **Skateboard** | Neon Green Deck | Angled deck showing colorful wheels/trucks underneath |
| 5 | **Tennis Racket** | Neon Yellow & White | Oval stringed head with an angled grip handle |
| 6 | **Kettlebell** | Matte Black & Silver | Cannonball base with a thick top loop handle |
| 7 | **Soccer Cleat (Boot)** | White & Volt Yellow | Dynamic side-profile shoe with studs on the sole |
| 8 | **Trophy Cup** | Metallic Gold | Twin-handled chalice on a dark pedestal |
| 9 | **American Football** | Rich Leather Brown | Pointed oval with white lacing |
| 10 | **Shuttlecock** | Crisp White & Red Band | Conical feathered skirt with a rounded cork tip |
| 11 | **Bowling Pin & Ball** | White/Red Stripes & Purple | Tall bottleneck pin paired with a three-holed ball |
| 12 | **Stopwatch / Whistle** | Chrome Silver & Red Lanyard | Classic coach gear silhouette with a bright cord |

### 8.4 Technology (Cyber Motherboard Theme)
| # | Item | Dominant Color | Silhouette / Visual Hook |
| :--- | :--- | :--- | :--- |
| 1 | **VR Headset** | Matte White & Cyan Glow | Curved visor goggle with head straps |
| 2 | **Game Controller** | Neon Purple / Dual-tone | Classic two-grip ergonomic gamepad with colorful buttons |
| 3 | **Quadcopter Drone** | Gunmetal Grey & Orange | X-frame body with four corner propeller rings |
| 4 | **Retro Floppy Disk** | Electric Blue & Silver | Square badge with the iconic metal shutter |
| 5 | **Smartwatch** | Rose Gold & Neon UI | Rounded square face with top/bottom wrist straps |
| 6 | **Over-Ear Headphones** | Matte Black & Red Accents | Arching headband connecting two padded earcups |
| 7 | **Robot Head (Bot)** | Chrome Silver & Teal Eyes | Boxy metallic head with glowing LED eyes and top antenna |
| 8 | **Microchip / CPU** | Emerald Green & Gold | Square processor core with gold pins radiating outward |
| 9 | **Rocket / Thruster** | White, Red & Flame Orange | Sleek vertical fuselage with glowing exhaust plume |
| 10 | **Handheld Console** | Retro Yellow | Vertical rectangle with D-pad and A/B buttons |
| 11 | **Studio Microphone** | Silver Mesh & Brass | Vintage broadcast mic on a desk stand |
| 12 | **Battery Cell** | Acid Green & Black | Cylindrical power cell with a glowing charge indicator bar |

### 8.5 Colors — Master Tier (Minimalist Art Gallery Theme)
*Note: Uses two-tone gradients and geometric splits so players must rely on visual-spatial memory rather than simple color naming.*

| # | Swatch Name | Hex / Palette Breakdown | Pattern Style on Tile |
| :--- | :--- | :--- | :--- |
| 1 | **Sunset Fade** | `#FF512F` to `#DD2476` | Smooth diagonal gradient (Warm Orange to Deep Pink) |
| 2 | **Solar Flare** | `#F7971E` to `#FFD200` | Radial center glow (Deep Amber to Bright Lemon) |
| 3 | **Cyber Mint** | `#00B09B` to `#96C93D` | Smooth diagonal gradient (Teal to Lime Green) |
| 4 | **Ocean Abyss** | `#2193B0` to `#6DD5ED` | Vertical wave split (Deep Sea Blue to Ice Cyan) |
| 5 | **Ultraviolet** | `#654EA3` to `#EAAFC8` | Smooth diagonal gradient (Royal Purple to Soft Lavender) |
| 6 | **Neon Magma** | `#FF0844` to `#FFB199` | Concentric diamond gradient (Crimson to Peach) |
| 7 | **Arctic Aurora** | `#00F2FE` to `#4FACFE` | Horizontal split glow (Electric Aqua to Sky Blue) |
| 8 | **Bubblegum Pop** | `#FF758C` to `#FF7EB3` | Diagonal hard split (Coral Pink to Candy Pink) |
| 9 | **Toxic Lime** | `#11998E` to `#38EF7D` | Radial center glow (Forest Emerald to Neon Green) |
| 10 | **Cosmic Berry** | `#8E2DE2` to `#4A00E0` | Vertical gradient (Vibrant Violet to Deep Indigo) |
| 11 | **Golden Hour** | `#F2994A` to `#F2C94C` | Diagonal hard split (Tangerine to Warm Gold) |
| 12 | **Prism Monochrome** | `#2C3E50` to `#BDC3C7` | Metallic sheen gradient (Charcoal Slate to Silver) |

---

## 9. Asset Pipeline & Optimization Notes (PlayCanvas)
* **Unified Texture Atlas:** Pack all 48 icons (12 icons $\times$ 4 categories) into a single **2048x2048 Texture Atlas (Sprite Sheet)** with `256x256` slots per icon. This allows the entire icon library to load in a single HTTP request.
* **Procedural Color Swatches:** Generate the 12 Master Tier Color swatches via a lightweight PlayCanvas gradient shader or tiny `64x64` ramps to consume near-zero memory.
* **Audio Footprint:** Keep all 20 category one-shot SFX mono `.ogg` or `.mp3` files under `25KB` each (total audio budget `<500KB`) to guarantee instant Web Lens startup.