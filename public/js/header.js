// Load header component
document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
    }

    // Sticky header on scroll up - E-commerce style
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const scrollThreshold = 80;
    let ticking = false;

    if (header) {
        // Initial state
        header.classList.add('header-visible');
        
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
            // At top of page - normal position
            header.classList.remove('header-sticky', 'header-hidden');
            header.classList.add('header-visible');
        } else if (currentScroll > lastScrollTop) {
            // Scrolling down - hide header
            header.classList.remove('header-visible', 'header-sticky');
            header.classList.add('header-hidden');
        } else {
            // Scrolling up - show sticky header
            header.classList.remove('header-hidden');
            header.classList.add('header-sticky', 'header-visible');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    // Update cart count
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Update mobile cart count
    const mobileCartCounts = document.querySelectorAll('.mobile-cart-count');
    mobileCartCounts.forEach(count => {
        count.textContent = totalItems;
    });

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
