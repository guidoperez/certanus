
/* main.js - navigation, smooth scrolling, scrollspy, header hidden/show, and form validation */

document.addEventListener('DOMContentLoaded', () =>{

    const header = document.querySelector('.site-header');
    const nav = document.getElementById('primary-nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [...document.querySelectorAll('section[id]')];
    const yearEl = document.getElementById('year');
    const backToTop = document.querySelector('.back-to-top');

    // Footer year
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile nav toggle
    navToggle?.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open');
    });

    // Close mobile  nav on link click
    navLinks.forEach(link => link.addEventListener('click', () =>{
        nav.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
    }));

    // Smooth scrolling refinement (prefers-reduced-motion respected)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId.length > 1) {
                const el = document.querySelector(targetId);
                if (el) {
                    e.preventDefault();
                    const y = el.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
                    if (prefersReduced) window.scrollTo(0,y);
                    else window.scrollTo({top: y, behavior: 'smooth'});
                    // Move focus for accessibility
                    el.setAttribute('tabindex', '-1');
                    el.focus({ preventScroll: true });
                }
            }
        });
    });

    // Hide header on scroll down, show on scroll up
//    let lastY = window.scrollY;
//    window.addEventListener('scroll', () => {
//        const y = window.scrollY;
//        if (y > lastY && y > 120) header.classList.add('hide');
//        else header.classList.remove('hide');
//        lastY = y <= 0 ? 0 : y;
//    }, { passive: true });

    // Scrollspy (highlight active nav link)
    const observer= new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.nav a[href="#${id}"]`);
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
                link?.classList.add('active');
            }
        });
    }, {
        rootMargin: '-60px 0px -70% 0px',
        threshold: 0.1
    });
    sections.forEach(sec => observer.observe(sec));

    // Back to top improves focus
    backToTop?.addEventListener('click', (e) => {
        if (!prefersReduced){
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.focus?.();
        }
    });

    // Contact form validation (client-side)
    const form = document.getElementById('contact-form');
    if (form) {
        const fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message'),
            captcha: document.getElementById('captcha')
        };
        const errors = {
            name: document.getElementById('error-name'),
            email: document.getElementById('error-email'),
            subject: document.getElementById('error-subject'),
            message: document.getElementById('error-message'),
            captcha: document.getElementById('error-captcha')
        };
        const captchaQuestionEl = document.getElementById('captcha-question');
        let _captchaAnswer = null;
        const generateCaptcha = () => {
            const a = Math.floor(Math.random() * 9) + 1;
            const b = Math.floor(Math.random() * 9) + 1;
            _captchaAnswer = a + b;
            if (captchaQuestionEl) captchaQuestionEl.textContent = `${a} + ${b}`;
        };
        generateCaptcha();
        const status = document.getElementById('form-status');
        const submitBtn = document.getElementById('submit-btn');

        const validators = {
            name: v => v.trim().length >= 2 || 'Please enter your full name.',
            email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
            subject: v => v.trim().length >= 3 || 'Subject must be at least 3 characters.',
            message: v => v.trim().length >= 10 || 'Message must be at least 10 characters.',
            captcha: v => {
                if (!v || String(v).trim().length === 0) return 'Please solve the captcha.';
                const n = parseInt(v, 10);
                return n === _captchaAnswer || 'Incorrect sum. Please try again.';
            }
        };

        const showError = (key, msg) => { if (!errors[key]) return; errors[key].textContent = typeof msg === 'string' ? msg : ''; }
        const validateField = (key) => {
            const el = fields[key];
            if (!el) return true;
            const value = el.value;
            const res = validators[key](value);
            showError(key, res === true ? '' : res);
            return res === true;
        };

        Object.keys(fields).forEach(key => {
            const el = fields[key];
            if (!el) return;
            el.addEventListener('input', () => validateField(key));
            el.addEventListener('blur', () => validateField(key));
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.textContent = '';
            let valid = true;
            Object.keys(fields).forEach(key => { if (!validateField(key)) valid = false; });
            if (!valid) {
                status.textContent = 'Please fix the highlighted fields.';
                return;
            }

            // Demo submission (no backend) . Replace with fetch('/api/contact', { ... })
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending ...';

            try {
                await new Promise(r => setTimeout(r, 900)); //simulate
                submitBtn.textContent = 'Sent Ok';
                status.style.color = getComputedStyle(document.documentElement)
                    .getPropertyValue('--success');
                status.textContent = 'Thanks! Your message has been sent.';
                form.reset();
            } catch (err) {
                status.style.color = getComputedStyle(document.documentElement)
                    .getPropertyValue('--danger');
                status.textContent = 'Something went wrong. Please try again.';
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }, 1500);
            }
        });
    }
})