/**
 * 3D Human Runner Characters (Sami, Lana, Ziyad, Maryam)
 * Anatomically detailed human rigs with realistic athletic running & jumping cycles.
 */
class Player {
  constructor(scene) {
    this.scene = scene;
    
    // 3 Lanes
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
    this.jumpForce = 14.0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2;

    this.tiltAngle = 0;
    this.targetTilt = 0;
    this.runTimer = 0;
    this.spinAngle = 0;

    // Character: 'sami' | 'lana' | 'ziyad' | 'maryam'
    this.characterType = 'sami';

    // Upgrades
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
    // Skin Tones
    this.skinLightMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.65 }); // Natural warm skin
    this.skinTanMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.65 });   // Sun-kissed tan skin
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    this.lipMat = new THREE.MeshStandardMaterial({ color: 0xd48c80, roughness: 0.7 });

    // Character 1: سامي (Sami - The Urban Runner Boy)
    this.samiHairMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 }); // Dark Brown
    this.samiShirtMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.7 }); // Royal Blue Hoodie
    this.samiPantsMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.8 }); // Dark Joggers
    this.samiShoeMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.5 });  // Red Runners
    this.samiCapMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6 });
    this.samiPackMat = new THREE.MeshStandardMaterial({ color: 0xf57c00, roughness: 0.8 });

    // Character 2: لانا (Lana - The Athletic Girl)
    this.lanaHairMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.6 }); // Golden Blonde
    this.lanaShirtMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.6 }); // Magenta Athletic Top
    this.lanaPantsMat = new THREE.MeshStandardMaterial({ color: 0x4a148c, roughness: 0.7 }); // Deep Purple Leggings
    this.lanaShoeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.5 });  // Cyan Runners
    this.lanaBandMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.5 });

    // Character 3: زياد (Ziyad - Parkour Athlete Boy)
    this.ziyadHairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }); // Jet Black Undercut
    this.ziyadShirtMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 }); // Forest Green Windbreaker
    this.ziyadPantsMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.8 }); // Cargo Grey
    this.ziyadShoeMat = new THREE.MeshStandardMaterial({ color: 0x76ff03, roughness: 0.5 });  // Neon Green Runners
    this.ziyadGloveMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 });

    // Character 4: مريم (Maryam - Explorer Girl)
    this.maryamHairMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 }); // Chestnut Braids
    this.maryamShirtMat = new THREE.MeshStandardMaterial({ color: 0xf57f17, roughness: 0.7 }); // Amber Explorer Jacket
    this.maryamPantsMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 }); // Earth Brown
    this.maryamShoeMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 });  // Adventure Boots
    this.maryamBeltMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });

    this.whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  }

  setCharacter(type) {
    this.characterType = type;
    if (this.group) {
      this.scene.remove(this.group);
    }
    this.createMesh();
  }

  setVehicle(type) {
    if (type === 'titan' || type === 'girl' || type === 'lana') this.setCharacter('lana');
    else if (type === 'phantom' || type === 'ziyad') this.setCharacter('ziyad');
    else if (type === 'fox' || type === 'maryam') this.setCharacter('maryam');
    else this.setCharacter('sami');
  }

  createMesh() {
    this.group = new THREE.Group();

    // Human Center Root Rig
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.38; // Human Center of Mass
    this.group.add(this.bodyGroup);

    if (this.characterType === 'lana') {
      this.buildLana();
    } else if (this.characterType === 'ziyad') {
      this.buildZiyad();
    } else if (this.characterType === 'maryam') {
      this.buildMaryam();
    } else {
      this.buildSami();
    }

    // Shield Bubble (Energy Barrier)
    const shieldGeom = new THREE.SphereGeometry(1.6, 20, 20);
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
    this.shieldMesh.position.y = 0.35;
    this.shieldMesh.visible = false;
    this.bodyGroup.add(this.shieldMesh);

    this.group.position.set(0, this.y, 0);
    this.scene.add(this.group);
  }

  // =========================================================================
  // 👦 1. سامي (Sami - The Urban Runner Boy)
  // =========================================================================
  buildSami() {
    const skin = this.skinLightMat;

    // 1. Torso & Hoodie
    const torsoGeom = new THREE.BoxGeometry(0.72, 0.85, 0.44);
    const torso = new THREE.Mesh(torsoGeom, this.samiShirtMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.46), this.whiteMat);
    collar.position.set(0, 0.4, 0.01);
    torso.add(collar);

    // Adventurer Backpack
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.28), this.samiPackMat);
    pack.position.set(0, 0.05, 0.34);
    pack.castShadow = true;
    torso.add(pack);

    // 2. Head & Neck
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.bodyGroup.add(this.headGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 8), skin);
    neck.position.set(0, -0.15, 0);
    this.headGroup.add(neck);

    // Human Head Sphere with Jaw
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), skin);
    this.headGroup.add(head);

    // Eyes
    const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), this.eyeMat);
    lEye.position.set(0.12, 0.04, -0.32);
    this.headGroup.add(lEye);
    const rEye = lEye.clone();
    rEye.position.set(-0.12, 0.04, -0.32);
    this.headGroup.add(rEye);

    // Hair
    const hair = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), this.samiHairMat);
    hair.position.set(0, 0.08, 0.04);
    this.headGroup.add(hair);

    // Sporty Cap
    const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.samiCapMat);
    capDome.position.set(0, 0.1, 0);
    this.headGroup.add(capDome);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.3), this.samiCapMat);
    visor.position.set(0, 0.12, 0.38);
    this.headGroup.add(visor);

    // 3. Human Arms (Articulated with bent elbows)
    this.buildHumanArms(this.samiShirtMat, skin);

    // 4. Human Legs (Thighs + Calves + Running Sneakers)
    this.buildHumanLegs(this.samiPantsMat, this.samiShoeMat);
  }

  // =========================================================================
  // 👧 2. لانا (Lana - The Athletic Girl)
  // =========================================================================
  buildLana() {
    const skin = this.skinLightMat;

    // 1. Sporty Torso
    const torsoGeom = new THREE.BoxGeometry(0.66, 0.8, 0.38);
    const torso = new THREE.Mesh(torsoGeom, this.lanaShirtMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // 2. Head & High Ponytail
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.63, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8), skin);
    neck.position.set(0, -0.15, 0);
    this.headGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 14, 14), skin);
    this.headGroup.add(head);

    // Eyes
    const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), this.eyeMat);
    lEye.position.set(0.11, 0.04, -0.3);
    this.headGroup.add(lEye);
    const rEye = lEye.clone();
    rEye.position.set(-0.11, 0.04, -0.3);
    this.headGroup.add(rEye);

    // Blonde Hair & Flowing Ponytail
    const hair = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 1), this.lanaHairMat);
    hair.position.set(0, 0.06, 0.03);
    this.headGroup.add(hair);

    // High Ponytail
    const pony = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.7, 8), this.lanaHairMat);
    pony.position.set(0, 0.18, 0.45);
    pony.rotation.x = -0.65;
    this.headGroup.add(pony);

    // Sporty Headband
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 6, 16), this.lanaBandMat);
    band.position.set(0, 0.08, 0);
    band.rotation.x = Math.PI / 2;
    this.headGroup.add(band);

    // 3. Arms & Legs
    this.buildHumanArms(this.lanaShirtMat, skin);
    this.buildHumanLegs(this.lanaPantsMat, this.lanaShoeMat);
  }

  // =========================================================================
  // 🧑 3. زياد (Ziyad - Parkour Athlete Boy)
  // =========================================================================
  buildZiyad() {
    const skin = this.skinTanMat;

    // 1. Windbreaker Torso
    const torsoGeom = new THREE.BoxGeometry(0.74, 0.86, 0.44);
    const torso = new THREE.Mesh(torsoGeom, this.ziyadShirtMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // 2. Head & Modern Undercut Hair
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 8), skin);
    neck.position.set(0, -0.15, 0);
    this.headGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), skin);
    this.headGroup.add(head);

    const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), this.eyeMat);
    lEye.position.set(0.12, 0.04, -0.32);
    this.headGroup.add(lEye);
    const rEye = lEye.clone();
    rEye.position.set(-0.12, 0.04, -0.32);
    this.headGroup.add(rEye);

    // Stylish Black Hair Undercut
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), this.ziyadHairMat);
    hairTop.position.set(0, 0.32, -0.05);
    this.headGroup.add(hairTop);

    // 3. Arms with Fingerless Gloves
    this.buildHumanArms(this.ziyadShirtMat, this.ziyadGloveMat);
    this.buildHumanLegs(this.ziyadPantsMat, this.ziyadShoeMat);
  }

  // =========================================================================
  // 👩 4. مريم (Maryam - Explorer Girl)
  // =========================================================================
  buildMaryam() {
    const skin = this.skinTanMat;

    // 1. Explorer Jacket Torso
    const torsoGeom = new THREE.BoxGeometry(0.68, 0.82, 0.4);
    const torso = new THREE.Mesh(torsoGeom, this.maryamShirtMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Tactical Leather Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.44), this.maryamBeltMat);
    belt.position.set(0, -0.35, 0);
    torso.add(belt);

    // 2. Head & Braided Hair
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.64, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.2, 8), skin);
    neck.position.set(0, -0.15, 0);
    this.headGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 14), skin);
    this.headGroup.add(head);

    const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), this.eyeMat);
    lEye.position.set(0.11, 0.04, -0.31);
    this.headGroup.add(lEye);
    const rEye = lEye.clone();
    rEye.position.set(-0.11, 0.04, -0.31);
    this.headGroup.add(rEye);

    // Braids
    const hair = new THREE.Mesh(new THREE.DodecahedronGeometry(0.37, 1), this.maryamHairMat);
    hair.position.set(0, 0.07, 0.03);
    this.headGroup.add(hair);

    const lBraid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.6, 6), this.maryamHairMat);
    lBraid.position.set(0.3, -0.1, 0.1);
    this.headGroup.add(lBraid);

    const rBraid = lBraid.clone();
    rBraid.position.set(-0.3, -0.1, 0.1);
    this.headGroup.add(rBraid);

    // 3. Arms & Boots
    this.buildHumanArms(this.maryamShirtMat, skin);
    this.buildHumanLegs(this.maryamPantsMat, this.maryamShoeMat);
  }

  // =========================================================================
  // Human Arm Rigging with Sprinter Elbow Bend
  // =========================================================================
  buildHumanArms(sleeveMat, handMat) {
    // Left Arm Hierarchy (Shoulder -> Upper Arm -> Forearm -> Hand)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.46, 0.32, 0);
    this.bodyGroup.add(this.leftArmGroup);

    const upperArmGeom = new THREE.BoxGeometry(0.18, 0.38, 0.18);
    const lUpperArm = new THREE.Mesh(upperArmGeom, sleeveMat);
    lUpperArm.position.y = -0.16;
    lUpperArm.castShadow = true;
    this.leftArmGroup.add(lUpperArm);

    // Forearm bent at elbow
    const forearmGeom = new THREE.BoxGeometry(0.16, 0.36, 0.16);
    const lForearm = new THREE.Mesh(forearmGeom, sleeveMat);
    lForearm.position.set(0, -0.38, -0.1);
    lForearm.rotation.x = -0.55; // Natural running arm bend
    lForearm.castShadow = true;
    this.leftArmGroup.add(lForearm);

    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), handMat);
    hand.position.set(0, -0.52, -0.2);
    this.leftArmGroup.add(hand);

    // Right Arm Hierarchy
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.46, 0.32, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rUpperArm = new THREE.Mesh(upperArmGeom, sleeveMat);
    rUpperArm.position.y = -0.16;
    rUpperArm.castShadow = true;
    this.rightArmGroup.add(rUpperArm);

    const rForearm = new THREE.Mesh(forearmGeom, sleeveMat);
    rForearm.position.set(0, -0.38, -0.1);
    rForearm.rotation.x = -0.55;
    rForearm.castShadow = true;
    this.rightArmGroup.add(rForearm);

    const rHand = hand.clone();
    rHand.position.set(0, -0.52, -0.2);
    this.rightArmGroup.add(rHand);
  }

  // =========================================================================
  // Human Leg Rigging with Thigh, Calf & Runner Sneakers
  // =========================================================================
  buildHumanLegs(pantsMat, shoeMat) {
    const legWidth = 0.22;
    const legLength = 0.72;

    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.22, -0.38, 0);
    this.bodyGroup.add(this.leftLegGroup);

    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(legWidth, legLength, legWidth), pantsMat);
    lLeg.position.y = -0.32;
    lLeg.castShadow = true;
    this.leftLegGroup.add(lLeg);

    // Running Sneaker
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), shoeMat);
    lShoe.position.set(0, -0.72, -0.06);
    this.leftLegGroup.add(lShoe);

    const lSole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.46), this.whiteMat);
    lSole.position.set(0, -0.81, -0.06);
    this.leftLegGroup.add(lSole);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.22, -0.38, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(legWidth, legLength, legWidth), pantsMat);
    rLeg.position.y = -0.32;
    rLeg.castShadow = true;
    this.rightLegGroup.add(rLeg);

    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), shoeMat);
    rShoe.position.set(0, -0.72, -0.06);
    this.rightLegGroup.add(rShoe);

    const rSole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.46), this.whiteMat);
    rSole.position.set(0, -0.81, -0.06);
    this.rightLegGroup.add(rSole);
  }

  moveLeft() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = this.lanes[this.currentLane];
      this.targetTilt = 0.35;
    }
  }

  moveRight() {
    if (this.currentLane < this.lanes.length - 1) {
      this.currentLane++;
      this.targetX = this.lanes[this.currentLane];
      this.targetTilt = -0.35;
    }
  }

  jump() {
    if (this.isGrounded || this.jumpCount < this.maxJumps) {
      const isDouble = !this.isGrounded && this.jumpCount === 1;
      this.vy = this.jumpForce * (isDouble ? 1.08 : 1.0);
      this.isGrounded = false;
      this.jumpCount++;

      if (isDouble) {
        this.spinAngle = Math.PI * 2; // Acrobatic parkour front flip
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

    // 3. Humanoid Sprinting & Jumping Kinematics
    if (this.isGrounded) {
      const runSpeed = this.isBoosting ? 26 : 18;
      this.runTimer += delta * runSpeed;

      const legAngle = Math.sin(this.runTimer) * 0.75;
      const armAngle = Math.sin(this.runTimer) * 0.7;

      // Human Arms Pump in opposition to legs
      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;
      this.leftArmGroup.rotation.x = -armAngle;
      this.rightArmGroup.rotation.x = armAngle;

      // Subtle torso twisting for human realism
      this.bodyGroup.rotation.y = -legAngle * 0.12;

      // Center of mass vertical bounce
      const bounce = Math.abs(Math.cos(this.runTimer)) * 0.12;
      this.bodyGroup.position.y = 1.38 + bounce;
      this.bodyGroup.rotation.x = this.isBoosting ? 0.35 : 0.12; // Forward lean
    } else {
      // Jump Pose
      this.leftLegGroup.rotation.x = -0.5;
      this.rightLegGroup.rotation.x = -0.3;
      this.leftArmGroup.rotation.x = -0.7;
      this.rightArmGroup.rotation.x = -0.7;
      this.leftArmGroup.rotation.z = 0.45;
      this.rightArmGroup.rotation.z = -0.45;
      this.bodyGroup.position.y = 1.38;

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

    if (this.shieldMesh && this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += 2 * delta;
    }

    if (particleSystem && Math.random() > 0.2) {
      const sparkColor = this.isBoosting ? 0xff3d00 : 0x4caf50;
      particleSystem.createThrusterSpark(
        new THREE.Vector3(this.x, this.y + 0.6, this.z),
        this.isBoosting,
        sparkColor
      );
    }

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
