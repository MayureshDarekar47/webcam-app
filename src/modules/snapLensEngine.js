/**
 * SNAPCHAT AR & LENS EFFECTS ENGINE
 * Real-time 60FPS Augmented Reality Overlays & Optical Lens FX
 */

export class SnapLensEngine {
  constructor(canvasElement, videoElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.video = videoElement;
    this.activeOverlay = null;
    this.isRunning = false;
    this.animId = null;

    // Particle pools for dynamic lenses
    this.butterflies = [];
    this.hearts = [];
    this.sparkles = [];
    this.matrixDrops = [];
    this.flameParticles = [];
    this.tearDrops = [];

    this._initParticlePools();
  }

  _initParticlePools() {
    // 7 Golden Butterflies
    this.butterflies = Array.from({ length: 7 }, (_, i) => ({
      x: 0.15 + (i * 0.12),
      y: 0.2 + (Math.random() * 0.45),
      baseX: 0.15 + (i * 0.12),
      baseY: 0.2 + (Math.random() * 0.45),
      size: 26 + (Math.random() * 14),
      speed: 0.8 + (Math.random() * 0.6),
      phase: i * 1.3,
      flapSpeed: 10 + (Math.random() * 4)
    }));

    // 16 Floating Hearts
    this.hearts = Array.from({ length: 16 }, () => ({
      x: Math.random(),
      y: 0.2 + Math.random() * 0.8,
      speedY: 0.002 + Math.random() * 0.003,
      swaySpeed: 2 + Math.random() * 2,
      swayAmount: 0.02 + Math.random() * 0.03,
      size: 16 + Math.random() * 18,
      opacity: 0.35 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2
    }));

    // 24 KiraKira Diamond Sparkles
    this.sparkles = Array.from({ length: 24 }, () => ({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      size: 12 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 3
    }));

    // 28 Matrix Digital Rain Columns
    this.matrixDrops = Array.from({ length: 28 }, () => ({
      y: Math.random() * -100,
      speed: 3 + Math.random() * 5,
      chars: '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'
    }));

    // 25 Flame Embers
    this.flameParticles = Array.from({ length: 25 }, () => ({
      x: 0.1 + Math.random() * 0.8,
      y: 0.95 + Math.random() * 0.05,
      vx: (Math.random() - 0.5) * 0.002,
      vy: -0.004 - Math.random() * 0.005,
      size: 8 + Math.random() * 14,
      alpha: 0.8,
      decay: 0.01 + Math.random() * 0.015
    }));

    // 8 Crying Tears
    this.tearDrops = Array.from({ length: 8 }, (_, i) => ({
      side: i % 2 === 0 ? 'left' : 'right',
      y: 0.35 + Math.random() * 0.5,
      speed: 0.006 + Math.random() * 0.004,
      size: 12 + Math.random() * 10
    }));
  }

