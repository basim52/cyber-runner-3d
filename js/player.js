/**
 * Enhanced 3D Player Character with Multi-Vehicle Geometries & Double Jump
 */
class Player {
  constructor(scene) {
    this.scene = scene;
    
    // Movement parameters
    this.lanes = [-3.5, 0, 3.5];
    this.currentLane = 1;
    this.targetX = 0;
    this.x = 0;
    this.y = 1.0;
    this.baseY = 1.0;
    this.z = 0;

    // Physics
    this.vy = 0;
    this.gravity = -38;
    this.jumpForce = 13.5;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2; // Double Jump Enabled!

    this.tiltAngle = 0;
    this.targetTilt = 0;
    this.hoverBobTimer = 0;

    // Active Vehicle Type: 'dart' | 'titan' | 'phantom'
    this.vehicleType = 'dart';

    // Upgradable Stats
    this.magnetRadius = 6.0;
    this.shieldDurationBonus = 0;
    this.boostFactor = 1.0;

    // Powerup states
    this.isShieldActive = false;
    this.isBoosting = false;

    // Collider
    this.boxCollider = new THREE.Box3();

    this.createMesh();
  }

  setVehicle(type) {
    this.vehicleType = type;
    if (this.group) {
      this.scene.remove(this.group);
    }
    this.createMesh();
  }

  createMesh() {
    this.group = new THREE.Group();

    if (this.vehicleType === 'titan') {
      this.buildTitanMech();
    } else if (this.vehicleType === 'phantom') {
      this.buildPhantomSpeeder();
    } else {
      this.buildCyberDart();
    }

    // Shield Bubble (Universal)
    const shieldGeom = new THREE.SphereGeometry(1.7, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a2ff,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    this.group.position.set(0, this.y, 0);
    this.scene.add(this.group);
  }

  // 1. Cyber Dart (Classic Aerodynamic Interceptor)
  buildCyberDart() {
    const bodyGeom = new THREE.ConeGeometry(0.7, 2.2, 5);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a233a,
      metalness: 0.85,
      roughness: 0.2,
      flatShading: true
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.castShadow = true;
    this.group.add(bodyMesh);

    // Visor
    const visorGeom = new THREE.SphereGeometry(0.38, 16, 16);
    visorGeom.scale(1, 0.6, 1.4);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8
    });
    const visor = new THREE.Mesh(visorGeom, visorMat);
    visor.position.set(0, 0.22, -0.2);
    this.group.add(visor);

    // Wings
    const wingGeom = new THREE.BoxGeometry(3.2, 0.08, 1.0);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0d1424, metalness: 0.9 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    wings.position.set(0, 0.05, 0.3);
    this.group.add(wings);

