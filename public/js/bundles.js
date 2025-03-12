// Load and display bundles from your successful Shopify store
async function loadBundles() {
    try {
        const products = await fetchProducts();
        
        // Only show the 4 bundle products from your successful store
        const bundles = products.filter(product => {
            const title = product.title.toLowerCase();
            return (
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });

        const container = document.getElementById('bundles-container');
        if (!container) return;

        container.innerHTML = bundles.map(product => {
            const variant = product.variants[0];
            const price = formatPrice(variant.price);
            const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
            const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;
            
            return `
                <div class="bundle-card">
                    <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" class="bundle-card__link">
                        <div class="bundle-card__image">
                            <img src="${product.image.src}" alt="${product.title}" loading="lazy">
                            ${hasDiscount ? '<span class="sale-badge">Sale</span>' : ''}
                        </div>
                        <div class="bundle-card__info">
                            <h3 class="bundle-card__title">${product.title}</h3>
                            <div class="bundle-card__price">
                                ${compareAtPrice ? `<span class="compare-at-price">${compareAtPrice}</span>` : ''}
                                <span class="price">${price}</span>
                            </div>
                            <span class="view-details">View Full Details →</span>
                        </div>
                    </a>
                </div>
            `;
        }).join('');

        // Add hover effects
        const cards = container.querySelectorAll('.bundle-card');
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
    } catch (error) {
        console.error('Error loading bundles:', error);
    }
}

function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Load bundles when DOM is ready
document.addEventListener('DOMContentLoaded', loadBundles);
