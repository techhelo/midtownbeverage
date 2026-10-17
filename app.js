/**
 * MIDTOWN BEVERAGE - POTTSVILLE, PA (EST. 2025)
 * Master 3D Web Application & Interactive Engine
 * Ultra-Premium Edition with 3D Cans, Realistic Amber Bottle, 3D Medallion & Cooler Chamber
 * Pure HTML5 / CSS3 / JavaScript (ES6+) - Absolutely No Python Required
 */

// Global Application State
const AppState = {
  threeReady: false,
  soundEnabled: false,
  currentCanType: 'ipa', // 'ipa', 'bottle', 'lager', 'coin'
  packItems: [],
  maxPackSize: 6,
  isCanOpen: false,
  autoRotate: true,
  audioCtx: null
};

// ===================================================================
// PROCEDURAL AUDIO SYNTHESIZER (Web Audio API - Zero External MP3s)
// ===================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        AppState.audioCtx = this.ctx;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic can opening hiss & tab crack
  playCanPop() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sharp mechanical metal tab crack
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);

    oscGain.gain.setValueAtTime(0.75, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);

    // Pressurized CO2 escaping hiss (bandpassed white noise burst)
    const bufferSize = this.ctx.sampleRate * 0.45;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3400, t + 0.02);
    filter.Q.setValueAtTime(2.8, t + 0.02);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.45);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0, t);
    noiseGain.gain.linearRampToValueAtTime(0.65, t + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, t + 0.45);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t + 0.02);
    whiteNoise.stop(t + 0.45);
  }

  // Bottle cap pop & glass harmonic chime
  playBottlePop() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Bottle cap pry "TING"
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2100, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    // Beer fizz sound
    this.playFizz();
  }

  playFizz() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Cold ice cube clink sound
  playIceClink() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const frequencies = [2400, 3200, 4300];
    frequencies.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 200 - 100), t);

      gain.gain.setValueAtTime(0.22 / (i + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2 + (i * 0.05));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // Scratch card friction sound
  playScratch() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.055);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // Lottery victory fanfare
  playWinFanfare() {
    if (!AppState.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + (idx * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.6);
    });
  }
}

const sounds = new SoundEngine();

// ===================================================================
// TEXTURE GENERATOR FOR 3D CAN, BOTTLE & MEDALLION
// ===================================================================
class CanTextureGenerator {
  constructor(logoImg) {
    this.logo = logoImg;
  }

  drawEmblem(ctx, centerX, centerY, size, accentColor = '#e5a93c', ringColor = '#f5c542') {
    let drewImage = false;
    if (this.logo && this.logo.complete && this.logo.naturalWidth > 0) {
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(this.logo, centerX - size / 2, centerY - size / 2, size, size);
        ctx.restore();
        drewImage = true;
      } catch (err) {
        console.warn('Image canvas fallback engaged:', err);
      }
    }

