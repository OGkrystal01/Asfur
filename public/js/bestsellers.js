document.addEventListener('DOMContentLoaded', () => {
    loadBestsellers();
});

async function loadBestsellers() {
    try {
        const products = await fetchProducts();
        
        // Filter and sort by sales
        const bestsellers = products
            .filter(product => !product.title.toLowerCase().includes('bundle'))
            .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
            .slice(0, 12); // Limit to 12 products

        displayBestsellers(bestsellers);
        initCarousel();
    } catch (error) {
        console.error('Error loading bestsellers:', error);
    }
}

function initCarousel() {
    const container = document.getElementById('bestsellers-container');
    const prevButton = document.querySelector('.bestsellers .carousel-control.prev');
    const nextButton = document.querySelector('.bestsellers .carousel-control.next');
    
    if (!container || !prevButton || !nextButton) return;

    // Calculate scroll amount based on card width plus gap
    const cardWidth = 280; // Width of each card
    const gap = 20; // Gap between cards
    const scrollAmount = cardWidth + gap;

    nextButton.addEventListener('click', () => {
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    prevButton.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
}

function displayBestsellers(products) {
    const container = document.getElementById('bestsellers-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;
        const rating = product.rating_count ? product.rating_count : 0;
        const ratingStars = Math.round(rating / 5 * 5);
        
        return `
            <div class="bestseller-card">
                <div class="bestseller-card__content">
                    <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" class="bestseller-card__link">
                        <div class="bestseller-card__image">
                            <img src="${product.image.src}" alt="${product.title}" loading="lazy">
                            ${hasDiscount ? '<span class="sale-badge">Sale</span>' : ''}
                        </div>
                        <div class="bestseller-card__info">
                            <h3 class="bestseller-card__title">${product.title}</h3>
                            <div class="bestseller-card__rating">
                                <div class="star-rating" title="${ratingStars} out of 5 stars">
                                    ${Array(5).fill().map((_, index) => index < ratingStars ? '<span class="star">★</span>' : '<span class="star">☆</span>').join('')}
                                </div>
                                <span class="bestseller-card__rating-count">(${rating})</span>
                            </div>
                            <div class="bestseller-card__price">
                                ${compareAtPrice ? `<span class="compare-at-price">${compareAtPrice}</span>` : ''}
                                <span class="price">${price}</span>
                            </div>
                            <span class="view-details">View Full Details →</span>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Add hover effects
    const cards = container.querySelectorAll('.bestseller-card');
    cards.forEach(card => {
        const viewDetails = card.querySelector('.view-details');
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            if (viewDetails) {
                viewDetails.style.color = '#333333';
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
            card.style.boxShadow = 'none';
            if (viewDetails) {
                viewDetails.style.color = '#666';
            }
        });
    });
}

function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price).replace('€', '') + '€';
}
