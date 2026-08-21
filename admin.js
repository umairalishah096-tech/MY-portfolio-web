/* ================================================================
   ADMIN PANEL — admin.js
   Portfolio CMS Logic: Auth + CRUD for Projects, Skills,
   Services, Journey, About — all stored in localStorage
================================================================ */

'use strict';

/* ── CONSTANTS ───────────────────────────────── */
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const SESSION_KEY = 'portfolio_admin_session';

/* ── STORAGE KEYS ────────────────────────────── */
const KEYS = {
  projects: 'portfolio_projects',
  skills:   'portfolio_skills',
  services: 'portfolio_services',
  journey:  'portfolio_journey',
  about:    'portfolio_about',
};

/* ── DEFAULT DATA (mirrors existing portfolio) ─ */
const DEFAULTS = {
  projects: [
    { id: uid(), title: 'Watan Tobacco ERP', label: 'Full Stack ERP System', desc: 'A production-grade Enterprise Resource Planning system built for a tobacco distribution company in Pakistan. Features real-time inventory management, sales tracking, supplier relations, financial reporting, and role-based access control.', github: 'https://github.com/umairalishah/watan-tobacco-erp', demo: '', tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT Auth', 'Power BI'], featured: true, status: 'completed' },
    { id: uid(), title: 'Luxury Hotel & Resort Landing Page', label: 'Frontend Development', desc: 'A cinematic, conversion-focused landing page for a luxury hotel brand. Built with custom CSS animations, parallax scrolling, and a fully responsive layout.', github: 'https://github.com/umairalishah/hotel-resort', demo: 'https://umairalishah.github.io/hotel-resort', tags: ['HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Responsive'], featured: true, status: 'completed' },
    { id: uid(), title: 'Habit Tracker App', label: 'Full Stack', desc: 'A full-stack habit tracking application with streak counters, analytics dashboard, and weekly progress reports. Data persisted in MongoDB with JWT authentication.', github: 'https://github.com/umairalishah/habit-tracker', demo: '', tags: ['React', 'Node.js', 'MongoDB'], featured: false, status: 'completed' },
    { id: uid(), title: 'Power BI Dashboards', label: 'Data Analytics', desc: 'Business intelligence dashboards for sales performance, inventory analysis, and KPI monitoring. Built with DAX measures, drill-through reports, and dynamic filtering.', github: 'https://github.com/umairalishah/powerbi-dashboards', demo: '', tags: ['Power BI', 'DAX', 'SQL', 'Excel'], featured: false, status: 'completed' },
    { id: uid(), title: 'Shop Management System', label: 'Vanilla JS', desc: 'A complete browser-based shop management system with inventory tracking, sales recording, expense management, and profit/loss reporting. Pure vanilla JS, zero dependencies.', github: 'https://github.com/umairalishah/shop-management', demo: '', tags: ['HTML', 'CSS', 'JavaScript'], featured: false, status: 'completed' },
  ],
  skills: [
    { id: uid(), name: 'HTML5',        percent: 95, category: 'frontend', icon: 'devicon-html5-plain' },
    { id: uid(), name: 'CSS3',         percent: 92, category: 'frontend', icon: 'devicon-css3-plain' },
    { id: uid(), name: 'JavaScript',   percent: 88, category: 'frontend', icon: 'devicon-javascript-plain' },
    { id: uid(), name: 'React.js',     percent: 85, category: 'frontend', icon: 'devicon-react-original' },
    { id: uid(), name: 'Tailwind CSS', percent: 90, category: 'frontend', icon: 'devicon-tailwindcss-plain' },
    { id: uid(), name: 'Bootstrap',    percent: 88, category: 'frontend', icon: 'devicon-bootstrap-plain' },
    { id: uid(), name: 'Node.js',      percent: 82, category: 'backend',  icon: 'devicon-nodejs-plain' },
    { id: uid(), name: 'Express.js',   percent: 80, category: 'backend',  icon: 'devicon-express-original' },
    { id: uid(), name: 'MongoDB',      percent: 80, category: 'backend',  icon: 'devicon-mongodb-plain' },
    { id: uid(), name: 'MySQL',        percent: 75, category: 'backend',  icon: 'devicon-mysql-plain' },
    { id: uid(), name: 'Git & GitHub', percent: 85, category: 'tools',    icon: 'devicon-git-plain' },
    { id: uid(), name: 'Figma',        percent: 78, category: 'tools',    icon: 'devicon-figma-plain' },
    { id: uid(), name: 'Power BI',     percent: 83, category: 'tools',    icon: '' },
    { id: uid(), name: 'WordPress',    percent: 80, category: 'tools',    icon: 'devicon-wordpress-plain' },
  ],
  services: [
    { id: uid(), title: 'Full Stack Web Development', desc: 'End-to-end web applications with React frontends, Node/Express backends, and MongoDB databases. From MVP to production-ready product.', features: ['React SPA & SSR apps', 'RESTful API design', 'Authentication & Security', 'Database architecture'] },
    { id: uid(), title: 'UI/UX Design & Prototyping', desc: 'Human-centered interfaces that convert visitors into customers. Figma prototypes, design systems, and pixel-perfect HTML/CSS implementation.', features: ['Figma wireframes & prototypes', 'Design system creation', 'Responsive implementation', 'Micro-interaction design'] },
    { id: uid(), title: 'Power BI Dashboards & Analytics', desc: 'Turn raw business data into actionable intelligence. Custom Power BI reports, KPI dashboards, and automated data pipelines for decision-makers.', features: ['DAX measures & calculations', 'Interactive dashboards', 'Drill-through reports', 'Automated data refresh'] },
    { id: uid(), title: 'ERP & Business Software', desc: 'Custom enterprise resource planning systems tailored to your business workflow. Inventory, HR, finance, and reporting modules built for scale.', features: ['Inventory management', 'Role-based access control', 'Financial reporting', 'Multi-user workflows'] },
    { id: uid(), title: 'Database Design & APIs', desc: 'Well-structured REST APIs with proper authentication, rate limiting, and documentation. MongoDB schema design and SQL query optimization.', features: ['REST API architecture', 'JWT & OAuth 2.0', 'MongoDB & MySQL design', 'API documentation'] },
    { id: uid(), title: 'WordPress Websites', desc: 'Professional WordPress sites for businesses and freelancers. Custom theme development, plugin integration, WooCommerce, and ongoing maintenance.', features: ['Custom theme development', 'WooCommerce stores', 'SEO optimization', 'Performance tuning'] },
  ],
  journey: [
    { id: uid(), year: '2021', title: 'The Beginning', desc: 'Started BS Computer Science at university in Swabi. Discovered programming through HTML & CSS — built my first webpage and never looked back. Spent every evening self-teaching JavaScript fundamentals through online resources.', tags: ['HTML', 'CSS', 'JavaScript'], side: 'left' },
    { id: uid(), year: '2022', title: 'Going Full Stack', desc: 'Dove deep into the MERN stack. Learned React, built component-based UIs, connected them to Node/Express APIs, and stored data in MongoDB. Completed first real-world projects for local clients.', tags: ['React', 'Node.js', 'MongoDB', 'Express'], side: 'right' },
    { id: uid(), year: '2023', title: 'Data & Design Pivot', desc: 'Expanded into data analytics — mastered Power BI, DAX, and SQL. Started taking WordPress freelance projects, delivering 3+ websites to small businesses. Discovered UI/UX design through Figma.', tags: ['Power BI', 'SQL', 'Figma', 'WordPress'], side: 'left' },
    { id: uid(), year: '2024', title: 'Watan Tobacco ERP — Shipped', desc: 'Designed and developed a complete production ERP system for a tobacco distribution company. This was the project that proved I could ship enterprise software: role-based access, real-time inventory, financial modules, and integrated Power BI reporting.', tags: ['MERN Stack', 'JWT Auth', 'Power BI', 'ERP'], side: 'right' },
    { id: uid(), year: '2025', title: 'Leveling Up for the World', desc: 'Sharpening MERN architecture skills, learning Azure AI services, and exploring AWS cloud deployment. Built this portfolio as a statement: international-quality work, ready for remote teams and global clients.', tags: ['AWS', 'Azure AI', 'GSAP', 'Three.js'], side: 'left' },
    { id: uid(), year: 'NOW', title: 'Open & Available', desc: 'Ready for remote work, freelance contracts, international internships, and full-time opportunities. Looking for teams that move fast, build great products, and care about quality.', tags: [], side: 'right' },
  ],
  about: {
    name: 'Umair Ali Shah', tagline: 'Full Stack MERN Developer',
    bio1: "I'm Umair Ali Shah — a BS Computer Science graduate from Swabi, Pakistan, driven by the intersection of clean code, thoughtful design, and business impact. I specialize in the MERN stack, building full-stack applications that don't just work — they convert, scale, and impress.",
    bio2: "Beyond development, I work with data. As a Power BI Analyst, I transform raw business data into visual narratives that help organizations make smarter decisions. I believe a great developer isn't just technical — they understand the business problem.",
    location: 'Swabi, Khyber Pakhtunkhwa, Pakistan',
    email: 'umairalishah096@gmail.com',
    whatsapp: '+92 344 1193348',
    github: 'https://github.com/umairalishah096-tech/umairalishah096-tech',
    linkedin: 'https://www.linkedin.com/in/umair-ali-shah-b10a74240/',
    availability: 'available',
    stats: { projects: 12, years: 3, concepts: 2, satisfaction: 100 },
  },
};

/* ── UTILITIES ───────────────────────── */
function uid() { return '_' + Math.random().toString(36).slice(2, 11); }

function getData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function initData(key, def) {
  if (!getData(key)) saveData(key, def);
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' toast--error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

function openModal(id)  { document.getElementById(id).hidden = false; }
function closeModal(id) { document.getElementById(id).hidden = true; }

function escHTML(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Seed defaults if first visit
  Object.keys(DEFAULTS).forEach(k => initData(KEYS[k], DEFAULTS[k]));

  checkSession();
  initLogin();
  initLogout();
  initNav();
  initSidebarToggle();
  initModals();
  initProjects();
  initSkills();
  initServices();
  initJourney();
  initAbout();
});

/* ════════════════════════════════════════
   AUTH
════════════════════════════════════════ */
function checkSession() {
  if (sessionStorage.getItem(SESSION_KEY) === '1') showAdmin();
}

function showAdmin() {
  document.getElementById('loginOverlay').hidden = true;
  document.getElementById('adminLayout').hidden = false;
  renderAll();
}

function initLogin() {
  const form  = document.getElementById('loginForm');
  const err   = document.getElementById('loginError');
  const toggle = document.getElementById('passToggle');
  const passInput = document.getElementById('loginPass');

  toggle.addEventListener('click', () => {
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, '1');
      err.hidden = true;
      showAdmin();
    } else {
      err.hidden = false;
    }
  });
}

