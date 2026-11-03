const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeURL = value => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const state = {resume: null, jobs: []};
const names = {dashboard:'Overview',resume:'Resume & ATS',jobs:'Find opportunities',tracker:'Application tracker',interview:'Interview practice'};

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
function toast(message, error = false) {
  const el = $('#toast'); el.textContent = message; el.classList.toggle('error', error); el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3200);
}
function navigate(view) {
  if (!names[view]) view = 'dashboard';
  $$('.view').forEach(el => el.classList.toggle('active', el.id === `view-${view}`));
  $$('.nav a').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  $('#crumb-current').textContent = names[view];
  if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
  window.scrollTo({top:0, behavior:'smooth'});
}
document.addEventListener('click', event => {
  const target = event.target.closest('[data-go]');
  if (target) navigate(target.dataset.go);
  const nav = event.target.closest('.nav a[data-view]');
  if (nav) { event.preventDefault(); navigate(nav.dataset.view); }
});
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));

$('#resume-file').addEventListener('change', event => {
  const file = event.target.files[0]; $('#file-name').textContent = file ? file.name : 'Browse files';
});
$('#resume-form').addEventListener('submit', async event => {
  event.preventDefault();
  const file = $('#resume-file').files[0]; if (!file) return toast('Choose a resume file first.', true);
  const button = event.currentTarget.querySelector('button[type=submit]'); button.disabled = true; button.textContent = 'Analyzing…'; $('#resume-message').textContent = 'Reading your resume locally';
  try {
    const form = new FormData(); form.append('resume', file); form.append('job_description', $('#job-description').value);
    const data = await api('/api/resume/analyze', {method:'POST', body:form}); state.resume = data.resume;
    $('#resume-snapshot').textContent = state.resume.name || 'Ready to review';
    renderResume(data); $('#resume-message').textContent = 'Analysis complete';
  } catch (error) { $('#resume-message').textContent = ''; toast(error.message, true); }
  finally { button.disabled = false; button.innerHTML = 'Analyze resume <span>→</span>'; }
});
function renderResume(data) {
  const r = data.resume, score = data.score, findings = data.security || {};
  let html = '';
  if (findings.injection || findings.hidden_text) html += `<div class="result-block"><h2>Document safety note</h2><p class="muted">Instruction-like or hidden text was detected. It is treated as untrusted content during any AI review.</p></div>`;
  if (score) html += `<div class="result-block"><h2>ATS overview</h2><div class="metric-grid">${[['Overall match',score.overall],['Keyword overlap',score.keyword_match],['Sections',score.section_completeness],['Readability',score.readability]].map(([name,val])=>`<div class="metric"><small>${escapeHTML(name)}</small><strong>${Number(val).toFixed(1)}%</strong></div>`).join('')}</div><p class="muted">This is a local text comparison, not a hiring probability. Add skills only where they reflect your real experience.</p><div class="keyword-columns"><div class="keyword-box"><h3>Matched terms</h3><p>${escapeHTML(score.matched_keywords.join(', ') || 'No matching terms found yet.')}</p></div><div class="keyword-box"><h3>Terms to review</h3><p>${escapeHTML(score.missing_keywords.join(', ') || 'No major keyword gaps found.')}</p></div></div>${score.suggestions.length?`<ul>${score.suggestions.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`:''}</div>`;
  else html += `<div class="result-block"><h2>Resume ready to review</h2><p class="muted">Add a job description above to see keyword overlap and an ATS overview.</p></div>`;
  const pii = (findings.findings||[]).filter(x => /^(email|phone|ssn|url):/.test(x));
  if (pii.length) html += `<div class="result-block"><h2>Privacy check</h2><p class="muted">Contact details were found in the resume. They are redacted before text is sent for AI coaching.</p></div>`;
  html += `<div class="result-block"><h2>AI career coach</h2><p class="muted">Optional coaching compares your resume with the role and returns evidence-based suggestions. Your contact details are redacted.</p><button class="button primary" id="coach-button" ${!$('#job-description').value.trim()?'disabled':''}>Get resume feedback <span>→</span></button><div id="coach-results"></div></div>`;
  $('#resume-results').innerHTML = html;
  $('#coach-button')?.addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true; button.textContent = 'Reviewing…';
    try { const review = await api('/api/resume/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resume:r.raw_text,job_description:$('#job-description').value})});
      $('#coach-results').innerHTML = `<p>${escapeHTML(review.fit_summary)}</p>${[['Strengths',review.strengths],['Gaps to address',review.gaps],['Recommended actions',review.actions]].map(([label,items])=>`<h3>${label}</h3><ul>${items.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`).join('')}${review.bullet_rewrites.map(x=>`<div class="keyword-box"><h3>Suggested bullet rewrite</h3><p><b>Original:</b> ${escapeHTML(x.original)}<br><b>Suggestion:</b> ${escapeHTML(x.rewrite)}<br>${escapeHTML(x.evidence_note)}</p></div>`).join('')}<p class="muted">Verify every suggestion before using it.</p>`;
    } catch (error) { toast(error.message, true); } finally { button.disabled = false; button.innerHTML = 'Get resume feedback <span>→</span>'; }
  });
}

$('#job-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.disabled = true; button.textContent = 'Searching…';
  $('#jobs-heading').textContent = 'Searching opportunities';
  try { const data = await api('/api/jobs/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:$('#job-query').value,location:$('#job-location').value})}); state.jobs = data.jobs; $('#job-count').textContent = data.jobs.length; $('#jobs-heading').textContent = `${data.jobs.length} ${data.jobs.length===1?'opportunity':'opportunities'}`; renderJobs(data.jobs); }
  catch (error) { toast(error.message,true); $('#jobs-heading').textContent='Search could not be completed'; }
  finally { button.disabled=false; button.innerHTML='Search jobs <span>→</span>'; }
});
function renderJobs(jobs) {
  if (!jobs.length) { $('#jobs-results').innerHTML='<div class="empty-state"><span>⌕</span><strong>No matching opportunities yet.</strong><p>Try a broader role title or another location.</p></div>'; return; }
  $('#jobs-results').innerHTML = jobs.map((job,index) => { const safety=job.safety||{}; const level=['low','medium','high'].includes(safety.risk_level)?safety.risk_level:'low'; const url=safeURL(job.url);
    return `<article class="job-card"><div class="job-top"><div><h2 class="job-title">${escapeHTML(job.title)}</h2><p class="job-company">${escapeHTML(job.company)}${job.location?` · ${escapeHTML(job.location)}`:''}</p></div><span class="risk ${level}">${level} risk</span></div><p class="job-description">${escapeHTML(job.description||'No description was provided.')}</p><div class="job-actions">${url?`<a class="link-button" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">View posting ↗</a>`:''}<button class="subtle-button save-job" data-index="${index}">Add to tracker +</button><span class="job-risk-note">${escapeHTML(safety.recommendation||'Verify the employer and recruiter.')}</span></div>${safety.flags?.length?`<p class="muted">Signals to review: ${escapeHTML(safety.flags.join(', '))}</p>`:''}</article>`;
  }).join('');
  $$('.save-job').forEach(button => button.addEventListener('click', async () => {const job=jobs[Number(button.dataset.index)];try{await api('/api/tracker',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:job.title,company:job.company,status:'Saved',notes:'Added from job search'})});toast('Added to your application tracker.');loadTracker();}catch(error){toast(error.message,true);}}));
}

