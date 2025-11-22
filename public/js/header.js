// Load header component
document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
        
        // Initialize mobile menu after header is loaded
        initializeMobileMenu();
    }

    // Sticky header on scroll up - only header, not announcement bar
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const announcementBar = document.querySelector('.announcement-bar');
    const scrollThreshold = 100;
    let ticking = false;

    if (header) {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleStickyHeader();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function handleStickyHeader() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll <= scrollThreshold) {
            // Near top - normal position, not sticky
            header.classList.remove('header-sticky', 'header-hidden', 'header-visible');
        } else if (currentScroll > lastScrollTop) {
            // Scrolling down - header disappears naturally (not sticky)
            header.classList.remove('header-sticky', 'header-visible');
            header.classList.add('header-hidden');
        } else {
            // Scrolling up - make header sticky at top
            header.classList.remove('header-hidden');
            header.classList.add('header-sticky', 'header-visible');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    // Prevent annoying double-tap zoom on mobile while keeping normal taps
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
});

// Cart counter functionality disabled - no counter in UI

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu__close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}
