import { icon } from './icons.js';

export const NAV_ITEMS = [
  { label: 'Overview', slug: 'overview', icon: 'layout-dashboard', section: 'WORKSPACE' },
  { label: 'AI Career Guidance', slug: 'guidance', icon: 'sparkles' },
  { label: 'Resume Builder', slug: 'resume-builder', icon: 'file-text', section: 'YOUR TOOLKIT' },
  { label: 'Resume Analyzer', slug: 'resume-analyzer', icon: 'file-check-2' },
  { label: 'Job Recommendations', slug: 'jobs', icon: 'briefcase-business' },
  { label: 'Skill Gap Analysis', slug: 'skills', icon: 'target' },
  { label: 'Interview Preparation', slug: 'interview', icon: 'mic-2' },
  { label: 'Learning Roadmap', slug: 'roadmap', icon: 'graduation-cap' },
  { label: 'Application Tracker', slug: 'tracker', icon: 'clipboard-list', section: 'YOUR ACTIVITY' },
  { label: 'Profile', slug: 'profile', icon: 'user-round', section: 'PREFERENCES' },
  { label: 'Settings', slug: 'settings', icon: 'settings' },
];

export const JOBS_SEED = [
  {
    title: 'Senior Product Designer',
    company: 'Linear',
    location: 'Remote · US',
    salary: '$145k – $185k',
    exp: '5+ years',
    match: 96,
    tone: 'purple',
    mark: 'L',
    tags: ['Product design', 'Figma', 'Design systems'],
    posted: '2h ago',
  },
  {
    title: 'Product Designer, Growth',
    company: 'Notion',
    location: 'New York, NY · Hybrid',
    salary: '$130k – $170k',
    exp: '3+ years',
    match: 91,
    tone: 'dark',
    mark: 'N',
    tags: ['Product design', 'Experimentation', 'Figma'],
    posted: '5h ago',
  },
  {
    title: 'UX Designer',
    company: 'Vercel',
    location: 'Remote · US',
    salary: '$120k – $155k',
    exp: '3+ years',
    match: 88,
    tone: 'black',
    mark: '▲',
    tags: ['UX research', 'Prototyping', 'Design systems'],
    posted: '1d ago',
  },
];

export const SKILL_SEED = [
  { name: 'Product strategy', score: 86, color: 'blue' },
  { name: 'Figma & prototyping', score: 92, color: 'violet' },
  { name: 'User research', score: 74, color: 'cyan' },
  { name: 'Design systems', score: 68, color: 'orange' },
];

export const DEFAULT_PROFILE = {
  name: 'Alex Morgan',
  role: 'Product Designer',
  location: 'San Francisco, CA',
  goal: 'Grow into a product design leader while staying close to the craft.',
  experience: '6+ years in product design',
  preference: 'Remote · Product-led teams',
};

export const DEFAULT_TASKS = [
  { id: 't1', done: true, title: 'Polish your portfolio case study', time: 'Completed yesterday' },
  { id: 't2', done: false, title: 'Practice your product design pitch', time: 'Today · 20 min' },
  { id: 't3', done: false, title: 'Review 3 new job matches', time: 'Tomorrow · 15 min' },
];

export const DEFAULT_RESUME = {
  template: 0,
  name: 'Alex Morgan',
  role: 'Product Designer',
  email: 'alex.morgan@email.com',
  location: 'San Francisco, CA',
  summary:
    'Product designer who turns complex workflows into calm, intuitive experiences. Passionate about design systems, craft, and measurable product impact.',
  expTitle: 'Senior Product Designer',
  expCompany: 'Acme Studio',
  expPeriod: '2022 — Present',
  expBullets:
    'Led end-to-end design for core onboarding and collaboration workflows.\nPartnered with product and engineering to lift activation by 18%.\nBuilt a scalable component library adopted across 3 product teams.',
  skills: 'Product strategy · Figma · Prototyping · User research · Design systems',
  eduDegree: 'BFA, Interaction Design',
  eduSchool: 'California College of the Arts',
};

export const ROLE_PROFILES = {
  'Senior Product Designer': {
    match: 74,
    haveCount: 8,
    totalCount: 11,
    gapCount: 3,
    focus: 'Design systems',
    focusCopy: 'Build on your component design experience and learn how to scale patterns across a product.',
    course: 'Design Systems for Everyone',
    courseMeta: 'Course · 3.5 hours',
    skills: [
      ['Product strategy', 86, true],
      ['Figma & prototyping', 92, true],
      ['User research', 74, true],
      ['Design systems', 68, false],
      ['Data-informed design', 42, false],
      ['Stakeholder leadership', 55, false],
    ],
  },
  'UX Design Lead': {
    match: 69,
    haveCount: 7,
    totalCount: 11,
    gapCount: 4,
    focus: 'Stakeholder leadership',
    focusCopy: 'Sharpen executive storytelling and cross-team alignment to guide multi-squad initiatives.',
    course: 'Leading Product Design Critiques',
    courseMeta: 'Workshop · 2.5 hours',
    skills: [
      ['Product strategy', 86, true],
      ['Figma & prototyping', 92, true],
      ['User research', 74, true],
      ['Design systems', 68, true],
      ['Data-informed design', 42, false],
      ['Stakeholder leadership', 55, false],
    ],
  },
};

