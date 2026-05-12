/* ============================================================
   NAV.JS — Le Clue Portfolio
   Handles three things:
   1. Active nav link — highlights current page
   2. Slim nav — shrinks nav on scroll
   3. Tab switching — shared logic for tabbed pages
   ============================================================ */

/* ----------------------------------------------------------
   1. ACTIVE NAV LINK
   Compares each link's href to the current page URL and
   applies the active class + aria-current to the match.
   Handles both root (index.html) and pages/ subdirectory.
---------------------------------------------------------- */
function setActiveLink() {
  const links = document.querySelectorAll('.nav__link');
  const current = window.location.pathname;

  links.forEach(link => {
    const href = new URL(link.href).pathname;

    const isHome = (href === '/' || href.endsWith('index.html'))
                && (current === '/' || current.endsWith('index.html') || current === '');

    const isMatch = !isHome && href !== '/' && current.endsWith(href.split('/').pop());

    if (isHome || isMatch) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* ----------------------------------------------------------
   2. SLIM NAV ON SCROLL
   Adds .nav--slim to the nav element once the user scrolls
   past 20px. Removes it when back at the top.
   Only applies on pages where scrolling is possible.
---------------------------------------------------------- */
function initSlimNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let ticking = false;

  function updateNav() {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', scrolled);
    nav.classList.toggle('nav--slim', scrolled);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
}

/* ----------------------------------------------------------
   3. TAB SWITCHING
   Generic tab system used on About, Q&A, and CV pages.
   Looks for .tabs containers and wires up click handlers.

   HTML structure expected:
   <div class="tabs">
     <button class="tab active" data-tab="panel-one">Label</button>
     <button class="tab" data-tab="panel-two">Label</button>
   </div>
   <div class="tab-panel active" id="panel-one">...</div>
   <div class="tab-panel" id="panel-two">...</div>
---------------------------------------------------------- */
function initTabs() {
  const tabGroups = document.querySelectorAll('.tabs');

  tabGroups.forEach(group => {
    const tabs = group.querySelectorAll('.tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        if (!targetId) return;

        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const allPanels = document.querySelectorAll('.tab-panel');
        allPanels.forEach(panel => {
          panel.classList.toggle('active', panel.id === targetId);
        });
      });
    });
  });
}

/* ----------------------------------------------------------
   DEMO CARD LAUNCH
   Wires up "Launch Demo" buttons on the portfolio page.
   Logs the view to Supabase then opens the demo in a new tab.

   HTML expected:
   <button class="btn btn--primary launch-demo" data-demo="vaultic" data-url="https://...">
     Launch Demo
   </button>
---------------------------------------------------------- */
function initDemoLaunchers() {
  const launchers = document.querySelectorAll('.launch-demo');

  launchers.forEach(btn => {
    btn.addEventListener('click', async () => {
      const demoName = btn.dataset.demo;
      const demoUrl  = btn.dataset.url;

      if (demoName && window.LC?.logDemoView) {
        await window.LC.logDemoView(demoName);
      }

      if (demoUrl) {
        window.open(demoUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

/* ----------------------------------------------------------
   CV DOWNLOAD TRACKING
   Wires up the CV download button to log before downloading.

   HTML expected:
   <a class="btn btn--primary cv-download" href="./assets/files/leclue-cv.pdf" download>
     Download CV
   </a>
---------------------------------------------------------- */
function initCvDownload() {
  const downloadBtn = document.querySelector('.cv-download');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', () => {
    if (window.LC?.logCvDownload) {
      window.LC.logCvDownload();
    }
  });
}

/* ----------------------------------------------------------
   CONTACT FORM
   Wires up the contact form to submitContact().
   Shows inline success/error feedback without page reload.

   HTML expected:
   <form class="contact-form" novalidate>
     <input class="form-input" name="name" type="text" required>
     <input class="form-input" name="email" type="email" required>
     <textarea class="form-textarea" name="message" required></textarea>
     <button class="btn btn--primary" type="submit">Send message</button>
     <p class="form-feedback" aria-live="polite"></p>
   </form>
---------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const feedback = form.querySelector('.form-feedback');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.querySelector('[name="name"]')?.value.trim();
    const email   = form.querySelector('[name="email"]')?.value.trim();
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !email || !message) {
      if (feedback) {
        feedback.textContent = 'Please fill in all fields.';
        feedback.style.color = 'var(--rust-400)';
      }
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const ok = await window.LC?.submitContact({ name, email, message });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }

    if (feedback) {
      if (ok) {
        feedback.textContent = 'Message sent — I\'ll be in touch soon.';
        feedback.style.color = 'var(--teal-400)';
        form.reset();
      } else {
        feedback.textContent = 'Something went wrong. Please try again or email me directly.';
        feedback.style.color = 'var(--rust-400)';
      }
    }
  });
}

/* ----------------------------------------------------------
   INIT — runs everything on DOMContentLoaded
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setActiveLink();
  initSlimNav();
  initTabs();
  initDemoLaunchers();
  initCvDownload();
  initContactForm();
});