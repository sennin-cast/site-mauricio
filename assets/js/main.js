/**
 * Maurício Gimenez — Nutricionista Esportivo
 * main.js — Interações, animações e acessibilidade
 */

'use strict';

function onReady(fn) {
  if (document.readyState !== 'loading') { fn(); }
  else { document.addEventListener('DOMContentLoaded', fn); }
}

function debounce(fn, delay = 60) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── HEADER & MENU MOBILE ─────────────────────────────────────── */
function initHeader() {
  const header = $('#header');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-nav-link, .mobile-cta');

  if (!header) return;

  const handleScroll = debounce(() => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, 10);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !hamburger.classList.contains('active');
    hamburger.classList.toggle('active', isOpen);
    mobileMenu.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger?.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('active')) {
      toggleMenu(false);
    }
  });
}

/* ─── SCROLL SUAVE ─────────────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const headerH = $('#header')?.offsetHeight || 72;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
}

/* ─── ACTIVE NAV LINK HIGHLIGHT ────────────────────────────────── */
function initActiveNav() {
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');
  if (!navLinks.length || !sections.length) return;

  const headerH = () => $('#header')?.offsetHeight || 72;

  const activate = debounce(() => {
    const scroll = window.scrollY + headerH() + 40;
    let current = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scroll) current = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === current);
    });
  }, 80);

  window.addEventListener('scroll', activate, { passive: true });
  activate();
}

/* ─── REVEAL ON SCROLL ─────────────────────────────────────────── */
function initReveal() {
  const heroSection = $('.hero-section');
  const els = $$('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').filter(el => {
    return !heroSection?.contains(el);
  });
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

    els.forEach(el => observer.observe(el));
  } else {
    els.forEach(el => el.classList.add('revealed'));
  }
}

/* ─── FAQ ACCORDION ────────────────────────────────────────────── */
function initFAQ() {
  const faqItems = $$('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ─── WHATSAPP FLOAT VISIBILITY ────────────────────────────────── */
function initWhatsappFloat() {
  const btn = $('.whatsapp-float');
  if (!btn) return;

  btn.style.opacity = '0';
  btn.style.transform = 'translateY(16px)';
  btn.style.pointerEvents = 'none';

  const show = debounce(() => {
    if (window.scrollY > 280) {
      btn.style.opacity = '1';
      btn.style.transform = 'none';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(16px)';
      btn.style.pointerEvents = 'none';
    }
  }, 40);

  window.addEventListener('scroll', show, { passive: true });
}

/* ─── MODAL DE PRIVACIDADE (LGPD) ──────────────────────────────── */
function initPrivacyModal() {
  const modal = $('#privacyModal');
  const openBtn = $('#privacyModalBtn');
  const closeBtn = $('#privacyCloseBtn');
  const backdrop = $('#privacyBackdrop');

  if (!modal || !openBtn) return;

  function toggle(open) {
    modal.classList.toggle('active', open);
    modal.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn?.focus();
  }

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggle(true);
  });

  closeBtn?.addEventListener('click', () => toggle(false));
  backdrop?.addEventListener('click', () => toggle(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      toggle(false);
    }
  });
}

/* ─── BOTAO MAGNETICO (DESKTOP) ────────────────────────────────── */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  $$('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.16;
      const dy   = (e.clientY - cy) * 0.16;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ─── CARD 3D TILT (DESKTOP) ───────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = $$('.specialty-card, .pillar-card, .plan-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rotX = ((e.clientY - cy) / (rect.height / 2)) * -3;
      const rotY = ((e.clientX - cx) / (rect.width  / 2)) *  3;
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─── FOOTER YEAR ──────────────────────────────────────────────── */
function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── HERO ENTRANCE ────────────────────────────────────────────── */
function initHeroEntrance() {
  const heroSection = $('.hero-section');
  const heroImg = $('.hero-bg-img');
  if (!heroSection) return;

  if (heroImg?.complete) {
    heroSection.classList.add('loaded');
  } else {
    heroImg?.addEventListener('load', () => heroSection.classList.add('loaded'), { once: true });
  }

  const eyebrow  = $('.hero-eyebrow');
  const title    = $('.hero-title');
  const subtitle = $('.hero-subtitle');
  const actions  = $('.hero-actions-col');

  [eyebrow, title, subtitle, actions].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
  });
}



