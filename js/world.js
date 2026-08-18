/**
 * Vibrant Nature World Manager - Living Biomes with Trees, 3D Animals & Clouds
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
    this.animals = [];
    this.clouds = [];

    // Active Biome: 'forest' | 'savannah' | 'winter' | 'jungle'
    this.currentBiome = 'forest';

    this.initBiomesData();
    this.initMaterials();
    this.initSkyClouds();
    this.initTrack();
  }

  initBiomesData() {
    this.biomes = {
      forest: {
        name: 'الغابة الساحرة',
        icon: '🌲',
        skyColor: 0x64b5f6,        // Vibrant sky blue
        fogColor: 0xbbdefb,        // Soft bright horizon
        ambientColor: 0xffffff,    // Bright natural daylight
        groundColor: 0x4caf50,     // Fresh lush green grass
        roadColor: 0x8d6e63,       // Natural wooden stone path
        borderGrassColor: 0x388e3c,
        treeType: 'forest',
        animalType: 'deer_rabbit'
      },
      savannah: {
        name: 'السافانا وواحة النخيل',
        icon: '🌴',
        skyColor: 0xffb74d,        // Warm golden sunset sky
        fogColor: 0xffe082,        // Golden warm horizon
        ambientColor: 0xfff8e1,    // Warm sunshine
        groundColor: 0xfbc02d,     // Golden savannah sand & grass
        roadColor: 0xd7ccc8,       // Light stone path
        borderGrassColor: 0xf57f17,
        treeType: 'palm',
        animalType: 'camel'
      },
      winter: {
        name: 'غابة الثلج والقطب',
        icon: '❄️',
        skyColor: 0x90caf9,        // Crisp arctic blue
        fogColor: 0xe1f5fe,        // Pure white frost
        ambientColor: 0xf5f5f5,    // Crisp white light
        groundColor: 0xffffff,     // Pure snow
        roadColor: 0xb0bec5,       // Frosted ice path
        borderGrassColor: 0xe0e0e0,
        treeType: 'snow_pine',
        animalType: 'penguin'
      },
      jungle: {
        name: 'الغابة الاستوائية',
        icon: '🌿',
        skyColor: 0x4db6ac,        // Tropical turquoise
        fogColor: 0xb2dfdb,        // Misty tropical horizon
        ambientColor: 0xffffff,    // Rich daylight
        groundColor: 0x2e7d32,     // Deep jungle moss
        roadColor: 0x5d4037,       // Forest dirt trail
        borderGrassColor: 0x1b5e20,
        treeType: 'jungle',
        animalType: 'bird_deer'
      }
    };
  }

  initMaterials() {
    const b = this.biomes.forest;

    // Ground & Path Materials
    this.groundMat = new THREE.MeshStandardMaterial({
      color: b.groundColor,
      roughness: 0.9,
      metalness: 0.05
    });

    this.roadMat = new THREE.MeshStandardMaterial({
      color: b.roadColor,
      roughness: 0.85,
      metalness: 0.05
    });

    this.pathBorderMat = new THREE.MeshStandardMaterial({
      color: 0x6d4c41,
      roughness: 0.9
    });

    // Foliage Materials
    this.leavesGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
    this.leavesPinkMat = new THREE.MeshStandardMaterial({ color: 0xf06292, roughness: 0.7 });
    this.leavesLightGreenMat = new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.8 });
    this.leavesSnowMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    this.woodTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
    this.palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.9 });

    // Animal Materials
    this.deerBodyMat = new THREE.MeshStandardMaterial({ color: 0xa16238, roughness: 0.7 });
    this.deerSpotsMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.deerAntlerMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
    this.rabbitWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    this.camelMat = new THREE.MeshStandardMaterial({ color: 0xc19a6b, roughness: 0.8 });
    this.penguinBlackMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.4 });
    this.penguinWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    this.penguinBeakMat = new THREE.MeshStandardMaterial({ color: 0xff9800 });

    // Nature Collectibles (Golden Apple, Diamond, Magic Berry)
    this.goldenAppleMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffa000,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.6
    });

    this.cyanGemMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00b0ff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8
    });

    // Nature Obstacles (Wood Log, River Boulder, Thorny Hedge)
    this.woodLogMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    this.rockMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.85 });

    // Mushroom Bouncer Jump Pad
    this.shroomStalkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    this.shroomCapMat = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      emissive: 0xd32f2f,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
  }

  // Floating Soft Clouds in the Sky
  initSkyClouds() {
    const cloudCount = 18;
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();
      const puffs = 4 + Math.floor(Math.random() * 3);

      for (let p = 0; p < puffs; p++) {
        const size = 3.5 + Math.random() * 4;
        const geom = new THREE.DodecahedronGeometry(size, 1);
        const mesh = new THREE.Mesh(geom, cloudMat);
        mesh.position.set(
          (p - puffs / 2) * 3.5 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 2
        );
        cloudGroup.add(mesh);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 160,
        35 + Math.random() * 25,
        -Math.random() * 250
      );

      this.scene.add(cloudGroup);
      this.clouds.push({
        group: cloudGroup,
        speed: 1.5 + Math.random() * 2.5
      });
    }
  }

  setBiome(biomeKey) {
    if (!this.biomes[biomeKey]) return;
    this.currentBiome = biomeKey;
    const b = this.biomes[biomeKey];

    // Update Ground and Path Colors
    this.groundMat.color.setHex(b.groundColor);
    this.roadMat.color.setHex(b.roadColor);

    // Update Sky & Fog
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

  createTrackSegment(zPos, isSafeStartingArea = false) {
    const segmentGroup = new THREE.Group();
    segmentGroup.position.z = zPos;

    // 1. Wide Lush Grass Terrain Plane
    const groundGeom = new THREE.PlaneGeometry(80, this.segmentLength);
    groundGeom.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeom, this.groundMat);
    groundMesh.receiveShadow = true;
    segmentGroup.add(groundMesh);

    // 2. Central 3-Lane Cobblestone / Dirt Pathway
    const pathGeom = new THREE.PlaneGeometry(11.5, this.segmentLength);
    pathGeom.rotateX(-Math.PI / 2);
    const pathMesh = new THREE.Mesh(pathGeom, this.roadMat);
    pathMesh.position.y = 0.02;
    pathMesh.receiveShadow = true;
    segmentGroup.add(pathMesh);

    // 3. Wooden / Stone Path Borders
    const borderGeom = new THREE.BoxGeometry(0.35, 0.25, this.segmentLength);
    const leftBorder = new THREE.Mesh(borderGeom, this.pathBorderMat);
    leftBorder.position.set(-5.8, 0.12, 0);
    segmentGroup.add(leftBorder);

    const rightBorder = new THREE.Mesh(borderGeom, this.pathBorderMat);
    rightBorder.position.set(5.8, 0.12, 0);
    segmentGroup.add(rightBorder);

    // 4. Populate Trees & Foliage
    this.addTreesToSegment(segmentGroup);

    // 5. Populate Lively 3D Animals
    this.addAnimalsToSegment(segmentGroup);

    this.scene.add(segmentGroup);
    this.segments.push({ group: segmentGroup, z: zPos });

    if (!isSafeStartingArea) {
      this.populateSegment(zPos);
    }
  }

  // Build Procedural Trees
  addTreesToSegment(segmentGroup) {
    const treeCount = 8;
    const step = this.segmentLength / treeCount;

    for (let i = 0; i < treeCount; i++) {
      const zOffset = -i * step + (Math.random() * 4 - 2);

      // Left Tree
      const leftDist = -8.5 - Math.random() * 18;
      const leftTree = this.createRandomTree();
      leftTree.position.set(leftDist, 0, zOffset);
      segmentGroup.add(leftTree);

      // Right Tree
      const rightDist = 8.5 + Math.random() * 18;
      const rightTree = this.createRandomTree();
      rightTree.position.set(rightDist, 0, zOffset);
      segmentGroup.add(rightTree);
    }
  }

  createRandomTree() {
    const group = new THREE.Group();

    if (this.currentBiome === 'savannah') {
      // 🌴 Palm Tree
      const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, 6, 6);
      const trunk = new THREE.Mesh(trunkGeom, this.palmTrunkMat);
      trunk.position.y = 3;
      trunk.rotation.z = (Math.random() - 0.5) * 0.15;
      trunk.castShadow = true;
      group.add(trunk);

      // Palm Fronds
      for (let f = 0; f < 5; f++) {
        const frondGeom = new THREE.BoxGeometry(0.6, 0.1, 3.2);
        const frond = new THREE.Mesh(frondGeom, this.leavesGreenMat);
        frond.position.set(0, 5.8, 0);
        frond.rotation.y = (f / 5) * Math.PI * 2;
        frond.rotation.x = 0.45;
        group.add(frond);
      }
    } else if (this.currentBiome === 'winter') {
      // ❄️ Snow-covered Fir Pine
      const trunkGeom = new THREE.CylinderGeometry(0.35, 0.55, 3, 6);
      const trunk = new THREE.Mesh(trunkGeom, this.woodTrunkMat);
      trunk.position.y = 1.5;
      group.add(trunk);

      for (let layer = 0; layer < 3; layer++) {
        const coneGeom = new THREE.ConeGeometry(2.6 - layer * 0.6, 2.5, 6);
        const mat = (layer === 0) ? this.leavesGreenMat : this.leavesSnowMat;
        const cone = new THREE.Mesh(coneGeom, mat);
        cone.position.y = 3.0 + layer * 1.5;
        cone.castShadow = true;
        group.add(cone);
      }
    } else {
      // 🌲 Forest / Blossom Leafy Tree
      const isBlossom = Math.random() > 0.6;
      const trunkGeom = new THREE.CylinderGeometry(0.4, 0.65, 3.5, 6);
      const trunk = new THREE.Mesh(trunkGeom, this.woodTrunkMat);
      trunk.position.y = 1.75;
      trunk.castShadow = true;
      group.add(trunk);

      // Fluffy Canopy Spheres
      const canopyMat = isBlossom ? this.leavesPinkMat : this.leavesGreenMat;
      const mainCanopyGeom = new THREE.DodecahedronGeometry(2.4, 1);
      const mainCanopy = new THREE.Mesh(mainCanopyGeom, canopyMat);
      mainCanopy.position.y = 4.6;
      mainCanopy.castShadow = true;
      group.add(mainCanopy);

      // Extra Puff
      const subCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), canopyMat);
      subCanopy.position.set(1.0, 4.2, 0.5);
      group.add(subCanopy);
    }

    const scale = 0.85 + Math.random() * 0.4;
    group.scale.set(scale, scale, scale);
    return group;
  }

  // Build Procedural 3D Animals
  addAnimalsToSegment(segmentGroup) {
    if (Math.random() > 0.4) {
      const side = (Math.random() > 0.5) ? 1 : -1;
      const x = side * (7.5 + Math.random() * 6);
      const z = -(Math.random() * this.segmentLength);

      let animalGroup;
      if (this.currentBiome === 'savannah') {
        animalGroup = this.createCamel();
      } else if (this.currentBiome === 'winter') {
        animalGroup = this.createPenguin();
      } else {
        animalGroup = (Math.random() > 0.5) ? this.createDeer() : this.createRabbit();
      }

      animalGroup.position.set(x, 0, z);
      // Face towards track or forward
      animalGroup.rotation.y = (side > 0) ? -Math.PI / 3 : Math.PI / 3;
      segmentGroup.add(animalGroup);

      this.animals.push({
        group: animalGroup,
        type: animalGroup.userData.type || 'deer',
        animTimer: Math.random() * 5
      });
    }
  }

  // 🦌 3D Deer Model
  createDeer() {
    const deer = new THREE.Group();
    deer.userData.type = 'deer';

    // Body
    const bodyGeom = new THREE.BoxGeometry(0.9, 0.9, 1.8);
    const body = new THREE.Mesh(bodyGeom, this.deerBodyMat);
    body.position.y = 1.4;
    body.castShadow = true;
    deer.add(body);

    // 4 Legs
    const legGeom = new THREE.BoxGeometry(0.2, 1.1, 0.2);
    const fl = new THREE.Mesh(legGeom, this.deerBodyMat); fl.position.set(0.35, 0.55, -0.6); deer.add(fl);
    const fr = fl.clone(); fr.position.set(-0.35, 0.55, -0.6); deer.add(fr);
    const bl = fl.clone(); bl.position.set(0.35, 0.55, 0.6); deer.add(bl);
    const br = fl.clone(); br.position.set(-0.35, 0.55, 0.6); deer.add(br);

    // Neck & Head
    const neckGeom = new THREE.BoxGeometry(0.35, 0.9, 0.45);
    const neck = new THREE.Mesh(neckGeom, this.deerBodyMat);
    neck.position.set(0, 2.1, -0.8);
    neck.rotation.x = -0.35;
    deer.add(neck);

    const headGeom = new THREE.BoxGeometry(0.45, 0.45, 0.7);
    const head = new THREE.Mesh(headGeom, this.deerBodyMat);
    head.position.set(0, 2.5, -1.1);
    deer.add(head);
    deer.userData.headMesh = head;

    // Antlers
    const antGeom = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    const lAnt = new THREE.Mesh(antGeom, this.deerAntlerMat);
    lAnt.position.set(0.2, 2.9, -1.0);
    lAnt.rotation.z = 0.3;
    deer.add(lAnt);

    const rAnt = lAnt.clone();
    rAnt.position.set(-0.2, 2.9, -1.0);
    rAnt.rotation.z = -0.3;
    deer.add(rAnt);

    const s = 0.85;
    deer.scale.set(s, s, s);
    return deer;
  }

  // 🐇 3D Rabbit Model
  createRabbit() {
    const rabbit = new THREE.Group();
    rabbit.userData.type = 'rabbit';

    // Body
    const bodyGeom = new THREE.SphereGeometry(0.45, 8, 8);
    const body = new THREE.Mesh(bodyGeom, this.rabbitWhiteMat);
    body.position.y = 0.45;
    rabbit.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(0.32, 8, 8);
    const head = new THREE.Mesh(headGeom, this.rabbitWhiteMat);
    head.position.set(0, 0.75, -0.35);
    rabbit.add(head);

    // Ears
    const earGeom = new THREE.BoxGeometry(0.1, 0.5, 0.15);
    const lEar = new THREE.Mesh(earGeom, this.rabbitWhiteMat);
    lEar.position.set(0.12, 1.1, -0.3);
    lEar.rotation.z = 0.15;
    rabbit.add(lEar);

    const rEar = lEar.clone();
    rEar.position.set(-0.12, 1.1, -0.3);
    rEar.rotation.z = -0.15;
    rabbit.add(rEar);

    // Fluffy Tail
    const tailGeom = new THREE.SphereGeometry(0.16, 6, 6);
    const tail = new THREE.Mesh(tailGeom, this.rabbitWhiteMat);
    tail.position.set(0, 0.45, 0.45);
    rabbit.add(tail);

    const s = 0.8;
    rabbit.scale.set(s, s, s);
    return rabbit;
  }

  // 🐪 3D Camel Model
  createCamel() {
    const camel = new THREE.Group();
    camel.userData.type = 'camel';

    // Body & Hump
    const bodyGeom = new THREE.BoxGeometry(1.1, 1.2, 2.2);
    const body = new THREE.Mesh(bodyGeom, this.camelMat);
    body.position.y = 1.8;
    camel.add(body);

    const humpGeom = new THREE.SphereGeometry(0.65, 8, 8);
    const hump = new THREE.Mesh(humpGeom, this.camelMat);
    hump.position.set(0, 2.6, 0);
    camel.add(hump);

    // 4 Long Legs
    const legGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.4, 6);
    const fl = new THREE.Mesh(legGeom, this.camelMat); fl.position.set(0.45, 0.7, -0.8); camel.add(fl);
    const fr = fl.clone(); fr.position.set(-0.45, 0.7, -0.8); camel.add(fr);
    const bl = fl.clone(); bl.position.set(0.45, 0.7, 0.8); camel.add(bl);
    const br = fl.clone(); br.position.set(-0.45, 0.7, 0.8); camel.add(br);

    // Curved Neck & Head
    const neckGeom = new THREE.BoxGeometry(0.4, 1.4, 0.5);
    const neck = new THREE.Mesh(neckGeom, this.camelMat);
    neck.position.set(0, 2.8, -1.0);
    neck.rotation.x = -0.4;
    camel.add(neck);

    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.8);
    const head = new THREE.Mesh(headGeom, this.camelMat);
    head.position.set(0, 3.6, -1.4);
    camel.add(head);

    return camel;
  }

  // 🐧 3D Penguin Model
  createPenguin() {
    const penguin = new THREE.Group();
    penguin.userData.type = 'penguin';

    // Body
    const bodyGeom = new THREE.CylinderGeometry(0.4, 0.55, 1.4, 10);
    const body = new THREE.Mesh(bodyGeom, this.penguinBlackMat);
    body.position.y = 0.75;
    penguin.add(body);

    // White Belly
    const bellyGeom = new THREE.BoxGeometry(0.45, 0.9, 0.2);
    const belly = new THREE.Mesh(bellyGeom, this.penguinWhiteMat);
    belly.position.set(0, 0.7, -0.42);
    penguin.add(belly);

    // Beak
    const beakGeom = new THREE.ConeGeometry(0.15, 0.35, 4);
    beakGeom.rotateX(-Math.PI / 2);
    const beak = new THREE.Mesh(beakGeom, this.penguinBeakMat);
    beak.position.set(0, 1.2, -0.55);
    penguin.add(beak);

    // Flippers
    const flipperGeom = new THREE.BoxGeometry(0.1, 0.7, 0.3);
    const lFlip = new THREE.Mesh(flipperGeom, this.penguinBlackMat);
    lFlip.position.set(0.5, 0.75, 0);
    lFlip.rotation.z = -0.3;
    penguin.add(lFlip);

    const rFlip = lFlip.clone();
    rFlip.position.set(-0.5, 0.75, 0);
    rFlip.rotation.z = 0.3;
    penguin.add(rFlip);

    return penguin;
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
        this.spawnNatureObstacle(laneX, itemZ, laneIndex);
      } else if (roll < 0.8) {
        this.spawnGoldenApplesRow(laneX, itemZ);
      } else if (roll < 0.9) {
        this.spawnMushroomJumpPad(laneX, itemZ);
      } else if (roll < 0.97) {
        this.spawnPowerup(laneX, itemZ);
      }
    }
  }

  // 🍄 Giant Mushroom Jump Pad
  spawnMushroomJumpPad(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Stalk
    const stalkGeom = new THREE.CylinderGeometry(0.5, 0.8, 1.0, 8);
    const stalk = new THREE.Mesh(stalkGeom, this.shroomStalkMat);
    stalk.position.y = 0.5;
    group.add(stalk);

    // Bouncy Cap
    const capGeom = new THREE.SphereGeometry(1.4, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.Mesh(capGeom, this.shroomCapMat);
    cap.position.y = 0.9;
    group.add(cap);

    // White Spots on Mushroom
    for (let s = 0; s < 4; s++) {
      const spotGeom = new THREE.CircleGeometry(0.2, 6);
      const spot = new THREE.Mesh(spotGeom, this.shroomStalkMat);
      spot.position.set(Math.cos(s * 1.5) * 0.8, 1.6, Math.sin(s * 1.5) * 0.8);
      spot.rotation.x = -Math.PI / 3;
      group.add(spot);
    }

    this.scene.add(group);
    this.jumpPads.push({
      mesh: group,
      x: x,
      z: z,
      box: new THREE.Box3()
    });

    // Elevated Golden Apples above mushroom!
    for (let j = 1; j <= 4; j++) {
      const apple = this.createAppleMesh();
      apple.position.set(x, 3.5 + j * 1.5, z - (j * 4.5));
      this.scene.add(apple);
      this.collectibles.push({
        mesh: apple,
        z: apple.position.z,
        x: x,
        points: 300,
        spinSpeed: 3.0
      });
    }
  }

  // 🍎 Golden Apple Collectible Mesh
  createAppleMesh() {
    const group = new THREE.Group();
    
    // Apple Sphere Body
    const appleGeom = new THREE.SphereGeometry(0.48, 10, 10);
    appleGeom.scale(1, 0.9, 1);
    const apple = new THREE.Mesh(appleGeom, this.goldenAppleMat);
    apple.castShadow = true;
    group.add(apple);

    // Stem & Leaf
    const stemGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 4);
    const stem = new THREE.Mesh(stemGeom, this.woodTrunkMat);
    stem.position.y = 0.45;
    group.add(stem);

    const leafGeom = new THREE.BoxGeometry(0.2, 0.05, 0.12);
    const leaf = new THREE.Mesh(leafGeom, this.leavesLightGreenMat);
    leaf.position.set(0.1, 0.5, 0);
    leaf.rotation.z = -0.3;
    group.add(leaf);

    return group;
  }

  spawnGoldenApplesRow(x, startZ) {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const z = startZ - (i * 2.8);
      const isDiamond = (i === 1);
      
      let itemMesh;
      if (isDiamond) {
        const dGeom = new THREE.OctahedronGeometry(0.5, 0);
        itemMesh = new THREE.Mesh(dGeom, this.cyanGemMat);
      } else {
        itemMesh = this.createAppleMesh();
      }

      itemMesh.position.set(x, 1.0, z);
      this.scene.add(itemMesh);

      this.collectibles.push({
        mesh: itemMesh,
        z: z,
        x: x,
        points: isDiamond ? 250 : 100,
        spinSpeed: 2.5 + Math.random()
      });
    }
  }

  spawnNatureObstacle(x, z, laneIndex) {
    const typeRoll = Math.random();
    let mesh;
    let type = 'log';

    if (typeRoll < 0.5) {
      // 🪵 Fallen Forest Log
      const geom = new THREE.CylinderGeometry(0.55, 0.55, 2.6, 8);
      geom.rotateZ(Math.PI / 2);
      mesh = new THREE.Mesh(geom, this.woodLogMat);
      mesh.position.set(x, 0.55, z);
      mesh.castShadow = true;
      type = 'log';
    } else if (typeRoll < 0.8) {
      // 🪨 River Boulder Rock
      const geom = new THREE.DodecahedronGeometry(0.85, 1);
      mesh = new THREE.Mesh(geom, this.rockMat);
      mesh.position.set(x, 0.85, z);
      mesh.castShadow = true;
      type = 'rock';
    } else {
      // 🌿 Wooden Fence Gate
      mesh = new THREE.Group();
      mesh.position.set(x, 0.6, z);

      const postGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.6, 6);
      const lPost = new THREE.Mesh(postGeom, this.woodTrunkMat); lPost.position.x = -1.2; mesh.add(lPost);
      const rPost = new THREE.Mesh(postGeom, this.woodTrunkMat); rPost.position.x = 1.2; mesh.add(rPost);

      const railGeom = new THREE.BoxGeometry(2.4, 0.2, 0.15);
      const tRail = new THREE.Mesh(railGeom, this.woodTrunkMat); tRail.position.y = 0.5; mesh.add(tRail);
      const bRail = new THREE.Mesh(railGeom, this.woodTrunkMat); bRail.position.y = 0.1; mesh.add(bRail);

      type = 'fence';
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

    const haloGeom = new THREE.TorusGeometry(0.9, 0.04, 8, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: isShield ? 0x00e676 : 0xff1744 });
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

  // Nature Archway Warp Gate
  spawnWarpGate(z) {
    const gate = new THREE.Group();
    gate.position.set(0, 4.0, z);

    // Glowing Floral Ring
    const torusGeom = new THREE.TorusGeometry(5.0, 0.4, 16, 32);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x81c784,
      emissive: 0x4caf50,
      emissiveIntensity: 0.8
    });
    const ring = new THREE.Mesh(torusGeom, torusMat);
    gate.add(ring);

    const vortexGeom = new THREE.CircleGeometry(4.8, 32);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0xffeb3b,
      transparent: true,
      opacity: 0.4,
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

  update(delta, playerZ, gameSpeed) {
    // 1. Recycle Segments
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      if (seg.z > playerZ + this.segmentLength) {
        const furthestZ = Math.min(...this.segments.map(s => s.z));
        seg.z = furthestZ - this.segmentLength;
        seg.group.position.z = seg.z;
        this.populateSegment(seg.z);
      }
    }

    // 2. Animate Animals
    for (let a of this.animals) {
      a.animTimer += delta * 3.5;
      if (a.type === 'deer') {
        if (a.group.userData.headMesh) {
          a.group.userData.headMesh.rotation.x = Math.sin(a.animTimer * 0.5) * 0.2;
        }
      } else if (a.type === 'rabbit') {
        // Hopping
        a.group.position.y = Math.max(0, Math.sin(a.animTimer * 2.0) * 0.4);
      } else if (a.type === 'penguin') {
        // Waddling sway
        a.group.rotation.z = Math.sin(a.animTimer * 1.5) * 0.15;
      }
    }

    // 3. Move Sky Clouds gently
    for (let c of this.clouds) {
      c.group.position.z += c.speed * delta;
      if (c.group.position.z > playerZ + 40) {
        c.group.position.z = playerZ - 240;
      }
    }

    // 4. Update Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.box.setFromObject(obs.mesh);
      if (obs.mesh.position.z > playerZ + 15) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 5. Update Jump Pads
    for (let i = this.jumpPads.length - 1; i >= 0; i--) {
      const pad = this.jumpPads[i];
      pad.box.setFromObject(pad.mesh);
      if (pad.mesh.position.z > playerZ + 15) {
        this.scene.remove(pad.mesh);
        this.jumpPads.splice(i, 1);
      }
    }

    // 6. Update Warp Gates
    for (let i = this.warpGates.length - 1; i >= 0; i--) {
      const gate = this.warpGates[i];
      gate.ring.rotation.z += 1.5 * delta;
      gate.vortex.rotation.z -= 1.0 * delta;

      if (gate.group.position.z > playerZ + 25) {
        this.scene.remove(gate.group);
        this.warpGates.splice(i, 1);
      }
    }

    // 7. Update Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.mesh.rotation.y += col.spinSpeed * delta;
      col.mesh.position.y += Math.sin(Date.now() * 0.005 + col.z) * 0.005;

      if (col.mesh.position.z > playerZ + 15) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    // 8. Update Powerups
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
