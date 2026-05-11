// Mobile Overlay Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggler = document.querySelector('.navbar-toggler');
    const overlay = document.getElementById('mobile-overlay');
    const closeBtn = document.getElementById('close-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Function to show overlay
    function showOverlay() {
        overlay.classList.add('active');
        document.body.classList.add('overlay-open');
    }

    // Function to hide overlay
    function hideOverlay() {
        overlay.classList.remove('active');
        document.body.classList.remove('overlay-open');
    }

    // Toggle overlay on hamburger click
    toggler.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent any default Bootstrap behavior
        if (overlay.classList.contains('active')) {
            hideOverlay();
        } else {
            showOverlay();
        }
    });

    // Close overlay on close button click
    closeBtn.addEventListener('click', hideOverlay);

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