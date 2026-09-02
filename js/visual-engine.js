/**
 * ABDO HOUSE — Visual Engine
 * Manages atmospheric ambient canvas, particle physics, and cinematic project renderers.
 */

export class VisualEngine {
  constructor() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.ambientCtx = this.ambientCanvas ? this.ambientCanvas.getContext('2d') : null;
    this.particles = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };
    this.projectCanvases = new Map();
    this.animFrameId = null;

    this.initAmbient();
    this.bindEvents();
    this.startLoop();
  }

  initAmbient() {
    if (!this.ambientCanvas) return;
    this.resizeAmbient();
    
    // Create subtle champagne gold dust particles
    const count = Math.min(window.innerWidth > 768 ? 40 : 18, 50);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25 - 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }
  }

  resizeAmbient() {
    if (!this.ambientCanvas) return;
    this.width = this.ambientCanvas.width = window.innerWidth;
    this.height = this.ambientCanvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeAmbient();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });
  }

  startLoop() {
    const render = (time) => {
      this.renderAmbient(time);
      this.renderProjectCanvases(time);
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  renderAmbient(time) {
    if (!this.ambientCtx) return;
    const ctx = this.ambientCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    // Subtle luxury chiaroscuro radial glow following cursor
    const gradient = ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 50,
      this.mouse.x, this.mouse.y, Math.max(this.width, this.height) * 0.6
    );
    gradient.addColorStop(0, 'rgba(201, 178, 124, 0.035)');
    gradient.addColorStop(0.4, 'rgba(23, 23, 26, 0.015)');
    gradient.addColorStop(1, 'rgba(11, 11, 13, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Render floating champagne dust particles
    ctx.fillStyle = '#C9B27C';
    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseAngle += p.pulseSpeed;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;
      ctx.globalAlpha = Math.max(0.05, currentAlpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Register an interactive procedural visual renderer for project cards and modals
   */
  registerProjectVisual(canvasId, visualType) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    this.projectCanvases.set(canvasId, {
      canvas,
      ctx,
      type: visualType,
      phase: Math.random() * 100,
      hovered: false
    });
  }

  setHover(canvasId, isHovered) {
    const item = this.projectCanvases.get(canvasId);
    if (item) item.hovered = isHovered;
  }

  renderProjectCanvases(time) {
    const t = time * 0.001;

    for (const [id, item] of this.projectCanvases) {
      const { canvas, ctx, type, hovered } = item;
      
      // Check if canvas is currently in viewport for optimal performance
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth || 600;
        canvas.height = canvas.clientHeight || 400;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Dark background slate
      ctx.fillStyle = '#0B0B0D';
      ctx.fillRect(0, 0, w, h);

      // Render based on visual type
      switch (type) {
        case 'perfume':
          this.renderPerfumeArt(ctx, cx, cy, w, h, t, hovered);
          break;
        case 'beauty':
          this.renderBeautyArt(ctx, cx, cy, w, h, t, hovered);
          break;
        case 'watch':
          this.renderWatchArt(ctx, cx, cy, w, h, t, hovered);
          break;
        case 'coffee':
          this.renderCoffeeArt(ctx, cx, cy, w, h, t, hovered);
          break;
        case 'fashion':
          this.renderFashionArt(ctx, cx, cy, w, h, t, hovered);
          break;
        case 'tech':
          this.renderTechArt(ctx, cx, cy, w, h, t, hovered);
          break;
        default:
          this.renderGenericLuxuryArt(ctx, cx, cy, w, h, t, hovered);
      }

      ctx.restore();
    }
  }

  renderPerfumeArt(ctx, cx, cy, w, h, t, hovered) {
    // MONARCH: Obsidian bottle with golden vapor refraction
    const speed = hovered ? 1.5 : 0.8;
    const rot = Math.sin(t * 0.4 * speed) * 0.05;

    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Volumetric back glow
    const glow = ctx.createRadialGradient(0, -20, 10, 0, 0, Math.min(w, h) * 0.45);
    glow.addColorStop(0, 'rgba(201, 178, 124, 0.28)');
    glow.addColorStop(0.5, 'rgba(23, 23, 26, 0.4)');
    glow.addColorStop(1, 'rgba(11, 11, 13, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-w/2, -h/2, w, h);

    // Bottle Silhouette
    const bw = Math.min(w, h) * 0.28;
    const bh = bw * 1.5;

    // Outer Glass Chiaroscuro
    ctx.strokeStyle = 'rgba(201, 178, 124, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-bw/2, -bh/2 + 20, bw, bh);

    // Inner Obsidian Core
    ctx.fillStyle = '#141417';
    ctx.fillRect(-bw/2 + 4, -bh/2 + 24, bw - 8, bh - 8);

    // Golden Liquid Level
    const liquidH = (bh - 16) * 0.65;
    const liquidGrad = ctx.createLinearGradient(0, bh/2 - liquidH, 0, bh/2);
    liquidGrad.addColorStop(0, 'rgba(201, 178, 124, 0.7)');
    liquidGrad.addColorStop(1, 'rgba(150, 120, 60, 0.85)');
    ctx.fillStyle = liquidGrad;
    ctx.fillRect(-bw/2 + 6, bh/2 - liquidH, bw - 12, liquidH);

    // Gold Cap
    ctx.fillStyle = '#C9B27C';
    ctx.fillRect(-bw * 0.25, -bh/2 - 15, bw * 0.5, 35);

    // Aerosol Vapor Ring
    ctx.strokeStyle = 'rgba(242, 239, 232, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -bh/2 - 25, (bw * 0.6) + Math.sin(t * 2) * 8, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderBeautyArt(ctx, cx, cy, w, h, t, hovered) {
    // VELORA: Iridescent serum droplets
    const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.min(w, h) * 0.5);
    glow.addColorStop(0, 'rgba(201, 178, 124, 0.2)');
    glow.addColorStop(0.6, 'rgba(30, 24, 29, 0.4)');
    glow.addColorStop(1, 'rgba(11, 11, 13, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Floating Droplets
    for (let i = 0; i < 5; i++) {
      const angle = t * 0.5 + i * (Math.PI * 2 / 5);
      const dist = Math.min(w, h) * 0.22 + Math.sin(t + i) * 15;
      const dx = cx + Math.cos(angle) * dist;
      const dy = cy + Math.sin(angle) * (dist * 0.6);
      const r = 12 + Math.sin(t * 2 + i) * 3;

      const dropGrad = ctx.createRadialGradient(dx - r*0.3, dy - r*0.3, 2, dx, dy, r);
      dropGrad.addColorStop(0, '#FFFFFF');
      dropGrad.addColorStop(0.3, '#C9B27C');
      dropGrad.addColorStop(0.8, '#1E181D');
      dropGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = dropGrad;
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central Botanical Flask
    ctx.strokeStyle = '#C9B27C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderWatchArt(ctx, cx, cy, w, h, t, hovered) {
    // AUREN: Mechanical Tourbillon Escapement
    const speed = hovered ? 0.9 : 0.4;
    const r = Math.min(w, h) * 0.28;

    // Outer Dial
    ctx.strokeStyle = 'rgba(201, 178, 124, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Hour Markers
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const x1 = cx + Math.cos(a) * (r - 12);
      const y1 = cy + Math.sin(a) * (r - 12);
      const x2 = cx + Math.cos(a) * (r - 4);
      const y2 = cy + Math.sin(a) * (r - 4);
      ctx.strokeStyle = i % 3 === 0 ? '#C9B27C' : 'rgba(242, 239, 232, 0.3)';
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Rotating Gear System
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * speed);

    const teeth = 18;
    const gearR = r * 0.6;
    ctx.fillStyle = 'rgba(201, 178, 124, 0.18)';
    ctx.strokeStyle = '#C9B27C';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = (i * 2 * Math.PI) / teeth;
      const a2 = ((i + 0.5) * 2 * Math.PI) / teeth;
      ctx.lineTo(Math.cos(a1) * gearR, Math.sin(a1) * gearR);
      ctx.lineTo(Math.cos(a2) * (gearR + 6), Math.sin(a2) * (gearR + 6));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Tourbillon Bridge
    ctx.fillStyle = '#C9B27C';
    ctx.fillRect(-gearR * 0.8, -2, gearR * 1.6, 4);
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderCoffeeArt(ctx, cx, cy, w, h, t, hovered) {
    // NOIR COFFEE: Swirling liquid vortex & amber reflections
    const r = Math.min(w, h) * 0.32;
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.5);
    glow.addColorStop(0, 'rgba(201, 178, 124, 0.25)');
    glow.addColorStop(0.5, 'rgba(26, 21, 19, 0.6)');
    glow.addColorStop(1, 'rgba(11, 11, 13, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Fluid Vortex Spiral
    ctx.strokeStyle = 'rgba(201, 178, 124, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 200; i++) {
      const angle = 0.1 * i + t * (hovered ? 1.5 : 0.8);
      const rad = (r * (i / 200));
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * (rad * 0.75);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  renderFashionArt(ctx, cx, cy, w, h, t, hovered) {
    // VANTÉ: Silk waves in zero gravity
    const lines = 16;
    for (let i = 0; i < lines; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(201, 178, 124, 0.35)' : 'rgba(242, 239, 232, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 15) {
        const y = cy + Math.sin(x * 0.01 + t * 0.8 + i * 0.3) * (50 + i * 4) + Math.cos(t * 0.5 + x * 0.005) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  renderTechArt(ctx, cx, cy, w, h, t, hovered) {
    // NEXUS: Acoustic rings and monolithic precision
    const rings = 6;
    const maxR = Math.min(w, h) * 0.38;

    for (let i = 1; i <= rings; i++) {
      const wave = Math.sin(t * 2 - i * 0.6);
      const currentR = (maxR / rings) * i + wave * 6;
      ctx.strokeStyle = i === 3 ? '#C9B27C' : `rgba(201, 178, 124, ${0.15 + (wave + 1) * 0.15})`;
      ctx.lineWidth = i === 3 ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Monolithic Core
    ctx.fillStyle = '#17171A';
    ctx.strokeStyle = '#C9B27C';
    ctx.lineWidth = 1;
    ctx.fillRect(cx - 30, cy - 30, 60, 60);
    ctx.strokeRect(cx - 30, cy - 30, 60, 60);
  }

  renderGenericLuxuryArt(ctx, cx, cy, w, h, t, hovered) {
    ctx.strokeStyle = 'rgba(201, 178, 124, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  }
}
