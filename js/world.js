/**
 * 3D Fantasy Worlds Manager (Candy Kingdom, Cloud Castle, Crystal Realm, Pharaoh Oasis)
 */
class WorldManager {
  constructor(scene) {
    this.scene = scene;

    this.lanes = [-3.5, 0, 3.5];
    this.segmentLength = 60;
    this.visibleSegments = 5;
    this.segments = [];

    // Entities
    this.obstacles = [];
    this.collectibles = [];
    this.powerups = [];
    this.jumpPads = [];
    this.warpGates = [];
    this.sceneryProps = [];
    this.clouds = [];

    // Biomes: 'candy' | 'castle' | 'crystal' | 'oasis'
    this.currentBiome = 'candy';

    this.initBiomesData();
    this.initMaterials();
    this.initSkyElements();
    this.initTrack();
  }

  initBiomesData() {
    this.biomes = {
      candy: {
        name: 'مملكة الحلوى والسكاكر',
        icon: '🍭',
        skyColor: 0xf8bbd0,        // Sweet pastel pink sky
        fogColor: 0xfce4ec,        // Marshmallow horizon
        groundColor: 0xf48fb1,     // Strawberry Pink Jelly
        roadColor: 0x4e342e,       // Rich Chocolate path
        borderCol: 0xff4081,       // Neon Cotton Candy
        decorType: 'candy'
      },
      castle: {
        name: 'قلعة الغيوم وقوس قزح',
        icon: '🏰',
        skyColor: 0x81d4fa,        // Radiant Sky Blue
        fogColor: 0xe1f5fe,        // Fluffy cloud horizon
        groundColor: 0xffffff,     // Pure Cloud Sea
        roadColor: 0xfff8e1,       // Gold Inlaid White Marble
        borderCol: 0xffd700,       // Radiant Gold
        decorType: 'castle'
      },
      crystal: {
        name: 'كوكب الكريستال السديمي',
        icon: '🪐',
        skyColor: 0x311b92,        // Deep Nebula Violet
        fogColor: 0x7b1fa2,        // Glowing Stardust
        groundColor: 0x12005e,     // Deep Void
        roadColor: 0x7c4dff,       // Glowing Crystal Glass
        borderCol: 0x00e5ff,       // Cyan Luminescence
        decorType: 'crystal'
      },
      oasis: {
        name: 'واحة الأهرامات الذهبية',
        icon: '🏺',
        skyColor: 0xff9800,        // Warm Sunset Gold
        fogColor: 0xffe082,        // Sunlit horizon
        groundColor: 0xffd54f,     // Golden Desert
        roadColor: 0xd7ccc8,       // Ancient Stone Slabs
        borderCol: 0xffb300,       // Ancient Gold
        decorType: 'oasis'
      }
    };
  }