function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById('loginOverlay').hidden = false;
    document.getElementById('adminLayout').hidden = true;
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
  });
}

/* ════════════════════════════════════════
   NAV / SECTIONS
════════════════════════════════════════ */
function initNav() {
  const links = document.querySelectorAll('.sidebar__link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const sec = link.dataset.section;
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + sec).classList.add('active');
      document.getElementById('topbarTitle').textContent = link.textContent.trim();
      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function initSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sb  = document.getElementById('sidebar');
  btn.addEventListener('click', () => sb.classList.toggle('open'));
}

/* ════════════════════════════════════════
   MODAL INFRASTRUCTURE
════════════════════════════════════════ */
function initModals() {
  // Close buttons with data-close attr
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  // Click outside modal box
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not([hidden])').forEach(m => closeModal(m.id));
    }
  });
}

/* ════════════════════════════════════════
   RENDER ALL (after login / edits)
════════════════════════════════════════ */
function renderAll() {
  renderProjects();
  renderSkills();
  renderServices();
  renderJourney();
  loadAboutForm();
}

/* ════════════════════════════════════════
   PROJECTS CRUD
════════════════════════════════════════ */
function initProjects() {
  document.getElementById('addProjectBtn').addEventListener('click', () => {
    openProjectModal();
  });
  document.getElementById('projectForm').addEventListener('submit', saveProject);
}