    // Thrusters
    const thrusterGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.5, 12);
    thrusterGeom.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.thrusterMat = thrusterMat;

    const rTh = new THREE.Mesh(thrusterGeom, thrusterMat);
    rTh.position.set(0.45, 0, 1.0);
    this.group.add(rTh);

    const lTh = rTh.clone();
    lTh.position.set(-0.45, 0, 1.0);
    this.group.add(lTh);
  }

  // 2. Titan Mech (Armored Heavy Vanguard)
  buildTitanMech() {
    const coreGeom = new THREE.BoxGeometry(1.6, 1.2, 2.0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x222a38,
      metalness: 0.9,
      roughness: 0.3
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.castShadow = true;
    this.group.add(core);

    // Heavy Plating & Gold Accents
    const plateGeom = new THREE.BoxGeometry(1.8, 0.2, 1.8);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.8,
      roughness: 0.2
    });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.set(0, 0.65, 0);
    this.group.add(plate);

    // Shoulder Pods
    const podGeom = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 8);
    podGeom.rotateX(Math.PI / 2);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x111622 });

    const rPod = new THREE.Mesh(podGeom, podMat);
    rPod.position.set(1.1, 0.2, 0);
    this.group.add(rPod);

    const lPod = rPod.clone();
    lPod.position.set(-1.1, 0.2, 0);
    this.group.add(lPod);

    // Thrusters
    const thGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.5, 12);
    thGeom.rotateX(Math.PI / 2);
    this.thrusterMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    const th = new THREE.Mesh(thGeom, this.thrusterMat);
    th.position.set(0, -0.1, 1.15);
    this.group.add(th);
  }

  // 3. Phantom Speeder (Twin-boom Sleek Void Ship)
  buildPhantomSpeeder() {
    const leftHullGeom = new THREE.ConeGeometry(0.4, 2.8, 6);
    leftHullGeom.rotateX(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x150d24,
      metalness: 0.95,
      roughness: 0.15
    });

    const lHull = new THREE.Mesh(leftHullGeom, hullMat);
    lHull.position.set(-0.9, 0, 0);
    lHull.castShadow = true;
    this.group.add(lHull);

    const rHull = lHull.clone();
    rHull.position.set(0.9, 0, 0);
    this.group.add(rHull);

    // Center Plasma Bridge
    const bridgeGeom = new THREE.BoxGeometry(1.8, 0.15, 1.0);
    const bridgeMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.85
    });
    const bridge = new THREE.Mesh(bridgeGeom, bridgeMat);
    bridge.position.set(0, 0, 0.2);
    this.group.add(bridge);

    // Twin Purple Thrusters
    const thGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 12);
    thGeom.rotateX(Math.PI / 2);
    this.thrusterMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

    const lTh = new THREE.Mesh(thGeom, this.thrusterMat);
    lTh.position.set(-0.9, 0, 1.35);
    this.group.add(lTh);

    const rTh = lTh.clone();
    rTh.position.set(0.9, 0, 1.35);
    this.group.add(rTh);
  }

  moveLeft() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = this.lanes[this.currentLane];
      this.targetTilt = 0.45;
    }
  }

  moveRight() {
    if (this.currentLane < this.lanes.length - 1) {
      this.currentLane++;
      this.targetX = this.lanes[this.currentLane];
      this.targetTilt = -0.45;
    }
  }

  jump() {
    if (this.isGrounded || this.jumpCount < this.maxJumps) {
      const isDouble = !this.isGrounded && this.jumpCount === 1;
      this.vy = this.jumpForce * (isDouble ? 1.05 : 1.0);
      this.isGrounded = false;
      this.jumpCount++;
      if (window.sound) window.sound.playJump(isDouble);
    }
  }

  launchJumpPad() {
    this.vy = 24.0; // High aerial launch!
    this.isGrounded = false;
    this.jumpCount = 1;
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
    if (this.thrusterMat) {
      if (boosting) {
        this.thrusterMat.color.setHex(0xff00aa);
      } else {
        const defaultColor = (this.vehicleType === 'titan') ? 0xffaa00 : (this.vehicleType === 'phantom' ? 0xa855f7 : 0x00f0ff);
        this.thrusterMat.color.setHex(defaultColor);
      }
    }
  }

  update(delta, particleSystem) {
    // 1. Horizontal Lerp
    this.x += (this.targetX - this.x) * 14 * delta;
    this.tiltAngle += (this.targetTilt - this.tiltAngle) * 10 * delta;
    this.targetTilt *= Math.pow(0.05, delta);

    // 2. Vertical Physics & Jump
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

    // 3. Hovering Animation
    this.hoverBobTimer += delta * 6;
    const bobOffset = this.isGrounded ? Math.sin(this.hoverBobTimer) * 0.12 : 0;

    this.group.position.set(this.x, this.y + bobOffset, this.z);
    this.group.rotation.z = this.tiltAngle;
    this.group.rotation.x = this.isGrounded ? Math.sin(this.hoverBobTimer * 0.5) * 0.04 : (this.vy > 0 ? -0.2 : 0.2);

    if (this.shieldMesh && this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += 2 * delta;
      this.shieldMesh.rotation.x += 1.5 * delta;
    }

    // Emit Thruster Sparks
    if (particleSystem && Math.random() > 0.15) {
      const sparkColor = (this.vehicleType === 'phantom') ? 0xa855f7 : (this.vehicleType === 'titan' ? 0xffaa00 : 0x00f0ff);
      particleSystem.createThrusterSpark(this.group.position, this.isBoosting, sparkColor);
    }

    // Update Box Collider
    this.boxCollider.setFromCenterAndSize(
      new THREE.Vector3(this.x, this.y + 0.3, this.z),
      new THREE.Vector3(1.6, 1.2, 1.8)
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
    this.setShield(false);
    this.setBoosting(false);
    this.group.position.set(0, this.baseY, 0);
  }
}
