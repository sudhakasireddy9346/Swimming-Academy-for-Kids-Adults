/* ============ HELPERS ============ */
const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const drop = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
const HOME = 'index.html';
const emailOk = (v) => /^\S+@\S+\.\S+$/.test(v);

/* ============ THEME (dark / light) ============ */
const setTheme = (t) => {
  root.setAttribute('data-theme', t);
  $('themeBtn').innerHTML = t === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  store('aquaflow-theme', t);
};
setTheme(read('aquaflow-theme') || 'light');
$('themeBtn').addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ============ DIRECTION (RTL / LTR) ============ */
const setDir = (d) => {
  root.setAttribute('dir', d);
  $('rtlTxt').textContent = d === 'rtl' ? 'LTR' : 'RTL';
  store('aquaflow-dir', d);
};
setDir(read('aquaflow-dir') || 'ltr');
$('rtlBtn').addEventListener('click', () => {
  setDir(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl');
});

/* ============ TOAST ============ */
let toastTimer;
const toast = (text) => {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
};

/* ============ SHOW / HIDE PASSWORD ============ */
document.querySelectorAll('.eye').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.innerHTML = show
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';
  });
});

/* ============ FIELD VALIDATION HELPERS ============ */
const setError = (input, text) => {
  const err = $(input.id + 'Err');
  input.classList.toggle('invalid', !!text);
  input.classList.toggle('valid', !text && input.value.trim() !== '');
  input.setAttribute('aria-invalid', text ? 'true' : 'false');
  if (err) err.textContent = text || '';
  return !text;
};
const clearErrors = (form) => {
  form.querySelectorAll('input').forEach((i) => {
    i.classList.remove('invalid', 'valid');
    i.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.err').forEach((e) => { e.textContent = ''; });
};

const rules = {
  email: (v) => (emailOk(v.trim()) ? '' : 'Enter a valid email address.'),
  pass:  (v) => (v.length >= 6 ? '' : 'Use at least 6 characters.'),
  name:  (v) => (v.trim().length >= 2 ? '' : 'Enter your full name.')
};
const bindLive = (id, rule) => {
  const el = $(id);
  el.addEventListener('blur', () => setError(el, rule(el.value)));
  el.addEventListener('input', () => {
    if (el.classList.contains('invalid')) setError(el, rule(el.value));
  });
};
bindLive('lEmail', rules.email);
bindLive('lPass', rules.pass);
bindLive('sName', rules.name);
bindLive('sEmail', rules.email);
bindLive('sPass', rules.pass);
bindLive('fEmail', rules.email);

/* ============ CAPS LOCK WARNING ============ */
['lPass', 'sPass', 'sPass2'].forEach((id) => {
  const el = $(id);
  const warn = (e) => {
    if (id !== 'lPass' || !e.getModifierState) return;
    $('lCaps').hidden = !e.getModifierState('CapsLock');
  };
  el.addEventListener('keyup', warn);
  el.addEventListener('keydown', warn);
  el.addEventListener('blur', () => { if (id === 'lPass') $('lCaps').hidden = true; });
});

/* ============ PASSWORD STRENGTH ============ */
const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const scorePassword = (v) => {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
  return Math.max(1, s);
};
$('sPass').addEventListener('input', (e) => {
  const v = e.target.value;
  const level = v ? scorePassword(v) : 0;
  $('meter').dataset.level = level;
  $('meterLabel').textContent = level ? 'Password strength: ' + labels[level] : '';
  const c = $('sPass2');
  if (c.value) setError(c, c.value === v ? '' : 'Passwords do not match.');
});
$('sPass2').addEventListener('input', (e) => {
  setError(e.target, e.target.value === $('sPass').value ? '' : 'Passwords do not match.');
});

/* ============ VIEW SWITCHING ============ */
const views = {
  login: {
    form: 'loginForm', welcome: 'Welcome back', title: 'Sign in',
    sub: 'Your next lap starts here.', page: 'Sign In', alt: 'altLogin'
  },
  signup: {
    form: 'signupForm', welcome: 'Join the academy', title: 'Create account',
    sub: 'Dive in with a free member account.', page: 'Create Account', alt: 'altSignup'
  },
  forgot: {
    form: 'forgotForm', welcome: 'No worries', title: 'Reset password',
    sub: 'We will email you a link to choose a new one.', page: 'Reset Password', alt: null
  }
};

const showView = (name, focus) => {
  const v = views[name] || views.login;
  Object.values(views).forEach((x) => {
    $(x.form).hidden = x !== v;
    if (x.alt) $(x.alt).hidden = x !== v;
  });
  $('welcome').textContent = v.welcome;
  $('title').textContent = v.title;
  $('sub').textContent = v.sub;
  document.title = 'AQUAFLOW Swimming Academy | ' + v.page;
  ['lMsg', 'sMsg', 'fMsg'].forEach((id) => { $(id).textContent = ''; });
  clearErrors($(v.form));
  if (focus) {
    const first = $(v.form).querySelector('input:not([type=radio]):not([type=checkbox])');
    if (first) first.focus();
  }
};

const hashView = () => {
  const h = location.hash.replace('#', '');
  return views[h] ? h : 'login';
};
const goView = (name) => { location.hash = name; };

$('toSignup').addEventListener('click', () => goView('signup'));
$('toLogin').addEventListener('click', () => goView('login'));
$('toForgot').addEventListener('click', (e) => { e.preventDefault(); goView('forgot'); });
$('fBack').addEventListener('click', () => goView('login'));
[$('toSignup'), $('toLogin')].forEach((a) => {
  a.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); }
  });
});
window.addEventListener('hashchange', () => showView(hashView(), true));
showView(hashView(), false);