function renderProjects() {
  const list = document.getElementById('projectsList');
  const data = getData(KEYS.projects) || [];
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><p>No projects yet. Click "+ Add Project" to get started.</p></div>';
    return;
  }
  list.innerHTML = data.map(p => `
    <div class="item-card" data-id="${escHTML(p.id)}">
      <div class="item-card__info">
        <div class="item-card__title">${escHTML(p.title)}</div>
        <div class="item-card__meta">${escHTML(p.label || '')} &bull; ${(p.tags || []).slice(0,3).map(escHTML).join(', ')}</div>
      </div>
      ${p.featured ? '<span class="item-card__badge badge--featured">Featured</span>' : ''}
      <span class="item-card__badge badge--${escHTML(p.status || 'completed')}">${escHTML(p.status || 'completed')}</span>
      <div class="item-card__actions">
        <button class="btn-icon" onclick="openProjectModal('${escHTML(p.id)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn-icon btn-icon--danger" onclick="deleteItem('projects','${escHTML(p.id)}','${escHTML(p.title)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Delete
        </button>
      </div>
    </div>`).join('');
}

function openProjectModal(id) {
  const form = document.getElementById('projectForm');
  form.reset();
  document.getElementById('projectId').value = '';
  document.getElementById('projectModalTitle').textContent = 'Add Project';

  if (id) {
    const data = getData(KEYS.projects) || [];
    const p = data.find(x => x.id === id);
    if (!p) return;
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectId').value = p.id;
    document.getElementById('pTitle').value   = p.title   || '';
    document.getElementById('pLabel').value   = p.label   || '';
    document.getElementById('pDesc').value    = p.desc    || '';
    document.getElementById('pGithub').value  = p.github  || '';
    document.getElementById('pDemo').value    = p.demo    || '';
    document.getElementById('pTags').value    = (p.tags || []).join(', ');
    document.getElementById('pFeatured').value = String(p.featured || false);
    document.getElementById('pStatus').value   = p.status || 'completed';
  }
  openModal('projectModal');
}

