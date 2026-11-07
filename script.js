'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Mobile navigation ---------- */
const nav = $('#nav');
const toggle = $('#navToggle');
const links = $('#navLinks');

const setMenu = (open) => {
  toggle.setAttribute('aria-expanded', open);
  links.classList.toggle('open', open);
  nav.classList.toggle('menu-open', open);
};
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
$$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Sticky nav background ---------- */
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Active link highlighting ---------- */
const sections = $$('main section[id]');
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

/* ---------- Scroll reveal ---------- */
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 80 + 'ms'; // gentle stagger
  revealObs.observe(el);
});

/* ---------- 3D card tilt (desktop pointers only) ---------- */
if (canHover && !reduceMotion) {
  $$('.tilt').forEach(card => {
    const max = card.classList.contains('project') ? 2.5 : 7;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------- Hero parallax: layers move by their data-depth ---------- */
  const hero = $('#home');
  const layers = $$('[data-depth]', hero);
  let raf = null;
  hero.addEventListener('pointermove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      layers.forEach(l => {
        const d = +l.dataset.depth;
        l.style.translate = `${-x * d}px ${-y * d}px`;
      });
      raf = null;
    });
  });
}

/* ---------- Footer year ---------- */
$('#year').textContent = new Date().getFullYear();
