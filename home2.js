 /* ----- Element references ----- */
        const root = document.documentElement;
        const themeBtn = document.getElementById('themeBtn');
        const rtlBtn = document.getElementById('rtlBtn');
        const rtlTxt = document.getElementById('rtlTxt');
        const burger = document.getElementById('burger');
        const nav = document.getElementById('nav');
        const header = document.getElementById('header');

        /* ----- Safe localStorage helpers (fail silently if storage is blocked) ----- */
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

        /* ----- Dark / Light mode ----- */
        const setTheme = (theme) => {
            root.setAttribute('data-theme', theme);
            themeBtn.innerHTML = theme === 'dark'
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
            store('aquaflow-theme', theme);
        };

        setTheme(read('aquaflow-theme') || 'light');

        themeBtn.addEventListener('click', () => {
            setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });

        /* ----- RTL / LTR direction ----- */
        const setDir = (direction) => {
            root.setAttribute('dir', direction);
            rtlTxt.textContent = direction === 'rtl' ? 'LTR' : 'RTL';
            store('aquaflow-dir', direction);
        };

        setDir(read('aquaflow-dir') || 'ltr');

        rtlBtn.addEventListener('click', () => {
            setDir(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl');
        });

        /* ----- Mobile menu toggle ----- */
        burger.addEventListener('click', () => {
            nav.classList.toggle('open');
        });

        /* ----- Header shadow on scroll ----- */
        addEventListener('scroll', () => {
            header.classList.toggle('scrolled', scrollY > 20);
        });

        /* ----- Scroll reveal animation ----- */
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

        /* ----- Splash Reel: duplicate each row so the loop is seamless ----- */
        document.querySelectorAll('.track').forEach((track) => {
            track.innerHTML += track.innerHTML;
        });

        /* ----- Splash Reel: count-up stats ----- */
        const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

        const countUp = (el) => {
            const target = Number(el.dataset.count);
            const suffix = el.dataset.suffix || '';

            if (prefersReducedMotion()) {
                el.textContent = target.toLocaleString() + suffix;
                return;
            }

            const duration = 1800;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased).toLocaleString() + suffix;
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };

            requestAnimationFrame(step);
        };

        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-count]').forEach((el) => {
            countObserver.observe(el);
        });

        /* ----- Testimonial slider ----- */
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('#dots button');
        let current = 0;
        let timer;

        const showSlide = (number) => {
            current = number;
            slides.forEach((slide, index) => {
                slide.classList.toggle('on', index === number);
            });
            dots.forEach((dot, index) => {
                dot.setAttribute('aria-current', index === number ? 'true' : 'false');
            });
        };

        const startAuto = () => {
            clearInterval(timer);
            if (!prefersReducedMotion()) {
                timer = setInterval(() => {
                    showSlide((current + 1) % slides.length);
                }, 6000);
            }
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                startAuto();
            });
        });

        startAuto();

        /* ----- Newsletter form ----- */
        document.getElementById('newsForm').addEventListener('submit', (event) => {
            event.preventDefault();
            document.getElementById('newsMsg').textContent = 'Thanks for subscribing!';
            event.target.reset();
        });