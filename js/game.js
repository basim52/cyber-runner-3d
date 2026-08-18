/**
 * Cyber Runner 3D - Vibrant Living Nature Game Engine
 */
class Game {
  constructor() {
    this.state = 'START';
    
    // Core Game Stats
    this.score = 0;
    this.distance = 0;
    this.gems = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;

    // Speeds & Physics
    this.baseSpeed = 26;
    this.currentSpeed = 26;
    this.boostSpeed = 44;
    this.isManualBoost = false;
    this.difficulty = 'normal';

    // Nature Biomes: 'odyssey' | 'forest' | 'savannah' | 'winter' | 'jungle'
    this.selectedWorld = 'odyssey';
    this.currentBiome = 'forest';
    this.biomeOrder = ['forest', 'savannah', 'winter', 'jungle'];
    this.biomeIndex = 0;
    this.nextWarpDistance = 1000;
    this.stageGoal = 1000;
    
    // Powerup Timers
    this.powerupType = null;
    this.powerupTimer = 0;
    this.powerupMaxTime = 8;

    // Screen Shake FX
    this.shakeIntensity = 0;
    this.shakeDecay = 4.0;

    // Persistence
    this.highScore = parseInt(localStorage.getItem('cyber_runner_highscore') || '0', 10);
    this.totalGems = parseInt(localStorage.getItem('cyber_runner_gems') || '0', 10);
    this.unlockedVehicles = JSON.parse(localStorage.getItem('cyber_runner_unlocked_veh') || '["dart"]');
    this.activeVehicle = localStorage.getItem('cyber_runner_active_veh') || 'dart';
    this.upgrades = JSON.parse(localStorage.getItem('cyber_runner_upgrades') || '{"magnet":1,"shield":1,"boost":1}');

    this.initThree();
    this.initEntities();
    this.initUI();
    this.applyGarageUpgrades();
    this.bindEvents();

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // Initialize Three.js Scene with Bright Natural Daylight & Sky
  initThree() {
    this.container = document.getElementById('canvas-container');

    this.scene = new THREE.Scene();
    // Vibrant Blue Sky & Soft Horizon Fog
    this.scene.background = new THREE.Color(0x64b5f6);
    this.scene.fog = new THREE.FogExp2(0xbbdefb, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      350
    );
    this.camera.position.set(0, 4.2, 7.5);
    this.camera.lookAt(0, 1.5, -10);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);

    // Warm Sun Daylight Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x81d4fa, 0x4caf50, 0.65);
    this.scene.add(this.hemiLight);

    // Main Sun Directional Light
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    this.dirLight.position.set(25, 45, 25);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 140;
    this.dirLight.shadow.camera.left = -25;
    this.dirLight.shadow.camera.right = 25;
    this.dirLight.shadow.camera.top = 25;
    this.dirLight.shadow.camera.bottom = -25;
    this.scene.add(this.dirLight);

    // Player Warm Glow Light
    this.playerLight = new THREE.PointLight(0xffeb3b, 1.2, 16);
    this.playerLight.position.set(0, 2, 0);
    this.scene.add(this.playerLight);
  }

  initEntities() {
    this.particles = new ParticleSystem(this.scene);
    this.player = new Player(this.scene);
    this.world = new WorldManager(this.scene);
    this.input = new InputManager(this.player, this);

    this.player.setVehicle(this.activeVehicle);
  }

