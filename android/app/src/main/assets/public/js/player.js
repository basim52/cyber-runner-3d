/**
 * 3D Animated Boy Runner Character (Stylized Low-Poly Boy with Full Run & Jump Cycles)
 */
class Player {
  constructor(scene) {
    this.scene = scene;
    
    // Lane movement
    this.lanes = [-3.5, 0, 3.5];
    this.currentLane = 1;
    this.targetX = 0;
    this.x = 0;
    this.y = 0.0;
    this.baseY = 0.0;
    this.z = 0;

    // Physics
    this.vy = 0;
    this.gravity = -38;
    this.jumpForce = 13.5;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2;

    this.tiltAngle = 0;
    this.targetTilt = 0;
    this.runTimer = 0;
    this.spinAngle = 0;

    // Outfits / Costumes: 'classic' | 'forest' | 'golden'
    this.costumeType = 'classic';

    // Upgraded stats
    this.magnetRadius = 6.0;
    this.shieldDurationBonus = 0;
    this.boostFactor = 1.0;

    // States
    this.isShieldActive = false;
    this.isBoosting = false;

    // Collider
    this.boxCollider = new THREE.Box3();

    this.initMaterials();
    this.createMesh();
  }

  initMaterials() {
    this.skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.6 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.8 });
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    
    // Outfits
    this.outfits = {
      classic: {
        shirt: 0x1976d2,   // Royal Blue Hoodie
        pants: 0x37474f,   // Dark Denim Jeans
        shoes: 0xe53935,   // Red Sneakers
        cap: 0xe53935,     // Red Cap
        backpack: 0xf57c00 // Orange Backpack
      },
      forest: {
        shirt: 0x388e3c,   // Forest Green
        pants: 0x5d4037,   // Earth Brown
        shoes: 0xffeb3b,   // Yellow Sneakers
        cap: 0x2e7d32,     // Green Cap
        backpack: 0x8d6e63
      },
      golden: {
        shirt: 0xfbc02d,   // Gold Explorer Jacket
        pants: 0x263238,   // Sleek Dark Pants
        shoes: 0x00e676,   // Neon Green Runners
        cap: 0xffa000,     // Gold Cap
        backpack: 0x7b1fa2
      }
    };

    const cur = this.outfits[this.costumeType] || this.outfits.classic;
    this.shirtMat = new THREE.MeshStandardMaterial({ color: cur.shirt, roughness: 0.7 });
    this.pantsMat = new THREE.MeshStandardMaterial({ color: cur.pants, roughness: 0.8 });
    this.shoeMat = new THREE.MeshStandardMaterial({ color: cur.shoes, roughness: 0.5 });
    this.soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    this.capMat = new THREE.MeshStandardMaterial({ color: cur.cap, roughness: 0.6 });
    this.backpackMat = new THREE.MeshStandardMaterial({ color: cur.backpack, roughness: 0.8 });
  }

  setVehicle(type) {
    // Map vehicle selection to Boy Costumes
    if (type === 'titan') this.costumeType = 'forest';
    else if (type === 'phantom') this.costumeType = 'golden';
    else this.costumeType = 'classic';

    this.initMaterials();
    if (this.group) {
      this.scene.remove(this.group);
    }
    this.createMesh();
  }

  createMesh() {
    this.group = new THREE.Group();

    // Main Boy Rig Hierarchy
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.35; // Center of mass
    this.group.add(this.bodyGroup);

    // 1. Torso (Jacket / Hoodie)
    const torsoGeom = new THREE.BoxGeometry(0.75, 0.85, 0.45);
    this.torsoMesh = new THREE.Mesh(torsoGeom, this.shirtMat);
    this.torsoMesh.castShadow = true;
    this.bodyGroup.add(this.torsoMesh);

    // White T-shirt Collar
    const collarGeom = new THREE.BoxGeometry(0.35, 0.12, 0.46);
    const collarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const collar = new THREE.Mesh(collarGeom, collarMat);
    collar.position.set(0, 0.4, 0.01);
    this.torsoMesh.add(collar);

    // Adventurer Backpack
    const packGeom = new THREE.BoxGeometry(0.55, 0.65, 0.3);
    const pack = new THREE.Mesh(packGeom, this.backpackMat);
    pack.position.set(0, 0.05, 0.35);
    pack.castShadow = true;
    this.torsoMesh.add(pack);

    // 2. Head & Neck
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.bodyGroup.add(this.headGroup);

    // Face / Head Sphere
    const headGeom = new THREE.SphereGeometry(0.36, 12, 12);
    const head = new THREE.Mesh(headGeom, this.skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.05, 6, 6);
    const lEye = new THREE.Mesh(eyeGeom, this.eyeMat);
    lEye.position.set(0.12, 0.05, -0.32);
    this.headGroup.add(lEye);

    const rEye = lEye.clone();
    rEye.position.set(-0.12, 0.05, -0.32);
    this.headGroup.add(rEye);

    // Hair
    const hairGeom = new THREE.DodecahedronGeometry(0.38, 1);
    const hair = new THREE.Mesh(hairGeom, this.hairMat);
    hair.position.set(0, 0.08, 0.04);
    this.headGroup.add(hair);

    // Cap (Backwards Sporty Cap)
    const capDomeGeom = new THREE.SphereGeometry(0.38, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const capDome = new THREE.Mesh(capDomeGeom, this.capMat);
    capDome.position.set(0, 0.1, 0);
    this.headGroup.add(capDome);

    const visorGeom = new THREE.BoxGeometry(0.4, 0.06, 0.3);
    const visor = new THREE.Mesh(visorGeom, this.capMat);
    visor.position.set(0, 0.12, 0.38);
    this.headGroup.add(visor);

    // 3. Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.48, 0.35, 0);
    this.bodyGroup.add(this.leftArmGroup);

    const armGeom = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const lArmMesh = new THREE.Mesh(armGeom, this.shirtMat);
    lArmMesh.position.y = -0.3;
    lArmMesh.castShadow = true;
    this.leftArmGroup.add(lArmMesh);

    // Hand
    const handGeom = new THREE.SphereGeometry(0.12, 6, 6);
    const lHand = new THREE.Mesh(handGeom, this.skinMat);
    lHand.position.y = -0.65;
    this.leftArmGroup.add(lHand);

    // 4. Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.48, 0.35, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rArmMesh = new THREE.Mesh(armGeom, this.shirtMat);
    rArmMesh.position.y = -0.3;
    rArmMesh.castShadow = true;
    this.rightArmGroup.add(rArmMesh);

    const rHand = new THREE.Mesh(handGeom, this.skinMat);
    rHand.position.y = -0.65;
    this.rightArmGroup.add(rHand);

    // 5. Left Leg & Shoe
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.24, -0.4, 0);
    this.bodyGroup.add(this.leftLegGroup);

    const legGeom = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const lLegMesh = new THREE.Mesh(legGeom, this.pantsMat);
    lLegMesh.position.y = -0.35;
    lLegMesh.castShadow = true;
    this.leftLegGroup.add(lLegMesh);

    // Left Shoe
    const shoeGeom = new THREE.BoxGeometry(0.28, 0.18, 0.45);
    const lShoe = new THREE.Mesh(shoeGeom, this.shoeMat);
    lShoe.position.set(0, -0.75, -0.08);
    this.leftLegGroup.add(lShoe);

    const soleGeom = new THREE.BoxGeometry(0.3, 0.06, 0.47);
    const lSole = new THREE.Mesh(soleGeom, this.soleMat);
    lSole.position.set(0, -0.84, -0.08);
    this.leftLegGroup.add(lSole);

    // 6. Right Leg & Shoe
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.24, -0.4, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rLegMesh = new THREE.Mesh(legGeom, this.pantsMat);
    rLegMesh.position.y = -0.35;
    rLegMesh.castShadow = true;
    this.rightLegGroup.add(rLegMesh);

    const rShoe = new THREE.Mesh(shoeGeom, this.shoeMat);
    rShoe.position.set(0, -0.75, -0.08);
    this.rightLegGroup.add(rShoe);

    const rSole = new THREE.Mesh(soleGeom, this.soleMat);
    rSole.position.set(0, -0.84, -0.08);
    this.rightLegGroup.add(rSole);

    // 7. Shield Bubble
    const shieldGeom = new THREE.SphereGeometry(1.5, 20, 20);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00c853,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    this.shieldMesh.position.y = 0.4;
    this.shieldMesh.visible = false;
    this.bodyGroup.add(this.shieldMesh);

    this.group.position.set(0, this.y, 0);
    this.scene.add(this.group);
  }

  moveLeft() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = this.lanes[this.currentLane];
      this.targetTilt = 0.4;
    }
  }

  moveRight() {
    if (this.currentLane < this.lanes.length - 1) {
      this.currentLane++;
      this.targetX = this.lanes[this.currentLane];
      this.targetTilt = -0.4;
    }
  }

  jump() {
    if (this.isGrounded || this.jumpCount < this.maxJumps) {
      const isDouble = !this.isGrounded && this.jumpCount === 1;
      this.vy = this.jumpForce * (isDouble ? 1.08 : 1.0);
      this.isGrounded = false;
      this.jumpCount++;

      if (isDouble) {
        this.spinAngle = Math.PI * 2; // Aerial acrobatic front flip!
      }
      if (window.sound) window.sound.playJump(isDouble);
    }
  }

  launchJumpPad() {
    this.vy = 24.0;
    this.isGrounded = false;
    this.jumpCount = 1;
    this.spinAngle = Math.PI * 2;
    if (window.sound) window.sound.playJumpPad();
  }

  setShield(active) {
    this.isShieldActive = active;
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
    }
  }

  setBoosting(boosting) {
    this.isBoosting = boosting;
  }

  update(delta, particleSystem) {
    // 1. Horizontal Movement (Lerp)
    this.x += (this.targetX - this.x) * 14 * delta;
    this.tiltAngle += (this.targetTilt - this.tiltAngle) * 10 * delta;
    this.targetTilt *= Math.pow(0.05, delta);

    // 2. Vertical Physics
    if (!this.isGrounded) {
      this.vy += this.gravity * delta;
      this.y += this.vy * delta;

      if (this.y <= this.baseY) {
        this.y = this.baseY;
        this.vy = 0;
        this.isGrounded = true;
        this.jumpCount = 0;
      }
    }

    // 3. Humanoid Running & Jumping Animation Cycles
    if (this.isGrounded) {
      // Fast Run Cycle
      const runSpeed = this.isBoosting ? 26 : 18;
      this.runTimer += delta * runSpeed;

      const legAngle = Math.sin(this.runTimer) * 0.75;
      const armAngle = Math.sin(this.runTimer) * 0.65;

      // Arms swing in opposition to legs
      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;
      this.leftArmGroup.rotation.x = -armAngle;
      this.rightArmGroup.rotation.x = armAngle;

      // Natural vertical body bounce
      const bounce = Math.abs(Math.cos(this.runTimer)) * 0.12;
      this.bodyGroup.position.y = 1.35 + bounce;
      this.bodyGroup.rotation.x = this.isBoosting ? 0.35 : 0.12; // Lean forward when sprinting
    } else {
      // Jumping Aerial Pose
      this.leftLegGroup.rotation.x = -0.5;
      this.rightLegGroup.rotation.x = -0.3;
      this.leftArmGroup.rotation.x = -0.7;
      this.rightArmGroup.rotation.x = -0.7;
      this.leftArmGroup.rotation.z = 0.5;
      this.rightArmGroup.rotation.z = -0.5;
      this.bodyGroup.position.y = 1.35;

      // Acrobatic Flip on Double Jump
      if (this.spinAngle > 0) {
        const spinStep = 18 * delta;
        this.bodyGroup.rotation.x += spinStep;
        this.spinAngle -= spinStep;
      } else {
        this.bodyGroup.rotation.x = -0.15;
      }
    }

    // Apply Position & Tilt
    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.z = this.tiltAngle;
    this.group.rotation.y = this.tiltAngle * 0.5;

    // Shield Rotation
    if (this.shieldMesh && this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += 2 * delta;
    }

    // Footstep / Backpack Speed Sparks
    if (particleSystem && Math.random() > 0.2) {
      const sparkColor = this.isBoosting ? 0xff3d00 : 0x4caf50;
      particleSystem.createThrusterSpark(
        new THREE.Vector3(this.x, this.y + 0.6, this.z),
        this.isBoosting,
        sparkColor
      );
    }

    // Box Collider
    this.boxCollider.setFromCenterAndSize(
      new THREE.Vector3(this.x, this.y + 1.1, this.z),
      new THREE.Vector3(1.2, 1.8, 1.2)
    );
  }

  reset() {
    this.currentLane = 1;
    this.targetX = 0;
    this.x = 0;
    this.y = this.baseY;
    this.vy = 0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.tiltAngle = 0;
    this.targetTilt = 0;
    this.runTimer = 0;
    this.spinAngle = 0;
    this.setShield(false);
    this.setBoosting(false);
    this.group.position.set(0, this.baseY, 0);
  }
}
