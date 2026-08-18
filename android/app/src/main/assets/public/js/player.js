/**
 * AAA Stylized 3D Human Runner Characters (Sami, Lana, Ziyad, Maryam)
 * Built with smooth organic geometries, expressive sculpted faces, layered hair, and high-top sneakers.
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
    // 1. Organic Skin Materials
    this.skinLightMat = new THREE.MeshStandardMaterial({
      color: 0xffdfc4,
      roughness: 0.5,
      metalness: 0.05
    });
    this.skinTanMat = new THREE.MeshStandardMaterial({
      color: 0xe5a663,
      roughness: 0.5,
      metalness: 0.05
    });

    // 2. Facial Features
    this.eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    this.eyeIrisBlueMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.2 });
    this.eyeIrisGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.2 });
    this.eyeIrisBrownMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.2 });
    this.pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    this.eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.eyebrowMat = new THREE.MeshStandardMaterial({ color: 0x2d1a0e, roughness: 0.8 });
    this.lipMat = new THREE.MeshStandardMaterial({ color: 0xd37d73, roughness: 0.6 });

    // 3. Fabrics & Clothes
    this.whiteFabricMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });
    this.blackFabricMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.8 });
    this.goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });

    // Sami Materials (Urban Runner)
    this.samiHairMat = new THREE.MeshStandardMaterial({ color: 0x422613, roughness: 0.6 });
    this.samiHoodieMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.65 });
    this.samiJoggersMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.8 });
    this.samiSneakerRedMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.4 });
    this.samiCapMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 });
    this.samiPackMat = new THREE.MeshStandardMaterial({ color: 0xf57c00, roughness: 0.7 });

    // Lana Materials (Athletic Pro)
    this.lanaHairMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.45 });
    this.lanaTopMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.6 });
    this.lanaLeggingsMat = new THREE.MeshStandardMaterial({ color: 0x4a148c, roughness: 0.7 });
    this.lanaSneakerCyanMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.35 });
    this.lanaBandMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.4 });

    // Ziyad Materials (Parkour Pro)
    this.ziyadHairMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.7 });
    this.ziyadJacketMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    this.ziyadPantsMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.8 });
    this.ziyadSneakerNeonMat = new THREE.MeshStandardMaterial({ color: 0x76ff03, roughness: 0.35 });
    this.ziyadGloveMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 });

    // Maryam Materials (Desert Explorer)
    this.maryamHairMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
    this.maryamJacketMat = new THREE.MeshStandardMaterial({ color: 0xf57f17, roughness: 0.7 });
    this.maryamPantsMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    this.maryamBootsMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.6 });
    this.maryamBeltMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
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
    this.bodyGroup.position.y = 1.38;
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

    // Shield Bubble (Smooth Glowing Energy Barrier)
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

  // =========================================================================
  // 👦 1. سامي (Sami - High Quality Stylized Urban Runner)
  // =========================================================================
  buildSami() {
    const skin = this.skinLightMat;

    // 1. Smooth Tapered Torso (Hoodie with depth and curves)
    const torsoGeom = new THREE.CylinderGeometry(0.38, 0.32, 0.88, 20);
    const torso = new THREE.Mesh(torsoGeom, this.samiHoodieMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // White Inner Shirt Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 20), this.whiteFabricMat);
    collar.position.set(0, 0.42, 0);
    collar.rotation.x = Math.PI / 2;
    torso.add(collar);

    // Front Zipper Line & Pocket
    const zipper = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 6), this.whiteFabricMat);
    zipper.position.set(0, 0.02, -0.34);
    torso.add(zipper);

    // Smooth Curved Backpack
    const packGeom = new THREE.SphereGeometry(0.34, 16, 16);
    packGeom.scale(1.0, 1.2, 0.65);
    const pack = new THREE.Mesh(packGeom, this.samiPackMat);
    pack.position.set(0, 0.08, 0.32);
    pack.castShadow = true;
    torso.add(pack);

    // Backpack Shoulder Straps
    const strapL = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 6, 16, Math.PI), this.blackFabricMat);
    strapL.position.set(0.24, 0.15, 0.05);
    strapL.rotation.y = Math.PI / 2;
    torso.add(strapL);
    const strapR = strapL.clone();
    strapR.position.set(-0.24, 0.15, 0.05);
    torso.add(strapR);

    // 2. Sculpted Expressive Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0);
    this.bodyGroup.add(this.headGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 16), skin);
    neck.position.set(0, -0.16, 0);
    this.headGroup.add(neck);

    // Smooth Oval Head with jaw curve
    const headGeom = new THREE.SphereGeometry(0.36, 24, 20);
    headGeom.scale(0.92, 1.05, 0.98);
    const head = new THREE.Mesh(headGeom, skin);
    head.castShadow = true;
    this.headGroup.add(head);

    // 3D Cute Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 8), skin);
    nose.position.set(0, -0.02, -0.36);
    nose.rotation.x = -Math.PI / 2;
    this.headGroup.add(nose);

    // Detailed Animated Eyes (Left & Right)
    this.createStylizedEye(0.12, 0.06, -0.32, this.eyeIrisBlueMat);
    this.createStylizedEye(-0.12, 0.06, -0.32, this.eyeIrisBlueMat);

    // Eyebrows
    const browGeom = new THREE.BoxGeometry(0.12, 0.03, 0.04);
    const lBrow = new THREE.Mesh(browGeom, this.eyebrowMat);
    lBrow.position.set(0.12, 0.15, -0.34);
    lBrow.rotation.z = -0.1;
    this.headGroup.add(lBrow);

    const rBrow = new THREE.Mesh(browGeom, this.eyebrowMat);
    rBrow.position.set(-0.12, 0.15, -0.34);
    rBrow.rotation.z = 0.1;
    this.headGroup.add(rBrow);

    // Sculpted Ears
    const earGeom = new THREE.TorusGeometry(0.07, 0.025, 8, 12, Math.PI * 1.2);
    const lEar = new THREE.Mesh(earGeom, skin);
    lEar.position.set(0.34, 0.02, 0);
    lEar.rotation.y = Math.PI / 2;
    this.headGroup.add(lEar);

    const rEar = new THREE.Mesh(earGeom, skin);
    rEar.position.set(-0.34, 0.02, 0);
    rEar.rotation.y = -Math.PI / 2;
    this.headGroup.add(rEar);

    // Layered Hair Tufts
    this.buildLayeredHair(this.samiHairMat, 'boy');

    // Curved Baseball Cap
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      this.samiCapMat
    );
    capDome.position.set(0, 0.1, 0.02);
    capDome.rotation.x = -0.2;
    this.headGroup.add(capDome);

    // Curved Visor Brim
    const visorGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 16, 1, false, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeom, this.samiCapMat);
    visor.position.set(0, 0.14, 0.25);
    visor.rotation.x = 0.35;
    this.headGroup.add(visor);

    // Cap Button on top
    const capBtn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), this.whiteFabricMat);
    capBtn.position.set(0, 0.48, 0.06);
    this.headGroup.add(capBtn);

    // 3. Human Arms with Sprinter Elbows & Clenched Fists
    this.buildHumanArms(this.samiHoodieMat, skin);

    // 4. Human Legs with High-Top Stylized Sneakers
    this.buildHumanLegs(this.samiJoggersMat, this.samiSneakerRedMat, this.whiteFabricMat);
  }

  // =========================================================================
  // 👧 2. لانا (Lana - High Quality Stylized Athletic Girl)
  // =========================================================================
  buildLana() {
    const skin = this.skinLightMat;

    // 1. Athletic Top Torso
    const torsoGeom = new THREE.CylinderGeometry(0.34, 0.28, 0.82, 20);
    const torso = new THREE.Mesh(torsoGeom, this.lanaTopMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Neckline
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 20), this.whiteFabricMat);
    collar.position.set(0, 0.4, 0);
    collar.rotation.x = Math.PI / 2;
    torso.add(collar);

    // 2. Sculpted Girl Head & High Ponytail
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.66, 0);
    this.bodyGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.22, 16), skin);
    neck.position.set(0, -0.16, 0);
    this.headGroup.add(neck);

    const headGeom = new THREE.SphereGeometry(0.34, 24, 20);
    headGeom.scale(0.9, 1.05, 0.95);
    const head = new THREE.Mesh(headGeom, skin);
    head.castShadow = true;
    this.headGroup.add(head);

    // 3D Cute Nose & Lips
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 8), skin);
    nose.position.set(0, -0.02, -0.34);
    nose.rotation.x = -Math.PI / 2;
    this.headGroup.add(nose);

    const lips = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 12, Math.PI), this.lipMat);
    lips.position.set(0, -0.12, -0.32);
    lips.rotation.x = Math.PI;
    this.headGroup.add(lips);

    // Expressive Green Eyes
    this.createStylizedEye(0.11, 0.06, -0.3, this.eyeIrisGreenMat);
    this.createStylizedEye(-0.11, 0.06, -0.3, this.eyeIrisGreenMat);

    // Sculpted Blonde Hair with High Flowing Ponytail
    this.buildLayeredHair(this.lanaHairMat, 'girl');

    // Sporty Headband
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 6, 20), this.lanaBandMat);
    band.position.set(0, 0.08, 0);
    band.rotation.x = Math.PI / 2;
    this.headGroup.add(band);

    // 3. Arms & High-Top Sneakers
    this.buildHumanArms(this.lanaTopMat, skin);
    this.buildHumanLegs(this.lanaLeggingsMat, this.lanaSneakerCyanMat, this.whiteFabricMat);
  }

  // =========================================================================
  // 🧑 3. زياد (Ziyad - Stylized Parkour Pro Boy)
  // =========================================================================
  buildZiyad() {
    const skin = this.skinTanMat;

    // 1. Windbreaker Torso
    const torsoGeom = new THREE.CylinderGeometry(0.39, 0.33, 0.88, 20);
    const torso = new THREE.Mesh(torsoGeom, this.ziyadJacketMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Contrast Shoulders / Trim
    const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.15, 20), this.blackFabricMat);
    trim.position.set(0, 0.35, 0);
    torso.add(trim);

    // 2. Sculpted Head & Undercut Hairstyle
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

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 8), skin);
    nose.position.set(0, -0.02, -0.36);
    nose.rotation.x = -Math.PI / 2;
    this.headGroup.add(nose);

    this.createStylizedEye(0.12, 0.06, -0.32, this.eyeIrisBrownMat);
    this.createStylizedEye(-0.12, 0.06, -0.32, this.eyeIrisBrownMat);

    // Modern Undercut Sculpted Hair
    this.buildLayeredHair(this.ziyadHairMat, 'undercut');

    // 3. Arms with Fingerless Gloves
    this.buildHumanArms(this.ziyadJacketMat, this.ziyadGloveMat);
    this.buildHumanLegs(this.ziyadPantsMat, this.ziyadSneakerNeonMat, this.blackFabricMat);
  }

  // =========================================================================
  // 👩 4. مريم (Maryam - Stylized Desert Explorer Girl)
  // =========================================================================
  buildMaryam() {
    const skin = this.skinTanMat;

    // 1. Explorer Jacket Torso
    const torsoGeom = new THREE.CylinderGeometry(0.35, 0.30, 0.84, 20);
    const torso = new THREE.Mesh(torsoGeom, this.maryamJacketMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Leather Tactical Belt & Buckle
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.12, 20), this.maryamBeltMat);
    belt.position.set(0, -0.35, 0);
    torso.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), this.goldTrimMat);
    buckle.position.set(0, -0.35, -0.33);
    torso.add(buckle);

    // 2. Sculpted Head & Braided Hair
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

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 8), skin);
    nose.position.set(0, -0.02, -0.34);
    nose.rotation.x = -Math.PI / 2;
    this.headGroup.add(nose);

    this.createStylizedEye(0.11, 0.06, -0.3, this.eyeIrisBrownMat);
    this.createStylizedEye(-0.11, 0.06, -0.3, this.eyeIrisBrownMat);

    // Braided Explorer Hair
    this.buildLayeredHair(this.maryamHairMat, 'braids');

    // 3. Arms & Hiking Boots
    this.buildHumanArms(this.maryamJacketMat, skin);
    this.buildHumanLegs(this.maryamPantsMat, this.maryamBootsMat, this.maryamBeltMat);
  }

  // =========================================================================
  // Helper: Stylized Eye with Sclera, Iris, Pupil & Specular Light Reflection
  // =========================================================================
  createStylizedEye(x, y, z, irisMat) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(x, y, z);

    // White Sclera
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), this.eyeWhiteMat);
    sclera.scale.set(1.0, 1.1, 0.4);
    eyeGroup.add(sclera);

    // Vibrant Iris
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), irisMat);
    iris.position.set(0, 0, -0.02);
    iris.scale.set(1.0, 1.0, 0.3);
    eyeGroup.add(iris);

    // Dark Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), this.pupilMat);
    pupil.position.set(0, 0, -0.032);
    pupil.scale.set(1.0, 1.0, 0.2);
    eyeGroup.add(pupil);

    // Specular Highlight Sparkle
    const spec = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), this.eyeHighlightMat);
    spec.position.set(0.015, 0.015, -0.04);
    eyeGroup.add(spec);

    this.headGroup.add(eyeGroup);
  }

  // =========================================================================
  // Helper: Multi-Layered Sculpted Volumetric Hair
  // =========================================================================
  buildLayeredHair(hairMat, style) {
    const hairGroup = new THREE.Group();
    this.headGroup.add(hairGroup);

    if (style === 'girl') {
      // High Flowing Ponytail & Front Bangs
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), hairMat);
      crown.position.set(0, 0.06, 0.04);
      hairGroup.add(crown);

      // Ponytail Tail
      const ponyGeom = new THREE.ConeGeometry(0.16, 0.8, 12);
      const pony = new THREE.Mesh(ponyGeom, hairMat);
      pony.position.set(0, 0.18, 0.48);
      pony.rotation.x = -0.75;
      hairGroup.add(pony);

      // Side strands
      const strandL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 6), hairMat);
      strandL.position.set(0.28, -0.05, -0.15);
      strandL.rotation.z = -0.2;
      hairGroup.add(strandL);
      const strandR = strandL.clone();
      strandR.position.set(-0.28, -0.05, -0.15);
      strandR.rotation.z = 0.2;
      hairGroup.add(strandR);
    } else if (style === 'undercut') {
      // Modern Undercut Quiff
      for (let i = 0; i < 5; i++) {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), hairMat);
        tuft.position.set((i - 2) * 0.1, 0.34, -0.08 + (i % 2) * 0.04);
        tuft.rotation.x = -0.4;
        tuft.rotation.z = (i - 2) * 0.15;
        hairGroup.add(tuft);
      }
      const back = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hairMat);
      back.position.set(0, 0.04, 0.08);
      hairGroup.add(back);
    } else if (style === 'braids') {
      // Crown & Two Long Braids
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), hairMat);
      crown.position.set(0, 0.06, 0.04);
      hairGroup.add(crown);

      for (let b = 0; b < 2; b++) {
        const side = b === 0 ? 1 : -1;
        for (let s = 0; s < 5; s++) {
          const knot = new THREE.Mesh(new THREE.SphereGeometry(0.07 - s * 0.008, 8, 8), hairMat);
          knot.position.set(side * (0.28 + s * 0.02), -0.05 - s * 0.1, 0.1);
          hairGroup.add(knot);
        }
      }
    } else {
      // Sami's Layered Urban Hair
      const base = new THREE.Mesh(new THREE.SphereGeometry(0.37, 16, 16), hairMat);
      base.position.set(0, 0.06, 0.04);
      hairGroup.add(base);

      for (let i = 0; i < 6; i++) {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), hairMat);
        tuft.position.set((i - 2.5) * 0.09, 0.26, -0.22);
        tuft.rotation.x = -0.6;
        tuft.rotation.z = (i - 2.5) * 0.15;
        hairGroup.add(tuft);
      }
    }
  }

  // =========================================================================
  // Helper: Anatomical Human Arms with Sprinter Elbow Bends & Stylized Fists
  // =========================================================================
  buildHumanArms(sleeveMat, handMat) {
    // 1. Left Arm Hierarchy (Shoulder -> Upper Arm -> Forearm -> Fist)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.46, 0.32, 0);
    this.bodyGroup.add(this.leftArmGroup);

    // Shoulder Deltoid
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), sleeveMat);
    this.leftArmGroup.add(shoulder);

    // Upper Arm (Smooth Cylinder)
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 14), sleeveMat);
    upperArm.position.y = -0.18;
    upperArm.castShadow = true;
    this.leftArmGroup.add(upperArm);

    // Forearm (Bent forward at elbow in athletic running posture)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.34, 0);
    this.leftArmGroup.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 14), sleeveMat);
    forearm.position.set(0, -0.16, -0.08);
    forearm.rotation.x = -0.65; // Natural Sprinter Arm Bend
    forearm.castShadow = true;
    forearmGroup.add(forearm);

    // Sculpted Closed Fist with Thumb
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), handMat);
    fist.position.set(0, -0.28, -0.18);
    fist.scale.set(1.0, 1.1, 1.0);
    forearmGroup.add(fist);

    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), handMat);
    thumb.position.set(-0.06, -0.26, -0.17);
    forearmGroup.add(thumb);

    // 2. Right Arm Hierarchy
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.46, 0.32, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), sleeveMat);
    this.rightArmGroup.add(rShoulder);

    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 14), sleeveMat);
    rUpperArm.position.y = -0.18;
    rUpperArm.castShadow = true;
    this.rightArmGroup.add(rUpperArm);

    const rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0, -0.34, 0);
    this.rightArmGroup.add(rForearmGroup);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 14), sleeveMat);
    rForearm.position.set(0, -0.16, -0.08);
    rForearm.rotation.x = -0.65;
    rForearm.castShadow = true;
    rForearmGroup.add(rForearm);

    const rFist = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), handMat);
    rFist.position.set(0, -0.28, -0.18);
    rFist.scale.set(1.0, 1.1, 1.0);
    rForearmGroup.add(rFist);

    const rThumb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), handMat);
    rThumb.position.set(0.06, -0.26, -0.17);
    rForearmGroup.add(rThumb);
  }

  // =========================================================================
  // Helper: Anatomical Human Legs with Pro High-Top Stylized Sneakers
  // =========================================================================
  buildHumanLegs(pantsMat, shoeColorMat, soleMat) {
    // 1. Left Leg Hierarchy (Thigh -> Knee -> Calf -> Sneaker)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.20, -0.38, 0);
    this.bodyGroup.add(this.leftLegGroup);

    // Thigh (Smooth Cylinder)
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 16), pantsMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    this.leftLegGroup.add(thigh);

    // Knee Cap
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), pantsMat);
    knee.position.set(0, -0.38, 0.02);
    this.leftLegGroup.add(knee);

    // Calf
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), pantsMat);
    calf.position.y = -0.56;
    calf.castShadow = true;
    this.leftLegGroup.add(calf);

    // Left Pro Stylized Sneaker
    this.createStylizedSneaker(this.leftLegGroup, shoeColorMat, soleMat, 1);

    // 2. Right Leg Hierarchy
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.20, -0.38, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 16), pantsMat);
    rThigh.position.y = -0.18;
    rThigh.castShadow = true;
    this.rightLegGroup.add(rThigh);

    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), pantsMat);
    rKnee.position.set(0, -0.38, 0.02);
    this.rightLegGroup.add(rKnee);

    const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), pantsMat);
    rCalf.position.y = -0.56;
    rCalf.castShadow = true;
    this.rightLegGroup.add(rCalf);

    // Right Pro Stylized Sneaker
    this.createStylizedSneaker(this.rightLegGroup, shoeColorMat, soleMat, -1);
  }

  // =========================================================================
  // Helper: Stylized High-Top Air Sneaker with Rubber Sole, Toe Cap & Tongue
  // =========================================================================
  createStylizedSneaker(parentLeg, shoeColorMat, soleMat, side) {
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.74, -0.06);
    parentLeg.add(shoeGroup);

    // Thick Curved Rubber Sole
    const soleGeom = new THREE.BoxGeometry(0.24, 0.08, 0.46);
    const sole = new THREE.Mesh(soleGeom, soleMat);
    sole.position.y = -0.06;
    shoeGroup.add(sole);

    // Sneaker Upper Body
    const upperGeom = new THREE.CylinderGeometry(0.11, 0.12, 0.18, 14);
    upperGeom.scale(1.0, 1.0, 1.4);
    const upper = new THREE.Mesh(upperGeom, shoeColorMat);
    upper.position.set(0, 0.04, -0.02);
    shoeGroup.add(upper);

    // Curved Rubber Toe Cap
    const toeGeom = new THREE.SphereGeometry(0.11, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    toeGeom.scale(1.05, 0.8, 1.1);
    const toe = new THREE.Mesh(toeGeom, soleMat);
    toe.position.set(0, 0.0, -0.16);
    toe.rotation.x = Math.PI;
    shoeGroup.add(toe);

    // Sneaker Ankle Collar Ring
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), shoeColorMat);
    collar.position.set(0, 0.13, 0.02);
    collar.rotation.x = Math.PI / 2;
    shoeGroup.add(collar);

    // Stylized Side Logo Stripe (Swoosh/Stripe)
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.22), soleMat);
    stripe.position.set(side * 0.12, 0.04, 0);
    stripe.rotation.z = side * 0.15;
    shoeGroup.add(stripe);
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

      // Arms Pump naturally with bent elbows
      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;
      this.leftArmGroup.rotation.x = -armAngle;
      this.rightArmGroup.rotation.x = armAngle;

      // Realistic Torso & Shoulder twisting
      this.bodyGroup.rotation.y = -legAngle * 0.12;

      // Athletic vertical bounce
      const bounce = Math.abs(Math.cos(this.runTimer)) * 0.12;
      this.bodyGroup.position.y = 1.38 + bounce;
      this.bodyGroup.rotation.x = this.isBoosting ? 0.35 : 0.12; // Forward sprint lean
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

    // Position & Tilt
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
