// Load header component
document.addEventListener('DOMContentLoaded', async () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
    }

    // Header visibility control
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const scrollThreshold = 100;

    // Make header always visible on product pages
    const isProductPage = window.location.pathname.includes('product.html');
    if (isProductPage) {
        header.classList.add('visible');
        header.style.position = 'relative';
    } else {
        // Normal scroll behavior for other pages
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > scrollThreshold) {
                if (scrollTop < lastScrollTop) {
                    header.classList.add('visible');
                } else {
                    header.classList.remove('visible');
                }
            } else {
                header.classList.add('visible');
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // Update cart count
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
});