/* ============ SUBMIT HELPERS ============ */
const setLoading = (btn, on) => {
  btn.disabled = on;
  const text = btn.querySelector('.btn-text');
  if (on) {
    btn.dataset.label = text.textContent;
    text.textContent = 'PLEASE WAIT';
    btn.querySelector('i').className = 'spinner';
  } else {
    text.textContent = btn.dataset.label || text.textContent;
    btn.querySelector('i').className = 'fa-solid fa-arrow-right';
  }
};
const finish = (btn, el, text, redirect) => {
  setLoading(btn, true);
  setTimeout(() => {
    el.className = 'msg ok';
    el.textContent = text;
    toast(text);
    setLoading(btn, false);
    if (redirect) setTimeout(() => { location.href = HOME; }, 900);
  }, 700);
};
const fail = (el, text, input) => {
  el.className = 'msg';
  el.textContent = text;
  if (input) input.focus();
};

/* ============ REMEMBER ME ============ */
const savedEmail = read('aquaflow-remember');
if (savedEmail) {
  $('lEmail').value = savedEmail;
  $('remember').checked = true;
}

/* ============ SIGN IN ============ */
$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const m = $('lMsg');
  m.className = 'msg';
  m.textContent = '';
  const email = $('lEmail');
  const pass = $('lPass');
  const okEmail = setError(email, rules.email(email.value));
  const okPass = setError(pass, rules.pass(pass.value));
  if (!okEmail) return fail(m, 'Please check your email address.', email);
  if (!okPass) return fail(m, 'Please check your password.', pass);

  const value = email.value.trim();
  store('aquaflow-user', value);
  if ($('remember').checked) store('aquaflow-remember', value);
  else drop('aquaflow-remember');
  finish($('lBtn'), m, 'Signed in! Taking you to the home page…', true);
});

/* ============ CREATE ACCOUNT ============ */
$('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const m = $('sMsg');
  m.className = 'msg';
  m.textContent = '';
  const name = $('sName');
  const email = $('sEmail');
  const p1 = $('sPass');
  const p2 = $('sPass2');
  const terms = $('terms');

  const checks = [
    [name,  setError(name,  rules.name(name.value))],
    [email, setError(email, rules.email(email.value))],
    [p1,    setError(p1,    rules.pass(p1.value))],
    [p2,    setError(p2,    p2.value === p1.value && p2.value ? '' : 'Passwords do not match.')]
  ];
  const termsOk = terms.checked;
  $('termsErr').textContent = termsOk ? '' : 'Accept the terms to continue.';

  const bad = checks.find((c) => !c[1]);
  if (bad) return fail(m, 'Please fix the highlighted fields.', bad[0]);
  if (!termsOk) return fail(m, 'Please accept the terms to continue.', terms);

  const role = document.querySelector('input[name="role"]:checked').value;
  store('aquaflow-user', email.value.trim());
  store('aquaflow-role', role);
  finish($('sBtn'), m, 'Account created! Taking you to the home page…', true);
});
$('terms').addEventListener('change', () => { $('termsErr').textContent = ''; });

/* ============ FORGOT PASSWORD ============ */
$('forgotForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const m = $('fMsg');
  m.className = 'msg';
  m.textContent = '';
  const email = $('fEmail');
  if (!setError(email, rules.email(email.value))) {
    return fail(m, 'Enter the email you signed up with.', email);
  }
  finish($('fBtn'), m, 'Reset link sent. Check your inbox.', false);
});

/* ============ SOCIAL BUTTONS (PREVIEW ONLY) ============ */
document.querySelectorAll('.social').forEach((b) => {
  b.addEventListener('click', () => {
    toast(b.dataset.provider + ' sign-in is not available in this preview.');
  });
});