    if (!drewImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#08111e';
      ctx.fill();

      // Outer gold rim
      ctx.lineWidth = Math.max(6, Math.round(size * 0.025));
      ctx.strokeStyle = ringColor;
      ctx.stroke();

      // Inner thin gold ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2 - 14, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = accentColor;
      ctx.stroke();

      // Badge texts
      ctx.textAlign = 'center';
      ctx.fillStyle = ringColor;
      ctx.font = `bold ${Math.round(size * 0.08)}px Cinzel, serif`;
      ctx.fillText('MIDTOWN BEVERAGE', centerX, centerY - size * 0.14);

      ctx.font = `bold ${Math.round(size * 0.052)}px Plus Jakarta Sans, sans-serif`;
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('POTTSVILLE, PA', centerX, centerY - size * 0.03);

      ctx.font = `${Math.round(size * 0.15)}px sans-serif`;
      ctx.fillText('🍺', centerX, centerY + size * 0.15);

      ctx.font = `bold ${Math.round(size * 0.046)}px Cinzel, serif`;
      ctx.fillStyle = '#fff7c2';
      ctx.fillText('EST. 2025 • CRAFT & DOMESTIC', centerX, centerY + size * 0.28);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = ringColor;
      ctx.stroke();
    }
  }

  // Midtown Heritage IPA Label (Gold & Navy Craft Edition)
  createIpaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep Obsidian / Royal Navy Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    bgGrad.addColorStop(0.0, '#060d18');
    bgGrad.addColorStop(0.25, '#122036');
    bgGrad.addColorStop(0.5, '#060d18');
    bgGrad.addColorStop(0.75, '#122036');
    bgGrad.addColorStop(1.0, '#060d18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold borders with filigree
    ctx.fillStyle = '#f5c542';
    ctx.fillRect(0, 30, canvas.width, 14);
    ctx.fillRect(0, 56, canvas.width, 4);
    ctx.fillRect(0, canvas.height - 60, canvas.width, 4);
    ctx.fillRect(0, canvas.height - 44, canvas.width, 14);

    const centerX = 1024;
    this.drawEmblem(ctx, centerX, 500, 450, '#e5a93c', '#f5c542');

    ctx.textAlign = 'center';
    ctx.font = 'bold 46px Cinzel, serif';
    ctx.fillStyle = '#fff7c2';
    ctx.fillText('POTTSVILLE • PENNSYLVANIA', centerX, 150);

    ctx.font = 'bold 26px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('COLD CRAFT BEER SELECTION • EST. 2025', centerX, 205);

    ctx.font = 'bold 68px Syne, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HERITAGE HAZY IPA', centerX, 810);

    ctx.font = 'bold 26px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#f5c542';
    ctx.fillText('16 FL. OZ. • ALC. 6.8% BY VOL. • CRYOGENIC 33°F', centerX, 870);

    // Left info
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px Cinzel, serif';
    ctx.fillStyle = '#f5c542';
    ctx.fillText('MIDTOWN COLD VAULT', 120, 280);

    ctx.font = '22px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#e2d9c5';
    ctx.fillText('Schuylkill County Craft Reserve', 120, 325);
    ctx.fillText('• Singles, 6-Packs, 12-Packs & Full Cases', 120, 375);
    ctx.fillText('• Stored at 33°F for peak crispness', 120, 420);
    ctx.fillText('• Official PA Lottery Terminal', 120, 465);
    ctx.fillText('• Fresh Party Ice & PA Snacks', 120, 510);
    ctx.fillText('• 689 Port Carbon St. Clair, Pottsville', 120, 555);

    // Barcode
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(120, 640, 240, 90);
    ctx.fillStyle = '#000000';
    for (let b = 135; b < 345; b += 7) {
      ctx.fillRect(b, 650, (b % 14 === 0 ? 5 : 2.5), 70);
    }

    // Right Warning
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#8e9db2';
    ctx.fillText('GOVERNMENT WARNING: (1) ACCORDING', 1480, 330);
    ctx.fillText('TO THE SURGEON GENERAL, WOMEN SHOULD', 1480, 365);
    ctx.fillText('NOT DRINK ALCOHOLIC BEVERAGES DURING', 1480, 400);
    ctx.fillText('PREGNANCY. MUST BE 21+ IN PENNSYLVANIA.', 1480, 435);

    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.fillRect(1480, 580, 420, 150);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1480, 580, 420, 150);

    ctx.textAlign = 'center';
    ctx.font = 'bold 26px Cinzel, serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('MIDTOWN BEVERAGE GUARANTEE', 1690, 630);
    ctx.font = '20px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('100% ICE COLD GUARANTEED', 1690, 675);

    return new THREE.CanvasTexture(canvas);
  }

  // Mountain Crisp Cold Lager (Frost Cyan & Silver Edition)
  createLagerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#021826');
    grad.addColorStop(0.5, '#03456b');
    grad.addColorStop(1, '#021826');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e0faff';
    ctx.fillRect(0, 30, canvas.width, 12);
    ctx.fillRect(0, canvas.height - 42, canvas.width, 12);

    const centerX = 1024;
    this.drawEmblem(ctx, centerX, 500, 440, '#0284c7', '#00f0ff');

    ctx.textAlign = 'center';
    ctx.font = 'bold 46px Cinzel, serif';
    ctx.fillStyle = '#e0faff';
    ctx.fillText('MOUNTAIN CRISP COLD LAGER', centerX, 150);

    ctx.font = 'bold 24px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('SUPER CHILLED 33°F • POTTSVILLE PA FAVORITE', centerX, 210);

    ctx.font = 'bold 64px Syne, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DOMESTIC PREMIUM COLD SELECT', centerX, 810);

    ctx.font = 'bold 26px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('12 FL. OZ. • 4.2% ALC/VOL • ZERO COMPROMISE', centerX, 870);

    return new THREE.CanvasTexture(canvas);
  }

  // Bottle Body Oval Label Texture
  createBottleBodyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Oval cream parchment label on transparent background
    ctx.clearRect(0, 0, 1024, 1024);

    // Oval background
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(512, 512, 420, 320, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1626';
    ctx.fill();

    // Gold rim
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f5c542';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(512, 512, 395, 295, 0, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e5a93c';
    ctx.stroke();

    this.drawEmblem(ctx, 512, 512, 520, '#e5a93c', '#f5c542');
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // 3D 24K Gold Medallion Texture
  createCoinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(512, 512, 60, 512, 512, 512);
    grad.addColorStop(0, '#fff9db');
    grad.addColorStop(0.35, '#f5c542');
    grad.addColorStop(0.7, '#c88714');
    grad.addColorStop(1.0, '#593905');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    this.drawEmblem(ctx, 512, 512, 880, '#94630a', '#fff9db');
    return new THREE.CanvasTexture(canvas);
  }
}

