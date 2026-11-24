 const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const root = document.documentElement;
const themeBtn = $('#themeBtn');
const rtlBtn = $('#rtlBtn');
const rtlTxt = $('#rtlTxt');
const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Dark / light mode
const setTheme = (t) => {
  root.setAttribute('data-theme', t);
  themeBtn.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  store('aquaflow-theme', t);
};
setTheme(read('aquaflow-theme') || 'light');
themeBtn.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

// RTL / LTR
const setDir = (d) => {
  root.setAttribute('dir', d);
  rtlTxt.textContent = d === 'rtl' ? 'LTR' : 'RTL';
  store('aquaflow-dir', d);
};
setDir(read('aquaflow-dir') || 'ltr');
rtlBtn.addEventListener('click', () => setDir(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl'));

// Mobile menu
$('#burger').addEventListener('click', () => $('#nav').classList.toggle('open'));


// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('show'), (i % 4) * 100);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$('.reveal').forEach((el) => io.observe(el));

// Schedule filter + search
const tabs = $$('.tab');
const rows = $$('#rows tr');
let activeFilter = 'all';
function applySchedule() {
  const q = $('#searchBox').value.trim().toLowerCase();
  let shown = 0;
  rows.forEach((r) => {
    const okCat = activeFilter === 'all' || r.dataset.cat.split(' ').includes(activeFilter);
    const okText = !q || r.textContent.toLowerCase().includes(q);
    r.hidden = !(okCat && okText);
    if (!r.hidden) shown++;
  });
  $('#noResult').classList.toggle('show', shown === 0);
}
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeFilter = tab.dataset.filter;
    tabs.forEach((t) => t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'));
    applySchedule();
  });
});
$('#searchBox').addEventListener('input', applySchedule);

// Read the schedule table into data (used by the finder and trial form)
const BATCHES = rows.map((r) => {
  const c = r.cells;
  return {
    cats: r.dataset.cat.split(' '),
    time: c[0].querySelector('strong').textContent,
    window: c[0].querySelector('small').textContent,
    days: c[1].textContent,
    program: c[2].textContent,
    coach: c[3].textContent,
    seats: c[4].textContent.trim()
  };
});
const WINDOW_KEY = { 'Early morning':'early', 'Morning':'morning', 'Weekend morning':'morning', 'Evening':'evening', 'Night':'night', 'Flexible':'any' };

// Slot finder
$('#finderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const age = $('#fAge').value, pref = $('#fTime').value, seat = $('#fSeat').value;
  const list = BATCHES.filter((b) => b.cats.includes(age)
    && (pref === 'any' || WINDOW_KEY[b.window] === pref || b.window === 'Flexible')
    && (seat === 'all' || b.seats !== 'Waitlist'));
  const out = $('#finderOut');
  $('#finderHint').classList.remove('show');
  out.classList.add('show');
  out.innerHTML = list.length
    ? '<h4>' + list.length + ' batch' + (list.length > 1 ? 'es' : '') + ' found</h4>' + list.map((b) =>
        '<div class="match"><strong>' + esc(b.program) + '</strong><span>' + esc(b.time) + ' · ' + esc(b.days) + ' · Coach ' + esc(b.coach) + ' · ' + esc(b.seats) + '</span></div>').join('')
    : '<h4>No exact match</h4><p class="hint">Try "Any time" or include waitlist batches. You can also ask the front desk about a private session.</p>';
});

// Date helper (used by the holidays list)
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

// Holidays (sample data)
const HOLIDAYS = [
  { d:'2026-11-08', t:'Diwali break', n:'Pool closed for the festival day' },
  { d:'2026-12-25', t:'Christmas Day', n:'All batches closed' },
  { d:'2027-01-01', t:'New Year maintenance', n:'Deep clean and water testing' },
  { d:'2027-01-14', t:'Sankranti', n:'Pool closed for the festival' },
  { d:'2027-01-26', t:'Republic Day', n:'Morning batches only' },
  { d:'2027-03-14', t:'Quarterly maintenance', n:'Filter service, evening batches closed' }
];
const today = iso(new Date());
$('#holList').innerHTML = HOLIDAYS.map((h) => {
  const dt = new Date(h.d + 'T00:00:00');
  const mon = dt.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
  return '<div class="hol reveal' + (h.d < today ? ' past' : '') + '"><div class="date"><b>' + dt.getDate() + '</b><small>' + mon + '</small></div><div><h3>' + esc(h.t) + '</h3><p>' + esc(h.n) + (h.d < today ? ' (past)' : '') + '</p></div></div>';
}).join('');
$$('#holList .reveal').forEach((el) => io.observe(el));

// Fee plans (sample pricing)
const DISCOUNT = { 1: 0, 3: 0.05, 6: 0.1 };
const rupees = (n) => '\u20B9' + Math.round(n).toLocaleString('en-IN');
function renderPlans(period) {
  const off = DISCOUNT[period];
  $$('#planGrid .plan').forEach((card) => {
    const fee = +card.dataset.fee;
    const total = fee * period * (1 - off);
    card.querySelector('.price').textContent = rupees(total);
    card.querySelector('.per').textContent = period === 1 ? 'per month' : 'for ' + period + ' months (' + rupees(total / period) + ' / month)';
    card.querySelector('.save').textContent = off ? 'You save ' + rupees(fee * period - total) : '';
  });
}
$('#billing').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-period]');
  if (!btn) return;
  $$('#billing button').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
  renderPlans(+btn.dataset.period);
});
renderPlans(1);

// Newsletter
$('#newsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#newsMsg').textContent = 'Thanks for subscribing!';
  e.target.reset();
});