  setOverlay(overlayId) {
    this.activeOverlay = overlayId;
    if (overlayId && !this.isRunning) {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = (timestamp) => {
      if (!this.isRunning) return;
      this._renderFrame(timestamp);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  _renderFrame(timestamp) {
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    // Sync canvas buffer resolution with element client rect or video
    const w = canvas.clientWidth || 640;
    const h = canvas.clientHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    if (!this.activeOverlay || this.activeOverlay === 'none') {
      return;
    }

    const time = timestamp * 0.001;

    switch (this.activeOverlay) {
      case 'dog-ears':
        this._drawDogEars(ctx, w, h, time);
        break;
      case 'flower-crown':
        this._drawFlowerCrown(ctx, w, h, time);
        break;
      case 'butterflies':
        this._drawButterflies(ctx, w, h, time);
        break;
      case 'cute-bear':
        this._drawCuteBear(ctx, w, h, time);
        break;
      case 'neon-horns':
        this._drawNeonHorns(ctx, w, h, time);
        break;
      case 'angel-halo':
        this._drawAngelHalo(ctx, w, h, time);
        break;
      case 'heart-shower':
        this._drawHeartShower(ctx, w, h, time);
        break;
      case 'fire-aura':
        this._drawFireAura(ctx, w, h, time);
        break;
      case 'vhs-1998':
        this._drawVhsCamcorder(ctx, w, h, time);
        break;
      case 'kirakira':
        this._drawKiraKira(ctx, w, h, time);
        break;
      case 'matrix-rain':
        this._drawMatrixRain(ctx, w, h, time);
        break;
      case 'fisheye':
        this._drawFisheye(ctx, w, h, time);
        break;
      case 'cyber-hud':
        this._drawCyberHud(ctx, w, h, time);
        break;
      case 'crying-tears':
        this._drawCryingTears(ctx, w, h, time);
        break;
      case 'alien-glow':
        this._drawAlienGlow(ctx, w, h, time);
        break;
      case 'glitch':
        this._drawGlitch(ctx, w, h, time);
        break;
      case 'golden-hour':
        this._drawGoldenHour(ctx, w, h, time);
        break;
      case 'soft-glam':
        this._drawSoftGlam(ctx, w, h, time);
        break;
      case 'noir-film':
        this._drawNoirGrain(ctx, w, h, time);
        break;
      case 'vintage-70s':
        this._drawVintageVignette(ctx, w, h, time);
        break;
      default:
        break;
    }
  }

  /* 1. SNAPCHAT DOG EARS & NOSE LENS 🐶 */
  _drawDogEars(ctx, w, h, time) {
    const earW = w * 0.22;
    const earH = h * 0.32;
    const waggle = Math.sin(time * 3.5) * 0.08;

    ctx.save();

    // Left Dog Ear
    ctx.save();
    ctx.translate(w * 0.26, h * 0.16);
    ctx.rotate(-0.35 + waggle);
    // Outer brown ear
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, 0, earW * 0.45, earH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner pink ear pad
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, earH * 0.05, earW * 0.28, earH * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Dog Ear
    ctx.save();
    ctx.translate(w * 0.74, h * 0.16);
    ctx.rotate(0.35 - waggle);
    // Outer brown ear
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, 0, earW * 0.45, earH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner pink ear pad
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, earH * 0.05, earW * 0.28, earH * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cute Dog Nose in Center
    const noseY = h * 0.48;
    const noseW = w * 0.11;
    const noseH = noseW * 0.75;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, noseY, noseW * 0.5, noseH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(w * 0.48, noseY - noseH * 0.15, noseW * 0.16, noseH * 0.12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cute animated pink tongue
    const tongueDrop = Math.sin(time * 2.5) * 8;
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, noseY + noseH * 1.1 + tongueDrop, noseW * 0.35, noseH * 0.55, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, noseY + noseH * 0.8 + tongueDrop);
    ctx.lineTo(w * 0.5, noseY + noseH * 1.5 + tongueDrop);
    ctx.stroke();

    ctx.restore();
  }

  /* 2. SNAPCHAT FLOWER CROWN LENS 🌸 */
  _drawFlowerCrown(ctx, w, h, time) {
    const crownY = h * 0.14;
    const flowers = 7;
    const colors = ['#f472b6', '#fbbf24', '#f87171', '#c084fc', '#facc15', '#f472b6', '#fb7185'];

    ctx.save();

    // Arched Green Vine
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.75)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.18, crownY + 20);
    ctx.quadraticCurveTo(w * 0.5, crownY - 30, w * 0.82, crownY + 20);
    ctx.stroke();

    // Glowing Golden Sparkles on Crown
    for (let i = 0; i < flowers; i++) {
      const t = (i + 1) / (flowers + 1);
      const fx = w * 0.2 + t * w * 0.6;
      const arcOffset = Math.sin(t * Math.PI) * 32;
      const fy = crownY + 18 - arcOffset;
      const flowerSize = 16 + Math.sin(time * 3 + i) * 2;

      // Draw Flower Petals
      ctx.fillStyle = colors[i % colors.length];
      for (let p = 0; p < 5; p++) {
        const angle = (p * Math.PI * 2) / 5 + time * 0.2;
        const px = fx + Math.cos(angle) * (flowerSize * 0.65);
        const py = fy + Math.sin(angle) * (flowerSize * 0.65);
        ctx.beginPath();
        ctx.arc(px, py, flowerSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flower Center
      ctx.fillStyle = '#fffc00';
      ctx.shadowColor = '#fffc00';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(fx, fy, flowerSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Drifting Golden Pollen
    ctx.fillStyle = 'rgba(255, 252, 0, 0.85)';
    for (let j = 0; j < 12; j++) {
      const px = w * (0.2 + ((j * 0.055 + time * 0.05) % 0.6));
      const py = crownY + 30 + ((j * 25 + time * 35) % (h * 0.5));
      const r = 2.5 + Math.sin(time * 4 + j) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* 3. SNAPCHAT GOLDEN BUTTERFLIES LENS 🦋 */
  _drawButterflies(ctx, w, h, time) {
    ctx.save();

    this.butterflies.forEach((b) => {
      // Hovering sine wave motion
      const bx = w * (b.baseX + Math.sin(time * b.speed + b.phase) * 0.08);
      const by = h * (b.baseY + Math.cos(time * b.speed * 1.2 + b.phase) * 0.06);
      const flap = Math.abs(Math.sin(time * b.flapSpeed));

      ctx.save();
      ctx.translate(bx, by);

      // Gold Glow Aura
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;

      // Left Wing
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.45 * flap, 0, b.size * 0.55 * flap, b.size * 0.45, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.ellipse(b.size * 0.45 * flap, 0, b.size * 0.55 * flap, b.size * 0.45, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Wing Core Highlights
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, b.size * 0.16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  /* 4. SNAPCHAT CUTE TEDDY BEAR LENS 🐻 */
  _drawCuteBear(ctx, w, h, time) {
    const earR = w * 0.095;
    const wiggle = Math.sin(time * 3) * 0.05;

    ctx.save();

    // Left Bear Ear
    ctx.save();
    ctx.translate(w * 0.28, h * 0.14);
    ctx.rotate(-0.2 + wiggle);
    ctx.fillStyle = '#78350f'; // Dark felt brown
    ctx.beginPath();
    ctx.arc(0, 0, earR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8'; // Soft pink inner
    ctx.beginPath();
    ctx.arc(0, 0, earR * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Bear Ear
    ctx.save();
    ctx.translate(w * 0.72, h * 0.14);
    ctx.rotate(0.2 - wiggle);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, 0, earR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, 0, earR * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rosy Pink Cheeks Blush
    const blushR = w * 0.08;
    ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
    ctx.beginPath();
    ctx.arc(w * 0.28, h * 0.52, blushR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.52, blushR, 0, Math.PI * 2);
    ctx.fill();

    // Bear Nose
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.47, w * 0.045, w * 0.032, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* 5. SNAPCHAT NEON DEVIL HORNS LENS 😈 */
  _drawNeonHorns(ctx, w, h, time) {
    const pulse = 0.85 + Math.sin(time * 4) * 0.15;
    ctx.save();

    ctx.strokeStyle = '#d946ef';
    ctx.fillStyle = 'rgba(217, 70, 239, 0.35)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 25 * pulse;

    // Left Horn
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.16);
    ctx.quadraticCurveTo(w * 0.26, h * 0.06, w * 0.22, h * 0.03);
    ctx.quadraticCurveTo(w * 0.28, h * 0.1, w * 0.36, h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Horn
    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.16);
    ctx.quadraticCurveTo(w * 0.74, h * 0.06, w * 0.78, h * 0.03);
    ctx.quadraticCurveTo(w * 0.72, h * 0.1, w * 0.64, h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /* 6. SNAPCHAT ANGEL HALO LENS 😇 */
  _drawAngelHalo(ctx, w, h, time) {
    const bob = Math.sin(time * 2.5) * 8;
    const haloX = w * 0.5;
    const haloY = h * 0.1 + bob;

    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 30;

    // Outer Golden Ring
    ctx.strokeStyle = '#fffc00';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.ellipse(haloX, haloY, w * 0.22, h * 0.055, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner White Core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(haloX, haloY, w * 0.22, h * 0.055, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Celestial Twinkle Rays
    ctx.fillStyle = '#fffc00';
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + time * 1.5;
      const rx = haloX + Math.cos(angle) * (w * 0.23);
      const ry = haloY + Math.sin(angle) * (h * 0.06);
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* 7. SNAPCHAT LOVE SHOWER HEARTS LENS 💖 */
  _drawHeartShower(ctx, w, h, time) {
    ctx.save();

    this.hearts.forEach((heart) => {
      heart.y -= heart.speedY;
      if (heart.y < -0.05) {
        heart.y = 1.05;
        heart.x = Math.random();
      }

      const hx = (heart.x + Math.sin(time * heart.swaySpeed + heart.phase) * heart.swayAmount) * w;
      const hy = heart.y * h;
      const s = heart.size;

      ctx.save();
      ctx.translate(hx, hy);
      ctx.fillStyle = `rgba(244, 63, 94, ${heart.opacity})`;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;

      // Draw SVG Heart path
      ctx.beginPath();
      const topCurveHeight = s * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, topCurveHeight);
      ctx.bezierCurveTo(-s / 2, (s + topCurveHeight) / 2, 0, (s + topCurveHeight) / 2, 0, s);
      ctx.bezierCurveTo(0, (s + topCurveHeight) / 2, s / 2, (s + topCurveHeight) / 2, s / 2, topCurveHeight);
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  /* 8. SNAPCHAT FIRE FLAME LENS 🔥 */
  _drawFireAura(ctx, w, h, time) {
    ctx.save();

    // Bottom Fire Gradient Glow
    const grad = ctx.createLinearGradient(0, h, 0, h * 0.72);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.25)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // Dancing Flame Tongues
    ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 25) {
      const tongueH = Math.sin(x * 0.05 + time * 6) * 22 + Math.cos(x * 0.03 + time * 4) * 15;
      ctx.lineTo(x, h - 35 - tongueH);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Rising Burning Embers
    this.flameParticles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y < 0.4) {
        p.y = 0.95 + Math.random() * 0.05;
        p.x = 0.1 + Math.random() * 0.8;
        p.alpha = 0.8;
      }

      ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size * p.alpha, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /* 9. SNAPCHAT RETRO VHS 1998 LENS 📼 */
  _drawVhsCamcorder(ctx, w, h, time) {
    ctx.save();

    // Subtle VHS Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // Top Left: Blinking Red ● REC and SP Mode
    const isBlink = Math.floor(time * 2) % 2 === 0;
    if (isBlink) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 32, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px "Courier New", monospace';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText('REC', 44, 37);

    ctx.fillText('SP 0:42:18', w - 130, 37);

    // Bottom Left: Retro Timestamp
    const now = new Date();
    const dateStr = `OCT 23 1998`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    ctx.fillText(dateStr, 24, h - 45);
    ctx.fillText(timeStr, 24, h - 22);

    // Occasional Tracking Glitch Bar
    if (Math.sin(time * 1.5) > 0.88) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      const gy = (time * 80) % h;
      ctx.fillRect(0, gy, w, 12);
    }

    ctx.restore();
  }

  /* 10. SNAPCHAT KIRAKIRA DIAMOND STARS LENS 💎 */
  _drawKiraKira(ctx, w, h, time) {
    ctx.save();

    this.sparkles.forEach((s) => {
      const scale = Math.max(0, Math.sin(time * s.speed + s.phase));
      if (scale < 0.05) return;

      const sx = s.x * w;
      const sy = s.y * h;
      const len = s.size * scale;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(time * 0.5 + s.phase);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;

      // 4-point Diamond Starburst
      ctx.beginPath();
      ctx.moveTo(0, -len);
      ctx.quadraticCurveTo(0, 0, len, 0);
      ctx.quadraticCurveTo(0, 0, 0, len);
      ctx.quadraticCurveTo(0, 0, -len, 0);
      ctx.quadraticCurveTo(0, 0, 0, -len);
      ctx.fill();

      // Gleam Center
      ctx.fillStyle = '#fffc00';
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  /* 11. SNAPCHAT MATRIX DIGITAL RAIN LENS 🟢 */
  _drawMatrixRain(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#22c55e';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 8;

    const colWidth = w / this.matrixDrops.length;
    this.matrixDrops.forEach((drop, i) => {
      drop.y += drop.speed;
      if (drop.y > h + 100) drop.y = -50;

      const char = drop.chars[Math.floor(Math.random() * drop.chars.length)];
      ctx.fillText(char, i * colWidth + 4, drop.y);
    });

    ctx.restore();
  }

  /* 12. SNAPCHAT FISHEYE ACTION CAM LENS 🛹 */
  _drawFisheye(ctx, w, h) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.min(w, h) * 0.48;

    // Circular Vignette Mask
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius * 1.05);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Chromatic Ring
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /* 13. SNAPCHAT CYBERPUNK HUD LENS ⚡ */
  _drawCyberHud(ctx, w, h, time) {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.fillStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.font = '600 12px "JetBrains Mono", monospace';

    const cx = w * 0.5;
    const cy = h * 0.46;
    const reticleR = 64;

    // Center Crosshair Reticle
    ctx.beginPath();
    ctx.arc(cx, cy, reticleR, 0, Math.PI * 2);
    ctx.stroke();

    // Target Corners
    const s = 24;
    // Top-Left Bracket
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.25 + s);
    ctx.lineTo(w * 0.15, h * 0.25);
    ctx.lineTo(w * 0.15 + s, h * 0.25);
    ctx.stroke();

    // Top-Right Bracket
    ctx.beginPath();
    ctx.moveTo(w * 0.85 - s, h * 0.25);
    ctx.lineTo(w * 0.85, h * 0.25);
    ctx.lineTo(w * 0.85, h * 0.25 + s);
    ctx.stroke();

    // Telemetry text
    ctx.fillText('SYS.OPT: TARGET LOCK', w * 0.15, h * 0.22);
    ctx.fillText('BATTERY: 98% [OK]', w * 0.65, h * 0.22);
    ctx.fillText(`AZ: ${(time * 20 % 360).toFixed(1)}°`, cx - 35, cy + reticleR + 24);

    ctx.restore();
  }

  /* 14. SNAPCHAT CRYING DRAMA TEARS LENS 😭 */
  _drawCryingTears(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#60a5fa';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 12;

    this.tearDrops.forEach((t) => {
      t.y += t.speed;
      if (t.y > 0.88) t.y = 0.38;

      const tx = t.side === 'left' ? w * 0.38 : w * 0.62;
      const ty = t.y * h;

      ctx.beginPath();
      ctx.ellipse(tx, ty, t.size * 0.4, t.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /* 15. SNAPCHAT ALIEN GLOW LENS 👽 */
  _drawAlienGlow(ctx, w, h, time) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.45;
    const glow = Math.sin(time * 3) * 0.15 + 0.35;

    const grad = ctx.createRadialGradient(cx, cy, w * 0.2, cx, cy, w * 0.65);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(132, 204, 22, ${glow})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  /* 16. SNAPCHAT GLITCH CHROMATIC LENS 👾 */
  _drawGlitch(ctx, w, h, time) {
    if (Math.sin(time * 8) < 0.6) return;
    ctx.save();

    const barY = Math.random() * h;
    const barH = 15 + Math.random() * 30;

    // Cyan Glitch Slice
    ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.fillRect(0, barY, w, barH);

    // Red Displacement
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.fillRect(0, barY + 5, w, barH * 0.6);

    ctx.restore();
  }

  /* 17. SNAPCHAT GOLDEN HOUR SUNBEAMS 🌅 */
  _drawGoldenHour(ctx, w, h, time) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.15)');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating Golden Dust Motes
    ctx.fillStyle = 'rgba(255, 252, 0, 0.7)';
    for (let i = 0; i < 15; i++) {
      const mx = (w * (0.1 + (i * 0.06 + Math.sin(time + i) * 0.05))) % w;
      const my = (h * (0.15 + (i * 0.05 + Math.cos(time + i) * 0.04))) % h;
      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* 18. SNAPCHAT SOFT GLAM BEAUTY 💋 */
  _drawSoftGlam(ctx, w, h) {
    ctx.save();
    // Subtle Pink Porcelain Vignette
    const cx = w * 0.5;
    const cy = h * 0.48;
    const grad = ctx.createRadialGradient(cx, cy, w * 0.25, cx, cy, w * 0.65);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /* 19. CINEMA NOIR GRAIN 🎬 */
  _drawNoirGrain(ctx, w, h) {
    ctx.save();
    // Dramatic Top & Bottom Cinematic Letterbox Bars
    const barH = h * 0.07;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);
    ctx.restore();
  }

  /* 20. VINTAGE POLAROID 1974 🎞️ */
  _drawVintageVignette(ctx, w, h) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w * 0.7);
    grad.addColorStop(0, 'rgba(180, 83, 9, 0.05)');
    grad.addColorStop(1, 'rgba(69, 26, 3, 0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
