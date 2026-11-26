import { icon } from './icons.js';
import {
  JOBS_SEED,
  ROADMAP_WEEKS,
  ROLE_PROFILES,
  SKILL_SEED,
  api,
  avatarHTML,
  badgeHTML,
  downloadText,
  escapeHTML,
  formatToday,
  getGreeting,
  pageHeaderHTML,
  progressHTML,
  safeURL,
  saveJSON,
  sectionTitleHTML,
} from './state.js';

function metricCardHTML({ label, value, suffix = '', delta, caption, iconName, tone, visual }) {
  let deco = '';
  if (visual === 'gauge') {
    deco = '<i></i><i></i><i></i><i></i><i></i>';
  } else if (visual === 'bars') {
    deco = [30, 55, 43, 72, 51, 82, 66, 100].map(x => `<i style="height:${x}%"></i>`).join('');
  } else if (visual === 'spark') {
    deco = '<svg viewBox="0 0 94 37" preserveAspectRatio="none"><path d="M1 30 C12 25 16 27 25 19 S42 23 50 16 S65 20 73 8 S86 13 94 3" /></svg>';
  } else {
    deco = '<svg viewBox="0 0 94 37" preserveAspectRatio="none"><path d="M1 31 C12 31 13 17 23 22 S35 11 44 18 S58 10 67 14 S80 3 94 4" /></svg>';
  }

  return `
    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-icon ${tone}">${icon(iconName, 17)}</span>
        <span class="metric-more" aria-hidden="true">${icon('more-horizontal', 16)}</span>
      </div>
      <div class="metric-label">${escapeHTML(label)}</div>
      <div class="metric-number">${escapeHTML(value)}${suffix ? `<small>${escapeHTML(suffix)}</small>` : ''}</div>
      <div class="metric-bottom">
        <span class="metric-delta">${icon('arrow-up-right', 13)} ${escapeHTML(delta)}</span>
        <span>${escapeHTML(caption)}</span>
      </div>
      <div class="metric-decoration ${visual}" aria-hidden="true">${deco}</div>
    </div>
  `;
}

function pathRowHTML({ sym, color, title, meta, match, note }) {
  return `
    <button type="button" class="path-row" data-go="Job Recommendations">
      <span class="path-icon ${color}">${sym}</span>
      <span class="path-info">
        <strong>${escapeHTML(title)}</strong>
        <small>${escapeHTML(meta)}</small>
      </span>
      <span class="path-fit">
        <strong>${match}%</strong>
        <small>${escapeHTML(note)}</small>
      </span>
      ${icon('arrow-right', 16, { className: 'path-arrow' })}
    </button>
  `;
}

export function renderOverview(root, ctx) {
  const { store } = ctx;
  const firstName = store.profile.name.trim().split(/\s+/)[0] || 'Alex';
  const readiness = 78;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - readiness / 100);
  const periodCaption =
    store.period === 'This week' ? 'vs. last week' : store.period === 'This month' ? 'vs. last month' : 'past 90 days';
  const topJob = store.jobs[0];
  const pendingTasks = store.tasks.filter(t => !t.done).length;

  root.innerHTML = `
    <div class="dashboard-page">
      <div class="welcome-row">
        <div>
          <div class="eyebrow">${escapeHTML(formatToday())} <span class="eyebrow-dot">·</span> YOUR WEEKLY CHECK-IN</div>
          <h1>${getGreeting()}, ${escapeHTML(firstName)} <span class="wave">✳</span></h1>
          <p>You're making thoughtful progress. Here's your career snapshot.</p>
        </div>
        <div class="date-select-wrap">
          ${icon('calendar-days', 15)}
          <select class="date-select" id="overview-period" aria-label="Timeframe">
            <option${store.period === 'This week' ? ' selected' : ''}>This week</option>
            <option${store.period === 'This month' ? ' selected' : ''}>This month</option>
            <option${store.period === 'Last 90 days' ? ' selected' : ''}>Last 90 days</option>
          </select>
          ${icon('chevron-down', 14)}
        </div>
      </div>

      <div class="dash-hero">
        <div class="dash-hero-grid"></div>
        <div class="hero-copy">
          <div class="hero-kicker">${icon('sparkles', 13)} YOUR CAREER, IN FOCUS</div>
          <h2>Make your next move<br />a <span>confident one.</span></h2>
          <p>You’re closer than you think. Keep building on your strengths and discover where they can take you next.</p>
          <button type="button" class="btn btn-white" data-go="AI Career Guidance">
            ${icon('wand-sparkles', 15)} Explore your next step ${icon('arrow-right', 15)}
          </button>
        </div>

        <div class="hero-visual">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="hero-star">${icon('compass', 46, { strokeWidth: 1.25 })}</div>
          <div class="float-card float-top">
            <span class="float-icon">${icon('trending-up', 15)}</span>
            <span>
              <small>PROFILE STRENGTH</small>
              <strong>Trending up ${icon('arrow-up-right', 14)}</strong>
            </span>
          </div>
          <div class="float-card float-bottom">
            <span class="float-avatar">${escapeHTML(topJob?.mark || 'L')}</span>
            <span>
              <small>NEW BEST MATCH</small>
              <strong>${escapeHTML(topJob?.title?.split(' ').slice(-2).join(' ') || 'Product Designer')} <i>${topJob?.match || 96}%</i></strong>
            </span>
          </div>
        </div>

        <div class="hero-foot">
          <span><i></i> Your personal career workspace</span>
          <span>Last updated just now ${icon('arrow-right', 13)}</span>
        </div>
      </div>

      <div class="metric-grid">
        ${metricCardHTML({ label: 'Career readiness', value: '78', suffix: '/100', delta: '+8 pts', caption: periodCaption, iconName: 'gauge', tone: 'blue', visual: 'gauge' })}
        ${metricCardHTML({ label: 'Skills mastered', value: '12', suffix: '/16', delta: '+2 skills', caption: periodCaption, iconName: 'award', tone: 'violet', visual: 'bars' })}
        ${metricCardHTML({ label: 'Recommended roles', value: String(Math.max(24, store.jobs.length)), delta: '8 new', caption: 'great-fit matches', iconName: 'briefcase-business', tone: 'cyan', visual: 'spark' })}
        ${metricCardHTML({ label: 'Applications', value: String(store.applications.length || 6).padStart(2, '0'), delta: '2 interviews', caption: 'in progress', iconName: 'activity', tone: 'orange', visual: 'chart' })}
      </div>

      <div class="dashboard-columns">
        <div class="column-main">
          <div class="card paths-card">
            ${sectionTitleHTML({
              eyebrow: 'A CLEARER DIRECTION',
              title: 'Career paths to explore',
              description: 'Roles that align with your strengths and goals.',
              actionHTML: `<button type="button" class="text-link" data-go="Job Recommendations">View all paths ${icon('arrow-right', 14)}</button>`,
            })}
            <div class="path-list">
              ${pathRowHTML({ sym: '✳', color: 'path-purple', title: 'Senior Product Designer', meta: 'Design · 5+ years', match: 96, note: 'Excellent fit' })}
              ${pathRowHTML({ sym: '◈', color: 'path-blue', title: 'UX Design Lead', meta: 'Design leadership · 6+ years', match: 89, note: 'Strong fit' })}
              ${pathRowHTML({ sym: '⌘', color: 'path-cyan', title: 'Product Design Manager', meta: 'People & strategy · 7+ years', match: 82, note: 'Good fit' })}
            </div>
          </div>

          <div class="card skills-card">
            ${sectionTitleHTML({
              eyebrow: 'YOUR MOMENTUM',
              title: 'Skills in motion',
              description: "You're growing in all the right areas.",
              actionHTML: `<button type="button" class="round-action" data-go="Skill Gap Analysis" aria-label="View skill analysis">${icon('arrow-right', 16)}</button>`,
            })}
            <div class="skills-rows">
              ${SKILL_SEED.map(
                s => `
                <div class="skill-line">
                  <span>${escapeHTML(s.name)}</span>
                  ${progressHTML(s.score, s.color)}
                  <strong>${s.score}%</strong>
                </div>`
              ).join('')}
            </div>
            <button type="button" class="skill-insight" data-go="Skill Gap Analysis">
              <span>${icon('lightbulb', 17)}</span>
              <div>
                <strong>One skill could unlock 12 more roles</strong>
                <p>Build confidence in design systems to open new opportunities.</p>
              </div>
              ${icon('arrow-right', 16)}
            </button>
          </div>
        </div>

        <div class="column-side">
          <div class="card readiness-card">
            ${sectionTitleHTML({
              eyebrow: 'YOUR READINESS',
              title: 'Career readiness',
              actionHTML: `<button type="button" class="more-btn" data-go="Resume Analyzer" aria-label="Review readiness">${icon('more-horizontal', 18)}</button>`,
            })}
            <div class="readiness-body">
              <div class="donut-wrap">
                <svg class="ring-svg" viewBox="0 0 92 92" aria-hidden="true">
                  <defs>
                    <linearGradient id="northstarRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#4f5ee8" />
                      <stop offset="100%" stop-color="#8569ee" />
                    </linearGradient>
                  </defs>
                  <circle class="ring-track" cx="46" cy="46" r="${radius}" />
                  <circle class="ring-fill" cx="46" cy="46" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" />
                </svg>
                <div class="ring-center"><strong>${readiness}</strong><small>of 100</small></div>
                <span class="donut-spark">${icon('sparkles', 12)}</span>
              </div>
              <div class="readiness-copy">
                ${badgeHTML(`${icon('trending-up', 12)} +8 this month`, 'positive')}
                <p>You're building strong momentum. Keep it going!</p>
              </div>
            </div>
            <div class="readiness-divider"></div>
            <div class="mini-checks">
              <span><i class="check-dot">${icon('check', 11)}</i>Profile complete</span>
              <span><i class="check-dot">${icon('check', 11)}</i>Skills assessed</span>
              <span><i class="check-dot pending">${icon('arrow-right', 11)}</i>Resume optimized</span>
            </div>
            <button type="button" class="readiness-cta" data-go="Resume Analyzer">
              Improve your score ${icon('arrow-right', 14)}
            </button>
          </div>

          <div class="card tasks-card">
            ${sectionTitleHTML({
              eyebrow: 'STAY IN FLOW',
              title: 'Upcoming tasks',
              actionHTML: `<span class="task-count" id="task-pending-count">${pendingTasks}</span>`,
            })}
            <div class="tasks-list" id="tasks-list">
              ${store.tasks
                .map(
                  task => `
                <button type="button" class="task-item${task.done ? ' task-done' : ''}" data-task-id="${escapeHTML(task.id)}">
                  <span class="task-check">${task.done ? icon('check', 12) : ''}</span>
                  <div>
                    <strong>${escapeHTML(task.title)}</strong>
                    <small>${icon('clock-3', 12)} ${escapeHTML(task.time)}</small>
                  </div>
                </button>`
                )
                .join('')}
            </div>
            ${
              store.addingTask
                ? `<form class="task-inline-form" id="task-inline-form">
                    <input id="new-task-input" placeholder="Next career step..." required />
                    <button type="submit" class="btn btn-primary btn-sm">Add</button>
                    <button type="button" class="btn btn-subtle btn-sm" id="cancel-task-btn">Cancel</button>
                  </form>`
                : `<button type="button" class="task-add" id="open-task-btn">${icon('plus', 14)} Add a task</button>`
            }
          </div>

          <div class="ai-tip-card">
            <div class="ai-tip-head">
              <span>${icon('sparkles', 13)} YOUR AI CAREER COACH</span>
              <span class="online-dot"></span>
            </div>
            <p>“Your portfolio leadership experience stands out. Have you considered roles at <strong>early-stage startups</strong>?”</p>
            <button type="button" data-go="AI Career Guidance">Continue the conversation ${icon('arrow-right', 13)}</button>
            <div class="tip-decoration">✳</div>
          </div>
        </div>
      </div>

      <div class="activity-strip">
        <div>
          <span class="activity-icon">${icon('flame', 17)}</span>
          <span>
            <small>YOUR MOMENTUM</small>
            <strong>4 day streak</strong>
          </span>
        </div>
        <div class="activity-progress"><span style="width: 58%"></span></div>
        <span class="activity-caption">2 more days to beat your best <span>✦</span></span>
        <button type="button" data-go="Learning Roadmap">View activity ${icon('arrow-right', 14)}</button>
      </div>
    </div>
  `;

  root.querySelector('#overview-period')?.addEventListener('change', e => {
    store.period = e.target.value;
    renderOverview(root, ctx);
  });

  root.querySelectorAll('[data-task-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.taskId;
      store.tasks = store.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
      saveJSON('northstar.tasks', store.tasks);
      renderOverview(root, ctx);
    });
  });

  root.querySelector('#open-task-btn')?.addEventListener('click', () => {
    store.addingTask = true;
    renderOverview(root, ctx);
    root.querySelector('#new-task-input')?.focus();
  });

  root.querySelector('#cancel-task-btn')?.addEventListener('click', () => {
    store.addingTask = false;
    renderOverview(root, ctx);
  });

  root.querySelector('#task-inline-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const title = root.querySelector('#new-task-input')?.value.trim();
    if (!title) return;
    store.tasks.push({ id: `t-${Date.now()}`, done: false, title, time: 'Planned · 15 min' });
    saveJSON('northstar.tasks', store.tasks);
    store.addingTask = false;
    renderOverview(root, ctx);
    ctx.notify('Task added to your weekly flow.');
  });
}

