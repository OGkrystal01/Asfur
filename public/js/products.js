document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    try {
        const products = await fetchProducts();
        // Separate bundles and regular products
        const bundles = products.filter(product => {
            const title = product.title.toLowerCase();
            return (
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });
        const regularProducts = products.filter(product => {
            const title = product.title.toLowerCase();
            return !(
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });
        
        // Display regular products first, then bundles
        displayProducts([...regularProducts, ...bundles]);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const isOnSale = compareAtPrice && variant.compare_at_price > variant.price;
        const rating = product.rating_count || 0;
        // All products with ratings have 5 stars in the original Shopify store
        const ratingStars = rating > 0 ? 5 : 0;

        return `
            <div class="product-card" style="width: 280px; background: white; margin: 10px; transition: transform 0.2s, box-shadow 0.2s;">
                <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="product-image-container" style="position: relative; padding: 20px;">
                        <img src="${product.image.src}" alt="${product.title}" loading="lazy" style="width: 100%; height: auto; display: block;">
                        ${isOnSale ? '<span class="sale-badge" style="position: absolute; top: 10px; right: 10px; background: #ff0000; color: white; padding: 5px 10px; border-radius: 3px;">Sale</span>' : ''}
                    </div>
                    <div class="product-info" style="padding: 20px;">
                        <h3 class="product-title product-card__title" style="margin: 0 0 10px; font-size: 16px; color: #000000;">${product.title}</h3>
                        <div class="product-rating">
                            <div class="star-rating" title="${ratingStars} out of 5 stars">
                                ${Array(5).fill().map((_, index) => index < ratingStars ? '<span class="star">★</span>' : '<span class="star">☆</span>').join('')}
                            </div>
                            <span class="product-rating-count">(${rating})</span>
                        </div>
                        <div class="product-price" style="margin-bottom: 10px;">
                            ${compareAtPrice ? `<span class="compare-price" style="text-decoration: line-through; color: #999; margin-right: 10px;">${compareAtPrice}</span>` : ''}
                            <span class="price" style="color: #000000; font-weight: bold;">${price}</span>
                        </div>
                        <span class="view-details" style="color: #666; font-size: 14px;">View Full Details →</span>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Add hover effects
    const cards = container.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            card.querySelector('.view-details').style.color = '#333333';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
            card.style.boxShadow = 'none';
            card.querySelector('.view-details').style.color = '#666';
        });
    });
}

function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}