function saveProject(e) {
  e.preventDefault();
  const id    = document.getElementById('projectId').value;
  const entry = {
    id:       id || uid(),
    title:    document.getElementById('pTitle').value.trim(),
    label:    document.getElementById('pLabel').value.trim(),
    desc:     document.getElementById('pDesc').value.trim(),
    github:   document.getElementById('pGithub').value.trim(),
    demo:     document.getElementById('pDemo').value.trim(),
    tags:     document.getElementById('pTags').value.split(',').map(t => t.trim()).filter(Boolean),
    featured: document.getElementById('pFeatured').value === 'true',
    status:   document.getElementById('pStatus').value,
  };
  if (!entry.title) return;
  let data = getData(KEYS.projects) || [];
  if (id) { data = data.map(x => x.id === id ? entry : x); }
  else    { data.push(entry); }
  saveData(KEYS.projects, data);
  closeModal('projectModal');
  renderProjects();
  showToast(id ? 'Project updated!' : 'Project added!');
}

/* ════════════════════════════════════════
   SKILLS CRUD
════════════════════════════════════════ */
function initSkills() {
  document.getElementById('addSkillBtn').addEventListener('click', () => openSkillModal());
  document.getElementById('skillForm').addEventListener('submit', saveSkill);
}

function renderSkills() {
  const list = document.getElementById('skillsList');
  const data = getData(KEYS.skills) || [];
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><p>No skills yet.</p></div>';
    return;
  }
  list.innerHTML = data.map(s => `
    <div class="item-card" data-id="${escHTML(s.id)}">
      ${s.icon ? `<div style="font-size:1.4rem;flex-shrink:0;"><i class="${escHTML(s.icon)}"></i></div>` : ''}
      <div class="item-card__info">
        <div class="item-card__title">${escHTML(s.name)}</div>
        <div class="item-card__meta">${escHTML(s.category)}</div>
      </div>
      <div class="skill-bar-mini"><div class="skill-bar-mini__fill" style="width:${escHTML(s.percent)}%"></div></div>
      <span class="item-card__badge badge--${escHTML(s.category)}">${escHTML(s.percent)}%</span>
      <div class="item-card__actions">
        <button class="btn-icon" onclick="openSkillModal('${escHTML(s.id)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn-icon btn-icon--danger" onclick="deleteItem('skills','${escHTML(s.id)}','${escHTML(s.name)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Delete
        </button>
      </div>
    </div>`).join('');
}

function openSkillModal(id) {
  const form = document.getElementById('skillForm');
  form.reset();
  document.getElementById('skillId').value = '';
  document.getElementById('skillModalTitle').textContent = 'Add Skill';

  if (id) {
    const s = (getData(KEYS.skills) || []).find(x => x.id === id);
    if (!s) return;
    document.getElementById('skillModalTitle').textContent = 'Edit Skill';
    document.getElementById('skillId').value    = s.id;
    document.getElementById('sName').value      = s.name     || '';
    document.getElementById('sPercent').value   = s.percent  || '';
    document.getElementById('sCategory').value  = s.category || 'frontend';
    document.getElementById('sIcon').value      = s.icon     || '';
  }
  openModal('skillModal');
}

