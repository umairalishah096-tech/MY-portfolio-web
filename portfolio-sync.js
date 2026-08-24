/* ================================================================
   PORTFOLIO SYNC - portfolio-sync.js
   Renders ALL projects into the grid.
   Uses localStorage data if available, otherwise uses defaults.
   This ensures projects always show even on first load.
================================================================ */
(function () {
  'use strict';

  // ── DEFAULT PROJECTS (shown when localStorage is empty) ──────────
  var DEFAULTS = [
    {
      title: 'Watan Tobacco ERP',
      desc: 'A production-grade Enterprise Resource Planning system built for a tobacco distribution company in Pakistan. Features real-time inventory management, sales tracking, supplier relations, financial reporting, and role-based access control.',
      github: 'https://github.com/umairalishah/watan-tobacco-erp',
      demo: '',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT Auth', 'Power BI'],
      featured: true
    },
    {
      title: 'Luxury Hotel & Resort',
      desc: 'A cinematic, conversion-focused landing page for a luxury hotel brand. Built with custom CSS animations, parallax scrolling, and a fully responsive layout. Features room showcase, amenities grid, and booking inquiry form.',
      github: 'https://github.com/umairalishah/hotel-resort',
      demo: 'https://hotel-resort-project-nu.vercel.app/',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Responsive'],
      featured: true
    },
    {
      title: 'Habit Tracker App',
      desc: 'A full-stack habit tracking application with streak counters, analytics dashboard, and weekly progress reports. Data persisted in MongoDB with JWT authentication.',
      github: 'https://github.com/umairalishah096-tech/Habit-tracker',
      demo: '',
      tags: ['React', 'Node.js', 'MongoDB'],
      featured: false
    },
    {
      title: 'Power BI Dashboards',
      desc: 'Business intelligence dashboards for sales performance, inventory analysis, and KPI monitoring. Built with DAX measures, drill-through reports, and dynamic filtering.',
      github: 'https://github.com/umairalishah/powerbi-dashboards',
      demo: '',
      tags: ['Power BI', 'DAX', 'SQL', 'Excel'],
      featured: false
    },
    {
      title: 'Shop Management System',
      desc: 'A complete browser-based shop management system with inventory tracking, sales recording, expense management, and profit/loss reporting. Pure vanilla JS, zero dependencies.',
      github: 'https://github.com/umairalishah/shop-management',
      demo: '',
      tags: ['HTML', 'CSS', 'JavaScript'],
      featured: false
    }
  ];

  // ── ICONS ─────────────────────────────────────────────────────────
  var GITHUB_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';
  var EXT_ICON   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  var FOLDER_ICON = '<svg class="project-card__folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getProjects() {
    try {
      var stored = localStorage.getItem('portfolio_projects');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return DEFAULTS;
  }

  function buildCard(p) {
    var tags = (p.tags || []).map(function(t){ return '<span class="tag">' + esc(t) + '</span>'; }).join('');

    var githubBtn = p.github
      ? '<a href="' + esc(p.github) + '" target="_blank" rel="noopener noreferrer" class="btn btn--ghost btn--sm" style="display:inline-flex;align-items:center;gap:6px;" aria-label="' + esc(p.title) + ' GitHub">' + GITHUB_ICON + ' GitHub</a>'
      : '';

    var demoBtn = p.demo
      ? '<a href="' + esc(p.demo) + '" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm" style="display:inline-flex;align-items:center;gap:6px;" aria-label="' + esc(p.title) + ' Live Demo">Live Demo ' + EXT_ICON + '</a>'
      : '';

    var badge = p.featured
      ? '<span class="project-card__featured-badge">&#11088; Featured</span>'
      : '';

    return '<article class="project-card" aria-label="' + esc(p.title) + ' project">'
      + '<div class="project-card__inner">'
      + '<div class="project-card__header">' + FOLDER_ICON + '<div class="project-card__links"></div></div>'
      + badge
      + '<h3 class="project-card__title">' + esc(p.title) + '</h3>'
      + '<p class="project-card__desc">' + esc(p.desc) + '</p>'
      + '<div class="project__tags">' + tags + '</div>'
      + '<div class="project-card__actions">' + githubBtn + demoBtn + '</div>'
      + '</div>'
      + '</article>';
  }

  function renderProjects() {
    var grid = document.querySelector('.projects__grid');
    if (!grid) return;

    var projects = getProjects();

    // Featured first, then others
    var featured    = projects.filter(function(p){ return p.featured; });
    var notFeatured = projects.filter(function(p){ return !p.featured; });
    var sorted = featured.concat(notFeatured);

    grid.innerHTML = sorted.map(buildCard).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderProjects);
  } else {
    renderProjects();
  }

})();
