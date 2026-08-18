/**
 * Game Core Controller with 4 Modes (Odyssey, Time Attack, Frenzy, Survival) & 4 Characters
 */
class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // UI Cache
    this.ui = {
      hud: document.getElementById('hud'),
      score: document.getElementById('score-display'),
      gems: document.getElementById('gems-display'),
      distance: document.getElementById('distance-display'),
      lives: document.querySelectorAll('.life-heart'),
      comboBadge: document.getElementById('combo-badge'),
      comboText: document.getElementById('combo-text'),
      speedMeter: document.getElementById('speed-meter'),
      speedBarFill: document.getElementById('speed-bar-fill'),
      currentBiomeBadge: document.getElementById('current-biome-badge'),
      stageDistanceBadge: document.getElementById('stage-distance-badge'),
      stageProgressFill: document.getElementById('stage-progress-fill'),
      powerupStatus: document.getElementById('powerup-status'),
      powerupIcon: document.getElementById('powerup-icon'),
      powerupProgress: document.getElementById('powerup-progress-fill'),
      startScreen: document.getElementById('start-screen'),
      stagesScreen: document.getElementById('stages-screen'),
      garageScreen: document.getElementById('garage-screen'),
      pauseScreen: document.getElementById('pause-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      damageFlash: document.getElementById('damage-flash'),
      warpOverlay: document.getElementById('warp-overlay'),
      warpWorldName: document.getElementById('warp-world-name'),
      startHighScore: document.getElementById('start-high-score'),
      totalBankedGems: document.getElementById('total-banked-gems'),
      garageGemsCount: document.getElementById('garage-gems-count'),
      finalScore: document.getElementById('final-score'),
      bestScore: document.getElementById('best-score'),
      finalDistance: document.getElementById('final-distance'),
      finalGems: document.getElementById('final-gems'),
      newHighBadge: document.getElementById('new-high-badge'),
      btnStart: document.getElementById('btn-start'),
      btnOpenStages: document.getElementById('btn-open-stages'),
      btnOpenGarage: document.getElementById('btn-open-garage'),
      btnCloseStages: document.getElementById('btn-close-stages'),
      btnConfirmStage: document.getElementById('btn-confirm-stage'),
      btnCloseGarage: document.getElementById('btn-close-garage'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      btnPause: document.getElementById('btn-pause'),
      btnResume: document.getElementById('btn-resume'),
      btnRestartPause: document.getElementById('btn-restart-pause'),
      btnRetry: document.getElementById('btn-retry'),
      btnMenu: document.getElementById('btn-menu'),
      btnUpMagnet: document.getElementById('btn-up-magnet'),
      btnUpShield: document.getElementById('btn-up-shield'),
      btnUpBoost: document.getElementById('btn-up-boost'),
      magnetLevelText: document.getElementById('magnet-level-text'),
      shieldLevelText: document.getElementById('shield-level-text'),
      boostLevelText: document.getElementById('boost-level-text')
    };

    // Account & Cloud Persistence
    this.userEmail = localStorage.getItem('fantasy_runner_email') || '';
    this.userName = localStorage.getItem('fantasy_runner_name') || 'مغامر الغابة';

    // Multi-tier data loading: check if email profile exists, otherwise fallback to standard storage
    this.loadProfileData();

    // Game Config & Modes

    // Time Attack Timer
    this.timeAttackTimer = 30.0;

    // State
    this.state = 'START';
    this.score = 0;
    this.distance = 0;
    this.gems = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;

    // Speed
    this.baseSpeed = 27;
    this.currentSpeed = 27;
    this.boostSpeed = 44;
    this.isManualBoost = false;

    // Powerup
    this.powerupType = null;
    this.powerupTimer = 0;
    this.powerupMaxTime = 8.0;

    // Camera Shake
    this.shakeIntensity = 0;
    this.shakeDecay = 4.5;
    this.lastTime = 0;

    this.initThree();
    this.initGameSystems();
    this.initEvents();
    this.updateUserStatsUI();
    this.applyGarageUpgrades();
    this.updateUpgradesUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8bbd0);
    this.scene.fog = new THREE.FogExp2(0xfce4ec, 0.012);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
    this.camera.position.set(0, 4.0, 7.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Warm Sun Daylight Lighting
    this.hemiLight = new THREE.HemisphereLight(0xfff9c4, 0x81d4fa, 0.9);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(25, 45, 25);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -20;
    this.dirLight.shadow.camera.right = 20;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -20;
    this.scene.add(this.dirLight);

    this.playerLight = new THREE.PointLight(0xffd54f, 0.8, 16);
    this.scene.add(this.playerLight);
  }

  initGameSystems() {
    this.particles = new ParticleSystem(this.scene);
    this.world = new WorldManager(this.scene);
    this.player = new Player(this.scene);
    this.input = new InputManager(this.player, this);

    this.player.setCharacter(this.activeCharacter);
    this.switchBiome(this.selectedWorld, false);
  }

  initEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Main Menu & Buttons
    if (this.ui.btnStart) this.ui.btnStart.addEventListener('click', () => this.start());

    // Game Mode Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = btn.dataset.mode || 'odyssey';
      });
    });

    // Difficulty
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
      });
    });

    // Stage Selector
    if (this.ui.btnOpenStages) {
      this.ui.btnOpenStages.addEventListener('click', () => {
        this.ui.stagesScreen.classList.remove('hidden');
        this.ui.stagesScreen.classList.add('active');
      });
    }

    if (this.ui.btnCloseStages) {
      this.ui.btnCloseStages.addEventListener('click', () => {
        this.ui.stagesScreen.classList.remove('active');
        this.ui.stagesScreen.classList.add('hidden');
      });
    }

    if (this.ui.btnConfirmStage) {
      this.ui.btnConfirmStage.addEventListener('click', () => {
        this.ui.stagesScreen.classList.remove('active');
        this.ui.stagesScreen.classList.add('hidden');
      });
    }

    document.querySelectorAll('.stage-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.stage-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const worldKey = card.dataset.world;
        if (worldKey === 'odyssey') {
          this.gameMode = 'odyssey';
          this.selectedWorld = 'candy';
        } else {
          this.selectedWorld = worldKey;
          this.switchBiome(worldKey, false);
        }
      });
    });

    // Garage / Character Wardrobe
    if (this.ui.btnOpenGarage) {
      this.ui.btnOpenGarage.addEventListener('click', () => {
        this.ui.garageScreen.classList.remove('hidden');
        this.ui.garageScreen.classList.add('active');
        this.updateGarageUI();
      });
    }

    if (this.ui.btnCloseGarage) {
      this.ui.btnCloseGarage.addEventListener('click', () => {
        this.ui.garageScreen.classList.remove('active');
        this.ui.garageScreen.classList.add('hidden');
      });
    }

    // Character Selection Cards
    document.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', () => {
        const charId = card.dataset.char || card.dataset.vehicle;
        const mappedChar = (charId === 'titan' || charId === 'maryam') ? 'maryam' : ((charId === 'phantom' || charId === 'ziyad') ? 'ziyad' : 'sami');
        const isUnlocked = this.unlockedChars.includes(mappedChar);

        if (isUnlocked) {
          this.activeCharacter = mappedChar;
          localStorage.setItem('cyber_runner_active_char', mappedChar);
          this.player.setCharacter(mappedChar);
          this.updateGarageUI();
        }
      });
    });

    // Human Character Purchase Buttons
    const setupBuyBtn = (btnId, charId, cost) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.totalGems >= cost && !this.unlockedChars.includes(charId)) {
          this.totalGems -= cost;
          this.unlockedChars.push(charId);
          this.activeCharacter = charId;
          this.player.setCharacter(charId);
          this.syncAllData();
          this.updateGarageUI();
          if (window.sound) window.sound.playPowerup();
        }
      });
    };

    setupBuyBtn('btn-buy-ziyad', 'ziyad', 500);
    setupBuyBtn('btn-buy-maryam', 'maryam', 1000);

    // Upgrades
    const setupUpBtn = (btn, type) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const curLvl = this.upgrades[type] || 1;
        if (curLvl < 5) {
          const cost = curLvl * 200;
          if (this.totalGems >= cost) {
            this.totalGems -= cost;
            this.upgrades[type] = curLvl + 1;
            this.syncAllData();
            this.applyGarageUpgrades();
            this.updateUpgradesUI();
            this.updateGarageUI();
            if (window.sound) window.sound.playPowerup();
          }
        }
      });
    };

    setupUpBtn(this.ui.btnUpMagnet, 'magnet');
    setupUpBtn(this.ui.btnUpShield, 'shield');
    setupUpBtn(this.ui.btnUpBoost, 'boost');

    // Controls HUD
    if (this.ui.btnSoundToggle) {
      this.ui.btnSoundToggle.addEventListener('click', () => {
        const enabled = window.sound.toggleMute();
        this.ui.btnSoundToggle.textContent = enabled ? '🔊' : '🔇';
      });
    }

    if (this.ui.btnPause) this.ui.btnPause.addEventListener('click', () => this.togglePause());
    if (this.ui.btnResume) this.ui.btnResume.addEventListener('click', () => this.togglePause());
    if (this.ui.btnRestartPause) this.ui.btnRestartPause.addEventListener('click', () => this.restart());
    if (this.ui.btnRetry) this.ui.btnRetry.addEventListener('click', () => this.restart());
    if (this.ui.btnMenu) this.ui.btnMenu.addEventListener('click', () => this.showMenu());
  }

  initAccountSystem() {
    const btnOpen = document.getElementById('btn-open-account');
    const btnToggle = document.getElementById('btn-account-toggle');
    const btnClose = document.getElementById('btn-close-account');
    const accountScreen = document.getElementById('account-screen');
    const btnSaveLogin = document.getElementById('btn-save-login');
    const inputEmail = document.getElementById('input-email');
    const inputName = document.getElementById('input-name');
    const btnExport = document.getElementById('btn-export-save');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const inputImportFile = document.getElementById('input-import-file');

    const openAccountModal = () => {
      if (inputEmail) inputEmail.value = this.userEmail;
      if (inputName) inputName.value = this.userName;
      if (accountScreen) accountScreen.classList.remove('hidden');
    };

    if (btnOpen) btnOpen.addEventListener('click', openAccountModal);
    if (btnToggle) btnToggle.addEventListener('click', openAccountModal);
    if (btnClose) btnClose.addEventListener('click', () => {
      if (accountScreen) accountScreen.classList.add('hidden');
    });

    if (btnSaveLogin) {
      btnSaveLogin.addEventListener('click', () => {
        const email = (inputEmail.value || '').trim();
        const name = (inputName.value || '').trim() || 'مغامر الغابة';

        if (!email || !email.includes('@')) {
          alert('يرجى كتابة بريد إلكتروني صحيح لحفظ البيانات');
          return;
        }

        this.userEmail = email;
        this.userName = name;

        // Check if previous cloud data exists for this email
        let existingProfile = null;
        try {
          existingProfile = JSON.parse(localStorage.getItem('fantasy_profile_' + email) || 'null');
        } catch (e) {}

        if (existingProfile) {
          // Merge / Restore
          this.totalGems = Math.max(this.totalGems, existingProfile.gems || 0);
          this.highScore = Math.max(this.highScore, existingProfile.highScore || 0);
          this.unlockedChars = Array.from(new Set([...this.unlockedChars, ...(existingProfile.unlockedChars || ['sami'])]));
          this.upgrades = existingProfile.upgrades || this.upgrades;
        }

        this.syncAllData();
        if (accountScreen) accountScreen.classList.add('hidden');
        if (window.sound) window.sound.playPowerup();
        alert(`تم تسجيل الدخول بنجاح بحساب ${email} وتم حفظ ومزامنة كافة الأرقام سحابياً! ☁️✨`);
      });
    }

    // Export Save File
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const saveData = {
          email: this.userEmail,
          name: this.userName,
          gems: this.totalGems,
          highScore: this.highScore,
          activeCharacter: this.activeCharacter,
          unlockedChars: this.unlockedChars,
          upgrades: this.upgrades,
          timestamp: Date.now()
        };
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FantasyRunner_Save_${this.userName || 'Player'}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import Save File
    if (btnImportTrigger && inputImportFile) {
      btnImportTrigger.addEventListener('click', () => inputImportFile.click());
      inputImportFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data && typeof data.gems !== 'undefined') {
              this.totalGems = data.gems || 0;
              this.highScore = data.highScore || 0;
              this.activeCharacter = data.activeCharacter || 'sami';
              this.unlockedChars = data.unlockedChars || ['sami'];
              this.upgrades = data.upgrades || { magnet: 1, shield: 1, boost: 1 };
              if (data.email) this.userEmail = data.email;
              if (data.name) this.userName = data.name;

              this.syncAllData();
              this.updateGarageUI();
              this.updateUpgradesUI();
              if (this.player) this.player.setCharacter(this.activeCharacter);
              if (accountScreen) accountScreen.classList.add('hidden');
              if (window.sound) window.sound.playPowerup();
              alert('تم استيراد واسترجاع ملف الحفظ بنجاح! 📥🎉');
            }
          } catch (err) {
            alert('خطأ في قراءة ملف الحفظ');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  updateAccountUI() {
    const displayName = document.getElementById('display-player-name');
    const displayEmail = document.getElementById('display-player-email');
    if (displayName) displayName.textContent = this.userName || 'مغامر الغابة';
    if (displayEmail) {
      if (this.userEmail) {
        displayEmail.textContent = `🟢 ${this.userEmail} (محفوظ سحابياً)`;
      } else {
        displayEmail.textContent = '🟢 تسجيل الدخول بالبريد لحفظ الأرقام';
      }
    }
  }

  updateGarageUI() {
    if (this.ui.garageGemsCount) this.ui.garageGemsCount.textContent = `${this.totalGems} 🍎`;

    document.querySelectorAll('.vehicle-card').forEach(card => {
      const charId = card.dataset.char || card.dataset.vehicle;
      const isUnlocked = this.unlockedChars.includes(charId);
      const isCurrent = (this.activeCharacter === charId);

      card.classList.toggle('active', isCurrent);
      const badge = card.querySelector('.veh-status-badge');
      const actionBtn = card.querySelector('.veh-select-btn');

      if (badge) {
        badge.textContent = isUnlocked ? 'مملوكة ✅' : 'مغلقة 🔒';
        badge.className = `veh-status-badge ${isUnlocked ? 'owned' : 'locked'}`;
      }

      if (actionBtn) {
        if (isCurrent) {
          actionBtn.textContent = 'محددة للسباق ⭐';
          actionBtn.className = 'veh-select-btn btn-primary btn-sm selected';
        } else if (isUnlocked) {
          actionBtn.textContent = 'اختيار الشخصية';
          actionBtn.className = 'veh-select-btn btn-primary btn-sm';
        }
      }
    });
  }

  updateUpgradesUI() {
    const updateUpBtn = (type, btn, lvlText) => {
      if (!btn || !lvlText) return;
      const lvl = this.upgrades[type] || 1;
      lvlText.textContent = `المستوى ${lvl} / 5`;
      if (lvl >= 5) {
        btn.textContent = 'المستوى الأقصى ⭐';
        btn.classList.add('maxed');
      } else {
        const cost = lvl * 200;
        btn.textContent = `ترقية بـ ${cost} 🍎`;
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

    this.player.magnetRadius = 5.5 + (magnetLvl * 1.8);
    if (this.activeCharacter === 'robot') this.player.magnetRadius += 3.5;

    this.player.shieldDurationBonus = (shieldLvl - 1) * 1.5;
    this.player.boostFactor = 1.0 + (boostLvl * 0.1);
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
    if (window.sound) window.sound.setBiome(biomeKey);

    const biomeData = this.world.biomes[biomeKey];
    if (this.ui.currentBiomeBadge && biomeData) {
      this.ui.currentBiomeBadge.textContent = `${biomeData.icon} ${biomeData.name}`;
    }

    if (showWarpFX && this.ui.warpOverlay) {
      this.ui.warpWorldName.textContent = `الانتقال إلى ${biomeData.name}!`;
      this.ui.warpOverlay.classList.add('active');
      if (window.sound) window.sound.playWarp();
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

    if (this.gameMode === 'survival') {
      this.baseSpeed = 36;
      this.maxLives = 1;
    } else if (this.gameMode === 'time_attack') {
      this.baseSpeed = 28;
      this.maxLives = 3;
      this.timeAttackTimer = 35.0;
    } else if (this.gameMode === 'frenzy') {
      this.baseSpeed = 26;
      this.maxLives = 3;
      this.player.magnetRadius = 14.0;
    } else {
      this.baseSpeed = 27;
      this.maxLives = 3;
    }

    if (this.gameMode === 'odyssey') {
      this.biomeIndex = 0;
      this.switchBiome(this.biomeOrder[0], false);
      this.nextWarpDistance = 1000;
    } else {
      this.switchBiome(this.selectedWorld, false);
      this.nextWarpDistance = 999999;
    }

    this.currentSpeed = this.baseSpeed;
    this.resetStats();
    if (window.sound) window.sound.startMusic();
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

    if (this.gameMode === 'odyssey') {
      this.biomeIndex = 0;
      this.switchBiome(this.biomeOrder[0], false);
      this.nextWarpDistance = 1000;
    } else {
      this.switchBiome(this.selectedWorld, false);
    }

    if (window.sound) window.sound.startMusic();
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
    if (window.sound) window.sound.stopMusic();
    this.updateUserStatsUI();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.ui.pauseScreen.classList.remove('hidden');
      this.ui.pauseScreen.classList.add('active');
      if (window.sound) window.sound.stopMusic();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.ui.pauseScreen.classList.remove('active');
      this.ui.pauseScreen.classList.add('hidden');
      if (window.sound) window.sound.startMusic();
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
    this.timeAttackTimer = 35.0;
    this.updateHUD();
  }

  triggerBoost(isBoosting) {
    this.isManualBoost = isBoosting;
    if (isBoosting) {
      if (window.sound) window.sound.playBoost();
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
    if (window.sound) window.sound.playPowerup();

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

    // 1. Jump Pads
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

    // 3. Obstacles (Rolling Donuts, Totems, Boulders)
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
          if (window.sound) window.sound.playHit();
          this.shakeScreen(0.4);
        } else {
          this.lives--;
          this.combo = 1;
          this.comboTimer = 0;
          this.flashDamage();
          this.shakeScreen(0.6);
          if (window.sound) window.sound.playHit();
          this.input.vibrate(80);

          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
        }
        this.updateHUD();
      }
    }

    // 4. Collectibles (Golden Apples, Gems, Hourglasses ⏳)
    for (let i = this.world.collectibles.length - 1; i >= 0; i--) {
      const col = this.world.collectibles[i];
      const dist = playerPos.distanceTo(col.mesh.position);
      if (dist < 1.8) {
        const isHourglass = col.isHourglass;
        this.particles.createCollectBurst(col.mesh.position, isHourglass ? 0x00e5ff : 0xffd700);
        this.scene.remove(col.mesh);
        this.world.collectibles.splice(i, 1);

        if (isHourglass) {
          this.timeAttackTimer += 6.0; // Add 6 seconds in time attack!
          this.score += 400 * this.combo;
          this.gems += 2;
        } else {
          const mult = (this.gameMode === 'frenzy') ? 10 : 1;
          this.gems += (1 * mult);
          this.score += col.points * this.combo * mult;
        }

        this.combo = Math.min(10, this.combo + 1);
        this.comboTimer = 3.8;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        if (window.sound) window.sound.playCollect(this.combo);
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

    if (this.gameMode === 'time_attack') {
      if (this.ui.stageDistanceBadge) {
        this.ui.stageDistanceBadge.textContent = `⏳ ${Math.ceil(this.timeAttackTimer)}s`;
      }
      const pct = Math.min(100, (this.timeAttackTimer / 40.0) * 100);
      if (this.ui.stageProgressFill) this.ui.stageProgressFill.style.width = `${pct}%`;
    } else if (this.gameMode === 'odyssey') {
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
      if (idx < this.lives) heart.classList.remove('lost');
      else heart.classList.add('lost');
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
    if (window.sound) {
      window.sound.stopMusic();
      window.sound.playGameOver();
    }

    this.totalGems += this.gems;
    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = Math.floor(this.score);
      this.ui.newHighBadge.classList.remove('hidden');
    } else {
      this.ui.newHighBadge.classList.add('hidden');
    }

    this.syncAllData();

    this.ui.finalScore.textContent = Math.floor(this.score).toLocaleString('ar-EG');
    this.ui.bestScore.textContent = this.highScore.toLocaleString('ar-EG');
    this.ui.finalDistance.textContent = Math.floor(this.distance) + 'm';
    this.ui.finalGems.textContent = this.gems + ' 🍎';

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
      // Time Attack Countdown
      if (this.gameMode === 'time_attack') {
        this.timeAttackTimer -= delta;
        if (this.timeAttackTimer <= 0) {
          this.gameOver();
          return;
        }
      }

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

      if (this.gameMode === 'odyssey' && this.distance >= this.nextWarpDistance - 60 && this.world.warpGates.length === 0) {
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

        if (this.powerupType === 'boost') this.player.setBoosting(true);

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
      // Idle Animation on Start / Menu Screen (Natural Breathing & Looking at Compass)
      if (this.player) {
        this.player.runTimer += delta * 2.2;
        const breath = Math.sin(this.player.runTimer) * 0.04;
        this.player.bodyGroup.position.y = 1.38 + breath;
        
        // Left arm holding compass steadily in front
        if (this.player.leftArmGroup) {
          this.player.leftArmGroup.rotation.x = -0.4 + Math.sin(this.player.runTimer * 2) * 0.05;
        }

        // Right arm natural gentle sway
        if (this.player.rightArmGroup) {
          this.player.rightArmGroup.rotation.x = -0.2 + Math.sin(this.player.runTimer * 2) * 0.1;
          this.player.rightArmGroup.rotation.z = -0.15;
        }

        // Face front/camera with slight natural head tilt
        this.player.group.rotation.y = Math.sin(this.player.runTimer * 0.4) * 0.2;
        this.player.group.position.set(0, 0, -2.2);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
