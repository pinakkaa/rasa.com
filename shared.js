/* ======================== NAVBAR SCROLL ======================== */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

/* ======================== HAMBURGER MENU ======================== */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on any mobile nav link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ======================== SCROLL ANIMATIONS ======================== */
function initPageAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.fade-up').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

/* ======================== HERO ANIMATIONS (home only) ======================== */
function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroTitle   = document.getElementById('heroTitle');
  const heroSub     = document.getElementById('heroSub');
  const heroButtons = document.getElementById('heroButtons');
  if (!heroTitle) return;

  gsap.set([heroEyebrow, heroTitle, heroSub, heroButtons], { y: 40, opacity: 0 });
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(heroEyebrow, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to(heroTitle,   { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
    .to(heroSub,     { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .to(heroButtons, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
}

/* ======================== FOOTER FORM SUBMIT ======================== */
function handleFooterForm(btn) {
  const form = btn.closest('.footer-contact-col') || btn.closest('form');
  btn.textContent = 'Sent ✓';
  btn.style.background = 'var(--deep-brown)';
  btn.style.color = 'var(--cream)';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.style.color = '';
  }, 3000);
}

/* ======================== CONTACT PAGE FORM SUBMIT ======================== */
function handleFormSubmit(btn) {
  btn.textContent = 'Message Sent ✓';
  btn.style.background = 'var(--deep-brown)';
  btn.style.color = 'var(--cream)';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.style.color = '';
  }, 3000);
}

/* ======================== INIT ======================== */
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  initHeroAnimations();
  initPageAnimations();
});
