import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, Bell, BookOpen, Bookmark, BriefcaseBusiness,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Clock3, Compass,
  Download, ExternalLink, FileCheck2, FileText, Flame, Gauge, GraduationCap, LayoutDashboard,
  Lightbulb, Menu, MessageCircle, Mic2, MoreHorizontal, Plus, Printer, Search, Send, Settings,
  ShieldCheck, SlidersHorizontal, Sparkles, Target, TrendingUp, Upload, UserRound, WandSparkles, X, Zap
} from 'lucide-react'

const nav = [
  { label: 'Overview', icon: LayoutDashboard, section: 'WORKSPACE' },
  { label: 'AI Career Guidance', icon: Sparkles },
  { label: 'Resume Builder', icon: FileText, section: 'YOUR TOOLKIT' },
  { label: 'Resume Analyzer', icon: FileCheck2 },
  { label: 'Job Recommendations', icon: BriefcaseBusiness },
  { label: 'Skill Gap Analysis', icon: Target },
  { label: 'Interview Preparation', icon: Mic2 },
  { label: 'Learning Roadmap', icon: GraduationCap },
  { label: 'Application Tracker', icon: ClipboardList, section: 'YOUR ACTIVITY' },
  { label: 'Profile', icon: UserRound, section: 'PREFERENCES' },
  { label: 'Settings', icon: Settings },
]

const jobsSeed = [
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
]

const skillSeed = [
  { name: 'Product strategy', score: 86, color: 'blue' },
  { name: 'Figma & prototyping', score: 92, color: 'violet' },
  { name: 'User research', score: 74, color: 'cyan' },
  { name: 'Design systems', score: 68, color: 'orange' },
]

const defaultProfile = {
  name: 'Alex Morgan',
  role: 'Product Designer',
  location: 'San Francisco, CA',
  goal: 'Grow into a product design leader while staying close to the craft.',
  experience: '6+ years in product design',
  preference: 'Remote · Product-led teams',
}

const defaultTasks = [
  { id: 't1', done: true, title: 'Polish your portfolio case study', time: 'Completed yesterday' },
  { id: 't2', done: false, title: 'Practice your product design pitch', time: 'Today · 20 min' },
  { id: 't3', done: false, title: 'Review 3 new job matches', time: 'Tomorrow · 15 min' },
]

const defaultResume = {
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
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function loadArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function api(path, options = {}) {
  return fetch(path, options).then(async res => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
    return data
  })
}

function cx(...v) {
  return v.filter(Boolean).join(' ')
}

function getInitials(name = 'Alex Morgan') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || 'NS'
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase()
}

