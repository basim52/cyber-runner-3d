/**
 * Multi-World Procedural Track, Warp Gates, Jump Pads & World Biomes
 */
class WorldManager {
  constructor(scene) {
    this.scene = scene;

    this.lanes = [-3.5, 0, 3.5];
    this.segmentLength = 60;
    this.visibleSegments = 5;
    this.segments = [];

    // Active Entities
    this.obstacles = [];
    this.collectibles = [];
    this.powerups = [];
    this.jumpPads = [];
    this.warpGates = [];
    this.sceneryProps = [];

    // Current World Biome: 'city' | 'lava' | 'nebula' | 'abyss'
    this.currentBiome = 'city';

    this.initBiomesData();
    this.initMaterials();
    this.initTrack();
  }

  initBiomesData() {
    this.biomes = {
      city: {
        name: 'المدينة السيبرانية',
        icon: '🏙️',
        fogColor: 0x070913,
        ambientColor: 0x223355,
        roadColor: 0x070b19,
        lineColor: 0x00f0ff,
        railColor: 0xff007f,
        archColor: 0x0d1424,
        accentColor: 0x00f0ff
      },
      lava: {
        name: 'الكوكب البركاني',
        icon: '🌋',
        fogColor: 0x220505,
        ambientColor: 0x441111,
        roadColor: 0x1a0808,
        lineColor: 0xff3300,
        railColor: 0xff8800,
        archColor: 0x2d0d0d,
        accentColor: 0xff2200
      },
      nebula: {
        name: 'السديم الفضائي',
        icon: '🌌',
        fogColor: 0x0f051d,
        ambientColor: 0x2f114a,
        roadColor: 0x110826,
        lineColor: 0xa855f7,
        railColor: 0xffd700,
        archColor: 0x1e0e38,
        accentColor: 0xc084fc
      },
      abyss: {
        name: 'أعماق الماتريكس',
        icon: '🌊',
        fogColor: 0x021612,
        ambientColor: 0x063328,
        roadColor: 0x031c17,
        lineColor: 0x00ff88,
        railColor: 0x00d9ff,
        archColor: 0x062820,
        accentColor: 0x10b981
      }
    };
  }