  initUI() {
    this.ui = {
      score: document.getElementById('score-display'),
      gems: document.getElementById('gems-display'),
      distance: document.getElementById('distance-display'),
      comboBadge: document.getElementById('combo-badge'),
      comboText: document.getElementById('combo-text'),
      currentBiomeBadge: document.getElementById('current-biome-badge'),
      stageDistanceBadge: document.getElementById('stage-distance-badge'),
      stageProgressFill: document.getElementById('stage-progress-fill'),

      powerupStatus: document.getElementById('powerup-status'),
      powerupIcon: document.getElementById('powerup-icon'),
      powerupProgress: document.getElementById('powerup-progress-fill'),
      lives: document.querySelectorAll('.life-heart'),
      speedMeter: document.getElementById('speed-meter'),
      speedBarFill: document.getElementById('speed-bar-fill'),

      startScreen: document.getElementById('start-screen'),
      startHighScore: document.getElementById('start-high-score'),
      totalBankedGems: document.getElementById('total-banked-gems'),
      pauseScreen: document.getElementById('pause-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      stagesScreen: document.getElementById('stages-screen'),
      garageScreen: document.getElementById('garage-screen'),
      garageGemsCount: document.getElementById('garage-gems-count'),
      warpOverlay: document.getElementById('warp-overlay'),
      warpWorldName: document.getElementById('warp-world-name'),
      hud: document.getElementById('hud'),

      finalScore: document.getElementById('final-score'),
      bestScore: document.getElementById('best-score'),
      finalDistance: document.getElementById('final-distance'),
      finalGems: document.getElementById('final-gems'),
      newHighBadge: document.getElementById('new-high-badge'),
      damageFlash: document.getElementById('damage-flash'),

      btnSound: document.getElementById('btn-sound-toggle'),
      btnPause: document.getElementById('btn-pause'),
      btnStart: document.getElementById('btn-start'),
      btnRetry: document.getElementById('btn-retry'),
      btnMenu: document.getElementById('btn-menu'),
      btnResume: document.getElementById('btn-resume'),
      btnRestartPause: document.getElementById('btn-restart-pause'),
      btnOpenStages: document.getElementById('btn-open-stages'),
      btnCloseStages: document.getElementById('btn-close-stages'),
      btnConfirmStage: document.getElementById('btn-confirm-stage'),
      btnOpenGarage: document.getElementById('btn-open-garage'),
      btnCloseGarage: document.getElementById('btn-close-garage'),

      diffBtns: document.querySelectorAll('.diff-btn'),
      stageCards: document.querySelectorAll('.stage-card'),
      vehicleCards: document.querySelectorAll('.vehicle-card'),

      btnBuyTitan: document.getElementById('btn-buy-titan'),
      btnBuyPhantom: document.getElementById('btn-buy-phantom'),
      titanStatusBadge: document.getElementById('titan-status-badge'),
      phantomStatusBadge: document.getElementById('phantom-status-badge'),

      btnUpMagnet: document.getElementById('btn-up-magnet'),
      btnUpShield: document.getElementById('btn-up-shield'),
      btnUpBoost: document.getElementById('btn-up-boost'),
      magnetLevelText: document.getElementById('magnet-level-text'),
      shieldLevelText: document.getElementById('shield-level-text'),
      boostLevelText: document.getElementById('boost-level-text')
    };

    this.updateUserStatsUI();
    this.updateGarageUI();
  }

  updateUserStatsUI() {
    if (this.ui.startHighScore) this.ui.startHighScore.textContent = this.highScore.toLocaleString('ar-EG');
    if (this.ui.totalBankedGems) this.ui.totalBankedGems.textContent = this.totalGems.toLocaleString('ar-EG');
    if (this.ui.garageGemsCount) this.ui.garageGemsCount.textContent = this.totalGems.toLocaleString('ar-EG') + ' 💎';
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    this.ui.diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.ui.diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
      });
    });

    this.ui.btnStart.addEventListener('click', () => this.start());
    this.ui.btnRetry.addEventListener('click', () => this.restart());
    this.ui.btnMenu.addEventListener('click', () => this.showMenu());
    this.ui.btnPause.addEventListener('click', () => this.togglePause());
    this.ui.btnResume.addEventListener('click', () => this.togglePause());
    this.ui.btnRestartPause.addEventListener('click', () => {
      this.togglePause();
      this.restart();
    });

    this.ui.btnSound.addEventListener('click', () => {
      const isMuted = window.sound.toggleMute();
      this.ui.btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

    this.ui.btnOpenStages.addEventListener('click', () => {
      this.ui.startScreen.classList.add('hidden');
      this.ui.stagesScreen.classList.remove('hidden');
      this.ui.stagesScreen.classList.add('active');
    });

    this.ui.btnCloseStages.addEventListener('click', () => {
      this.ui.stagesScreen.classList.remove('active');
      this.ui.stagesScreen.classList.add('hidden');
      this.ui.startScreen.classList.remove('hidden');
    });

    this.ui.btnConfirmStage.addEventListener('click', () => {
      this.ui.stagesScreen.classList.remove('active');
      this.ui.stagesScreen.classList.add('hidden');
      this.ui.startScreen.classList.remove('hidden');
    });

    this.ui.stageCards.forEach(card => {
      card.addEventListener('click', () => {
        this.ui.stageCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedWorld = card.dataset.world;
      });
    });

    this.ui.btnOpenGarage.addEventListener('click', () => {
      this.ui.startScreen.classList.add('hidden');
      this.ui.garageScreen.classList.remove('hidden');
      this.ui.garageScreen.classList.add('active');
      this.updateGarageUI();
    });

    this.ui.btnCloseGarage.addEventListener('click', () => {
      this.ui.garageScreen.classList.remove('active');
      this.ui.garageScreen.classList.add('hidden');
      this.ui.startScreen.classList.remove('hidden');
      this.updateUserStatsUI();
    });

    this.ui.vehicleCards.forEach(card => {
      const vehKey = card.dataset.vehicle;
      const btn = card.querySelector('.veh-select-btn');

      btn.addEventListener('click', () => {
        if (this.unlockedVehicles.includes(vehKey)) {
          this.activeVehicle = vehKey;
          localStorage.setItem('cyber_runner_active_veh', this.activeVehicle);
          this.player.setVehicle(this.activeVehicle);
          this.applyGarageUpgrades();
          this.updateGarageUI();
          window.sound.playPurchase();
        } else {
          const cost = parseInt(btn.dataset.cost || '500', 10);
          if (this.totalGems >= cost) {
            this.totalGems -= cost;
            this.unlockedVehicles.push(vehKey);
            this.activeVehicle = vehKey;
            localStorage.setItem('cyber_runner_gems', this.totalGems.toString());
            localStorage.setItem('cyber_runner_unlocked_veh', JSON.stringify(this.unlockedVehicles));
            localStorage.setItem('cyber_runner_active_veh', this.activeVehicle);
            this.player.setVehicle(this.activeVehicle);
            this.applyGarageUpgrades();
            this.updateGarageUI();
            this.updateUserStatsUI();
            window.sound.playPurchase();
          } else {
            alert('عفواً! ليس لديك ثمار ذهبية كافية لفتح هذه المركبة.');
          }
        }
      });
    });

    const buyUpgrade = (type, btn) => {
      const curLvl = this.upgrades[type] || 1;
      if (curLvl >= 5) return;
      const cost = curLvl * 200;

      if (this.totalGems >= cost) {
        this.totalGems -= cost;
        this.upgrades[type] = curLvl + 1;
        localStorage.setItem('cyber_runner_gems', this.totalGems.toString());
        localStorage.setItem('cyber_runner_upgrades', JSON.stringify(this.upgrades));
        this.applyGarageUpgrades();
        this.updateGarageUI();
        this.updateUserStatsUI();
        window.sound.playPurchase();
      } else {
        alert('النقاط غير كافية للترقية.');
      }
    };

    this.ui.btnUpMagnet.addEventListener('click', () => buyUpgrade('magnet', this.ui.btnUpMagnet));
    this.ui.btnUpShield.addEventListener('click', () => buyUpgrade('shield', this.ui.btnUpShield));
    this.ui.btnUpBoost.addEventListener('click', () => buyUpgrade('boost', this.ui.btnUpBoost));
  }

  updateGarageUI() {
    if (this.ui.garageGemsCount) {
      this.ui.garageGemsCount.textContent = this.totalGems.toLocaleString('ar-EG') + ' 💎';
    }

    this.ui.vehicleCards.forEach(card => {
      const vKey = card.dataset.vehicle;
      const isOwned = this.unlockedVehicles.includes(vKey);
      const isSelected = (this.activeVehicle === vKey);
      const btn = card.querySelector('.veh-select-btn');

      if (isSelected) {
        card.classList.add('active');
        btn.textContent = 'محددة للسباق ✅';
        btn.className = 'veh-select-btn btn-primary btn-sm selected';
      } else if (isOwned) {
        card.classList.remove('active');
        btn.textContent = 'اختيار المركبة';
        btn.className = 'veh-select-btn btn-secondary btn-sm';
      } else {
        card.classList.remove('active');
        const cost = btn.dataset.cost;
        btn.textContent = `فتح بـ ${cost} 💎`;
        btn.className = 'veh-select-btn btn-secondary btn-sm';
      }
    });

    if (this.ui.titanStatusBadge) {
      const isTitanOwned = this.unlockedVehicles.includes('titan');
      this.ui.titanStatusBadge.className = isTitanOwned ? 'veh-status-badge owned' : 'veh-status-badge locked';
      this.ui.titanStatusBadge.textContent = isTitanOwned ? 'مملوكة ✅' : 'مغلقة 🔒';
    }

    if (this.ui.phantomStatusBadge) {
      const isPhantomOwned = this.unlockedVehicles.includes('phantom');
      this.ui.phantomStatusBadge.className = isPhantomOwned ? 'veh-status-badge owned' : 'veh-status-badge locked';
      this.ui.phantomStatusBadge.textContent = isPhantomOwned ? 'مملوكة ✅' : 'مغلقة 🔒';
    }

    const updateUpBtn = (type, btn, lvlText) => {
      const lvl = this.upgrades[type] || 1;
      lvlText.textContent = `المستوى ${lvl} / 5`;
      if (lvl >= 5) {
        btn.textContent = 'الحد الأقصى (MAX)';
        btn.classList.add('maxed');
      } else {
        btn.textContent = `ترقية بـ ${lvl * 200} 💎`;
        btn.classList.remove('maxed');
      }
    };

    updateUpBtn('magnet', this.ui.btnUpMagnet, this.ui.magnetLevelText);
    updateUpBtn('shield', this.ui.btnUpShield, this.ui.shieldLevelText);
    updateUpBtn('boost', this.ui.btnUpBoost, this.ui.boostLevelText);
  }

  applyGarageUpgrades() {
    const magnetLvl = this.upgrades.magnet || 1;
    const shieldLvl = this.upgrades.shield || 1;
    const boostLvl = this.upgrades.boost || 1;

    this.player.magnetRadius = 5.0 + (magnetLvl * 1.6);
    if (this.activeVehicle === 'phantom') this.player.magnetRadius += 3.0;

    this.player.shieldDurationBonus = (shieldLvl - 1) * 1.5;
    this.player.boostFactor = 1.0 + (boostLvl * 0.08);
    this.boostSpeed = 44 * this.player.boostFactor;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  switchBiome(biomeKey, showWarpFX = true) {
    this.currentBiome = biomeKey;
    this.world.setBiome(biomeKey);
    this.particles.setBiome(biomeKey);
    window.sound.setBiome(biomeKey);

    const biomeData = this.world.biomes[biomeKey];
    if (this.ui.currentBiomeBadge && biomeData) {
      this.ui.currentBiomeBadge.textContent = `${biomeData.icon} ${biomeData.name}`;
    }

    if (showWarpFX && this.ui.warpOverlay) {
      this.ui.warpWorldName.textContent = `الانتقال إلى ${biomeData.name}!`;
      this.ui.warpOverlay.classList.add('active');
      window.sound.playWarp();
      this.shakeScreen(0.8);

      setTimeout(() => {
        this.ui.warpOverlay.classList.remove('active');
      }, 1200);
    }
  }

  start() {
    this.state = 'PLAYING';
    this.ui.startScreen.classList.remove('active');
    this.ui.startScreen.classList.add('hidden');
    this.ui.hud.classList.remove('hidden');
    this.ui.speedMeter.classList.remove('hidden');

    if (this.difficulty === 'easy') {
      this.baseSpeed = 22;
      this.maxLives = 4;
    } else if (this.difficulty === 'normal') {
      this.baseSpeed = 27;
      this.maxLives = 3;
    } else {
      this.baseSpeed = 35;
      this.maxLives = 2;
    }

    if (this.selectedWorld === 'odyssey') {
      this.biomeIndex = 0;
      this.switchBiome(this.biomeOrder[0], false);
      this.nextWarpDistance = 1000;
      this.stageGoal = 1000;
    } else {
      this.switchBiome(this.selectedWorld, false);
      this.nextWarpDistance = 999999;
    }

    this.currentSpeed = this.baseSpeed;
    this.resetStats();
    window.sound.startMusic();
  }

  restart() {
    this.ui.gameoverScreen.classList.remove('active');
    this.ui.gameoverScreen.classList.add('hidden');
    this.ui.hud.classList.remove('hidden');
    this.ui.speedMeter.classList.remove('hidden');

    this.state = 'PLAYING';
    this.resetStats();
    this.player.reset();
    this.world.reset();
    this.particles.clear();

    if (this.selectedWorld === 'odyssey') {
      this.biomeIndex = 0;
      this.switchBiome(this.biomeOrder[0], false);
      this.nextWarpDistance = 1000;
    } else {
      this.switchBiome(this.selectedWorld, false);
    }

    window.sound.startMusic();
  }

  showMenu() {
    this.ui.gameoverScreen.classList.remove('active');
    this.ui.gameoverScreen.classList.add('hidden');
    this.ui.hud.classList.add('hidden');
    this.ui.speedMeter.classList.add('hidden');
    this.ui.startScreen.classList.remove('hidden');
    this.ui.startScreen.classList.add('active');

    this.state = 'START';
    this.player.reset();
    this.world.reset();
    this.particles.clear();
    window.sound.stopMusic();
    this.updateUserStatsUI();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.ui.pauseScreen.classList.remove('hidden');
      this.ui.pauseScreen.classList.add('active');
      window.sound.stopMusic();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.ui.pauseScreen.classList.remove('active');
      this.ui.pauseScreen.classList.add('hidden');
      window.sound.startMusic();
    }
  }

  resetStats() {
    this.score = 0;
    this.distance = 0;
    this.gems = 0;
    this.lives = this.maxLives;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.powerupType = null;
    this.powerupTimer = 0;
    this.updateHUD();
  }

  triggerBoost(isBoosting) {
    this.isManualBoost = isBoosting;
    if (isBoosting) {
      window.sound.playBoost();
      this.shakeScreen(0.2);
    }
  }

  shakeScreen(amount = 0.35) {
    this.shakeIntensity = amount;
  }

  flashDamage() {
    this.ui.damageFlash.classList.add('flash');
    setTimeout(() => {
      this.ui.damageFlash.classList.remove('flash');
    }, 120);
  }

  activatePowerup(type) {
    this.powerupType = type;
    this.powerupTimer = this.powerupMaxTime + this.player.shieldDurationBonus;
    window.sound.playPowerup();

    if (type === 'shield') {
      this.player.setShield(true);
      this.ui.powerupIcon.textContent = '🛡️';
    } else if (type === 'boost') {
      this.ui.powerupIcon.textContent = '⚡';
    }

    this.ui.powerupStatus.classList.remove('hidden');
  }

  checkCollisions() {
    const playerBox = this.player.boxCollider;
    const playerPos = this.player.group.position;

    // 1. Jump Pads (Mushroom Bouncers)
    for (let pad of this.world.jumpPads) {
      if (playerBox.intersectsBox(pad.box)) {
        this.player.launchJumpPad();
        this.particles.createJumpPadBlast(pad.mesh.position);
        this.shakeScreen(0.25);
        this.score += 500 * this.combo;
      }
    }

    // 2. Warp Gates
    for (let gate of this.world.warpGates) {
      if (!gate.passed && playerPos.z < gate.z + 2.0 && playerPos.z > gate.z - 2.0) {
        gate.passed = true;
        this.biomeIndex = (this.biomeIndex + 1) % this.biomeOrder.length;
        this.switchBiome(this.biomeOrder[this.biomeIndex], true);
      }
    }

    // 3. Nature Obstacles
    for (let i = this.world.obstacles.length - 1; i >= 0; i--) {
      const obs = this.world.obstacles[i];
      if (playerBox.intersectsBox(obs.box)) {
        this.particles.createExplosion(obs.mesh.position);
        this.scene.remove(obs.mesh);
        this.world.obstacles.splice(i, 1);

        if (this.player.isShieldActive) {
          this.player.setShield(false);
          this.powerupType = null;
          this.powerupTimer = 0;
          this.ui.powerupStatus.classList.add('hidden');
          window.sound.playHit();
          this.shakeScreen(0.4);
        } else {
          this.lives--;
          this.combo = 1;
          this.comboTimer = 0;
          this.flashDamage();
          this.shakeScreen(0.6);
          window.sound.playHit();
          this.input.vibrate(80);

          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
        }
        this.updateHUD();
      }
    }

    // 4. Collectibles (Golden Apples & Gems)
    for (let i = this.world.collectibles.length - 1; i >= 0; i--) {
      const col = this.world.collectibles[i];
      const dist = playerPos.distanceTo(col.mesh.position);
      if (dist < 1.7) {
        this.particles.createCollectBurst(col.mesh.position, 0xffd700);
        this.scene.remove(col.mesh);
        this.world.collectibles.splice(i, 1);

        this.gems++;
        this.score += col.points * this.combo;

        this.combo = Math.min(10, this.combo + 1);
        this.comboTimer = 3.8;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        window.sound.playCollect(this.combo);
        this.updateHUD();
      }
    }

    // 5. Powerups
    for (let i = this.world.powerups.length - 1; i >= 0; i--) {
      const pow = this.world.powerups[i];
      const dist = playerPos.distanceTo(pow.mesh.position);
      if (dist < 1.9) {
        this.particles.createCollectBurst(pow.mesh.position, 0x00e676);
        this.scene.remove(pow.mesh);
        this.world.powerups.splice(i, 1);
        this.activatePowerup(pow.type);
      }
    }
  }

  updateHUD() {
    if (this.ui.score) this.ui.score.textContent = Math.floor(this.score).toLocaleString('ar-EG');
    if (this.ui.gems) this.ui.gems.textContent = this.gems.toLocaleString('ar-EG');
    if (this.ui.distance) this.ui.distance.textContent = Math.floor(this.distance) + 'm';

    if (this.selectedWorld === 'odyssey') {
      const cycleDist = this.distance % 1000;
      const pct = Math.min(100, (cycleDist / 1000) * 100);
      if (this.ui.stageProgressFill) this.ui.stageProgressFill.style.width = `${pct}%`;
      if (this.ui.stageDistanceBadge) this.ui.stageDistanceBadge.textContent = `${Math.floor(cycleDist)} / 1000m`;
    } else {
      const pct = Math.min(100, (this.distance / 2000) * 100);
      if (this.ui.stageProgressFill) this.ui.stageProgressFill.style.width = `${pct}%`;
      if (this.ui.stageDistanceBadge) this.ui.stageDistanceBadge.textContent = `${Math.floor(this.distance)}m`;
    }

    this.ui.lives.forEach((heart, idx) => {
      if (idx < this.lives) {
        heart.classList.remove('lost');
      } else {
        heart.classList.add('lost');
      }
    });

    if (this.combo > 1) {
      this.ui.comboBadge.classList.remove('hidden');
      this.ui.comboText.textContent = `COMBO x${this.combo}`;
    } else {
      this.ui.comboBadge.classList.add('hidden');
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    window.sound.stopMusic();
    window.sound.playGameOver();

    this.totalGems += this.gems;
    localStorage.setItem('cyber_runner_gems', this.totalGems.toString());

    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('cyber_runner_highscore', this.highScore.toString());
      this.ui.newHighBadge.classList.remove('hidden');
    } else {
      this.ui.newHighBadge.classList.add('hidden');
    }

    this.ui.finalScore.textContent = Math.floor(this.score).toLocaleString('ar-EG');
    this.ui.bestScore.textContent = this.highScore.toLocaleString('ar-EG');
    this.ui.finalDistance.textContent = Math.floor(this.distance) + 'm';
    this.ui.finalGems.textContent = this.gems + ' 💎';

    this.ui.hud.classList.add('hidden');
    this.ui.speedMeter.classList.add('hidden');
    this.ui.gameoverScreen.classList.remove('hidden');
    this.ui.gameoverScreen.classList.add('active');
  }

  animate(timestamp) {
    requestAnimationFrame(this.animate);

    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.state === 'PLAYING') {
      const targetSpeed = (this.powerupType === 'boost' || this.isManualBoost) ? this.boostSpeed : this.baseSpeed + (this.distance * 0.005);
      this.currentSpeed += (targetSpeed - this.currentSpeed) * 4 * delta;

      const speedPct = Math.min(100, (this.currentSpeed / this.boostSpeed) * 100);
      if (this.ui.speedBarFill) {
        this.ui.speedBarFill.style.width = `${speedPct}%`;
      }

      const forwardStep = this.currentSpeed * delta;
      this.player.z -= forwardStep;
      this.distance += forwardStep * 0.5;
      this.score += forwardStep * 1.2 * this.combo;

      if (this.selectedWorld === 'odyssey' && this.distance >= this.nextWarpDistance - 60 && this.world.warpGates.length === 0) {
        const warpZ = this.player.z - 80;
        this.world.spawnWarpGate(warpZ);
        this.nextWarpDistance += 1000;
      }

      this.world.pullCollectibles(this.player.group.position, this.player.magnetRadius);

      if (this.comboTimer > 0) {
        this.comboTimer -= delta;
        if (this.comboTimer <= 0) {
          this.combo = 1;
          this.updateHUD();
        }
      }

      if (this.powerupTimer > 0) {
        this.powerupTimer -= delta;
        const progressPct = (this.powerupTimer / this.powerupMaxTime) * 100;
        this.ui.powerupProgress.style.width = `${progressPct}%`;

        if (this.powerupType === 'boost') {
          this.player.setBoosting(true);
        }

        if (this.powerupTimer <= 0) {
          if (this.powerupType === 'shield') this.player.setShield(false);
          if (this.powerupType === 'boost') this.player.setBoosting(false);
          this.powerupType = null;
          this.ui.powerupStatus.classList.add('hidden');
        }
      }

      this.player.update(delta, this.particles);
      this.world.update(delta, this.player.z, this.currentSpeed);
      this.particles.update(delta, this.player.z, this.currentSpeed);
      this.checkCollisions();
      this.updateHUD();

      // Lights follow player
      this.playerLight.position.set(this.player.x, this.player.y + 1.5, this.player.z);
      this.dirLight.position.set(this.player.x + 25, 45, this.player.z + 25);
      this.dirLight.target = this.player.group;

      // Camera follow
      const targetCamX = this.player.x * 0.45;
      const targetCamY = Math.max(3.8, this.player.y * 0.35 + 3.8);
      const targetCamZ = this.player.z + 7.4;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * delta;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 8 * delta;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 14 * delta;

      if (this.shakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * delta);
      }

      const targetFOV = this.isManualBoost || this.powerupType === 'boost' ? 75 : (this.player.vy > 15 ? 70 : 60);
      this.camera.fov += (targetFOV - this.camera.fov) * 5 * delta;
      this.camera.updateProjectionMatrix();

      this.camera.lookAt(this.player.x * 0.2, this.player.y * 0.5 + 1.2, this.player.z - 12);
    } else {
      if (this.player) {
        this.player.hoverBobTimer += delta * 3;
        this.player.group.position.y = 1.0 + Math.sin(this.player.hoverBobTimer) * 0.15;
        this.player.group.rotation.y += 0.5 * delta;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
