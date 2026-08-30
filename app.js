/**
 * ABDO HOUSE — Master Application Controller
 * Creative & Social Media Agency (Saudi Arabia, UAE, Qatar, Bahrain, Kuwait & GCC)
 */

import { PROJECTS_DATA } from './projects-data.js';
import { VisualEngine } from './visual-engine.js';
import { LuxuryCursor } from './cursor.js';
import { LuxuryLoader } from './loader.js';
import { AudioSystem } from './audio-system.js';
import { CaseStudyModal } from './case-study-modal.js';

class App {
  constructor() {
    this.visualEngine = null;
    this.cursor = null;
    this.loader = null;
    this.audio = null;
    this.caseStudyModal = null;

    this.init();
  }

  init() {
    // 1. Initialize Visual Engine
    this.visualEngine = new VisualEngine();

    // 2. Initialize Audio System
    this.audio = new AudioSystem();

    // 3. Render Portfolio Cards (Dynamic Real Media + Canvas Fallback)
    this.renderPortfolio();

    // 4. Initialize Case Study Presentation System
    this.caseStudyModal = new CaseStudyModal(this.visualEngine);

    // 5. Initialize Custom Luxury Cursor
    this.cursor = new LuxuryCursor();

    // 6. Initialize Luxury Intro Loader
    this.loader = new LuxuryLoader(() => {
      this.initScrollAnimations();
    });

    // 7. Setup Navigation & Header Events
    this.initHeader();

    // 8. Setup Inquiry Drawer & WhatsApp Subscription Flow
    this.initInquiryDrawer();

    // 9. Setup Plan Selection Triggers
    this.initPlanSelectors();

    // 10. Setup Mobile Navigation
    this.initMobileMenu();
  }

  renderPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    grid.innerHTML = PROJECTS_DATA.map((project, index) => {
      const isFeatured = project.isFeatured || index === 0;
      const mediaSrc = project.image || project.posterSrc;
      const videoSrc = project.video || project.videoSrc;

      return `
        <article class="project-card ${isFeatured ? 'featured-project' : ''}" data-project-id="${project.id}" data-cursor="view">
          <div class="project-media-wrapper">
            <!-- Canvas Procedural Fallback Renderer -->
            <canvas id="project-canvas-${project.id}" class="project-media"></canvas>
            
            <!-- Real Thumbnail Image if Available -->
            ${mediaSrc ? `
              <img src="${mediaSrc}" 
                   alt="${project.title}" 
                   class="project-media real-media-img"
                   style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:1;"
                   onload="this.style.display='block'; const c = document.getElementById('project-canvas-${project.id}'); if(c) c.style.display='none';"
                   onerror="this.remove();">
            ` : ''}

            <!-- Real Video Preview if Available (Muted, Looping, Responsive) -->
            ${videoSrc ? `
              <video src="${videoSrc}"
                     poster="${mediaSrc || ''}"
                     muted loop playsinline autoplay
                     class="project-media real-media-video"
                     style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:1;"
                     onloadeddata="this.style.display='block'; const c = document.getElementById('project-canvas-${project.id}'); if(c) c.style.display='none'; this.play().catch(()=>{});"
                     onerror="this.remove();">
              </video>
            ` : ''}

            <div class="project-media-overlay" style="z-index:2;"></div>
            <div class="project-top-meta" style="z-index:3;">
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span class="project-number">${project.num} / 06</span>
                ${isFeatured ? '<span class="featured-pill">FEATURED FILM</span>' : ''}
              </div>
              <span class="badge-concept">AGENCY WORK</span>
            </div>
            <div class="project-hover-cta" style="z-index:3;">
              <span>EXPLORE CASE STUDY</span>
              <span style="color:var(--accent-gold);">→</span>
            </div>
          </div>
          <div class="project-info">
            <div>
              <h3 class="project-title">${project.title}</h3>
              <p class="project-category">${project.subtitle} &bull; ${project.category}</p>
            </div>
            <span class="project-year">${project.year}</span>
          </div>
        </article>
      `;
    }).join('');

