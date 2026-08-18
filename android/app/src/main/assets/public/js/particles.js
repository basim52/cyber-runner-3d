/**
 * Vibrant Nature Particle Engine (Falling Leaves, Petals, Snowflakes & Fireflies)
 */
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.currentBiome = 'forest';
    this.initNatureParticles();
  }

  setBiome(biome) {
    this.currentBiome = biome;
    this.updateNatureColors();
  }

  // Floating Leaves / Petals / Snowflakes
  initNatureParticles() {
    this.ambientCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.ambientCount * 3);
    this.ambientColors = new Float32Array(this.ambientCount * 3);

    for (let i = 0; i < this.ambientCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = -Math.random() * 200;

      // Fresh Green / Pink Petals
      this.ambientColors[i * 3] = 0.3;
      this.ambientColors[i * 3 + 1] = 0.85;
      this.ambientColors[i * 3 + 2] = 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.ambientColors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.ambientPoints = new THREE.Points(geometry, material);
    this.scene.add(this.ambientPoints);
  }

  updateNatureColors() {
    if (!this.ambientPoints) return;
    const colorAttr = this.ambientPoints.geometry.attributes.color;
    const colors = colorAttr.array;

    for (let i = 0; i < this.ambientCount; i++) {
      if (this.currentBiome === 'savannah') {
        // Golden pollen & warm sun dust
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.2;
      } else if (this.currentBiome === 'winter') {
        // Pure white snowflakes
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.98;
        colors[i * 3 + 2] = 1.0;
      } else if (this.currentBiome === 'jungle') {
        // Glowing jungle fireflies
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.5;
      } else {
        // Forest: Emerald leaves and pink blossoms
        const isPink = Math.random() > 0.6;
        colors[i * 3] = isPink ? 1.0 : 0.3;
        colors[i * 3 + 1] = isPink ? 0.4 : 0.85;
        colors[i * 3 + 2] = isPink ? 0.7 : 0.3;
      }
    }
    colorAttr.needsUpdate = true;
  }

  createJumpPadBlast(position) {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const isRed = Math.random() > 0.5;
      const mat = new THREE.MeshBasicMaterial({
        color: isRed ? 0xff3344 : 0xffffff,
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 8;

      this.particles.push({
        mesh: mesh,
        vx: Math.cos(angle) * speed,
        vy: 12 + Math.random() * 8,
        vz: Math.sin(angle) * speed,
        rotSpeed: 10,
        life: 0.5,
        maxLife: 0.5
      });
      this.scene.add(mesh);
    }
  }

  createCollectBurst(position, colorHex = 0xffd700) {
    const count = 22;
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;

      this.particles.push({
        mesh: mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 3,
        vz: (Math.random() - 0.5) * 6,
        rotSpeed: 10,
        life: 0.6,
        maxLife: 0.6
      });
      this.scene.add(mesh);
    }
  }

  createExplosion(position) {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const size = 0.2 + Math.random() * 0.3;
      const geom = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x8d6e63, // Wood chips / rock chunks
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      this.particles.push({
        mesh: mesh,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 10 + 2,
        vz: (Math.random() - 0.5) * 12,
        rotSpeed: 15,
        life: 0.7,
        maxLife: 0.7
      });
      this.scene.add(mesh);
    }
  }

  createThrusterSpark(pos, isBoosting = false, colorHex = null) {
    const geom = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    let color = isBoosting ? 0xff4081 : 0x00e676;
    if (colorHex) color = colorHex;

    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85
    });
    const mesh = new THREE.Mesh(geom, mat);
    
    mesh.position.set(
      pos.x + (Math.random() - 0.5) * 0.3,
      pos.y - 0.2 + (Math.random() - 0.5) * 0.2,
      pos.z + 1.2
    );

    this.particles.push({
      mesh: mesh,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: 7 + Math.random() * 4,
      rotSpeed: 8,
      life: 0.25,
      maxLife: 0.25
    });
    this.scene.add(mesh);
  }

  update(delta, playerZ, gameSpeed) {
    if (this.ambientPoints) {
      const posAttr = this.ambientPoints.geometry.attributes.position;
      const positions = posAttr.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        // Gentle downward floating & forward movement
        positions[i * 3 + 1] -= (1.5 + Math.sin(positions[i * 3 + 2] * 0.1)) * delta;
        positions[i * 3 + 2] += gameSpeed * 1.2 * delta;

        if (positions[i * 3 + 2] > playerZ + 20 || positions[i * 3 + 1] < 0) {
          positions[i * 3 + 2] = playerZ - 180;
          positions[i * 3] = (Math.random() - 0.5) * 70;
          positions[i * 3 + 1] = 12 + Math.random() * 20;
        }
      }
      posAttr.needsUpdate = true;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.vy -= 10 * delta;

      p.mesh.rotation.x += p.rotSpeed * delta;
      p.mesh.rotation.y += p.rotSpeed * delta;

      const scale = p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  clear() {
    for (let p of this.particles) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this.particles = [];
  }
}
