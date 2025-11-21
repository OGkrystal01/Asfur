// Load header component
document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
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
