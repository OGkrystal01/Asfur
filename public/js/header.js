// Load header component
document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
        
        // Initialize mobile menu after header is loaded
        initializeMobileMenu();
        
        // Update cart count after header is loaded
        updateCartCount();
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

// Update cart count
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        
        console.log('🔄 Cart update - Items:', totalItems, 'Cart:', cart);
        
        // Update all cart count elements
        const cartCounts = document.querySelectorAll('.cart-count');
        console.log('📍 Found cart count elements:', cartCounts.length);
        
        cartCounts.forEach((count, index) => {
            console.log(`  Updating element ${index}:`, count);
            count.textContent = totalItems;
            if (totalItems > 0) {
                count.style.display = 'flex';
                count.style.visibility = 'visible';
                count.style.opacity = '1';
            } else {
                count.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('❌ Error updating cart count:', error);
    }
}

// Listen for storage changes (when cart updates from other tabs/pages)
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        console.log('🔄 Cart changed in storage, updating count');
        updateCartCount();
    }
});

// Listen for custom cart update event
window.addEventListener('cartUpdated', function() {
    console.log('🔄 Cart updated event received');
    updateCartCount();
});

// Update cart count periodically as fallback
setInterval(updateCartCount, 500);

// Initial update on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Header.js loaded, updating cart count...');
    updateCartCount();
});

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