function downloadText(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function Avatar({ initials = 'AM', size = '' }) {
  return <span className={cx('avatar', size)}>{initials}</span>
}

function Badge({ children, tone = '' }) {
  return <span className={cx('badge', tone)}>{children}</span>
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

function Button({ children, variant = 'primary', size = '', icon: Icon, onClick, ...props }) {
  return (
    <button className={cx('btn', `btn-${variant}`, size && `btn-${size}`)} onClick={onClick} {...props}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}

function Progress({ value, color = 'blue' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="progress">
      <span className={`fill ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  )
}

function Modal({ title, onClose, wide = false, children }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={cx('modal-dialog', wide && 'modal-wide')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function App() {
  const [page, setPage] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(() => loadArray('northstar.savedJobs', []))
  const [jobs, setJobs] = useState(jobsSeed)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [profile, setProfile] = useState(() => loadJSON('northstar.profile', defaultProfile))
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [tasks, setTasks] = useState(() => loadArray('northstar.tasks', defaultTasks))

  const searchRef = useRef(null)
  const toastTimer = useRef(null)
  const initials = useMemo(() => getInitials(profile.name), [profile.name])

  const notify = message => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3200)
  }

  const go = name => {
    setPage(name)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    try {
      localStorage.setItem('northstar.profile', JSON.stringify(profile))
    } catch {}
  }, [profile])

  useEffect(() => {
    try {
      localStorage.setItem('northstar.savedJobs', JSON.stringify(saved))
    } catch {}
  }, [saved])

  useEffect(() => {
    try {
      localStorage.setItem('northstar.tasks', JSON.stringify(tasks))
    } catch {}
  }, [tasks])

  useEffect(() => {
    api('/api/tracker')
      .then(data => setApplications(data.applications || []))
      .catch(() => {})
    api('/api/status')
      .then(data => setAiEnabled(Boolean(data.ai_enabled)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onKey = e => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const runSearch = () => {
    const q = search.trim().toLowerCase()
    if (!q) return
    const match = nav.find(item => item.label.toLowerCase().includes(q))
    if (match) go(match.label)
    else if (/job|role|company|opportunit/.test(q)) go('Job Recommendations')
    else if (/resume|ats|cv/.test(q)) go('Resume Analyzer')
    else if (/skill|learn|course/.test(q)) go('Skill Gap Analysis')
    else if (/interview|practice/.test(q)) go('Interview Preparation')
    else if (/track|app/.test(q)) go('Application Tracker')
    else notify('No workspace section matched that search. Try a tool name or career topic.')
  }

  const toggleSave = job => {
    setSaved(current => {
      const exists = current.includes(job.title)
      notify(exists ? 'Removed from saved roles.' : 'Saved role for later.')
      return exists ? current.filter(x => x !== job.title) : [...current, job.title]
    })
  }

  const addApplication = async job => {
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
      })
      setApplications(data.applications || [])
      notify('Added to your application tracker.')
    } catch (error) {
      notify(error.message)
    }
  }

  if (page === 'Landing') return <Landing go={go} initials={initials} />

  return (
    <div className="app-shell">
      <aside className={cx('sidebar', mobileNav && 'open')}>
        <a
          className="brand"
          href="#home"
          onClick={e => {
            e.preventDefault()
            go('Landing')
          }}
        >
          <span className="brand-icon">
            <Compass size={20} strokeWidth={2.3} />
          </span>
          <span className="brand-name">
            northstar<span>CAREER STUDIO</span>
          </span>
          <button
            type="button"
            className="mobile-close"
            onClick={e => {
              e.stopPropagation()
              setMobileNav(false)
            }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </a>

        <button type="button" className="profile-switch" onClick={() => go('Profile')}>
          <Avatar initials={initials} />
          <span>
            <strong>{profile.name}</strong>
            <small>{profile.role}</small>
          </span>
          <ChevronDown size={15} />
        </button>

        <nav className="side-nav" aria-label="Primary navigation">
          {nav.map((item, index) => (
            <React.Fragment key={item.label}>
              {item.section && <div className={cx('nav-section', index > 0 && 'spaced')}>{item.section}</div>}
              <button
                type="button"
                className={cx('nav-item', page === item.label && 'selected')}
                onClick={() => go(item.label)}
              >
                <item.icon size={17} strokeWidth={1.85} />
                <span>{item.label}</span>
                {item.label === 'Job Recommendations' && <i className="nav-count">{jobs.length}</i>}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Zap size={16} fill="currentColor" />
            </div>
            <strong>Small steps, big moves.</strong>
            <p>You're building steady momentum this week.</p>
            <button type="button" onClick={() => go('Learning Roadmap')}>
              View your roadmap <ArrowRight size={13} />
            </button>
            <div className="tip-orb" />
          </div>
          <div className="sidebar-foot">
            <ShieldCheck size={14} /> Your career data stays yours <MoreHorizontal size={16} />
          </div>
        </div>
      </aside>

      {mobileNav && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              Workspace <ChevronRight size={14} />
              <strong>{page}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="icon-btn search-trigger"
              onClick={() => searchRef.current?.focus()}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <label className="global-search">
              <Search size={15} />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
                placeholder="Search tools or topics..."
              />
              <span className="search-kbd">/</span>
            </label>
            <button
              className="icon-btn bell-btn"
              aria-label="Notifications"
              onClick={() => notify('You’re all caught up — no unread alerts.')}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="top-divider" />
            <button className="top-profile" onClick={() => go('Profile')}>
              <Avatar initials={initials} />
              <span>{profile.name}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          {page === 'Overview' ? (
            <Dashboard
              go={go}
              profile={profile}
              applications={applications}
              jobs={jobs}
              tasks={tasks}
              setTasks={setTasks}
              notify={notify}
            />
          ) : page === 'AI Career Guidance' ? (
            <Guidance profile={profile} aiEnabled={aiEnabled} onEditGoals={() => setEditProfileOpen(true)} notify={notify} />
          ) : page === 'Resume Builder' ? (
            <ResumeBuilder profile={profile} notify={notify} />
          ) : page === 'Resume Analyzer' ? (
            <ResumeAnalyzer notify={notify} />
          ) : page === 'Job Recommendations' ? (
            <JobsPage
              jobs={jobs}
              setJobs={setJobs}
              saved={saved}
              toggleSave={toggleSave}
              addApplication={addApplication}
              loading={loading}
              setLoading={setLoading}
              notify={notify}
            />
          ) : page === 'Skill Gap Analysis' ? (
            <SkillsPage go={go} notify={notify} />
          ) : page === 'Interview Preparation' ? (
            <InterviewPage profile={profile} notify={notify} />
          ) : page === 'Learning Roadmap' ? (
            <Roadmap notify={notify} />
          ) : page === 'Application Tracker' ? (
            <Tracker applications={applications} setApplications={setApplications} notify={notify} />
          ) : page === 'Profile' ? (
            <Profile profile={profile} initials={initials} go={go} onEdit={() => setEditProfileOpen(true)} />
          ) : (
            <SettingsPage notify={notify} onEditProfile={() => setEditProfileOpen(true)} />
          )}
        </div>

        <footer className="main-footer">
          <span>© {new Date().getFullYear()} Northstar Career Studio</span>
          <span>
            <span className="online-dot" /> {aiEnabled ? 'AI coach connected' : 'Local workspace active'}
          </span>
          <button onClick={() => notify('Tip: Press "/" anytime to jump to any career tool.')}>
            Workspace shortcuts <ExternalLink size={12} />
          </button>
        </footer>
      </main>

      {editProfileOpen && (
        <EditProfileModal
          profile={profile}
          onSave={next => {
            setProfile(next)
            setEditProfileOpen(false)
            notify('Profile updated.')
          }}
          onClose={() => setEditProfileOpen(false)}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  )
}

function EditProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState(profile)
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <Modal title="Edit career profile" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={e => {
          e.preventDefault()
          if (!form.name.trim()) return
          onSave(form)
        }}
      >
        <label>
          Full name
          <input value={form.name} onChange={e => update('name', e.target.value)} required />
        </label>
        <label>
          Current or target role
          <input value={form.role} onChange={e => update('role', e.target.value)} required />
        </label>
        <label>
          Location
          <input value={form.location} onChange={e => update('location', e.target.value)} />
        </label>
        <label>
          Experience summary
          <input value={form.experience} onChange={e => update('experience', e.target.value)} />
        </label>
        <label>
          Work preference
          <input value={form.preference} onChange={e => update('preference', e.target.value)} />
        </label>
        <label>
          Career north star
          <textarea rows={3} value={form.goal} onChange={e => update('goal', e.target.value)} />
        </label>
        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Modal>
  )
}

function Dashboard({ go, profile, applications, jobs, tasks, setTasks, notify }) {
  const [period, setPeriod] = useState('This week')
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const firstName = profile.name.trim().split(/\s+/)[0] || 'Alex'
  const readiness = 78
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - readiness / 100)

  const toggleTask = id => {
    setTasks(current => current.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const handleAddTask = e => {
    e.preventDefault()
    const title = newTaskTitle.trim()
    if (!title) return
    setTasks(current => [...current, { id: `t-${Date.now()}`, done: false, title, time: 'Planned · 15 min' }])
    setNewTaskTitle('')
    setAddingTask(false)
    notify('Task added to your weekly flow.')
  }

  const periodCaption =
    period === 'This week' ? 'vs. last week' : period === 'This month' ? 'vs. last month' : 'past 90 days'

  return (
    <div className="dashboard-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            {formatToday()} <span className="eyebrow-dot">·</span> YOUR WEEKLY CHECK-IN
          </div>
          <h1>
            {getGreeting()}, {firstName} <span className="wave">✳</span>
          </h1>
          <p>You're making thoughtful progress. Here's your career snapshot.</p>
        </div>
        <div className="date-select-wrap">
          <CalendarDays size={15} />
          <select className="date-select" value={period} onChange={e => setPeriod(e.target.value)} aria-label="Timeframe">
            <option>This week</option>
            <option>This month</option>
            <option>Last 90 days</option>
          </select>
          <ChevronDown size={14} />
        </div>
      </div>

      <div className="dash-hero">
        <div className="dash-hero-grid" />
        <div className="hero-copy">
          <div className="hero-kicker">
            <Sparkles size={13} /> YOUR CAREER, IN FOCUS
          </div>
          <h2>
            Make your next move
            <br />a <span>confident one.</span>
          </h2>
          <p>
            You’re closer than you think. Keep building on your strengths and discover where they can take you next.
          </p>
          <Button variant="white" icon={WandSparkles} onClick={() => go('AI Career Guidance')}>
            Explore your next step <ArrowRight size={15} />
          </Button>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-star">
            <Compass size={46} strokeWidth={1.25} />
          </div>
          <div className="float-card float-top">
            <span className="float-icon">
              <TrendingUp size={15} />
            </span>
            <span>
              <small>PROFILE STRENGTH</small>
              <strong>
                Trending up <ArrowUpRight size={14} />
              </strong>
            </span>
          </div>
          <div className="float-card float-bottom">
            <span className="float-avatar">{jobs[0]?.mark || 'L'}</span>
            <span>
              <small>NEW BEST MATCH</small>
              <strong>
                {jobs[0]?.title?.split(' ').slice(-2).join(' ') || 'Product Designer'} <i>{jobs[0]?.match || 96}%</i>
              </strong>
            </span>
          </div>
        </div>

        <div className="hero-foot">
          <span>
            <i /> Your personal career workspace
          </span>
          <span>
            Last updated just now <ArrowRight size={13} />
          </span>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard
          label="Career readiness"
          value="78"
          suffix="/100"
          delta="+8 pts"
          caption={periodCaption}
          icon={Gauge}
          tone="blue"
          visual="gauge"
        />
        <MetricCard
          label="Skills mastered"
          value="12"
          suffix="/16"
          delta="+2 skills"
          caption={periodCaption}
          icon={Award}
          tone="violet"
          visual="bars"
        />
        <MetricCard
          label="Recommended roles"
          value={String(Math.max(24, jobs.length))}
          suffix=""
          delta="8 new"
          caption="great-fit matches"
          icon={BriefcaseBusiness}
          tone="cyan"
          visual="spark"
        />
        <MetricCard
          label="Applications"
          value={String(applications.length || 6).padStart(2, '0')}
          suffix=""
          delta="2 interviews"
          caption="in progress"
          icon={Activity}
          tone="orange"
          visual="chart"
        />
      </div>

      <div className="dashboard-columns">
        <div className="column-main">
          <div className="card paths-card">
            <SectionTitle
              eyebrow="A CLEARER DIRECTION"
              title="Career paths to explore"
              description="Roles that align with your strengths and goals."
              action={
                <button className="text-link" onClick={() => go('Job Recommendations')}>
                  View all paths <ArrowRight size={14} />
                </button>
              }
            />
            <div className="path-list">
              <PathRow
                icon="✳"
                color="path-purple"
                title="Senior Product Designer"
                meta="Design · 5+ years"
                match={96}
                note="Excellent fit"
                onClick={() => go('Job Recommendations')}
              />
              <PathRow
                icon="◈"
                color="path-blue"
                title="UX Design Lead"
                meta="Design leadership · 6+ years"
                match={89}
                note="Strong fit"
                onClick={() => go('Job Recommendations')}
              />
              <PathRow
                icon="⌘"
                color="path-cyan"
                title="Product Design Manager"
                meta="People & strategy · 7+ years"
                match={82}
                note="Good fit"
                onClick={() => go('Job Recommendations')}
              />
            </div>
          </div>

          <div className="card skills-card">
            <SectionTitle
              eyebrow="YOUR MOMENTUM"
              title="Skills in motion"
              description="You're growing in all the right areas."
              action={
                <button className="round-action" onClick={() => go('Skill Gap Analysis')} aria-label="View skill analysis">
                  <ArrowRight size={16} />
                </button>
              }
            />
            <div className="skills-rows">
              {skillSeed.map(skill => (
                <div className="skill-line" key={skill.name}>
                  <span>{skill.name}</span>
                  <Progress value={skill.score} color={skill.color} />
                  <strong>{skill.score}%</strong>
                </div>
              ))}
            </div>
            <button className="skill-insight" onClick={() => go('Skill Gap Analysis')}>
              <span>
                <Lightbulb size={17} />
              </span>
              <div>
                <strong>One skill could unlock 12 more roles</strong>
                <p>Build confidence in design systems to open new opportunities.</p>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="column-side">
          <div className="card readiness-card">
            <SectionTitle
              eyebrow="YOUR READINESS"
              title="Career readiness"
              action={
                <button className="more-btn" onClick={() => go('Resume Analyzer')} aria-label="Review readiness">
                  <MoreHorizontal size={18} />
                </button>
              }
            />
            <div className="readiness-body">
              <div className="donut-wrap">
                <svg className="ring-svg" viewBox="0 0 92 92" aria-hidden="true">
                  <defs>
                    <linearGradient id="northstarRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f5ee8" />
                      <stop offset="100%" stopColor="#8569ee" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-track" cx="46" cy="46" r={radius} />
                  <circle
                    className="ring-fill"
                    cx="46"
                    cy="46"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="ring-center">
                  <strong>{readiness}</strong>
                  <small>of 100</small>
                </div>
                <span className="donut-spark">
                  <Sparkles size={12} />
                </span>
              </div>
              <div className="readiness-copy">
                <Badge tone="positive">
                  <TrendingUp size={12} /> +8 this month
                </Badge>
                <p>You're building strong momentum. Keep it going!</p>
              </div>
            </div>
            <div className="readiness-divider" />
            <div className="mini-checks">
              <span>
                <i className="check-dot">
                  <Check size={11} />
                </i>
                Profile complete
              </span>
              <span>
                <i className="check-dot">
                  <Check size={11} />
                </i>
                Skills assessed
              </span>
              <span>
                <i className="check-dot pending">
                  <ArrowRight size={11} />
                </i>
                Resume optimized
              </span>
            </div>
            <button className="readiness-cta" onClick={() => go('Resume Analyzer')}>
              Improve your score <ArrowRight size={14} />
            </button>
          </div>

          <div className="card tasks-card">
            <SectionTitle
              eyebrow="STAY IN FLOW"
              title="Upcoming tasks"
              action={<span className="task-count">{tasks.filter(t => !t.done).length}</span>}
            />
            <div className="tasks-list">
              {tasks.map(task => (
                <button
                  type="button"
                  className={cx('task-item', task.done && 'task-done')}
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                >
                  <span className="task-check">{task.done && <Check size={12} />}</span>
                  <div>
                    <strong>{task.title}</strong>
                    <small>
                      <Clock3 size={12} /> {task.time}
                    </small>
                  </div>
                </button>
              ))}
            </div>
            {addingTask ? (
              <form className="task-inline-form" onSubmit={handleAddTask}>
                <input
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Next career step..."
                  autoFocus
                />
                <Button type="submit" size="sm">
                  Add
                </Button>
                <Button type="button" variant="subtle" size="sm" onClick={() => setAddingTask(false)}>
                  Cancel
                </Button>
              </form>
            ) : (
              <button className="task-add" onClick={() => setAddingTask(true)}>
                <Plus size={14} /> Add a task
              </button>
            )}
          </div>

          <div className="ai-tip-card">
            <div className="ai-tip-head">
              <span>
                <Sparkles size={13} /> YOUR AI CAREER COACH
              </span>
              <span className="online-dot" />
            </div>
            <p>
              “Your portfolio leadership experience stands out. Have you considered roles at{' '}
              <strong>early-stage startups</strong>?”
            </p>
            <button onClick={() => go('AI Career Guidance')}>
              Continue the conversation <ArrowRight size={13} />
            </button>
            <div className="tip-decoration">✳</div>
          </div>
        </div>
      </div>

      <div className="activity-strip">
        <div>
          <span className="activity-icon">
            <Flame size={17} />
          </span>
          <span>
            <small>YOUR MOMENTUM</small>
            <strong>4 day streak</strong>
          </span>
        </div>
        <div className="activity-progress">
          <span style={{ width: '58%' }} />
        </div>
        <span className="activity-caption">
          2 more days to beat your best <span>✦</span>
        </span>
        <button onClick={() => go('Learning Roadmap')}>
          View activity <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

function MetricCard({ label, value, suffix, delta, caption, icon: Icon, tone, visual }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className={cx('metric-icon', tone)}>
          <Icon size={17} />
        </span>
        <span className="metric-more" aria-hidden="true">
          <MoreHorizontal size={16} />
        </span>
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-number">
        {value}
        {suffix && <small>{suffix}</small>}
      </div>
      <div className="metric-bottom">
        <span className="metric-delta">
          <ArrowUpRight size={13} />
          {delta}
        </span>
        <span>{caption}</span>
      </div>
      <div className={cx('metric-decoration', visual)} aria-hidden="true">
        {visual === 'gauge' ? (
          <>
            <i />
            <i />
            <i />
            <i />
            <i />
          </>
        ) : visual === 'bars' ? (
          [30, 55, 43, 72, 51, 82, 66, 100].map((x, i) => <i key={i} style={{ height: `${x}%` }} />)
        ) : visual === 'spark' ? (
          <svg viewBox="0 0 94 37" preserveAspectRatio="none">
            <path d="M1 30 C12 25 16 27 25 19 S42 23 50 16 S65 20 73 8 S86 13 94 3" />
          </svg>
        ) : (
          <svg viewBox="0 0 94 37" preserveAspectRatio="none">
            <path d="M1 31 C12 31 13 17 23 22 S35 11 44 18 S58 10 67 14 S80 3 94 4" />
          </svg>
        )}
      </div>
    </div>
  )
}

function PathRow({ icon, color, title, meta, match, note, onClick }) {
  return (
    <button className="path-row" onClick={onClick}>
      <span className={cx('path-icon', color)}>{icon}</span>
      <span className="path-info">
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
      <span className="path-fit">
        <strong>{match}%</strong>
        <small>{note}</small>
      </span>
      <ArrowRight className="path-arrow" size={16} />
    </button>
  )
}

function Landing({ go, initials }) {
  return (
    <div className="landing-page">
      <div className="landing-nav">
        <a className="landing-brand" onClick={() => go('Overview')}>
          <span className="brand-icon">
            <Compass size={19} />
          </span>
          northstar
        </a>
        <div className="landing-nav-links">
          <button onClick={() => document.getElementById('landing-features')?.scrollIntoView({ behavior: 'smooth' })}>
            Features
          </button>
          <button onClick={() => document.getElementById('landing-how')?.scrollIntoView({ behavior: 'smooth' })}>
            How it works
          </button>
          <button onClick={() => document.getElementById('landing-stories')?.scrollIntoView({ behavior: 'smooth' })}>
            Stories
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={() => go('Overview')}>
          Open workspace
        </Button>
      </div>

      <section className="landing-hero">
        <div className="landing-copy">
          <Badge tone="subtle">
            <Sparkles size={12} /> A more human kind of career AI
          </Badge>
          <h1>
            Your Career. Your Potential.
            <br />
            <span>Powered by AI.</span>
          </h1>
          <p>
            Discover opportunities, build the skills that matter, and land a role that feels like you. Your next chapter
            starts with a little more clarity.
          </p>
          <div className="landing-actions">
            <Button onClick={() => go('Overview')}>
              Get started <ArrowRight size={15} />
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('landing-features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore features <ArrowDownRight size={15} />
            </Button>
          </div>
          <small>
            <ShieldCheck size={14} /> Thoughtful guidance, always on your side
          </small>
        </div>

        <div className="landing-preview">
          <div className="preview-window">
            <div className="preview-window-top">
              <span />
              <span />
              <span />
              <small>northstar · career studio</small>
            </div>
            <div className="preview-window-body">
              <div className="preview-mini-side">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="preview-mini-main">
                <small>YOUR WEEKLY CHECK-IN</small>
                <h3>{getGreeting()}, Alex ✳</h3>
                <div className="preview-mini-metrics">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="preview-mini-panels">
                  <i />
                  <i />
                </div>
                <div className="preview-mini-chart" />
              </div>
            </div>
          </div>

          <div className="landing-float landing-float-one">
            <span>
              <Gauge size={16} />
            </span>
            <div>
              Career readiness
              <strong>
                78% <i>↗ 8</i>
              </strong>
            </div>
          </div>

          <div className="landing-float landing-float-two">
            <span className="float-avatar">L</span>
            <div>
              New best match
              <strong>Product Designer · 96%</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-trust">
        <span>CAREER MOMENTUM, MEET YOUR MOMENT</span>
        <div>
          <i>✦</i> Built for your next chapter
        </div>
        <div>
          <ShieldCheck size={15} /> Your data stays yours
        </div>
        <div>
          <Sparkles size={15} /> Guidance that grows with you
        </div>
      </div>

      <section id="landing-features" className="landing-section">
        <div className="landing-section-head">
          <div className="eyebrow">EVERYTHING, IN ONE THOUGHTFUL SPACE</div>
          <h2>A little clarity changes everything.</h2>
          <p>
            From the first question to the offer you’ve been working toward, your career journey has a calm, focused
            home.
          </p>
        </div>

        <div className="landing-feature-grid">
          {[
            [
              Sparkles,
              'Find your direction',
              'Talk through what matters and uncover career paths that feel like a natural next step.',
              'AI Career Guidance',
            ],
            [
              FileCheck2,
              'Tell your story well',
              'Build a thoughtful resume, understand its strengths, and make every word count.',
              'Resume Builder',
            ],
            [
              BriefcaseBusiness,
              'Find the right fit',
              'Explore personalized opportunities matched to your experience, goals, and values.',
              'Job Recommendations',
            ],
            [
              Target,
              'Grow with intention',
              'See the skills you bring and take a focused, practical step toward where you want to go.',
              'Skill Gap Analysis',
            ],
            [
              Mic2,
              'Show up with confidence',
              'Practice real questions, find your voice, and walk into every conversation prepared.',
              'Interview Preparation',
            ],
            [
              ClipboardList,
              'Keep your momentum',
              'A calm, clear view of each application and the next step that moves it forward.',
              'Application Tracker',
            ],
          ].map(([Icon, title, copy, link]) => (
            <button className="landing-feature" key={title} onClick={() => go(link)}>
              <span>
                <Icon size={18} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <i>
                Explore <ArrowRight size={14} />
              </i>
            </button>
          ))}
        </div>
      </section>

      <section id="landing-how" className="landing-how">
        <div className="landing-section-head">
          <div className="eyebrow">A JOURNEY THAT STARTS WITH YOU</div>
          <h2>Small steps. Meaningful change.</h2>
        </div>
        <div className="how-steps">
          {[
            [
              '01',
              'Get to know you',
              'Share what you’re good at, what you care about, and what you’re curious about.',
            ],
            ['02', 'Find your focus', 'Get a clearer picture of your next move and a plan shaped around your life.'],
            [
              '03',
              'Build your momentum',
              'Take one thoughtful step at a time, with a workspace that keeps it all together.',
            ],
          ].map(([n, t, c]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{c}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="landing-stories" className="landing-quote">
        <div className="eyebrow">A LITTLE MORE CLARITY, FROM REAL PEOPLE</div>
        <blockquote>
          “For the first time, my career search felt less like a guessing game and more like a path I could actually see.”
        </blockquote>
        <div className="quote-author">
          <Avatar initials={initials} />
          <span>
            <strong>Jamie L.</strong>
            <small>Product Designer · Found a role that feels right</small>
          </span>
        </div>
        <div className="quote-stars">★★★★★</div>
      </section>

      <section className="landing-cta">
        <div>
          <Sparkles size={18} />
          <h2>Your next chapter is yours to shape.</h2>
          <p>Let’s make the first step a thoughtful one.</p>
        </div>
        <Button variant="white" onClick={() => go('Overview')}>
          Get started for free <ArrowRight size={15} />
        </Button>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" onClick={() => go('Overview')}>
          <span className="brand-icon">
            <Compass size={17} />
          </span>
          northstar
        </a>
        <span>© {new Date().getFullYear()} Northstar Career Studio</span>
        <span>Made for the work you want to do.</span>
      </footer>
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function JobsPage({ jobs, setJobs, saved, toggleSave, addApplication, loading, setLoading, notify }) {
  const [query, setQuery] = useState('Product Designer')
  const [location, setLocation] = useState('')
  const [filter, setFilter] = useState('All matches')

  async function searchJobs(e) {
    e?.preventDefault()
    setLoading(true)
    try {
      const data = await api('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location }),
      })
      if (data.jobs?.length) {
        setJobs(
          data.jobs.map((j, i) => ({
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
          }))
        )
        notify(`Found ${data.jobs.length} matching roles.`)
      } else {
        setJobs([])
      }
    } catch (error) {
      notify(`${error.message} Showing curated matches instead.`)
    } finally {
      setLoading(false)
    }
  }

  const visible = jobs.filter(job => {
    if (filter === 'Remote only') return /remote/i.test(job.location || '')
    if (filter === 'Saved') return saved.includes(job.title)
    return true
  })

  return (
    <>
      <PageHeader
        eyebrow="FIND YOUR NEXT OPPORTUNITY"
        title="Roles that feel like you."
        description="Thoughtful matches, shaped around your skills, goals, and what matters to you."
        action={
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            onClick={() => {
              setJobs(jobsSeed)
              setFilter('All matches')
              notify('Restored curated role recommendations.')
            }}
          >
            Reset matches
          </Button>
        }
      />

      <div className="jobs-search card">
        <form onSubmit={searchJobs}>
          <label>
            <Search size={17} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Job title, skill, or company" />
          </label>
          <span className="search-separator" />
          <label>
            <Target size={17} />
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location or remote" />
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Find roles'} <ArrowRight size={15} />
          </Button>
        </form>
        <div className="search-foot">
          <span>
            <Sparkles size={13} /> Personalized for your profile
          </span>
          <span>Live search & safety scan enabled</span>
        </div>
      </div>

      <div className="jobs-toolbar">
        <div>
          <h2>
            Top matches <Badge tone="subtle">{visible.length}</Badge>
          </h2>
          <p>Sorted by how well each role fits your profile</p>
        </div>
        <div className="filter-pills">
          {['All matches', 'Remote only', 'Saved'].map(tab => (
            <button
              key={tab}
              type="button"
              className={cx('filter-pill', filter === tab && 'active')}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="jobs-list">
        {visible.length ? (
          visible.map((job, i) => (
            <JobCard
              key={`${job.title}-${i}`}
              job={job}
              saved={saved.includes(job.title)}
              toggleSave={toggleSave}
              addApplication={addApplication}
              notify={notify}
            />
          ))
        ) : (
          <div className="empty-state">
            <Search size={28} />
            <h3>No matches for those filters</h3>
            <p>Try broadening your search or switching back to all matches.</p>
            <Button variant="outline" onClick={() => setFilter('All matches')}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

function JobCard({ job, saved, toggleSave, addApplication, notify }) {
  const suspicious = job.safety && (job.safety.risk_level === 'high' || job.safety.flags?.length > 0)
  return (
    <article className="job-card">
      <div className={cx('company-mark', job.tone)}>{job.mark || (job.company || '?')[0]}</div>
      <div className="job-main">
        <div className="job-heading">
          <div>
            <div className="job-titleline">
              <h3>{job.title}</h3>
              <Badge tone="match">
                <Sparkles size={11} />
                {job.match}% match
              </Badge>
              {suspicious && <Badge tone="warning">Review listing details</Badge>}
            </div>
            <p>
              {job.company} <span>·</span> {job.location}
            </p>
          </div>
          <button
            className={cx('save-btn', saved && 'is-saved')}
            onClick={() => toggleSave(job)}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="job-facts">
          <span>
            <BriefcaseBusiness size={14} />
            {job.exp || 'Experience varies'}
          </span>
          <span>
            <TrendingUp size={14} />
            {job.salary || 'Salary not listed'}
          </span>
          <span>
            <Clock3 size={14} />
            {job.posted || 'Recently posted'}
          </span>
        </div>
        <div className="job-tags">
          {(job.tags?.length ? job.tags : ['Product design', 'Figma', 'Design systems']).map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="job-card-bottom">
          <span>
            <span className="fit-dot" /> Strong fit for your experience
          </span>
          <div>
            <Button variant="subtle" size="sm" onClick={() => addApplication(job)}>
              Save to tracker
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                job.url ? window.open(job.url, '_blank', 'noopener') : notify('This sample role has no live posting link.')
              }
            >
              View role <ExternalLink size={13} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function Guidance({ profile, aiEnabled, onEditGoals, notify }) {
  const firstName = profile.name.trim().split(/\s+/)[0] || 'Alex'
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
  ]

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${firstName}! I’ve been looking at your recent progress. You have a strong blend of product thinking and visual craft. What would you like to explore today?`,
    },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text = draft) {
    if (!text.trim()) return
    const question = text.trim()
    setMessages(m => [...m, { role: 'user', text: question }])
    setDraft('')
    setBusy(true)
    try {
      const data = await api('/api/career/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      })
      setMessages(m => [...m, { role: 'assistant', text: data.reply }])
    } catch (error) {
      notify(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="A THOUGHTFUL CAREER PARTNER"
        title="Your AI career guide"
        description="A calm space to think clearly about what’s next, and how to get there."
        action={
          <Button
            variant="outline"
            icon={Plus}
            onClick={() => {
              setMessages([
                {
                  role: 'assistant',
                  text: `Fresh conversation started, ${firstName}. What’s top of mind for your career right now?`,
                },
              ])
              notify('Started a new coaching thread.')
            }}
          >
            New chat
          </Button>
        }
      />

      <div className="guidance-layout">
        <div className="chat-card card">
          <div className="chat-head">
            <div className="coach-avatar">
              <Sparkles size={18} />
            </div>
            <div>
              <strong>Northstar career coach</strong>
              <small>
                <i className="online-dot" /> {aiEnabled ? 'AI coach ready' : 'Guided offline mode · Here to help'}
              </small>
            </div>
            <Badge tone="subtle">{messages.length} messages</Badge>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div className={cx('message-row', m.role)} key={i}>
                {m.role === 'assistant' && (
                  <span className="mini-coach">
                    <Sparkles size={14} />
                  </span>
                )}
                <div className="message-bubble">
                  {m.text}
                  {m.role === 'assistant' && i === 0 && <small>Just now</small>}
                </div>
              </div>
            ))}
            {busy && (
              <div className="message-row">
                <span className="mini-coach">
                  <Sparkles size={14} />
                </span>
                <div className="typing">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
            <div ref={end} />
          </div>

          <div className="chat-prompts">
            {['What roles fit my strengths?', 'How can I grow into leadership?', 'Help me plan my next 30 days'].map(
              t => (
                <button key={t} onClick={() => send(t)} disabled={busy}>
                  {t}
                  <ArrowUpRight size={13} />
                </button>
              )
            )}
          </div>

          <form
            className="chat-compose"
            onSubmit={e => {
              e.preventDefault()
              send()
            }}
          >
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Ask anything about your career..."
            />
            <button aria-label="Send message" disabled={!draft.trim() || busy}>
              <Send size={16} />
            </button>
          </form>

          <p className="chat-disclaimer">
            <ShieldCheck size={13} /> Avoid sharing sensitive details; configured AI providers receive your chat message.
          </p>
        </div>

        <aside className="guide-aside">
          <div className="card guide-card">
            <div className="guide-icon">
              <Compass size={19} />
            </div>
            <div className="eyebrow">A LITTLE CONTEXT</div>
            <h3>Your north star</h3>
            <p>{profile.goal}</p>
            <button onClick={onEditGoals}>
              Edit career goals <ArrowRight size={13} />
            </button>
          </div>

          <div className="card guide-card">
            <div className="eyebrow">RECENT CONVERSATIONS</div>
            {threads.map(thread => (
              <button
                className="history-row"
                onClick={() => {
                  setMessages(thread.messages)
                  notify(`Loaded “${thread.title}”.`)
                }}
                key={thread.title}
              >
                <MessageCircle size={16} />
                <span>
                  {thread.title}
                  <small>{thread.date}</small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>

          <div className="guide-note">
            <Lightbulb size={17} />
            <p>
              <strong>Come as you are.</strong> There’s no perfect question. Start wherever your mind is today.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}

function ResumeBuilder({ profile, notify }) {
  const [resume, setResume] = useState(() =>
    loadJSON('northstar.resumeDraft', {
      ...defaultResume,
      name: profile.name || defaultResume.name,
      role: profile.role || defaultResume.role,
      location: profile.location || defaultResume.location,
    })
  )
  const [previewModal, setPreviewModal] = useState(false)

  const templates = [
    ['Modern', 'Crisp hierarchy & accent bar'],
    ['Classic', 'Timeless serif single-column'],
    ['Creative', 'Editorial left accent strip'],
  ]

  const update = (key, val) => setResume(prev => ({ ...prev, [key]: val }))

  const bullets = resume.expBullets
    .split('\n')
    .map(b => b.trim())
    .filter(Boolean)

  const saveDraft = () => {
    try {
      localStorage.setItem('northstar.resumeDraft', JSON.stringify(resume))
    } catch {}
    notify('Your resume draft has been saved.')
  }

  const downloadDraft = () => {
    const text = `${resume.name}\n${resume.role}\n${resume.location} · ${resume.email}\n\nPROFILE\n${resume.summary}\n\nEXPERIENCE\n${resume.expTitle} | ${resume.expCompany} | ${resume.expPeriod}\n${bullets.map(b => `• ${b}`).join('\n')}\n\nSKILLS\n${resume.skills}\n\nEDUCATION\n${resume.eduDegree} | ${resume.eduSchool}\n\nTemplate: ${templates[resume.template][0]}\n`
    downloadText(`${(resume.name || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume.txt`, text)
    notify('Downloaded plain-text resume draft.')
  }

  const paperClass =
    resume.template === 1 ? 'paper-classic' : resume.template === 2 ? 'paper-creative' : 'paper-modern'

  const PaperContent = () => (
    <div className={cx('resume-paper', paperClass)}>
      <div className="paper-accent" />
      <div className="paper-header">
        <h2>{resume.name || 'Your Name'}</h2>
        <strong className="paper-role">{resume.role || 'Your Target Role'}</strong>
        <small className="paper-contact">
          {[resume.location, resume.email].filter(Boolean).join(' · ') || 'City, State · email@example.com'}
        </small>
      </div>
      <hr />
      <h4>PROFILE</h4>
      <p>{resume.summary}</p>
      <h4>EXPERIENCE</h4>
      <b className="paper-exp-title">{resume.expTitle}</b>
      <small className="paper-exp-meta">
        {resume.expCompany} · {resume.expPeriod}
      </small>
      <ul>
        {bullets.map((b, idx) => (
          <li key={idx}>{b}</li>
        ))}
      </ul>
      <h4>SKILLS</h4>
      <p>{resume.skills}</p>
      <h4>EDUCATION</h4>
      <b className="paper-exp-title">{resume.eduDegree}</b>
      <small className="paper-exp-meta">{resume.eduSchool}</small>
    </div>
  )

  return (
    <>
      <PageHeader
        eyebrow="RESUME STUDIO"
        title="Tell your story, beautifully."
        description="Create a polished resume that sounds like you, and updates live as you write."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
              Print / PDF
            </Button>
            <Button variant="outline" icon={Download} onClick={downloadDraft}>
              Download .txt
            </Button>
          </div>
        }
      />

      <div className="builder-layout">
        <div className="builder-main">
          <div className="card builder-card">
            <div className="builder-card-head">
              <div>
                <h2>Your details</h2>
                <p>Edits reflect immediately in the live preview on the right.</p>
              </div>
              <Badge tone="positive">Live sync</Badge>
            </div>

            <div className="form-grid">
              <label>
                Full name
                <input value={resume.name} onChange={e => update('name', e.target.value)} />
              </label>
              <label>
                Target role
                <input value={resume.role} onChange={e => update('role', e.target.value)} />
              </label>
              <label>
                Email
                <input value={resume.email} onChange={e => update('email', e.target.value)} placeholder="alex.morgan@email.com" />
              </label>
              <label>
                Location
                <input value={resume.location} onChange={e => update('location', e.target.value)} placeholder="San Francisco, CA" />
              </label>
              <label className="full-field">
                Professional summary
                <textarea rows={3} value={resume.summary} onChange={e => update('summary', e.target.value)} />
              </label>
              <label>
                Recent role title
                <input value={resume.expTitle} onChange={e => update('expTitle', e.target.value)} />
              </label>
              <label>
                Company & dates
                <input
                  value={`${resume.expCompany} · ${resume.expPeriod}`}
                  onChange={e => {
                    const [comp, per] = e.target.value.split('·').map(s => s.trim())
                    setResume(prev => ({ ...prev, expCompany: comp ?? '', expPeriod: per ?? '' }))
                  }}
                />
              </label>
              <label className="full-field">
                Key highlights (one per line)
                <textarea rows={3} value={resume.expBullets} onChange={e => update('expBullets', e.target.value)} />
              </label>
              <label className="full-field">
                Core skills
                <input value={resume.skills} onChange={e => update('skills', e.target.value)} />
              </label>
            </div>

            <div className="builder-divider" />

            <div className="builder-card-head">
              <div>
                <h2>Choose your style</h2>
                <p>Each template is clean, structured, and ATS friendly.</p>
              </div>
            </div>

            <div className="template-grid">
              {templates.map(([title, sub], i) => (
                <button
                  type="button"
                  className={cx('template-option', resume.template === i && 'active')}
                  key={title}
                  onClick={() => update('template', i)}
                >
                  <div className={`template-preview preview-${i}`}>
                    <i />
                    <i />
                    <i />
                    <i />
                    <b />
                    <i />
                    <i />
                  </div>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                  {resume.template === i && (
                    <span className="template-check">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="builder-actions">
              <Button type="button" variant="outline" onClick={saveDraft}>
                Save draft
              </Button>
              <Button type="button" onClick={() => setPreviewModal(true)}>
                Full preview <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>

        <aside className="builder-preview card">
          <div className="preview-head">
            <span>LIVE PREVIEW · {templates[resume.template][0].toUpperCase()}</span>
            <button type="button" onClick={() => setPreviewModal(true)} aria-label="Expand preview">
              <ExternalLink size={15} />
            </button>
          </div>
          <PaperContent />
          <div className="preview-footer">
            <ShieldCheck size={14} /> ATS-friendly formatting <span>·</span> 1 page
          </div>
        </aside>
      </div>

      {previewModal && (
        <Modal title={`Resume preview — ${templates[resume.template][0]}`} wide onClose={() => setPreviewModal(false)}>
          <PaperContent />
          <div className="modal-actions" style={{ marginTop: 18 }}>
            <Button variant="outline" icon={Download} onClick={downloadDraft}>
              Download .txt
            </Button>
            <Button icon={Printer} onClick={() => window.print()}>
              Print / Save PDF
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function ResumeAnalyzer({ notify }) {
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function analyze(e) {
    e.preventDefault()
    if (!file) return notify('Choose a resume file to analyze.')
    const form = new FormData()
    form.append('resume', file)
    form.append('job_description', description)
    setBusy(true)
    try {
      const data = await api('/api/resume/analyze', { method: 'POST', body: form })
      setResult(data)
      notify('Resume analysis complete.')
    } catch (error) {
      notify(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="RESUME HEALTH CHECK"
        title="Make every word count."
        description="Get a practical review of your resume structure, ATS readability, and role alignment."
      />

      <div className="analyzer-grid">
        <form className="card analyzer-form" onSubmit={analyze}>
          <h2>Start your resume review</h2>
          <p>Your resume is parsed and scored locally in this workspace.</p>

          <label
            className={cx('upload-drop', dragging && 'dragging')}
            onDragOver={e => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault()
              setDragging(false)
              const dropped = e.dataTransfer.files?.[0]
              if (dropped) setFile(dropped)
            }}
          >
            <input type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files?.[0])} />
            <span className="upload-round">
              <Upload size={19} />
            </span>
            <strong>{file ? file.name : 'Drop your resume here'}</strong>
            <small>{file ? `${Math.max(1, Math.round(file.size / 1024))} KB · Ready for review` : 'or browse files · PDF, DOCX, TXT · up to 12 MB'}</small>
          </label>

          <label className="field-label">
            <div className="field-label-row">
              Target job description <span>OPTIONAL</span>
            </div>
            <textarea
              rows={7}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Paste a job description to unlock a role-specific ATS match score and missing keyword highlights."
            />
          </label>

          <div className="privacy-line">
            <ShieldCheck size={15} /> Resume contents stay on your computer during local analysis.
          </div>

          <Button type="submit" disabled={busy} icon={busy ? undefined : Sparkles}>
            {busy ? 'Analyzing your resume...' : 'Analyze my resume'} {!busy && <ArrowRight size={15} />}
          </Button>
        </form>

        <div className="analyzer-right">
          {result?.score ? (
            <div className="card analysis-result">
              <div className="analysis-top">
                <div>
                  <div className="eyebrow">YOUR ATS OVERVIEW</div>
                  <h2>Resume insights</h2>
                </div>
                <div className="ats-score">
                  <strong>{Math.round(result.score.overall)}</strong>
                  <small>ATS score</small>
                </div>
              </div>

              {(result.security?.injection || result.security?.hidden_text) && (
                <div style={{ marginTop: 12 }}>
                  <Badge tone="warning">Hidden text or prompt-like pattern flagged during scan</Badge>
                </div>
              )}

              <div className="score-items">
                {[
                  ['Keyword match', result.score.keyword_match],
                  ['Section completeness', result.score.section_completeness],
                  ['Readability', result.score.readability],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{Math.round(val)}%</strong>
                    <Progress value={val} />
                  </div>
                ))}
              </div>

              <div className="keyword-box">
                <strong>Keywords to consider</strong>
                {result.score.missing_keywords?.length ? (
                  <div className="keyword-chips">
                    {result.score.missing_keywords.map(kw => (
                      <span className="keyword-chip" key={kw}>
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)' }}>No major keyword gaps found.</p>
                )}
              </div>

              {result.score.suggestions?.map(s => (
                <p className="suggestion-line" key={s}>
                  <Lightbulb size={15} />
                  {s}
                </p>
              ))}
            </div>
          ) : result?.resume ? (
            <div className="card analysis-result">
              <div className="analysis-top">
                <div>
                  <div className="eyebrow">PARSED SUCCESSFULLY</div>
                  <h2>Structure looks clean</h2>
                </div>
                <Badge tone="positive">Ready</Badge>
              </div>
              <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>
                We extracted <strong>{result.resume.raw_text?.split(/\s+/).length || 0} words</strong> from your resume.
                Paste a target job description on the left and re-run to calculate your full ATS match score and missing
                keywords.
              </p>
            </div>
          ) : (
            <div className="card analyzer-empty">
              <span className="empty-art">
                <FileCheck2 size={28} />
                <Sparkles size={14} />
              </span>
              <h3>A clearer picture starts here.</h3>
              <p>
                Upload your resume to see an actionable overview of your structure, readability, and role fit.
              </p>
              <div>
                <span>
                  <CheckCircle2 size={15} /> ATS readability check
                </span>
                <span>
                  <CheckCircle2 size={15} /> Keyword gap opportunities
                </span>
                <span>
                  <CheckCircle2 size={15} /> Practical, grounded suggestions
                </span>
              </div>
            </div>
          )}

          <div className="analysis-trust">
            <span>
              <ShieldCheck size={16} />
            </span>
            <div>
              <strong>Thoughtful by design</strong>
              <p>
                Use every suggestion as a starting point. Your resume should always reflect your real experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SkillsPage({ go, notify }) {
  const roleProfiles = {
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
  }

  const [targetRole, setTargetRole] = useState('Senior Product Designer')
  const current = roleProfiles[targetRole]

  const exportSkills = () => {
    const lines = [
      `Northstar Skill Gap Analysis — ${targetRole}`,
      `Overall match: ${current.match}% (${current.haveCount} of ${current.totalCount} core skills)`,
      '',
      ...current.skills.map(([name, val, have]) => `- ${name}: ${val}% (${have ? 'In your toolkit' : 'Growth opportunity'})`),
      '',
      `Recommended next focus: ${current.focus}`,
    ].join('\n')
    downloadText('skill-gap-analysis.txt', lines)
    notify('Exported skill gap summary.')
  }

  return (
    <>
      <PageHeader
        eyebrow="YOUR SKILLS, YOUR NEXT CHAPTER"
        title="See the path between here and there."
        description="Understand what you already bring, and which skills can open new doors."
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="date-select"
              style={{ paddingLeft: 12 }}
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              aria-label="Target role"
            >
              {Object.keys(roleProfiles).map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Button variant="outline" icon={Download} onClick={exportSkills}>
              Export analysis
            </Button>
          </div>
        }
      />

      <div className="skill-summary-grid">
        <div className="card skill-summary">
          <span className="metric-icon blue">
            <Target size={18} />
          </span>
          <div>
            <small>YOUR CURRENT MATCH</small>
            <strong>{current.match}%</strong>
            <span>for {targetRole}</span>
          </div>
        </div>
        <div className="card skill-summary">
          <span className="metric-icon violet">
            <Zap size={18} />
          </span>
          <div>
            <small>SKILLS YOU BRING</small>
            <strong>
              {current.haveCount} <em>of {current.totalCount}</em>
            </strong>
            <span>core skills already demonstrated</span>
          </div>
        </div>
        <div className="card skill-summary">
          <span className="metric-icon cyan">
            <TrendingUp size={18} />
          </span>
          <div>
            <small>YOUR NEXT OPPORTUNITY</small>
            <strong>{current.gapCount} skills</strong>
            <span>could strengthen your match</span>
          </div>
        </div>
      </div>

      <div className="skills-analysis-grid">
        <div className="card skill-comparison">
          <SectionTitle
            eyebrow="SKILLS BREAKDOWN"
            title="Where you stand"
            description="Your experience compared with what the role is looking for."
            action={<Badge tone="subtle">{targetRole}</Badge>}
          />
          <div className="chart-legend">
            <span>
              <i className="legend-you" /> Your level
            </span>
            <span>
              <i className="legend-role" /> Role requirement
            </span>
          </div>
          <div className="comparison-list">
            {current.skills.map(([name, val, have]) => (
              <div className="comparison-row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span className={have ? 'skill-have' : 'skill-gap'}>
                    {have ? 'In your toolkit' : 'Growth opportunity'}
                  </span>
                </div>
                <div className="comparison-bars">
                  <div>
                    <i style={{ width: `${val}%` }} />
                  </div>
                  <span>{val}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card gap-card">
          <div className="eyebrow">A GOOD NEXT STEP</div>
          <span className="gap-icon">
            <Lightbulb size={20} />
          </span>
          <h3>{current.focus}</h3>
          <Badge tone="warning">High impact skill</Badge>
          <p>{current.focusCopy}</p>
          <div className="gap-resource">
            <BookOpen size={16} />
            <span>
              <strong>{current.course}</strong>
              <small>{current.courseMeta}</small>
            </span>
            <ArrowUpRight size={15} />
          </div>
          <Button
            onClick={() => {
              notify(`Added ${current.focus} to your learning roadmap.`)
              go('Learning Roadmap')
            }}
          >
            Add to my roadmap <ArrowRight size={14} />
          </Button>
        </aside>
      </div>

      <div className="card roadmap-inline">
        <div>
          <span className="roadmap-icon">
            <GraduationCap size={19} />
          </span>
          <span>
            <strong>Your personalized learning roadmap</strong>
            <small>3 focused weeks · Design systems → Data-informed design → Leadership</small>
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => go('Learning Roadmap')}>
          View roadmap <ArrowRight size={14} />
        </Button>
      </div>
    </>
  )
}

function InterviewPage({ profile, notify }) {
  const [role, setRole] = useState(profile.role || 'Product Designer')
  const [count, setCount] = useState('3')
  const [questions, setQuestions] = useState([])
  const [busy, setBusy] = useState(false)

  async function start(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await api('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, count }),
      })
      setQuestions(data.questions || [])
      notify(`Prepared ${data.questions?.length || 0} practice questions for ${role}.`)
    } catch (error) {
      notify(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="PRACTICE WITH PRESENCE"
        title="Show up as your best self."
        description="A little practice goes a long way. Find your rhythm before the big day."
        action={
          <Badge tone="positive">
            <span className="online-dot" /> Your practice space
          </Badge>
        }
      />

      <div className="interview-layout">
        <form className="card interview-setup" onSubmit={start}>
          <div className="interview-illustration">
            <Mic2 size={26} />
            <span className="soundwave">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="eyebrow">LET’S MAKE IT FEEL REAL</div>
          <h2>Set up a practice round</h2>
          <p>Choose the role you’re preparing for and we’ll create tailored questions to get you started.</p>
          <label>
            Role or position
            <input value={role} onChange={e => setRole(e.target.value)} />
          </label>
          <label>
            Practice style
            <select>
              <option>Mix of behavioral & role-specific</option>
              <option>Behavioral questions</option>
              <option>Role-specific questions</option>
            </select>
          </label>
          <label>
            Questions per round
            <select value={count} onChange={e => setCount(e.target.value)}>
              <option value="3">3 questions · about 10 min</option>
              <option value="1">1 question · about 5 min</option>
              <option value="5">5 questions · about 20 min</option>
            </select>
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? 'Preparing questions...' : 'Start a practice round'} <ArrowRight size={15} />
          </Button>
          <div className="interview-private">
            <ShieldCheck size={14} /> Practice privately, at your own pace
          </div>
        </form>

        <div className="interview-main">
          {questions.length ? (
            <div className="question-list">
              <div className="question-intro">
                <div>
                  <div className="eyebrow">YOUR PRACTICE ROUND</div>
                  <h2>Let’s find your flow.</h2>
                  <p>
                    {questions.length} questions · {role}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setQuestions([])}>
                  Reset round
                </Button>
              </div>
              {questions.map((q, i) => (
                <InterviewQuestion key={i} q={q} index={i} role={role} notify={notify} />
              ))}
            </div>
          ) : (
            <>
              <div className="card interview-stats">
                <div className="eyebrow">YOUR PRACTICE, OVER TIME</div>
                <h3>Confidence comes with practice.</h3>
                <p>Every round helps you find clearer ways to tell your story.</p>
                <div className="practice-chart">
                  <div className="chart-labels">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                  </div>
                  <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="interviewAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f5ee8" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#4f5ee8" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path className="chart-gridline" d="M0 10H500M0 48H500M0 86H500M0 124H500" />
                    <path
                      className="chart-area"
                      d="M0 123 C40 110 55 118 85 91 S140 104 175 73 S225 88 260 58 S310 75 340 47 S395 66 420 35 S466 42 500 16 V150 H0Z"
                    />
                    <path
                      className="chart-line"
                      d="M0 123 C40 110 55 118 85 91 S140 104 175 73 S225 88 260 58 S310 75 340 47 S395 66 420 35 S466 42 500 16"
                    />
                  </svg>
                  <div className="chart-months">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                    <span>This week</span>
                  </div>
                </div>
                <div className="chart-stats">
                  <div>
                    <strong>
                      82<span>%</span>
                    </strong>
                    <small>Average feedback score</small>
                  </div>
                  <div>
                    <strong>6</strong>
                    <small>Rounds completed</small>
                  </div>
                  <div>
                    <strong>
                      +14<span>%</span>
                    </strong>
                    <small>Growth this month</small>
                  </div>
                </div>
              </div>
              <div className="card interview-tip">
                <span className="tip-icon">
                  <Lightbulb size={16} />
                </span>
                <div>
                  <strong>A helpful reminder</strong>
                  <p>
                    Strong answers share the situation, your specific actions, and the outcome. Let the story show what
                    you learned.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function InterviewQuestion({ q, index, role, notify }) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)

  async function review() {
    if (!answer.trim()) return notify('Add a few thoughts before getting feedback.')
    setBusy(true)
    try {
      const data = await api('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, role, question: q.question }),
      })
      setFeedback(data.ai_review || data)
    } catch (e) {
      notify(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card interview-question">
      <div className="question-meta">
        <span>QUESTION {String(index + 1).padStart(2, '0')}</span>
        <Badge tone="subtle">{q.category || 'Behavioral'}</Badge>
      </div>
      <h3>{q.question}</h3>
      <textarea
        rows={4}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Take a breath, then share a real example using Situation, Action, and Outcome..."
      />
      <div className="answer-footer">
        <span>{answer.length} characters · No rush</span>
        <Button variant="outline" size="sm" onClick={review} disabled={busy}>
          {busy ? 'Reviewing...' : 'Get thoughtful feedback'} <ArrowRight size={14} />
        </Button>
      </div>
      {feedback && (
        <div className="feedback-box">
          <div className="feedback-score">
            <strong>{feedback.score ?? 82}</strong>
            <small>Score</small>
          </div>
          <div>
            <strong>A thoughtful next step</strong>
            <p>{feedback.feedback || 'Add a specific outcome to make the impact of your work easier to picture.'}</p>
            {feedback.improvements?.length > 0 && (
              <ul>
                {feedback.improvements.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function Roadmap({ notify }) {
  const [done, setDone] = useState(() => loadArray('northstar.roadmapDone', [0]))

  useEffect(() => {
    try {
      localStorage.setItem('northstar.roadmapDone', JSON.stringify(done))
    } catch {}
  }, [done])

  const weeks = [
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
  ]

  const totalSteps = weeks.reduce((sum, w) => sum + w.items.length, 0)

  const exportPlan = () => {
    const lines = [
      'Northstar 3-Week Learning Roadmap',
      `Progress: ${done.length} of ${totalSteps} steps completed`,
      '',
      ...weeks.flatMap((w, wi) => [
        `${w.title} (${w.duration})`,
        ...w.items.map((item, ii) => `  [${done.includes(wi * 3 + ii) ? 'x' : ' '}] ${item}`),
        '',
      ]),
    ].join('\n')
    downloadText('learning-roadmap.txt', lines)
    notify('Exported learning roadmap.')
  }

  return (
    <>
      <PageHeader
        eyebrow="YOUR PERSONAL LEARNING PLAN"
        title="A path that moves with you."
        description="Small, intentional steps designed around where you want to go."
        action={
          <Button variant="outline" icon={Download} onClick={exportPlan}>
            Export plan
          </Button>
        }
      />

      <div className="roadmap-overview card">
        <div>
          <span className="roadmap-icon big">
            <GraduationCap size={22} />
          </span>
          <div>
            <div className="eyebrow">YOUR 3-WEEK GROWTH PLAN</div>
            <h2>Ready for your next chapter.</h2>
            <p>Designed to help you grow into a product design leader, one focused session at a time.</p>
          </div>
        </div>
        <div className="roadmap-progress">
          <strong>
            {done.length} <small>of {totalSteps} steps</small>
          </strong>
          <Progress value={(done.length / totalSteps) * 100} />
          <span>{done.length === totalSteps ? 'Roadmap complete!' : "You're making steady progress"}</span>
        </div>
      </div>

      <div className="roadmap-weeks">
        {weeks.map((week, wi) => {
          const weekIndices = week.items.map((_, ii) => wi * 3 + ii)
          const completedInWeek = weekIndices.filter(idx => done.includes(idx)).length
          const badgeTone =
            completedInWeek === week.items.length ? 'positive' : completedInWeek > 0 ? 'match' : 'subtle'
          const badgeLabel =
            completedInWeek === week.items.length ? 'Completed' : completedInWeek > 0 ? 'In progress' : 'Up next'

          return (
            <section className="card roadmap-week" key={week.title}>
              <div className="week-number">0{wi + 1}</div>
              <div className="week-content">
                <div className="week-head">
                  <div>
                    <div className="eyebrow">{week.duration}</div>
                    <h2>{week.title}</h2>
                  </div>
                  <Badge tone={badgeTone}>{badgeLabel}</Badge>
                </div>
                {week.items.map((item, ii) => {
                  const idx = wi * 3 + ii
                  const isDone = done.includes(idx)
                  return (
                    <button
                      type="button"
                      className={cx('roadmap-step', isDone && 'is-done')}
                      key={item}
                      onClick={() =>
                        setDone(d => (d.includes(idx) ? d.filter(x => x !== idx) : [...d, idx]))
                      }
                    >
                      <span className={cx('roadmap-check', isDone && 'checked')}>
                        {isDone && <Check size={12} />}
                      </span>
                      <span>{item}</span>
                      <small>{ii === 0 ? '45 min' : ii === 1 ? '60 min' : '30 min'}</small>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

function Tracker({ applications, setApplications, notify }) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState('Applied')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedApp, setSelectedApp] = useState(null)

  async function add(e) {
    e.preventDefault()
    try {
      const data = await api('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, status, notes: '' }),
      })
      setApplications(data.applications || [])
      setTitle('')
      setCompany('')
      notify('Application added to your tracker.')
    } catch (e) {
      notify(e.message)
    }
  }

  const counts = ['Saved', 'Applied', 'Interview', 'Offer'].map(x => [
    x,
    applications.filter(a => a.status === x).length,
  ])

  const visibleApps =
    statusFilter === 'All' ? applications : applications.filter(a => a.status === statusFilter)

  return (
    <>
      <PageHeader
        eyebrow="YOUR JOB SEARCH, ORGANIZED"
        title="Keep every next step in sight."
        description="A calm place to keep track of opportunities and follow-ups."
        action={
          <Button icon={Plus} onClick={() => document.getElementById('add-app-title')?.focus()}>
            Add application
          </Button>
        }
      />

      <div className="tracker-stats">
        {counts.map(([x, n]) => (
          <div className="card tracker-stat" key={x}>
            <small>{x.toUpperCase()}</small>
            <strong>{n}</strong>
            <span>
              <i className="status-dot" /> applications
            </span>
          </div>
        ))}
      </div>

      <div className="card tracker-form-card">
        <div>
          <div className="eyebrow">CAPTURE THE MOMENT</div>
          <h2>Add an opportunity</h2>
          <p>Save it now, add details as you go.</p>
        </div>
        <form onSubmit={add}>
          <input
            id="add-app-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Role title"
          />
          <input value={company} onChange={e => setCompany(e.target.value)} required placeholder="Company" />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option>Saved</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
          <Button type="submit">
            Add <Plus size={14} />
          </Button>
        </form>
      </div>

      <div className="tracker-table-head">
        <div>
          <h2>Your opportunities</h2>
          <p>Everything you’re moving forward</p>
        </div>
        <div className="filter-pills">
          {['All', 'Saved', 'Applied', 'Interview', 'Offer'].map(f => (
            <button
              key={f}
              type="button"
              className={cx('filter-pill', statusFilter === f && 'active')}
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card tracker-table">
        {visibleApps.length ? (
          visibleApps.map((app, i) => (
            <div className="tracker-row" key={app.id || i}>
              <span className={`company-mark ${['purple', 'dark', 'cyan'][i % 3]}`}>
                {(app.company || '?')[0].toUpperCase()}
              </span>
              <span className="tracker-role">
                <strong>{app.title}</strong>
                <small>
                  {app.company} · Added {(app.created_at || 'Today').slice(0, 10)}
                </small>
              </span>
              <Badge
                tone={
                  app.status === 'Interview'
                    ? 'match'
                    : app.status === 'Offer'
                    ? 'positive'
                    : app.status === 'Rejected'
                    ? 'danger'
                    : 'subtle'
                }
              >
                {app.status}
              </Badge>
              <span className="tracker-next">{app.notes || 'Add a next step'}</span>
              <button onClick={() => setSelectedApp(app)} aria-label="View application details">
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <ClipboardList size={28} />
            <h3>{applications.length ? 'No applications match this filter.' : 'Your tracker is ready.'}</h3>
            <p>
              {applications.length
                ? 'Switch back to All to see every tracked role.'
                : 'Add your first role above and keep the next step close.'}
            </p>
          </div>
        )}
      </div>

      {selectedApp && (
        <Modal title={selectedApp.title} onClose={() => setSelectedApp(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 15, color: 'var(--ink)' }}>{selectedApp.company}</strong>
              <Badge tone={selectedApp.status === 'Offer' ? 'positive' : 'match'}>{selectedApp.status}</Badge>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5 }}>
              Added {(selectedApp.created_at || 'Today').slice(0, 10)}
            </p>
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: 'var(--surface-subtle)',
                border: '1px solid var(--line-soft)',
                fontSize: 13.5,
                color: 'var(--ink-secondary)',
              }}
            >
              {selectedApp.notes || 'No notes recorded yet.'}
            </div>
            <div className="modal-actions">
              <Button onClick={() => setSelectedApp(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

function Profile({ profile, initials, go, onEdit }) {
  return (
    <>
      <PageHeader
        eyebrow="YOUR CAREER, YOUR WAY"
        title="A little more about you."
        description="The better we understand your goals, the more thoughtful your recommendations can be."
        action={
          <Button variant="outline" onClick={onEdit}>
            Edit profile <ArrowRight size={14} />
          </Button>
        }
      />

      <div className="profile-layout">
        <div className="card profile-card">
          <Avatar initials={initials} size="large" />
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p>
              {profile.role} · {profile.location}
            </p>
            <Badge tone="positive">
              <CheckCircle2 size={12} /> Profile 85% complete
            </Badge>
          </div>

          <div className="profile-section">
            <div>
              <h3>Your career direction</h3>
              <p>What you’re working toward right now</p>
            </div>
            <div className="profile-value">
              <Compass size={16} /> {profile.goal}
              <button onClick={onEdit} aria-label="Edit career direction">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="profile-section">
            <div>
              <h3>Experience</h3>
              <p>How far you’ve come</p>
            </div>
            <div className="profile-value">
              <BriefcaseBusiness size={16} /> {profile.experience}
              <button onClick={onEdit} aria-label="Edit experience">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="profile-section">
            <div>
              <h3>Work preferences</h3>
              <p>Where and how you do your best work</p>
            </div>
            <div className="profile-value">
              <Target size={16} /> {profile.preference}
              <button onClick={onEdit} aria-label="Edit preferences">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <aside className="card profile-side">
          <div className="eyebrow">YOUR PROFILE AT A GLANCE</div>
          <h3>Your strengths tell a story.</h3>
          <p>Here are a few things we’ve learned about what you bring.</p>
          {['Product thinking', 'Visual storytelling', 'Cross-functional leadership', 'User-centered design'].map(x => (
            <div className="strength-row" key={x}>
              <CheckCircle2 size={16} />
              {x}
            </div>
          ))}
          <button className="text-link" onClick={() => go('Skill Gap Analysis')}>
            Review your skills <ArrowRight size={14} />
          </button>
        </aside>
      </div>
    </>
  )
}

function SettingsPage({ notify, onEditProfile }) {
  const [prefs, setPrefs] = useState(() =>
    loadJSON('northstar.settings', {
      weeklySummary: true,
      roleAlerts: false,
      learningReminders: true,
      localResume: true,
      personalizedMatches: true,
      keepChatHistory: false,
    })
  )

  const toggle = key => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem('northstar.settings', JSON.stringify(next))
      } catch {}
      notify('Preferences saved.')
      return next
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="YOUR SPACE, YOUR SETTINGS"
        title="Make Northstar yours."
        description="A few simple ways to keep your workspace feeling right."
      />

      <div className="settings-grid">
        <section className="card settings-card">
          <div className="settings-icon">
            <Bell size={18} />
          </div>
          <h3>Notifications</h3>
          <p>Choose what deserves a gentle nudge.</p>
          {[
            ['weeklySummary', 'Weekly progress summary', 'A calm recap of the steps you’ve taken'],
            ['roleAlerts', 'New role matches', 'Let me know when great-fit roles appear'],
            ['learningReminders', 'Learning reminders', 'A nudge for your planned learning sessions'],
          ].map(([key, label, desc]) => (
            <label className="setting-row" key={key}>
              <span>
                <strong>{label}</strong>
                <small>{desc}</small>
              </span>
              <span className="toggle-switch">
                <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} />
                <span className="toggle-slider" />
              </span>
            </label>
          ))}
        </section>

        <section className="card settings-card">
          <div className="settings-icon violet-bg">
            <ShieldCheck size={18} />
          </div>
          <h3>Privacy & data</h3>
          <p>You’re in control of your career information.</p>
          {[
            ['localResume', 'Resume privacy', 'Analyze resume locally whenever possible'],
            ['personalizedMatches', 'Personalized suggestions', 'Use profile details to improve matches'],
            ['keepChatHistory', 'Conversation history', 'Keep a private record of your coach chats'],
          ].map(([key, label, desc]) => (
            <label className="setting-row" key={key}>
              <span>
                <strong>{label}</strong>
                <small>{desc}</small>
              </span>
              <span className="toggle-switch">
                <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} />
                <span className="toggle-slider" />
              </span>
            </label>
          ))}
        </section>

        <section className="card settings-card">
          <div className="settings-icon cyan-bg">
            <UserRound size={18} />
          </div>
          <h3>Account</h3>
          <p>Manage how you use your workspace.</p>
          <button className="settings-link" onClick={onEditProfile}>
            Update your profile <ArrowRight size={15} />
          </button>
          <button className="settings-link" onClick={() => notify('Email preferences are up to date.')}>
            Email preferences <ArrowRight size={15} />
          </button>
          <button
            className="settings-link"
            onClick={() => notify('Press "/" anytime to jump straight to any career tool.')}
          >
            Keyboard shortcuts & tips <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </>
  )
}

export default App
