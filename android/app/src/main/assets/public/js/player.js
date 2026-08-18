/**
 * 3D Multi-Character System (Boy, Girl, Robot, Fox) with Dynamic Animations
 */
class Player {
  constructor(scene) {
    this.scene = scene;
    
    // Movement
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
    this.jumpForce = 13.8;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2;

    this.tiltAngle = 0;
    this.targetTilt = 0;
    this.runTimer = 0;
    this.spinAngle = 0;

    // Active Character: 'boy' | 'girl' | 'robot' | 'fox'
    this.characterType = 'boy';

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
    this.skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.6 });
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    
    // Boy Materials
    this.boyHairMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.8 });
    this.boyShirtMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.7 });
    this.boyPantsMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.8 });
    this.boyShoeMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.5 });
    this.boyCapMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.6 });
    this.backpackMat = new THREE.MeshStandardMaterial({ color: 0xf57c00, roughness: 0.8 });

    // Girl Materials
    this.girlHairMat = new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.7 }); // Blonde ponytail
    this.girlShirtMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.6 }); // Pink sporty hoodie
    this.girlPantsMat = new THREE.MeshStandardMaterial({ color: 0x7b1fa2, roughness: 0.7 }); // Purple leggings
    this.girlShoeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.5 });
    this.girlGogglesMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, metalness: 0.8 });

    // Robot Materials (Sparky)
    this.botMetalMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.9, roughness: 0.2 });
    this.botGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    this.botScreenMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this.botLightMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    // Fox Materials (Swift Fox)
    this.foxFurMat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.8 }); // Orange fur
    this.foxWhiteFurMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    this.foxNoseMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  }

  setCharacter(type) {
    this.characterType = type;
    if (this.group) {
      this.scene.remove(this.group);
    }
    this.createMesh();
  }

  setVehicle(type) {
    // Map selection to characters
    if (type === 'titan') this.setCharacter('girl');
    else if (type === 'phantom') this.setCharacter('robot');
    else if (type === 'fox') this.setCharacter('fox');
    else this.setCharacter('boy');
  }

  createMesh() {
    this.group = new THREE.Group();

    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.35;
    this.group.add(this.bodyGroup);

    if (this.characterType === 'girl') {
      this.buildGirlCharacter();
    } else if (this.characterType === 'robot') {
      this.buildRobotCharacter();
    } else if (this.characterType === 'fox') {
      this.buildFoxCharacter();
    } else {
      this.buildBoyCharacter();
    }

    // Shield Bubble (Universal)
    const shieldGeom = new THREE.SphereGeometry(1.55, 20, 20);
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
    this.shieldMesh.position.y = 0.3;
    this.shieldMesh.visible = false;
    this.bodyGroup.add(this.shieldMesh);

    this.group.position.set(0, this.y, 0);
    this.scene.add(this.group);
  }

  // 👦 1. 3D Boy Runner
  buildBoyCharacter() {
    // Torso & Jacket
    const torsoGeom = new THREE.BoxGeometry(0.75, 0.85, 0.45);
    const torso = new THREE.Mesh(torsoGeom, this.boyShirtMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    const packGeom = new THREE.BoxGeometry(0.55, 0.65, 0.3);
    const pack = new THREE.Mesh(packGeom, this.backpackMat);
    pack.position.set(0, 0.05, 0.35);
    torso.add(pack);

    // Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.bodyGroup.add(this.headGroup);

    const headGeom = new THREE.SphereGeometry(0.36, 12, 12);
    const head = new THREE.Mesh(headGeom, this.skinMat);
    this.headGroup.add(head);

    const eyeGeom = new THREE.SphereGeometry(0.05, 6, 6);
    const lEye = new THREE.Mesh(eyeGeom, this.eyeMat); lEye.position.set(0.12, 0.05, -0.32); this.headGroup.add(lEye);
    const rEye = lEye.clone(); rEye.position.set(-0.12, 0.05, -0.32); this.headGroup.add(rEye);

    const hairGeom = new THREE.DodecahedronGeometry(0.38, 1);
    const hair = new THREE.Mesh(hairGeom, this.boyHairMat); hair.position.set(0, 0.08, 0.04); this.headGroup.add(hair);

    const capDomeGeom = new THREE.SphereGeometry(0.38, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const capDome = new THREE.Mesh(capDomeGeom, this.boyCapMat); capDome.position.set(0, 0.1, 0); this.headGroup.add(capDome);
    const visorGeom = new THREE.BoxGeometry(0.4, 0.06, 0.3);
    const visor = new THREE.Mesh(visorGeom, this.boyCapMat); visor.position.set(0, 0.12, 0.38); this.headGroup.add(visor);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    this.leftArmGroup = new THREE.Group(); this.leftArmGroup.position.set(0.48, 0.35, 0); this.bodyGroup.add(this.leftArmGroup);
    const lArm = new THREE.Mesh(armGeom, this.boyShirtMat); lArm.position.y = -0.3; this.leftArmGroup.add(lArm);

    this.rightArmGroup = new THREE.Group(); this.rightArmGroup.position.set(-0.48, 0.35, 0); this.bodyGroup.add(this.rightArmGroup);
    const rArm = new THREE.Mesh(armGeom, this.boyShirtMat); rArm.position.y = -0.3; this.rightArmGroup.add(rArm);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    this.leftLegGroup = new THREE.Group(); this.leftLegGroup.position.set(0.24, -0.4, 0); this.bodyGroup.add(this.leftLegGroup);
    const lLeg = new THREE.Mesh(legGeom, this.boyPantsMat); lLeg.position.y = -0.35; this.leftLegGroup.add(lLeg);
    const shoeGeom = new THREE.BoxGeometry(0.28, 0.18, 0.45);
    const lShoe = new THREE.Mesh(shoeGeom, this.boyShoeMat); lShoe.position.set(0, -0.75, -0.08); this.leftLegGroup.add(lShoe);

    this.rightLegGroup = new THREE.Group(); this.rightLegGroup.position.set(-0.24, -0.4, 0); this.bodyGroup.add(this.rightLegGroup);
    const rLeg = new THREE.Mesh(legGeom, this.boyPantsMat); rLeg.position.y = -0.35; this.rightLegGroup.add(rLeg);
    const rShoe = new THREE.Mesh(shoeGeom, this.boyShoeMat); rShoe.position.set(0, -0.75, -0.08); this.rightLegGroup.add(rShoe);
  }

  // 👧 2. 3D Girl Runner (Lana)
  buildGirlCharacter() {
    // Torso
    const torsoGeom = new THREE.BoxGeometry(0.7, 0.8, 0.4);
    const torso = new THREE.Mesh(torsoGeom, this.girlShirtMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), this.skinMat);
    this.headGroup.add(head);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.05, 6, 6);
    const lEye = new THREE.Mesh(eyeGeom, this.eyeMat); lEye.position.set(0.12, 0.05, -0.32); this.headGroup.add(lEye);
    const rEye = lEye.clone(); rEye.position.set(-0.12, 0.05, -0.32); this.headGroup.add(rEye);

    // Blonde Hair & Ponytail
    const hair = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), this.girlHairMat);
    hair.position.set(0, 0.08, 0.04);
    this.headGroup.add(hair);

    const ponyGeom = new THREE.CylinderGeometry(0.12, 0.2, 0.6, 6);
    const ponytail = new THREE.Mesh(ponyGeom, this.girlHairMat);
    ponytail.position.set(0, 0.15, 0.45);
    ponytail.rotation.x = -0.6;
    this.headGroup.add(ponytail);

    // Explorer Goggles on Head
    const goggleGeom = new THREE.BoxGeometry(0.5, 0.12, 0.15);
    const goggles = new THREE.Mesh(goggleGeom, this.girlGogglesMat);
    goggles.position.set(0, 0.25, -0.25);
    this.headGroup.add(goggles);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.18, 0.7, 0.18);
    this.leftArmGroup = new THREE.Group(); this.leftArmGroup.position.set(0.45, 0.35, 0); this.bodyGroup.add(this.leftArmGroup);
    const lArm = new THREE.Mesh(armGeom, this.girlShirtMat); lArm.position.y = -0.3; this.leftArmGroup.add(lArm);

    this.rightArmGroup = new THREE.Group(); this.rightArmGroup.position.set(-0.45, 0.35, 0); this.bodyGroup.add(this.rightArmGroup);
    const rArm = new THREE.Mesh(armGeom, this.girlShirtMat); rArm.position.y = -0.3; this.rightArmGroup.add(rArm);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.22, 0.75, 0.22);
    this.leftLegGroup = new THREE.Group(); this.leftLegGroup.position.set(0.22, -0.4, 0); this.bodyGroup.add(this.leftLegGroup);
    const lLeg = new THREE.Mesh(legGeom, this.girlPantsMat); lLeg.position.y = -0.35; this.leftLegGroup.add(lLeg);
    const shoeGeom = new THREE.BoxGeometry(0.26, 0.18, 0.42);
    const lShoe = new THREE.Mesh(shoeGeom, this.girlShoeMat); lShoe.position.set(0, -0.75, -0.08); this.leftLegGroup.add(lShoe);

    this.rightLegGroup = new THREE.Group(); this.rightLegGroup.position.set(-0.22, -0.4, 0); this.bodyGroup.add(this.rightLegGroup);
    const rLeg = new THREE.Mesh(legGeom, this.girlPantsMat); rLeg.position.y = -0.35; this.rightLegGroup.add(rLeg);
    const rShoe = new THREE.Mesh(shoeGeom, this.girlShoeMat); rShoe.position.set(0, -0.75, -0.08); this.rightLegGroup.add(rShoe);
  }

  // 🤖 3. 3D Sparky Robot
  buildRobotCharacter() {
    // Spherical / Boxy Tech Torso
    const torsoGeom = new THREE.DodecahedronGeometry(0.65, 1);
    const torso = new THREE.Mesh(torsoGeom, this.botMetalMat);
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Digital Screen Visor Eyes
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.bodyGroup.add(this.headGroup);

    const headGeom = new THREE.BoxGeometry(0.7, 0.5, 0.55);
    const head = new THREE.Mesh(headGeom, this.botMetalMat);
    this.headGroup.add(head);

    const screenGeom = new THREE.PlaneGeometry(0.55, 0.25);
    const screen = new THREE.Mesh(screenGeom, this.botScreenMat);
    screen.position.set(0, 0, -0.28);
    screen.rotation.y = Math.PI;
    this.headGroup.add(screen);

    // Antenna with Blinking Light
    const antGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
    const ant = new THREE.Mesh(antGeom, this.botGoldMat);
    ant.position.set(0, 0.4, 0);
    this.headGroup.add(ant);

    const tipGeom = new THREE.SphereGeometry(0.08, 6, 6);
    const tip = new THREE.Mesh(tipGeom, this.botLightMat);
    tip.position.set(0, 0.6, 0);
    this.headGroup.add(tip);

    // Mechanical Arms
    const armGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.65, 6);
    this.leftArmGroup = new THREE.Group(); this.leftArmGroup.position.set(0.55, 0.2, 0); this.bodyGroup.add(this.leftArmGroup);
    const lArm = new THREE.Mesh(armGeom, this.botGoldMat); lArm.position.y = -0.3; this.leftArmGroup.add(lArm);

    this.rightArmGroup = new THREE.Group(); this.rightArmGroup.position.set(-0.55, 0.2, 0); this.bodyGroup.add(this.rightArmGroup);
    const rArm = new THREE.Mesh(armGeom, this.botGoldMat); rArm.position.y = -0.3; this.rightArmGroup.add(rArm);

    // Jet / Piston Legs
    const legGeom = new THREE.CylinderGeometry(0.12, 0.15, 0.7, 8);
    this.leftLegGroup = new THREE.Group(); this.leftLegGroup.position.set(0.25, -0.4, 0); this.bodyGroup.add(this.leftLegGroup);
    const lLeg = new THREE.Mesh(legGeom, this.botMetalMat); lLeg.position.y = -0.35; this.leftLegGroup.add(lLeg);

    this.rightLegGroup = new THREE.Group(); this.rightLegGroup.position.set(-0.25, -0.4, 0); this.bodyGroup.add(this.rightLegGroup);
    const rLeg = new THREE.Mesh(legGeom, this.botMetalMat); rLeg.position.y = -0.35; this.rightLegGroup.add(rLeg);
  }

  // 🦊 4. 3D Swift Fox Runner
  buildFoxCharacter() {
    // Fox Body
    const bodyGeom = new THREE.BoxGeometry(0.7, 0.75, 1.1);
    const body = new THREE.Mesh(bodyGeom, this.foxFurMat);
    body.castShadow = true;
    this.bodyGroup.add(body);

    const bellyGeom = new THREE.BoxGeometry(0.5, 0.6, 0.6);
    const belly = new THREE.Mesh(bellyGeom, this.foxWhiteFurMat);
    belly.position.set(0, -0.1, -0.3);
    this.bodyGroup.add(belly);

    // Fox Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.55, -0.45);
    this.bodyGroup.add(this.headGroup);

    const headGeom = new THREE.ConeGeometry(0.45, 0.8, 6);
    headGeom.rotateX(-Math.PI / 2);
    const head = new THREE.Mesh(headGeom, this.foxFurMat);
    this.headGroup.add(head);

    // Pointy Fox Ears
    const earGeom = new THREE.ConeGeometry(0.18, 0.45, 4);
    const lEar = new THREE.Mesh(earGeom, this.foxFurMat); lEar.position.set(0.25, 0.4, 0); lEar.rotation.z = -0.2; this.headGroup.add(lEar);
    const rEar = new THREE.Mesh(earGeom, this.foxFurMat); rEar.position.set(-0.25, 0.4, 0); rEar.rotation.z = 0.2; this.headGroup.add(rEar);

    // Bushy Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.2, 0.6);
    this.bodyGroup.add(this.tailGroup);

    const tailGeom = new THREE.ConeGeometry(0.3, 1.1, 6);
    tailGeom.rotateX(Math.PI / 3);
    const tail = new THREE.Mesh(tailGeom, this.foxFurMat);
    tail.position.set(0, 0.3, 0.3);
    this.tailGroup.add(tail);

    // Front Paws (Arms)
    const pawGeom = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    this.leftArmGroup = new THREE.Group(); this.leftArmGroup.position.set(0.35, -0.2, -0.35); this.bodyGroup.add(this.leftArmGroup);
    const lArm = new THREE.Mesh(pawGeom, this.foxFurMat); lArm.position.y = -0.3; this.leftArmGroup.add(lArm);

    this.rightArmGroup = new THREE.Group(); this.rightArmGroup.position.set(-0.35, -0.2, -0.35); this.bodyGroup.add(this.rightArmGroup);
    const rArm = new THREE.Mesh(pawGeom, this.foxFurMat); rArm.position.y = -0.3; this.rightArmGroup.add(rArm);

    // Hind Legs
    this.leftLegGroup = new THREE.Group(); this.leftLegGroup.position.set(0.35, -0.2, 0.35); this.bodyGroup.add(this.leftLegGroup);
    const lLeg = new THREE.Mesh(pawGeom, this.foxFurMat); lLeg.position.y = -0.3; this.leftLegGroup.add(lLeg);

    this.rightLegGroup = new THREE.Group(); this.rightLegGroup.position.set(-0.35, -0.2, 0.35); this.bodyGroup.add(this.rightLegGroup);
    const rLeg = new THREE.Mesh(pawGeom, this.foxFurMat); rLeg.position.y = -0.3; this.rightLegGroup.add(rLeg);
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
    this.x += (this.targetX - this.x) * 14 * delta;
    this.tiltAngle += (this.targetTilt - this.tiltAngle) * 10 * delta;
    this.targetTilt *= Math.pow(0.05, delta);

    // Vertical Physics
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

    // Animation Cycles
    if (this.isGrounded) {
      const runSpeed = this.isBoosting ? 26 : 18;
      this.runTimer += delta * runSpeed;

      const legAngle = Math.sin(this.runTimer) * 0.75;
      const armAngle = Math.sin(this.runTimer) * 0.65;

      if (this.leftLegGroup) this.leftLegGroup.rotation.x = legAngle;
      if (this.rightLegGroup) this.rightLegGroup.rotation.x = -legAngle;
      if (this.leftArmGroup) this.leftArmGroup.rotation.x = -armAngle;
      if (this.rightArmGroup) this.rightArmGroup.rotation.x = armAngle;

      const bounce = Math.abs(Math.cos(this.runTimer)) * 0.12;
      this.bodyGroup.position.y = 1.35 + bounce;
      this.bodyGroup.rotation.x = this.isBoosting ? 0.35 : 0.12;

      // Fox Tail Wagging
      if (this.tailGroup) {
        this.tailGroup.rotation.z = Math.sin(this.runTimer * 0.8) * 0.4;
      }
    } else {
      if (this.leftLegGroup) this.leftLegGroup.rotation.x = -0.5;
      if (this.rightLegGroup) this.rightLegGroup.rotation.x = -0.3;
      if (this.leftArmGroup) {
        this.leftArmGroup.rotation.x = -0.7;
        this.leftArmGroup.rotation.z = 0.5;
      }
      if (this.rightArmGroup) {
        this.rightArmGroup.rotation.x = -0.7;
        this.rightArmGroup.rotation.z = -0.5;
      }
      this.bodyGroup.position.y = 1.35;

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
      const sparkColor = this.isBoosting ? 0xff3d00 : (this.characterType === 'robot' ? 0x00e5ff : 0x4caf50);
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
