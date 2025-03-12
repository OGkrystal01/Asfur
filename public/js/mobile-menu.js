document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu__close');
    const body = document.body;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    body.appendChild(overlay);

    // Toggle menu
    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    // Event listeners
    mobileMenuToggle.addEventListener('click', toggleMenu);
    mobileMenuClose.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Sync cart count
    const cartCount = document.getElementById('cart-count');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    
    // Update mobile cart count when main cart count changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                mobileCartCount.textContent = cartCount.textContent;
            }
        });
    });

    observer.observe(cartCount, {
        characterData: true,
        childList: true,
        subtree: true
    });
});
