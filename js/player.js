/**
 * Exact 3D Replica of the Explorer Boy from reference image:
 * - Bronze warm skin tone
 * - Textured Crimson Red hair with dark base
 * - Brick-red / Maroon Headband
 * - Stonewash Denim Jacket with rolled-up 3/4 sleeves & collar
 * - Khaki Canvas Vintage Backpack with leather flap, straps & buckles
 * - Silver Watch on left wrist & Antique Brass Compass
 * - Charcoal Grey Pants
 * - Burgundy/Reddish-Brown Rugged Leather Boots with white laces
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

    // Active Character
    this.characterType = 'explorer';

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
    // 1. Bronze Skin Material (Exact match)
    this.skinBronzeMat = new THREE.MeshStandardMaterial({
      color: 0x8a5229,
      roughness: 0.55,
      metalness: 0.05
    });

    // 2. Hair Materials (Crimson Red Tips + Dark Base)
    this.hairRedMat = new THREE.MeshStandardMaterial({
      color: 0xaa2828,
      roughness: 0.75
    });
    this.hairDarkMat = new THREE.MeshStandardMaterial({
      color: 0x241208,
      roughness: 0.85
    });

    // 3. Headband (Brick Red / Maroon)
    this.headbandMat = new THREE.MeshStandardMaterial({
      color: 0x822222,
      roughness: 0.65
    });

    // 4. Denim Jacket (Stonewash Blue)
    this.denimMat = new THREE.MeshStandardMaterial({
      color: 0x5e85a3,
      roughness: 0.7
    });
    this.denimDarkMat = new THREE.MeshStandardMaterial({
      color: 0x486982,
      roughness: 0.75
    });

    // 5. Vintage Backpack (Khaki Canvas + Leather)
    this.backpackCanvasMat = new THREE.MeshStandardMaterial({
      color: 0xbf9860,
      roughness: 0.8
    });
    this.backpackLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x6e3d1b,
      roughness: 0.55
    });
    this.brassBuckleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25
    });

    // 6. Accessories (Silver Watch + Compass)
    this.silverWatchMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.9,
      roughness: 0.2
    });
    this.compassMat = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 0.8,
      roughness: 0.3
    });
    this.compassGlassMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    // 7. Charcoal Grey Pants
    this.pantsMat = new THREE.MeshStandardMaterial({
      color: 0x383e40,
      roughness: 0.75
    });

    // 8. Burgundy Boots & Laces
    this.bootsLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x7c2626,
      roughness: 0.5
    });
    this.bootsSoleMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8
    });
    this.whiteLacesMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4
    });

    // Facial
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    this.eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  }

  setCharacter(type) {
    this.characterType = type;
    if (this.group) {
      this.scene.remove(this.group);
    }
    this.createMesh();
  }

  setVehicle(type) {
    this.setCharacter('explorer');
  }

  createMesh() {
    this.group = new THREE.Group();

    // Human Center Root Rig
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.38;
    this.group.add(this.bodyGroup);

    this.buildExplorerCharacter();

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

  // =========================================================================
  // 🧭 Exact Replica of Reference Image Character
  // =========================================================================
  buildExplorerCharacter() {
    const skin = this.skinBronzeMat;

    // -----------------------------------------------------------------------
    // 1. Stonewash Denim Jacket & Torso
    // -----------------------------------------------------------------------
    const torsoGeom = new THREE.CylinderGeometry(0.38, 0.32, 0.86, 20);
    const torso = new THREE.Mesh(torsoGeom, this.denimMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Denim Jacket Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.05, 8, 20), this.denimDarkMat);
    collar.position.set(0, 0.42, 0);
    collar.rotation.x = Math.PI / 2;
    torso.add(collar);

    // Jacket Waistband Hem
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 20), this.denimDarkMat);
    hem.position.set(0, -0.40, 0);
    torso.add(hem);

    // Jacket Back Stitching Lines
    const stitchL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.65, 6), this.denimDarkMat);
    stitchL.position.set(0.18, 0.02, 0.31);
    torso.add(stitchL);
    const stitchR = stitchL.clone();
    stitchR.position.set(-0.18, 0.02, 0.31);
    torso.add(stitchR);

    // -----------------------------------------------------------------------
    // 2. Vintage Khaki Canvas Backpack (Accurate to Image)
    // -----------------------------------------------------------------------
    const packGroup = new THREE.Group();
    packGroup.position.set(0, 0.06, 0.32);
    torso.add(packGroup);

    // Main Canvas Pack Body
    const packBodyGeom = new THREE.BoxGeometry(0.52, 0.62, 0.28);
    const packBody = new THREE.Mesh(packBodyGeom, this.backpackCanvasMat);
    packBody.castShadow = true;
    packGroup.add(packBody);

    // Top Leather Flap
    const flapGeom = new THREE.CylinderGeometry(0.27, 0.27, 0.52, 16, 1, false, 0, Math.PI);
    const flap = new THREE.Mesh(flapGeom, this.backpackLeatherMat);
    flap.position.set(0, 0.28, 0.02);
    flap.rotation.z = Math.PI / 2;
    flap.rotation.y = Math.PI;
    packGroup.add(flap);

    // 2 Vertical Brown Leather Straps with Brass Buckles
    for (let s = -1; s <= 1; s += 2) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.66, 0.02), this.backpackLeatherMat);
      strap.position.set(s * 0.14, -0.02, 0.15);
      packGroup.add(strap);

      // Brass Buckle
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), this.brassBuckleMat);
      buckle.position.set(s * 0.14, 0.04, 0.16);
      packGroup.add(buckle);
    }

    // Front Zipper Pouch
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.22, 0.10), this.backpackCanvasMat);
    pouch.position.set(0, -0.16, 0.16);
    packGroup.add(pouch);

    // Pouch Zipper Line
    const pouchZip = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.02), this.backpackLeatherMat);
    pouchZip.position.set(0, -0.14, 0.22);
    packGroup.add(pouchZip);

    // Two Side Pockets
    const sidePocketL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.18), this.backpackCanvasMat);
    sidePocketL.position.set(0.28, -0.08, 0);
    packGroup.add(sidePocketL);
    const sidePocketR = sidePocketL.clone();
    sidePocketR.position.set(-0.28, -0.08, 0);
    packGroup.add(sidePocketR);

    // Top Grab Loop
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI), this.backpackLeatherMat);
    loop.position.set(0, 0.35, 0);
    loop.rotation.x = Math.PI / 2;
    packGroup.add(loop);

    // Padded Shoulder Harness Straps
    const harnessL = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 8, 16, Math.PI), this.backpackCanvasMat);
    harnessL.position.set(0.22, 0.16, 0.05);
    harnessL.rotation.y = Math.PI / 2;
    torso.add(harnessL);

    const harnessR = harnessL.clone();
    harnessR.position.set(-0.22, 0.16, 0.05);
    torso.add(harnessR);

    // -----------------------------------------------------------------------
    // 3. Head, Crimson Fade Hair & Brick-Red Headband
    // -----------------------------------------------------------------------
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0);
    this.bodyGroup.add(this.headGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 16), skin);
    neck.position.set(0, -0.16, 0);
    this.headGroup.add(neck);

    // Smooth Bronze Head
    const headGeom = new THREE.SphereGeometry(0.36, 24, 20);
    headGeom.scale(0.92, 1.05, 0.98);
    const head = new THREE.Mesh(headGeom, skin);
    head.castShadow = true;
    this.headGroup.add(head);

    // Dark Base Hair Fade (Lower Head)
    const baseHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.37, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.8),
      this.hairDarkMat
    );
    baseHair.position.set(0, 0.04, 0.02);
    this.headGroup.add(baseHair);

    // Vibrant Textured Crimson-Red Hair (Top Dome with Waves)
    const hairTopGeom = new THREE.SphereGeometry(0.375, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const hairTop = new THREE.Mesh(hairTopGeom, this.hairRedMat);
    hairTop.position.set(0, 0.08, 0.02);
    this.headGroup.add(hairTop);

    // Textured Crimson Hair Curls / Tufts on Top
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), this.hairRedMat);
        const xPos = (col - 2) * 0.11;
        const zPos = (row - 1.5) * 0.12;
        tuft.position.set(xPos, 0.38 - Math.abs(xPos) * 0.15 - Math.abs(zPos) * 0.1, zPos);
        this.headGroup.add(tuft);
      }
    }

    // Brick-Red / Maroon Fabric Headband (Wraps around back & sides below red hair)
    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.045, 8, 24), this.headbandMat);
    headband.position.set(0, 0.08, 0.02);
    headband.rotation.x = Math.PI / 2 + 0.12; // Slanted naturally as in photo
    this.headGroup.add(headband);

    // Detailed Ears
    const earGeom = new THREE.TorusGeometry(0.07, 0.025, 8, 12, Math.PI * 1.2);
    const lEar = new THREE.Mesh(earGeom, skin);
    lEar.position.set(0.35, 0.02, 0);
    lEar.rotation.y = Math.PI / 2;
    this.headGroup.add(lEar);

    const rEar = new THREE.Mesh(earGeom, skin);
    rEar.position.set(-0.35, 0.02, 0);
    rEar.rotation.y = -Math.PI / 2;
    this.headGroup.add(rEar);

    // Cute 3D Nose & Eyes
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 8), skin);
    nose.position.set(0, -0.02, -0.36);
    nose.rotation.x = -Math.PI / 2;
    this.headGroup.add(nose);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.eyeMat);
    eyeL.position.set(0.12, 0.05, -0.33);
    this.headGroup.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.set(-0.12, 0.05, -0.33);
    this.headGroup.add(eyeR);

    // -----------------------------------------------------------------------
    // 4. Arms with Rolled-up Denim Sleeves, Silver Watch & Compass
    // -----------------------------------------------------------------------
    this.buildExplorerArms(skin);

    // -----------------------------------------------------------------------
    // 5. Charcoal Grey Pants & Burgundy Leather Boots
    // -----------------------------------------------------------------------
    this.buildExplorerLegs();
  }

  // =========================================================================
  // Arms: Rolled-up Sleeves, Silver Watch & Brass Navigation Compass
  // =========================================================================
  buildExplorerArms(skin) {
    // 1. Left Arm Hierarchy (Holding Compass)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(0.46, 0.32, 0);
    this.bodyGroup.add(this.leftArmGroup);

    // Denim Shoulder
    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.denimMat);
    this.leftArmGroup.add(lShoulder);

    // Denim Upper Arm (Rolled at elbow)
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 14), this.denimMat);
    lUpperArm.position.y = -0.16;
    lUpperArm.castShadow = true;
    this.leftArmGroup.add(lUpperArm);

    // Rolled Sleeve Cuff
    const lCuff = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), this.denimDarkMat);
    lCuff.position.set(0, -0.32, 0);
    lCuff.rotation.x = Math.PI / 2;
    this.leftArmGroup.add(lCuff);

    // Forearm Group (Bare Bronze Skin)
    const lForearmGroup = new THREE.Group();
    lForearmGroup.position.set(0, -0.34, 0);
    this.leftArmGroup.add(lForearmGroup);

    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.36, 14), skin);
    lForearm.position.set(0, -0.16, -0.08);
    lForearm.rotation.x = -0.75;
    lForearm.castShadow = true;
    lForearmGroup.add(lForearm);

    // Silver Watch on Left Wrist
    const watch = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 16), this.silverWatchMat);
    watch.position.set(0, -0.25, -0.14);
    watch.rotation.x = Math.PI / 2 - 0.75;
    lForearmGroup.add(watch);

    // Left Hand (Palm holding Compass upward)
    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), skin);
    lHand.position.set(0, -0.28, -0.18);
    lForearmGroup.add(lHand);

    // Antique Brass Navigation Compass (Exact match from photo!)
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, -0.26, -0.26);
    compassGroup.rotation.x = -0.3;
    lForearmGroup.add(compassGroup);

    // Compass Outer Brass Casing
    const compassBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), this.compassMat);
    compassGroup.add(compassBody);

    // Compass Glass Dial Face
    const compassFace = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.005, 16), this.compassGlassMat);
    compassFace.position.y = 0.016;
    compassGroup.add(compassFace);

    // Compass Needle
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.008, 0.11), this.hairRedMat);
    needle.position.y = 0.02;
    compassGroup.add(needle);

    // 2. Right Arm Hierarchy (Gesturing freely)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-0.46, 0.32, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), this.denimMat);
    this.rightArmGroup.add(rShoulder);

    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 14), this.denimMat);
    rUpperArm.position.y = -0.16;
    rUpperArm.castShadow = true;
    this.rightArmGroup.add(rUpperArm);

    const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), this.denimDarkMat);
    rCuff.position.set(0, -0.32, 0);
    rCuff.rotation.x = Math.PI / 2;
    this.rightArmGroup.add(rCuff);

    const rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0, -0.34, 0);
    this.rightArmGroup.add(rForearmGroup);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.36, 14), skin);
    rForearm.position.set(0, -0.16, -0.08);
    rForearm.rotation.x = -0.65;
    rForearm.castShadow = true;
    rForearmGroup.add(rForearm);

    // Right Hand (Open palm with defined fingers as in image)
    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), skin);
    rHand.position.set(0, -0.28, -0.18);
    rForearmGroup.add(rHand);

    // Fingers
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.08, 6), skin);
      finger.position.set((f - 1.5) * 0.035, -0.34, -0.20);
      finger.rotation.x = 0.4;
      rForearmGroup.add(finger);
    }
  }

  // =========================================================================
  // Legs: Charcoal Grey Pants & Burgundy Leather Rugged Boots
  // =========================================================================
  buildExplorerLegs() {
    // 1. Left Leg Hierarchy
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.20, -0.38, 0);
    this.bodyGroup.add(this.leftLegGroup);

    // Thigh (Charcoal Grey)
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 16), this.pantsMat);
    thigh.position.y = -0.18;
    thigh.castShadow = true;
    this.leftLegGroup.add(thigh);

    // Knee
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.pantsMat);
    knee.position.set(0, -0.38, 0.02);
    this.leftLegGroup.add(knee);

    // Calf
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), this.pantsMat);
    calf.position.y = -0.56;
    calf.castShadow = true;
    this.leftLegGroup.add(calf);

    // Pant Cuff above boot
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.025, 6, 16), this.pantsMat);
    cuff.position.set(0, -0.70, 0);
    cuff.rotation.x = Math.PI / 2;
    this.leftLegGroup.add(cuff);

    // Left Burgundy Boot
    this.createBurgundyBoot(this.leftLegGroup);

    // 2. Right Leg Hierarchy
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.20, -0.38, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 16), this.pantsMat);
    rThigh.position.y = -0.18;
    rThigh.castShadow = true;
    this.rightLegGroup.add(rThigh);

    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), this.pantsMat);
    rKnee.position.set(0, -0.38, 0.02);
    this.rightLegGroup.add(rKnee);

    const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), this.pantsMat);
    rCalf.position.y = -0.56;
    rCalf.castShadow = true;
    this.rightLegGroup.add(rCalf);

    const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.025, 6, 16), this.pantsMat);
    rCuff.position.set(0, -0.70, 0);
    rCuff.rotation.x = Math.PI / 2;
    this.rightLegGroup.add(rCuff);

    // Right Burgundy Boot
    this.createBurgundyBoot(this.rightLegGroup);
  }

  // =========================================================================
  // Burgundy Rugged Leather Boots with Dark Sole & White Laces
  // =========================================================================
  createBurgundyBoot(parentLeg) {
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.74, -0.06);
    parentLeg.add(bootGroup);

    // Dark Rugged Rubber Sole
    const soleGeom = new THREE.BoxGeometry(0.24, 0.07, 0.46);
    const sole = new THREE.Mesh(soleGeom, this.bootsSoleMat);
    sole.position.y = -0.06;
    bootGroup.add(sole);

    // Heel Block
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.16), this.bootsSoleMat);
    heel.position.set(0, -0.03, 0.12);
    bootGroup.add(heel);

    // Burgundy Leather Upper
    const upperGeom = new THREE.CylinderGeometry(0.11, 0.12, 0.22, 14);
    upperGeom.scale(1.0, 1.0, 1.35);
    const upper = new THREE.Mesh(upperGeom, this.bootsLeatherMat);
    upper.position.set(0, 0.05, -0.02);
    bootGroup.add(upper);

    // Curved Boot Toe
    const toeGeom = new THREE.SphereGeometry(0.11, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    toeGeom.scale(1.05, 0.85, 1.1);
    const toe = new THREE.Mesh(toeGeom, this.bootsLeatherMat);
    toe.position.set(0, 0.01, -0.15);
    toe.rotation.x = Math.PI;
    bootGroup.add(toe);

    // White Boot Laces Detail
    for (let l = 0; l < 3; l++) {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), this.whiteLacesMat);
      lace.position.set(0, 0.02 + l * 0.05, -0.12 + l * 0.02);
      bootGroup.add(lace);
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