// ===================================================================
// THREE.JS 3D SCENE CONTROLLER (CAN + BOTTLE + MEDALLION)
// ===================================================================
class ThreeShowcase {
  constructor(canvasId, logoImg) {
    this.canvas = document.getElementById(canvasId);
    this.logoImg = logoImg;
    this.textureGen = new CanTextureGenerator(logoImg);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.canGroup = null;
    this.bottleGroup = null;
    this.coinMesh = null;
    this.canBody = null;
    this.pullTab = null;
    this.iceCubes = [];
    this.mistParticles = null;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.textures = {};
    this.isLoaded = false;

    this.init();
  }

  init() {
    if (!this.canvas || typeof THREE === 'undefined') {
      console.warn('Three.js not available yet.');
      return;
    }

    const width = this.canvas.clientWidth || 600;
    const height = this.canvas.clientHeight || 550;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.3, 6.2);

    // 2. Renderer with Filmic tone mapping
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 3. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false;
      this.controls.minDistance = 3.6;
      this.controls.maxDistance = 8.5;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.3;
      this.controls.minPolarAngle = Math.PI / 2 - 0.5;
      this.controls.autoRotate = AppState.autoRotate;
      this.controls.autoRotateSpeed = 1.8;
    }

    // 4. Studio Lighting
    this.setupLighting();

    // 5. Generate Textures
    this.textures.ipa = this.textureGen.createIpaTexture();
    this.textures.lager = this.textureGen.createLagerTexture();
    this.textures.bottleBody = this.textureGen.createBottleBodyTexture();
    this.textures.coin = this.textureGen.createCoinTexture();

    // 6. Build 3D Models
    this.buildCanModel();
    this.buildBottleModel();
    this.buildMedallionModel();
    this.buildIceCubes();
    this.buildColdMistParticles();

    // 7. Event Handlers
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('click', () => sounds.playIceClink());

    // 8. Start Loop
    this.isLoaded = true;
    AppState.threeReady = true;
    this.animate();
  }

  setupLighting() {
    // Ambient Soft Fill
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.75);
    this.scene.add(ambientLight);

    // Key Light - 24K Gold Warmth
    const keyLight = new THREE.DirectionalLight(0xfff7c2, 2.2);
    keyLight.position.set(4, 5, 5);
    this.scene.add(keyLight);

    // Fill Light - Ice Neon Cyan
    const fillLight = new THREE.DirectionalLight(0x00f0ff, 1.4);
    fillLight.position.set(-5, 2, 4);
    this.scene.add(fillLight);

    // Rim Light - Sharp Silver Specular
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.4);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);

    // Cryo Base Light
    const bottomGlow = new THREE.PointLight(0x00f0ff, 1.4, 12);
    bottomGlow.position.set(0, -3.2, 2);
    this.scene.add(bottomGlow);
  }

  buildCanModel() {
    this.canGroup = new THREE.Group();

    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.18
    });

    // Main Can Body Cylinder
    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.2, 3.1, 64, 1, true);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: this.textures.ipa,
      metalness: 0.55,
      roughness: 0.35
    });
    this.canBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.canGroup.add(this.canBody);

    // Top Taper Neck & Rim
    const neckGeometry = new THREE.CylinderGeometry(1.08, 1.2, 0.3, 64);
    const neckMesh = new THREE.Mesh(neckGeometry, aluminumMaterial);
    neckMesh.position.y = 1.7;
    this.canGroup.add(neckMesh);

    const rimGeometry = new THREE.TorusGeometry(1.08, 0.045, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeometry, aluminumMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.85;
    this.canGroup.add(rimMesh);

    const lidGeometry = new THREE.CylinderGeometry(1.06, 1.06, 0.05, 64);
    const lidMesh = new THREE.Mesh(lidGeometry, aluminumMaterial);
    lidMesh.position.y = 1.83;
    this.canGroup.add(lidMesh);

    // Bottom Taper & Rim
    const bottomTaperGeom = new THREE.CylinderGeometry(1.2, 1.05, 0.25, 64);
    const bottomTaperMesh = new THREE.Mesh(bottomTaperGeom, aluminumMaterial);
    bottomTaperMesh.position.y = -1.67;
    this.canGroup.add(bottomTaperMesh);

    const bottomRimGeom = new THREE.TorusGeometry(1.05, 0.04, 16, 64);
    const bottomRimMesh = new THREE.Mesh(bottomRimGeom, aluminumMaterial);
    bottomRimMesh.rotation.x = Math.PI / 2;
    bottomRimMesh.position.y = -1.8;
    this.canGroup.add(bottomRimMesh);

    // Pull Tab Geometry
    const tabShape = new THREE.Shape();
    tabShape.moveTo(-0.15, -0.4);
    tabShape.lineTo(0.15, -0.4);
    tabShape.lineTo(0.18, 0.25);
    tabShape.lineTo(-0.18, 0.25);
    tabShape.closePath();

    const holePath = new THREE.Path();
    holePath.absarc(0, -0.15, 0.08, 0, Math.PI * 2, true);
    tabShape.holes.push(holePath);

    const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
    const tabGeometry = new THREE.ExtrudeGeometry(tabShape, extrudeSettings);
    this.pullTab = new THREE.Mesh(tabGeometry, aluminumMaterial);
    this.pullTab.rotation.x = -Math.PI / 2;
    this.pullTab.position.set(0, 1.86, 0.2);
    this.canGroup.add(this.pullTab);

    // Condensation Water Droplets Instanced Mesh
    const dropCount = 200;
    const dropGeom = new THREE.SphereGeometry(0.038, 12, 12);
    dropGeom.scale(1, 1.35, 0.5);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.04,
      transparent: true,
      opacity: 0.88
    });
    const dropletsMesh = new THREE.InstancedMesh(dropGeom, dropMat, dropCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2.85;
      const radius = 1.205;

      dummy.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      dummy.rotation.y = -angle;
      const scale = 0.6 + Math.random() * 0.9;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      dropletsMesh.setMatrixAt(i, dummy.matrix);
    }
    dropletsMesh.instanceMatrix.needsUpdate = true;
    this.canGroup.add(dropletsMesh);

    this.canGroup.position.set(0, -0.1, 0);
    this.canGroup.rotation.y = -Math.PI / 2;
    this.scene.add(this.canGroup);
  }

  buildBottleModel() {
    this.bottleGroup = new THREE.Group();

    // 1. Photorealistic Amber Glass Material
    const amberGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x92400e, // Deep rich amber
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.82,
      ior: 1.52,
      transparent: true,
      opacity: 0.9,
      reflectivity: 0.95
    });

    // 2. Translucent Gold Beer Liquid Inside
    const beerLiquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    });

    // Bottle Body
    const bottleBodyGeom = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 48);
    const bottleBody = new THREE.Mesh(bottleBodyGeom, amberGlassMat);
    this.bottleGroup.add(bottleBody);

    // Liquid Cylinder Inside
    const liquidGeom = new THREE.CylinderGeometry(0.81, 0.81, 2.15, 32);
    const liquidMesh = new THREE.Mesh(liquidGeom, beerLiquidMat);
    this.bottleGroup.add(liquidMesh);

    // Bottle Shoulder (Cone taper)
    const shoulderGeom = new THREE.CylinderGeometry(0.38, 0.85, 1.1, 48);
    const shoulderMesh = new THREE.Mesh(shoulderGeom, amberGlassMat);
    shoulderMesh.position.y = 1.65;
    this.bottleGroup.add(shoulderMesh);

    // Bottle Neck
    const neckGeom = new THREE.CylinderGeometry(0.35, 0.38, 1.2, 48);
    const neckMesh = new THREE.Mesh(neckGeom, amberGlassMat);
    neckMesh.position.y = 2.8;
    this.bottleGroup.add(neckMesh);

    // Bottle Crown Lip Finish
    const lipGeom = new THREE.TorusGeometry(0.36, 0.05, 16, 48);
    const lipMesh = new THREE.Mesh(lipGeom, amberGlassMat);
    lipMesh.rotation.x = Math.PI / 2;
    lipMesh.position.y = 3.4;
    this.bottleGroup.add(lipMesh);

    // Gold Metal Crown Cap
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xf5c542,
      metalness: 0.92,
      roughness: 0.22
    });
    const capGeom = new THREE.CylinderGeometry(0.39, 0.39, 0.14, 32);
    this.bottleCap = new THREE.Mesh(capGeom, capMat);
    this.bottleCap.position.y = 3.45;
    this.bottleGroup.add(this.bottleCap);

    // Curved Midtown Emblem Label on Bottle Body
    const labelGeom = new THREE.CylinderGeometry(0.858, 0.858, 1.5, 48, 1, true);
    const labelMat = new THREE.MeshStandardMaterial({
      map: this.textures.bottleBody,
      transparent: true,
      roughness: 0.3
    });
    const bottleLabel = new THREE.Mesh(labelGeom, labelMat);
    bottleLabel.rotation.y = -Math.PI / 2;
    this.bottleGroup.add(bottleLabel);

    this.bottleGroup.position.set(0, -0.6, 0);
    this.bottleGroup.scale.set(0.95, 0.95, 0.95);
    this.bottleGroup.visible = false;
    this.scene.add(this.bottleGroup);
  }

  buildMedallionModel() {
    const coinGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.28, 64);
    const coinSideMat = new THREE.MeshStandardMaterial({
      color: 0xf5c542,
      metalness: 0.96,
      roughness: 0.2
    });

    const coinFaceMat = new THREE.MeshStandardMaterial({
      map: this.textures.coin,
      metalness: 0.88,
      roughness: 0.25
    });

    this.coinMesh = new THREE.Mesh(coinGeom, [coinSideMat, coinFaceMat, coinFaceMat]);
    this.coinMesh.rotation.x = Math.PI / 2;
    this.coinMesh.visible = false;
    this.scene.add(this.coinMesh);
  }

  buildIceCubes() {
    const cubeCount = 14;
    const cubeGeom = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const iceMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0faff,
      roughness: 0.08,
      metalness: 0.12,
      transparent: true,
      opacity: 0.62
    });

    for (let i = 0; i < cubeCount; i++) {
      const cube = new THREE.Mesh(cubeGeom, iceMaterial);
      const angle = (i / cubeCount) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 2.5 + Math.random() * 1.3;
      const y = (Math.random() - 0.5) * 3.5;

      cube.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      cube.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        baseY: y,
        floatSpeed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      };

      this.scene.add(cube);
      this.iceCubes.push(cube);
    }
  }

  buildColdMistParticles() {
    const particleCount = 50;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 1.6;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = -2.2 + Math.random() * 1.4;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.25,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.mistParticles = new THREE.Points(geom, pMaterial);
    this.scene.add(this.mistParticles);
  }

  // Model Selector: 'ipa', 'bottle', 'lager', 'coin'
  setCanType(type) {
    AppState.currentCanType = type;
    sounds.playIceClink();

    // Hide all first
    this.canGroup.visible = false;
    this.bottleGroup.visible = false;
    this.coinMesh.visible = false;

    if (type === 'bottle') {
      this.bottleGroup.visible = true;
    } else if (type === 'coin') {
      this.coinMesh.visible = true;
    } else {
      this.canGroup.visible = true;
      if (this.canBody && this.textures[type]) {
        this.canBody.material.map = this.textures[type];
        this.canBody.material.needsUpdate = true;
      }
    }
  }

  // Interactive Open animation (Pop Can or Pop Bottle)
  popCan() {
    if (AppState.currentCanType === 'bottle') {
      sounds.playBottlePop();
      if (this.bottleCap) {
        let step = 0;
        const capInterval = setInterval(() => {
          step++;
          this.bottleCap.position.y += 0.08;
          this.bottleCap.rotation.z += 0.15;
          if (step >= 10) clearInterval(capInterval);
        }, 20);
      }
    } else {
      sounds.playCanPop();
      if (this.pullTab) {
        let step = 0;
        const popInterval = setInterval(() => {
          step++;
          this.pullTab.rotation.x = -Math.PI / 2 - (step * 0.12);
          if (step >= 8) clearInterval(popInterval);
        }, 20);
      }
    }

    if (this.mistParticles) {
      this.mistParticles.material.opacity = 0.95;
      setTimeout(() => {
        if (this.mistParticles) this.mistParticles.material.opacity = 0.5;
      }, 1200);
    }
  }

  toggleAutoRotate() {
    AppState.autoRotate = !AppState.autoRotate;
    if (this.controls) {
      this.controls.autoRotate = AppState.autoRotate;
    }
    return AppState.autoRotate;
  }

  onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.mouse.targetX = x * 0.15;
    this.mouse.targetY = y * 0.15;
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Smooth mouse tilt parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.controls) {
      this.controls.update();
    }

    // Ice floating animation
    this.iceCubes.forEach((cube) => {
      cube.rotation.x += cube.userData.rotSpeedX;
      cube.rotation.y += cube.userData.rotSpeedY;
      cube.position.y = cube.userData.baseY + Math.sin(time * cube.userData.floatSpeed + cube.userData.phase) * 0.15;
    });

    // Mist particles
    if (this.mistParticles) {
      const pos = this.mistParticles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.01;
        if (pos[i] > 1.8) pos[i] = -2.2;
      }
      this.mistParticles.geometry.attributes.position.needsUpdate = true;
      this.mistParticles.rotation.y += 0.002;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ===================================================================
