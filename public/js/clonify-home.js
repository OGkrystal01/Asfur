// Clonify-style homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    updateCartCount();
});

// Load featured products into horizontal scroll
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    // Get first 12 products from products.js
    const featuredProducts = products.slice(0, 12);

    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Create product card for horizontal scroll
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-scroll';

    // Get product image
    const imageUrl = product.image && product.image.src 
        ? product.image.src 
        : '/images/logo/Logo.png';

    // Get price (use first variant price)
    const price = product.variants && product.variants.length > 0 
        ? product.variants[0].price 
        : 0;

    const comparePrice = product.variants && product.variants.length > 0 
        ? product.variants[0].compare_at_price 
        : null;

    card.innerHTML = `
        <a href="/pages/product.html?handle=${product.handle}" style="text-decoration: none; color: inherit;">
            <img src="${imageUrl}" alt="${product.title}" loading="lazy">
            <div class="product-card-scroll__content">
                <h3 class="product-card-scroll__title">${product.title}</h3>
                <div class="product-card-scroll__price">
                    ${comparePrice ? `<span style="text-decoration: line-through; color: #999; font-size: 1rem; margin-right: 10px;">€${comparePrice.toFixed(2)}</span>` : ''}
                    <span>€${price.toFixed(2)}</span>
                </div>
            </div>
        </a>
    `;

    return card;
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count, #mobile-cart-count');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
        }
    });
}

// Update cart count when cart changes
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        updateCartCount();
    }
});