  initMaterials() {
    const b = this.biomes.candy;

    this.groundMat = new THREE.MeshStandardMaterial({ color: b.groundColor, roughness: 0.8 });
    this.roadMat = new THREE.MeshStandardMaterial({ color: b.roadColor, roughness: 0.6, metalness: 0.2 });
    this.pathBorderMat = new THREE.MeshStandardMaterial({ color: b.borderCol, roughness: 0.4, metalness: 0.3 });

    // Candy Materials
    this.lollipopPinkMat = new THREE.MeshStandardMaterial({ color: 0xff4081, roughness: 0.2 });
    this.lollipopYellowMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.2 });
    this.donutBreadMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 });
    this.donutFrostingMat = new THREE.MeshStandardMaterial({ color: 0xff80ab, roughness: 0.3 });
    this.cottonTrunkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

    // Castle Materials
    this.goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    this.marbleWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });

    // Crystal Materials
    this.crystalPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xba68c8,
      emissive: 0x7b1fa2,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9
    });
    this.crystalTealMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00b0ff,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.9
    });

    // Pyramid Material
    this.pyramidGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      emissive: 0xff8f00,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.3
    });

    // Collectibles Materials
    this.goldenAppleMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffa000,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8
    });
    this.hourglassMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00bcd4,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    // Obstacle Materials
    this.donutObstacleMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.7 });
    this.electricTotemMat = new THREE.MeshStandardMaterial({
      color: 0x212121,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8
    });
    this.crystalBoulderMat = new THREE.MeshStandardMaterial({
      color: 0x9c27b0,
      emissive: 0xba68c8,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });

    // Jump Pad
    this.shroomStalkMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.shroomCapMat = new THREE.MeshStandardMaterial({
      color: 0xff4081,
      emissive: 0xf50057,
      emissiveIntensity: 0.4
    });
  }

  initSkyElements() {
    // Rainbow in Cloud Castle / Candy
    const rainbowGeom = new THREE.TorusGeometry(80, 4, 16, 32, Math.PI);
    const rainbowMat = new THREE.MeshBasicMaterial({
      color: 0xff80ab,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    this.rainbowMesh = new THREE.Mesh(rainbowGeom, rainbowMat);
    this.rainbowMesh.position.set(0, -10, -160);
    this.scene.add(this.rainbowMesh);

    // Floating Clouds
    const cloudCount = 16;
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });

    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();
      for (let p = 0; p < 4; p++) {
        const size = 4.0 + Math.random() * 3.5;
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 1), cloudMat);
        mesh.position.set((p - 2) * 4.0, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        cloudGroup.add(mesh);
      }
      cloudGroup.position.set((Math.random() - 0.5) * 160, 32 + Math.random() * 20, -Math.random() * 250);
      this.scene.add(cloudGroup);
      this.clouds.push({ group: cloudGroup, speed: 1.5 + Math.random() * 2 });
    }
  }

  setBiome(biomeKey) {
    if (!this.biomes[biomeKey]) return;
    this.currentBiome = biomeKey;
    const b = this.biomes[biomeKey];

    this.groundMat.color.setHex(b.groundColor);
    this.roadMat.color.setHex(b.roadColor);
    this.pathBorderMat.color.setHex(b.borderCol);

    if (this.scene.fog) {
      this.scene.fog.color.setHex(b.fogColor);
      this.scene.background.setHex(b.skyColor);
    }
  }

  initTrack() {
    for (let i = 0; i < this.visibleSegments; i++) {
      const zPos = -i * this.segmentLength;
      this.createTrackSegment(zPos, i === 0);
    }
  }

  createTrackSegment(zPos, isSafe = false) {
    const segmentGroup = new THREE.Group();
    segmentGroup.position.z = zPos;

    // 1. Wide Ground Plane
    const groundGeom = new THREE.PlaneGeometry(80, this.segmentLength);
    groundGeom.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeom, this.groundMat);
    groundMesh.receiveShadow = true;
    segmentGroup.add(groundMesh);

    // 2. Central Pathway
    const pathGeom = new THREE.PlaneGeometry(11.5, this.segmentLength);
    pathGeom.rotateX(-Math.PI / 2);
    const pathMesh = new THREE.Mesh(pathGeom, this.roadMat);
    pathMesh.position.y = 0.02;
    pathMesh.receiveShadow = true;
    segmentGroup.add(pathMesh);

    // 3. Glowing Borders
    const borderGeom = new THREE.BoxGeometry(0.4, 0.3, this.segmentLength);
    const lBorder = new THREE.Mesh(borderGeom, this.pathBorderMat); lBorder.position.set(-5.8, 0.15, 0); segmentGroup.add(lBorder);
    const rBorder = new THREE.Mesh(borderGeom, this.pathBorderMat); rBorder.position.set(5.8, 0.15, 0); segmentGroup.add(rBorder);

    // 4. Fantasy Decorative Props
    this.addFantasyProps(segmentGroup);

    this.scene.add(segmentGroup);
    this.segments.push({ group: segmentGroup, z: zPos });

    if (!isSafe) {
      this.populateSegment(zPos);
    }
  }

  addFantasyProps(segmentGroup) {
    const count = 4;
    const step = this.segmentLength / count;

    for (let i = 0; i < count; i++) {
      const zOffset = -i * step;
      const leftDist = -9 - Math.random() * 16;
      const rightDist = 9 + Math.random() * 16;

      const lProp = this.createBiomeDecor();
      lProp.position.set(leftDist, 0, zOffset);
      segmentGroup.add(lProp);

      const rProp = this.createBiomeDecor();
      rProp.position.set(rightDist, 0, zOffset);
      segmentGroup.add(rProp);
    }
  }

  createBiomeDecor() {
    const group = new THREE.Group();

    if (this.currentBiome === 'candy') {
      // 🍭 Swirling Giant Lollipop or Donut
      if (Math.random() > 0.5) {
        const stickGeom = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
        const stick = new THREE.Mesh(stickGeom, this.cottonTrunkMat);
        stick.position.y = 2.5;
        group.add(stick);

        const popGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 16);
        popGeom.rotateX(Math.PI / 2);
        const pop = new THREE.Mesh(popGeom, this.lollipopPinkMat);
        pop.position.y = 5.2;
        group.add(pop);
      } else {
        // Frosted Giant Donut
        const donutGeom = new THREE.TorusGeometry(2.0, 0.7, 12, 20);
        const donut = new THREE.Mesh(donutGeom, this.donutFrostingMat);
        donut.position.y = 2.8;
        donut.rotation.y = Math.random() * Math.PI;
        group.add(donut);
      }
    } else if (this.currentBiome === 'castle') {
      // 🏰 Floating Fairy Castle Tower
      const towerGeom = new THREE.CylinderGeometry(1.2, 1.6, 8, 8);
      const tower = new THREE.Mesh(towerGeom, this.marbleWhiteMat);
      tower.position.y = 4;
      group.add(tower);

      const domeGeom = new THREE.ConeGeometry(1.8, 3.5, 8);
      const dome = new THREE.Mesh(domeGeom, this.goldTrimMat);
      dome.position.y = 9.5;
      group.add(dome);
    } else if (this.currentBiome === 'crystal') {
      // 🪐 Crystal Spire
      const spireGeom = new THREE.ConeGeometry(1.4, 7, 5);
      const spire = new THREE.Mesh(spireGeom, (Math.random() > 0.5) ? this.crystalPurpleMat : this.crystalTealMat);
      spire.position.y = 3.5;
      spire.rotation.z = (Math.random() - 0.5) * 0.3;
      group.add(spire);
    } else {
      // 🏺 Floating Mini Golden Pyramid
      const pyrGeom = new THREE.ConeGeometry(3.2, 4.5, 4);
      const pyr = new THREE.Mesh(pyrGeom, this.pyramidGoldMat);
      pyr.position.y = 4.5 + Math.random() * 3;
      pyr.rotation.y = Math.PI / 4;
      group.add(pyr);
    }

    const scale = 0.8 + Math.random() * 0.4;
    group.scale.set(scale, scale, scale);
    return group;
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
        this.spawnFantasyObstacle(laneX, itemZ, laneIndex);
      } else if (roll < 0.78) {
        this.spawnCollectiblesRow(laneX, itemZ);
      } else if (roll < 0.88) {
        this.spawnHourglassItem(laneX, itemZ);
      } else if (roll < 0.94) {
        this.spawnMushroomJumpPad(laneX, itemZ);
      } else {
        this.spawnPowerup(laneX, itemZ);
      }
    }
  }

  // ⚠️ Fantasy Obstacles (Rolling Donuts, Electric Totems, Crystal Boulders)
  spawnFantasyObstacle(x, z, laneIndex) {
    const typeRoll = Math.random();
    let mesh;
    let type = 'donut';

    if (typeRoll < 0.4) {
      // 🍩 Rolling Giant Donut / Wheel Obstacle
      const geom = new THREE.TorusGeometry(1.2, 0.4, 10, 16);
      mesh = new THREE.Mesh(geom, this.donutObstacleMat);
      mesh.position.set(x, 1.2, z);
      mesh.castShadow = true;
      type = 'donut';
    } else if (typeRoll < 0.7) {
      // ⚡ Electric Magic Totem Tower
      mesh = new THREE.Group();
      mesh.position.set(x, 1.5, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3.0, 8), this.electricTotemMat);
      mesh.add(pole);

      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), this.crystalTealMat);
      orb.position.y = 1.6;
      mesh.add(orb);

      type = 'totem';
    } else {
      // 🪨 Rolling Crystal Boulder
      const geom = new THREE.DodecahedronGeometry(0.9, 1);
      mesh = new THREE.Mesh(geom, this.crystalBoulderMat);
      mesh.position.set(x, 0.9, z);
      mesh.castShadow = true;
      type = 'boulder';
    }

    this.scene.add(mesh);
    this.obstacles.push({
      mesh: mesh,
      type: type,
      x: x,
      z: z,
      box: new THREE.Box3()
    });
  }

  // ⏳ Hourglass Collectible (Time Attack Mode Bonus Time)
  spawnHourglassItem(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 1.2, z);

    const topCone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 6), this.hourglassMat);
    topCone.position.y = 0.3;
    group.add(topCone);

    const btmCone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 6), this.hourglassMat);
    btmCone.position.y = -0.3;
    btmCone.rotation.x = Math.PI;
    group.add(btmCone);

    this.scene.add(group);
    this.collectibles.push({
      mesh: group,
      z: z,
      x: x,
      isHourglass: true,
      points: 200,
      spinSpeed: 3.5
    });
  }

  // Collectibles (Golden Apples & Star Gems)
  spawnCollectiblesRow(x, startZ) {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const z = startZ - (i * 2.8);
      const isStar = (i === 1);
      
      const geom = isStar ? new THREE.OctahedronGeometry(0.55, 0) : new THREE.SphereGeometry(0.48, 8, 8);
      const mat = isStar ? this.crystalTealMat : this.goldenAppleMat;
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, 1.0, z);

      this.scene.add(mesh);
      this.collectibles.push({
        mesh: mesh,
        z: z,
        x: x,
        points: isStar ? 250 : 100,
        spinSpeed: 2.8
      });
    }
  }

  // 🍄 Mushroom Bouncer Jump Pad
  spawnMushroomJumpPad(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.0, 8), this.shroomStalkMat);
    stalk.position.y = 0.5;
    group.add(stalk);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), this.shroomCapMat);
    cap.position.y = 0.9;
    group.add(cap);

    this.scene.add(group);
    this.jumpPads.push({ mesh: group, x: x, z: z, box: new THREE.Box3() });

    for (let j = 1; j <= 4; j++) {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), this.goldenAppleMat);
      star.position.set(x, 3.5 + j * 1.5, z - (j * 4.5));
      this.scene.add(star);
      this.collectibles.push({ mesh: star, z: star.position.z, x: x, points: 300, spinSpeed: 3.5 });
    }
  }

  spawnPowerup(x, z) {
    const isShield = Math.random() > 0.5;
    const geom = new THREE.DodecahedronGeometry(0.65, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: isShield ? 0x00e676 : 0xff1744,
      emissive: isShield ? 0x00e676 : 0xff1744,
      emissiveIntensity: 0.8
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, 1.2, z);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 8, 16), new THREE.MeshBasicMaterial({ color: isShield ? 0x00e676 : 0xff1744 }));
    mesh.add(halo);

    this.scene.add(mesh);
    this.powerups.push({ mesh: mesh, halo: halo, type: isShield ? 'shield' : 'boost', z: z, x: x });
  }

  spawnWarpGate(z) {
    const gate = new THREE.Group();
    gate.position.set(0, 4.0, z);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.4, 16, 32), this.crystalTealMat);
    gate.add(ring);

    const vortex = new THREE.Mesh(new THREE.CircleGeometry(4.8, 32), new THREE.MeshBasicMaterial({ color: 0xff4081, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
    gate.add(vortex);

    this.scene.add(gate);
    this.warpGates.push({ group: gate, ring: ring, vortex: vortex, z: z, passed: false });
  }

  update(delta, playerZ, gameSpeed) {
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      if (seg.z > playerZ + this.segmentLength) {
        const furthestZ = Math.min(...this.segments.map(s => s.z));
        seg.z = furthestZ - this.segmentLength;
        seg.group.position.z = seg.z;
        this.populateSegment(seg.z);
      }
    }

    for (let c of this.clouds) {
      c.group.position.z += c.speed * delta;
      if (c.group.position.z > playerZ + 40) {
        c.group.position.z = playerZ - 240;
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.type === 'donut' || obs.type === 'boulder') {
        obs.mesh.rotation.x -= 6 * delta;
      } else if (obs.type === 'totem') {
        obs.mesh.rotation.y += 2 * delta;
      }
      obs.box.setFromObject(obs.mesh);

      if (obs.mesh.position.z > playerZ + 15) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.jumpPads.length - 1; i >= 0; i--) {
      const pad = this.jumpPads[i];
      pad.box.setFromObject(pad.mesh);
      if (pad.mesh.position.z > playerZ + 15) {
        this.scene.remove(pad.mesh);
        this.jumpPads.splice(i, 1);
      }
    }

    for (let i = this.warpGates.length - 1; i >= 0; i--) {
      const gate = this.warpGates[i];
      gate.ring.rotation.z += 1.5 * delta;
      gate.vortex.rotation.z -= 1.0 * delta;
      if (gate.group.position.z > playerZ + 25) {
        this.scene.remove(gate.group);
        this.warpGates.splice(i, 1);
      }
    }

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.mesh.rotation.y += col.spinSpeed * delta;
      if (col.mesh.position.z > playerZ + 15) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pow = this.powerups[i];
      pow.mesh.rotation.y += 2 * delta;
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
        col.mesh.position.lerp(playerPos, 0.2);
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