  initMaterials() {
    // Dynamic Materials
    this.roadMat = new THREE.MeshStandardMaterial({
      color: this.biomes.city.roadColor,
      roughness: 0.8,
      metalness: 0.2
    });

    this.laneLineMat = new THREE.MeshBasicMaterial({
      color: this.biomes.city.lineColor,
      transparent: true,
      opacity: 0.65
    });

    this.railMat = new THREE.MeshBasicMaterial({
      color: this.biomes.city.railColor
    });

    this.archMat = new THREE.MeshStandardMaterial({
      color: this.biomes.city.archColor,
      metalness: 0.85,
      roughness: 0.25
    });

    this.archNeonMat = new THREE.MeshBasicMaterial({
      color: this.biomes.city.accentColor
    });

    // Collectibles & Obstacle Shared Materials
    this.goldCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffa500,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.9
    });

    this.cyanCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00a2ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });

    this.obstacleMat = new THREE.MeshStandardMaterial({
      color: 0x240810,
      emissive: 0xff1133,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7
    });

    this.laserMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      transparent: true,
      opacity: 0.85
    });

    this.jumpPadMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.9
    });
  }

  setBiome(biomeKey) {
    if (!this.biomes[biomeKey]) return;
    this.currentBiome = biomeKey;
    const b = this.biomes[biomeKey];

    // Update Materials Colors
    this.roadMat.color.setHex(b.roadColor);
    this.laneLineMat.color.setHex(b.lineColor);
    this.railMat.color.setHex(b.railColor);
    this.archMat.color.setHex(b.archColor);
    this.archNeonMat.color.setHex(b.accentColor);

    // Update Fog and Scene Background
    if (this.scene.fog) {
      this.scene.fog.color.setHex(b.fogColor);
      this.scene.background.setHex(b.fogColor);
    }
  }

  initTrack() {
    for (let i = 0; i < this.visibleSegments; i++) {
      const zPos = -i * this.segmentLength;
      this.createTrackSegment(zPos, i === 0);
    }
  }

  createTrackSegment(zPos, isSafeStartingArea = false) {
    const segmentGroup = new THREE.Group();
    segmentGroup.position.z = zPos;

    // 1. Road Plane
    const roadGeom = new THREE.PlaneGeometry(12, this.segmentLength);
    roadGeom.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeom, this.roadMat);
    roadMesh.receiveShadow = true;
    segmentGroup.add(roadMesh);

    // 2. Lane Dividers
    const lineGeom = new THREE.PlaneGeometry(0.12, this.segmentLength);
    lineGeom.rotateX(-Math.PI / 2);

    const leftLine = new THREE.Mesh(lineGeom, this.laneLineMat);
    leftLine.position.set(-1.75, 0.02, 0);
    segmentGroup.add(leftLine);

    const rightLine = new THREE.Mesh(lineGeom, this.laneLineMat);
    rightLine.position.set(1.75, 0.02, 0);
    segmentGroup.add(rightLine);

    // 3. Side Rails
    const railGeom = new THREE.BoxGeometry(0.35, 0.45, this.segmentLength);
    const leftRail = new THREE.Mesh(railGeom, this.railMat);
    leftRail.position.set(-6, 0.22, 0);
    segmentGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeom, this.railMat);
    rightRail.position.set(6, 0.22, 0);
    segmentGroup.add(rightRail);

    // 4. Overhead Arch Gateway
    const archGroup = this.createArch();
    archGroup.position.set(0, 0, -this.segmentLength / 2);
    segmentGroup.add(archGroup);

    // 5. Scenery props (Skyscrapers / Volcanic peaks / Planets)
    this.addSceneryProps(segmentGroup, zPos);

    this.scene.add(segmentGroup);
    this.segments.push({ group: segmentGroup, z: zPos });

    if (!isSafeStartingArea) {
      this.populateSegment(zPos);
    }
  }

  addSceneryProps(segmentGroup, zPos) {
    // Add floating roadside decorative objects
    const propCount = 2;
    for (let i = 0; i < propCount; i++) {
      const side = (i === 0) ? -1 : 1;
      const xOffset = side * (16 + Math.random() * 8);

      if (this.currentBiome === 'city') {
        // Futuristic Skyscraper
        const height = 20 + Math.random() * 30;
        const bGeom = new THREE.BoxGeometry(6, height, 8);
        const bMat = new THREE.MeshStandardMaterial({ color: 0x090f1f, roughness: 0.8 });
        const building = new THREE.Mesh(bGeom, bMat);
        building.position.set(xOffset, height / 2 - 5, 0);
        segmentGroup.add(building);
      } else if (this.currentBiome === 'lava') {
        // Volcanic Rock Spire
        const spireGeom = new THREE.ConeGeometry(4, 18, 5);
        const spireMat = new THREE.MeshStandardMaterial({ color: 0x1f0808, roughness: 0.9 });
        const spire = new THREE.Mesh(spireGeom, spireMat);
        spire.position.set(xOffset, 9 - 4, 0);
        segmentGroup.add(spire);
      } else if (this.currentBiome === 'nebula') {
        // Floating Ringed Planet or Asteroid
        const astGeom = new THREE.DodecahedronGeometry(3.5 + Math.random() * 2, 1);
        const astMat = new THREE.MeshStandardMaterial({ color: 0x3d1c5a, roughness: 0.5 });
        const asteroid = new THREE.Mesh(astGeom, astMat);
        asteroid.position.set(xOffset, 12 + Math.random() * 10, 0);
        segmentGroup.add(asteroid);
      } else if (this.currentBiome === 'abyss') {
        // Bioluminescent Abyssal Pillar
        const pilGeom = new THREE.CylinderGeometry(0.8, 1.4, 25, 8);
        const pilMat = new THREE.MeshStandardMaterial({ color: 0x052a22, emissive: 0x00ff88, emissiveIntensity: 0.2 });
        const pillar = new THREE.Mesh(pilGeom, pilMat);
        pillar.position.set(xOffset, 8, 0);
        segmentGroup.add(pillar);
      }
    }
  }

  createArch() {
    const arch = new THREE.Group();
    const pillarGeom = new THREE.BoxGeometry(0.8, 8, 0.8);
    const beamGeom = new THREE.BoxGeometry(14, 0.8, 0.8);

    const leftP = new THREE.Mesh(pillarGeom, this.archMat);
    leftP.position.set(-6.5, 4, 0);
    arch.add(leftP);

    const rightP = new THREE.Mesh(pillarGeom, this.archMat);
    rightP.position.set(6.5, 4, 0);
    arch.add(rightP);

    const topBeam = new THREE.Mesh(beamGeom, this.archMat);
    topBeam.position.set(0, 8, 0);
    arch.add(topBeam);

    const stripGeom = new THREE.BoxGeometry(12, 0.15, 0.85);
    const strip = new THREE.Mesh(stripGeom, this.archNeonMat);
    strip.position.set(0, 7.5, 0);
    arch.add(strip);

    return arch;
  }

  populateSegment(segmentZ) {
    const subSections = 4;
    const step = this.segmentLength / subSections;

    for (let i = 0; i < subSections; i++) {
      const itemZ = segmentZ - (i * step) + (Math.random() * 4 - 2);
      const laneIndex = Math.floor(Math.random() * 3);
      const laneX = this.lanes[laneIndex];
      const roll = Math.random();

      if (roll < 0.42) {
        this.spawnObstacle(laneX, itemZ, laneIndex);
      } else if (roll < 0.78) {
        this.spawnCrystalRow(laneX, itemZ);
      } else if (roll < 0.88) {
        this.spawnJumpPad(laneX, itemZ);
      } else if (roll < 0.96) {
        this.spawnPowerup(laneX, itemZ);
      }
    }
  }

  // Spawn Jump Pad Launchers
  spawnJumpPad(x, z) {
    const padGeom = new THREE.BoxGeometry(2.4, 0.25, 2.2);
    const pad = new THREE.Mesh(padGeom, this.jumpPadMat);
    pad.position.set(x, 0.12, z);

    // Glowing Arrow
    const arrowGeom = new THREE.ConeGeometry(0.5, 1.2, 3);
    arrowGeom.rotateX(-Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);
    arrow.position.set(0, 0.18, 0);
    pad.add(arrow);

    this.scene.add(pad);
    this.jumpPads.push({
      mesh: pad,
      x: x,
      z: z,
      box: new THREE.Box3()
    });

    // Spawn high elevated crystal chain in air above pad!
    for (let j = 1; j <= 4; j++) {
      const crystalGeom = new THREE.OctahedronGeometry(0.5, 0);
      const crystal = new THREE.Mesh(crystalGeom, this.goldCrystalMat);
      crystal.position.set(x, 3.5 + j * 1.5, z - (j * 4.5));
      this.scene.add(crystal);
      this.collectibles.push({
        mesh: crystal,
        z: crystal.position.z,
        x: x,
        points: 300,
        spinSpeed: 3.5
      });
    }
  }

  // Spawn Warp Portal Gate
  spawnWarpGate(z) {
    const gate = new THREE.Group();
    gate.position.set(0, 4.0, z);

    // Giant Glowing Portal Torus Ring
    const torusGeom = new THREE.TorusGeometry(5.0, 0.35, 16, 32);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95
    });
    const ring = new THREE.Mesh(torusGeom, torusMat);
    gate.add(ring);

    // Inner Portal Vortex
    const vortexGeom = new THREE.CircleGeometry(4.8, 32);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0xff00aa,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const vortex = new THREE.Mesh(vortexGeom, vortexMat);
    gate.add(vortex);

    this.scene.add(gate);
    this.warpGates.push({
      group: gate,
      ring: ring,
      vortex: vortex,
      z: z,
      passed: false
    });
  }

  spawnObstacle(x, z, laneIndex) {
    const typeRoll = Math.random();
    let obstacleMesh;
    let type = 'barrier';

    if (typeRoll < 0.4) {
      const geom = new THREE.BoxGeometry(2.4, 1.4, 0.8);
      obstacleMesh = new THREE.Mesh(geom, this.obstacleMat);
      obstacleMesh.position.set(x, 0.7, z);
      obstacleMesh.castShadow = true;
      type = 'barrier';

      const warnGeom = new THREE.BoxGeometry(2.42, 0.2, 0.82);
      const warnMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const warnStrip = new THREE.Mesh(warnGeom, warnMat);
      warnStrip.position.set(0, 0.4, 0);
      obstacleMesh.add(warnStrip);

    } else if (typeRoll < 0.7) {
      obstacleMesh = new THREE.Group();
      obstacleMesh.position.set(x, 1.8, z);

      const beamGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
      beamGeom.rotateZ(Math.PI / 2);
      const beam = new THREE.Mesh(beamGeom, this.laserMat);
      obstacleMesh.add(beam);

      const emitterGeom = new THREE.BoxGeometry(0.4, 0.6, 0.6);
      const emMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const leftEm = new THREE.Mesh(emitterGeom, emMat);
      leftEm.position.set(-1.6, 0, 0);
      obstacleMesh.add(leftEm);
      const rightEm = leftEm.clone();
      rightEm.position.set(1.6, 0, 0);
      obstacleMesh.add(rightEm);

      type = 'laser';
    } else {
      const geom = new THREE.OctahedronGeometry(0.9, 0);
      obstacleMesh = new THREE.Mesh(geom, this.obstacleMat);
      obstacleMesh.position.set(x, 0.9, z);
      type = 'spinner';
    }

    this.scene.add(obstacleMesh);
    this.obstacles.push({
      mesh: obstacleMesh,
      type: type,
      x: x,
      z: z,
      box: new THREE.Box3()
    });
  }

  spawnCrystalRow(x, startZ) {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const z = startZ - (i * 2.8);
      const geom = new THREE.OctahedronGeometry(0.5, 0);
      const mat = (i % 2 === 0) ? this.goldCrystalMat : this.cyanCrystalMat;
      const crystal = new THREE.Mesh(geom, mat);
      
      crystal.position.set(x, 1.0, z);
      crystal.castShadow = true;

      this.scene.add(crystal);
      this.collectibles.push({
        mesh: crystal,
        z: z,
        x: x,
        points: (mat === this.goldCrystalMat) ? 100 : 250,
        spinSpeed: 2.5 + Math.random()
      });
    }
  }

  spawnPowerup(x, z) {
    const isShield = Math.random() > 0.5;
    const geom = new THREE.DodecahedronGeometry(0.65, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: isShield ? 0x00ff88 : 0xff00aa,
      emissive: isShield ? 0x00ff88 : 0xff00aa,
      emissiveIntensity: 0.9
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, 1.2, z);

    const haloGeom = new THREE.TorusGeometry(0.9, 0.04, 8, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: isShield ? 0x00ff88 : 0xff00aa });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    mesh.add(halo);

    this.scene.add(mesh);
    this.powerups.push({
      mesh: mesh,
      halo: halo,
      type: isShield ? 'shield' : 'boost',
      z: z,
      x: x
    });
  }

  update(delta, playerZ, gameSpeed) {
    // 1. Recycle Track Segments
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      if (seg.z > playerZ + this.segmentLength) {
        const furthestZ = Math.min(...this.segments.map(s => s.z));
        seg.z = furthestZ - this.segmentLength;
        seg.group.position.z = seg.z;
        this.populateSegment(seg.z);
      }
    }

    // 2. Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.type === 'spinner') {
        obs.mesh.rotation.y += 4 * delta;
        obs.mesh.rotation.x += 2 * delta;
      } else if (obs.type === 'laser') {
        obs.mesh.scale.y = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
      }
      obs.box.setFromObject(obs.mesh);

      if (obs.mesh.position.z > playerZ + 15) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 3. Jump Pads
    for (let i = this.jumpPads.length - 1; i >= 0; i--) {
      const pad = this.jumpPads[i];
      pad.box.setFromObject(pad.mesh);
      if (pad.mesh.position.z > playerZ + 15) {
        this.scene.remove(pad.mesh);
        this.jumpPads.splice(i, 1);
      }
    }

    // 4. Warp Gates
    for (let i = this.warpGates.length - 1; i >= 0; i--) {
      const gate = this.warpGates[i];
      gate.ring.rotation.z += 2 * delta;
      gate.vortex.rotation.z -= 1.5 * delta;

      if (gate.group.position.z > playerZ + 25) {
        this.scene.remove(gate.group);
        this.warpGates.splice(i, 1);
      }
    }

    // 5. Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.mesh.rotation.y += col.spinSpeed * delta;
      col.mesh.position.y += Math.sin(Date.now() * 0.005 + col.z) * 0.005;

      if (col.mesh.position.z > playerZ + 15) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    // 6. Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pow = this.powerups[i];
      pow.mesh.rotation.y += 2 * delta;
      pow.halo.rotation.z += 3 * delta;

      if (pow.mesh.position.z > playerZ + 15) {
        this.scene.remove(pow.mesh);
        this.powerups.splice(i, 1);
      }
    }
  }

  pullCollectibles(playerPos, radius = 6) {
    for (let col of this.collectibles) {
      const dist = col.mesh.position.distanceTo(playerPos);
      if (dist < radius) {
        col.mesh.position.lerp(playerPos, 0.18);
      }
    }
  }

  reset() {
    for (let obs of this.obstacles) this.scene.remove(obs.mesh);
    for (let col of this.collectibles) this.scene.remove(col.mesh);
    for (let pow of this.powerups) this.scene.remove(pow.mesh);
    for (let pad of this.jumpPads) this.scene.remove(pad.mesh);
    for (let gate of this.warpGates) this.scene.remove(gate.group);

    this.obstacles = [];
    this.collectibles = [];
    this.powerups = [];
    this.jumpPads = [];
    this.warpGates = [];

    for (let i = 0; i < this.segments.length; i++) {
      const zPos = -i * this.segmentLength;
      this.segments[i].z = zPos;
      this.segments[i].group.position.z = zPos;
    }
  }
}
