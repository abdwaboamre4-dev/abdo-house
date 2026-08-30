/**
 * ABDO HOUSE — Reusable Case Study Presentation Modal
 * Orchestrates full-screen project presentations with real media playback & canvas fallback.
 * Guarantees zero scroll-lock, seamless interaction, and robust viewport management.
 */

import { PROJECTS_DATA } from './projects-data.js';

export class CaseStudyModal {
  constructor(visualEngine) {
    this.visualEngine = visualEngine;
    this.modalEl = document.getElementById('case-study-modal') || document.querySelector('.case-study-modal');
    this.containerEl = document.querySelector('.case-study-container');
    this.currentProjectId = null;
    this.isOpen = false;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.modalEl) return;

    // Open project on card click from the portfolio grid
    document.addEventListener('click', (e) => {
      // If modal is already open, handle inside clicks separately
      if (this.isOpen) {
        // Next project click inside modal
        const nextBtn = e.target.closest('.cs-next-project');
        if (nextBtn && nextBtn.dataset.projectId) {
          e.preventDefault();
          this.switchProject(nextBtn.dataset.projectId);
          return;
        }

        // Close button click
        if (e.target.closest('.modal-close-btn') || e.target.closest('.modal-back-btn')) {
          e.preventDefault();
          this.close();
          return;
        }

        return;
      }

      // Main portfolio grid card click
      const card = e.target.closest('.project-card[data-project-id]');
      if (card && !e.target.closest('.inquiry-drawer-overlay') && !e.target.closest('.drawer-close')) {
        const projectId = card.dataset.projectId;
        this.open(projectId);
      }
    });

    // Keyboard navigation (Escape to close)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(projectId) {
    const project = PROJECTS_DATA.find(p => p.id === projectId) || PROJECTS_DATA[0];
    this.currentProjectId = project.id;
    this.isOpen = true;

    // Render content into container
    this.renderContent(project);

    // Show modal
    this.modalEl.classList.add('active');
    this.modalEl.setAttribute('aria-hidden', 'false');
    this.modalEl.scrollTop = 0;