function saveSkill(e) {
  e.preventDefault();
  const id = document.getElementById('skillId').value;
  const entry = {
    id:       id || uid(),
    name:     document.getElementById('sName').value.trim(),
    percent:  parseInt(document.getElementById('sPercent').value) || 80,
    category: document.getElementById('sCategory').value,
    icon:     document.getElementById('sIcon').value.trim(),
  };
  if (!entry.name) return;
  let data = getData(KEYS.skills) || [];
  if (id) { data = data.map(x => x.id === id ? entry : x); }
  else    { data.push(entry); }
  saveData(KEYS.skills, data);
  closeModal('skillModal');
  renderSkills();
  showToast(id ? 'Skill updated!' : 'Skill added!');
}

/* ════════════════════════════════════════
   SERVICES CRUD
════════════════════════════════════════ */
function initServices() {
  document.getElementById('addServiceBtn').addEventListener('click', () => openServiceModal());
  document.getElementById('serviceForm').addEventListener('submit', saveService);
}

function renderServices() {
  const list = document.getElementById('servicesList');
  const data = getData(KEYS.services) || [];
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><p>No services yet.</p></div>';
    return;
  }
  list.innerHTML = data.map(s => `
    <div class="item-card" data-id="${escHTML(s.id)}">
      <div class="item-card__info">
        <div class="item-card__title">${escHTML(s.title)}</div>
        <div class="item-card__meta">${escHTML((s.features || []).slice(0,2).join(' · '))}</div>
      </div>
      <div class="item-card__actions">
        <button class="btn-icon" onclick="openServiceModal('${escHTML(s.id)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn-icon btn-icon--danger" onclick="deleteItem('services','${escHTML(s.id)}','${escHTML(s.title)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Delete
        </button>
      </div>
    </div>`).join('');
}

