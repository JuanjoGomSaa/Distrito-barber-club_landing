

'use strict';

/* ─────────────────────────────────────────────────────────────
  
───────────────────────────────────────────────────────────── */
const CursorGlow = (() => {
  const el = document.getElementById('cursorGlow');
  if (!el) return {};

  let rafId = null;
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  // Lerp suave para que el glow "persiga" el cursor
  const LERP = 0.08;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animate() {
    currentX = lerp(currentX, mouseX, LERP);
    currentY = lerp(currentY, mouseY, LERP);
    el.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function init() {
    // Solo en dispositivos con hover (no táctiles)
    if (!window.matchMedia('(hover: hover)').matches) return;
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animate();
  }

  function destroy() {
    window.removeEventListener('mousemove', onMouseMove);
    cancelAnimationFrame(rafId);
  }

  init();
  return { destroy };
})();


/* ─────────────────────────────────────────────────────────────

───────────────────────────────────────────────────────────── */
const Navigation = (() => {
  const nav     = document.getElementById('mainNav');
  const toggle  = document.getElementById('navToggle');
  const links   = document.querySelector('.nav__links');

  if (!nav) return {};

  // Scroll listener con throttle
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }

  function openMenu() {
    links.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function onToggleClick() {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });

    toggle?.addEventListener('click', onToggleClick);

    // Cerrar al click en un link del menú móvil
    links?.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  init();
  return { closeMenu };
})();


/* ─────────────────────────────────────────────────────────────
   
───────────────────────────────────────────────────────────── */
const ScrollReveal = (() => {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return {};

  const options = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Dejar de observar para mejor performance
        observer.unobserve(entry.target);
      }
    });
  }, options);

  function init() {
    elements.forEach(el => observer.observe(el));
  }

  init();
  return { observer };
})();


/* ─────────────────────────────────────────────────────────────
   
───────────────────────────────────────────────────────────── */
const SmoothScroll = (() => {
  const NAV_HEIGHT = 72; // px — ajustar si cambia la altura del nav

  function scrollToTarget(id) {
    const target = document.querySelector(id);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function onLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    scrollToTarget(href);
  }

  function init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', onLinkClick);
    });
  }

  init();
  return { scrollToTarget };
})();


/* ─────────────────────────────────────────────────────────────

───────────────────────────────────────────────────────────── */
const StackStagger = (() => {
  function init() {
    document.querySelectorAll('.stack__card').forEach((card, i) => {
      card.style.setProperty('--stagger-i', i);
    });
  }

  init();
  return {};
})();


/* ─────────────────────────────────────────────────────────────

───────────────────────────────────────────────────────────── */
const ActiveNav = (() => {
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id], header[id]');

  if (!navLinks.length || !sections.length) return {};

  // Guarda el id de la sección actualmente activa
  let activeId = null;

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.style.color = 'var(--c-accent)';
      } else {
        link.style.color = '';
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  });

  function init() {
    sections.forEach(section => observer.observe(section));
  }

  init();
  return { observer };
})();



const ProjectCardHover = (() => {
  const cards = document.querySelectorAll('.project-card');

  // Solo en dispositivos con hover
  if (!window.matchMedia('(hover: hover)').matches) return {};

  function onMouseEnter(card) {
    card.style.transition = 'background 0.2s';
  }

  function onMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

    // Movimiento muy sutil del número
    const num = card.querySelector('.project-card__number');
    if (num) {
      num.style.transform = `translate(${x * 4}px, ${y * 4}px)`;
    }
  }

  function onMouseLeave(card) {
    const num = card.querySelector('.project-card__number');
    if (num) {
      num.style.transform = 'translate(0, 0)';
    }
  }

  function init() {
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => onMouseEnter(card));
      card.addEventListener('mousemove',  (e) => onMouseMove(e, card));
      card.addEventListener('mouseleave', () => onMouseLeave(card));
    });
  }

  init();
  return {};
})();


if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('%cJuanjo Portfolio — v1.0', 'color: #c8f463; font-family: monospace; font-size: 14px;');
  console.log('%cMódulos activos: CursorGlow, Navigation, ScrollReveal, SmoothScroll, StackStagger, ActiveNav, ProjectCardHover', 'color: #999490; font-size: 11px;');
}