// VIRTUAL WALK-IN COOLER STEAM WIPE CANVAS INTERACTION
// ===================================================================
class SteamWipeInteraction {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.init();
  }

  init() {
    this.canvas.width = this.canvas.parentElement.clientWidth || 400;
    this.canvas.height = this.canvas.parentElement.clientHeight || 280;
    this.drawSteamLayer();

    const wipeHandler = (e) => this.wipe(e);

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      wipeHandler(e);
      sounds.playIceClink();
    });

    window.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) wipeHandler(e);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this.isDrawing = true;
      wipeHandler(e.touches[0]);
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDrawing) {
        wipeHandler(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });
  }

  drawSteamLayer() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'rgba(215, 245, 255, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Condensation frost speckles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 200; i++) {
      const rx = Math.random() * this.canvas.width;
      const ry = Math.random() * this.canvas.height;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, Math.random() * 4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#061325';
    this.ctx.font = 'bold 20px Cinzel, serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('❄️ WIPE FROST OFF GLASS ❄️', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '13px Plus Jakarta Sans, sans-serif';
    this.ctx.fillText('Drag cursor to peer into the 33°F Walk-In', this.canvas.width / 2, this.canvas.height / 2 + 25);
  }

  wipe(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 32, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

// ===================================================================
// PA LOTTERY INTERACTIVE SCRATCH-OFF TICKET
// ===================================================================
class ScratchOffTicket {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.isRevealed = false;

    this.init();
  }

  init() {
    this.canvas.width = this.canvas.parentElement.clientWidth || 360;
    this.canvas.height = this.canvas.parentElement.clientHeight || 250;
    this.reset();

    const scratchHandler = (e) => this.scratch(e);

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      sounds.playScratch();
      scratchHandler(e);
    });

    window.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) scratchHandler(e);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this.isDrawing = true;
      sounds.playScratch();
      scratchHandler(e.touches[0]);
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDrawing) {
        scratchHandler(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });
  }

  reset() {
    this.isRevealed = false;
    this.ctx.globalCompositeOperation = 'source-over';

    const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.3, '#f5c542');
    grad.addColorStop(0.7, '#cbd5e1');
    grad.addColorStop(1, '#a87412');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#060b13';
    this.ctx.font = 'bold 24px Cinzel, serif';
    this.ctx.fillText('★ SCRATCH WITH COIN ★', this.canvas.width / 2, this.canvas.height / 2 - 10);

    this.ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillText('Reveal Midtown In-Store Lucky Discount', this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  scratch(e) {
    if (this.isRevealed) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 28, 0, Math.PI * 2);
    this.ctx.fill();

    if (Math.random() > 0.65) {
      sounds.playScratch();
    }

    this.checkProgress();
  }

  checkProgress() {
    if (this.isRevealed) return;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 64) {
      if (pixels[i] === 0) transparentCount++;
    }

    const ratio = transparentCount / (totalPixels / 16);
    if (ratio > 0.45) {
      this.isRevealed = true;
      sounds.playWinFanfare();
      this.celebrate();
    }
  }

  celebrate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const container = this.canvas.parentElement;
    for (let i = 0; i < 45; i++) {
      const conf = document.createElement('div');
      conf.style.position = 'absolute';
      conf.style.width = '10px';
      conf.style.height = '10px';
      conf.style.borderRadius = '50%';
      conf.style.backgroundColor = ['#f5c542', '#fff7c2', '#00f0ff', '#4ade80'][Math.floor(Math.random() * 4)];
      conf.style.left = '50%';
      conf.style.top = '50%';
      conf.style.pointerEvents = 'none';
      conf.style.zIndex = '20';
      conf.style.transition = 'all 1s cubic-bezier(0.1, 1, 0.2, 1)';
      container.appendChild(conf);

      setTimeout(() => {
        const rad = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 180;
        conf.style.transform = `translate(${Math.cos(rad) * dist}px, ${Math.sin(rad) * dist}px) scale(0)`;
        conf.style.opacity = '0';
      }, 20);

      setTimeout(() => conf.remove(), 1100);
    }
  }
}