function openServiceModal(id) {
  const form = document.getElementById('serviceForm');
  form.reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('serviceModalTitle').textContent = 'Add Service';

  if (id) {
    const s = (getData(KEYS.services) || []).find(x => x.id === id);
    if (!s) return;
    document.getElementById('serviceModalTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value  = s.id;
    document.getElementById('svTitle').value    = s.title || '';
    document.getElementById('svDesc').value     = s.desc  || '';
    document.getElementById('svFeatures').value = (s.features || []).join('\n');
  }
  openModal('serviceModal');
}

function saveService(e) {
  e.preventDefault();
  const id = document.getElementById('serviceId').value;
  const entry = {
    id:       id || uid(),
    title:    document.getElementById('svTitle').value.trim(),
    desc:     document.getElementById('svDesc').value.trim(),
    features: document.getElementById('svFeatures').value.split('\n').map(f => f.trim()).filter(Boolean),
  };
  if (!entry.title) return;
  let data = getData(KEYS.services) || [];
  if (id) { data = data.map(x => x.id === id ? entry : x); }
  else    { data.push(entry); }
  saveData(KEYS.services, data);
  closeModal('serviceModal');
  renderServices();
  showToast(id ? 'Service updated!' : 'Service added!');
}

/* ════════════════════════════════════════
   JOURNEY CRUD
════════════════════════════════════════ */
function initJourney() {
  document.getElementById('addJourneyBtn').addEventListener('click', () => openJourneyModal());
  document.getElementById('journeyForm').addEventListener('submit', saveJourney);
}

function renderJourney() {
  const list = document.getElementById('journeyList');
  const data = getData(KEYS.journey) || [];
  if (!data.length) {
    list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg><p>No journey events yet.</p></div>';
    return;
  }
  list.innerHTML = data.map(j => `
    <div class="item-card" data-id="${escHTML(j.id)}">
      <div class="item-card__info">
        <div class="item-card__title">${escHTML(j.year)} — ${escHTML(j.title)}</div>
        <div class="item-card__meta">${escHTML(j.desc.substring(0,80))}${j.desc.length > 80 ? '...' : ''}</div>
      </div>
      <span class="item-card__badge badge--${escHTML(j.side === 'right' ? 'backend' : 'frontend')}">${escHTML(j.side)}</span>
      <div class="item-card__actions">
        <button class="btn-icon" onclick="openJourneyModal('${escHTML(j.id)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="btn-icon btn-icon--danger" onclick="deleteItem('journey','${escHTML(j.id)}','${escHTML(j.year + ' - ' + j.title)}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Delete
        </button>
      </div>
    </div>`).join('');
}

function openJourneyModal(id) {
  const form = document.getElementById('journeyForm');
  form.reset();
  document.getElementById('journeyId').value = '';
  document.getElementById('journeyModalTitle').textContent = 'Add Journey Event';

  if (id) {
    const j = (getData(KEYS.journey) || []).find(x => x.id === id);
    if (!j) return;
    document.getElementById('journeyModalTitle').textContent = 'Edit Journey Event';
    document.getElementById('journeyId').value = j.id;
    document.getElementById('jYear').value     = j.year  || '';
    document.getElementById('jTitle').value    = j.title || '';
    document.getElementById('jDesc').value     = j.desc  || '';
    document.getElementById('jTags').value     = (j.tags || []).join(', ');
    document.getElementById('jSide').value     = j.side  || 'left';
  }
  openModal('journeyModal');
}

function saveJourney(e) {
  e.preventDefault();
  const id = document.getElementById('journeyId').value;
  const entry = {
    id:    id || uid(),
    year:  document.getElementById('jYear').value.trim(),
    title: document.getElementById('jTitle').value.trim(),
    desc:  document.getElementById('jDesc').value.trim(),
    tags:  document.getElementById('jTags').value.split(',').map(t => t.trim()).filter(Boolean),
    side:  document.getElementById('jSide').value,
  };
  if (!entry.year || !entry.title) return;
  let data = getData(KEYS.journey) || [];
  if (id) { data = data.map(x => x.id === id ? entry : x); }
  else    { data.push(entry); }
  saveData(KEYS.journey, data);
  closeModal('journeyModal');
  renderJourney();
  showToast(id ? 'Event updated!' : 'Event added!');
}

/* ════════════════════════════════════════
   ABOUT (single object — no list)
════════════════════════════════════════ */
function initAbout() {
  document.getElementById('aboutForm').addEventListener('submit', saveAbout);
}

function loadAboutForm() {
  const a = getData(KEYS.about) || DEFAULTS.about;
  document.getElementById('aName').value        = a.name         || '';
  document.getElementById('aTagline').value     = a.tagline      || '';
  document.getElementById('aBio1').value        = a.bio1         || '';
  document.getElementById('aBio2').value        = a.bio2         || '';
  document.getElementById('aLocation').value    = a.location     || '';
  document.getElementById('aEmail').value       = a.email        || '';
  document.getElementById('aWhatsapp').value    = a.whatsapp     || '';
  document.getElementById('aGithub').value      = a.github       || '';
  document.getElementById('aLinkedin').value    = a.linkedin     || '';
  document.getElementById('aAvailability').value= a.availability || 'available';
  const st = a.stats || {};
  document.getElementById('aStat1').value = st.projects    || '';
  document.getElementById('aStat2').value = st.years       || '';
  document.getElementById('aStat3').value = st.concepts    || '';
  document.getElementById('aStat4').value = st.satisfaction|| '';
}

function saveAbout(e) {
  e.preventDefault();
  const entry = {
    name:         document.getElementById('aName').value.trim(),
    tagline:      document.getElementById('aTagline').value.trim(),
    bio1:         document.getElementById('aBio1').value.trim(),
    bio2:         document.getElementById('aBio2').value.trim(),
    location:     document.getElementById('aLocation').value.trim(),
    email:        document.getElementById('aEmail').value.trim(),
    whatsapp:     document.getElementById('aWhatsapp').value.trim(),
    github:       document.getElementById('aGithub').value.trim(),
    linkedin:     document.getElementById('aLinkedin').value.trim(),
    availability: document.getElementById('aAvailability').value,
    stats: {
      projects:     parseInt(document.getElementById('aStat1').value) || 0,
      years:        parseInt(document.getElementById('aStat2').value) || 0,
      concepts:     parseInt(document.getElementById('aStat3').value) || 0,
      satisfaction: parseInt(document.getElementById('aStat4').value) || 0,
    },
  };
  saveData(KEYS.about, entry);
  showToast('About info saved!');
}

/* ════════════════════════════════════════
   DELETE (shared)
════════════════════════════════════════ */
let _pendingDelete = null;

function deleteItem(type, id, label) {
  _pendingDelete = { type, id };
  document.getElementById('deleteMsg').textContent =
    `Delete "${label}"? This action cannot be undone.`;
  openModal('deleteModal');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (!_pendingDelete) return;
    const { type, id } = _pendingDelete;
    let data = getData(KEYS[type]) || [];
    data = data.filter(x => x.id !== id);
    saveData(KEYS[type], data);
    closeModal('deleteModal');
    _pendingDelete = null;

    const renders = { projects: renderProjects, skills: renderSkills, services: renderServices, journey: renderJourney };
    if (renders[type]) renders[type]();
    showToast('Item deleted.', 'error');
  });
});
