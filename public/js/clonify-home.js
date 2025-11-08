// Clonify-style homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    updateCartCount();
});

// Load featured products into horizontal scroll
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    // Use same logic as bestsellers - filter bundles and sort by rating
    const featuredProducts = products
        .filter(product => !product.title.toLowerCase().includes('bundle'))
        .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
        .slice(0, 12);

    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Create product card for grid layout
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

    // Get rating
    const rating = product.rating_count || 0;
    const ratingStars = Math.min(5, Math.round(rating / 20));

    card.innerHTML = `
        <a href="/pages/product.html?handle=${product.handle}" style="text-decoration: none; color: inherit;">
            <img src="${imageUrl}" alt="${product.title}" loading="lazy">
            <div class="product-card-scroll__content">
                <h3 class="product-card-scroll__title">${product.title}</h3>
                <div class="product-card-scroll__rating">
                    <div class="star-rating">
                        ${Array(5).fill().map((_, i) => `<span class="star ${i < ratingStars ? 'filled' : ''}">★</span>`).join('')}
                    </div>
                    <span class="rating-count">(${rating})</span>
                </div>
                <div class="product-card-scroll__price">
                    ${comparePrice ? `<span class="compare-at-price">€${comparePrice.toFixed(2)}</span>` : ''}
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
