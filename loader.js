/**
 * ABDO HOUSE — Choreographed Luxury Page-Load & Transition Engine
 * 8-stage luxury reveal sequence featuring the official uploaded ABDO HOUSE logo.
 */

export class LuxuryLoader {
  constructor(onComplete) {
    this.loaderEl = document.querySelector('.luxury-loader');
    this.logoImg = document.querySelector('.loader-logo-img');
    this.progressEl = document.querySelector('.loader-progress');
    this.onComplete = onComplete;

    this.runIntroSequence();
  }

  runIntroSequence() {
    // 1. Black screen -> 2. Official ABDO HOUSE logo appears with luxury ease
    setTimeout(() => {
      if (this.logoImg) this.logoImg.classList.add('revealed');
      if (this.progressEl) this.progressEl.style.width = '100%';
    }, 150);

    // 3. Logo slowly fades out loader
    setTimeout(() => {
      if (this.loaderEl) {
        this.loaderEl.classList.add('hidden');
      }
      this.triggerHeroReveal();
    }, 1400);
  }

  triggerHeroReveal() {
    // 4. Large headline reveals line by line
    const headlineLines = document.querySelectorAll('.hero-headline .reveal');
    headlineLines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('active');
      }, index * 200);
    });

    // 5. Background visual gradually becomes visible
    setTimeout(() => {
      const bg = document.querySelector('.hero-video-sim');
      if (bg) bg.style.opacity = '0.35';
    }, 450);

    // 6. Navigation fades in
    setTimeout(() => {
      const header = document.querySelector('.site-header');
      if (header) {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }
    }, 650);

    // 7. CTA buttons & description appear
    setTimeout(() => {
      const desc = document.querySelector('.hero-description');
      const ctas = document.querySelector('.hero-cta-group');
      if (desc) desc.classList.add('active');
      if (ctas) ctas.classList.add('active');
    }, 850);

    // 8. Small gold line animates horizontally
    setTimeout(() => {
      const goldLine = document.querySelector('.hero-gold-line');
      if (goldLine) goldLine.classList.add('active');

      if (this.onComplete) this.onComplete();
    }, 1100);
  }

  static triggerTransition(callback) {
    // Remove any existing transition overlays first
    document.querySelectorAll('.transition-veil-overlay').forEach(el => el.remove());

    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'transition-veil-overlay';
    transitionOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: var(--bg-primary);
      z-index: 99999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    transitionOverlay.innerHTML = `
      <img src="assets/images/abdo-house-logo.jpg" 
           alt="ABDO HOUSE" 
           style="width: 80px; height: 80px; object-fit: contain; opacity: 0.95; pointer-events: none;">
    `;

    document.body.appendChild(transitionOverlay);
    requestAnimationFrame(() => {
      transitionOverlay.style.opacity = '1';
    });

    setTimeout(() => {
      if (callback) {
        try {
          callback();
        } catch (err) {
          console.error(err);
        }
      }
      setTimeout(() => {
        transitionOverlay.style.opacity = '0';
        setTimeout(() => {
          transitionOverlay.remove();
        }, 250);
      }, 80);
    }, 220);
  }
}