export function renderGuidance(root, ctx) {
  const { store } = ctx;
  const firstName = store.profile.name.trim().split(/\s+/)[0] || 'Alex';

  if (!store.guidanceMessages) {
    store.guidanceMessages = [
      {
        role: 'assistant',
        text: `Hi ${firstName}! I’ve been looking at your recent progress. You have a strong blend of product thinking and visual craft. What would you like to explore today?`,
      },
    ];
  }

  const threads = [
    {
      title: 'Exploring design leadership',
      date: 'Yesterday',
      messages: [
        {
          role: 'assistant',
          text: `Hi ${firstName}! Let’s look at what a transition toward design leadership could look like for you — whether as a Staff IC or a Design Manager.`,
        },
        {
          role: 'user',
          text: 'I enjoy mentoring designers, but I still love being close to product craft.',
        },
        {
          role: 'assistant',
          text: 'A Staff or Principal Product Designer path — or a Player-Coach Design Lead role at a Series B/C company — gives you mentorship and strategic influence without stepping away from hands-on craft.',
        },
      ],
    },
    {
      title: 'Portfolio story feedback',
      date: 'Nov 8',
      messages: [
        {
          role: 'assistant',
          text: 'Lead each case study with the core tension and business outcome before showing final mocks. Hiring managers scan for how you frame ambiguity.',
        },
      ],
    },
    {
      title: 'Making a thoughtful career move',
      date: 'Nov 5',
      messages: [
        {
          role: 'assistant',
          text: 'Before sending applications, pick 3 criteria that are non-negotiable for your next team: product maturity, design leadership, and work rhythm.',
        },
      ],
    },
  ];

  function renderMessagesList() {
    const list = root.querySelector('#chat-messages');
    const countBadge = root.querySelector('#chat-msg-count');
    if (!list) return;
    if (countBadge) countBadge.textContent = `${store.guidanceMessages.length} messages`;
    list.innerHTML =
      store.guidanceMessages
        .map(
          (m, i) => `
          <div class="message-row ${m.role === 'user' ? 'user' : ''}">
            ${m.role === 'assistant' ? `<span class="mini-coach">${icon('sparkles', 14)}</span>` : ''}
            <div class="message-bubble">
              ${escapeHTML(m.text)}
              ${m.role === 'assistant' && i === 0 ? '<small>Just now</small>' : ''}
            </div>
          </div>`
        )
        .join('') +
      (store.guidanceBusy
        ? `<div class="message-row">
             <span class="mini-coach">${icon('sparkles', 14)}</span>
             <div class="typing"><i></i><i></i><i></i></div>
           </div>`
        : '') +
      '<div id="chat-end"></div>';
    list.querySelector('#chat-end')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function sendPrompt(text) {
    const question = text.trim();
    if (!question || store.guidanceBusy) return;
    store.guidanceMessages.push({ role: 'user', text: question });
    const input = root.querySelector('#chat-draft');
    if (input) input.value = '';
    updateSendState();
    store.guidanceBusy = true;
    renderMessagesList();
    try {
      const data = await api('/api/career/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      store.guidanceMessages.push({ role: 'assistant', text: data.reply });
    } catch (err) {
      ctx.notify(err.message);
    } finally {
      store.guidanceBusy = false;
      renderMessagesList();
      updateSendState();
    }
  }

  function updateSendState() {
    const input = root.querySelector('#chat-draft');
    const sendBtn = root.querySelector('#chat-send-btn');
    if (sendBtn && input) sendBtn.disabled = !input.value.trim() || store.guidanceBusy;
    root.querySelectorAll('.chat-prompts button').forEach(b => {
      b.disabled = store.guidanceBusy;
    });
  }

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'A THOUGHTFUL CAREER PARTNER',
      title: 'Your AI career guide',
      description: 'A calm space to think clearly about what’s next, and how to get there.',
      actionHTML: `<button type="button" class="btn btn-outline" id="new-chat-btn">${icon('plus', 15)} New chat</button>`,
    })}

    <div class="guidance-layout">
      <div class="chat-card card">
        <div class="chat-head">
          <div class="coach-avatar">${icon('sparkles', 18)}</div>
          <div>
            <strong>Northstar career coach</strong>
            <small><i class="online-dot"></i> ${store.aiEnabled ? 'AI coach ready' : 'Guided offline mode · Here to help'}</small>
          </div>
          ${badgeHTML(`${store.guidanceMessages.length} messages`, 'subtle').replace('<span ', '<span id="chat-msg-count" ')}
        </div>

        <div class="chat-messages" id="chat-messages"></div>

        <div class="chat-prompts">
          ${['What roles fit my strengths?', 'How can I grow into leadership?', 'Help me plan my next 30 days']
            .map(t => `<button type="button" data-prompt="${escapeHTML(t)}">${escapeHTML(t)} ${icon('arrow-up-right', 13)}</button>`)
            .join('')}
        </div>

        <form class="chat-compose" id="chat-form">
          <input id="chat-draft" placeholder="Ask anything about your career..." autocomplete="off" />
          <button type="submit" id="chat-send-btn" aria-label="Send message" disabled>${icon('send', 16)}</button>
        </form>

        <p class="chat-disclaimer">
          ${icon('shield-check', 13)} Avoid sharing sensitive details; configured AI providers receive your chat message.
        </p>
      </div>

      <aside class="guide-aside">
        <div class="card guide-card">
          <div class="guide-icon">${icon('compass', 19)}</div>
          <div class="eyebrow">A LITTLE CONTEXT</div>
          <h3>Your north star</h3>
          <p id="guide-goal-text">${escapeHTML(store.profile.goal)}</p>
          <button type="button" id="guide-edit-goals">Edit career goals ${icon('arrow-right', 13)}</button>
        </div>

        <div class="card guide-card">
          <div class="eyebrow">RECENT CONVERSATIONS</div>
          ${threads
            .map(
              (t, idx) => `
            <button type="button" class="history-row" data-thread-idx="${idx}">
              ${icon('message-circle', 16)}
              <span>${escapeHTML(t.title)}<small>${escapeHTML(t.date)}</small></span>
              ${icon('chevron-right', 14)}
            </button>`
            )
            .join('')}
        </div>

        <div class="guide-note">
          ${icon('lightbulb', 17)}
          <p><strong>Come as you are.</strong> There’s no perfect question. Start wherever your mind is today.</p>
        </div>
      </aside>
    </div>
  `;

  renderMessagesList();

  root.querySelector('#chat-draft')?.addEventListener('input', updateSendState);
  root.querySelector('#chat-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = root.querySelector('#chat-draft');
    if (input) sendPrompt(input.value);
  });

  root.querySelectorAll('[data-prompt]').forEach(btn => {
    btn.addEventListener('click', () => sendPrompt(btn.dataset.prompt || ''));
  });

  root.querySelector('#new-chat-btn')?.addEventListener('click', () => {
    store.guidanceMessages = [
      {
        role: 'assistant',
        text: `Fresh conversation started, ${firstName}. What’s top of mind for your career right now?`,
      },
    ];
    renderMessagesList();
    ctx.notify('Started a new coaching thread.');
  });

  root.querySelectorAll('[data-thread-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const thread = threads[Number(btn.dataset.threadIdx)];
      if (!thread) return;
      store.guidanceMessages = thread.messages.map(m => ({ ...m }));
      renderMessagesList();
      ctx.notify(`Loaded “${thread.title}”.`);
    });
  });

  root.querySelector('#guide-edit-goals')?.addEventListener('click', () => openEditProfileModal(ctx));
}

export function renderResumeBuilder(root, ctx) {
  const { store } = ctx;
  const templates = [
    ['Modern', 'Crisp hierarchy & accent bar'],
    ['Classic', 'Timeless serif single-column'],
    ['Creative', 'Editorial left accent strip'],
  ];

  function buildPaperHTML() {
    const r = store.resumeDraft;
    const bullets = r.expBullets
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);
    const paperClass = r.template === 1 ? 'paper-classic' : r.template === 2 ? 'paper-creative' : 'paper-modern';
    const contactLine = [r.location, r.email].filter(Boolean).join(' · ') || 'City, State · email@example.com';

    return `
      <div class="resume-paper ${paperClass}">
        <div class="paper-accent"></div>
        <div class="paper-header">
          <h2>${escapeHTML(r.name || 'Your Name')}</h2>
          <strong class="paper-role">${escapeHTML(r.role || 'Your Target Role')}</strong>
          <small class="paper-contact">${escapeHTML(contactLine)}</small>
        </div>
        <hr />
        <h4>PROFILE</h4>
        <p>${escapeHTML(r.summary)}</p>
        <h4>EXPERIENCE</h4>
        <b class="paper-exp-title">${escapeHTML(r.expTitle)}</b>
        <small class="paper-exp-meta">${escapeHTML(r.expCompany)} · ${escapeHTML(r.expPeriod)}</small>
        <ul>${bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}</ul>
        <h4>SKILLS</h4>
        <p>${escapeHTML(r.skills)}</p>
        <h4>EDUCATION</h4>
        <b class="paper-exp-title">${escapeHTML(r.eduDegree)}</b>
        <small class="paper-exp-meta">${escapeHTML(r.eduSchool)}</small>
      </div>
    `;
  }

  function refreshPreview() {
    const label = root.querySelector('#builder-preview-label');
    const slot = root.querySelector('#builder-paper-slot');
    if (label) label.textContent = `LIVE PREVIEW · ${templates[store.resumeDraft.template][0].toUpperCase()}`;
    if (slot) slot.innerHTML = buildPaperHTML();
  }

  function downloadDraft() {
    const r = store.resumeDraft;
    const bullets = r.expBullets
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);
    const text = `${r.name}\n${r.role}\n${r.location} · ${r.email}\n\nPROFILE\n${r.summary}\n\nEXPERIENCE\n${r.expTitle} | ${r.expCompany} | ${r.expPeriod}\n${bullets.map(b => `• ${b}`).join('\n')}\n\nSKILLS\n${r.skills}\n\nEDUCATION\n${r.eduDegree} | ${r.eduSchool}\n\nTemplate: ${templates[r.template][0]}\n`;
    downloadText(`${(r.name || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume.txt`, text);
    ctx.notify('Downloaded plain-text resume draft.');
  }

  function openPreviewModal() {
    ctx.openModal({
      title: `Resume preview — ${templates[store.resumeDraft.template][0]}`,
      wide: true,
      bodyHTML: `
        ${buildPaperHTML()}
        <div class="modal-actions" style="margin-top: 18px">
          <button type="button" class="btn btn-outline" id="modal-download-txt">${icon('download', 15)} Download .txt</button>
          <button type="button" class="btn btn-primary" id="modal-print-pdf">${icon('printer', 15)} Print / Save PDF</button>
        </div>
      `,
      onMount(dialog) {
        dialog.querySelector('#modal-download-txt')?.addEventListener('click', downloadDraft);
        dialog.querySelector('#modal-print-pdf')?.addEventListener('click', () => window.print());
      },
    });
  }

  const r = store.resumeDraft;
  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'RESUME STUDIO',
      title: 'Tell your story, beautifully.',
      description: 'Create a polished resume that sounds like you, and updates live as you write.',
      actionHTML: `
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-outline" id="builder-print-btn">${icon('printer', 15)} Print / PDF</button>
          <button type="button" class="btn btn-outline" id="builder-download-btn">${icon('download', 15)} Download .txt</button>
        </div>
      `,
    })}

    <div class="builder-layout">
      <div class="builder-main">
        <div class="card builder-card">
          <div class="builder-card-head">
            <div>
              <h2>Your details</h2>
              <p>Edits reflect immediately in the live preview on the right.</p>
            </div>
            ${badgeHTML('Live sync', 'positive')}
          </div>

          <div class="form-grid">
            <label>
              Full name
              <input data-field="name" value="${escapeHTML(r.name)}" />
            </label>
            <label>
              Target role
              <input data-field="role" value="${escapeHTML(r.role)}" />
            </label>
            <label>
              Email
              <input data-field="email" value="${escapeHTML(r.email)}" placeholder="alex.morgan@email.com" />
            </label>
            <label>
              Location
              <input data-field="location" value="${escapeHTML(r.location)}" placeholder="San Francisco, CA" />
            </label>
            <label class="full-field">
              Professional summary
              <textarea rows="3" data-field="summary">${escapeHTML(r.summary)}</textarea>
            </label>
            <label>
              Recent role title
              <input data-field="expTitle" value="${escapeHTML(r.expTitle)}" />
            </label>
            <label>
              Company & dates
              <input id="builder-company-period" value="${escapeHTML(`${r.expCompany} · ${r.expPeriod}`)}" />
            </label>
            <label class="full-field">
              Key highlights (one per line)
              <textarea rows="3" data-field="expBullets">${escapeHTML(r.expBullets)}</textarea>
            </label>
            <label class="full-field">
              Core skills
              <input data-field="skills" value="${escapeHTML(r.skills)}" />
            </label>
            <label>
              Education degree
              <input data-field="eduDegree" value="${escapeHTML(r.eduDegree)}" />
            </label>
            <label>
              School or university
              <input data-field="eduSchool" value="${escapeHTML(r.eduSchool)}" />
            </label>
          </div>

          <div class="builder-divider"></div>

          <div class="builder-card-head">
            <div>
              <h2>Choose your style</h2>
              <p>Each template is clean, structured, and ATS friendly.</p>
            </div>
          </div>

          <div class="template-grid">
            ${templates
              .map(
                ([title, sub], i) => `
              <button type="button" class="template-option${r.template === i ? ' active' : ''}" data-template="${i}">
                <div class="template-preview preview-${i}">
                  <i></i><i></i><i></i><i></i><b></b><i></i><i></i>
                </div>
                <strong>${escapeHTML(title)}</strong>
                <small>${escapeHTML(sub)}</small>
                ${r.template === i ? `<span class="template-check">${icon('check', 12)}</span>` : ''}
              </button>`
              )
              .join('')}
          </div>

          <div class="builder-actions">
            <button type="button" class="btn btn-outline" id="builder-save-btn">Save draft</button>
            <button type="button" class="btn btn-primary" id="builder-preview-btn">Full preview ${icon('arrow-right', 15)}</button>
          </div>
        </div>
      </div>

      <aside class="builder-preview card">
        <div class="preview-head">
          <span id="builder-preview-label">LIVE PREVIEW · ${templates[r.template][0].toUpperCase()}</span>
          <button type="button" id="builder-expand-btn" aria-label="Expand preview">${icon('external-link', 15)}</button>
        </div>
        <div id="builder-paper-slot">${buildPaperHTML()}</div>
        <div class="preview-footer">${icon('shield-check', 14)} ATS-friendly formatting <span>·</span> 1 page</div>
      </aside>
    </div>
  `;

  root.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('input', () => {
      store.resumeDraft[el.dataset.field] = el.value;
      refreshPreview();
    });
  });

  root.querySelector('#builder-company-period')?.addEventListener('input', e => {
    const [comp, per] = e.target.value.split('·').map(s => s.trim());
    store.resumeDraft.expCompany = comp ?? '';
    store.resumeDraft.expPeriod = per ?? '';
    refreshPreview();
  });

  root.querySelectorAll('[data-template]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.template);
      store.resumeDraft.template = idx;
      root.querySelectorAll('[data-template]').forEach(opt => {
        const active = Number(opt.dataset.template) === idx;
        opt.classList.toggle('active', active);
        const existingCheck = opt.querySelector('.template-check');
        if (active && !existingCheck) {
          opt.insertAdjacentHTML('beforeend', `<span class="template-check">${icon('check', 12)}</span>`);
        } else if (!active && existingCheck) {
          existingCheck.remove();
        }
      });
      refreshPreview();
    });
  });

  root.querySelector('#builder-save-btn')?.addEventListener('click', () => {
    saveJSON('northstar.resumeDraft', store.resumeDraft);
    ctx.notify('Your resume draft has been saved.');
  });

  root.querySelector('#builder-print-btn')?.addEventListener('click', () => window.print());
  root.querySelector('#builder-download-btn')?.addEventListener('click', downloadDraft);
  root.querySelector('#builder-preview-btn')?.addEventListener('click', openPreviewModal);
  root.querySelector('#builder-expand-btn')?.addEventListener('click', openPreviewModal);
}

