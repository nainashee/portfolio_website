/* =============================================
   HUSSAIN ASHFAQUE PORTFOLIO — MAIN JS
   Scroll animations · Nav · Interactions
   ============================================= */

// ── SCROLL ANIMATIONS ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}

// ── SMOOTH REVEAL ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  // Trigger hero elements immediately
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  }, 100);
});

// ── ACTIVE NAV LINK ──
const currentPath = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── CONTACT FORM ──
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
      name:    contactForm.name.value,
      email:   contactForm.email.value,
      subject: contactForm.subject?.value || 'Portfolio Contact',
      message: contactForm.message.value,
    };

    // AWS SES endpoint (replace with your API Gateway URL)
    const API_ENDPOINT = 'YOUR_API_GATEWAY_ENDPOINT';

    try {
      // For now, simulate success (replace with real API call)
      await new Promise(r => setTimeout(r, 1200));
      document.getElementById('form-success').classList.add('show');
      contactForm.style.display = 'none';
    } catch (err) {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      alert('Something went wrong. Please try again or email me directly at nain.ashee@gmail.com');
    }
  });
}

// ── LIGHTBOX ──
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  document.querySelectorAll('.photo-item[data-src]').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── WALLPAPER DOWNLOAD ──
document.querySelectorAll('.wallpaper-btn[data-src]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const src  = btn.dataset.src;
    const name = btn.dataset.name || 'wallpaper.jpg';
    const a    = document.createElement('a');
    a.href     = src;
    a.download = name;
    a.click();
  });
});

// ── CURSOR GLOW EFFECT (desktop) ──
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(122,158,126,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: transform 0.12s ease, opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
    glow.style.opacity = '1';
  }, { passive: true });
  window.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}
