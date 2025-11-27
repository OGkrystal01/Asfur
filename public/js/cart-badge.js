// Global cart badge updater - runs on all pages
// Updates cart count badges across the site

(function() {
    'use strict';
    
    // Update all cart badges on the page
    function updateCartBadges() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update all badge elements
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = totalItems.toString();
            if (totalItems > 0) {
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        });
        
        // Also update cart-count spans if they exist
        const countElements = document.querySelectorAll('#cart-count, .mobile-cart-count');
        countElements.forEach(element => {
            element.textContent = totalItems.toString();
        });
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        updateCartBadges();
    });
    
    // Listen for cart updates from localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartBadges();
        }
    });
    
    // Listen for custom cart update events
    window.addEventListener('cartUpdated', function() {
        updateCartBadges();
    });
    
    // Make function globally available
    window.updateCartBadges = updateCartBadges;
    
    // Initial update (in case DOM is already loaded)
    if (document.readyState === 'loading') {
        // DOM still loading
        document.addEventListener('DOMContentLoaded', updateCartBadges);
    } else {
        // DOM already loaded
        updateCartBadges();
    }
})();
