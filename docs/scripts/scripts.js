/* ============================================
   MOBILE NAV & OVERLAY
   Controls hamburger menu and mobile navigation
   ============================================ */

// Mobile Overlay Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggler = document.getElementById('menuToggle');
    const overlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

function showOverlay() {
  overlay.classList.add('active');
  toggler.classList.add('active');
  document.body.classList.add('overlay-open');
}

function hideOverlay() {
  overlay.classList.remove('active');
  toggler.classList.remove('active');
  document.body.classList.remove('overlay-open');
}

toggler.addEventListener('click', function(e) {
  e.preventDefault();
  overlay.classList.contains('active') ? hideOverlay() : showOverlay();
});

    // Close overlay when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', hideOverlay);
    });

    // Close overlay on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            hideOverlay();
        }
    });


/* ============================================
   ACCORDIAN
   Behavior of accordian on homepage experience, credit, & skills 
   ============================================ */

     // Accordian Reveal Behavior
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = header.closest('.accordion-section');
            if (section) {
                section.classList.toggle('open');
            }
        });
    });
});


/* ============================================
   INTERSECTION OBSERVER — Scroll Reveal
   Animates .projects and other grid cards
   into view as user scrolls down the page
   ============================================ */

   // Homepage project previews
const revealItems = document.querySelectorAll('.projects, .cover, .thumbnail');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 100}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { 
    threshold: 0,  // triggers the moment ANY part of the element enters viewport
 });

revealItems.forEach(el => observer.observe(el));


/* ============================================================
   TYPEWRITER HERO — global JS
   Targets: #hero-text (the headline container)
            #hero-cta  (the "Take a Peek" button)
 
   How it works at a high level:
   The script types each line of the headline one character at
   a time, stacking them as they complete. Once all three lines
   are on screen, the CTA fades in. After a hold period the
   whole block fades out and the cycle restarts from scratch.
   ============================================================ */

   (function () {
    const lines = [
      "Designed for humans.",
      "Fluent in machines.",
      "Obsessed with everything in-between."
    ];
  
    const TYPE_SPEED    = 52;   // ms per character
    const LINE_GAP      = 240;  // pause between lines finishing and next starting
    const CTA_DELAY     = 180;  // ms after last line before CTA appears
    const HOLD_DURATION = 4200; // ms the full statement stays visible
    const FADE_DURATION = 620;  // ms for the fade out transition
  
    const el  = document.getElementById('hero-text');   // your <h1>
    const btn = document.getElementById('main-cta');    // your existing CTA id
  
    if (!el || !btn) return;
  
    function typePhase(lineIndex, onDone) {
      let ci = 0;
      const cur    = lines[lineIndex];
      const prefix = lines.slice(0, lineIndex).join('\n');
  
      function tick() {
        ci++;
        const typed = cur.slice(0, ci);
        const full  = lineIndex === 0 ? typed : prefix + '\n' + typed;
        el.innerHTML = full.replace(/\n/g, '<br>') + '<span class="tw-cursor" aria-hidden="true"></span>';
  
        if (ci >= cur.length) {
          const gap = lineIndex === lines.length - 1 ? 0 : LINE_GAP;
          setTimeout(onDone, gap);
        } else {
          setTimeout(tick, TYPE_SPEED);
        }
      }
      tick();
    }
  
    function cycle() {
      el.style.opacity  = '1';
      btn.style.opacity = '0';
      el.innerHTML      = '';
  
      typePhase(0, () =>
        typePhase(1, () =>
          typePhase(2, () => {
            setTimeout(() => { btn.style.opacity = '1'; }, CTA_DELAY);
  
            setTimeout(() => {
              el.style.opacity  = '0';
              btn.style.opacity = '0';
              setTimeout(() => {
                el.innerHTML     = '';
                el.style.opacity = '1';
                setTimeout(cycle, 100);
              }, FADE_DURATION);
            }, HOLD_DURATION);
          })
        )
      );
    }
  
    cycle();
  })();