export function renderResumeAnalyzer(root, ctx) {
  const { store } = ctx;
  const az = store.analyzer;

  function renderResultsPanel() {
    const right = root.querySelector('#analyzer-results-slot');
    if (!right) return;

    if (az.result?.score) {
      const s = az.result.score;
      const sec = az.result.security || {};
      const coach = az.coachResult;

      const coachBlock = coach
        ? `
          <div class="card coach-card">
            <div class="coach-card-head">
              <h3>AI Resume Coach Feedback</h3>
              ${badgeHTML('Evidence-grounded', 'positive')}
            </div>
            <p>${escapeHTML(coach.fit_summary)}</p>
            ${[
              ['Strengths', coach.strengths],
              ['Gaps to address', coach.gaps],
              ['Recommended actions', coach.actions],
            ]
              .filter(([, items]) => items?.length)
              .map(([label, items]) => `<h4>${escapeHTML(label)}</h4><ul>${items.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul>`)
              .join('')}
            ${
              coach.bullet_rewrites?.length
                ? `<h4>Suggested bullet rewrites</h4>${coach.bullet_rewrites
                    .map(
                      b => `
                  <div class="coach-rewrite">
                    <div><strong>Original:</strong> ${escapeHTML(b.original || '')}</div>
                    <div><strong>Suggestion:</strong> ${escapeHTML(b.rewrite || '')}</div>
                    ${b.evidence_note ? `<div style="margin-top:4px;color:var(--muted)">${escapeHTML(b.evidence_note)}</div>` : ''}
                  </div>`
                    )
                    .join('')}`
                : ''
            }
          </div>`
        : `
          <div class="card coach-card">
            <div class="coach-card-head">
              <h3>AI Resume Coach</h3>
              ${badgeHTML(store.aiEnabled ? 'AI ready' : 'Optional', store.aiEnabled ? 'match' : 'subtle')}
            </div>
            <p>${
              store.aiEnabled
                ? 'Get grounded strengths, gaps, and bullet rewrites tailored to this job description (contact details are redacted before sending).'
                : 'Local ATS scoring works offline. Configure a Gemini or OpenAI key in .env to enable AI resume coaching.'
            }</p>
            ${
              store.aiEnabled
                ? `<div style="margin-top:12px">
                    <button type="button" class="btn btn-outline btn-sm" id="run-coach-btn" ${az.coachBusy ? 'disabled' : ''}>
                      ${icon('sparkles', 14)} ${az.coachBusy ? 'Reviewing resume...' : 'Get AI resume feedback'}
                    </button>
                  </div>`
                : ''
            }
          </div>`;

      right.innerHTML = `
        <div class="card analysis-result">
          <div class="analysis-top">
            <div>
              <div class="eyebrow">YOUR ATS OVERVIEW</div>
              <h2>Resume insights</h2>
            </div>
            <div class="ats-score">
              <strong>${Math.round(s.overall)}</strong>
              <small>ATS score</small>
            </div>
          </div>

          ${
            sec.injection || sec.hidden_text
              ? `<div style="margin-top:12px">${badgeHTML('Hidden text or prompt-like pattern flagged during scan', 'warning')}</div>`
              : ''
          }

          <div class="score-items">
            ${[
              ['Keyword match', s.keyword_match],
              ['Section completeness', s.section_completeness],
              ['Readability', s.readability],
            ]
              .map(
                ([label, val]) => `
              <div>
                <span>${escapeHTML(label)}</span>
                <strong>${Math.round(val)}%</strong>
                ${progressHTML(val)}
              </div>`
              )
              .join('')}
          </div>

          <div class="keyword-box">
            <strong>Keywords to consider</strong>
            ${
              s.missing_keywords?.length
                ? `<div class="keyword-chips">${s.missing_keywords.map(kw => `<span class="keyword-chip">${escapeHTML(kw)}</span>`).join('')}</div>`
                : '<p style="margin:0;font-size:12.5px;color:var(--muted)">No major keyword gaps found.</p>'
            }
          </div>

          ${
            s.matched_keywords?.length
              ? `<div class="keyword-box">
                  <strong>Matched keywords</strong>
                  <div class="keyword-chips">${s.matched_keywords.slice(0, 18).map(kw => `<span class="keyword-chip">${escapeHTML(kw)}</span>`).join('')}</div>
                </div>`
              : ''
          }

          ${(s.suggestions || []).map(item => `<p class="suggestion-line">${icon('lightbulb', 15)} ${escapeHTML(item)}</p>`).join('')}
        </div>
        ${coachBlock}
      `;

      right.querySelector('#run-coach-btn')?.addEventListener('click', runCoach);
    } else if (az.result?.resume) {
      const words = az.result.resume.raw_text?.trim().split(/\s+/).filter(Boolean).length || 0;
      right.innerHTML = `
        <div class="card analysis-result">
          <div class="analysis-top">
            <div>
              <div class="eyebrow">PARSED SUCCESSFULLY</div>
              <h2>Structure looks clean</h2>
            </div>
            ${badgeHTML('Ready', 'positive')}
          </div>
          <p style="margin-top:12px;color:var(--muted);font-size:13px">
            We extracted <strong>${words} words</strong> from your resume. Paste a target job description on the left and re-run to calculate your full ATS match score and missing keywords.
          </p>
        </div>
      `;
    } else {
      right.innerHTML = `
        <div class="card analyzer-empty">
          <span class="empty-art">${icon('file-check-2', 28)} ${icon('sparkles', 14)}</span>
          <h3>A clearer picture starts here.</h3>
          <p>Upload your resume to see an actionable overview of your structure, readability, and role fit.</p>
          <div>
            <span>${icon('check-circle-2', 15)} ATS readability check</span>
            <span>${icon('check-circle-2', 15)} Keyword gap opportunities</span>
            <span>${icon('check-circle-2', 15)} Practical, grounded suggestions</span>
          </div>
        </div>
      `;
    }
  }

  async function runCoach() {
    if (!az.result?.resume?.raw_text || !az.description.trim()) return;
    az.coachBusy = true;
    renderResultsPanel();
    try {
      az.coachResult = await api('/api/resume/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: az.result.resume.raw_text, job_description: az.description }),
      });
      ctx.notify('AI resume feedback ready.');
    } catch (err) {
      ctx.notify(err.message);
    } finally {
      az.coachBusy = false;
      renderResultsPanel();
    }
  }

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'RESUME HEALTH CHECK',
      title: 'Make every word count.',
      description: 'Get a practical review of your resume structure, ATS readability, and role alignment.',
    })}

    <div class="analyzer-grid">
      <form class="card analyzer-form" id="analyzer-form">
        <h2>Start your resume review</h2>
        <p>Your resume is parsed and scored locally in this workspace.</p>

        <label class="upload-drop" id="upload-drop">
          <input type="file" id="analyzer-file" accept=".pdf,.docx,.txt" />
          <span class="upload-round">${icon('upload', 19)}</span>
          <strong id="analyzer-file-title">${escapeHTML(az.file ? az.file.name : 'Drop your resume here')}</strong>
          <small id="analyzer-file-meta">${
            az.file
              ? `${Math.max(1, Math.round(az.file.size / 1024))} KB · Ready for review`
              : 'or browse files · PDF, DOCX, TXT · up to 12 MB'
          }</small>
        </label>

        <label class="field-label">
          <div class="field-label-row">Target job description <span>OPTIONAL</span></div>
          <textarea id="analyzer-jd" rows="7" placeholder="Paste a job description to unlock a role-specific ATS match score and missing keyword highlights.">${escapeHTML(az.description)}</textarea>
        </label>

        <div class="privacy-line">
          ${icon('shield-check', 15)} Resume contents stay on your computer during local analysis.
        </div>

        <button type="submit" class="btn btn-primary" id="analyzer-submit">
          ${icon('sparkles', 15)} Analyze my resume ${icon('arrow-right', 15)}
        </button>
      </form>

      <div class="analyzer-right">
        <div id="analyzer-results-slot"></div>
        <div class="analysis-trust">
          <span>${icon('shield-check', 16)}</span>
          <div>
            <strong>Thoughtful by design</strong>
            <p>Use every suggestion as a starting point. Your resume should always reflect your real experience.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  renderResultsPanel();

  const fileInput = root.querySelector('#analyzer-file');
  const dropZone = root.querySelector('#upload-drop');
  const updateFileDisplay = file => {
    az.file = file || null;
    const titleEl = root.querySelector('#analyzer-file-title');
    const metaEl = root.querySelector('#analyzer-file-meta');
    if (titleEl) titleEl.textContent = az.file ? az.file.name : 'Drop your resume here';
    if (metaEl) {
      metaEl.textContent = az.file
        ? `${Math.max(1, Math.round(az.file.size / 1024))} KB · Ready for review`
        : 'or browse files · PDF, DOCX, TXT · up to 12 MB';
    }
  };

  fileInput?.addEventListener('change', e => updateFileDisplay(e.target.files?.[0]));
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragging');
  });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) updateFileDisplay(dropped);
  });

  root.querySelector('#analyzer-jd')?.addEventListener('input', e => {
    az.description = e.target.value;
  });

  root.querySelector('#analyzer-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!az.file) return ctx.notify('Choose a resume file to analyze.');
    const submitBtn = root.querySelector('#analyzer-submit');
    az.busy = true;
    az.coachResult = null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Analyzing your resume...';
    }
    try {
      const form = new FormData();
      form.append('resume', az.file);
      form.append('job_description', az.description);
      az.result = await api('/api/resume/analyze', { method: 'POST', body: form });
      renderResultsPanel();
      ctx.notify('Resume analysis complete.');
    } catch (err) {
      ctx.notify(err.message);
    } finally {
      az.busy = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('sparkles', 15)} Analyze my resume ${icon('arrow-right', 15)}`;
      }
    }
  });
}

export function renderJobs(root, ctx) {
  const { store } = ctx;

  function renderJobList() {
    const visible = store.jobs.filter(job => {
      if (store.jobFilter === 'Remote only') return /remote/i.test(job.location || '');
      if (store.jobFilter === 'Saved') return store.savedJobs.includes(job.title);
      return true;
    });

    const countEl = root.querySelector('#jobs-visible-count');
    if (countEl) countEl.textContent = String(visible.length);

    const listEl = root.querySelector('#jobs-list');
    if (!listEl) return;

    if (!visible.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          ${icon('search', 28)}
          <h3>No matches for those filters</h3>
          <p>Try broadening your search or switching back to all matches.</p>
          <button type="button" class="btn btn-outline" id="clear-job-filter">Clear filters</button>
        </div>
      `;
      listEl.querySelector('#clear-job-filter')?.addEventListener('click', () => {
        store.jobFilter = 'All matches';
        renderJobs(root, ctx);
      });
      return;
    }

    listEl.innerHTML = visible
      .map((job, idx) => {
        const isSaved = store.savedJobs.includes(job.title);
        const suspicious = job.safety && (job.safety.risk_level === 'high' || job.safety.flags?.length > 0);
        const tags = job.tags?.length ? job.tags : ['Product design', 'Figma', 'Design systems'];
        const url = safeURL(job.url);
        return `
          <article class="job-card" data-job-idx="${idx}">
            <div class="company-mark ${escapeHTML(job.tone || '')}">${escapeHTML(job.mark || (job.company || '?')[0])}</div>
            <div class="job-main">
              <div class="job-heading">
                <div>
                  <div class="job-titleline">
                    <h3>${escapeHTML(job.title)}</h3>
                    ${badgeHTML(`${icon('sparkles', 11)} ${job.match}% match`, 'match')}
                    ${suspicious ? badgeHTML('Review listing details', 'warning') : ''}
                  </div>
                  <p>${escapeHTML(job.company)} <span>·</span> ${escapeHTML(job.location)}</p>
                </div>
                <button type="button" class="save-btn${isSaved ? ' is-saved' : ''}" data-save-title="${escapeHTML(job.title)}" aria-label="${isSaved ? 'Unsave job' : 'Save job'}">
                  ${icon('bookmark', 17, { fill: isSaved ? 'currentColor' : 'none' })}
                </button>
              </div>
              <div class="job-facts">
                <span>${icon('briefcase-business', 14)} ${escapeHTML(job.exp || 'Experience varies')}</span>
                <span>${icon('trending-up', 14)} ${escapeHTML(job.salary || 'Salary not listed')}</span>
                <span>${icon('clock-3', 14)} ${escapeHTML(job.posted || 'Recently posted')}</span>
              </div>
              <div class="job-tags">${tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div>
              ${
                suspicious
                  ? `<div class="job-safety-note">Signals to verify: ${escapeHTML((job.safety.flags || []).join(', '))}. ${escapeHTML(job.safety.recommendation || '')}</div>`
                  : ''
              }
              <div class="job-card-bottom">
                <span><span class="fit-dot"></span> Strong fit for your experience</span>
                <div>
                  <button type="button" class="btn btn-subtle btn-sm" data-track-idx="${idx}">Save to tracker</button>
                  <button type="button" class="btn btn-primary btn-sm" data-open-url="${escapeHTML(url)}">View role ${icon('external-link', 13)}</button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-save-title]').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.saveTitle;
        const exists = store.savedJobs.includes(title);
        store.savedJobs = exists ? store.savedJobs.filter(x => x !== title) : [...store.savedJobs, title];
        saveJSON('northstar.savedJobs', store.savedJobs);
        ctx.notify(exists ? 'Removed from saved roles.' : 'Saved role for later.');
        renderJobList();
      });
    });

    listEl.querySelectorAll('[data-track-idx]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const job = visible[Number(btn.dataset.trackIdx)];
        if (!job) return;
        try {
          const data = await api('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: job.title,
              company: job.company,
              status: 'Saved',
              notes: 'Added from recommendations',
            }),
          });
          store.applications = data.applications || [];
          ctx.notify('Added to your application tracker.');
        } catch (err) {
          ctx.notify(err.message);
        }
      });
    });

    listEl.querySelectorAll('[data-open-url]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.openUrl;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        else ctx.notify('This sample role has no live posting link.');
      });
    });
  }

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'FIND YOUR NEXT OPPORTUNITY',
      title: 'Roles that feel like you.',
      description: 'Thoughtful matches, shaped around your skills, goals, and what matters to you.',
      actionHTML: `<button type="button" class="btn btn-outline" id="jobs-reset-btn">${icon('sliders-horizontal', 15)} Reset matches</button>`,
    })}

    <div class="jobs-search card">
      <form id="jobs-search-form">
        <label>
          ${icon('search', 17)}
          <input id="jobs-query" value="${escapeHTML(store.jobQuery)}" placeholder="Job title, skill, or company" />
        </label>
        <span class="search-separator"></span>
        <label>
          ${icon('target', 17)}
          <input id="jobs-location" value="${escapeHTML(store.jobLocation)}" placeholder="Location or remote" />
        </label>
        <button type="submit" class="btn btn-primary" id="jobs-submit-btn">
          Find roles ${icon('arrow-right', 15)}
        </button>
      </form>
      <div class="search-foot">
        <span>${icon('sparkles', 13)} Personalized for your profile</span>
        <span>Live search & safety scan enabled</span>
      </div>
    </div>

    <div class="jobs-toolbar">
      <div>
        <h2>Top matches ${badgeHTML('0', 'subtle').replace('>0<', ' id="jobs-visible-count">0<')}</h2>
        <p>Sorted by how well each role fits your profile</p>
      </div>
      <div class="filter-pills">
        ${['All matches', 'Remote only', 'Saved']
          .map(tab => `<button type="button" class="filter-pill${store.jobFilter === tab ? ' active' : ''}" data-job-filter="${tab}">${tab}</button>`)
          .join('')}
      </div>
    </div>

    <div class="jobs-list" id="jobs-list"></div>
  `;

  renderJobList();

  root.querySelector('#jobs-reset-btn')?.addEventListener('click', () => {
    store.jobs = [...JOBS_SEED];
    store.jobFilter = 'All matches';
    ctx.updateNavCounts();
    renderJobs(root, ctx);
    ctx.notify('Restored curated role recommendations.');
  });

  root.querySelectorAll('[data-job-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      store.jobFilter = pill.dataset.jobFilter;
      root.querySelectorAll('[data-job-filter]').forEach(p => p.classList.toggle('active', p === pill));
      renderJobList();
    });
  });

  root.querySelector('#jobs-query')?.addEventListener('input', e => {
    store.jobQuery = e.target.value;
  });
  root.querySelector('#jobs-location')?.addEventListener('input', e => {
    store.jobLocation = e.target.value;
  });

  root.querySelector('#jobs-search-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = root.querySelector('#jobs-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Searching...';
    }
    try {
      const data = await api('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: store.jobQuery, location: store.jobLocation }),
      });
      if (data.jobs?.length) {
        store.jobs = data.jobs.map((j, i) => ({
          title: j.title,
          company: j.company,
          location: j.location || 'Location not listed',
          salary: 'Salary not listed',
          exp: 'Experience varies',
          match: Math.max(76, 94 - i * 4),
          tone: ['purple', 'dark', 'black'][i % 3],
          mark: (j.company || '?')[0].toUpperCase(),
          tags: [],
          posted: 'Recently posted',
          ...j,
        }));
        ctx.notify(`Found ${data.jobs.length} matching roles.`);
      } else {
        store.jobs = [];
        ctx.notify('No roles matched that search.');
      }
      ctx.updateNavCounts();
      renderJobList();
    } catch (err) {
      ctx.notify(`${err.message} Showing curated matches instead.`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Find roles ${icon('arrow-right', 15)}`;
      }
    }
  });
}

export function renderSkills(root, ctx) {
  const { store } = ctx;
  const targetRole = store.skillsTargetRole;
  const current = ROLE_PROFILES[targetRole] || ROLE_PROFILES['Senior Product Designer'];

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'YOUR SKILLS, YOUR NEXT CHAPTER',
      title: 'See the path between here and there.',
      description: 'Understand what you already bring, and which skills can open new doors.',
      actionHTML: `
        <div style="display:flex;gap:8px;align-items:center">
          <select class="date-select" id="skills-role-select" style="padding-left:12px" aria-label="Target role">
            ${Object.keys(ROLE_PROFILES)
              .map(r => `<option${r === targetRole ? ' selected' : ''}>${escapeHTML(r)}</option>`)
              .join('')}
          </select>
          <button type="button" class="btn btn-outline" id="export-skills-btn">${icon('download', 15)} Export analysis</button>
        </div>
      `,
    })}

    <div class="skill-summary-grid">
      <div class="card skill-summary">
        <span class="metric-icon blue">${icon('target', 18)}</span>
        <div>
          <small>YOUR CURRENT MATCH</small>
          <strong>${current.match}%</strong>
          <span>for ${escapeHTML(targetRole)}</span>
        </div>
      </div>
      <div class="card skill-summary">
        <span class="metric-icon violet">${icon('zap', 18)}</span>
        <div>
          <small>SKILLS YOU BRING</small>
          <strong>${current.haveCount} <em>of ${current.totalCount}</em></strong>
          <span>core skills already demonstrated</span>
        </div>
      </div>
      <div class="card skill-summary">
        <span class="metric-icon cyan">${icon('trending-up', 18)}</span>
        <div>
          <small>YOUR NEXT OPPORTUNITY</small>
          <strong>${current.gapCount} skills</strong>
          <span>could strengthen your match</span>
        </div>
      </div>
    </div>

    <div class="skills-analysis-grid">
      <div class="card skill-comparison">
        ${sectionTitleHTML({
          eyebrow: 'SKILLS BREAKDOWN',
          title: 'Where you stand',
          description: 'Your experience compared with what the role is looking for.',
          actionHTML: badgeHTML(escapeHTML(targetRole), 'subtle'),
        })}
        <div class="chart-legend">
          <span><i class="legend-you"></i> Your level</span>
          <span><i class="legend-role"></i> Role requirement</span>
        </div>
        <div class="comparison-list">
          ${current.skills
            .map(
              ([name, val, have]) => `
            <div class="comparison-row">
              <div>
                <strong>${escapeHTML(name)}</strong>
                <span class="${have ? 'skill-have' : 'skill-gap'}">${have ? 'In your toolkit' : 'Growth opportunity'}</span>
              </div>
              <div class="comparison-bars">
                <div><i style="width:${val}%"></i></div>
                <span>${val}%</span>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <aside class="card gap-card">
        <div class="eyebrow">A GOOD NEXT STEP</div>
        <span class="gap-icon">${icon('lightbulb', 20)}</span>
        <h3>${escapeHTML(current.focus)}</h3>
        ${badgeHTML('High impact skill', 'warning')}
        <p>${escapeHTML(current.focusCopy)}</p>
        <div class="gap-resource">
          ${icon('book-open', 16)}
          <span>
            <strong>${escapeHTML(current.course)}</strong>
            <small>${escapeHTML(current.courseMeta)}</small>
          </span>
          ${icon('arrow-up-right', 15)}
        </div>
        <button type="button" class="btn btn-primary" id="add-skill-roadmap-btn">
          Add to my roadmap ${icon('arrow-right', 14)}
        </button>
      </aside>
    </div>

    <div class="card roadmap-inline">
      <div>
        <span class="roadmap-icon">${icon('graduation-cap', 19)}</span>
        <span>
          <strong>Your personalized learning roadmap</strong>
          <small>3 focused weeks · Design systems → Data-informed design → Leadership</small>
        </span>
      </div>
      <button type="button" class="btn btn-outline btn-sm" data-go="Learning Roadmap">View roadmap ${icon('arrow-right', 14)}</button>
    </div>
  `;

  root.querySelector('#skills-role-select')?.addEventListener('change', e => {
    store.skillsTargetRole = e.target.value;
    renderSkills(root, ctx);
  });

  root.querySelector('#export-skills-btn')?.addEventListener('click', () => {
    const lines = [
      `Northstar Skill Gap Analysis — ${targetRole}`,
      `Overall match: ${current.match}% (${current.haveCount} of ${current.totalCount} core skills)`,
      '',
      ...current.skills.map(([name, val, have]) => `- ${name}: ${val}% (${have ? 'In your toolkit' : 'Growth opportunity'})`),
      '',
      `Recommended next focus: ${current.focus}`,
    ].join('\n');
    downloadText('skill-gap-analysis.txt', lines);
    ctx.notify('Exported skill gap summary.');
  });

  root.querySelector('#add-skill-roadmap-btn')?.addEventListener('click', () => {
    ctx.notify(`Added ${current.focus} to your learning roadmap.`);
    ctx.go('Learning Roadmap');
  });
}

export function renderInterview(root, ctx) {
  const { store } = ctx;
  const iv = store.interview;

  function feedbackHTML(fb) {
    if (!fb) return '';
    const display = fb.ai_review || fb;
    const score = display.score ?? fb.score ?? 82;
    const text = display.feedback || fb.feedback || 'Add a specific outcome to make the impact of your work easier to picture.';
    const strengths = display.strengths || [];
    const improvements = display.improvements || [];
    const followUp = display.example_follow_up;
    return `
      <div class="feedback-box">
        <div class="feedback-score">
          <strong>${escapeHTML(score)}</strong>
          <small>Score</small>
        </div>
        <div>
          <strong>A thoughtful next step</strong>
          <p>${escapeHTML(text)}</p>
          ${strengths.length ? `<p style="margin-top:8px"><strong>What worked</strong></p><ul>${strengths.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul>` : ''}
          ${improvements.length ? `<p style="margin-top:8px"><strong>Try next</strong></p><ul>${improvements.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul>` : ''}
          ${followUp ? `<p style="margin-top:8px"><strong>Follow-up:</strong> ${escapeHTML(followUp)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function renderMainPanel() {
    const main = root.querySelector('#interview-main');
    if (!main) return;

    if (iv.questions.length) {
      main.innerHTML = `
        <div class="question-list">
          <div class="question-intro">
            <div>
              <div class="eyebrow">YOUR PRACTICE ROUND</div>
              <h2>Let’s find your flow.</h2>
              <p>${iv.questions.length} questions · ${escapeHTML(iv.role)}</p>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="interview-reset-btn">Reset round</button>
          </div>
          ${iv.questions
            .map(
              (q, i) => `
            <article class="card interview-question" data-q-index="${i}">
              <div class="question-meta">
                <span>QUESTION ${String(i + 1).padStart(2, '0')}</span>
                ${badgeHTML(escapeHTML(q.category || 'Behavioral'), 'subtle')}
              </div>
              <h3>${escapeHTML(q.question)}</h3>
              <textarea rows="4" id="answer-${i}" placeholder="Take a breath, then share a real example using Situation, Action, and Outcome...">${escapeHTML(iv.answers[i] || '')}</textarea>
              <div class="answer-footer">
                <span id="char-count-${i}">${(iv.answers[i] || '').length} characters · No rush</span>
                <button type="button" class="btn btn-outline btn-sm" data-review-btn="${i}">
                  Get thoughtful feedback ${icon('arrow-right', 14)}
                </button>
              </div>
              <div id="feedback-slot-${i}">${feedbackHTML(iv.feedbacks[i])}</div>
            </article>`
            )
            .join('')}
        </div>
      `;

      main.querySelector('#interview-reset-btn')?.addEventListener('click', () => {
        iv.questions = [];
        iv.answers = {};
        iv.feedbacks = {};
        renderMainPanel();
      });

      iv.questions.forEach((q, i) => {
        const textarea = main.querySelector(`#answer-${i}`);
        const counter = main.querySelector(`#char-count-${i}`);
        const reviewBtn = main.querySelector(`[data-review-btn="${i}"]`);
        const slot = main.querySelector(`#feedback-slot-${i}`);

        textarea?.addEventListener('input', () => {
          iv.answers[i] = textarea.value;
          if (counter) counter.textContent = `${textarea.value.length} characters · No rush`;
        });

        reviewBtn?.addEventListener('click', async () => {
          const answer = (iv.answers[i] || '').trim();
          if (!answer) return ctx.notify('Add a few thoughts before getting feedback.');
          reviewBtn.disabled = true;
          reviewBtn.textContent = 'Reviewing...';
          try {
            const data = await api('/api/interview/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ answer, role: iv.role, question: q.question }),
            });
            iv.feedbacks[i] = data;
            if (slot) slot.innerHTML = feedbackHTML(data);
          } catch (err) {
            ctx.notify(err.message);
          } finally {
            reviewBtn.disabled = false;
            reviewBtn.innerHTML = `Get thoughtful feedback ${icon('arrow-right', 14)}`;
          }
        });
      });
    } else {
      main.innerHTML = `
        <div class="card interview-stats">
          <div class="eyebrow">YOUR PRACTICE, OVER TIME</div>
          <h3>Confidence comes with practice.</h3>
          <p>Every round helps you find clearer ways to tell your story.</p>
          <div class="practice-chart">
            <div class="chart-labels"><span>100</span><span>75</span><span>50</span><span>25</span></div>
            <svg viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="interviewAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4f5ee8" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#4f5ee8" stop-opacity="0.01" />
                </linearGradient>
              </defs>
              <path class="chart-gridline" d="M0 10H500M0 48H500M0 86H500M0 124H500" />
              <path class="chart-area" d="M0 123 C40 110 55 118 85 91 S140 104 175 73 S225 88 260 58 S310 75 340 47 S395 66 420 35 S466 42 500 16 V150 H0Z" />
              <path class="chart-line" d="M0 123 C40 110 55 118 85 91 S140 104 175 73 S225 88 260 58 S310 75 340 47 S395 66 420 35 S466 42 500 16" />
            </svg>
            <div class="chart-months"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>This week</span></div>
          </div>
          <div class="chart-stats">
            <div><strong>82<span>%</span></strong><small>Average feedback score</small></div>
            <div><strong>6</strong><small>Rounds completed</small></div>
            <div><strong>+14<span>%</span></strong><small>Growth this month</small></div>
          </div>
        </div>
        <div class="card interview-tip">
          <span class="tip-icon">${icon('lightbulb', 16)}</span>
          <div>
            <strong>A helpful reminder</strong>
            <p>Strong answers share the situation, your specific actions, and the outcome. Let the story show what you learned.</p>
          </div>
        </div>
      `;
    }
  }

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'PRACTICE WITH PRESENCE',
      title: 'Show up as your best self.',
      description: 'A little practice goes a long way. Find your rhythm before the big day.',
      actionHTML: badgeHTML('<span class="online-dot"></span> Your practice space', 'positive'),
    })}

    <div class="interview-layout">
      <form class="card interview-setup" id="interview-setup-form">
        <div class="interview-illustration">
          ${icon('mic-2', 26)}
          <span class="soundwave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        </div>
        <div class="eyebrow">LET’S MAKE IT FEEL REAL</div>
        <h2>Set up a practice round</h2>
        <p>Choose the role you’re preparing for and we’ll create tailored questions to get you started.</p>
        <label>
          Role or position
          <input id="iv-role" value="${escapeHTML(iv.role)}" />
        </label>
        <label>
          Practice style
          <select id="iv-style">
            <option${iv.style === 'Mix of behavioral & role-specific' ? ' selected' : ''}>Mix of behavioral & role-specific</option>
            <option${iv.style === 'Behavioral questions' ? ' selected' : ''}>Behavioral questions</option>
            <option${iv.style === 'Role-specific questions' ? ' selected' : ''}>Role-specific questions</option>
          </select>
        </label>
        <label>
          Questions per round
          <select id="iv-count">
            <option value="3"${iv.count === '3' ? ' selected' : ''}>3 questions · about 10 min</option>
            <option value="1"${iv.count === '1' ? ' selected' : ''}>1 question · about 5 min</option>
            <option value="5"${iv.count === '5' ? ' selected' : ''}>5 questions · about 20 min</option>
          </select>
        </label>
        <button type="submit" class="btn btn-primary" id="iv-start-btn">
          Start a practice round ${icon('arrow-right', 15)}
        </button>
        <div class="interview-private">${icon('shield-check', 14)} Practice privately, at your own pace</div>
      </form>

      <div class="interview-main" id="interview-main"></div>
    </div>
  `;

  renderMainPanel();

  root.querySelector('#iv-role')?.addEventListener('input', e => {
    iv.role = e.target.value;
  });
  root.querySelector('#iv-style')?.addEventListener('change', e => {
    iv.style = e.target.value;
  });
  root.querySelector('#iv-count')?.addEventListener('change', e => {
    iv.count = e.target.value;
  });

  root.querySelector('#interview-setup-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = root.querySelector('#iv-start-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Preparing questions...';
    }
    try {
      const data = await api('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: iv.role, count: iv.count }),
      });
      iv.questions = data.questions || [];
      iv.answers = {};
      iv.feedbacks = {};
      renderMainPanel();
      ctx.notify(`Prepared ${iv.questions.length} practice questions for ${iv.role}.`);
    } catch (err) {
      ctx.notify(err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Start a practice round ${icon('arrow-right', 15)}`;
      }
    }
  });
}