/* ═══ CARROSSEL DE RESULTADOS ═══════════════════════════════════════ */
function initResultsCarousel() {
  const carousel = $('.carousel-results');
  if (!carousel) return;

  const track    = $('#carouselTrack');
  const prevBtn  = $('#carouselPrev');
  const nextBtn  = $('#carouselNext');
  const dotsWrap = $('#carouselDots');
  const cards    = $$('.carousel-results__card', carousel);

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  let maxIndex     = Math.max(0, cards.length - cardsPerView);
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 5000;

  function getCardsPerView() {
    const w = window.innerWidth;
    if (w <= 768) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const totalDots = maxIndex + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-results__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Resultado ${i + 1} de ${totalDots}`);
      dot.setAttribute('type', 'button');
      if (i === 0) {
        dot.classList.add('is-active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.setAttribute('aria-selected', 'false');
      }
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = $$('.carousel-results__dot', dotsWrap);
    dots.forEach((d, i) => {
      const active = i === currentIndex;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', String(active));
    });
  }

  function updateActiveCards() {
    cards.forEach((card, i) => {
      const isVisible = i >= currentIndex && i < currentIndex + cardsPerView;
      card.classList.toggle('is-active', isVisible);
    });
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    // Calculate translate
    const card = cards[0];
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const cardW = card.offsetWidth + gap;
    const offset = currentIndex * cardW;

    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
    updateActiveCards();

    // Button states
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === maxIndex;
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  // Button listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); resetAutoplay(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(); resetAutoplay(); e.preventDefault(); }
  });

  // Touch / Swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragOffset = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = true;
    dragStartX = touchStartX;
    track.classList.add('is-dragging');
    resetAutoplay();
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    // Only horizontal swipe
    if (Math.abs(dy) > Math.abs(dx)) return;

    const card = cards[0];
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const cardW = card.offsetWidth + gap;
    const baseOffset = currentIndex * cardW;
    dragOffset = -baseOffset + dx;
    track.style.transform = `translateX(${dragOffset}px)`;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');

    const dx = e.changedTouches[0].clientX - dragStartX;
    const threshold = 50;

    if (dx < -threshold) {
      next();
    } else if (dx > threshold) {
      prev();
    } else {
      goTo(currentIndex); // snap back
    }
  }, { passive: true });

  // Mouse drag (desktop)
  let mouseDown = false;
  let mouseStartX = 0;

  track.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    track.classList.add('is-dragging');
    e.preventDefault();
    resetAutoplay();
  });

  document.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    const dx = e.clientX - mouseStartX;
    const card = cards[0];
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const cardW = card.offsetWidth + gap;
    const baseOffset = currentIndex * cardW;
    track.style.transform = `translateX(${-baseOffset + dx}px)`;
  });

  document.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    track.classList.remove('is-dragging');
    const dx = e.clientX - mouseStartX;
    const threshold = 50;

    if (dx < -threshold) next();
    else if (dx > threshold) prev();
    else goTo(currentIndex);
  });

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (currentIndex >= maxIndex) {
        goTo(0);
      } else {
        next();
      }
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover/focus
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  // Resize handler
  const handleResize = debounce(() => {
    const newCPV = getCardsPerView();
    if (newCPV !== cardsPerView) {
      cardsPerView = newCPV;
      maxIndex = Math.max(0, cards.length - cardsPerView);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      buildDots();
      goTo(currentIndex);
    }
  }, 150);

  window.addEventListener('resize', handleResize, { passive: true });

  // Init
  buildDots();
  goTo(0);
  startAutoplay();
}

/* ─── INITIALIZATION ───────────────────────────────────────────── */
onReady(() => {
  initHeader();
  initSmoothScroll();
  initActiveNav();
  initReveal();
  initFAQ();
  initPrivacyModal();
  initFooterYear();
  initMagneticButtons();
  initCardTilt();
  initHeroEntrance();
  initWhatsappFloat();
});
