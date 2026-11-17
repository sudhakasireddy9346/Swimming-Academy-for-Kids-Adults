const $ = (s) => document.querySelector(s);
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

// Header shadow on scroll
const header = $('#header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 20));

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('show'), (i % 4) * 100);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Level roadmap
const LEVELS = [
  { t:'Water comfort', p:'Little Splashers', d:'Getting used to water on the face, blowing bubbles and moving safely in the shallow zone.', s:['Bubble breathing','Safe entry and exit','Walking and gliding in shallow water'] },
  { t:'Float and glide', p:'Little Splashers', d:'Learning to relax on the water, float on the front and back and push off the wall.', s:['Front and back float','Wall push-off glide','Recovering to standing'] },
  { t:'Kicks and breathing', p:'Little Splashers', d:'Building a steady flutter kick with rhythmic breathing and arm support.', s:['Flutter kick with a board','Side breathing basics','Swim 5 metres unaided'] },
  { t:'Freestyle', p:'Stroke Masters', d:'Linking arms, kicks and breathing into smooth freestyle over a full length.', s:['Arm pull and recovery','Bilateral breathing','Swim 25 metres freestyle'] },
  { t:'Backstroke', p:'Stroke Masters', d:'Body position, alternating arms and steady kicks on the back.', s:['Streamlined back position','Arm rotation','Swim 25 metres backstroke'] },
  { t:'Breaststroke and butterfly', p:'Stroke Masters', d:'Timing the frog kick and the dolphin kick with the matching arm patterns.', s:['Breaststroke timing','Dolphin kick drills','Short butterfly sets'] },
  { t:'Turns and endurance', p:'Stroke Masters', d:'Racing starts, tumble turns and longer mixed sets to build stamina.', s:['Dive start basics','Tumble turns','Continuous 200 metre sets'] }
];
let level = 0;
function renderRoad() {
  $('#road').innerHTML = LEVELS.map((l, i) =>
    '<button data-i="' + i + '" aria-pressed="' + (i === level) + '"><b>' + (i + 1) + '</b>' + esc(l.t.split(' ')[0]) + '</button>').join('');
  const l = LEVELS[level];
  $('#roadPanel').innerHTML = '<div><h3>Level ' + (level + 1) + ': ' + esc(l.t) + '</h3><p>' + esc(l.d) + '</p><span class="tag">' + esc(l.p) + '</span></div>'
    + '<ul>' + l.s.map((x) => '<li><i class="fa-solid fa-circle-check"></i>' + esc(x) + '</li>').join('') + '</ul>';
}
$('#road').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (!b) return;
  level = +b.dataset.i;
  renderRoad();
});
renderRoad();

// Testimonials (sample data)
const STORIES = [
  { n:'Priya Sharma', r:'Parent of a Little Splasher', q:'My daughter was scared of water. Eight weeks later she asks to go to the pool every day.' },
  { n:'Rahul Menon', r:'Stroke Masters member', q:'The coaches fixed my breathing in two sessions and my lap times dropped quickly.' },
  { n:'Sunita Rao', r:'Adult Aqua Fit member', q:'I started at 45 with no swimming skills. The batch is friendly and nobody makes you feel behind.' }
];
let story = 0, timer;
function showStory(i, animate) {
  story = (i + STORIES.length) % STORIES.length;
  const card = $('#tcard'), s = STORIES[story];
  const paint = () => {
    card.innerHTML = '<div class="stars">★★★★★</div><blockquote>“' + esc(s.q) + '”</blockquote><div class="who"><span class="av">'
      + esc(s.n.split(' ').map((w) => w[0]).join('')) + '</span><div><strong>' + esc(s.n) + '</strong><small>' + esc(s.r) + '</small></div></div>';
    card.classList.remove('fade');
  };
  if (animate) { card.classList.add('fade'); setTimeout(paint, 300); } else paint();
  $('#tdots').innerHTML = STORIES.map((_, k) => '<i data-k="' + k + '" class="' + (k === story ? 'on' : '') + '"></i>').join('');
}
function restartTimer() { clearInterval(timer); timer = setInterval(() => showStory(story + 1, true), 7000); }
$('#tPrev').addEventListener('click', () => { showStory(story - 1, true); restartTimer(); });
$('#tNext').addEventListener('click', () => { showStory(story + 1, true); restartTimer(); });
$('#tdots').addEventListener('click', (e) => {
  const d = e.target.closest('[data-k]');
  if (d) { showStory(+d.dataset.k, true); restartTimer(); }
});
showStory(0, false);
restartTimer();

// Newsletter
$('#newsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#newsMsg').textContent = 'Thanks for subscribing!';
  e.target.reset();
});