export function renderRoadmap(root, ctx) {
  const { store } = ctx;
  const totalSteps = ROADMAP_WEEKS.reduce((sum, w) => sum + w.items.length, 0);
  const doneCount = store.roadmapDone.length;

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'YOUR PERSONAL LEARNING PLAN',
      title: 'A path that moves with you.',
      description: 'Small, intentional steps designed around where you want to go.',
      actionHTML: `<button type="button" class="btn btn-outline" id="roadmap-export-btn">${icon('download', 15)} Export plan</button>`,
    })}

    <div class="roadmap-overview card">
      <div>
        <span class="roadmap-icon big">${icon('graduation-cap', 22)}</span>
        <div>
          <div class="eyebrow">YOUR 3-WEEK GROWTH PLAN</div>
          <h2>Ready for your next chapter.</h2>
          <p>Designed to help you grow into a product design leader, one focused session at a time.</p>
        </div>
      </div>
      <div class="roadmap-progress">
        <strong>${doneCount} <small>of ${totalSteps} steps</small></strong>
        ${progressHTML((doneCount / totalSteps) * 100)}
        <span>${doneCount === totalSteps ? 'Roadmap complete!' : "You're making steady progress"}</span>
      </div>
    </div>

    <div class="roadmap-weeks">
      ${ROADMAP_WEEKS.map((week, wi) => {
        const weekIndices = week.items.map((_, ii) => wi * 3 + ii);
        const completedInWeek = weekIndices.filter(idx => store.roadmapDone.includes(idx)).length;
        const badgeTone = completedInWeek === week.items.length ? 'positive' : completedInWeek > 0 ? 'match' : 'subtle';
        const badgeLabel = completedInWeek === week.items.length ? 'Completed' : completedInWeek > 0 ? 'In progress' : 'Up next';
        return `
          <section class="card roadmap-week">
            <div class="week-number">0${wi + 1}</div>
            <div class="week-content">
              <div class="week-head">
                <div>
                  <div class="eyebrow">${escapeHTML(week.duration)}</div>
                  <h2>${escapeHTML(week.title)}</h2>
                </div>
                ${badgeHTML(badgeLabel, badgeTone)}
              </div>
              ${week.items
                .map((item, ii) => {
                  const idx = wi * 3 + ii;
                  const isDone = store.roadmapDone.includes(idx);
                  const dur = ii === 0 ? '45 min' : ii === 1 ? '60 min' : '30 min';
                  return `
                  <button type="button" class="roadmap-step${isDone ? ' is-done' : ''}" data-step-idx="${idx}">
                    <span class="roadmap-check${isDone ? ' checked' : ''}">${isDone ? icon('check', 12) : ''}</span>
                    <span>${escapeHTML(item)}</span>
                    <small>${dur}</small>
                  </button>`;
                })
                .join('')}
            </div>
          </section>
        `;
      }).join('')}
    </div>
  `;

  root.querySelectorAll('[data-step-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.stepIdx);
      store.roadmapDone = store.roadmapDone.includes(idx)
        ? store.roadmapDone.filter(x => x !== idx)
        : [...store.roadmapDone, idx];
      saveJSON('northstar.roadmapDone', store.roadmapDone);
      renderRoadmap(root, ctx);
    });
  });

  root.querySelector('#roadmap-export-btn')?.addEventListener('click', () => {
    const lines = [
      'Northstar 3-Week Learning Roadmap',
      `Progress: ${store.roadmapDone.length} of ${totalSteps} steps completed`,
      '',
      ...ROADMAP_WEEKS.flatMap((w, wi) => [
        `${w.title} (${w.duration})`,
        ...w.items.map((item, ii) => `  [${store.roadmapDone.includes(wi * 3 + ii) ? 'x' : ' '}] ${item}`),
        '',
      ]),
    ].join('\n');
    downloadText('learning-roadmap.txt', lines);
    ctx.notify('Exported learning roadmap.');
  });
}

export function renderTracker(root, ctx) {
  const { store } = ctx;
  const counts = ['Saved', 'Applied', 'Interview', 'Offer'].map(x => [
    x,
    store.applications.filter(a => a.status === x).length,
  ]);
  const visibleApps =
    store.trackerFilter === 'All' ? store.applications : store.applications.filter(a => a.status === store.trackerFilter);

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'YOUR JOB SEARCH, ORGANIZED',
      title: 'Keep every next step in sight.',
      description: 'A calm place to keep track of opportunities and follow-ups.',
      actionHTML: `<button type="button" class="btn btn-primary" id="tracker-focus-add">${icon('plus', 15)} Add application</button>`,
    })}

    <div class="tracker-stats">
      ${counts
        .map(
          ([x, n]) => `
        <div class="card tracker-stat">
          <small>${x.toUpperCase()}</small>
          <strong>${n}</strong>
          <span><i class="status-dot"></i> applications</span>
        </div>`
        )
        .join('')}
    </div>

    <div class="card tracker-form-card">
      <div>
        <div class="eyebrow">CAPTURE THE MOMENT</div>
        <h2>Add an opportunity</h2>
        <p>Save it now, add details as you go.</p>
      </div>
      <form id="tracker-add-form">
        <input id="add-app-title" required placeholder="Role title" />
        <input id="add-app-company" required placeholder="Company" />
        <select id="add-app-status">
          <option>Saved</option>
          <option selected>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button type="submit" class="btn btn-primary">Add ${icon('plus', 14)}</button>
      </form>
    </div>

    <div class="tracker-table-head">
      <div>
        <h2>Your opportunities</h2>
        <p>Everything you’re moving forward</p>
      </div>
      <div class="filter-pills">
        ${['All', 'Saved', 'Applied', 'Interview', 'Offer']
          .map(f => `<button type="button" class="filter-pill${store.trackerFilter === f ? ' active' : ''}" data-tracker-filter="${f}">${f}</button>`)
          .join('')}
      </div>
    </div>

    <div class="card tracker-table">
      ${
        visibleApps.length
          ? visibleApps
              .map((app, i) => {
                const tone =
                  app.status === 'Interview'
                    ? 'match'
                    : app.status === 'Offer'
                      ? 'positive'
                      : app.status === 'Rejected'
                        ? 'danger'
                        : 'subtle';
                return `
                  <div class="tracker-row">
                    <span class="company-mark ${['purple', 'dark', 'cyan'][i % 3]}">${escapeHTML((app.company || '?')[0].toUpperCase())}</span>
                    <span class="tracker-role">
                      <strong>${escapeHTML(app.title)}</strong>
                      <small>${escapeHTML(app.company)} · Added ${escapeHTML((app.created_at || 'Today').slice(0, 10))}</small>
                    </span>
                    ${badgeHTML(escapeHTML(app.status), tone)}
                    <span class="tracker-next">${escapeHTML(app.notes || 'Add a next step')}</span>
                    <button type="button" data-app-detail="${i}" aria-label="View application details">${icon('more-horizontal', 18)}</button>
                  </div>`;
              })
              .join('')
          : `<div class="empty-state">
              ${icon('clipboard-list', 28)}
              <h3>${store.applications.length ? 'No applications match this filter.' : 'Your tracker is ready.'}</h3>
              <p>${store.applications.length ? 'Switch back to All to see every tracked role.' : 'Add your first role above and keep the next step close.'}</p>
            </div>`
      }
    </div>
  `;

  root.querySelector('#tracker-focus-add')?.addEventListener('click', () => {
    root.querySelector('#add-app-title')?.focus();
  });

  root.querySelectorAll('[data-tracker-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      store.trackerFilter = pill.dataset.trackerFilter;
      renderTracker(root, ctx);
    });
  });

  root.querySelectorAll('[data-app-detail]').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = visibleApps[Number(btn.dataset.appDetail)];
      if (app) openApplicationModal(app, ctx);
    });
  });

  root.querySelector('#tracker-add-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const title = root.querySelector('#add-app-title')?.value || '';
    const company = root.querySelector('#add-app-company')?.value || '';
    const status = root.querySelector('#add-app-status')?.value || 'Applied';
    try {
      const data = await api('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, status, notes: '' }),
      });
      store.applications = data.applications || [];
      renderTracker(root, ctx);
      ctx.notify('Application added to your tracker.');
    } catch (err) {
      ctx.notify(err.message);
    }
  });
}

