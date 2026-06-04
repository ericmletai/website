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