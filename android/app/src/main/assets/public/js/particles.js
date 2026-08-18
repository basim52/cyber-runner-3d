/**
 * Enhanced Multi-World Particle Engine
 */
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.currentBiome = 'city';
    this.initAtmosphereParticles();
  }

  setBiome(biome) {
    this.currentBiome = biome;
    this.updateAtmosphereColors();
  }

  // Atmospheric Ambient Streaks / Embers / Stars
  initAtmosphereParticles() {
    this.ambientCount = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.ambientCount * 3);
    this.ambientColors = new Float32Array(this.ambientCount * 3);

    for (let i = 0; i < this.ambientCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = -Math.random() * 220;

      this.ambientColors[i * 3] = 0.0;
      this.ambientColors[i * 3 + 1] = 0.9;
      this.ambientColors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.ambientColors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.ambientPoints = new THREE.Points(geometry, material);
    this.scene.add(this.ambientPoints);
  }

  updateAtmosphereColors() {
    if (!this.ambientPoints) return;
    const colorAttr = this.ambientPoints.geometry.attributes.color;
    const colors = colorAttr.array;

    for (let i = 0; i < this.ambientCount; i++) {
      if (this.currentBiome === 'lava') {
        // Red, Orange, Gold Embers
        const isYellow = Math.random() > 0.5;
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = isYellow ? 0.7 : 0.2;
        colors[i * 3 + 2] = 0.0;
      } else if (this.currentBiome === 'nebula') {
        // Purple, Pink, Violet Stars
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 1.0;
      } else if (this.currentBiome === 'abyss') {
        // Emerald Green & Deep Cyan
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.6;
      } else {
        // Cyber City: Cyan and Blue
        const isCyan = Math.random() > 0.4;
        colors[i * 3] = isCyan ? 0.0 : 0.9;
        colors[i * 3 + 1] = isCyan ? 0.9 : 0.1;
        colors[i * 3 + 2] = 1.0;
      }
    }
    colorAttr.needsUpdate = true;
  }

  // Spawn Jump Pad Launcher blast
  createJumpPadBlast(position) {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
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

  // Spawn Gem/Coin collection explosion
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
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 0.6,
        maxLife: 0.6
      });
      this.scene.add(mesh);
    }
  }

  // Spawn Obstacle Impact / Explosion
  createExplosion(position) {
    const count = 35;
    for (let i = 0; i < count; i++) {
      const size = 0.2 + Math.random() * 0.35;
      const geom = new THREE.BoxGeometry(size, size, size);
      const isOrange = Math.random() > 0.5;
      const mat = new THREE.MeshBasicMaterial({
        color: isOrange ? 0xff3300 : 0xffaa00,
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(position);

      this.particles.push({
        mesh: mesh,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * 12 + 2,
        vz: (Math.random() - 0.5) * 14,
        rotSpeed: (Math.random() - 0.5) * 15,
        life: 0.8,
        maxLife: 0.8
      });
      this.scene.add(mesh);
    }
  }

  // Spawn Player Thruster Trail
  createThrusterSpark(pos, isBoosting = false, colorHex = null) {
    const geom = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    let color = isBoosting ? 0xff00aa : 0x00f0ff;
    if (colorHex) color = colorHex;

    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geom, mat);
    
    mesh.position.set(
      pos.x + (Math.random() - 0.5) * 0.35,
      pos.y - 0.2 + (Math.random() - 0.5) * 0.2,
      pos.z + 1.2
    );

    this.particles.push({
      mesh: mesh,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: 8 + Math.random() * 5,
      rotSpeed: (Math.random() - 0.5) * 8,
      life: 0.28,
      maxLife: 0.28
    });
    this.scene.add(mesh);
  }

  update(delta, playerZ, gameSpeed) {
    // Update Ambient Points
    if (this.ambientPoints) {
      const posAttr = this.ambientPoints.geometry.attributes.position;
      const positions = posAttr.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += gameSpeed * 1.4 * delta;
        if (positions[i * 3 + 2] > playerZ + 20) {
          positions[i * 3 + 2] = playerZ - 190;
          positions[i * 3] = (Math.random() - 0.5) * 80;
          positions[i * 3 + 1] = Math.random() * 40 - 5;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Update active particles
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
      p.vy -= 12 * delta;

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
