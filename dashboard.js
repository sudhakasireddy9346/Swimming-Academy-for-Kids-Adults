const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const root = document.documentElement;
const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const parse = (k, d) => { try { return JSON.parse(read(k)) || d; } catch (e) { return d; } };

const BATCHES = [
  {id:'little', name:'Little Splashers', tag:'Ages 4-8 · Beginner', days:['Mon','Wed'], time:'5:00 PM', fee:1800, icon:'fa-child', lvl:35},
  {id:'stroke', name:'Stroke Masters', tag:'Ages 9-16 · Intermediate', days:['Tue','Thu'], time:'6:00 PM', fee:2200, icon:'fa-person-swimming', lvl:60},
  {id:'aqua', name:'Adult Aqua Fit', tag:'Adults · All levels', days:['Wed','Fri'], time:'7:00 PM', fee:2000, icon:'fa-dumbbell', lvl:45},
  {id:'early', name:'Early Bird Laps', tag:'Teens & Adults · Advanced', days:['Sat','Sun'], time:'6:30 AM', fee:2400, icon:'fa-stopwatch', lvl:80}
];
const COACHES = [
  {name:'Rohan Verma', role:'Head Coach', batch:'early', bio:'Former state-level freestyler focused on calm, efficient technique.', exp:'12 yrs'},
  {name:'Meera Nair', role:'Junior Coach', batch:'little', bio:'Makes first splashes fun and builds water confidence step by step.', exp:'7 yrs'},
  {name:'Karthik Rao', role:'Stroke Specialist', batch:'stroke', bio:'Breaks down butterfly, backstroke and breaststroke into simple drills.', exp:'9 yrs'},
  {name:'Anita Joshi', role:'Fitness Coach', batch:'aqua', bio:'Designs low-impact aqua workouts for every age and fitness level.', exp:'8 yrs'},
  {name:'Imran Sheikh', role:'Lifeguard Lead', batch:null, bio:'Keeps the pool safe and runs our water-safety refreshers.', exp:'10 yrs'},
  {name:'Divya Menon', role:'Assistant Coach', batch:'stroke', bio:'Supports intermediate groups with stroke feedback and pacing.', exp:'4 yrs'}
];
const HISTORY = [
  {id:'RC-1042', month:'October 2026', amount:2200, status:'Paid'},
  {id:'RC-1018', month:'September 2026', amount:2200, status:'Paid'},
  {id:'RC-0991', month:'August 2026', amount:4000, status:'Paid'},
  {id:'RC-0967', month:'July 2026', amount:1800, status:'Paid'},
  {id:'RC-0944', month:'June 2026', amount:2200, status:'Pending'}
];
const DEFAULT_NOTES = [
  {id:1, icon:'fa-water', title:'Welcome to AQUAFLOW', text:'Browse batches and enrol in minutes.', time:'Today', unread:true},
  {id:2, icon:'fa-droplet', title:'Pool maintenance', text:'Pool closed Sunday 2-4 PM.', time:'Yesterday', unread:true},
  {id:3, icon:'fa-trophy', title:'Club gala announced', text:'Friendly race day is planned next month. Sign up at the front desk.', time:'3 days ago', unread:false},
  {id:4, icon:'fa-credit-card', title:'Fee reminder', text:'Monthly fees are due by the 5th of each month.', time:'1 week ago', unread:false}
];
const LEVELS = ['Water comfort','Float & glide','Kicks','Freestyle','Advanced strokes'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const ATT = [1,1,1,0,1,1,1,1,0,1,1,1,1,1];

let enrolled = parse('af-enrolled', ['stroke']);
let paid = read('af-paid') === '1';
let notes = parse('af-notes', DEFAULT_NOTES);
let profile = parse('af-profile', {name:'Aarav Reddy', email:'aarav@example.com', phone:'', goal:'Improve technique'});
let prefs = parse('af-prefs', {remind:true, fees:true, closure:true, events:false});
let calDate = new Date(); calDate.setDate(1);

const mine = () => BATCHES.filter((b) => enrolled.includes(b.id));
const inr = (n) => '\u20B9' + n.toLocaleString('en-IN');
const first = () => (profile.name || 'Member').split(' ')[0];
const initials = () => (profile.name || 'M').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const save = () => { store('af-enrolled', JSON.stringify(enrolled)); store('af-paid', paid ? '1' : '0'); };
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function esc(s){return String(s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function renderMain(){
  const m = mine(), total = m.reduce((s,b)=>s+b.fee,0);
  const att = Math.round(ATT.filter(Boolean).length / ATT.length * 100);
  const next = m[0];
  $('#stats').innerHTML = [
    ['fa-person-swimming','ENROLLED BATCHES', m.length, 'Keep swimming'],
    ['fa-calendar-check','NEXT CLASS', next ? next.days[0]+' '+next.time : '-', next ? next.name : 'Enrol to see your schedule'],
    ['fa-clipboard-user','ATTENDANCE', att+'%', 'Last 14 sessions'],
    ['fa-credit-card','MONTHLY FEES', inr(total), paid ? 'Paid this month' : (m.length ? 'Payment due' : 'No batch selected')]
  ].map(s=>`<div class="card stat"><span class="ic"><i class="fa-solid ${s[0]}"></i></span><div><small>${s[1]}</small><b>${s[2]}</b><span>${s[3]}</span></div></div>`).join('');

  $('#upcoming').innerHTML = m.length ? m.map(b=>`<div class="row"><div class="when"><b>${b.days[0]}</b>${b.time}</div><div class="grow"><b>${b.name}</b><span>${b.days.join(' & ')} · ${b.tag}</span></div><span class="tag">${b.time}</span></div>`).join('') : '<p class="empty">Enrol in a batch to start building your schedule.</p>';
  $('#feeMini').innerHTML = `<div class="row"><b style="font-family:'Playfair Display',serif;font-size:1.8rem">${inr(total)}</b><span class="grow sub" style="margin:0">${m.length ? m.length+' active batch'+(m.length>1?'es':'') : 'No enrolments yet'}</span><button class="btn btn-secondary" data-go="fees">View details <i class="fa-solid fa-arrow-right"></i></button></div>`;

  const card = (b, on) => `<div class="card bcard ${on?'on':''}"><div class="ic"><i class="fa-solid ${b.icon}"></i></div><span class="badge">${b.tag}</span><h3 style="margin-top:.6rem">${b.name}</h3>
    <div class="meta"><div><i class="fa-solid fa-calendar-day"></i>${b.days.join(' & ')}</div><div><i class="fa-solid fa-clock"></i>${b.time}</div><div><i class="fa-solid fa-indian-rupee-sign"></i>${inr(b.fee)} / month</div></div>
    <button class="btn ${on?'btn-danger':'btn-primary'}" data-toggle="${b.id}">${on?'Leave batch':'Enrol now'} <i class="fa-solid fa-arrow-right"></i></button></div>`;
  $('#allBatches').innerHTML = BATCHES.map(b=>card(b, enrolled.includes(b.id))).join('');
  $('#myBatches').innerHTML = m.length ? m.map(b=>card(b,true)).join('') : '<div class="card empty" style="grid-column:1/-1">You have not joined any batch yet.</div>';

  $('#sched').innerHTML = DAYS.map(d=>{const c=m.filter(b=>b.days.includes(d));return `<tr><td><b>${d}</b></td><td>${c.length?c.map(b=>`<span class="slotp">${b.time} · ${b.name}</span>`).join(''):'<span class="sub">Rest day</span>'}</td></tr>`}).join('');

  $('#ring').style.setProperty('--p', att); $('#ringTxt').innerHTML = att+'%<small>present</small>';
  $('#dots').innerHTML = ATT.map((a,i)=>`<span class="${a?'':'miss'}" title="Session ${i+1}">${a?'<i class="fa-solid fa-check"></i>':'<i class="fa-solid fa-xmark"></i>'}</span>`).join('');
  $('#skills').innerHTML = m.length ? m.map(b=>{const i=Math.min(4,Math.floor(b.lvl/20));return `<div style="margin-bottom:1.4rem"><div class="row" style="padding:0;border:0"><b class="grow">${b.name}</b><span class="tag">${LEVELS[i]}</span></div><div class="bar"><i style="width:${b.lvl}%"></i></div><div class="ladder">${LEVELS.map((l,j)=>`<span class="${j<=i?'done':''}">${l}</span>`).join('')}</div></div>`}).join('') : '<p class="empty">Enrol in a batch to track your skill level.</p>';

  $('#feeRows').innerHTML = m.length ? m.map(b=>`<tr><td><b>${b.name}</b></td><td>${b.days.join(' & ')} · ${b.time}</td><td>${inr(b.fee)}</td></tr>`).join('') : '<tr><td colspan="3" class="empty">No enrolments yet</td></tr>';
  $('#total').textContent = inr(total);
  $('#paidBadge').textContent = paid ? 'Paid' : 'Unpaid';
  $('#payBtn').disabled = !m.length;
}

function renderCoaches(){
  $('#coachGrid').innerHTML = COACHES.map((c)=>{
    const b = BATCHES.find((x)=>x.id===c.batch);
    return `<div class="card coach"><div class="photo">${c.name.split(' ').map((w)=>w[0]).join('')}</div><h3>${c.name}</h3><span class="badge">${c.role}</span>
      <p>${c.bio}</p><div class="sub" style="margin:0 0 .8rem">${c.exp} experience${b?' · '+b.name:''}</div>
      ${b?`<button class="btn ${enrolled.includes(b.id)?'btn-secondary':'btn-primary'}" data-go="enrol">${enrolled.includes(b.id)?'You train here':'See batch'} <i class="fa-solid fa-arrow-right"></i></button>`:'<span class="tag">Pool safety</span>'}</div>`;
  }).join('');
}

function renderCalendar(){
  const y = calDate.getFullYear(), mo = calDate.getMonth(), m = mine();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7;
  const count = new Date(y, mo + 1, 0).getDate();
  const now = new Date();
  $('#calTitle').textContent = calDate.toLocaleDateString('en-IN', {month:'long', year:'numeric'});
  let html = DAYS.map((d)=>`<div class="dow">${d.toUpperCase()}</div>`).join('');
  for (let i = 0; i < lead; i++) html += '<div class="day blank"></div>';
  for (let d = 1; d <= count; d++) {
    const name = DAYS[(lead + d - 1) % 7];
    const isToday = d === now.getDate() && mo === now.getMonth() && y === now.getFullYear();
    const items = m.filter((b)=>b.days.includes(name)).map((b)=>`<em title="${b.name}">${b.time} ${b.name}</em>`).join('');
    html += `<div class="day ${isToday?'today':''}"><b>${d}</b>${items}</div>`;
  }
  $('#calGrid').innerHTML = html;
}

function renderHistory(){
  const f = $('#histFilter').value;
  const rows = HISTORY.filter((h)=>f==='all' || h.status===f);
  $('#histRows').innerHTML = rows.length ? rows.map((h)=>`<tr><td><b>${h.id}</b></td><td>${h.month}</td><td>${inr(h.amount)}</td><td><span class="${h.status==='Paid'?'tag':'badge'}">${h.status}</span></td></tr>`).join('') : '<tr><td colspan="4" class="empty">No receipts match this filter</td></tr>';
  const sum = (s) => HISTORY.filter((h)=>h.status===s).reduce((t,h)=>t+h.amount,0);
  $('#histSum').innerHTML = `<div class="row"><div class="grow"><b>Paid</b><span>${HISTORY.filter((h)=>h.status==='Paid').length} receipts</span></div><b>${inr(sum('Paid'))}</b></div>
    <div class="row"><div class="grow"><b>Pending</b><span>${HISTORY.filter((h)=>h.status==='Pending').length} receipts</span></div><b>${inr(sum('Pending'))}</b></div>`;
}

function renderNotes(){
  const unread = notes.filter((n)=>n.unread).length;
  const dot = $('#bellDot'); dot.textContent = unread; dot.style.display = unread ? 'grid' : 'none';
  $('#noteList').innerHTML = notes.length ? notes.map((n)=>`<div class="note ${n.unread?'unread':''}"><span class="av"><i class="fa-solid ${n.icon}"></i></span><div class="grow"><b>${esc(n.title)}</b><span>${esc(n.text)}</span><small>${n.time}</small></div><button class="ib" data-read="${n.id}" aria-label="Toggle read"><i class="fa-solid ${n.unread?'fa-envelope-open':'fa-envelope'}"></i></button></div>`).join('') : '<p class="empty">You are all caught up.</p>';
  $('#miniNotes').innerHTML = notes.slice(0,2).map((n)=>`<div class="row"><span class="av"><i class="fa-solid ${n.icon}"></i></span><div class="grow"><b>${esc(n.title)}</b><span>${esc(n.text)}</span></div></div>`).join('');
}

function renderProfile(){
  $('#pName').value = profile.name; $('#pEmail').value = profile.email;
  $('#pPhone').value = profile.phone; $('#pGoal').value = profile.goal;
  $$('[data-pref]').forEach((c)=>{ c.checked = !!prefs[c.dataset.pref]; });
  $('#avatar').textContent = initials(); $('#meName').textContent = profile.name;
}

function greet(){
  const h = new Date().getHours();
  $('#hello').textContent = (h<12?'Good morning':h<17?'Good afternoon':'Good evening') + ', ' + first();
  $('#day').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long'}).toUpperCase() + ' · MEMBER DASHBOARD';
}

function render(){ renderMain(); renderCoaches(); renderCalendar(); renderHistory(); renderNotes(); renderProfile(); greet(); }

// navigation
const titles = {overview:'Overview',programs:'My batches',schedule:'My schedule',calendar:'Class calendar',enrol:'Enrol in a batch',coaches:'Coaches',progress:'Attendance & skills',fees:'Fees & payments',history:'Payment history',notices:'Notifications',profile:'Profile settings'};
function go(v){
  if(!titles[v]) v='overview';
  $$('.view').forEach(s=>s.classList.toggle('show', s.id==='v-'+v));
  $$('#menu button').forEach(b=>b.classList.toggle('active', b.dataset.view===v));
  $('#crumb').textContent = titles[v];
  $('#side').classList.remove('open'); $('#scrim').classList.remove('show');
  scrollTo({top:0,behavior:'smooth'});
  if(location.hash!=='#'+v) history.replaceState(null,'','#'+v);
}
document.addEventListener('click', (e)=>{
  const r = e.target.closest('[data-read]');
  if (r) { const n = notes.find((x)=>x.id===+r.dataset.read); if (n) { n.unread = !n.unread; store('af-notes', JSON.stringify(notes)); renderNotes(); } return; }
  const t = e.target.closest('[data-view],[data-go],[data-toggle]'); if(!t) return;
  if(t.dataset.view) go(t.dataset.view);
  else if(t.dataset.go) go(t.dataset.go);
  else { const id=t.dataset.toggle; enrolled = enrolled.includes(id) ? enrolled.filter(x=>x!==id) : [...enrolled,id]; paid=false; save(); render(); toast(enrolled.includes(id)?'Enrolled successfully':'You left the batch'); }
});
$('#payBtn').onclick = () => { paid=true; save(); render(); toast('Payment marked as paid (demo)'); };
$('#rcpt').onclick = () => toast('Sample receipt downloaded (demo)');
$('#bell').onclick = () => go('notices');
$('#readAll').onclick = () => { notes.forEach((n)=>{ n.unread = false; }); store('af-notes', JSON.stringify(notes)); renderNotes(); toast('All notifications marked as read'); };
$('#burger').onclick = () => { $('#side').classList.toggle('open'); $('#scrim').classList.toggle('show'); };
$('#scrim').onclick = () => { $('#side').classList.remove('open'); $('#scrim').classList.remove('show'); };
$('#calPrev').onclick = () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); };
$('#calNext').onclick = () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); };
$('#histFilter').onchange = renderHistory;
$('#saveProfile').onclick = () => {
  const name = $('#pName').value.trim(), email = $('#pEmail').value.trim();
  if (!name) return toast('Please enter your name');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return toast('Please enter a valid email');
  profile = {name, email, phone:$('#pPhone').value.trim(), goal:$('#pGoal').value};
  store('af-profile', JSON.stringify(profile)); renderProfile(); greet(); toast('Profile saved');
};
$$('[data-pref]').forEach((c)=>{ c.onchange = () => { prefs[c.dataset.pref] = c.checked; store('af-prefs', JSON.stringify(prefs)); toast('Preference updated'); }; });
$('#resetDemo').onclick = () => {
  ['af-enrolled','af-paid','af-notes','af-profile','af-prefs'].forEach((k)=>{ try { localStorage.removeItem(k); } catch (e) {} });
  enrolled = ['stroke']; paid = false; notes = DEFAULT_NOTES.map((n)=>({...n})); prefs = {remind:true, fees:true, closure:true, events:false};
  profile = {name:'Aarav Reddy', email:'aarav@example.com', phone:'', goal:'Improve technique'};
  render(); toast('Demo data reset');
};

// theme + rtl
const themeBtn=$('#themeBtn');
const setTheme=(t)=>{root.setAttribute('data-theme',t);themeBtn.innerHTML=t==='dark'?'<i class="fa-solid fa-sun"></i>':'<i class="fa-solid fa-moon"></i>';store('aquaflow-theme',t);};
setTheme(read('aquaflow-theme')||'light');
themeBtn.onclick=()=>setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');
const setDir=(d)=>{root.setAttribute('dir',d);$('#rtlTxt').textContent=d==='rtl'?'LTR':'RTL';store('aquaflow-dir',d);};
setDir(read('aquaflow-dir')||'ltr');
$('#rtlBtn').onclick=()=>setDir(root.getAttribute('dir')==='rtl'?'ltr':'rtl');

render(); go(location.hash.slice(1)||'overview');