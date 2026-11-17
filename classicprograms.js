const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const rtlBtn = document.getElementById('rtlBtn');
const rtlTxt = document.getElementById('rtlTxt');
const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

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
document.getElementById('burger').addEventListener('click', () => document.getElementById('nav').classList.toggle('open'));

// Header shadow on scroll
const header = document.getElementById('header');
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

// Newsletter
document.getElementById('newsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('newsMsg').textContent = 'Thanks for subscribing!';
  e.target.reset();
});