    // Ensure all real videos start playing smoothly on load
    setTimeout(() => {
      document.querySelectorAll('.real-media-video').forEach(vid => {
        vid.play().catch(() => {});
      });

      PROJECTS_DATA.forEach(project => {
        const canvasId = `project-canvas-${project.id}`;
        this.visualEngine.registerProjectVisual(canvasId, project.visualType);

        const card = document.querySelector(`[data-project-id="${project.id}"]`);
        if (card) {
          card.addEventListener('mouseenter', () => {
            this.visualEngine.setHover(canvasId, true);
            const v = card.querySelector('.real-media-video');
            if (v) v.play().catch(() => {});
          });
          card.addEventListener('mouseleave', () => {
            this.visualEngine.setHover(canvasId, false);
          });
        }
      });
    }, 50);
  }

  initHeader() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Smooth Anchor Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#' && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
            // Close mobile menu if open
            const drawer = document.querySelector('.mobile-nav-drawer');
            const toggle = document.querySelector('.mobile-toggle');
            if (drawer && toggle) {
              drawer.classList.remove('active');
              toggle.classList.remove('active');
            }
          }
        }
      });
    });
  }

  initScrollAnimations() {
    const observerOptions = {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          const v = entry.target.querySelector('video');
          if (v) v.play().catch(() => {});
        }
      });
    }, observerOptions);

    document.querySelectorAll('section, .project-card, .agency-service-card, .platform-card, .process-card, .pricing-card-agency, .about-pillar-card').forEach(el => {
      revealObserver.observe(el);
    });
  }

  initPlanSelectors() {
    const planButtons = document.querySelectorAll('[data-action="choose-plan"]');
    const overlay = document.querySelector('.inquiry-drawer-overlay');
    const planInput = document.getElementById('selected-plan-input');
    const chips = document.querySelectorAll('.plan-chip');

    planButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const planName = btn.dataset.plan || 'Growth';
        
        // Select corresponding chip
        chips.forEach(chip => {
          if (chip.dataset.plan.toLowerCase().includes(planName.toLowerCase())) {
            chip.classList.add('active');
            if (planInput) planInput.value = chip.dataset.plan;
          } else {
            chip.classList.remove('active');
          }
        });

        // Open drawer
        if (overlay) {
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        }
      });
    });

    // Handle chips click inside drawer
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (planInput) planInput.value = chip.dataset.plan;
      });
    });
  }

  initInquiryDrawer() {
    const overlay = document.querySelector('.inquiry-drawer-overlay');
    const openBtns = document.querySelectorAll('[data-action="open-inquiry"]');
    const closeBtn = document.querySelector('.drawer-close');
    const form = document.getElementById('inquiry-form');

    if (!overlay) return;

    const unlockPageScroll = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => unlockPageScroll());
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        unlockPageScroll();
      }
    });

    // Escape key closes inquiry drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        unlockPageScroll();
      }
    });

    // Inquiry Form Submission & WhatsApp Deep Link Redirect
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const planInput = document.getElementById('selected-plan-input');
        const nameInput = document.getElementById('inquiry-name');
        const locationInput = document.getElementById('inquiry-location');
        const phoneInput = document.getElementById('inquiry-phone');
        const emailInput = document.getElementById('inquiry-email');
        const descInput = document.getElementById('inquiry-desc');

        const selectedPlan = planInput ? planInput.value : 'Growth ($500/mo)';
        const clientName = nameInput ? nameInput.value.trim() : '';
        const clientLocation = locationInput ? locationInput.value : 'GCC Market';
        const clientPhone = phoneInput ? phoneInput.value.trim() : '';
        const clientEmail = emailInput ? emailInput.value.trim() : '';
        const clientDesc = descInput ? descInput.value.trim() : '';

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<span>PREPARING YOUR AGENCY BRIEF...</span>';
        submitBtn.disabled = true;

        // Build elegant WhatsApp message text
        const waMessageLines = [
          "⚡ *ABDO HOUSE — AGENCY ONBOARDING BRIEF*",
          "----------------------------------------",
          `💎 *Selected Package:* ${selectedPlan}`,
          `📍 *Target Market:* ${clientLocation}`,
          `👤 *Brand / Founder:* ${clientName || 'Private Brand'}`,
          `📱 *WhatsApp:* ${clientPhone || 'Provided'}`,
          `✉️ *Email:* ${clientEmail || 'Provided'}`,
          "----------------------------------------",
          `🎯 *Goals & Social Accounts:*`,
          clientDesc || "Ready to scale our social media presence across the GCC with ABDO HOUSE."
        ];

        const encodedMessage = encodeURIComponent(waMessageLines.join('\n'));
        const waUrl = `https://wa.me/201104689702?text=${encodedMessage}`;

        setTimeout(() => {
          form.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem;">
              <span class="label-subtle" style="margin-bottom:1.25rem;">REQUEST RECEIVED</span>
              <h3 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--text-primary); margin-bottom:0.75rem;">WE CREATE. YOU GROW.</h3>
              <p style="color:var(--text-secondary); max-width:460px; margin:0 auto 2rem; line-height:1.7; font-size:0.95rem;">
                Your agency onboarding brief for <strong>${selectedPlan}</strong> has been compiled. Click below to connect with our creative director on WhatsApp.
              </p>
              
              <div style="display:flex; flex-direction:column; gap:1rem; max-width:380px; margin:0 auto;">
                <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;">
                  <span>OPEN ON WHATSAPP &rarr;</span>
                </a>
                <button type="button" class="btn btn-ghost" onclick="document.querySelector('.inquiry-drawer-overlay').classList.remove('active'); document.body.style.overflow=''; document.documentElement.style.overflow='';">
                  <span>RETURN TO ABDO HOUSE</span>
                </button>
              </div>
            </div>
          `;

          // Automatically redirect to WhatsApp in a new tab
          window.open(waUrl, '_blank');
        }, 800);
      });
    }
  }

  initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');

    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        drawer.classList.toggle('active');
      });
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