$('#tracker-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.disabled=true;
  try { const data=await api('/api/tracker',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:$('#track-title').value,company:$('#track-company').value,status:$('#track-status').value,notes:$('#track-notes').value})}); event.currentTarget.reset(); renderTracker(data.applications); toast('Application added.'); }
  catch(error){toast(error.message,true);} finally{button.disabled=false;}
});
async function loadTracker(){try{const data=await api('/api/tracker');renderTracker(data.applications);}catch(error){toast(error.message,true);}}
function renderTracker(items){$('#tracker-total').textContent=items.length;$('#application-count').textContent=items.length;
  if(!items.length){$('#tracker-results').innerHTML='<div class="empty-state"><span>▣</span><strong>Your tracker is ready.</strong><p>Add your first role above. Saved applications will appear here.</p></div>';return;}
  $('#tracker-results').innerHTML=`<div class="application-list">${items.map(item=>`<div class="application-row"><div><strong>${escapeHTML(item.title)}</strong><small>Added ${escapeHTML((item.created_at||'').slice(0,10))}</small></div><div><strong>${escapeHTML(item.company)}</strong></div><span class="badge ${escapeHTML(item.status.toLowerCase())}">${escapeHTML(item.status)}</span><small class="notes-cell">${escapeHTML(item.notes||'No follow-up note')}</small></div>`).join('')}</div>`;
}

$('#interview-form').addEventListener('submit', async event => {
  event.preventDefault(); const button=event.currentTarget.querySelector('button');button.disabled=true;button.textContent='Preparing…';
  try{const data=await api('/api/interview/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:$('#interview-role').value,count:$('#interview-count').value})});renderQuestions(data.questions,$('#interview-role').value);}
  catch(error){toast(error.message,true);}finally{button.disabled=false;button.innerHTML='Create practice round <span>→</span>';}
});
function renderQuestions(questions,role){$('#interview-results').innerHTML=questions.map((item,index)=>`<article class="question-card" data-question="${index}"><div class="question-top"><span class="question-index">QUESTION ${String(index+1).padStart(2,'0')}</span><span class="question-category">${escapeHTML(item.category)}</span></div><h3>${escapeHTML(item.question)}</h3><textarea placeholder="Use Situation, Action, and Result to shape a clear example."></textarea><button class="button primary feedback-button" style="margin-top:10px" type="button">Get feedback <span>→</span></button><div class="feedback-slot"></div></article>`).join('');
  $$('.feedback-button').forEach(button=>button.addEventListener('click',async()=>{const card=button.closest('.question-card'),answer=$('textarea',card).value.trim();if(!answer)return toast('Write an answer before requesting feedback.',true);button.disabled=true;button.textContent='Reviewing…';try{const feedback=await api('/api/interview/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answer,role,question:questions[Number(card.dataset.question)].question})});const ai=feedback.ai_review||{};$('.feedback-slot',card).innerHTML=`<div class="feedback"><div class="feedback-score">${escapeHTML(ai.score??feedback.score)}<small>%</small></div><p>${escapeHTML(ai.feedback||feedback.feedback)}</p>${ai.strengths?.length?`<strong>What worked</strong><ul>${ai.strengths.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`:''}${ai.improvements?.length?`<strong>Try next</strong><ul>${ai.improvements.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`:''}${ai.example_follow_up?`<p><strong>Practice follow-up:</strong> ${escapeHTML(ai.example_follow_up)}</p>`:''}</div>`;}catch(error){toast(error.message,true);}finally{button.disabled=false;button.innerHTML='Get feedback <span>→</span>';}}));}

async function initialize(){navigate(location.hash.slice(1)||'dashboard');loadTracker();try{const status=await api('/api/status');if(status.ai_enabled)$('#ai-status').textContent='AI coaching enabled';}catch{} }
initialize();