// ===================================================================
// BEER VAULT & 6-PACK MIX-AND-MATCH BUILDER
// ===================================================================
class PackBuilder {
  constructor() {
    this.items = [];
    this.maxSize = 6;
    this.bar = document.getElementById('pack-bar');
    this.slots = document.querySelectorAll('.pack-slot');
    this.statusText = document.getElementById('pack-status');
    this.modal = document.getElementById('pack-modal');
    this.modalList = document.getElementById('pack-modal-items');

    this.init();
  }

  init() {
    document.querySelectorAll('.btn-add-pack').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const name = card.querySelector('.product-name').innerText;
        this.addItem(name);
      });
    });

    if (this.bar) {
      this.bar.addEventListener('click', () => {
        if (this.modal) this.modal.classList.add('open');
      });
    }

    const closeBtn = document.getElementById('close-pack-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (this.modal) this.modal.classList.remove('open');
      });
    }
  }

  addItem(name) {
    if (this.items.length >= this.maxSize) {
      alert('Your Cold 6-Pack is full! Reserve your pack or remove a selection.');
      return;
    }

    this.items.push(name);
    sounds.playIceClink();
    this.updateUI();

    if (this.items.length === this.maxSize) {
      sounds.playWinFanfare();
      if (this.modal) this.modal.classList.add('open');
    }
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.updateUI();
  }

  updateUI() {
    this.slots.forEach((slot, idx) => {
      if (idx < this.items.length) {
        slot.classList.add('filled');
        slot.innerText = '🍺';
      } else {
        slot.classList.remove('filled');
        slot.innerText = '+';
      }
    });

    if (this.statusText) {
      this.statusText.innerText = `${this.items.length} / ${this.maxSize} Cans Selected`;
    }

    if (this.modalList) {
      this.modalList.innerHTML = '';
      if (this.items.length === 0) {
        this.modalList.innerHTML = '<li style="color:#8e9db2; font-size:0.95rem; text-align:center; padding:1.2rem;">Your 6-pack is empty. Click "+ Mix & Match" on any beer in the vault!</li>';
      } else {
        this.items.forEach((item, idx) => {
          const li = document.createElement('li');
          li.className = 'pack-item-row';
          li.innerHTML = `
            <span class="pack-item-name">${idx + 1}. ${item}</span>
            <button class="pack-item-remove" data-index="${idx}">✕ Remove</button>
          `;
          this.modalList.appendChild(li);
        });

        this.modalList.querySelectorAll('.pack-item-remove').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            this.removeItem(idx);
          });
        });
      }
    }
  }
}

