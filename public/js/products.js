document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    try {
        // Load products from the global products variable (loaded from products.js data file)
        if (typeof products !== 'undefined' && products.length > 0) {
            displayProducts(products);
        } else {
            console.error('No products found');
            const container = document.getElementById('products-container');
            if (container) {
                container.innerHTML = '<p style="text-align: center; padding: 40px;">No products available at the moment.</p>';
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(allProducts) {
    const container = document.getElementById('products-container');
    if (!container) return;

    // Sort products to put LV Nano Speedy first
    const sortedProducts = [...allProducts].sort((a, b) => {
        if (a.handle === 'louis-vuitton-nano-speedy') return -1;
        if (b.handle === 'louis-vuitton-nano-speedy') return 1;
        return 0;
    });

    container.innerHTML = sortedProducts.map(product => {
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const isOnSale = compareAtPrice && variant.compare_at_price > variant.price;

        return `
            <div class="product-card" style="width: 280px; background: white; margin: 10px; transition: transform 0.2s, box-shadow 0.2s;">
                <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="product-image-container" style="position: relative; padding: 20px;">
                        <img src="${product.image.src}" alt="${product.title}" loading="lazy" style="width: 100%; height: auto; display: block;">
                        ${isOnSale ? '<span class="sale-badge" style="position: absolute; top: 10px; right: 10px; background: #ff0000; color: white; padding: 5px 10px; border-radius: 3px;">Sale</span>' : ''}
                    </div>
                    <div class="product-info" style="padding: 20px;">
                        <h3 class="product-title product-card__title" style="margin: 0 0 10px; font-size: 16px; color: #000000;">${product.title}</h3>
                        ${generateStarRating(product.rating_count || 0)}
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

function generateStarRating(ratingCount) {
    // Calculate rating based on rating_count (higher count = better rating)
    const rating = Math.min(5, Math.max(4, 4 + (ratingCount / 100)));
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    let starsHTML = '<div class="product-rating" style="display: flex; align-items: center; gap: 5px; margin-bottom: 8px;">';
    starsHTML += '<div class="stars" style="color: #FFD700; font-size: 14px;">';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
    }
    
    // Half star
    if (hasHalfStar && fullStars < 5) {
        starsHTML += '☆';
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '☆';
    }
    
    starsHTML += '</div>';
    starsHTML += `<span style="color: #666; font-size: 12px;">(${ratingCount})</span>`;
    starsHTML += '</div>';
    
    return starsHTML;
}