    // Lock page scroll behind modal
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Register fallback visual canvas & trigger video playback
    setTimeout(() => {
      if (this.visualEngine) {
        this.visualEngine.registerProjectVisual(`modal-canvas-${project.id}`, project.visualType);
      }
      
      const modalVideo = document.getElementById(`modal-video-${project.id}`);
      if (modalVideo) {
        modalVideo.play().catch(() => {});
      }
    }, 40);
  }

  switchProject(nextProjectId) {
    const project = PROJECTS_DATA.find(p => p.id === nextProjectId);
    if (!project) return;

    // Pause current video
    const videos = this.modalEl.querySelectorAll('video');
    videos.forEach(v => v.pause());

    this.currentProjectId = project.id;
    this.renderContent(project);
    this.modalEl.scrollTop = 0;

    setTimeout(() => {
      if (this.visualEngine) {
        this.visualEngine.registerProjectVisual(`modal-canvas-${project.id}`, project.visualType);
      }
      const modalVideo = document.getElementById(`modal-video-${project.id}`);
      if (modalVideo) {
        modalVideo.play().catch(() => {});
      }
    }, 40);
  }

  close() {
    this.isOpen = false;

    // 1. Pause all videos inside modal
    const videos = this.modalEl.querySelectorAll('video');
    videos.forEach(v => v.pause());

    // 2. Hide modal immediately
    this.modalEl.classList.remove('active');
    this.modalEl.setAttribute('aria-hidden', 'true');

    // 3. Unconditionally restore page scrolling
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // 4. Remove any lingering transition overlays
    document.querySelectorAll('.transition-veil-overlay').forEach(el => el.remove());
  }

  renderContent(project) {
    const currentIndex = PROJECTS_DATA.findIndex(p => p.id === project.id);
    const nextProject = PROJECTS_DATA[(currentIndex + 1) % PROJECTS_DATA.length];
    const mediaSrc = project.image || project.posterSrc;
    const videoSrc = project.video || project.videoSrc;

    // Swatches HTML
    const swatchesHtml = project.palette.map(color => `
      <div class="palette-swatch">
        <div class="swatch-color" style="background-color: ${color.hex}; border: 1px solid rgba(242,239,232,0.18);"></div>
        <span class="swatch-label">${color.name} &bull; ${color.hex}</span>
      </div>
    `).join('');

    // Process Steps HTML
    const processHtml = project.process.map(step => `
      <div class="pipeline-step-card">
        <div class="step-num">${step.step} &mdash; PROCESS</div>
        <h4 class="step-title">${step.title}</h4>
        <p class="step-desc">${step.desc}</p>
      </div>
    `).join('');

    // Disciplines tags
    const disciplinesHtml = (project.disciplines || [project.category]).map(d => `
      <span class="service-tag" style="background:rgba(23,23,26,0.6);">${d}</span>
    `).join('');

    this.containerEl.innerHTML = `
      <div class="case-study-hero">
        <div class="cs-meta-top">
          <span class="label-number">${project.num} / 06</span>
          <span class="badge-concept">CONCEPT PROJECT</span>
          <span class="label-subtle">${project.category}</span>
        </div>
        <h1 class="cs-title">${project.title}</h1>
        <p class="cs-subtitle">${project.subtitle}</p>

        <!-- Big Cinematic Media Player Showcase -->
        <div class="cs-player-wrapper" style="position:relative; overflow:hidden; background:#0B0B0D;">
          <!-- Canvas Procedural Fallback Renderer -->
          <canvas id="modal-canvas-${project.id}" style="width:100%; height:100%; display:block;"></canvas>

          <!-- Real Image if Available -->
          ${mediaSrc ? `
            <img src="${mediaSrc}" 
                 alt="${project.title}"
                 style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:1;"
                 onload="this.style.display='block'; const c = document.getElementById('modal-canvas-${project.id}'); if(c) c.style.display='none';"
                 onerror="this.remove();">
          ` : ''}

          <!-- Real Video if Available with Native Controls -->
          ${videoSrc ? `
            <video id="modal-video-${project.id}"
                   src="${videoSrc}"
                   poster="${mediaSrc || ''}"
                   controls loop playsinline autoplay
                   style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:2;"
                   onloadeddata="this.style.display='block'; const c = document.getElementById('modal-canvas-${project.id}'); if(c) c.style.display='none'; this.play().catch(()=>{});"
                   onerror="this.remove();">
            </video>
          ` : ''}

          <div class="cs-player-controls" style="z-index:4; pointer-events:none;">
            <div class="cs-play-badge" style="pointer-events:auto;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#C9B27C"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>CINEMATIC MASTER FILM &bull; 4K 60FPS</span>
            </div>
            <a href="https://wa.me/201104689702" target="_blank" rel="noopener" class="badge-concept" style="background:rgba(11,11,13,0.9); text-decoration:none; cursor:pointer; pointer-events:auto;">
              ORDER SIMILAR FILM &mdash; $55 &rarr;
            </a>
          </div>
        </div>

        <!-- Metadata Bar -->
        <div class="cs-meta-grid">
          <div class="cs-meta-item">
            <h5>CLIENT / TYPE</h5>
            <p>${project.clientType}</p>
          </div>
          <div class="cs-meta-item">
            <h5>DISCIPLINE</h5>
            <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.35rem;">
              ${disciplinesHtml}
            </div>
          </div>
          <div class="cs-meta-item">
            <h5>DELIVERABLES</h5>
            <p>${project.deliverables}</p>
          </div>
          <div class="cs-meta-item">
            <h5>PRICE / COMMISSION</h5>
            <p style="color:var(--accent-gold); font-weight:500;">$55 / Finished Video</p>
          </div>
        </div>
      </div>

      <!-- Section: Concept -->
      <section class="cs-section">
        <div class="cs-section-header">
          <span class="label-subtle">01</span>
          <h2 class="cs-section-title">THE CONCEPT</h2>
        </div>
        <p class="cs-narrative">${project.concept}</p>
      </section>

      <!-- Section: Creative Direction -->
      <section class="cs-section">
        <div class="cs-section-header">
          <span class="label-subtle">02</span>
          <h2 class="cs-section-title">CREATIVE DIRECTION</h2>
        </div>
        <p class="cs-narrative">${project.creativeDirection}</p>
        <div class="cs-palette-row">
          ${swatchesHtml}
        </div>
      </section>

      <!-- Section: Production Process Pipeline -->
      <section class="cs-section">
        <div class="cs-section-header">
          <span class="label-subtle">03</span>
          <h2 class="cs-section-title">PRODUCTION PROCESS</h2>
        </div>
        <div class="cs-process-pipeline">
          ${processHtml}
        </div>
      </section>

      <!-- Next Project Link -->
      <div class="cs-next-project" data-project-id="${nextProject.id}" role="button" tabindex="0" style="cursor:pointer;">
        <div>
          <div class="next-label">NEXT SELECTED WORK &mdash; ${nextProject.num} / 06</div>
          <div class="next-title">${nextProject.title}</div>
        </div>
        <div class="next-arrow">&rarr;</div>
      </div>
    `;
  }
}
