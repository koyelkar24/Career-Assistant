import { icon } from './icons.js';
import {
  renderGuidance,
  renderInterview,
  renderJobs,
  renderOverview,
  renderProfile,
  renderResumeAnalyzer,
  renderResumeBuilder,
  renderRoadmap,
  renderSettings,
  renderSkills,
  renderTracker,
} from './pages.js';
import {
  NAV_ITEMS,
  api,
  clearAuthUser,
  createStore,
  escapeHTML,
  getGreeting,
  getInitials,
  saveAuthUser,
  saveJSON,
} from './state.js';

const store = createStore();
let toastTimer = null;
let authMode = 'signin';
let showPassword = false;
let activeModalClose = null;

const el = id => document.getElementById(id);

function notify(message) {
  const toastEl = el('toast');
  const iconSlot = el('toast-icon');
  const textSlot = el('toast-text');
  if (!toastEl || !textSlot) return;
  if (iconSlot) iconSlot.innerHTML = icon('check-circle-2', 17);
  textSlot.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3200);
}

function openModal({ title, bodyHTML, wide = false, onMount }) {
  closeModal();
  const root = el('modal-root');
  if (!root) return;

  const close = () => closeModal();
  activeModalClose = close;

  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog${wide ? ' modal-wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
        <div class="modal-head">
          <h3>${escapeHTML(title)}</h3>
          <button type="button" class="icon-btn" id="modal-close-x" aria-label="Close dialog">${icon('x', 18)}</button>
        </div>
        <div id="modal-body">${bodyHTML}</div>
      </div>
    </div>
  `;

  root.querySelector('#modal-close-x')?.addEventListener('click', close);
  root.querySelector('#modal-backdrop')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) close();
  });

  if (typeof onMount === 'function') {
    onMount(root.querySelector('.modal-dialog'), close);
  }
}

function closeModal() {
  const root = el('modal-root');
  if (root) root.innerHTML = '';
  activeModalClose = null;
}

function updateNavCounts() {
  const badge = el('nav-job-count');
  if (badge) badge.textContent = String(store.jobs.length);
}

function syncChrome() {
  const initials = getInitials(store.profile.name);
  const sAvatar = el('sidebar-avatar');
  const sName = el('sidebar-name');
  const sRole = el('sidebar-role');
  const tAvatar = el('top-avatar');
  const tName = el('top-name');

  if (sAvatar) sAvatar.textContent = initials;
  if (sName) sName.textContent = store.profile.name;
  if (sRole) sRole.textContent = store.profile.role;
  if (tAvatar) tAvatar.textContent = initials;
  if (tName) tName.textContent = store.profile.name;

  const landingGreeting = el('landing-greeting');
  if (landingGreeting) landingGreeting.textContent = `${getGreeting()}, Alex ✳`;
  const landingAvatar = el('landing-quote-avatar');
  if (landingAvatar) landingAvatar.textContent = initials;
  const landingBtn = el('landing-open-btn');
  if (landingBtn) landingBtn.textContent = store.authUser ? 'Open workspace' : 'Sign in';

  const footerStatus = el('footer-ai-status');
  if (footerStatus) {
    footerStatus.innerHTML = `<span class="online-dot"></span> ${store.aiEnabled ? 'AI coach connected' : 'Local workspace active'}`;
  }
  updateNavCounts();
}

function setMobileNav(open) {
  el('sidebar')?.classList.toggle('open', open);
  const scrim = el('mobile-scrim');
  if (scrim) scrim.hidden = !open;
}

function buildSidebarNav() {
  const navEl = el('side-nav');
  if (!navEl) return;
  navEl.innerHTML = NAV_ITEMS.map((item, idx) => {
    const section = item.section ? `<div class="nav-section${idx > 0 ? ' spaced' : ''}">${item.section}</div>` : '';
    const count = item.label === 'Job Recommendations' ? `<i class="nav-count" id="nav-job-count">${store.jobs.length}</i>` : '';
    return `
      ${section}
      <button type="button" class="nav-item${store.page === item.label ? ' selected' : ''}" data-nav-page="${item.label}">
        ${icon(item.icon, 17, { strokeWidth: 1.85 })}
        <span>${escapeHTML(item.label)}</span>
        ${count}
      </button>
    `;
  }).join('');

  navEl.querySelectorAll('[data-nav-page]').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.navPage));
  });
}

function renderActivePage() {
  const pageWrap = el('page-wrap');
  if (!pageWrap) return;

  const ctx = {
    store,
    go,
    notify,
    openModal,
    closeModal,
    syncChrome,
    renderActivePage,
    updateNavCounts,
    signOut: handleSignOut,
    getInitials: () => getInitials(store.profile.name),
  };

  switch (store.page) {
    case 'Overview':
      renderOverview(pageWrap, ctx);
      break;
    case 'AI Career Guidance':
      renderGuidance(pageWrap, ctx);
      break;
    case 'Resume Builder':
      renderResumeBuilder(pageWrap, ctx);
      break;
    case 'Resume Analyzer':
      renderResumeAnalyzer(pageWrap, ctx);
      break;
    case 'Job Recommendations':
      renderJobs(pageWrap, ctx);
      break;
    case 'Skill Gap Analysis':
      renderSkills(pageWrap, ctx);
      break;
    case 'Interview Preparation':
      renderInterview(pageWrap, ctx);
      break;
    case 'Learning Roadmap':
      renderRoadmap(pageWrap, ctx);
      break;
    case 'Application Tracker':
      renderTracker(pageWrap, ctx);
      break;
    case 'Profile':
      renderProfile(pageWrap, ctx);
      break;
    default:
      renderSettings(pageWrap, ctx);
  }
}

function go(name) {
  const target = !store.authUser && name !== 'Landing' ? 'Login' : name;
  store.page = target;
  setMobileNav(false);

  const loginView = el('view-login');
  const landingView = el('view-landing');
  const appShell = el('app-shell');

  if (target === 'Landing') {
    if (loginView) loginView.hidden = true;
    if (landingView) landingView.hidden = false;
    if (appShell) appShell.hidden = true;
    if (location.hash !== '#landing') history.replaceState(null, '', '#landing');
    syncChrome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!store.authUser || target === 'Login') {
    if (loginView) loginView.hidden = false;
    if (landingView) landingView.hidden = true;
    if (appShell) appShell.hidden = true;
    if (location.hash !== '#login') history.replaceState(null, '', '#login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (loginView) loginView.hidden = true;
  if (landingView) landingView.hidden = true;
  if (appShell) appShell.hidden = false;

  const navMatch = NAV_ITEMS.find(i => i.label === target) || NAV_ITEMS[0];
  store.page = navMatch.label;

  const crumb = el('crumb-page');
  if (crumb) crumb.textContent = store.page;
  el('side-nav')?.querySelectorAll('[data-nav-page]').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.navPage === store.page);
  });

  if (location.hash !== `#${navMatch.slug}`) {
    history.replaceState(null, '', `#${navMatch.slug}`);
  }

  renderActivePage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSignIn(user, remember = true) {
  store.authUser = user;
  store.profile = {
    ...store.profile,
    name: user.name || store.profile.name,
    role: user.role || store.profile.role,
  };
  saveJSON('northstar.profile', store.profile);
  saveAuthUser(user, remember);
  syncChrome();
  go('Overview');
  notify(`Welcome back, ${(user.name || 'Alex').split(/\s+/)[0]}!`);
}

function handleSignOut() {
  store.authUser = null;
  clearAuthUser();
  setMobileNav(false);
  go('Login');
  notify('You have been signed out.');
}

function setAuthMode(mode) {
  authMode = mode;
  const isReg = mode === 'register';
  el('auth-tab-signin')?.classList.toggle('active', !isReg);
  el('auth-tab-signin')?.setAttribute('aria-selected', String(!isReg));
  el('auth-tab-register')?.classList.toggle('active', isReg);
  el('auth-tab-register')?.setAttribute('aria-selected', String(isReg));

  const regFields = el('auth-register-fields');
  if (regFields) regFields.hidden = !isReg;
  const nameInput = el('auth-name');
  const roleInput = el('auth-role');
  if (nameInput) nameInput.required = isReg;
  if (roleInput) roleInput.required = isReg;

  const title = el('auth-title');
  const sub = el('auth-subtitle');
  const pass = el('auth-password');
  const submitBtn = el('auth-submit-btn');
  if (title) title.textContent = isReg ? 'Create your workspace' : 'Welcome back';
  if (sub) {
    sub.textContent = isReg
      ? 'Set up a local account to keep your career progress organized.'
      : 'Sign in to continue to your Northstar career studio.';
  }
  if (pass) {
    pass.placeholder = isReg ? 'At least 6 characters' : 'Enter your password';
    pass.autocomplete = isReg ? 'new-password' : 'current-password';
  }
  if (submitBtn) {
    submitBtn.innerHTML = `${isReg ? 'Create account & enter' : 'Sign in to workspace'} ${icon('arrow-right', 15)}`;
  }
  const errEl = el('auth-error');
  if (errEl) {
    errEl.hidden = true;
    errEl.textContent = '';
  }
}

function runGlobalSearch() {
  const input = el('global-search-input');
  const q = (input?.value || '').trim().toLowerCase();
  if (!q) return;
  const match = NAV_ITEMS.find(item => item.label.toLowerCase().includes(q));
  if (match) go(match.label);
  else if (/job|role|company|opportunit/.test(q)) go('Job Recommendations');
  else if (/resume|ats|cv/.test(q)) go('Resume Analyzer');
  else if (/skill|learn|course/.test(q)) go('Skill Gap Analysis');
  else if (/interview|practice/.test(q)) go('Interview Preparation');
  else if (/track|app/.test(q)) go('Application Tracker');
  else notify('No workspace section matched that search. Try a tool name or career topic.');
}

function resolveInitialPage() {
  const slug = location.hash.replace(/^#/, '').toLowerCase();
  if (slug === 'landing') return 'Landing';
  if (!store.authUser) return 'Login';
  const match = NAV_ITEMS.find(i => i.slug === slug);
  return match ? match.label : 'Overview';
}

function bindStaticListeners() {
  const year = String(new Date().getFullYear());
  if (el('auth-year')) el('auth-year').textContent = year;
  if (el('landing-year')) el('landing-year').textContent = year;
  if (el('footer-year')) el('footer-year').textContent = year;

  el('auth-tab-signin')?.addEventListener('click', () => setAuthMode('signin'));
  el('auth-tab-register')?.addEventListener('click', () => setAuthMode('register'));

  el('auth-eye-btn')?.addEventListener('click', () => {
    showPassword = !showPassword;
    const pass = el('auth-password');
    const eyeBtn = el('auth-eye-btn');
    if (pass) pass.type = showPassword ? 'text' : 'password';
    if (eyeBtn) {
      eyeBtn.innerHTML = icon(showPassword ? 'eye-off' : 'eye', 16);
      eyeBtn.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
    }
  });

  el('auth-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = el('auth-error');
    const submitBtn = el('auth-submit-btn');
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    const email = el('auth-email')?.value || '';
    const password = el('auth-password')?.value || '';
    const remember = Boolean(el('auth-remember')?.checked);
    const payload =
      authMode === 'signin'
        ? { email, password }
        : {
            name: el('auth-name')?.value || '',
            role: el('auth-role')?.value || 'Product Designer',
            email,
            password,
          };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = authMode === 'signin' ? 'Signing in...' : 'Creating account...';
    }

    try {
      const endpoint = authMode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const data = await api(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      handleSignIn(data.user, remember);
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Unable to sign in. Please check your details.';
        errEl.hidden = false;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${authMode === 'signin' ? 'Sign in to workspace' : 'Create account & enter'} ${icon('arrow-right', 15)}`;
      }
    }
  });

  el('auth-demo-btn')?.addEventListener('click', () => {
    const remember = Boolean(el('auth-remember')?.checked);
    handleSignIn(
      { name: 'Alex Morgan', role: 'Product Designer', email: 'alex.morgan@northstar.local', demo: true },
      remember
    );
  });

  el('auth-brand-btn')?.addEventListener('click', () => go('Landing'));
  el('auth-mobile-brand-btn')?.addEventListener('click', () => go('Landing'));
  el('auth-explore-btn')?.addEventListener('click', () => go('Landing'));

  el('landing-open-btn')?.addEventListener('click', () => go('Overview'));
  el('landing-hero-start')?.addEventListener('click', () => go('Overview'));
  el('landing-cta-btn')?.addEventListener('click', () => go('Overview'));
  el('landing-brand-top')?.addEventListener('click', e => {
    e.preventDefault();
    go('Overview');
  });
  el('landing-brand-bottom')?.addEventListener('click', e => {
    e.preventDefault();
    go('Overview');
  });

  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
  document.querySelectorAll('[data-landing-go]').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.landingGo));
  });

  el('brand-landing-link')?.addEventListener('click', e => {
    e.preventDefault();
    go('Landing');
  });
  el('mobile-close-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    setMobileNav(false);
  });
  el('mobile-menu-btn')?.addEventListener('click', () => setMobileNav(true));
  el('mobile-scrim')?.addEventListener('click', () => setMobileNav(false));

  el('sidebar-profile-btn')?.addEventListener('click', () => go('Profile'));
  el('top-profile-btn')?.addEventListener('click', () => go('Profile'));
  el('sidebar-roadmap-btn')?.addEventListener('click', () => go('Learning Roadmap'));
  el('sidebar-signout-btn')?.addEventListener('click', handleSignOut);

  el('mobile-search-btn')?.addEventListener('click', () => el('global-search-input')?.focus());
  el('global-search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') runGlobalSearch();
  });

  el('bell-btn')?.addEventListener('click', () => notify('You’re all caught up — no unread alerts.'));
  el('shortcuts-btn')?.addEventListener('click', () => notify('Tip: Press "/" anytime to jump to any career tool.'));

  document.addEventListener('click', e => {
    const goEl = e.target.closest('#page-wrap [data-go]');
    if (goEl) go(goEl.dataset.go);
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeModalClose) {
      activeModalClose();
      return;
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      if (store.authUser && store.page !== 'Landing' && store.page !== 'Login') {
        e.preventDefault();
        el('global-search-input')?.focus();
      }
    }
  });

  window.addEventListener('hashchange', () => {
    go(resolveInitialPage());
  });
}

async function init() {
  buildSidebarNav();
  bindStaticListeners();
  syncChrome();
  go(resolveInitialPage());

  try {
    const [trackerData, statusData] = await Promise.all([
      api('/api/tracker').catch(() => null),
      api('/api/status').catch(() => null),
    ]);
    if (trackerData?.applications) {
      store.applications = trackerData.applications;
      if (store.page === 'Overview' || store.page === 'Application Tracker') {
        renderActivePage();
      }
    }
    if (statusData) {
      store.aiEnabled = Boolean(statusData.ai_enabled);
      syncChrome();
      if (store.page === 'AI Career Guidance' || store.page === 'Resume Analyzer') {
        renderActivePage();
      }
    }
  } catch {}
}

init();
