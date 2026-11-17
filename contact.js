/* AQUAFLOW - Contact page scripts */

/* ---------- helpers ---------- */
const root = document.documentElement;

const $ = (id) => {
  return document.getElementById(id);
};

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
    $('themeBtn').innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    $('themeBtn').innerHTML = '<i class="fa-solid fa-moon"></i>';
  }

  store('aquaflow-theme', theme);
};

setTheme(read('aquaflow-theme') || 'light');

$('themeBtn').addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

/* ---------- RTL / LTR direction ---------- */
const setDir = (direction) => {
  root.setAttribute('dir', direction);
  $('rtlTxt').textContent = direction === 'rtl' ? 'LTR' : 'RTL';
  store('aquaflow-dir', direction);
};

setDir(read('aquaflow-dir') || 'ltr');

$('rtlBtn').addEventListener('click', () => {
  const current = root.getAttribute('dir');
  setDir(current === 'rtl' ? 'ltr' : 'rtl');
});

/* ---------- mobile menu and header shadow ---------- */
$('burger').addEventListener('click', () => {
  $('nav').classList.toggle('open');
});

addEventListener('scroll', () => {
  $('header').classList.toggle('scrolled', scrollY > 20);
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

/* ---------- contact form validation ---------- */
$('contactForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const message = $('formMsg');
  message.className = 'form-msg';

  if ($('cName').value.trim().length < 2) {
    message.textContent = 'Please enter your full name.';
    return;
  }

  if (!/^[+\d][\d\s-]{7,}$/.test($('cPhone').value.trim())) {
    message.textContent = 'Please enter a valid phone number.';
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test($('cEmail').value.trim())) {
    message.textContent = 'Please enter a valid email address.';
    return;
  }

  if ($('cMsg').value.trim().length < 5) {
    message.textContent = 'Please write a short message.';
    return;
  }

  message.className = 'form-msg ok';
  message.textContent = 'Thank you! Our team will contact you within one working day.';
  event.target.reset();
});

/* ---------- newsletter form ---------- */
$('newsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  $('newsMsg').textContent = 'Thanks for subscribing!';
  event.target.reset();
});