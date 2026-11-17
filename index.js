/* =====================================================
   AQUAFLOW - Home 1 scripts
   ===================================================== */

/* ---------- element references ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const rtlBtn = document.getElementById('rtlBtn');
const rtlTxt = document.getElementById('rtlTxt');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const header = document.getElementById('header');

/* ---------- safe localStorage helpers ---------- */
const store = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    /* storage blocked: ignore */
  }
};

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

/* ---------- dark / light mode ---------- */
const setTheme = (theme) => {
  root.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }

  store('aquaflow-theme', theme);
};

setTheme(read('aquaflow-theme') || 'light');

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

/* ---------- RTL / LTR direction ---------- */
const setDir = (direction) => {
  root.setAttribute('dir', direction);
  rtlTxt.textContent = direction === 'rtl' ? 'LTR' : 'RTL';
  store('aquaflow-dir', direction);
};

setDir(read('aquaflow-dir') || 'ltr');

rtlBtn.addEventListener('click', () => {
  const current = root.getAttribute('dir');
  setDir(current === 'rtl' ? 'ltr' : 'rtl');
});

/* ---------- mobile menu ---------- */
burger.addEventListener('click', () => {
  nav.classList.toggle('open');
});

/* ---------- header shadow on scroll ---------- */
addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 20);
});

/* ---------- scroll reveal animation ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('show');
      }, (index % 4) * 100);

      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((element) => {
  revealObserver.observe(element);
});

/* ---------- animated number counters ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const element = entry.target;
    const end = Number(element.dataset.count);
    const step = Math.max(1, Math.ceil(end / 60));
    let count = 0;

    const timer = setInterval(() => {
      count = Math.min(end, count + step);
      element.textContent = count;

      if (count === end) {
        clearInterval(timer);
      }
    }, 25);

    counterObserver.unobserve(element);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((counter) => {
  counterObserver.observe(counter);
});

/* ---------- newsletter form ---------- */
document.getElementById('newsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('newsMsg').textContent = 'Thanks for subscribing!';
  event.target.reset();
});