export function renderProfile(root, ctx) {
  const { store } = ctx;
  const p = store.profile;

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'YOUR CAREER, YOUR WAY',
      title: 'A little more about you.',
      description: 'The better we understand your goals, the more thoughtful your recommendations can be.',
      actionHTML: `<button type="button" class="btn btn-outline" id="profile-edit-btn">Edit profile ${icon('arrow-right', 14)}</button>`,
    })}

    <div class="profile-layout">
      <div class="card profile-card">
        ${avatarHTML(ctx.getInitials(), 'large')}
        <div class="profile-info">
          <h2>${escapeHTML(p.name)}</h2>
          <p>${escapeHTML(p.role)} · ${escapeHTML(p.location)}</p>
          ${badgeHTML(`${icon('check-circle-2', 12)} Profile 85% complete`, 'positive')}
        </div>

        <div class="profile-section">
          <div>
            <h3>Your career direction</h3>
            <p>What you’re working toward right now</p>
          </div>
          <div class="profile-value">
            ${icon('compass', 16)} ${escapeHTML(p.goal)}
            <button type="button" class="profile-inline-edit" aria-label="Edit career direction">${icon('arrow-right', 14)}</button>
          </div>
        </div>

        <div class="profile-section">
          <div>
            <h3>Experience</h3>
            <p>How far you’ve come</p>
          </div>
          <div class="profile-value">
            ${icon('briefcase-business', 16)} ${escapeHTML(p.experience)}
            <button type="button" class="profile-inline-edit" aria-label="Edit experience">${icon('arrow-right', 14)}</button>
          </div>
        </div>

        <div class="profile-section">
          <div>
            <h3>Work preferences</h3>
            <p>Where and how you do your best work</p>
          </div>
          <div class="profile-value">
            ${icon('target', 16)} ${escapeHTML(p.preference)}
            <button type="button" class="profile-inline-edit" aria-label="Edit preferences">${icon('arrow-right', 14)}</button>
          </div>
        </div>
      </div>

      <aside class="card profile-side">
        <div class="eyebrow">YOUR PROFILE AT A GLANCE</div>
        <h3>Your strengths tell a story.</h3>
        <p>Here are a few things we’ve learned about what you bring.</p>
        ${['Product thinking', 'Visual storytelling', 'Cross-functional leadership', 'User-centered design']
          .map(x => `<div class="strength-row">${icon('check-circle-2', 16)} ${escapeHTML(x)}</div>`)
          .join('')}
        <button type="button" class="text-link" data-go="Skill Gap Analysis">Review your skills ${icon('arrow-right', 14)}</button>
      </aside>
    </div>
  `;

  root.querySelector('#profile-edit-btn')?.addEventListener('click', () => openEditProfileModal(ctx));
  root.querySelectorAll('.profile-inline-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditProfileModal(ctx));
  });
}

export function renderSettings(root, ctx) {
  const { store } = ctx;
  const prefs = store.settings;

  function renderToggleRow(key, label, desc) {
    return `
      <label class="setting-row">
        <span>
          <strong>${escapeHTML(label)}</strong>
          <small>${escapeHTML(desc)}</small>
        </span>
        <span class="toggle-switch">
          <input type="checkbox" data-setting="${key}" ${prefs[key] ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </span>
      </label>
    `;
  }

  root.innerHTML = `
    ${pageHeaderHTML({
      eyebrow: 'YOUR SPACE, YOUR SETTINGS',
      title: 'Make Northstar yours.',
      description: 'A few simple ways to keep your workspace feeling right.',
    })}

    <div class="settings-grid">
      <section class="card settings-card">
        <div class="settings-icon">${icon('bell', 18)}</div>
        <h3>Notifications</h3>
        <p>Choose what deserves a gentle nudge.</p>
        ${renderToggleRow('weeklySummary', 'Weekly progress summary', 'A calm recap of the steps you’ve taken')}
        ${renderToggleRow('roleAlerts', 'New role matches', 'Let me know when great-fit roles appear')}
        ${renderToggleRow('learningReminders', 'Learning reminders', 'A nudge for your planned learning sessions')}
      </section>

      <section class="card settings-card">
        <div class="settings-icon violet-bg">${icon('shield-check', 18)}</div>
        <h3>Privacy & data</h3>
        <p>You’re in control of your career information.</p>
        ${renderToggleRow('localResume', 'Resume privacy', 'Analyze resume locally whenever possible')}
        ${renderToggleRow('personalizedMatches', 'Personalized suggestions', 'Use profile details to improve matches')}
        ${renderToggleRow('keepChatHistory', 'Conversation history', 'Keep a private record of your coach chats')}
      </section>

      <section class="card settings-card">
        <div class="settings-icon cyan-bg">${icon('user-round', 18)}</div>
        <h3>Account</h3>
        <p>Manage how you use your workspace.</p>
        <button type="button" class="settings-link" id="settings-edit-profile">Update your profile ${icon('arrow-right', 15)}</button>
        <button type="button" class="settings-link" id="settings-email-prefs">Email preferences ${icon('arrow-right', 15)}</button>
        <button type="button" class="settings-link" id="settings-shortcuts">Keyboard shortcuts & tips ${icon('arrow-right', 15)}</button>
        <button type="button" class="settings-link" id="settings-signout" style="color:var(--rose)">Sign out of workspace ${icon('log-out', 15)}</button>
      </section>
    </div>
  `;

  root.querySelectorAll('[data-setting]').forEach(input => {
    input.addEventListener('change', () => {
      const key = input.dataset.setting;
      store.settings[key] = input.checked;
      saveJSON('northstar.settings', store.settings);
      ctx.notify('Preferences saved.');
    });
  });

  root.querySelector('#settings-edit-profile')?.addEventListener('click', () => openEditProfileModal(ctx));
  root.querySelector('#settings-email-prefs')?.addEventListener('click', () => ctx.notify('Email preferences are up to date.'));
  root.querySelector('#settings-shortcuts')?.addEventListener('click', () => ctx.notify('Press "/" anytime to jump straight to any career tool.'));
  root.querySelector('#settings-signout')?.addEventListener('click', ctx.signOut);
}

export function openEditProfileModal(ctx) {
  const { store } = ctx;
  const p = store.profile;
  ctx.openModal({
    title: 'Edit career profile',
    bodyHTML: `
      <form class="modal-form" id="edit-profile-form">
        <label>Full name<input id="ep-name" value="${escapeHTML(p.name)}" required /></label>
        <label>Current or target role<input id="ep-role" value="${escapeHTML(p.role)}" required /></label>
        <label>Location<input id="ep-location" value="${escapeHTML(p.location)}" /></label>
        <label>Experience summary<input id="ep-exp" value="${escapeHTML(p.experience)}" /></label>
        <label>Work preference<input id="ep-pref" value="${escapeHTML(p.preference)}" /></label>
        <label>Career north star<textarea rows="3" id="ep-goal">${escapeHTML(p.goal)}</textarea></label>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="ep-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save changes</button>
        </div>
      </form>
    `,
    onMount(dialog, close) {
      dialog.querySelector('#ep-cancel')?.addEventListener('click', close);
      dialog.querySelector('#edit-profile-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const name = dialog.querySelector('#ep-name')?.value.trim();
        const role = dialog.querySelector('#ep-role')?.value.trim();
        if (!name || !role) return;
        store.profile = {
          name,
          role,
          location: dialog.querySelector('#ep-location')?.value.trim() || '',
          experience: dialog.querySelector('#ep-exp')?.value.trim() || '',
          preference: dialog.querySelector('#ep-pref')?.value.trim() || '',
          goal: dialog.querySelector('#ep-goal')?.value.trim() || '',
        };
        saveJSON('northstar.profile', store.profile);
        close();
        ctx.syncChrome();
        ctx.renderActivePage();
        ctx.notify('Profile updated.');
      });
    },
  });
}

function openApplicationModal(app, ctx) {
  ctx.openModal({
    title: app.title,
    bodyHTML: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="font-size:15px;color:var(--ink)">${escapeHTML(app.company)}</strong>
          ${badgeHTML(escapeHTML(app.status), app.status === 'Offer' ? 'positive' : 'match')}
        </div>
        <p style="margin:0;color:var(--muted);font-size:13.5px">Added ${escapeHTML((app.created_at || 'Today').slice(0, 10))}</p>
        <div style="padding:14px;border-radius:10px;background:var(--surface-subtle);border:1px solid var(--line-soft);font-size:13.5px;color:var(--ink-secondary)">
          ${escapeHTML(app.notes || 'No notes recorded yet.')}
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-primary" id="app-modal-close">Close</button>
        </div>
      </div>
    `,
    onMount(dialog, close) {
      dialog.querySelector('#app-modal-close')?.addEventListener('click', close);
    },
  });
}
