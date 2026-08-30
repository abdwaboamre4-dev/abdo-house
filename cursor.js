/**
 * ABDO HOUSE — Custom Luxury Cursor System
 * Context-aware pointer, magnetic pull, and smooth morphing states (VIEW, PLAY).
 */

export class LuxuryCursor {
  constructor() {
    this.dot = document.querySelector('.cursor-dot');
    this.ring = document.querySelector('.cursor-ring');
    this.text = document.querySelector('.cursor-text');
    
    this.mouse = { x: -100, y: -100 };
    this.ringPos = { x: -100, y: -100 };
    this.isActive = false;

    // Check if device has fine pointer (mouse)
    if (window.matchMedia('(pointer: fine)').matches) {
      this.init();
    }
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      if (!this.isActive) {
        this.isActive = true;
        this.ringPos.x = e.clientX;
        this.ringPos.y = e.clientY;
      }

      if (this.dot) {
        this.dot.style.left = `${this.mouse.x}px`;
        this.dot.style.top = `${this.mouse.y}px`;
      }
    });

    // Loop for smooth ring interpolation
    const updateRing = () => {
      if (this.isActive && this.ring) {
        this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.15;
        this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.15;
        this.ring.style.left = `${this.ringPos.x}px`;
        this.ring.style.top = `${this.ringPos.y}px`;
      }
      requestAnimationFrame(updateRing);
    };
    requestAnimationFrame(updateRing);

    this.attachContextEvents();
  }

  attachContextEvents() {
    // Project cards -> "VIEW"
    document.querySelectorAll('[data-cursor="view"], .project-card').forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('VIEW', true));
      el.addEventListener('mouseleave', () => this.resetState());
    });

    // Videos / Media Player -> "PLAY"
    document.querySelectorAll('[data-cursor="play"], .cs-player-wrapper, .hero-video-sim').forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('PLAY', true));
      el.addEventListener('mouseleave', () => this.resetState());
    });

    // Buttons / Links -> Expand ring subtly
    document.querySelectorAll('a, button, .btn, input, select, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (!this.ring.classList.contains('hover-active')) {
          this.ring.style.transform = 'translate(-50%, -50%) scale(1.35)';
          this.ring.style.borderColor = 'var(--accent-gold)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!this.ring.classList.contains('hover-active')) {
          this.ring.style.transform = 'translate(-50%, -50%) scale(1)';
          this.ring.style.borderColor = 'var(--accent-gold-hairline)';
        }
      });
    });
  }

  setState(text, isHoverActive = true) {
    if (!this.ring) return;
    if (this.text) this.text.textContent = text;
    if (isHoverActive) this.ring.classList.add('hover-active');
  }

  resetState() {
    if (!this.ring) return;
    this.ring.classList.remove('hover-active');
    this.ring.style.transform = 'translate(-50%, -50%) scale(1)';
    this.ring.style.borderColor = 'var(--accent-gold-hairline)';
  }
}