// ===================================================================
// STORE REAL-TIME HOURS & TIMING (PA Eastern Time)
// ===================================================================
function updateStoreHoursStatus() {
  const statusEl = document.getElementById('live-store-status');
  if (!statusEl) return;

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  let isOpen = false;
  if (day === 0) {
    isOpen = hour >= 11 && hour < 20;
  } else {
    isOpen = hour >= 9 && hour < 22;
  }

  if (isOpen) {
    statusEl.innerHTML = `<span class="status-dot"></span> OPEN TODAY • ICE COLD BEER READY`;
  } else {
    statusEl.innerHTML = `<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 10px #f59e0b;"></span> OPENS AT 9:00 AM • VISIT US IN POTTSVILLE`;
  }

  const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayRow = document.getElementById(`hours-${daysMap[day]}`);
  if (todayRow) {
    todayRow.classList.add('today');
  }
}

// ===================================================================
// CUSTOM LUXURY CURSOR CONTROLLER
// ===================================================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  if (!cursor || !follower) return;

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    follower.style.left = `${e.clientX}px`;
    follower.style.top = `${e.clientY}px`;
  });

  const interactiveElements = document.querySelectorAll('a, button, canvas, .product-card, .service-card, .pack-builder-bar');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ===================================================================
// MAIN INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();

  // 1. Age Verification Gate
  const ageGate = document.getElementById('age-gate-modal');
  const btnVerifyAge = document.getElementById('btn-verify-age');
  const btnUnderAge = document.getElementById('btn-under-age');

  if (localStorage.getItem('midtown_age_verified') === 'true') {
    if (ageGate) ageGate.classList.add('hidden');
  }

  if (btnVerifyAge) {
    btnVerifyAge.addEventListener('click', () => {
      localStorage.setItem('midtown_age_verified', 'true');
      if (ageGate) ageGate.classList.add('hidden');
      AppState.soundEnabled = true;
      sounds.init();
      sounds.playCanPop();
      const audioBtn = document.getElementById('audio-toggle-btn');
      if (audioBtn) {
        audioBtn.classList.add('active');
        audioBtn.innerHTML = '🔊 Sound On';
      }
    });
  }

  if (btnUnderAge) {
    btnUnderAge.addEventListener('click', () => {
      alert('You must be 21 or older to view beer and tobacco offerings. Redirecting to Google.');
      window.location.href = 'https://www.google.com';
    });
  }

  // 2. Audio Toggle
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      AppState.soundEnabled = !AppState.soundEnabled;
      sounds.init();
      if (AppState.soundEnabled) {
        audioBtn.classList.add('active');
        audioBtn.innerHTML = '🔊 Sound On';
        sounds.playCanPop();
      } else {
        audioBtn.classList.remove('active');
        audioBtn.innerHTML = '🔇 Sound Off';
      }
    });
  }

  // 3. Preload Midtown Logo for 3D Textures
  const logoImg = new Image();
  logoImg.src = 'assets/logo.jpg';

  let showcase = null;
  logoImg.onload = () => {
    showcase = new ThreeShowcase('hero-3d-canvas', logoImg);
    bind3DControls(showcase);
  };
  logoImg.onerror = () => {
    showcase = new ThreeShowcase('hero-3d-canvas', null);
    bind3DControls(showcase);
  };

  // 4. Product Category Filters
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.category;

      sounds.playIceClink();

      productCards.forEach((card) => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 5. Walk-in Steam Wipe Minigame
  new SteamWipeInteraction('steam-canvas');

  // 6. Lottery Scratch Card Init
  const scratcher = new ScratchOffTicket('scratch-canvas');
  const resetScratchBtn = document.getElementById('btn-reset-scratch');
  if (resetScratchBtn) {
    resetScratchBtn.addEventListener('click', () => {
      scratcher.reset();
      sounds.playIceClink();
    });
  }

  // 7. 6-Pack Builder Drawer
  new PackBuilder();

  // 8. Store Hours & Local Time
  updateStoreHoursStatus();

  // 9. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileToggle.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.innerHTML = '☰';
      });
    });
  }
});

// Bind 3D Controls (IPA, Bottle, Lager, Coin, Pop Can/Bottle, Rotate)
function bind3DControls(showcase) {
  if (!showcase) return;

  const canBtns = document.querySelectorAll('.can-btn');
  canBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      canBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.can;
      showcase.setCanType(type);
    });
  });

  const popBtn = document.getElementById('btn-pop-can');
  if (popBtn) {
    popBtn.addEventListener('click', () => {
      showcase.popCan();
    });
  }

  const rotateBtn = document.getElementById('btn-toggle-spin');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      const isSpinning = showcase.toggleAutoRotate();
      rotateBtn.innerHTML = isSpinning ? '🔄' : '⏸️';
    });
  }
}