export const ROADMAP_WEEKS = [
  {
    title: 'Design systems foundations',
    duration: 'Week 1 · 3.5 hours',
    items: [
      'Explore core principles and reusable patterns',
      'Audit a product you use every day',
      'Sketch a component library for your portfolio',
    ],
  },
  {
    title: 'Design with data',
    duration: 'Week 2 · 4 hours',
    items: [
      'Understand key product metrics',
      'Connect design decisions to outcomes',
      'Add an impact story to your case study',
    ],
  },
  {
    title: 'Lead with influence',
    duration: 'Week 3 · 3 hours',
    items: [
      'Practice a stakeholder conversation',
      'Share your point of view with clarity',
      'Create your next 90-day growth plan',
    ],
  },
];

export const DEFAULT_SETTINGS = {
  weeklySummary: true,
  roleAlerts: false,
  learningReminders: true,
  localResume: true,
  personalizedMatches: true,
  keepChatHistory: false,
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function loadArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [...fallback];
  } catch {
    return [...fallback];
  }
}

export function loadAuthUser() {
  try {
    const raw = localStorage.getItem('northstar.auth') || sessionStorage.getItem('northstar.auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthUser(user, remember = true) {
  try {
    const serialized = JSON.stringify(user);
    if (remember) {
      localStorage.setItem('northstar.auth', serialized);
      sessionStorage.removeItem('northstar.auth');
    } else {
      sessionStorage.setItem('northstar.auth', serialized);
      localStorage.removeItem('northstar.auth');
    }
  } catch {}
}

export function clearAuthUser() {
  try {
    localStorage.removeItem('northstar.auth');
    sessionStorage.removeItem('northstar.auth');
  } catch {}
}

export async function api(path, options = {}) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export function safeURL(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export function getInitials(name = 'Alex Morgan') {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || 'NS'
  );
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase();
}

export function downloadText(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function avatarHTML(initials = 'AM', size = '') {
  return `<span class="avatar ${size}">${escapeHTML(initials)}</span>`;
}

export function badgeHTML(content, tone = '') {
  return `<span class="badge ${tone}">${content}</span>`;
}

export function progressHTML(value, color = 'blue') {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="progress"><span class="fill ${color}" style="width: ${clamped}%"></span></div>`;
}

export function pageHeaderHTML({ eyebrow, title, description, actionHTML = '' }) {
  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">${escapeHTML(eyebrow)}</div>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(description)}</p>
      </div>
      ${actionHTML}
    </div>
  `;
}

export function sectionTitleHTML({ eyebrow, title, description = '', actionHTML = '' }) {
  return `
    <div class="section-title">
      <div>
        ${eyebrow ? `<div class="eyebrow">${escapeHTML(eyebrow)}</div>` : ''}
        <h2>${escapeHTML(title)}</h2>
        ${description ? `<p>${escapeHTML(description)}</p>` : ''}
      </div>
      ${actionHTML}
    </div>
  `;
}

export function createStore() {
  const profile = loadJSON('northstar.profile', DEFAULT_PROFILE);
  const savedAuth = loadAuthUser();
  return {
    authUser: savedAuth,
    page: savedAuth ? 'Overview' : 'Login',
    aiEnabled: false,
    profile,
    tasks: loadArray('northstar.tasks', DEFAULT_TASKS),
    addingTask: false,
    period: 'This week',
    jobs: [...JOBS_SEED],
    jobQuery: 'Product Designer',
    jobLocation: '',
    jobFilter: 'All matches',
    jobsLoading: false,
    savedJobs: loadArray('northstar.savedJobs', []),
    applications: [],
    trackerFilter: 'All',
    guidanceMessages: null,
    guidanceBusy: false,
    resumeDraft: loadJSON('northstar.resumeDraft', {
      ...DEFAULT_RESUME,
      name: profile.name || DEFAULT_RESUME.name,
      role: profile.role || DEFAULT_RESUME.role,
      location: profile.location || DEFAULT_RESUME.location,
    }),
    analyzer: {
      file: null,
      description: '',
      result: null,
      coachResult: null,
      busy: false,
      coachBusy: false,
    },
    skillsTargetRole: 'Senior Product Designer',
    interview: {
      role: profile.role || 'Product Designer',
      style: 'Mix of behavioral & role-specific',
      count: '3',
      questions: [],
      answers: {},
      feedbacks: {},
      busy: false,
    },
    roadmapDone: loadArray('northstar.roadmapDone', [0]),
    settings: loadJSON('northstar.settings', DEFAULT_SETTINGS),
  };
}
