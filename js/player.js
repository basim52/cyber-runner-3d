/**
 * AAA High-Quality Stylized Human Characters:
 * 1. سامي (Sami): Exact match from photo (Crimson-red hair, denim jacket, khaki pack, compass, burgundy boots)
 * 2. زياد (Ziyad): Parkour Pro (Black undercut, windbreaker, fingerless gloves, neon air sneakers)
 * 3. مريم (Maryam): Safari Explorer (Braided hair, safari jacket, tactical leather belt, rugged boots)
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

    // Character Selection: 'sami' | 'ziyad' | 'maryam'
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
    // 1. Skin Tones
    this.skinBronzeMat = new THREE.MeshStandardMaterial({ color: 0x8a5229, roughness: 0.55, metalness: 0.05 });
    this.skinTanMat = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.55, metalness: 0.05 });
    this.skinWarmMat = new THREE.MeshStandardMaterial({ color: 0x9b6238, roughness: 0.55, metalness: 0.05 });

    // Facial
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    this.eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    this.eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.irisGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.2 });
    this.irisBrownMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.2 });

    // 2. Sami Materials (Exact Reference Match)
    this.samiHairRedMat = new THREE.MeshStandardMaterial({ color: 0xaa2828, roughness: 0.75 });
    this.samiHairDarkMat = new THREE.MeshStandardMaterial({ color: 0x241208, roughness: 0.85 });
    this.samiHeadbandMat = new THREE.MeshStandardMaterial({ color: 0x822222, roughness: 0.65 });
    this.samiDenimMat = new THREE.MeshStandardMaterial({ color: 0x5e85a3, roughness: 0.7 });
    this.samiDenimDarkMat = new THREE.MeshStandardMaterial({ color: 0x486982, roughness: 0.75 });
    this.samiPackCanvasMat = new THREE.MeshStandardMaterial({ color: 0xbf9860, roughness: 0.8 });
    this.samiPackLeatherMat = new THREE.MeshStandardMaterial({ color: 0x6e3d1b, roughness: 0.55 });
    this.samiBrassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    this.samiSilverMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.2 });
    this.samiPantsMat = new THREE.MeshStandardMaterial({ color: 0x383e40, roughness: 0.75 });
    this.samiBootsMat = new THREE.MeshStandardMaterial({ color: 0x7c2626, roughness: 0.5 });
    this.samiSoleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    this.whiteLacesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

    // 3. Ziyad Materials (Parkour Pro Athlete)
    this.ziyadHairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    this.ziyadJacketMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    this.ziyadNeonMat = new THREE.MeshStandardMaterial({ color: 0x76ff03, emissive: 0x64dd17, emissiveIntensity: 0.4, roughness: 0.3 });
    this.ziyadBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.7 });
    this.ziyadPantsMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.8 });
    this.ziyadGloveMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 });
    this.ziyadSneakerMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.4 });

    // 4. Maryam Materials (Safari Explorer Girl)
    this.maryamHairMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.75 });
    this.maryamJacketMat = new THREE.MeshStandardMaterial({ color: 0xd4883b, roughness: 0.7 });
    this.maryamKhakiPantsMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    this.maryamBeltLeatherMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
    this.maryamGoldBuckleMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });
    this.maryamBootsMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 });
  }

  setCharacter(type) {
    this.characterType = type;
    if (this.group) {
      this.scene.remove(this.group);
    }
    this.createMesh();
  }

  setVehicle(type) {
    if (type === 'ziyad' || type === 'phantom') this.setCharacter('ziyad');
    else if (type === 'maryam' || type === 'titan' || type === 'girl') this.setCharacter('maryam');
    else this.setCharacter('sami');
  }

  createMesh() {
    this.group = new THREE.Group();

    // Human Center Root Rig
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.38;
    this.group.add(this.bodyGroup);

    if (this.characterType === 'ziyad') {
      this.buildZiyad();
    } else if (this.characterType === 'maryam') {
      this.buildMaryam();
    } else {
      this.buildSami();
    }

    // Shield Bubble (Energy Barrier)
    const shieldGeom = new THREE.SphereGeometry(1.6, 24, 24);
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

  // 👦 1. Sami
  buildSami() {
    const skin = this.skinBronzeMat;

    // Torso (Stonewash Denim Jacket)
    const torsoGeom = new THREE.CylinderGeometry(0.38, 0.32, 0.86, 20);
    const torso = new THREE.Mesh(torsoGeom, this.samiDenimMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.05, 8, 20), this.samiDenimDarkMat);
    collar.position.set(0, 0.42, 0);
    collar.rotation.x = Math.PI / 2;
    torso.add(collar);

    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 20), this.samiDenimDarkMat);
    hem.position.set(0, -0.40, 0);
    torso.add(hem);

    // Vintage Khaki Backpack
    const packGroup = new THREE.Group();
    packGroup.position.set(0, 0.06, 0.32);
    torso.add(packGroup);

    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.28), this.samiPackCanvasMat);
    packBody.castShadow = true;
    packGroup.add(packBody);

    const flapGeom = new THREE.CylinderGeometry(0.27, 0.27, 0.52, 16, 1, false, 0, Math.PI);
    const flap = new THREE.Mesh(flapGeom, this.samiPackLeatherMat);
    flap.position.set(0, 0.28, 0.02);
    flap.rotation.z = Math.PI / 2;
    flap.rotation.y = Math.PI;
    packGroup.add(flap);

    for (let s = -1; s <= 1; s += 2) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.66, 0.02), this.samiPackLeatherMat);
      strap.position.set(s * 0.14, -0.02, 0.15);
      packGroup.add(strap);

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), this.samiBrassMat);
      buckle.position.set(s * 0.14, 0.04, 0.16);
      packGroup.add(buckle);
    }

    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.22, 0.10), this.samiPackCanvasMat);
    pouch.position.set(0, -0.16, 0.16);
    packGroup.add(pouch);

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 16), skin);
    neck.position.set(0, -0.16, 0);
    this.headGroup.add(neck);

    const headGeom = new THREE.SphereGeometry(0.36, 24, 20);
    headGeom.scale(0.92, 1.05, 0.98);
    const head = new THREE.Mesh(headGeom, skin);
    head.castShadow = true;
    this.headGroup.add(head);

    // Crimson Fade Hair & Maroon Headband
    const baseHair = new THREE.Mesh(new THREE.SphereGeometry(0.37, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.8), this.samiHairDarkMat);
    baseHair.position.set(0, 0.04, 0.02);
    this.headGroup.add(baseHair);

    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.375, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2.2), this.samiHairRedMat);
    hairTop.position.set(0, 0.08, 0.02);
    this.headGroup.add(hairTop);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), this.samiHairRedMat);
        const xPos = (col - 2) * 0.11;
        const zPos = (row - 1.5) * 0.12;
        tuft.position.set(xPos, 0.38 - Math.abs(xPos) * 0.15 - Math.abs(zPos) * 0.1, zPos);
        this.headGroup.add(tuft);
      }
    }

    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.045, 8, 24), this.samiHeadbandMat);
    headband.position.set(0, 0.08, 0.02);
    headband.rotation.x = Math.PI / 2 + 0.12;
    this.headGroup.add(headband);

    // Arms: Rolled sleeves, Watch & Compass
    this.buildSamiArms(skin);

    // Legs: Charcoal pants & Burgundy boots
    this.buildHumanLegs(this.samiPantsMat, this.samiBootsMat, this.samiSoleMat, 'boot');
  }

  buildSamiArms(skin) {
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.46, 0.32, 0);
    this.bodyGroup.add(this.leftArmGroup);

    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.samiDenimMat);
    this.leftArmGroup.add(lShoulder);
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 14), this.samiDenimMat);
    lUpperArm.position.y = -0.16;
    this.leftArmGroup.add(lUpperArm);

    const lCuff = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), this.samiDenimDarkMat);
    lCuff.position.set(0, -0.32, 0);
    lCuff.rotation.x = Math.PI / 2;
    this.leftArmGroup.add(lCuff);

    const lForearmGroup = new THREE.Group();
    lForearmGroup.position.set(0, -0.34, 0);
    this.leftArmGroup.add(lForearmGroup);

    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.36, 14), skin);
    lForearm.position.set(0, -0.16, -0.08);
    lForearm.rotation.x = -0.75;
    lForearmGroup.add(lForearm);

    const watch = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 16), this.samiSilverMat);
    watch.position.set(0, -0.25, -0.14);
    watch.rotation.x = Math.PI / 2 - 0.75;
    lForearmGroup.add(watch);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), skin);
    lHand.position.set(0, -0.28, -0.18);
    lForearmGroup.add(lHand);

    // Brass Compass
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, -0.26, -0.26);
    compassGroup.rotation.x = -0.3;
    lForearmGroup.add(compassGroup);
    const compassBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), this.samiBrassMat);
    compassGroup.add(compassBody);
    const compassFace = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.005, 16), this.whiteLacesMat);
    compassFace.position.y = 0.016;
    compassGroup.add(compassFace);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.46, 0.32, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.samiDenimMat);
    this.rightArmGroup.add(rShoulder);
    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 14), this.samiDenimMat);
    rUpperArm.position.y = -0.16;
    this.rightArmGroup.add(rUpperArm);

    const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), this.samiDenimDarkMat);
    rCuff.position.set(0, -0.32, 0);
    rCuff.rotation.x = Math.PI / 2;
    this.rightArmGroup.add(rCuff);

    const rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0, -0.34, 0);
    this.rightArmGroup.add(rForearmGroup);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.36, 14), skin);
    rForearm.position.set(0, -0.16, -0.08);
    rForearm.rotation.x = -0.65;
    rForearmGroup.add(rForearm);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), skin);
    rHand.position.set(0, -0.28, -0.18);
    rForearmGroup.add(rHand);
  }

  // 🧑 2. Ziyad
  buildZiyad() {
    const skin = this.skinTanMat;

    const torsoGeom = new THREE.CylinderGeometry(0.39, 0.33, 0.88, 20);
    const torso = new THREE.Mesh(torsoGeom, this.ziyadJacketMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.16, 20), this.ziyadBlackMat);
    trim.position.set(0, 0.34, 0);
    torso.add(trim);

    const neonStripe = new THREE.Mesh(new THREE.TorusGeometry(0.395, 0.02, 6, 20), this.ziyadNeonMat);
    neonStripe.position.set(0, 0.26, 0);
    neonStripe.rotation.x = Math.PI / 2;
    torso.add(neonStripe);

    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), this.ziyadJacketMat);
    hood.position.set(0, 0.32, 0.24);
    hood.scale.set(1.0, 0.7, 0.6);
    torso.add(hood);

    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 16), skin);
    neck.position.set(0, -0.16, 0);
    this.headGroup.add(neck);

    const headGeom = new THREE.SphereGeometry(0.36, 24, 20);
    headGeom.scale(0.92, 1.05, 0.98);
    const head = new THREE.Mesh(headGeom, skin);
    head.castShadow = true;
    this.headGroup.add(head);

    const baseHair = new THREE.Mesh(new THREE.SphereGeometry(0.37, 20, 16), this.ziyadHairMat);
    baseHair.position.set(0, 0.04, 0.04);
    this.headGroup.add(baseHair);

    for (let i = 0; i < 6; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.38, 8), this.ziyadHairMat);
      tuft.position.set((i - 2.5) * 0.1, 0.36, -0.06 + (i % 2) * 0.04);
      tuft.rotation.x = -0.45;
      tuft.rotation.z = (i - 2.5) * 0.15;
      this.headGroup.add(tuft);
    }

    this.createStylizedEye(0.12, 0.06, -0.32, this.irisGreenMat);
    this.createStylizedEye(-0.12, 0.06, -0.32, this.irisGreenMat);

    this.buildHumanArms(this.ziyadJacketMat, this.ziyadGloveMat);
    this.buildHumanLegs(this.ziyadPantsMat, this.ziyadNeonMat, this.ziyadBlackMat, 'sneaker');
  }

  // 👩 3. Maryam
  buildMaryam() {
    const skin = this.skinWarmMat;

    const torsoGeom = new THREE.CylinderGeometry(0.36, 0.30, 0.84, 20);
    const torso = new THREE.Mesh(torsoGeom, this.maryamJacketMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 20), this.maryamJacketMat);
    collar.position.set(0, 0.40, 0);
    collar.rotation.x = Math.PI / 2;
    torso.add(collar);

    for (let p = -1; p <= 1; p += 2) {
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), this.maryamJacketMat);
      pocket.position.set(p * 0.18, 0.18, -0.32);
      torso.add(pocket);

      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), this.maryamGoldBuckleMat);
      btn.position.set(p * 0.18, 0.22, -0.35);
      torso.add(btn);
    }

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.12, 20), this.maryamBeltLeatherMat);
    belt.position.set(0, -0.35, 0);
    torso.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.05), this.maryamGoldBuckleMat);
    buckle.position.set(0, -0.35, -0.33);
    torso.add(buckle);

    const sidePouch = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.08), this.maryamBeltLeatherMat);
    sidePouch.position.set(0.32, -0.35, 0);
    torso.add(sidePouch);

    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.66, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.22, 16), skin);
    neck.position.set(0, -0.16, 0);
    this.headGroup.add(neck);

    const headGeom = new THREE.SphereGeometry(0.34, 24, 20);
    headGeom.scale(0.9, 1.05, 0.95);
    const head = new THREE.Mesh(headGeom, skin);
    head.castShadow = true;
    this.headGroup.add(head);

    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), this.maryamHairMat);
    crown.position.set(0, 0.06, 0.04);
    this.headGroup.add(crown);

    for (let b = 0; b < 2; b++) {
      const side = b === 0 ? 1 : -1;
      for (let s = 0; s < 6; s++) {
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.065 - s * 0.007, 8, 8), this.maryamHairMat);
        knot.position.set(side * (0.26 + s * 0.01), -0.04 - s * 0.11, 0.08);
        this.headGroup.add(knot);

        if (s === 4) {
          const tie = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), this.maryamGoldBuckleMat);
          tie.position.set(side * (0.26 + s * 0.01), -0.04 - s * 0.11, 0.08);
          this.headGroup.add(tie);
        }
      }
    }

    this.createStylizedEye(0.11, 0.06, -0.3, this.irisBrownMat);
    this.createStylizedEye(-0.11, 0.06, -0.3, this.irisBrownMat);

    this.buildHumanArms(this.maryamJacketMat, skin);
    this.buildHumanLegs(this.maryamKhakiPantsMat, this.maryamBootsMat, this.maryamBeltLeatherMat, 'boot');
  }

  createStylizedEye(x, y, z, irisMat) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(x, y, z);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), this.eyeWhiteMat);
    sclera.scale.set(1.0, 1.1, 0.4);
    eyeGroup.add(sclera);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), irisMat);
    iris.position.set(0, 0, -0.02);
    iris.scale.set(1.0, 1.0, 0.3);
    eyeGroup.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), this.eyeMat);
    pupil.position.set(0, 0, -0.032);
    pupil.scale.set(1.0, 1.0, 0.2);
    eyeGroup.add(pupil);

    const spec = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), this.eyeHighlightMat);
    spec.position.set(0.015, 0.015, -0.04);
    eyeGroup.add(spec);

    this.headGroup.add(eyeGroup);
  }

  buildHumanArms(sleeveMat, handMat) {
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.46, 0.32, 0);
    this.bodyGroup.add(this.leftArmGroup);

    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), sleeveMat);
    this.leftArmGroup.add(lShoulder);
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 14), sleeveMat);
    lUpperArm.position.y = -0.18;
    this.leftArmGroup.add(lUpperArm);

    const lForearmGroup = new THREE.Group();
    lForearmGroup.position.set(0, -0.34, 0);
    this.leftArmGroup.add(lForearmGroup);

    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 14), sleeveMat);
    lForearm.position.set(0, -0.16, -0.08);
    lForearm.rotation.x = -0.65;
    lForearmGroup.add(lForearm);

    const lFist = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), handMat);
    lFist.position.set(0, -0.28, -0.18);
    lForearmGroup.add(lFist);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.46, 0.32, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), sleeveMat);
    this.rightArmGroup.add(rShoulder);
    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 14), sleeveMat);
    rUpperArm.position.y = -0.18;
    this.rightArmGroup.add(rUpperArm);

    const rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0, -0.34, 0);
    this.rightArmGroup.add(rForearmGroup);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 14), sleeveMat);
    rForearm.position.set(0, -0.16, -0.08);
    rForearm.rotation.x = -0.65;
    rForearmGroup.add(rForearm);

    const rFist = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), handMat);
    rFist.position.set(0, -0.28, -0.18);
    rForearmGroup.add(rFist);
  }

  buildHumanLegs(pantsMat, shoeColorMat, soleMat, type = 'sneaker') {
    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.20, -0.38, 0);
    this.bodyGroup.add(this.leftLegGroup);

    const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 16), pantsMat);
    lThigh.position.y = -0.18;
    this.leftLegGroup.add(lThigh);

    const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), pantsMat);
    lKnee.position.set(0, -0.38, 0.02);
    this.leftLegGroup.add(lKnee);

    const lCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), pantsMat);
    lCalf.position.y = -0.56;
    this.leftLegGroup.add(lCalf);

    this.createFootwear(this.leftLegGroup, shoeColorMat, soleMat, 1, type);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.20, -0.38, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 16), pantsMat);
    rThigh.position.y = -0.18;
    this.rightLegGroup.add(rThigh);

    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), pantsMat);
    rKnee.position.set(0, -0.38, 0.02);
    this.rightLegGroup.add(rKnee);

    const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), pantsMat);
    rCalf.position.y = -0.56;
    this.rightLegGroup.add(rCalf);

    this.createFootwear(this.rightLegGroup, shoeColorMat, soleMat, -1, type);
  }

  createFootwear(parentLeg, shoeColorMat, soleMat, side, type) {
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.74, -0.06);
    parentLeg.add(shoeGroup);

    const soleGeom = new THREE.BoxGeometry(0.24, 0.08, 0.46);
    const sole = new THREE.Mesh(soleGeom, soleMat);
    sole.position.y = -0.06;
    shoeGroup.add(sole);

    const upperGeom = new THREE.CylinderGeometry(0.11, 0.12, 0.18, 14);
    upperGeom.scale(1.0, 1.0, 1.4);
    const upper = new THREE.Mesh(upperGeom, shoeColorMat);
    upper.position.set(0, 0.04, -0.02);
    shoeGroup.add(upper);

    const toeGeom = new THREE.SphereGeometry(0.11, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    toeGeom.scale(1.05, 0.8, 1.1);
    const toe = new THREE.Mesh(toeGeom, shoeColorMat);
    toe.position.set(0, 0.0, -0.16);
    toe.rotation.x = Math.PI;
    shoeGroup.add(toe);

    if (type === 'sneaker') {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.22), soleMat);
      stripe.position.set(side * 0.12, 0.04, 0);
      shoeGroup.add(stripe);
    }
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
        this.spinAngle = Math.PI * 2;
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
    // 1. Horizontal Movement (Smooth Lerp)
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

      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;
      this.leftArmGroup.rotation.x = -armAngle;
      this.rightArmGroup.rotation.x = armAngle;

      this.bodyGroup.rotation.y = -legAngle * 0.12;

      const bounce = Math.abs(Math.cos(this.runTimer)) * 0.12;
      this.bodyGroup.position.y = 1.38 + bounce;
      this.bodyGroup.rotation.x = this.isBoosting ? 0.35 : 0.12;
    } else {
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
